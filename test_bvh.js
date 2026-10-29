import * as THREE from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial();
const mesh = new THREE.Mesh(geometry, material);

const raycaster = new THREE.Raycaster();
const intersects = [];
try {
  mesh.raycast(raycaster, intersects);
  console.log("Success! Intersects length:", intersects.length);
} catch (e) {
  console.error("Error:", e);
}
