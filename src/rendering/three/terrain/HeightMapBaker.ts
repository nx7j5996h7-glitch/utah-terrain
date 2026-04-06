import * as THREE from 'three';
import type { GameMap } from '@/core/map/GameMap';
import { hexToPixel } from '@/core/hex/HexUtils';
import { HEX_SIZE, MAP_WIDTH, MAP_HEIGHT } from '@/constants';

// ---------------------------------------------------------------------------
// HeightMapBaker — bakes terrain heights into an R-channel DataTexture
// for per-pixel analytical normal computation in the fragment shader.
//
// Two-pass approach:
//   Pass 1: scan all texels for min/max height
//   Pass 2: normalize to 0-255 and write texture
//
// The shader can reconstruct world-space height via:
//   h = uHeightMapRange.x + (sample.r) * uHeightMapRange.y
// where uHeightMapRange = vec2(minH, rangeH)
// ---------------------------------------------------------------------------

const RESOLUTION = 1024;

/** Compute the world-space bounding box of the hex map. */
function computeWorldBounds(): { minX: number; minZ: number; maxX: number; maxZ: number } {
  const origin = hexToPixel({ q: 0, r: 0 }, HEX_SIZE);
  const corner = hexToPixel({ q: MAP_WIDTH - 1, r: MAP_HEIGHT - 1 }, HEX_SIZE);
  const minX = Math.min(origin.x, corner.x) - HEX_SIZE;
  const maxX = Math.max(origin.x, corner.x) + HEX_SIZE;
  const minY = Math.min(origin.y, corner.y) - HEX_SIZE;
  const maxY = Math.max(origin.y, corner.y) + HEX_SIZE;
  return { minX, minZ: -maxY, maxX, maxZ: -minY };
}

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
