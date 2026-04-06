/**
 * Keyboard camera controls for the Utah terrain map.
 * WASD/arrows pan, Q/E rotate azimuth, F/C tilt polar, +/- zoom.
 * Mouse controls (drag-orbit, right-drag-pan, scroll-zoom) are handled by OrbitControls.
 */

import { ThreeCamera } from '@/rendering/three/ThreeCamera';
import { CAMERA_PAN_SPEED } from '@/constants';

/** Base rotation speed in radians per frame (calibrated to 120fps) */
const ROTATE_SPEED = 0.012;

/** Zoom factor per frame (calibrated to 120fps, applied via pow for frame independence) */
const ZOOM_FACTOR = 1.02;

export class CameraControls {
  private threeCamera: ThreeCamera;
  private keys = new Set<string>();
  private _onKeyDown: (e: KeyboardEvent) => void;
  private _onKeyUp: (e: KeyboardEvent) => void;
  private _onBlur: () => void;

  /** Callback fired when keyboard input moves the camera — wire to RenderScheduler */
  onKeyMove: (() => void) | null = null;

  constructor(threeCamera: ThreeCamera) {
    this.threeCamera = threeCamera;

    this._onKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      this.keys.add(e.code);
    };

    this._onKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.code);
    };

    this._onBlur = () => {
      this.keys.clear();
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
  }

  /**
   * Process active keys and apply camera movements.
   * @param dt Delta time in seconds
   */
  update(dt: number): void {
    if (this.keys.size === 0) return;

    // Frame-rate independence: calibrated to 120fps (dt=1/120)
    const dtScale = dt * 120;

    // Pan speed scales with camera HEIGHT (actual Y position, not orbit distance)
    // This matches Aveneg's behavior — high camera = fast pan, low camera = precise
    const camY = Math.max(10, this.threeCamera.camera.position.y);
    const panSpeed = CAMERA_PAN_SPEED * dtScale * (camY / 8000); // scaled for 1:1 metric

    const rotateSpeed = ROTATE_SPEED * dtScale;

    let moved = false;

    // WASD / arrow key panning (view-relative on ground plane)
    let fwd = 0;
    let right = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) fwd += panSpeed;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) fwd -= panSpeed;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) right += panSpeed;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) right -= panSpeed;

    if (fwd !== 0 || right !== 0) {
      this.threeCamera.panViewRelative(fwd, right);
      moved = true;
    }

    // Q/E: rotate azimuth
    if (this.keys.has('KeyQ')) { this.threeCamera.rotateAzimuth(rotateSpeed); moved = true; }
    if (this.keys.has('KeyE')) { this.threeCamera.rotateAzimuth(-rotateSpeed); moved = true; }

    // F/C: tilt polar angle
    if (this.keys.has('KeyF')) { this.threeCamera.rotatePolar(rotateSpeed); moved = true; }
    if (this.keys.has('KeyC')) { this.threeCamera.rotatePolar(-rotateSpeed); moved = true; }

    // +/- zoom: adjust orbit distance (frame-rate-independent via pow)
    if (this.keys.has('Equal') || this.keys.has('NumpadAdd')) {
      const factor = Math.pow(ZOOM_FACTOR, dtScale);
      this.zoomBy(1 / factor);
      moved = true;
    }
    if (this.keys.has('Minus') || this.keys.has('NumpadSubtract')) {
      const factor = Math.pow(ZOOM_FACTOR, dtScale);
      this.zoomBy(factor);
      moved = true;
    }

    if (moved && this.onKeyMove) this.onKeyMove();
  }

  /** Scale the orbit distance by a factor (< 1 zooms in, > 1 zooms out). */
  private zoomBy(factor: number): void {
    const controls = this.threeCamera.controls;
    const offset = this.threeCamera.camera.position.clone().sub(controls.target);
    const newDist = offset.length() * factor;
    const clamped = Math.max(controls.minDistance, Math.min(controls.maxDistance, newDist));
    offset.normalize().multiplyScalar(clamped);
    this.threeCamera.camera.position.copy(controls.target).add(offset);
  }

  dispose(): void {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
    this.keys.clear();
  }
}
