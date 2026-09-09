#!/usr/bin/env python3
"""Real 8760-hour Radiance tracing adapter using bifacial_radiance weather workflows.

This runner keeps the three.js export package as the geometry and sensor source of truth.
It performs actual Radiance ray tracing against exported geometry and sensor points. For
tracking systems it applies row-axis motion to the exported rotating objects using motion
metadata generated from the design-page scene, while bifacial_radiance provides the
weather-driven sky generation context.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import shutil
import subprocess
import sys
import traceback
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    import bifacial_radiance  # type: ignore
except Exception as exc:  # pragma: no cover - runtime dependency
    raise SystemExit(
        "bifacial_radiance is not importable in the configured Python environment. "
        "Install bifacial_radiance before running the annual model."
    ) from exc

try:
    import pandas as pd  # type: ignore
except Exception as exc:  # pragma: no cover - runtime dependency
    raise SystemExit(
        "pandas is not importable in the configured Python environment. "
        "Install pandas before running the annual model."
    ) from exc

try:
    import numpy as np  # type: ignore
except Exception as exc:  # pragma: no cover - runtime dependency
    raise SystemExit(
        "numpy is not importable in the configured Python environment. "
        "Install numpy before running the annual model."
    ) from exc


class ModelError(RuntimeError):
    """Typed annual model failure."""


RUNTIME_LOG_PATH: Path | None = None
RUNTIME_PROGRESS_PATH: Path | None = None
_ANNOUNCED_RTRACE_PROCS = False

DEFAULT_SIMULATION_OPTIONS = {
    "conversionStrategy": "obj2rad",
    "ambientBounces": 2,
    "ambientDivisions": 2048,
    "ambientResolution": 256,
    "ambientAccuracy": 0.15,
    "limitWeight": 0.0001,
}


def fail(code: str, message: str) -> None:
    raise ModelError(f"[{code}] {message}")


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def normalized_modulo(value: float, base: float = 360.0) -> float:
    return ((value % base) + base) % base


def load_json(path: Path) -> Any:
    return json.loads(path.read_text("utf8"))


def save_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), "utf8")


def initialize_runtime_reporting(log_path: Path | None, progress_path: Path | None) -> None:
    global RUNTIME_LOG_PATH, RUNTIME_PROGRESS_PATH
    RUNTIME_LOG_PATH = log_path
    RUNTIME_PROGRESS_PATH = progress_path

    if RUNTIME_LOG_PATH:
        RUNTIME_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        RUNTIME_LOG_PATH.write_text("", "utf8")

    if RUNTIME_PROGRESS_PATH:
        save_json(RUNTIME_PROGRESS_PATH, {
            "stage": "initializing",
            "completed": 0,
            "total": 1,
            "fraction": 0,
            "message": "Initializing irradiance runner.",
            "updatedAt": datetime.utcnow().isoformat() + "Z",
        })


def runtime_log(message: str) -> None:
    line = f"[{datetime.utcnow().isoformat()}Z] {message}"
    print(line, flush=True)
    if RUNTIME_LOG_PATH:
        with RUNTIME_LOG_PATH.open("a", encoding="utf8") as handle:
            handle.write(line + "\n")


def runtime_progress(stage: str, completed: int, total: int, message: str, **extra: Any) -> None:
    bounded_total = max(total, 1)
    payload = {
        "stage": stage,
        "completed": completed,
        "total": total,
        "fraction": max(0.0, min(1.0, completed / bounded_total)),
        "message": message,
        "updatedAt": datetime.utcnow().isoformat() + "Z",
        **extra,
    }
    if RUNTIME_PROGRESS_PATH:
        save_json(RUNTIME_PROGRESS_PATH, payload)
    runtime_log(message)


def keep_radiance_artifacts() -> bool:
    return os.environ.get("AGRIVOLTAIC_KEEP_RADIANCE_ARTIFACTS", "false").lower() == "true"


def parse_table_config(config: str) -> tuple[int, str]:
    if not config:
        return (1, "portrait")
    count = int(config[:-1] or "1")
    orientation = "landscape" if config[-1].upper() == "L" else "portrait"
    return (max(1, count), orientation)


def resolve_system_type(request: dict[str, Any]) -> str:
    design_state = request.get("designState") or {}
    serialized_config = request.get("serializedConfig") or {}
    serialized_system = serialized_config.get("system") if isinstance(serialized_config, dict) else {}
    return str(
        design_state.get("systemType")
        or (serialized_system.get("type") if isinstance(serialized_system, dict) else None)
        or "fixed"
    )


def resolve_orientation(design_state: dict[str, Any], system_type: str) -> dict[str, float | bool]:
    pergola_tracking = bool(design_state.get("pergolaTracking", False))
    default_azimuth = 0.0 if system_type in ("sat", "vertical") else 180.0
    system_azimuth = normalized_modulo(
        float(design_state.get("systemAzimuthDeg", default_azimuth) or default_azimuth)
    )

    if system_type == "sat":
        axis_azimuth = system_azimuth
        tracker_enabled = True
    elif system_type == "raised" and pergola_tracking:
        axis_azimuth = normalized_modulo(system_azimuth - 90.0)
        tracker_enabled = True
    elif system_type == "vertical":
        axis_azimuth = system_azimuth
        tracker_enabled = False
    else:
        axis_azimuth = normalized_modulo(system_azimuth - 90.0)
        tracker_enabled = False

    return {
        "system_azimuth": system_azimuth,
        "axis_azimuth": axis_azimuth,
        "tracker_enabled": tracker_enabled,
    }


def compute_table_spec(design_state: dict[str, Any]) -> dict[str, float]:
    count, orientation = parse_table_config(str(design_state.get("config", "1P")))
    module_width = float(design_state.get("moduleWidth", 1.134) or 1.134)
    module_height = float(design_state.get("moduleHeight", 2.278) or 2.278)
    if orientation == "landscape":
        module_width, module_height = module_height, module_width

    stack_span = (count * module_height) + (max(0, count - 1) * 0.02)
    return {
        "count": float(count),
        "module_width": module_width,
        "module_height": module_height,
        "stack_span": stack_span,
        "module_thickness": float(design_state.get("moduleThickness", 0.035) or 0.035),
        "orientation": orientation,
    }


def projected_panel_footprint(
    design_state: dict[str, Any],
    system_type: str,
    tracker_theta: float = 0.0,
) -> float:
    table_spec = compute_table_spec(design_state)
    stack_span = table_spec["stack_span"]
    module_thickness = table_spec["module_thickness"]
    pergola_tracking = bool(design_state.get("pergolaTracking", False))

    if system_type == "vertical":
        return max(0.18, module_thickness + 0.16)

    if system_type == "sat" or (system_type == "raised" and pergola_tracking):
        return max(0.45, stack_span * math.cos(math.radians(abs(tracker_theta))))

    tilt_deg = float(design_state.get("tiltDeg", 25.0) or 25.0)
    return max(0.45, stack_span * math.cos(math.radians(abs(tilt_deg))))


def ensure_radiance_binary(name: str) -> str:
    resolved = shutil.which(name)
    if resolved:
        return resolved
    fail("RADIANCE_BINARY_MISSING", f"Required Radiance binary '{name}' was not found on PATH.")
    return ""


def configure_radiance_environment() -> None:
    radiance_bin = os.environ.get("AGRIVOLTAIC_RADIANCE_BIN_DIR", "").strip()
    if not radiance_bin:
        rtrace_path = shutil.which("rtrace")
        radiance_bin = str(Path(rtrace_path).parent) if rtrace_path else ""

    if not radiance_bin:
        fail("RADIANCE_ENV_MISSING", "Radiance bin directory could not be resolved from AGRIVOLTAIC_RADIANCE_BIN_DIR or PATH.")

    radiance_root = Path(radiance_bin).resolve().parent
    lib_dir = radiance_root / "lib"
    ray_dir = lib_dir / "ray"
    if not (ray_dir / "rayinit.cal").exists():
        fail(
            "RADIANCE_LIB_MISSING",
            f"Radiance library path is incomplete. Expected to find rayinit.cal under {ray_dir}.",
        )
    existing = [entry for entry in os.environ.get("RAYPATH", "").split(":") if entry]
    normalized_existing = [str(Path(entry).resolve()) if Path(entry).exists() else entry for entry in existing]
    required = [".", str(lib_dir), str(ray_dir)]
    for entry in reversed(required):
        if entry not in existing and entry not in normalized_existing:
            existing.insert(0, entry)
    os.environ["RAYPATH"] = ":".join(existing)


def rtrace_process_count() -> int:
    configured = os.environ.get("AGRIVOLTAIC_RTRACE_PROCS", "").strip()
    if configured:
        try:
            return max(1, int(configured))
        except ValueError:
            fail("RTRACE_PROCS_INVALID", f"AGRIVOLTAIC_RTRACE_PROCS must be an integer, received '{configured}'.")

    cpu_total = os.cpu_count() or 1
    if cpu_total <= 2:
        return 1
    return max(1, cpu_total - 1)


def positive_int_option(value: Any, fallback: int) -> int:
    try:
        numeric = int(round(float(value)))
        return numeric if numeric > 0 else fallback
    except (TypeError, ValueError):
        return fallback


def positive_float_option(value: Any, fallback: float) -> float:
    try:
        numeric = float(value)
        return numeric if numeric > 0 else fallback
    except (TypeError, ValueError):
        return fallback


def push_radiance_search_paths(*paths: Path) -> None:
    existing = [entry for entry in os.environ.get("RAYPATH", "").split(":") if entry]
    normalized_existing = [str(Path(entry).resolve()) if Path(entry).exists() else entry for entry in existing]
    for path in reversed(paths):
        resolved = str(path.resolve())
        if resolved not in existing and resolved not in normalized_existing:
            existing.insert(0, resolved)
    os.environ["RAYPATH"] = ":".join(existing)


def run_command(
    args: list[str],
    *,
    cwd: Path,
    stdin_path: Path | None = None,
    stdout_path: Path | None = None,
    binary_stdout: bool = False,
    log_lines: list[str] | None = None,
    code: str,
) -> None:
    if log_lines is not None:
        log_lines.append(f"$ (cd {cwd} && {' '.join(args)})")

    if stdout_path:
        if binary_stdout:
            stdout_handle = stdout_path.open("wb")
        else:
            stdout_handle = stdout_path.open("w", encoding="utf8")
    else:
        stdout_handle = subprocess.PIPE
    stdin_handle = stdin_path.open("rb") if stdin_path else None
    try:
        result = subprocess.run(
            args,
            cwd=str(cwd),
            stdin=stdin_handle,
            stdout=stdout_handle,
            stderr=subprocess.PIPE,
            text=not binary_stdout,
            check=False,
        )
    finally:
        if stdin_handle:
            stdin_handle.close()
        if stdout_path:
            stdout_handle.close()

    if result.returncode != 0:
        stderr_raw = result.stderr or (b"" if binary_stdout else "")
        stderr = stderr_raw.decode("utf8", errors="replace").strip() if binary_stdout else str(stderr_raw).strip()
        fail(code, f"Command failed with exit code {result.returncode}: {' '.join(args)}{f' :: {stderr}' if stderr else ''}")

    if log_lines is not None:
        stderr_raw = result.stderr or (b"" if binary_stdout else "")
        stderr = stderr_raw.decode("utf8", errors="replace").strip() if binary_stdout else str(stderr_raw).strip()
        if stderr:
            log_lines.append(stderr)


def rgb_to_irradiance(parts: list[float]) -> float:
    red, green, blue = parts[:3]
    return (0.265 * red) + (0.67 * green) + (0.065 * blue)


def parse_rtrace_results(path: Path, expected_count: int) -> list[float]:
    values: list[float] = []
    for raw_line in path.read_text("utf8").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        parts = [float(part) for part in line.split()]
        if len(parts) < 3:
            fail("RTRACE_PARSE_FAILED", f"Unexpected rtrace result line: {line}")
        values.append(rgb_to_irradiance(parts))

    if len(values) != expected_count:
        fail(
            "RTRACE_RESULT_COUNT_MISMATCH",
            f"Expected {expected_count} sensor values but parsed {len(values)} from {path.name}.",
        )
    return values


def combined_sensor_points(export_package: dict[str, Any], package_root: Path) -> tuple[Path, list[tuple[str, int]]]:
    points_path = package_root / "sensors" / "all-sensors.pts"
    lines: list[str] = []
    sensor_index_map: list[tuple[str, int]] = []
    for grid in export_package["grids"]:
        radiance_lines = [
            line.strip()
            for line in str(grid.get("radiancePoints", "")).splitlines()
            if line.strip()
        ]
        if radiance_lines and len(radiance_lines) == len(grid["sensors"]):
            lines.extend(radiance_lines)
            sensor_index_map.extend((grid["gridId"], sensor_index) for sensor_index, _sensor in enumerate(grid["sensors"]))
            continue

        for sensor_index, sensor in enumerate(grid["sensors"]):
            position = sensor["position"]
            normal = sensor["normal"]
            lines.append(
                f"{position['x']:.6f} {position['y']:.6f} {(position['z'] + 0.05):.6f} "
                f"{normal['x']:.6f} {normal['y']:.6f} {normal['z']:.6f}"
            )
            sensor_index_map.append((grid["gridId"], sensor_index))

    points_path.parent.mkdir(parents=True, exist_ok=True)
    points_path.write_text("\n".join(lines) + "\n", "utf8")
    return points_path, sensor_index_map


def resolve_simulation_options(manifest: dict[str, Any]) -> dict[str, Any]:
    options = dict(DEFAULT_SIMULATION_OPTIONS)
    raw = manifest.get("simulationOptions") or {}
    conversion = str(raw.get("conversionStrategy", options["conversionStrategy"]))
    if conversion in ("obj2rad", "obj2mesh"):
        options["conversionStrategy"] = conversion
    options["ambientBounces"] = positive_int_option(raw.get("ambientBounces"), int(options["ambientBounces"]))
    options["ambientDivisions"] = positive_int_option(raw.get("ambientDivisions"), int(options["ambientDivisions"]))
    options["ambientResolution"] = positive_int_option(raw.get("ambientResolution"), int(options["ambientResolution"]))
    options["ambientAccuracy"] = positive_float_option(raw.get("ambientAccuracy"), float(options["ambientAccuracy"]))
    options["limitWeight"] = positive_float_option(raw.get("limitWeight"), float(options["limitWeight"]))
    return options


def completed_job_summary(
    payload: dict[str, Any],
    request: dict[str, Any],
    weather: dict[str, Any],
) -> dict[str, Any]:
    existing = payload.get("job") if isinstance(payload.get("job"), dict) else {}
    generated_at = datetime.utcnow().isoformat() + "Z"
    created_at = str(existing.get("createdAt") or generated_at)
    started_at = existing.get("startedAt")
    grid_mode = str(
        existing.get("gridMode")
        or ((request.get("sensorConfig") or {}).get("mode"))
        or "fullArrayGrid"
    )

    return {
        "jobId": str(existing.get("jobId") or f"job-portable-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"),
        "projectName": str(existing.get("projectName") or request.get("projectName") or "Agrivoltaic Study"),
        "site": existing.get("site") or request.get("site") or weather.get("site") or {},
        "status": "completed",
        "phase": "completed",
        "progress": 1,
        "gridMode": grid_mode,
        "engine": "bifacial_radiance",
        "createdAt": created_at,
        "updatedAt": generated_at,
        "startedAt": str(started_at) if started_at else created_at,
        "completedAt": generated_at,
        "weatherSource": weather.get("source"),
        "notes": [str(note) for note in (existing.get("notes") or [])],
    }


def build_weather_dataframe(
    weather: dict[str, Any],
    albedo: float,
) -> tuple[dict[str, Any], Any, str]:
    hourly = weather.get("hourly") or []
    if not hourly:
        fail("WEATHER_EMPTY", "Hourly weather payload did not contain any records.")

    timezone = weather.get("timezone") or weather.get("site", {}).get("timezone") or "UTC"
    timestamps = pd.to_datetime([sample["timestamp"] for sample in hourly], utc=True).tz_convert(timezone)
    frame = pd.DataFrame({
        "DNI": [float(sample.get("dni", 0.0)) for sample in hourly],
        "DHI": [float(sample.get("dhi", 0.0)) for sample in hourly],
        "GHI": [float(sample.get("ghi", 0.0)) for sample in hourly],
        "Alb": [albedo] * len(hourly),
        "temp_air": [20.0] * len(hourly),
        "wind_speed": [1.0] * len(hourly),
    }, index=timestamps)

    offset = frame.index[0].utcoffset()
    tz_hours = int(round((offset.total_seconds() if offset else 0.0) / 3600))
    site = weather.get("site") or {}
    metadata = {
        "latitude": float(site.get("latitude", 0.0)),
        "longitude": float(site.get("longitude", 0.0)),
        "altitude": float(site.get("elevationM", 0.0) or 0.0),
        "TZ": tz_hours,
        "Name": site.get("label", "Agrivoltaic site"),
    }
    return metadata, frame, timezone


def build_hour_lookup(weather: dict[str, Any], timezone: str) -> dict[str, int]:
    hourly = weather.get("hourly") or []
    timestamps = pd.to_datetime([sample["timestamp"] for sample in hourly], utc=True).tz_convert(timezone)
    lookup: dict[str, int] = {}
    for timestamp, sample in zip(timestamps, hourly):
        hour_index = int(sample["hourIndex"])
        lookup[timestamp.strftime("%Y-%m-%d_%H%M")] = hour_index
        lookup[timestamp.strftime("%m-%d_%H%M")] = hour_index
    return lookup


def build_daylight_hour_indices(weather: dict[str, Any]) -> list[int]:
    return [
        int(sample["hourIndex"])
        for sample in (weather.get("hourly") or [])
        if float(sample.get("ghi", 0.0)) > 0.0
    ]


def resolve_hour_index(hour_lookup: dict[str, int], timestamp_like: Any) -> int | None:
    timestamp = pd.Timestamp(timestamp_like)
    full_key = timestamp.strftime("%Y-%m-%d_%H%M")
    if full_key in hour_lookup:
        return hour_lookup[full_key]

    month_day_key = timestamp.strftime("%m-%d_%H%M")
    return hour_lookup.get(month_day_key)


def create_radiance_context(
    workspace: Path,
    metadata: dict[str, Any],
    metdata_frame: Any,
    albedo: float,
) -> tuple[Any, Any]:
    workspace.mkdir(parents=True, exist_ok=True)
    radiance_obj = bifacial_radiance.RadianceObj("agrivoltaic_annual", path=str(workspace))
    radiance_obj.setGround(albedo)
    metdata = radiance_obj.readWeatherData(metadata, metdata_frame)
    return radiance_obj, metdata


def resolve_gencumsky_metfile(radiance_obj: Any, workspace: Path, metdata_frame: Any) -> str:
    candidate = getattr(radiance_obj, "gencumsky_metfile", None)
    if isinstance(candidate, list) and candidate:
        return str(candidate[0])
    if isinstance(candidate, str) and candidate.strip():
        return candidate

    fallback = workspace / "EPWs" / "metdata_temp.csv"
    if fallback.exists():
        return str(fallback)

    save_temp_tmy = getattr(radiance_obj, "_saveTempTMY", None)
    if callable(save_temp_tmy):
        save_temp_tmy(metdata_frame.copy(), filename="metdata_temp.csv", label="center")
        candidate = getattr(radiance_obj, "gencumsky_metfile", None)
        if isinstance(candidate, list) and candidate:
            return str(candidate[0])
        if isinstance(candidate, str) and candidate.strip():
            return candidate
        if fallback.exists():
            return str(fallback)

    epw_dir = workspace / "EPWs"
    epw_dir.mkdir(parents=True, exist_ok=True)
    metfile_path = epw_dir / "metdata_temp.csv"
    metdata_frame.loc[:, ["GHI", "DHI"]].to_csv(
        metfile_path,
        index=False,
        header=False,
        sep=" ",
    )
    if metfile_path.exists():
        return str(metfile_path)

    fail(
        "GENCUMSKY_METFILE_MISSING",
        "bifacial_radiance did not expose a cumulative-sky weather file after readWeatherData().",
    )
    return ""


def ensure_geometry_rad_files(
    package_root: Path,
    manifest: dict[str, Any],
    log_lines: list[str],
) -> dict[str, Path]:
    radiance_dir = package_root / "radiance"
    geometry_dir = radiance_dir / "geometry"
    geometry_dir.mkdir(parents=True, exist_ok=True)
    obj2rad = ensure_radiance_binary("obj2rad")
    asset_paths: dict[str, Path] = {}
    scene_manifest = manifest.get("sceneManifest") or {}
    assets = scene_manifest.get("assets") or []

    for asset in assets:
        stable_id = str(asset["stableId"])
        obj_relative = str(asset["objRelativePath"])
        output_path = geometry_dir / f"{stable_id}.rad"
        run_command(
            [obj2rad, f"../{obj_relative}"],
            cwd=radiance_dir,
            stdout_path=output_path,
            log_lines=log_lines,
            code="OBJ2RAD_FAILED",
        )
        asset_paths[stable_id] = output_path

    if not asset_paths:
        fail("GEOMETRY_EXPORT_EMPTY", "No exportable geometry assets were found in the Radiance package.")
    return asset_paths


def rotation_command(axis_direction: dict[str, float], pivot_origin: dict[str, float], angle_deg: float) -> str:
    phi_deg = math.degrees(math.atan2(float(axis_direction["y"]), float(axis_direction["x"])))
    px = float(pivot_origin["x"])
    py = float(pivot_origin["y"])
    pz = float(pivot_origin["z"])
    return (
        f"!xform -t {-px:.6f} {-py:.6f} {-pz:.6f} "
        f"-rz {-phi_deg:.6f} -rx {angle_deg:.6f} -rz {phi_deg:.6f} "
        f"-t {px:.6f} {py:.6f} {pz:.6f}"
    )


def shell_quote(value: str) -> str:
    return "'" + value.replace("'", "'\\''") + "'"


def scene_file_for_angle(
    package_root: Path,
    manifest: dict[str, Any],
    motion_model: dict[str, Any] | None,
    angle_deg: float,
    cache: dict[str, Path],
) -> Path:
    key = f"{angle_deg:.6f}"
    if motion_model is None or motion_model.get("strategy") != "row_axis_rotation":
        key = "static"
    if key in cache:
        return cache[key]

    scene_manifest = manifest.get("sceneManifest") or {}
    assets = scene_manifest.get("assets") or []
    output_dir = package_root / "radiance" / "generated"
    output_dir.mkdir(parents=True, exist_ok=True)
    file_name = "scene-static.rad" if key == "static" else f"scene-angle-{key.replace('-', 'neg-').replace('.', '_')}.rad"
    output_path = output_dir / file_name

    row_by_object: dict[str, dict[str, Any]] = {}
    baseline_angles: dict[str, float] = {}
    if motion_model and motion_model.get("strategy") == "row_axis_rotation":
        for row in motion_model.get("rows") or []:
            baseline = float(row.get("baselineAngleDeg", 0.0))
            for object_id in row.get("rotatingObjectIds") or []:
                row_by_object[str(object_id)] = row
                baseline_angles[str(object_id)] = baseline

    lines: list[str] = []
    for asset in assets:
        stable_id = str(asset["stableId"])
        asset_path = package_root / "radiance" / "geometry" / f"{stable_id}.rad"
        quoted_asset_path = shell_quote(str(asset_path))
        row = row_by_object.get(stable_id)
        if row:
            delta = angle_deg - baseline_angles.get(stable_id, 0.0)
            if abs(delta) < 1e-8:
                lines.append(f"!xform {quoted_asset_path}")
            else:
                lines.append(
                    f"{rotation_command(row['axisDirection'], row['pivotOrigin'], delta)} {quoted_asset_path}"
                )
        else:
            lines.append(f"!xform {quoted_asset_path}")

    output_path.write_text("\n".join(lines) + "\n", "utf8")
    cache[key] = output_path
    return output_path


def geometry_octree_for_scene(
    package_root: Path,
    scene_path: Path,
    log_lines: list[str],
) -> Path:
    radiance_dir = package_root / "radiance"
    cache_dir = package_root / "results" / "geometry-octrees"
    cache_dir.mkdir(parents=True, exist_ok=True)
    oct_path = cache_dir / f"{scene_path.stem}.oct"
    if oct_path.exists():
        return oct_path

    push_radiance_search_paths(scene_path.parent)
    oconv = ensure_radiance_binary("oconv")
    run_command(
        [
            oconv,
            str(package_root / "materials" / "materials.rad"),
            str(scene_path),
        ],
        cwd=radiance_dir,
        stdout_path=oct_path,
        binary_stdout=True,
        log_lines=log_lines,
        code="GEOMETRY_OCONV_FAILED",
    )
    return oct_path


def cleanup_geometry_octree_cache(package_root: Path) -> None:
    cache_dir = package_root / "results" / "geometry-octrees"
    shutil.rmtree(cache_dir, ignore_errors=True)


def run_radiance_trace(
    package_root: Path,
    geometry_oct_path: Path,
    sky_path: Path,
    points_path: Path,
    result_name: str,
    log_lines: list[str],
    simulation_options: dict[str, Any],
) -> list[float]:
    radiance_dir = sky_path.parent.parent
    results_dir = package_root / "results" / "irradiance-traces"
    results_dir.mkdir(parents=True, exist_ok=True)
    push_radiance_search_paths(geometry_oct_path.parent, sky_path.parent, sky_path.parent.parent)
    oconv = ensure_radiance_binary("oconv")
    rtrace = ensure_radiance_binary("rtrace")
    proc_count = rtrace_process_count()
    oct_path = results_dir / f"{result_name}.oct"
    res_path = results_dir / f"{result_name}.res"

    global _ANNOUNCED_RTRACE_PROCS
    if not _ANNOUNCED_RTRACE_PROCS:
        runtime_log(f"Using Radiance rtrace with {proc_count} worker process(es).")
        _ANNOUNCED_RTRACE_PROCS = True

    run_command(
        [
            oconv,
            "-i",
            str(geometry_oct_path),
            str(sky_path),
        ],
        cwd=radiance_dir,
        stdout_path=oct_path,
        binary_stdout=True,
        log_lines=log_lines,
        code="OCONV_FAILED",
    )

    run_command(
        [
            rtrace,
            "-h",
            "-I+",
            "-n", str(proc_count),
            "-ab", str(simulation_options["ambientBounces"]),
            "-ad", str(simulation_options["ambientDivisions"]),
            "-ar", str(simulation_options["ambientResolution"]),
            "-aa", str(simulation_options["ambientAccuracy"]),
            "-lw", str(simulation_options["limitWeight"]),
            str(oct_path),
        ],
        cwd=radiance_dir,
        stdin_path=points_path,
        stdout_path=res_path,
        log_lines=log_lines,
        code="RTRACE_FAILED",
    )
    values = parse_rtrace_results(res_path, sum(1 for _ in points_path.read_text("utf8").splitlines() if _.strip()))

    if not keep_radiance_artifacts():
        oct_path.unlink(missing_ok=True)
        res_path.unlink(missing_ok=True)

    return values


def initialize_hourly_outputs(
    export_package: dict[str, Any],
    package_root: Path,
    total_hours: int,
) -> tuple[dict[str, Any], dict[str, Any]]:
    hourly_dir = package_root / "results" / "hourly-irradiance"
    hourly_dir.mkdir(parents=True, exist_ok=True)
    grid_arrays: dict[str, Any] = {}
    monthly_arrays: dict[str, Any] = {}
    manifest_grids: list[dict[str, Any]] = []

    for grid in export_package["grids"]:
        grid_id = str(grid["gridId"])
        sensor_count = len(grid["sensors"])
        file_name = f"{grid_id}.npy"
        array_path = hourly_dir / file_name
        grid_arrays[grid_id] = np.lib.format.open_memmap(
            array_path,
            mode="w+",
            dtype=np.float32,
            shape=(total_hours, sensor_count),
        )
        grid_arrays[grid_id][:] = 0.0
        monthly_arrays[grid_id] = np.zeros((sensor_count, 12), dtype=np.float64)
        manifest_grids.append({
            "gridId": grid_id,
            "relativePath": f"results/hourly-irradiance/{file_name}",
            "sensorCount": sensor_count,
            "dimensions": grid["dimensions"],
            "dtype": "float32",
            "sensorIds": [sensor["id"] for sensor in grid["sensors"]],
        })

    manifest = {
        "format": "npy_float32",
        "records": total_hours,
        "grids": manifest_grids,
    }
    save_json(hourly_dir / "manifest.json", manifest)
    return {"directory": hourly_dir, "manifest": manifest}, {"grid_arrays": grid_arrays, "monthly_arrays": monthly_arrays}


def record_hour_values(
    export_package: dict[str, Any],
    writers: dict[str, Any],
    hour_index: int,
    month_index: int,
    values: list[float],
) -> None:
    grid_arrays = writers["grid_arrays"]
    monthly_arrays = writers["monthly_arrays"]
    cursor = 0
    for grid in export_package["grids"]:
        grid_id = str(grid["gridId"])
        sensor_count = len(grid["sensors"])
        slice_values = np.asarray(values[cursor:cursor + sensor_count], dtype=np.float32)
        grid_arrays[grid_id][hour_index, :] = slice_values
        monthly_arrays[grid_id][:, month_index] += slice_values.astype(np.float64)
        cursor += sensor_count


def finalize_hourly_outputs(writers: dict[str, Any]) -> None:
    for array in writers["grid_arrays"].values():
        array.flush()


def monthly_arrays_to_lists(writers: dict[str, Any]) -> dict[str, list[list[float]]]:
    return {
        grid_id: array.tolist()
        for grid_id, array in writers["monthly_arrays"].items()
    }


def tracker_axis_for_bifacial(design_state: dict[str, Any], system_type: str) -> float:
    orientation = resolve_orientation(design_state, system_type)
    axis_azimuth = float(orientation["axis_azimuth"])
    axis_mod = normalized_modulo(axis_azimuth, 180.0)
    if abs(axis_mod) < 1e-6:
        return 180.0
    return axis_mod


def tracker_gcr(design_state: dict[str, Any], system_type: str) -> float:
    row_spacing = float(design_state.get("rowSpacing", 9.144) or 9.144)
    panel_depth = projected_panel_footprint(design_state, system_type, 0.0)
    return clamp(panel_depth / max(row_spacing, panel_depth + 0.01), 0.2, 0.85)


def hourly_static_results(
    package_root: Path,
    export_package: dict[str, Any],
    weather: dict[str, Any],
    albedo: float,
    points_path: Path,
    simulation_options: dict[str, Any],
    log_lines: list[str],
) -> tuple[dict[str, Any], dict[str, Any]]:
    manifest = export_package["manifest"]
    scene_cache: dict[str, Path] = {}
    static_scene = scene_file_for_angle(package_root, manifest, None, 0.0, scene_cache)
    geometry_oct_path = geometry_octree_for_scene(package_root, static_scene, log_lines)
    metadata, weather_frame, _timezone = build_weather_dataframe(weather, albedo)
    daylight_hour_indices = build_daylight_hour_indices(weather)
    result_root = package_root / "bifacial" / "static-hourly"
    radiance_obj, metdata = create_radiance_context(result_root, metadata, weather_frame, albedo)
    hourly_output, writers = initialize_hourly_outputs(export_package, package_root, len(weather.get("hourly") or []))
    total_steps = len(metdata.datetime)
    total_sensors = sum(len(grid["sensors"]) for grid in export_package["grids"])

    if len(daylight_hour_indices) != len(metdata.datetime):
        fail(
            "WEATHER_DAYLIGHT_COUNT_MISMATCH",
            "Static bifacial_radiance daylight timestamps do not align with the daylight-hour subset of the 8760 weather series. "
            f"Weather daylight hours: {len(daylight_hour_indices)}; traced timestamps: {len(metdata.datetime)}.",
        )

    runtime_progress(
        "running_static_hours",
        0,
        total_steps,
        f"Tracing {total_steps} daylight hours for the static irradiance model across {total_sensors} sensors.",
        mode="static",
        sensors=total_sensors,
    )

    for time_index, timestamp in enumerate(metdata.datetime):
        hour_index = daylight_hour_indices[time_index]
        if time_index == 0 or (time_index + 1) % 10 == 0 or (time_index + 1) == total_steps:
            runtime_progress(
                "running_static_hours",
                time_index,
                total_steps,
                f"Tracing static hour {time_index + 1}/{total_steps} (8760 index {hour_index + 1}/8760).",
                mode="static",
                sensors=total_sensors,
                currentHourIndex=hour_index,
            )

        sky_relative = radiance_obj.gendaylit(time_index, metdata=metdata)
        if not sky_relative:
            continue
        sky_path = result_root / str(sky_relative)
        values = run_radiance_trace(
            package_root,
            geometry_oct_path,
            sky_path,
            points_path,
            f"hour-{hour_index:04d}-static",
            log_lines,
            simulation_options,
        )
        record_hour_values(export_package, writers, hour_index, int(weather["hourly"][hour_index]["month"]) - 1, values)

    runtime_progress(
        "running_static_hours",
        total_steps,
        total_steps,
        f"Completed static irradiance tracing for {total_steps} daylight hours.",
        mode="static",
        sensors=total_sensors,
    )
    finalize_hourly_outputs(writers)
    return hourly_output, writers


def hourly_tracker_results(
    package_root: Path,
    export_package: dict[str, Any],
    weather: dict[str, Any],
    design_state: dict[str, Any],
    system_type: str,
    albedo: float,
    points_path: Path,
    motion_model: dict[str, Any],
    simulation_options: dict[str, Any],
    log_lines: list[str],
) -> tuple[dict[str, Any], dict[str, Any]]:
    if motion_model.get("strategy") != "row_axis_rotation" or not (motion_model.get("rows") or []):
        fail("TRACKER_MOTION_MISSING", "Tracking runs require row-axis motion metadata from the design-page export.")

    manifest = export_package["manifest"]
    scene_cache: dict[str, Path] = {}
    max_angle = float(design_state.get("trackerMaxAngleDeg", 60.0) or 60.0)
    axis_azimuth = tracker_axis_for_bifacial(design_state, system_type)
    gcr = tracker_gcr(design_state, system_type)
    metadata, weather_frame, timezone = build_weather_dataframe(weather, albedo)
    hour_lookup = build_hour_lookup(weather, timezone)
    result_root = package_root / "bifacial" / "tracker-hourly"
    radiance_obj, metdata = create_radiance_context(result_root, metadata, weather_frame, albedo)
    trackerdict = radiance_obj.set1axis(
        metdata=metdata,
        azimuth=axis_azimuth,
        limit_angle=max_angle,
        backtrack=True,
        gcr=gcr,
        cumulativesky=False,
    )
    trackerdict = radiance_obj.gendaylit1axis(metdata=metdata, trackerdict=trackerdict)
    hourly_output, writers = initialize_hourly_outputs(export_package, package_root, len(weather.get("hourly") or []))
    tracker_items = [(tracker_key, tracker_entry) for tracker_key, tracker_entry in trackerdict.items() if tracker_entry.get("skyfile")]
    total_steps = len(tracker_items)
    total_sensors = sum(len(grid["sensors"]) for grid in export_package["grids"])

    runtime_progress(
        "running_tracker_hours",
        0,
        total_steps,
        f"Tracing {total_steps} tracker sky states across {total_sensors} sensors.",
        mode="tracker",
        sensors=total_sensors,
    )

    for step_index, (tracker_key, tracker_entry) in enumerate(tracker_items):
        hour_index = resolve_hour_index(hour_lookup, str(tracker_key))
        if hour_index is None:
            fail("TRACKER_HOUR_LOOKUP_FAILED", f"Could not map tracker timestamp {tracker_key} back to the hourly weather series.")

        tracker_theta = float(tracker_entry.get("theta", 0.0))
        if step_index == 0 or (step_index + 1) % 10 == 0 or (step_index + 1) == total_steps:
            runtime_progress(
                "running_tracker_hours",
                step_index,
                total_steps,
                f"Tracing tracker hour {step_index + 1}/{total_steps} (8760 index {hour_index + 1}/8760, theta {tracker_theta:.2f} deg).",
                mode="tracker",
                sensors=total_sensors,
                currentHourIndex=hour_index,
                trackerThetaDeg=tracker_theta,
            )

        skyfile = tracker_entry["skyfile"]
        scene_path = scene_file_for_angle(package_root, manifest, motion_model, tracker_theta, scene_cache)
        geometry_oct_path = geometry_octree_for_scene(package_root, scene_path, log_lines)
        sky_path = result_root / str(skyfile)
        values = run_radiance_trace(
            package_root,
            geometry_oct_path,
            sky_path,
            points_path,
            f"hour-{hour_index:04d}-tracker-{tracker_theta:+06.2f}".replace(".", "_"),
            log_lines,
            simulation_options,
        )
        record_hour_values(export_package, writers, hour_index, int(weather["hourly"][hour_index]["month"]) - 1, values)

    runtime_progress(
        "running_tracker_hours",
        total_steps,
        total_steps,
        f"Completed tracker irradiance tracing for {total_steps} sky states.",
        mode="tracker",
        sensors=total_sensors,
    )
    finalize_hourly_outputs(writers)
    return hourly_output, writers


def build_dataset(payload: dict[str, Any], notes: list[str]) -> dict[str, Any]:
    request = payload["request"]
    export_package = payload["exportPackage"]
    weather = payload["weather"]
    job = completed_job_summary(payload, request, weather)
    design_state = request.get("designState") or {}
    motion_model = request.get("motionModel")
    system_type = resolve_system_type(request)
    albedo = float((request.get("skyDefaults") or {}).get("albedo", 0.2) or 0.2)
    package_root = Path(export_package["packageRoot"])
    manifest = export_package["manifest"]
    simulation_options = resolve_simulation_options(manifest)
    quality_preset = str(request.get("simulationQualityPreset") or "medium").strip().lower() or "medium"
    log_lines: list[str] = []

    if simulation_options["conversionStrategy"] != "obj2rad":
        fail(
            "GEOMETRY_STRATEGY_UNSUPPORTED",
            "The annual bifacial_radiance runner currently supports obj2rad geometry packages only.",
        )

    ensure_radiance_binary("obj2rad")
    ensure_radiance_binary("oconv")
    ensure_radiance_binary("rtrace")
    ensure_radiance_binary("gendaylit")

    notes.append("Running real 8760-hour Radiance tracing using bifacial_radiance sky generation and the three.js export package geometry.")
    notes.append(f"System archetype: {system_type}.")
    notes.append(f"Simulation quality preset: {quality_preset}.")
    notes.append(
        "Resolved Radiance settings: "
        f"-ab {simulation_options['ambientBounces']} "
        f"-ad {simulation_options['ambientDivisions']} "
        f"-ar {simulation_options['ambientResolution']} "
        f"-aa {simulation_options['ambientAccuracy']} "
        f"-lw {simulation_options['limitWeight']}."
    )
    notes.append("Frozen geometry octree caching is enabled so static geometry is reused across hourly sky states.")
    runtime_progress("preparing_geometry", 0, 1, f"Preparing Radiance geometry for the {system_type} system.")

    ensure_geometry_rad_files(package_root, manifest, log_lines)
    points_path, _sensor_index_map = combined_sensor_points(export_package, package_root)
    runtime_progress(
        "preparing_geometry",
        1,
        1,
        f"Geometry prepared with {len(export_package['grids'])} sensor grid(s) and {sum(len(grid['sensors']) for grid in export_package['grids'])} sensors.",
    )

    tracking_enabled = system_type == "sat" or (system_type == "raised" and bool(design_state.get("pergolaTracking", False)))
    try:
        if tracking_enabled:
            notes.append("Tracker-aware hourly sky workflow enabled with row-axis geometry transforms.")
            runtime_progress("building_scene", 0, 1, "Building tracker-aware hourly sky states from bifacial_radiance weather data.")
            hourly_output, writers = hourly_tracker_results(
                package_root,
                export_package,
                weather,
                design_state,
                system_type,
                albedo,
                points_path,
                motion_model or {},
                simulation_options,
                log_lines,
            )
        else:
            notes.append("Static hourly sky workflow enabled.")
            runtime_progress("building_scene", 0, 1, "Building static hourly sky states from bifacial_radiance weather data.")
            hourly_output, writers = hourly_static_results(
                package_root,
                export_package,
                weather,
                albedo,
                points_path,
                simulation_options,
                log_lines,
            )
    finally:
        if not keep_radiance_artifacts():
            cleanup_geometry_octree_cache(package_root)

    monthly_sensor_arrays = monthly_arrays_to_lists(writers)
    runtime_progress("post_processing", 0, 1, "Compiling monthly aggregates and writing irradiance result artifacts.")
    monthly_aggregates = []
    for grid in export_package["grids"]:
        world_bounds = grid.get("worldBounds") or {}
        world_min = world_bounds.get("min") or {}
        ground_elevation = float(
            world_min.get(
                "z",
                float(grid["centroid"]["z"]) - (float(grid["bounds"]["height"]) * 0.5),
            )
        )
        sensors = []
        for sensor_index, sensor in enumerate(grid["sensors"]):
            sensors.append({
                "sensorId": sensor["id"],
                "gridId": sensor["gridId"],
                "position": sensor["position"],
                "indices": sensor["indices"],
                "normalized": sensor["normalized"],
                "heightAboveGroundM": max(0.0, float(sensor["position"]["z"]) - ground_elevation),
                "monthlyIrradianceWhM2": monthly_sensor_arrays[grid["gridId"]][sensor_index],
            })

        aggregate = {
            "gridId": grid["gridId"],
            "classification": grid["classifications"],
            "dimensions": grid["dimensions"],
            "rowPairId": grid["rowPairId"],
            "sensors": sensors,
        }
        if grid.get("bayId") is not None:
            aggregate["bayId"] = grid.get("bayId")
        monthly_aggregates.append(aggregate)

    runtime_progress("post_processing", 1, 1, "Irradiance result artifacts are ready.")

    return {
        "job": job,
        "exportPackage": {
            "exportPackageId": export_package["exportPackageId"],
            "analysis": export_package["analysis"],
            "manifest": export_package["manifest"],
            "grids": export_package["grids"],
        },
        "weather": weather,
        "dataResolution": "monthly_aggregate",
        "monthlyAggregates": monthly_aggregates,
        "hourlyOutput": hourly_output["manifest"],
        "provenance": {
            "engine": "bifacial_radiance",
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "notes": notes + [
                "Hourly irradiance arrays were saved under results/hourly-irradiance/ as float32 .npy files.",
            ] + log_lines,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--log", required=False)
    parser.add_argument("--progress", required=False)
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    log_path = Path(args.log) if args.log else None
    progress_path = Path(args.progress) if args.progress else None
    initialize_runtime_reporting(log_path, progress_path)
    notes = [
        f"bifacial_radiance version: {getattr(bifacial_radiance, '__version__', 'unknown')}",
        "The three.js export package remained the geometry and sensor source of truth for 8760-hour irradiance analysis.",
    ]

    try:
        runtime_log("Starting irradiance bifacial_radiance runner.")
        configure_radiance_environment()
        payload = load_json(input_path)
        dataset = build_dataset(payload, notes)
        save_json(output_path, dataset)
        runtime_progress("completed", 1, 1, "Irradiance modeling completed successfully.")
        for note in dataset["provenance"]["notes"]:
            runtime_log(note)
        return 0
    except Exception as exc:  # pragma: no cover - runtime failure path
        error_lines = [
            f"Irradiance bifacial_radiance runner failed: {exc}",
            "",
            traceback.format_exc(),
        ]
        runtime_progress("failed", 1, 1, f"Irradiance modeling failed: {exc}")
        for line in notes + [""] + error_lines:
            runtime_log(line)
        print("\n".join(error_lines), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
