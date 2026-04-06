import * as THREE from 'three';

// ── Snow configuration ──────────────────────────────────────────────────────
const SNOW_MAX = 2000;
const SNOW_RADIUS = 400;         // horizontal spawn radius around camera
const SNOW_HEIGHT_ABOVE = 200;   // spawn height above camera
const SNOW_HEIGHT_BELOW = 50;    // despawn height below camera
const SNOW_FALL_SPEED = 30;      // world units / sec
const SNOW_WIND_X = 5;
const SNOW_WIND_Z = 3;
const SNOW_MIN_ELEVATION = 20;   // camera Y must exceed this for snow to show
const SNOW_SIZE = 1.5;

// ── Dust configuration ──────────────────────────────────────────────────────
const DUST_MAX = 500;
const DUST_RADIUS = 300;
const DUST_Y_MIN = 0;
const DUST_Y_MAX = 10;
const DUST_DRIFT_SPEED = 8;
const DUST_TURBULENCE = 2;
const DUST_SIZE = 2.0;

export class WeatherParticles {
  private scene: THREE.Scene;
  private enabled = true;

  private snowPoints: THREE.Points;
  private snowPositions: Float32Array;
  private snowVelocities: Float32Array;

  private dustPoints: THREE.Points;
  private dustPositions: Float32Array;
  private dustVelocities: Float32Array;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // ── Snow particle system ──────────────────────────────────────────────
    this.snowPositions = new Float32Array(SNOW_MAX * 3);
    this.snowVelocities = new Float32Array(SNOW_MAX * 3);
    for (let i = 0; i < SNOW_MAX; i++) {
      // Seed positions far away so they initialize into correct band on first update
      this.snowPositions[i * 3 + 0] = (Math.random() - 0.5) * SNOW_RADIUS * 2;
      this.snowPositions[i * 3 + 1] = Math.random() * SNOW_HEIGHT_ABOVE;
      this.snowPositions[i * 3 + 2] = (Math.random() - 0.5) * SNOW_RADIUS * 2;
      this.snowVelocities[i * 3 + 0] = SNOW_WIND_X + (Math.random() - 0.5) * 2;
      this.snowVelocities[i * 3 + 1] = -SNOW_FALL_SPEED * (0.7 + Math.random() * 0.6);
      this.snowVelocities[i * 3 + 2] = SNOW_WIND_Z + (Math.random() - 0.5) * 2;
    }
    const snowGeo = new THREE.BufferGeometry();
    snowGeo.setAttribute('position', new THREE.BufferAttribute(this.snowPositions, 3));
    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: SNOW_SIZE,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    this.snowPoints = new THREE.Points(snowGeo, snowMat);
    this.snowPoints.name = 'weather_snow';
    this.snowPoints.visible = false;
    this.snowPoints.frustumCulled = false;
    this.scene.add(this.snowPoints);

    // ── Dust particle system ──────────────────────────────────────────────
    this.dustPositions = new Float32Array(DUST_MAX * 3);
    this.dustVelocities = new Float32Array(DUST_MAX * 3);
    for (let i = 0; i < DUST_MAX; i++) {
      this.dustPositions[i * 3 + 0] = (Math.random() - 0.5) * DUST_RADIUS * 2;
      this.dustPositions[i * 3 + 1] = DUST_Y_MIN + Math.random() * (DUST_Y_MAX - DUST_Y_MIN);
      this.dustPositions[i * 3 + 2] = (Math.random() - 0.5) * DUST_RADIUS * 2;
      this.dustVelocities[i * 3 + 0] = (Math.random() - 0.3) * DUST_DRIFT_SPEED;
      this.dustVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      this.dustVelocities[i * 3 + 2] = (Math.random() - 0.3) * DUST_DRIFT_SPEED;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xd4b88a,
      size: DUST_SIZE,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    this.dustPoints = new THREE.Points(dustGeo, dustMat);
    this.dustPoints.name = 'weather_dust';
    this.dustPoints.frustumCulled = false;
    this.scene.add(this.dustPoints);
  }

  /** Update particle positions and spawn new particles */
  update(cameraX: number, cameraY: number, cameraZ: number, deltaTime: number): void {
    if (!this.enabled) return;

    const dt = Math.min(deltaTime, 0.1); // clamp delta to avoid huge jumps

    // ── Snow: only active at high elevation ────────────────────────────────
    const snowActive = cameraY > SNOW_MIN_ELEVATION;
    this.snowPoints.visible = snowActive;
    if (snowActive) {
      for (let i = 0; i < SNOW_MAX; i++) {
        const ix = i * 3;
        this.snowPositions[ix + 0] += this.snowVelocities[ix + 0] * dt;
        this.snowPositions[ix + 1] += this.snowVelocities[ix + 1] * dt;
        this.snowPositions[ix + 2] += this.snowVelocities[ix + 2] * dt;

        // Recycle particle if it falls below camera or drifts out of radius
        const relY = this.snowPositions[ix + 1] - cameraY;
        const relX = this.snowPositions[ix + 0] - cameraX;
        const relZ = this.snowPositions[ix + 2] - cameraZ;
        if (
          relY < -SNOW_HEIGHT_BELOW ||
          Math.abs(relX) > SNOW_RADIUS ||
          Math.abs(relZ) > SNOW_RADIUS
        ) {
          this.snowPositions[ix + 0] = cameraX + (Math.random() - 0.5) * SNOW_RADIUS * 2;
          this.snowPositions[ix + 1] = cameraY + SNOW_HEIGHT_ABOVE * (0.5 + Math.random() * 0.5);
          this.snowPositions[ix + 2] = cameraZ + (Math.random() - 0.5) * SNOW_RADIUS * 2;
        }
      }
      (this.snowPoints.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }

    // ── Dust: always active when weather enabled ───────────────────────────
    for (let i = 0; i < DUST_MAX; i++) {
      const ix = i * 3;
      // Turbulence: wobble velocity a bit
      this.dustVelocities[ix + 0] += (Math.random() - 0.5) * DUST_TURBULENCE * dt;
      this.dustVelocities[ix + 2] += (Math.random() - 0.5) * DUST_TURBULENCE * dt;
      // Clamp velocity
      const vx = this.dustVelocities[ix + 0];
      const vz = this.dustVelocities[ix + 2];
      const mag = Math.sqrt(vx * vx + vz * vz);
      if (mag > DUST_DRIFT_SPEED) {
        this.dustVelocities[ix + 0] = (vx / mag) * DUST_DRIFT_SPEED;
        this.dustVelocities[ix + 2] = (vz / mag) * DUST_DRIFT_SPEED;
      }

      this.dustPositions[ix + 0] += this.dustVelocities[ix + 0] * dt;
      this.dustPositions[ix + 1] += this.dustVelocities[ix + 1] * dt;
      this.dustPositions[ix + 2] += this.dustVelocities[ix + 2] * dt;

      // Clamp Y
      if (this.dustPositions[ix + 1] < DUST_Y_MIN) {
        this.dustPositions[ix + 1] = DUST_Y_MIN;
        this.dustVelocities[ix + 1] = Math.abs(this.dustVelocities[ix + 1]);
      } else if (this.dustPositions[ix + 1] > DUST_Y_MAX) {
        this.dustPositions[ix + 1] = DUST_Y_MAX;
        this.dustVelocities[ix + 1] = -Math.abs(this.dustVelocities[ix + 1]);
      }

      // Recycle if out of radius around camera
      const relX = this.dustPositions[ix + 0] - cameraX;
      const relZ = this.dustPositions[ix + 2] - cameraZ;
      if (Math.abs(relX) > DUST_RADIUS || Math.abs(relZ) > DUST_RADIUS) {
        this.dustPositions[ix + 0] = cameraX + (Math.random() - 0.5) * DUST_RADIUS * 2;
        this.dustPositions[ix + 2] = cameraZ + (Math.random() - 0.5) * DUST_RADIUS * 2;
      }
    }
    (this.dustPoints.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.snowPoints.visible = enabled;
    this.dustPoints.visible = enabled;
  }

  dispose(): void {
    this.scene.remove(this.snowPoints);
    this.scene.remove(this.dustPoints);
    this.snowPoints.geometry.dispose();
    (this.snowPoints.material as THREE.Material).dispose();
    this.dustPoints.geometry.dispose();
    (this.dustPoints.material as THREE.Material).dispose();
  }
}
