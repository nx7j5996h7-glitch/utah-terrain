import * as THREE from 'three';
import type { GameMap } from '@/core/map/GameMap';
import { computeWorldBounds } from '@/core/geo/GeoCoord';

const RESOLUTION = 1024;

export class HeightMapBaker {
  private texture: THREE.DataTexture | null = null;
  private bounds = new THREE.Vector4(0, 0, 1, 1);
  private range = new THREE.Vector2(0, 1); // (minH, rangeH)

  build(
    _gameMap: GameMap,
    heightSampler: (wx: number, wz: number) => number | undefined,
  ): void {
    const wb = computeWorldBounds();
    this.bounds.set(wb.minX, wb.minZ, wb.maxX, wb.maxZ);

    const rangeX = wb.maxX - wb.minX;
    const rangeZ = wb.maxZ - wb.minZ;
    const totalTexels = RESOLUTION * RESOLUTION;

    const getH = (wx: number, wz: number): number => heightSampler(wx, wz) ?? 0;

    // -- Pass 1: sample all heights, find min/max -------------------------
    const rawHeights = new Float32Array(totalTexels);
    let minH = Infinity;
    let maxH = -Infinity;

    for (let py = 0; py < RESOLUTION; py++) {
      const v = py / (RESOLUTION - 1);
      const wz = wb.minZ + v * rangeZ;

      for (let px = 0; px < RESOLUTION; px++) {
        const u = px / (RESOLUTION - 1);
        const wx = wb.minX + u * rangeX;
        const h = getH(wx, wz);
        const idx = py * RESOLUTION + px;
        rawHeights[idx] = h;
        if (h < minH) minH = h;
        if (h > maxH) maxH = h;
      }
    }

    const heightRange = maxH - minH;
    const invRange = heightRange > 0 ? 1 / heightRange : 0;
    this.range.set(minH, heightRange);

    // -- Pass 2: normalize to 0-255 and write R-channel texture -----------
    const data = new Uint8Array(totalTexels);
    for (let i = 0; i < totalTexels; i++) {
      const normalized = (rawHeights[i] - minH) * invRange;
      data[i] = Math.max(0, Math.min(255, Math.round(normalized * 255)));
    }

    this.texture = new THREE.DataTexture(
      data,
      RESOLUTION,
      RESOLUTION,
      THREE.RedFormat,
      THREE.UnsignedByteType,
    );
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.needsUpdate = true;
  }

  getTexture(): THREE.DataTexture {
    if (!this.texture) throw new Error('HeightMapBaker: call build() first');
    return this.texture;
  }

  getBounds(): THREE.Vector4 {
    return this.bounds;
  }

  /** Returns vec2(minH, rangeH) for shader denormalization */
  getRange(): THREE.Vector2 {
    return this.range;
  }

  dispose(): void {
    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }
  }
}
