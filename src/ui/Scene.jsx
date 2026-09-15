import { rowHeight, maxRows } from '../domain/receiver-grid.js';
import { dliLabel } from '../domain/period.js';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { engineeringAnnotations } from './annotations.js';
import { annotationSvg } from './annotation-svg.js';
import { landMeshes, applyDisplayLayers } from './land-meshes.js';
import { designLayers } from './display-layers.js';
import { landUseZones } from '../domain/land-use.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildGeometry, disposeGroup, axes, receiverGridSpec } from '../domain/geometry.js';
import { heatColor, figureSvg } from '../report/figures.js';
import { displayBounds } from './camera.js';
import { hardwarePoints, fitDrawing } from './drawing-bounds.js';
import { groundGrid } from './ground-grid.js';
import { receiverLines, sensorMarkers, cellAt, cellCenter } from '../experiment/grid-layout.js';
import ReceiverInspector from './ReceiverInspector.jsx';
import FieldMapOverlay from './FieldMapOverlay.jsx';
import { plotCorners } from '../experiment/grid-layout.js';
import {
  gridPoint,
  moveGrid,
  resizeGrid,
  replaceFieldItem,
  layoutItems,
  moveFieldGroup,
} from '../experiment/field-editing.js';

export default function Scene({
  study,
  layers = designLayers,
  panelOpacity = 1,
  focus,
  scope,
  view,
  result,
  metric,
  showGrid,
  onPlace,
  placing,
  placementKind = 'sensor',
  resetKey,
  editing = false,
  selection = null,
  selections = [],
  control = false,
  onSelect,
  onEditItem,
  onDropTool,
  editor,
  interactionRef,
}) {
  const host = useRef(null),
    runtime = useRef(null),
    latest = useRef(null),
    annotationLayer = useRef(null);
  const [annotations, setAnnotations] = useState([]);
  const [projection, setProjection] = useState(null);
  const [failed, setFailed] = useState(false),
    [hover, setHover] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ column: 0, row: 0 });
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const scopeKey = ['array', 'environment', 'irradiance', 'sensors', 'crops', 'report'].includes(
    scope,
  )
    ? 'array'
    : scope;
  latest.current = {
    study,
    result,
    scopeKey,
    scope,
    view,
    placing,
    onPlace,
    selectedCell,
    editing,
    selection,
    layers,
    onSelect,
    onEditItem,
  };
  const structureKey = JSON.stringify([
    study.module.length,
    study.module.width,
    study.module.thickness,
    study.module.gap,
    study.racking,
    study.table,
    study.row,
    study.rowPair.pitch,
    study.array,
    scopeKey,
  ]);
  const overlayKey = JSON.stringify([
    study.landUse,
    study.rowPair.cropSetback,
    study.rowPair.croppingWidth,
    study.analysis.resolution,
    study.analysis.gridAlignment,
    study.analysis.cellsPerRow,
    study.analysis.receiverHeight,
    study.experimentSensors.map((s) => [s.id, s.x, s.y, s.z, s.grid]),
    study.crops.map((p) => [p.id, p.x, p.y, p.width, p.length, p.grid]),
  ]);

  const annotationKey = JSON.stringify([
    study.experimentSensors,
    study.crops,
    study.module.power,
    study.site,
    study.analysis,
    study.metadata,
    study.weather.name,
    study.weather.mode,
  ]);
  // One renderer, camera and controls for the lifetime of the mounted view.
  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f1f4ee');
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'group');
    canvas.setAttribute(
      'aria-label',
      'Field drawing. Arrow keys inspect receiver cells. Enter places an item when placement is enabled.',
    );
    host.current.appendChild(canvas);
    const camera = new THREE.OrthographicCamera();
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = false;
    controls.screenSpacePanning = true;
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8b9f84, 2.6));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(-20, -20, 40);
    scene.add(sun);
    const rt = { scene, renderer, camera, controls, group: null, overlay: null, framing: null };
    runtime.current = rt;
    rt.draw = () => {
      renderer.render(scene, camera);
      if (!annotationLayer.current) return;
      const w = host.current.clientWidth,
        h = host.current.clientHeight;
      camera.updateMatrixWorld(true);
      const project = (point) => {
        const p = point.clone().project(camera);
        return [((p.x + 1) * w) / 2, ((1 - p.y) * h) / 2];
      };
      rt.project = project;
      const current = latest.current;
      if (current.editing || current.scope === 'report') {
        const displayed = rt.preview
          ? rt.preview.study ||
            replaceFieldItem(current.study, rt.preview.selection, rt.preview.item)
          : current.study;
        const chosen =
          current.selection &&
          layoutItems(displayed, current.selection.kind).find((o) => o.id === current.selection.id);
        const anchor = chosen
          ? project(
              new THREE.Vector3(
                chosen.x,
                chosen.y,
                current.view === 'profile' && current.selection.kind === 'sensor' ? chosen.z : 0,
              ),
            )
          : null;
        setProjection({
          width: w,
          height: h,
          profile: current.view === 'profile',
          viewportBottom: window.innerHeight - host.current.getBoundingClientRect().top - 42,
          anchor,
          beds: current.layers.plots
            ? displayed.crops.map((b) => ({
                ...b,
                points: plotCorners(displayed, b).map(project),
              }))
            : [],
          markers: current.layers.sensors
            ? sensorMarkers(displayed, { profile: current.view === 'profile' }).map((m) => {
                const position = m.position.clone();
                if (current.view === 'profile') position.z = m.sensors[0].z;
                const q = project(position),
                  edge = project(
                    position
                      .clone()
                      .addScaledVector(
                        current.view === 'profile' ? axes(displayed).v : axes(displayed).u,
                        m.radius,
                      ),
                  );
                return {
                  ids: m.sensors.map((v) => v.id),
                  point: q,
                  radius: Math.min(15, Math.hypot(edge[0] - q[0], edge[1] - q[1])),
                };
              })
            : [],
        });
      } else setProjection(null);
      annotationLayer.current.setAttribute('viewBox', `0 0 ${w} ${h}`);
      annotationLayer.current.innerHTML = annotationSvg(
        current.editing || current.scope === 'report' ? [] : rt.annotations || [],
        project,
        w,
        h - 25,
        {
          obstacles: rt.hardwarePoints?.map(project) || [],
        },
      );
    };
    controls.addEventListener('change', () => {
      setHover(null);
      rt.draw();
    });
    rt.resize = () => {
      const w = Math.max(1, host.current.clientWidth),
        h = Math.max(1, host.current.clientHeight);
      renderer.setSize(w, h);
      if (rt.framing) {
        const half = (rt.framing.top - rt.framing.bottom) / 2;
        Object.assign(camera, {
          left: (-half * w) / h,
          right: (half * w) / h,
          top: half,
          bottom: -half,
        });
        camera.updateProjectionMatrix();
      }
      rt.draw();
    };
    const observer = new ResizeObserver(rt.resize);
    observer.observe(host.current);
    const pointAt = (e) => {
      const rect = canvas.getBoundingClientRect(),
        ray = new THREE.Raycaster();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      return ray.ray.intersectPlane(
        new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
        new THREE.Vector3(),
      );
    };
    rt.pointAt = pointAt;
    if (interactionRef)
      interactionRef.current = {
        pointAtClient(event) {
          const rect = canvas.getBoundingClientRect();
          if (
            latest.current.view === 'profile' ||
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            return null;
          return pointAt(event);
        },
      };
    let down;
    canvas.addEventListener('pointerdown', (e) => {
      down = [e.clientX, e.clientY];
    });
    canvas.addEventListener('pointerup', (e) => {
      const v = latest.current;
      if (e.button !== 0 || !down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5)
        return;
      if (!v.placing) {
        if (v.editing) v.onSelect?.(null, false);
        return;
      }
      if (v.view === 'profile') return;
      const p = pointAt(e);
      if (p) v.onPlace?.(p);
    });
    canvas.addEventListener('pointermove', (e) => {
      const v = latest.current;
      if (
        v.scopeKey !== 'array' ||
        e.buttons ||
        v.view === 'profile' ||
        (v.editing && v.selection)
      ) {
        setHover(null);
        return;
      }
      const point = pointAt(e),
        g = receiverGridSpec(v.study);
      const cell = point && cellAt(v.study, point, g, false);
      if (!cell) {
        setHover(null);
        return;
      }
      const index = cell.row * g.nx + cell.column,
        rect = canvas.getBoundingClientRect();
      setHover({
        index,
        gridCell: cell,
        cell: v.result?.cells[index] || {
          ...cellCenter(v.study, cell, g),
          z: v.study.analysis.receiverHeight,
        },
        sensors: v.study.experimentSensors.filter(
          (s) => s.grid?.column === cell.column && s.grid?.row === cell.row,
        ),
        left: Math.max(8, Math.min(e.clientX - rect.left + 14, rect.width - 235)),
        top: Math.max(8, Math.min(e.clientY - rect.top + 14, rect.height - 290)),
      });
    });
    canvas.addEventListener('pointerleave', (e) => {
      if (!e.relatedTarget?.closest?.('.receiver-tooltip')) setHover(null);
    });
    canvas.addEventListener('keydown', (e) => {
      const v = latest.current;
      if (v.scopeKey !== 'array') return;
      const g = receiverGridSpec(v.study),
        cell = { ...v.selectedCell };
      if (e.key === 'Enter' && v.placing) {
        e.preventDefault();
        v.onPlace?.(
          cellCenter(
            v.study,
            { column: Math.min(cell.column, g.nx - 1), row: Math.min(cell.row, g.ny - 1) },
            g,
          ),
        );
        return;
      }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      cell.column = Math.max(
        0,
        Math.min(
          g.nx - 1,
          cell.column + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0),
        ),
      );
      cell.row = Math.max(
        0,
        Math.min(g.ny - 1, cell.row + (e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0)),
      );
      setSelectedCell(cell);
      setInspectorOpen(true);
    });
    return () => {
      if (interactionRef) interactionRef.current = null;
      observer.disconnect();
      controls.dispose();
      if (rt.group) disposeGroup(rt.group);
      if (rt.overlay) disposeOverlay(rt.overlay);
      renderer.dispose();
      canvas.remove();
      runtime.current = null;
    };
  }, []);

  useEffect(() => {
    const rt = runtime.current;
    if (!rt) return;
    setHover(null);
    const { scene, camera, controls } = rt;
    if (rt.structureKey !== structureKey) {
      if (rt.group) {
        scene.remove(rt.group);
        disposeGroup(rt.group);
      }
      const group = buildGeometry(study, scopeKey);
      decorate(group);
      rt.group = group;
      rt.hardwarePoints = hardwarePoints(group);
      scene.add(group);
      rt.structureKey = structureKey;
    }
    const group = rt.group;
    rt.annotations =
      editing || scope === 'report' ? [] : engineeringAnnotations(study, scope, group, focus);
    const land = landUseZones(study, group.userData);
    rt.zones =
      scopeKey === 'array' || scopeKey === 'pair'
        ? land.zones.filter((z) => scopeKey === 'array' || z.kind !== 'perimeter')
        : [];
    rt.view = view;
    rt.metric = metric;
    if (rt.overlay) {
      if (rt.heatmap) rt.overlay.remove(rt.heatmap);
      scene.remove(rt.overlay);
      disposeOverlay(rt.overlay);
    }
    const overlay = new THREE.Group();
    rt.overlay = overlay;
    scene.add(overlay);
    overlay.add(landMeshes(study, rt.zones, view === 'profile'));
    if (scopeKey === 'array') {
      const receiver = receiverGridSpec(study),
        { u, v } = axes(study);
      const corners = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
        [-1, -1],
      ].map(([x, y]) =>
        u
          .clone()
          .multiplyScalar((x * receiver.width) / 2)
          .addScaledVector(v, (y * receiver.height) / 2)
          .setZ(0.035),
      );
      const boundary = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(corners),
        new THREE.LineDashedMaterial({
          color: 0x276a80,
          dashSize: 0.3,
          gapSize: 0.2,
          depthWrite: false,
        }),
      );
      boundary.computeLineDistances();
      boundary.userData.layer = 'receiver';
      overlay.add(boundary);
    }
    if (scope !== 'module' && showGrid) {
      const ground = groundGrid(study, group.userData);
      const grid = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(
          (scopeKey === 'array' ? receiverLines(study) : ground.lines).flat(),
        ),
        new THREE.LineBasicMaterial({ color: 0x97ac97, transparent: true, opacity: 0.32 }),
      );
      // Small display offset avoids z-fighting with the light-map overlay.
      grid.position.z = 0.02;
      if (scopeKey === 'array') grid.userData.layer = 'receiver';
      overlay.add(grid);
    }
    if (
      result &&
      metric !== 'none' &&
      ['array', 'irradiance', 'sensors', 'crops', 'report'].includes(scope)
    ) {
      if (rt.heatmap && (rt.heatmapResult !== result || rt.heatmapMetric !== metric)) {
        rt.heatmap.geometry.dispose();
        rt.heatmap.material.dispose();
        rt.heatmap = null;
      }
      if (!rt.heatmap) {
        const geometry = new THREE.PlaneGeometry(result.grid.dx, result.grid.dy),
          material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
          mesh = new THREE.InstancedMesh(geometry, material, result.cells.length);
        result.cells.forEach((c, i) => {
          const matrix = new THREE.Matrix4().makeRotationZ(
            Math.atan2(axes(study).u.y, axes(study).u.x),
          );
          matrix.scale(
            new THREE.Vector3(
              1,
              rowHeight(result.grid, Math.floor(i / result.grid.nx)) / result.grid.dy,
              1,
            ),
          );
          matrix.setPosition(c.x, c.y, 0.01);
          mesh.setMatrixAt(i, matrix);
          mesh.setColorAt(
            i,
            new THREE.Color(
              heatColor(
                metric === 'sunlight' ? c.sunlight : c.dli,
                metric === 'sunlight' ? 100 : result.openDli,
              ),
            ),
          );
        });
        rt.heatmap = mesh;
        rt.heatmapResult = result;
        rt.heatmapMetric = metric;
      }
      overlay.add(rt.heatmap);
    } else if (rt.heatmap) {
      rt.heatmap.geometry.dispose();
      rt.heatmap.material.dispose();
      rt.heatmap = null;
    }
    if (scopeKey === 'array') {
      for (const glyph of sensorMarkers(study, { profile: view === 'profile' })) {
        const profile = view === 'profile',
          sensor = glyph.sensors[0];
        const marker = new THREE.Mesh(
          profile
            ? new THREE.SphereGeometry(glyph.radius, 16, 10)
            : new THREE.CircleGeometry(glyph.radius, 24),
          new THREE.MeshBasicMaterial({
            color: glyph.count > 1 ? 0x8f4934 : 0xd66d43,
            side: THREE.DoubleSide,
            depthTest: true,
          }),
        );
        marker.position.set(glyph.position.x, glyph.position.y, profile ? sensor.z : 0.065);
        marker.renderOrder = 3;
        marker.userData.layer = 'sensors';
        overlay.add(marker);
        if (!profile) {
          const rim = new THREE.Mesh(
            new THREE.RingGeometry(glyph.radius * 0.85, glyph.radius, 24),
            new THREE.MeshBasicMaterial({
              color: 0xffffff,
              side: THREE.DoubleSide,
              depthTest: true,
            }),
          );
          rim.position.copy(marker.position);
          rim.position.z += 0.001;
          rim.renderOrder = 3;
          rim.userData.layer = 'sensors';
          overlay.add(rim);
        }
        if (glyph.count > 1) {
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const context = canvas.getContext('2d');
          context.fillStyle = 'white';
          context.font = 'bold 48px Arial';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(glyph.label, 64, 64);
          const label = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: true }),
          );
          label.position.copy(marker.position);
          label.position.z += 0.002;
          label.scale.setScalar(glyph.radius * 1.8);
          label.renderOrder = 3;
          label.userData.layer = 'sensors';
          overlay.add(label);
        }
      }
      for (const p of study.crops) {
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(p.width, p.length),
          new THREE.MeshBasicMaterial({
            color: 0x86b358,
            transparent: true,
            opacity: metric === 'none' ? 0.35 : 0.15,
            side: THREE.DoubleSide,
          }),
        );
        mesh.userData.layer = 'plots';
        mesh.renderOrder = 2;
        mesh.material.depthWrite = false;
        mesh.position.set(p.x, p.y, 0.04);
        if (p.grid) mesh.rotation.z = Math.atan2(axes(study).u.y, axes(study).u.x);
        overlay.add(mesh);
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(mesh.geometry),
          new THREE.LineBasicMaterial({ color: 0x4f793d }),
        );
        mesh.add(edges);
      }
    }
    applyDisplayLayers(group, overlay, layers, panelOpacity);
    const framingKey = `${view}:${scopeKey}:${resetKey}`;
    if (rt.framingKey !== framingKey) {
      const bounds = displayBounds(study, group, scopeKey);
      for (const a of rt.annotations) for (const p of a.points) bounds.expandByPoint(p);
      const center = bounds.getCenter(new THREE.Vector3()),
        size = bounds.getSize(new THREE.Vector3());
      const extent = Math.max(size.x, size.y, size.z, 1) * 1.4;
      camera.up.set(0, 0, 1);
      if (view === 'plan') {
        camera.position.copy(center).add(new THREE.Vector3(0, 0, extent * 3));
        camera.up.set(0, 1, 0);
      } else if (view === 'profile')
        camera.position.copy(center).add(axes(study).u.multiplyScalar(extent * 3));
      else camera.position.copy(center).add(new THREE.Vector3(extent, -extent, extent * 0.85));
      camera.near = 0.01;
      camera.far = extent * 20;
      camera.zoom = 1;
      camera.lookAt(center);
      controls.target.copy(center);
      controls.enableRotate = view === 'oblique';
      controls.update();
      rt.framing = fitDrawing(
        camera,
        bounds,
        host.current.clientWidth,
        Math.max(1, host.current.clientHeight),
        rt.annotations.length > 0,
      );
      rt.framingKey = framingKey;
    }
    rt.resize();
  }, [structureKey, overlayKey, view, scopeKey, scope, metric, result, showGrid, resetKey]);
  useEffect(() => {
    const rt = runtime.current;
    if (rt?.group) {
      applyDisplayLayers(rt.group, rt.overlay, layers, panelOpacity);
      rt.draw();
    }
  }, [layers, panelOpacity]);
  // Updating a callout or non-spatial field does not rebuild thousands of map cells.
  useEffect(() => {
    const rt = runtime.current;
    const group = rt?.group || buildGeometry(study, scopeKey);
    const next = engineeringAnnotations(study, scope, group, focus);
    setAnnotations(editing || scope === 'report' ? [] : next);
    if (rt) {
      rt.annotations = editing || scope === 'report' ? [] : next;
      rt.draw();
    } else disposeGroup(group);
  }, [annotationKey, structureKey, overlayKey, scope, focus, editing, selection]);
  function startItemDrag(e, target, corner) {
    if (e.button !== 0 || placing) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      onSelect?.(target, false, true);
      return;
    }
    if (view === 'profile') {
      onSelect?.(target, true);
      return;
    }
    const rt = runtime.current,
      item = layoutItems(study, target.kind).find((v) => v.id === target.id),
      point = rt?.pointAt(e);
    if (!item || !point) return;
    rt.controls.enabled = false;
    rt.drag = {
      pointerId: e.pointerId,
      target,
      item,
      base: study,
      selections: selections.some((v) => v.kind === target.kind && v.id === target.id)
        ? selections
        : [target],
      start: gridPoint(study, point),
      x: e.clientX,
      y: e.clientY,
      corner,
      moved: false,
    };
    onSelect?.(target, false);
    e.currentTarget.focus();
    e.currentTarget.setPointerCapture(e.pointerId);
    setHover(null);
  }
  function moveItemDrag(e) {
    const rt = runtime.current,
      drag = rt?.drag;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    const point = rt.pointAt(e);
    if (!point) return;
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 4 && !drag.moved) return;
    drag.moved = true;
    const p = gridPoint(drag.base, point);
    const grid = drag.corner
      ? resizeGrid(drag.base, drag.item.grid, drag.corner, point)
      : moveGrid(drag.base, drag.item.grid, {
          column: p.column - drag.start.column,
          row: p.row - drag.start.row,
        });
    const groupStudy =
      !drag.corner && drag.selections.length > 1
        ? moveFieldGroup(drag.base, drag.selections, {
            column: grid.column - drag.item.grid.column,
            row: grid.row - drag.item.grid.row,
          })
        : null;
    rt.preview = { selection: drag.target, item: { ...drag.item, grid }, study: groupStudy };
    rt.draw();
  }
  function endItemDrag(e, commit) {
    const rt = runtime.current,
      drag = rt?.drag;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.stopPropagation();
    const preview = rt.preview;
    rt.drag = null;
    rt.preview = null;
    rt.controls.enabled = true;
    if (commit && drag.moved && preview) onEditItem?.(drag.target, preview.item);
    else if (commit && !drag.moved) onSelect?.(drag.target, true);
    rt.draw();
  }
  function keyItem(e, target) {
    if (e.key === 'Escape') {
      const rt = runtime.current;
      if (rt) {
        rt.drag = null;
        rt.preview = null;
        rt.controls.enabled = true;
        rt.draw();
      }
      e.preventDefault();
      e.stopPropagation();
      onSelect?.(null, false);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(target, true);
      return;
    }
    const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowDown: [0, -1], ArrowUp: [0, 1] };
    if (!dirs[e.key]) return;
    e.preventDefault();
    e.stopPropagation();
    const item = layoutItems(study, target.kind).find((v) => v.id === target.id);
    if (!item) return;
    const [x, y] = dirs[e.key];
    let grid;
    if (e.shiftKey && target.kind === 'crop') {
      const g = receiverGridSpec(study);
      grid = {
        ...item.grid,
        columns: Math.max(
          1,
          Math.min(g.nx - item.grid.column, Math.floor(100 / g.dx), item.grid.columns + x),
        ),
        rows: Math.max(
          1,
          Math.min(g.ny - item.grid.row, maxRows(g, item.grid.row), item.grid.rows + y),
        ),
      };
    } else grid = moveGrid(study, item.grid, { column: x, row: y });
    onSelect?.(target, false);
    onEditItem?.(target, { ...item, grid });
  }
  function dropTool(e) {
    const raw = e.dataTransfer.getData('application/x-aed-field-tool');
    if (!editing || !raw) return;
    e.preventDefault();
    if (view === 'profile') return;
    try {
      const tool = JSON.parse(raw),
        point = runtime.current?.pointAt(e);
      if (point && ['sensor', 'crop'].includes(tool.kind)) onDropTool?.(tool, point);
    } catch {}
  }
  return (
    <>
      <div
        className={'scene ' + (placing ? 'placing' : '')}
        ref={host}
        onDragOver={(e) => {
          if (
            editing &&
            view !== 'profile' &&
            e.dataTransfer.types.includes('application/x-aed-field-tool')
          ) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }
        }}
        onDrop={dropTool}
      >
        <svg className="engineering-overlay" aria-hidden="true" ref={annotationLayer} />
        {(editing || scope === 'report') && !failed && (
          <FieldMapOverlay
            projection={projection}
            interactive={editing}
            selection={selection}
            selections={selections}
            placing={placing}
            onStart={startItemDrag}
            onMove={moveItemDrag}
            onEnd={endItemDrag}
            onKey={keyItem}
          />
        )}
        {editing && editor && (
          <div
            className="map-editor-anchor"
            style={{
              '--editor-max-height': `${Math.max(180, Math.min(projection?.height || 420, projection?.viewportBottom || 420) - (projection?.anchor ? Math.max(8, Math.min(projection.anchor[1] - 40, projection.height - 360)) : 12) - 10)}px`,
              left: projection?.anchor
                ? Math.max(8, Math.min(projection.anchor[0] + 24, projection.width - 365))
                : 12,
              top: projection?.anchor
                ? Math.max(8, Math.min(projection.anchor[1] - 40, projection.height - 360))
                : 12,
            }}
          >
            {editor}
          </div>
        )}
        {hover && (
          <div
            role="tooltip"
            className="receiver-tooltip"
            onWheel={(e) => e.stopPropagation()}
            onPointerLeave={(e) => {
              if (!host.current?.contains(e.relatedTarget)) setHover(null);
            }}
            style={{ left: hover.left, top: hover.top }}
          >
            <strong>
              Receiver {hover.index + 1} · column {hover.gridCell.column + 1}, row{' '}
              {hover.gridCell.row + 1}
            </strong>
            <span>
              East {hover.cell.x.toFixed(2)} m · North {hover.cell.y.toFixed(2)} m
            </span>
            <span>Height {hover.cell.z.toFixed(2)} m</span>
            {hover.cell.sunlight !== undefined && (
              <>
                <div>
                  <b>{hover.cell.sunlight.toFixed(1)}%</b> relative sunlight
                </div>
                <div>
                  <b>{hover.cell.dli.toFixed(2)}</b> {dliLabel(result)} <small>mol m⁻² d⁻¹</small>
                </div>
                <span>
                  {(hover.cell.wh / 1000).toFixed(3)} kWh m⁻²{' '}
                  {result?.period ? 'over period' : 'day⁻¹'}
                </span>
              </>
            )}
            {hover.sensors.length > 0 && (
              <div className="receiver-instruments">
                <b>{hover.sensors.length} field instruments</b>
                {hover.sensors.map((s) => (
                  <span key={s.id}>
                    {s.id} · {s.type} · height/depth {s.z} m
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {failed && (
          <div
            className="svg-fallback"
            dangerouslySetInnerHTML={{
              __html: figureSvg(study, result, view, metric, scope, showGrid, {
                focus,
                control,
                callouts: !editing && scope !== 'report',
                layers,
                panelOpacity,
              }),
            }}
          />
        )}
      </div>
      {annotations.length > 0 &&
        document.getElementById('drawing-annotations') &&
        createPortal(
          <aside className="drawing-annotations" aria-label="Drawing callouts">
            <div className="annotation-cards" aria-live="polite">
              {annotations.map((a) => (
                <div key={a.id} className={a.active ? 'active' : ''}>
                  <strong>
                    <b>{a.symbol}</b> {a.label}: <span>{a.value}</span>
                  </strong>
                  {a.active && <p>{a.detail || 'Study setting retained in the methods report.'}</p>}
                </div>
              ))}
            </div>
            <small>
              Focus an input to highlight it. Valid edits and arrow keys update immediately; a short
              leader marks dimensions viewed edge-on. Pan and zoom are preserved.
            </small>
          </aside>,
          document.getElementById('drawing-annotations'),
        )}
      {scopeKey === 'array' && (
        <ReceiverInspector
          study={study}
          result={result}
          cell={selectedCell}
          setCell={setSelectedCell}
          open={inspectorOpen}
          setOpen={setInspectorOpen}
          placing={placing}
          onPlace={onPlace}
          kind={placementKind}
        />
      )}
    </>
  );
}

function decorate(group) {
  group.traverse((o) => {
    if (!o.isMesh) return;
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(o.geometry),
      new THREE.LineBasicMaterial({
        color: o.userData.kind === 'module' ? 0x9cbcb6 : 0x516461,
        transparent: true,
        opacity: 0.7,
      }),
    );
    o.add(edge);
    if (o.userData.kind === 'module') {
      const { width, height, depth } = o.geometry.parameters;
      const points = [];
      for (let i = 1; i < 6; i++) {
        points.push(
          new THREE.Vector3(-width / 2 + (i * width) / 6, -height / 2, depth / 2 + 0.001),
          new THREE.Vector3(-width / 2 + (i * width) / 6, height / 2, depth / 2 + 0.001),
        );
      }
      for (let i = 1; i < 12; i++) {
        points.push(
          new THREE.Vector3(-width / 2, -height / 2 + (i * height) / 12, depth / 2 + 0.001),
          new THREE.Vector3(width / 2, -height / 2 + (i * height) / 12, depth / 2 + 0.001),
        );
      }
      o.add(
        new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({ color: 0x88aca8, transparent: true, opacity: 0.35 }),
        ),
      );
    }
  });
}
function disposeOverlay(group) {
  group.traverse((o) => o.material?.map?.dispose());
  disposeGroup(group);
}
