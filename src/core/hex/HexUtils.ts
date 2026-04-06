import { HexCoord, cubeRound, cubeToAxial } from './HexCoord';

/**
 * Flat-top hex pixel conversions.
 * size = distance from center to vertex
 */

const SQRT3 = Math.sqrt(3);
const SQRT3_HALF = SQRT3 / 2;
const SQRT3_THIRD = SQRT3 / 3;

export function hexToPixel(hex: HexCoord, size: number): { x: number; y: number } {
  // Negate x so that when worldZ = -pixel.y (camera looking north at azimuth=PI),
  // screen-right = -x = increasing q = east. This gives north-at-top + east-on-right.
  const x = -size * ((3 / 2) * hex.q);
  const y = size * (SQRT3_HALF * hex.q + SQRT3 * hex.r);
  return { x, y };
}

/** Write hex→pixel into a pre-allocated output buffer (avoids allocation in hot paths). */
export function hexToPixelOut(
  hex: HexCoord,
  size: number,
  out: { x: number; y: number },
): void {
  out.x = -size * ((3 / 2) * hex.q);
  out.y = size * (SQRT3_HALF * hex.q + SQRT3 * hex.r);
}

export function pixelToHex(x: number, y: number, size: number): HexCoord {
  // Negate x to match hexToPixel's negated x output
  const nx = -x;
  const q = ((2 / 3) * nx) / size;
  const r = ((-1 / 3) * nx + SQRT3_THIRD * y) / size;
  const cube = cubeRound(q, -q - r, r);
  return cubeToAxial(cube);
}

/** Write pixel→hex into a pre-allocated output buffer (avoids 2 object allocations in hot paths). */
export function pixelToHexOut(x: number, y: number, size: number, out: { q: number; r: number }): void {
  const nx = -x;
  const fq = ((2 / 3) * nx) / size;
  const fr = ((-1 / 3) * nx + SQRT3_THIRD * y) / size;
  const fy = -fq - fr;
  // Inline cubeRound + cubeToAxial — avoids intermediate object allocations
  let rx = Math.round(fq), ry = Math.round(fy), rz = Math.round(fr);
  const xd = Math.abs(rx - fq), yd = Math.abs(ry - fy), zd = Math.abs(rz - fr);
  if (xd > yd && xd > zd) rx = -ry - rz;
  else if (yd > zd) ry = -rx - rz;
  else rz = -rx - ry;
  out.q = rx;
  out.r = rz;
}

// Precompute the 6 flat-top hex corner unit vectors
const HEX_CORNER_COS = new Float64Array(6);
const HEX_CORNER_SIN = new Float64Array(6);
for (let i = 0; i < 6; i++) {
  const rad = (Math.PI / 180) * (60 * i);
  HEX_CORNER_COS[i] = Math.cos(rad);
  HEX_CORNER_SIN[i] = Math.sin(rad);
}

/** Returns the 6 corner points of a flat-top hexagon */
export function hexCorners(
  center: { x: number; y: number },
  size: number,
): { x: number; y: number }[] {
  const corners: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    corners.push({
      x: center.x + size * HEX_CORNER_COS[i],
      y: center.y + size * HEX_CORNER_SIN[i],
    });
  }
  return corners;
}

export function hexWidth(size: number): number {
  return size * 2;
}

export function hexHeight(size: number): number {
  return SQRT3 * size;
}
