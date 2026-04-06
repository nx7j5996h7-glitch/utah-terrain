/**
 * 3D orbit camera for Utah terrain map.
 * PerspectiveCamera + OrbitControls with tilt/rotation clamping.
 * GSAP-powered flyTo() for smooth transitions.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import {
  HEX_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  CAMERA_MIN_DISTANCE,
  CAMERA_MAX_DISTANCE,
  CAMERA_MIN_POLAR,
  CAMERA_MAX_POLAR,
} from '@/constants';
import { hexToPixel } from '@/core/hex/HexUtils';

export class ThreeCamera {
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;

  private _flyTween: gsap.core.Tween | null = null;

  /** Callback fired on OrbitControls 'change' — wire to RenderScheduler */
  onControlsChange: (() => void) | null = null;

  /** Optional terrain height query — set by ThreeRenderer */
  getTerrainHeight: ((x: number, z: number) => number) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 1, 5000);

    // Map center: hex (MAP_WIDTH/2, MAP_HEIGHT/2) → world coords
    const centerHex = { q: Math.floor(MAP_WIDTH / 2), r: Math.floor(MAP_HEIGHT / 2) };
    const centerPixel = hexToPixel(centerHex, HEX_SIZE);
    const cx = centerPixel.x;
    const cz = -centerPixel.y;

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(cx, 0, cz);
    this.controls.minDistance = CAMERA_MIN_DISTANCE;
    this.controls.maxDistance = CAMERA_MAX_DISTANCE;
    this.controls.minPolarAngle = CAMERA_MIN_POLAR;
    this.controls.maxPolarAngle = CAMERA_MAX_POLAR;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = false;
    this.controls.panSpeed = 1.5;
    this.controls.zoomSpeed = 2.0;
    this.controls.rotateSpeed = 0.5;

    // North at top: camera south of center, looking northward (+z)
    // Note: east (+x) appears on screen LEFT at this angle — compass shows true directions
    const initDist = 280;
    const initPolar = 0.8;
    const initAzimuth = Math.PI;
    this.camera.position.set(
      cx + initDist * Math.sin(initPolar) * Math.sin(initAzimuth),
      initDist * Math.cos(initPolar),
      cz + initDist * Math.sin(initPolar) * Math.cos(initAzimuth),
    );

    this.controls.addEventListener('change', () => {
      if (this.onControlsChange) this.onControlsChange();
    });

    this.controls.update();
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getControls(): OrbitControls {
    return this.controls;
  }

  /** Current azimuth angle in radians (for compass HUD). */
  getAzimuthAngle(): number {
    return this.controls.getAzimuthalAngle();
  }

  /**
   * Pan the orbit target by world-space deltas.
   * Moves both target and camera position to keep the offset constant.
   */
  panWorld(dx: number, dz: number): void {
    this.cancelFly();
    this.controls.target.x += dx;
    this.controls.target.z += dz;
    this.camera.position.x += dx;
    this.camera.position.z += dz;
  }

  // Reusable vectors for view-relative pan
  private _panFwd = new THREE.Vector3();
  private _panRight = new THREE.Vector3();
  private static _UP = new THREE.Vector3(0, 1, 0);

  /**
   * Pan relative to the camera's current view direction on the ground plane.
   * Speed is scaled by camera distance for natural feel.
   */
  panViewRelative(forward: number, right: number): void {
    this._panFwd.subVectors(this.controls.target, this.camera.position);
    this._panFwd.y = 0;
    if (this._panFwd.lengthSq() < 0.001) {
      this._panFwd.set(0, 0, -1);
    } else {
      this._panFwd.normalize();
    }

    this._panRight.crossVectors(this._panFwd, ThreeCamera._UP).normalize();

    const camHeight = Math.max(1, this.camera.position.y);
    const distScale = Math.max(0.08, camHeight / 150);

    const dx = (this._panFwd.x * forward + this._panRight.x * right) * distScale;
    const dz = (this._panFwd.z * forward + this._panRight.z * right) * distScale;

    this.panWorld(dx, dz);
  }

  /**
   * Animate camera to fly to a world position.
   * Optionally set the orbit distance and animation duration.
   */
  flyTo(worldX: number, worldZ: number, distance?: number, duration: number = 0.8): void {
    this.cancelFly();

    const target = {
      x: this.controls.target.x,
      y: this.controls.target.y,
      z: this.controls.target.z,
    };
    const camOffset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);

    // Optionally rescale offset to new distance
    if (distance !== undefined) {
      camOffset.normalize().multiplyScalar(distance);
    }

    this._flyTween = gsap.to(target, {
      x: worldX,
      y: 0,
      z: worldZ,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.controls.target.set(target.x, target.y, target.z);
        this.camera.position.set(
          target.x + camOffset.x,
          target.y + camOffset.y,
          target.z + camOffset.z,
        );
      },
      onComplete: () => {
        this._flyTween = null;
      },
    });
  }

  /** Rotate azimuth by delta radians (positive = counter-clockwise from above). */
  rotateAzimuth(delta: number): void {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const cos = Math.cos(delta);
    const sin = Math.sin(delta);
    const newX = offset.x * cos - offset.z * sin;
    const newZ = offset.x * sin + offset.z * cos;
    offset.x = newX;
    offset.z = newZ;
    this.camera.position.copy(this.controls.target).add(offset);
  }

  /** Rotate polar angle by delta radians, clamped to configured bounds. */
  rotatePolar(delta: number): void {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const radius = offset.length();
    const polar = Math.acos(Math.min(1, Math.max(-1, offset.y / radius)));
    const azimuth = Math.atan2(offset.x, offset.z);
    const newPolar = Math.max(CAMERA_MIN_POLAR, Math.min(CAMERA_MAX_POLAR, polar + delta));
    offset.y = radius * Math.cos(newPolar);
    const r = radius * Math.sin(newPolar);
    offset.x = r * Math.sin(azimuth);
    offset.z = r * Math.cos(azimuth);
    this.camera.position.copy(this.controls.target).add(offset);
  }

  /** Update controls. Call every frame. */
  update(dt?: number): void {
    this.controls.update(dt);

    // Clamp camera above terrain to prevent clipping through mountains
    if (!this._flyTween) {
      let minY = 5;
      if (this.getTerrainHeight) {
        const terrainY = this.getTerrainHeight(this.camera.position.x, this.camera.position.z);
        // Always stay at least 8 world units above terrain surface
        minY = Math.max(minY, terrainY + 8);
      }
      if (this.camera.position.y < minY) {
        this.camera.position.y = minY;
      }
    }
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private cancelFly(): void {
    if (this._flyTween) {
      this._flyTween.kill();
      this._flyTween = null;
    }
  }

  dispose(): void {
    this.cancelFly();
    this.controls.dispose();
  }
}
