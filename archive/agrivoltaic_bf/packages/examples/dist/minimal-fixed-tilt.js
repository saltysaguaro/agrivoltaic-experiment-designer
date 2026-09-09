import * as THREE from "three";
import { attachSimulationMetadata } from "@agrivoltaic/three-exporter";
export function buildTaggedFixedTiltScene() {
    const root = new THREE.Group();
    root.name = "fixed-tilt-example";
    const moduleGeometry = new THREE.BoxGeometry(2.2, 0.05, 1.1);
    const postGeometry = new THREE.BoxGeometry(0.12, 0.12, 2.1);
    const railGeometry = new THREE.BoxGeometry(6.8, 0.08, 0.08);
    const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x324353 });
    const steelMaterial = new THREE.MeshStandardMaterial({ color: 0x77797c });
    const rowCenters = [-3.75, -1.25, 1.25, 3.75];
    rowCenters.forEach((rowCenter, rowIndex) => {
        const rowId = `row-${String(rowIndex + 1).padStart(2, "0")}`;
        const rowGroup = new THREE.Group();
        rowGroup.name = rowId;
        [-8.5, -1.5, 5.5].forEach((xStart, bayIndex) => {
            const bayId = `bay-${String(bayIndex + 1).padStart(2, "0")}`;
            const module = new THREE.Mesh(moduleGeometry, panelMaterial);
            module.name = `${rowId}-${bayId}-module`;
            module.position.set(xStart + 1.1, rowCenter, 2.5);
            attachSimulationMetadata(module, {
                includeInSimulation: true,
                simulationRole: "pv_module",
                radianceMaterial: "pv_glass",
                rowId,
                arrayId: "array-a",
                bayId,
                exportGroupId: rowId,
                tags: ["example", "fixed-tilt"],
            });
            rowGroup.add(module);
        });
        const rail = new THREE.Mesh(railGeometry, steelMaterial);
        rail.position.set(-1.5, rowCenter, 1.7);
        attachSimulationMetadata(rail, {
            includeInSimulation: true,
            simulationRole: "racking",
            radianceMaterial: "galvanized_racking",
            rowId,
            arrayId: "array-a",
            exportGroupId: rowId,
            tags: ["example"],
        });
        rowGroup.add(rail);
        root.add(rowGroup);
    });
    [-11.9, 8.9].forEach((x) => {
        [-3.75, 3.75].forEach((y) => {
            const post = new THREE.Mesh(postGeometry, steelMaterial);
            post.position.set(x, y, 1.05);
            attachSimulationMetadata(post, {
                includeInSimulation: true,
                simulationRole: "post",
                radianceMaterial: "steel_post",
                arrayId: "array-a",
                tags: ["example"],
            });
            root.add(post);
        });
    });
    const ground = new THREE.Mesh(new THREE.BoxGeometry(30, 16, 0.08), new THREE.MeshStandardMaterial({ color: 0x80684a }));
    ground.position.set(0, 0, -0.04);
    attachSimulationMetadata(ground, {
        includeInSimulation: true,
        simulationRole: "terrain",
        radianceMaterial: "soil_dry",
        castShadow: false,
        receiveShadowForAnalysis: true,
        arrayId: "array-a",
        tags: ["example", "terrain"],
    });
    root.add(ground);
    return root;
}
