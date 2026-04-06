/**
 * Decorative hex plates outside the map boundary (Civ-style map edge).
 * Forms a dark bowl/staircase rising outward, fading to deep black.
 * Every hex has noise and side walls -- no flat rings.
 */

import * as THREE from 'three';
import { HEX_SIZE, TERRAIN_COLORS } from '@/constants';
import type { GameMap } from '@/core/map/GameMap';
import type { Tile } from '@/core/map/Tile';
import { hexKey } from '@/core/hex/HexCoord';
import { hexToPixel } from '@/core/hex/HexUtils';
import { valueNoise2D } from '@/rendering/ProceduralNoise';

/** Total rings of hex plates outside the map boundary. */
const NUM_RINGS = 25;

// Flat-top hex neighbor offsets (axial coordinates)
const NEIGHBOR_DQ = [1, 1, 0, -1, -1, 0];
const NEIGHBOR_DR = [0, -1, -1, 0, 1, 1];

// Flat-top hex corner unit vectors: corner_i at angle 60*i degrees
const CORNER_DX = new Float64Array(6);
const CORNER_DZ = new Float64Array(6);
for (let i = 0; i < 6; i++) {
  const angle = (Math.PI / 180) * (60 * i);
  CORNER_DX[i] = Math.cos(angle);
  CORNER_DZ[i] = Math.sin(angle);
}

const BASE_HEIGHT = 0.5;
const WALL_BASE_Y = -2.0;
const RIM_HEIGHT = 200;

// Pre-parse terrain hex colors to [r, g, b] in 0-1 range
const TERRAIN_RGB_CACHE: Record<string, [number, number, number]> = {};
for (const [key, hex] of Object.entries(TERRAIN_COLORS)) {
  TERRAIN_RGB_CACHE[key] = [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

/** Rings where color is pure nearest-tile terrain color (no fade). */
const COLOR_PURE_RINGS = 3;

/** Deep black at the outermost rim. */
const RIM_COLOR: [number, number, number] = [0.02, 0.02, 0.02];

interface BorderHex {
  q: number;
  r: number;
  ring: number;
  nearestTile: Tile;
}

export class BorderHexMesh {
  readonly mesh: THREE.Mesh;
  private material: THREE.MeshStandardMaterial;

  constructor() {
    this.material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0,
      side: THREE.FrontSide,
    });
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), this.material);
    this.mesh.frustumCulled = false;
  }

  build(gameMap: GameMap): void {
    this.mesh.geometry.dispose();

    const tiles = gameMap.getAllTiles();
    if (tiles.length === 0) {
      this.mesh.geometry = new THREE.BufferGeometry();
      return;
    }

    // Build set of all map-interior hex keys for fast lookup
    const mapKeys = new Set<string>();
    for (const t of tiles) mapKeys.add(hexKey(t.q, t.r));
    const borderHexes = new Map<string, BorderHex>();

    // Phase 1: find boundary hexes (map tiles with >=1 missing neighbor)
    for (const t of tiles) {
      let isBoundary = false;
      for (let d = 0; d < 6; d++) {
        if (!mapKeys.has(hexKey(t.q + NEIGHBOR_DQ[d], t.r + NEIGHBOR_DR[d]))) {
          isBoundary = true;
          break;
        }
      }
      if (isBoundary) {
        borderHexes.set(hexKey(t.q, t.r), { q: t.q, r: t.r, ring: 0, nearestTile: t });
      }
    }

    // Phase 2: BFS ring 1 (immediate outside neighbors of boundary tiles)
    for (const bh of borderHexes.values()) {
      if (bh.ring !== 0) continue;
      for (let d = 0; d < 6; d++) {
        const nq = bh.q + NEIGHBOR_DQ[d];
        const nr = bh.r + NEIGHBOR_DR[d];
        const key = hexKey(nq, nr);
        if (!mapKeys.has(key) && !borderHexes.has(key)) {
          borderHexes.set(key, { q: nq, r: nr, ring: 1, nearestTile: bh.nearestTile });
        }
      }
    }

    // Phase 3: BFS rings 2..NUM_RINGS
    let frontier = [...borderHexes.values()].filter(bh => bh.ring === 1);
    for (let ring = 2; ring <= NUM_RINGS; ring++) {
      const nextFrontier: BorderHex[] = [];
      for (const bh of frontier) {
        for (let d = 0; d < 6; d++) {
          const nq = bh.q + NEIGHBOR_DQ[d];
          const nr = bh.r + NEIGHBOR_DR[d];
          const key = hexKey(nq, nr);
          if (!mapKeys.has(key) && !borderHexes.has(key)) {
            const entry: BorderHex = { q: nq, r: nr, ring, nearestTile: bh.nearestTile };
            borderHexes.set(key, entry);
            nextFrontier.push(entry);
          }
        }
      }
      frontier = nextFrontier;
    }

    // Phase 4: build merged geometry
    // Per hex: 13 verts (center + 6 top + 6 bottom), 18 tris (6 top + 12 wall)
    const hexCount = borderHexes.size;
    const totalVerts = hexCount * 13;
    const totalIndices = hexCount * 18 * 3;

    const positions = new Float32Array(totalVerts * 3);
    const colors = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    const indices = new Uint32Array(totalIndices);
    let vi = 0, ii = 0;
    const hexColorInfo: { key: string; ring: number; baseVi: number }[] = [];

    for (const bh of borderHexes.values()) {
      const { q, r, ring, nearestTile } = bh;

      // Hex center in world space: pixel.x → x, pixel.y → -z
      const pixel = hexToPixel({ q, r }, HEX_SIZE);
      const cx = pixel.x, cz = -pixel.y;
      const y = this.computeHeight(cx, cz, q, r, ring, nearestTile);
      const [cr, cg, cb] = this.computeColor(cx, cz, ring, nearestTile);
      const baseVi = vi;
      hexColorInfo.push({ key: hexKey(q, r), ring, baseVi });

      // Top face center
      positions[vi * 3] = cx; positions[vi * 3 + 1] = y; positions[vi * 3 + 2] = cz;
      normals[vi * 3 + 1] = 1;
      colors[vi * 3] = cr; colors[vi * 3 + 1] = cg; colors[vi * 3 + 2] = cb;
      vi++;

      // Top face corners
      for (let c = 0; c < 6; c++) {
        positions[vi * 3] = cx + HEX_SIZE * CORNER_DX[c];
        positions[vi * 3 + 1] = y;
        positions[vi * 3 + 2] = cz + HEX_SIZE * CORNER_DZ[c];
        normals[vi * 3 + 1] = 1;
        colors[vi * 3] = cr; colors[vi * 3 + 1] = cg; colors[vi * 3 + 2] = cb;
        vi++;
      }

      for (let c = 0; c < 6; c++) {
        indices[ii++] = baseVi;
        indices[ii++] = baseVi + 1 + (c + 1) % 6;
        indices[ii++] = baseVi + 1 + c;
      }

      // Wall bottom corners
      for (let c = 0; c < 6; c++) {
        positions[vi * 3] = cx + HEX_SIZE * CORNER_DX[c];
        positions[vi * 3 + 1] = WALL_BASE_Y;
        positions[vi * 3 + 2] = cz + HEX_SIZE * CORNER_DZ[c];
        normals[vi * 3 + 1] = 1;
        colors[vi * 3] = cr * 0.4; colors[vi * 3 + 1] = cg * 0.4; colors[vi * 3 + 2] = cb * 0.4;
        vi++;
      }

      for (let c = 0; c < 6; c++) {
        const tc = baseVi + 1 + c;
        const tn = baseVi + 1 + (c + 1) % 6;
        const bc = baseVi + 7 + c;
        const bn = baseVi + 7 + (c + 1) % 6;
        indices[ii++] = tc; indices[ii++] = tn; indices[ii++] = bc;
        indices[ii++] = bc; indices[ii++] = tn; indices[ii++] = bn;
      }
    }

    // Phase 5: lateral color smoothing (rings 0-1 anchored, rest blends)
    const keyToIdx = new Map<string, number>();
    for (let i = 0; i < hexColorInfo.length; i++) keyToIdx.set(hexColorInfo[i].key, i);
    const SMOOTH_PASSES = 50;
    const prevR = new Float32Array(hexColorInfo.length);
    const prevG = new Float32Array(hexColorInfo.length);
    const prevB = new Float32Array(hexColorInfo.length);

    for (let pass = 0; pass < SMOOTH_PASSES; pass++) {
      for (let i = 0; i < hexColorInfo.length; i++) {
        const ci = hexColorInfo[i].baseVi * 3;
        prevR[i] = colors[ci];
        prevG[i] = colors[ci + 1];
        prevB[i] = colors[ci + 2];
      }

      for (let i = 0; i < hexColorInfo.length; i++) {
        const { key, ring, baseVi: bv } = hexColorInfo[i];
        if (ring < 2) continue; // anchor rings keep their color

        const comma = key.indexOf(',');
        const hq = parseInt(key.substring(0, comma));
        const hr = parseInt(key.substring(comma + 1));

        let sumR = prevR[i], sumG = prevG[i], sumB = prevB[i], count = 1;
        for (let d = 0; d < 6; d++) {
          const ni = keyToIdx.get(hexKey(hq + NEIGHBOR_DQ[d], hr + NEIGHBOR_DR[d]));
          if (ni !== undefined) { sumR += prevR[ni]; sumG += prevG[ni]; sumB += prevB[ni]; count++; }
        }
        const factor = Math.min(1.0, 0.3 + (ring - 2) * 0.175);
        const avgR = sumR / count, avgG = sumG / count, avgB = sumB / count;
        const newR = prevR[i] + (avgR - prevR[i]) * factor;
        const newG = prevG[i] + (avgG - prevG[i]) * factor;
        const newB = prevB[i] + (avgB - prevB[i]) * factor;
        for (let v = 0; v < 7; v++) {
          const ci = (bv + v) * 3;
          colors[ci] = newR; colors[ci + 1] = newG; colors[ci + 2] = newB;
        }
        for (let v = 7; v < 13; v++) {
          const ci = (bv + v) * 3;
          colors[ci] = newR * 0.4; colors[ci + 1] = newG * 0.4; colors[ci + 2] = newB * 0.4;
        }
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setIndex(new THREE.BufferAttribute(indices, 1));
    geom.computeBoundingBox();
    geom.computeBoundingSphere();

    this.mesh.geometry = geom;
  }

  private computeHeight(
    cx: number, cz: number, q: number, r: number,
    ring: number, nearestTile: Tile,
  ): number {
    const high = ((q + r) % 2 === 0);

    // 4 octaves of value noise for organic variation
    const n1 = valueNoise2D(cx * 0.003, cz * 0.003, 8811);
    const n2 = valueNoise2D(cx * 0.01, cz * 0.01, 3377);
    const n3 = valueNoise2D(cx * 0.035, cz * 0.035, 5599);
    const n4 = valueNoise2D(cx * 0.08, cz * 0.08, 9213);
    const noise = n1 * 0.4 + n2 * 0.3 + n3 * 0.2 + n4 * 0.1;
    const chaos = (noise * noise - 0.15) * 16.0;

    // Continuous bowl curve rising toward the rim
    const t = Math.min(1, ring / NUM_RINGS);
    const bowlBase = BASE_HEIGHT + (RIM_HEIGHT - BASE_HEIGHT) * t * t;

    // Alternating height offset fades with distance
    const altAmp = Math.max(0, 2.5 - ring * 0.08);
    const alt = high ? altAmp : -altAmp * 0.5;

    // Noise intensity peaks mid-ring, fades to 70% at outer edge
    const PEAK_RING = 10;
    const noisePeak = 2.0 + PEAK_RING * 1.5;
    let noiseScale: number;
    if (ring <= PEAK_RING) {
      noiseScale = 2.0 + ring * 1.5;
    } else {
      const fadeT = (ring - PEAK_RING) / (NUM_RINGS - PEAK_RING);
      noiseScale = noisePeak * (0.7 + 0.3 * (1 - fadeT));
    }

    // Ring 0 = boundary tiles on the map edge — match terrain elevation
    if (ring === 0) {
      let edgeY = nearestTile.elevation * 0.8;
      edgeY = Math.max(0.5, Math.min(edgeY, 6.0));
      return Math.max(edgeY + 1.5, bowlBase + 1.0) + Math.abs(alt) + Math.abs(chaos) * 1.5;
    }

    return bowlBase + alt + chaos * noiseScale;
  }

  private computeColor(
    cx: number, cz: number, ring: number, nearestTile: Tile,
  ): [number, number, number] {
    const isWater = nearestTile.terrain === 'water';
    // Water tiles use a brighter blue to match the water plane
    const rgb = isWater
      ? [0.10, 0.30, 0.52] as [number, number, number]
      : (TERRAIN_RGB_CACHE[nearestTile.terrain] ?? [0.45, 0.40, 0.35]);

    const avg = (rgb[0] + rgb[1] + rgb[2]) / 3;
    const desat = isWater ? 0.1 : 0.25;
    const tileR = rgb[0] * (1 - desat) + avg * desat;
    const tileG = rgb[1] * (1 - desat) + avg * desat;
    const tileB = rgb[2] * (1 - desat) + avg * desat;

    // Multi-octave color noise — intensity scales with ring distance
    const cn1 = valueNoise2D(cx * 0.006, cz * 0.006, 4421);
    const cn2 = valueNoise2D(cx * 0.02, cz * 0.02, 7733);
    const cn = cn1 * 0.6 + cn2 * 0.4;
    // Noise jitter grows with ring: ~2 at ring 4, ~8 at ring 16, ~10 at ring 25
    const noiseAmp = 2 + ring * 0.3;
    const ringNoise = (cn - 0.5) * 2 * noiseAmp;

    // Inner rings keep pure terrain color with slight variation
    if (ring <= COLOR_PURE_RINGS) {
      const darken = 1.0 - ring * 0.05;
      const bright = 1.0 + (cn - 0.5) * 0.2;
      return [tileR * darken * bright, tileG * darken * bright, tileB * darken * bright];
    }

    // Outer rings blend toward deep black — steep initial darkening, long tail
    const effectiveRing = ring + ringNoise;
    const tLinear = Math.max(0, Math.min(1, (effectiveRing - COLOR_PURE_RINGS) / (NUM_RINGS - COLOR_PURE_RINGS)));
    const tCurve = Math.pow(tLinear, 0.3);
    return [
      tileR + (RIM_COLOR[0] - tileR) * tCurve,
      tileG + (RIM_COLOR[1] - tileG) * tCurve,
      tileB + (RIM_COLOR[2] - tileB) * tCurve,
    ];
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
