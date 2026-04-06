/**
 * Atmosphere: gradient sky dome with sunset horizon for Utah terrain.
 * Large inverted sphere with a CanvasTexture vertical gradient.
 * Warm sunset colors at the horizon blend into the border fog effect.
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
  grad.addColorStop(0.0,  '#1a3878'); // zenith: deep blue
  grad.addColorStop(0.10, '#2850a0'); // bright blue
  grad.addColorStop(0.25, '#4070b8'); // medium blue
  grad.addColorStop(0.35, '#6090cc'); // lighter blue
  grad.addColorStop(0.42, '#90aad0'); // pale sky
  grad.addColorStop(0.46, '#c0b8a8'); // warm haze
  // Sunset horizon band — golden orange fading to warm pink
  grad.addColorStop(0.48, '#d4a878'); // warm golden
  grad.addColorStop(0.495,'#d89868'); // amber
  grad.addColorStop(0.50, '#c88858'); // sunset orange at horizon
  grad.addColorStop(0.505,'#b07858'); // warm brown-orange
  grad.addColorStop(0.52, '#906858'); // fading warm
  // Below horizon: dark ground reflection
  grad.addColorStop(0.56, '#685848'); // muted warm
  grad.addColorStop(0.65, '#4a4038'); // dark warm
  grad.addColorStop(0.80, '#383028'); // darker
  grad.addColorStop(1.0,  '#2a2420'); // dark ground

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

    // Sky dome radius must encompass the full 1:1 metric world (~430km)
    const geo = new THREE.SphereGeometry(500000, 32, 16);
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
