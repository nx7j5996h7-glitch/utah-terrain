/**
 * Axial hex coordinate system for flat-top hexagons.
 * q = column, r = row
 */
export interface HexCoord {
  readonly q: number;
  readonly r: number;
}

export function hexKey(q: number, r: number): string {
  return `${q},${r}`;
}

export function hexFromKey(key: string): HexCoord {
  // Avoids split/map array allocations — parseInt stops at the comma
  const comma = key.indexOf(',');
  return { q: parseInt(key, 10), r: parseInt(key.substring(comma + 1), 10) };
}

export function hexEquals(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r;
}

/** Cube coordinates for hex math */
export interface CubeCoord {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export function axialToCube(hex: HexCoord): CubeCoord {
  return { x: hex.q, z: hex.r, y: -hex.q - hex.r };
}

export function cubeToAxial(cube: CubeCoord): HexCoord {
  return { q: cube.x, r: cube.z };
}

export function cubeRound(x: number, y: number, z: number): CubeCoord {
  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);

  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return { x: rx, y: ry, z: rz };
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  // Inlined cube distance — avoids allocating 2 intermediate CubeCoord objects.
  // cube: x=q, z=r, y=-q-r → diffs: |dq|, |dr|, |dq+dr|
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
}

/** Six flat-top hex neighbor directions */
const FLAT_TOP_DIRECTIONS: readonly HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

// Reusable neighbor buffer to avoid allocation in hot paths
const _neighborBuf: HexCoord[] = [];
for (let i = 0; i < 6; i++) _neighborBuf.push({ q: 0, r: 0 });

/**
 * Returns the 6 neighbors of a hex.
 * WARNING: Returns a shared buffer — do NOT store the reference or individual coords.
 * Copy if you need to keep them: [...hexNeighbors(h)] or hexNeighbors(h).map(n => ({...n}))
 */
export function hexNeighbors(hex: HexCoord): HexCoord[] {
  for (let i = 0; i < 6; i++) {
    (_neighborBuf[i] as { q: number; r: number }).q = hex.q + FLAT_TOP_DIRECTIONS[i].q;
    (_neighborBuf[i] as { q: number; r: number }).r = hex.r + FLAT_TOP_DIRECTIONS[i].r;
  }
  return _neighborBuf;
}

// Reusable single-neighbor buffer
const _singleNeighbor: { q: number; r: number } = { q: 0, r: 0 };

/**
 * Returns a single neighbor in the given direction.
 * WARNING: Returns a shared buffer — copy if you need to keep it.
 */
export function hexNeighbor(hex: HexCoord, direction: number): HexCoord {
  const d = FLAT_TOP_DIRECTIONS[direction % 6];
  _singleNeighbor.q = hex.q + d.q;
  _singleNeighbor.r = hex.r + d.r;
  return _singleNeighbor;
}

export function hexRing(center: HexCoord, radius: number): HexCoord[] {
  if (radius === 0) return [center];

  const results: HexCoord[] = [];
  let hex: HexCoord = { q: center.q + radius, r: center.r };

  for (let side = 0; side < 6; side++) {
    for (let step = 0; step < radius; step++) {
      results.push({ q: hex.q, r: hex.r });
      const n = hexNeighbor(hex, (side + 2) % 6);
      hex = { q: n.q, r: n.r };
    }
  }
  return results;
}

export function hexesInRange(center: HexCoord, range: number): HexCoord[] {
  const results: HexCoord[] = [];
  for (let q = -range; q <= range; q++) {
    for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
      results.push({ q: center.q + q, r: center.r + r });
    }
  }
  return results;
}

/**
 * Iterate over hexes in range without allocating an array.
 * Calls `callback(q, r)` for each hex in range of center.
 */
export function forEachHexInRange(
  center: HexCoord,
  range: number,
  callback: (q: number, r: number) => void,
): void {
  for (let q = -range; q <= range; q++) {
    for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
      callback(center.q + q, center.r + r);
    }
  }
}
