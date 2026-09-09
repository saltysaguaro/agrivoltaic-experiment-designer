import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildGeometry, disposeGroup, localToWorld, axes } from '../domain/geometry.js';
import { heatColor, figureSvg } from '../report/figures.js';
import { fitOrthographic, cameraSnapshot, restoreCamera, receiverAtPoint } from './camera.js';
import { groundGrid } from './ground-grid.js';
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
    let renderer, observer, controls, frame;
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
        new THREE.BufferGeometry().setFromPoints(ground.lines.flat()),
        new THREE.LineBasicMaterial({ color: 0x97ac97, transparent: true, opacity: 0.45 }),
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
    if (['sensors', 'crops', 'report', 'array'].includes(scope)) {
      for (const sensor of study.experimentSensors) {
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(extent * 0.008, 12, 8),
          new THREE.MeshBasicMaterial({ color: 0xd66d43 }),
        );
        marker.position.set(sensor.x, sensor.y, Math.max(0.15, sensor.z));
        scene.add(marker);
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(sensor.x, sensor.y, 0),
            marker.position.clone(),
          ]),
          new THREE.LineBasicMaterial({ color: 0xd66d43 }),
        );
        scene.add(line);
      }
      for (const p of study.crops) {
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(p.width, p.length),
          new THREE.MeshBasicMaterial({
            color: 0x86b358,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
          }),
        );
        mesh.position.set(p.x, p.y, 0.04);
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
      if (!result || metric === 'none' || e.buttons || view === 'profile') {
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
      const found = receiverAtPoint(result, point);
      setHover(
        found
          ? {
              ...found,
              left: Math.max(8, Math.min(e.clientX - rect.left + 14, rect.width - 235)),
              top: Math.max(8, Math.min(e.clientY - rect.top + 14, rect.height - 150)),
            }
          : null,
      );
    };
    renderer.domElement.addEventListener('pointermove', pointermove);
    renderer.domElement.addEventListener('pointerleave', () => setHover(null));
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
          list.forEach((m) => m.dispose());
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
          style={{ left: hover.left, top: hover.top }}
        >
          <strong>Receiver {hover.index + 1}</strong>
          <span>
            East {hover.cell.x.toFixed(2)} m · North {hover.cell.y.toFixed(2)} m
          </span>
          <span>Height {hover.cell.z.toFixed(2)} m</span>
          <div>
            <b>{hover.cell.sunlight.toFixed(1)}%</b> relative sunlight
          </div>
          <div>
            <b>{hover.cell.dli.toFixed(2)}</b> {result.estimated ? 'estimated DLI' : 'DLI'}{' '}
            <small>mol m⁻² d⁻¹</small>
          </div>
          <span>{(hover.cell.wh / 1000).toFixed(3)} kWh m⁻² day⁻¹</span>
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
