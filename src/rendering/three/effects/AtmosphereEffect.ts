/**
 * Atmosphere: gradient sky dome for Utah's clear, deep blue desert sky.
 * Large inverted sphere with a CanvasTexture vertical gradient.
 * Follows the camera so the sky always surrounds the viewer.
 */

import * as THREE from 'three';

function createSkyGradientTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);

  // The sphere UV maps top→bottom as zenith→nadir.
  // Horizon is at ~0.5. Below 0.5 is underground.
  // Keep the gradient transitions in the upper half.
  grad.addColorStop(0.0,  '#2850a0'); // zenith: deep clear blue
  grad.addColorStop(0.15, '#4070b8'); // bright blue
  grad.addColorStop(0.30, '#6090cc'); // medium blue
  grad.addColorStop(0.40, '#88aad8'); // lighter blue
  grad.addColorStop(0.45, '#a8bcd8'); // pale sky
  grad.addColorStop(0.48, '#c0c8cc'); // slight haze near horizon
  grad.addColorStop(0.50, '#c8c4b8'); // horizon: subtle warm
  // Below horizon: dark ground reflection, NOT orange
  grad.addColorStop(0.55, '#8a8478'); // muted warm grey
  grad.addColorStop(0.70, '#5a5550'); // dark
  grad.addColorStop(1.0,  '#3a3530'); // dark ground

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

export class AtmosphereEffect {
  private skyMesh: THREE.Mesh;
  private skyTexture: THREE.CanvasTexture;
  private camera: THREE.PerspectiveCamera;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.skyTexture = createSkyGradientTexture();

    const geo = new THREE.SphereGeometry(3000, 32, 16);
    const mat = new THREE.MeshBasicMaterial({
      map: this.skyTexture,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.skyMesh = new THREE.Mesh(geo, mat);
    this.skyMesh.frustumCulled = false;
    this.skyMesh.renderOrder = -1;
    scene.add(this.skyMesh);
  }

  /** Keep sky centered on camera each frame */
  update(): void {
    this.skyMesh.position.copy(this.camera.position);
  }

  dispose(): void {
    this.skyMesh.geometry.dispose();
    (this.skyMesh.material as THREE.MeshBasicMaterial).dispose();
    this.skyTexture.dispose();
    this.skyMesh.removeFromParent();
  }
}
