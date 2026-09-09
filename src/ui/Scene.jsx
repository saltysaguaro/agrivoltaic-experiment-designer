import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildGeometry, disposeGroup, axes } from '../domain/geometry.js';
import { heatColor, figureSvg } from '../report/figures.js';
import { fitOrthographic, cameraSnapshot, restoreCamera } from './camera.js';
import { groundGrid } from './ground-grid.js';
import { receiverGridSpec } from '../domain/geometry.js';
import { receiverLines, sensorMarkers, cellAt, cellCenter } from '../experiment/grid-layout.js';
export default function Scene({
  study,
  scope,
  view,
  result,
  metric,
  showGrid,
  onPlace,
  placing,
  resetKey,
}) {
  const savedCamera = useRef(null);
  const [hover, setHover] = useState(null);
  const scopeKey = ['array', 'environment', 'irradiance', 'sensors', 'crops', 'report'].includes(
    scope,
  )
    ? 'array'
    : scope;
  const host = useRef(),
    [failed, setFailed] = useState(false),
    callback = useRef(onPlace);
  callback.current = onPlace;
  useEffect(() => {
    if (!host.current) return;
    setHover(null);
    let renderer, observer, controls;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f1f4ee');
    scene.up.set(0, 0, 1);
    const group = buildGeometry(study, scope);
    scene.add(group);
    const bounds = new THREE.Box3().setFromObject(group),
      center = bounds.getCenter(new THREE.Vector3()),
      size = bounds.getSize(new THREE.Vector3());
    const extent = Math.max(size.x, size.y, size.z, 1) * 1.4;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setFailed(true);
      disposeGroup(group);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(host.current.clientWidth, host.current.clientHeight);
    host.current.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8b9f84, 2.6));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(-20, -20, 40);
    scene.add(sun);
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
      scene.add(grid);
    }
    if (
      result &&
      metric !== 'none' &&
      ['array', 'irradiance', 'sensors', 'crops', 'report'].includes(scope)
    ) {
      const geometry = new THREE.PlaneGeometry(result.grid.dx, result.grid.dy),
        material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
        mesh = new THREE.InstancedMesh(geometry, material, result.cells.length);
      result.cells.forEach((c, i) => {
        const matrix = new THREE.Matrix4().makeRotationZ(
          Math.atan2(axes(study).u.y, axes(study).u.x),
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
      scene.add(mesh);
      group.children
        .filter((o) => o.isMesh && o.userData.kind === 'module')
        .forEach((o) => {
          o.material.transparent = true;
          o.material.opacity = 0.2;
          o.material.depthWrite = false;
        });
    }
    if (scopeKey === 'array') {
      for (const glyph of sensorMarkers(study)) {
        const profile = view === 'profile',
          sensor = glyph.sensors[0];
        const marker = new THREE.Mesh(
          profile
            ? new THREE.SphereGeometry(glyph.radius, 16, 10)
            : new THREE.CircleGeometry(glyph.radius, 24),
          new THREE.MeshBasicMaterial({
            color: glyph.count > 1 ? 0x8f4934 : 0xd66d43,
            side: THREE.DoubleSide,
            depthTest: false,
          }),
        );
        marker.position.set(glyph.position.x, glyph.position.y, profile ? sensor.z : 0.065);
        marker.renderOrder = 20;
        scene.add(marker);
        if (!profile) {
          const rim = new THREE.Mesh(
            new THREE.RingGeometry(glyph.radius * 0.85, glyph.radius, 24),
            new THREE.MeshBasicMaterial({
              color: 0xffffff,
              side: THREE.DoubleSide,
              depthTest: false,
            }),
          );
          rim.position.copy(marker.position);
          rim.position.z += 0.001;
          rim.renderOrder = 21;
          scene.add(rim);
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
            new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false }),
          );
          label.position.copy(marker.position);
          label.position.z += 0.002;
          label.scale.setScalar(glyph.radius * 1.8);
          label.renderOrder = 22;
          scene.add(label);
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
        mesh.position.set(p.x, p.y, 0.04);
        if (p.grid) mesh.rotation.z = Math.atan2(axes(study).u.y, axes(study).u.x);
        scene.add(mesh);
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(mesh.geometry),
          new THREE.LineBasicMaterial({ color: 0x4f793d }),
        );
        mesh.add(edges);
      }
    }
    const camera = new THREE.OrthographicCamera();
    camera.up.set(0, 0, 1);
    if (view === 'plan') {
      camera.position.copy(center).add(new THREE.Vector3(0, 0, extent * 3));
      camera.up.set(0, 1, 0);
    } else if (view === 'profile') {
      camera.position.copy(center).add(axes(study).u.multiplyScalar(extent * 3));
    } else {
      camera.position.copy(center).add(new THREE.Vector3(extent, -extent, extent * 0.85));
    }
    camera.near = 0.01;
    camera.far = extent * 20;
    camera.lookAt(center);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(center);
    controls.enableRotate = view === 'oblique';
    controls.enableDamping = false;
    controls.screenSpacePanning = true;
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
    const previous = savedCamera.current;
    const reuse =
      previous &&
      previous.view === view &&
      previous.scopeKey === scopeKey &&
      previous.resetKey === resetKey;
    if (reuse) restoreCamera(camera, controls, previous);
    let framing = reuse ? { ...previous.frustum } : null;
    const draw = () => renderer.render(scene, camera);
    controls.addEventListener('change', () => {
      setHover(null);
      draw();
    });
    const resize = () => {
      const w = host.current.clientWidth,
        h = host.current.clientHeight,
        aspect = w / h;
      renderer.setSize(w, h);
      if (!framing)
        framing = fitOrthographic(camera, bounds, aspect, view === 'oblique' ? 1.1 : 1.15);
      const half = (framing.top - framing.bottom) / 2;
      camera.left = -half * aspect;
      camera.right = half * aspect;
      camera.top = half;
      camera.bottom = -half;
      camera.updateProjectionMatrix();
      draw();
    };
    observer = new ResizeObserver(resize);
    observer.observe(host.current);
    resize();
    let down;
    const pointerdown = (e) => (down = [e.clientX, e.clientY]),
      click = (e) => {
        if (
          !placing ||
          view === 'profile' ||
          !down ||
          Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5
        )
          return;
        const rect = renderer.domElement.getBoundingClientRect(),
          ray = new THREE.Raycaster();
        ray.setFromCamera(
          new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            (-(e.clientY - rect.top) / rect.height) * 2 + 1,
          ),
          camera,
        );
        const point = new THREE.Vector3();
        if (ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), point))
          callback.current?.(point);
      };
    const pointermove = (e) => {
      if (scopeKey !== 'array' || e.buttons || view === 'profile') {
        setHover(null);
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect(),
        ray = new THREE.Raycaster();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      const point = new THREE.Vector3();
      if (!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.01), point)) {
        setHover(null);
        return;
      }
      const receiver = receiverGridSpec(study),
        cell = cellAt(study, point, receiver, false);
      const found = cell
        ? {
            index: cell.row * receiver.nx + cell.column,
            gridCell: cell,
            cell: result?.cells[cell.row * receiver.nx + cell.column] || {
              ...cellCenter(study, cell, receiver),
              z: study.analysis.receiverHeight,
            },
            sensors: study.experimentSensors.filter(
              (s) => s.grid?.column === cell.column && s.grid?.row === cell.row,
            ),
          }
        : null;
      setHover(
        found
          ? {
              ...found,
              left: Math.max(8, Math.min(e.clientX - rect.left + 14, rect.width - 235)),
              top: Math.max(8, Math.min(e.clientY - rect.top + 14, rect.height - 290)),
            }
          : null,
      );
    };
    renderer.domElement.addEventListener('pointermove', pointermove);
    renderer.domElement.addEventListener('pointerleave', (e) => {
      if (!e.relatedTarget?.closest?.('.receiver-tooltip')) setHover(null);
    });
    renderer.domElement.addEventListener('pointerdown', pointerdown);
    renderer.domElement.addEventListener('pointerup', click);
    return () => {
      savedCamera.current = { ...cameraSnapshot(camera, controls, view, resetKey), scopeKey };
      observer?.disconnect();
      controls?.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) {
          const list = Array.isArray(o.material) ? o.material : [o.material];
          list.forEach((m) => {
            m.map?.dispose();
            m.dispose();
          });
        }
      });
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [study, scope, view, result, metric, showGrid, placing, resetKey]);
  return (
    <div className={'scene ' + (placing ? 'placing' : '')} ref={host}>
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
                <b>{hover.cell.dli.toFixed(2)}</b> {result?.estimated ? 'estimated DLI' : 'DLI'}{' '}
                <small>mol m⁻² d⁻¹</small>
              </div>
              <span>{(hover.cell.wh / 1000).toFixed(3)} kWh m⁻² day⁻¹</span>
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
            __html: figureSvg(study, result, view, metric, scope, showGrid),
          }}
        />
      )}
    </div>
  );
}
