import * as THREE from "three";

export function createPost(height, radius, material) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 14), material);
  post.name = "support-post";
  post.userData.simulationKind = "post";
  post.position.y = height / 2;
  post.castShadow = true;
  post.receiveShadow = true;
  return post;
}
