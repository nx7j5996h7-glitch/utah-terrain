/**
 * ParkBoundaries.ts — Renders park boundary outlines on the terrain surface.
 *
 * Creates colored line loops slightly above the terrain for each park in PARKS data.
 * Line style and color vary by park type.
 */

import * as THREE from 'three';
import { PARKS, type ParkDef } from '@/data/parks';
import { HEX_SIZE, UTAH_WEST, UTAH_NORTH, DEG_PER_HEX_LON, DEG_PER_HEX_LAT, SQRT3 } from '@/constants';

// ── Color by park type ──────────────────────────────────────────────────────

const TYPE_COLORS: Record<ParkDef['type'], number> = {
  national_park:            0x22aa22,
  national_monument:        0xdd8833,
  state_park:               0xddcc33,
  national_forest:          0x226622,
  national_recreation_area: 0x3388cc,
};

// ── Height offset above terrain ─────────────────────────────────────────────

const Y_OFFSET = 0.5;

// ── Geo → world conversion (continuous hex math, same as RiverMap) ──────────

function geoToWorld(lon: number, lat: number): { x: number; z: number } {
  const q = (lon - UTAH_WEST) / DEG_PER_HEX_LON;
  const r = (UTAH_NORTH - lat) / DEG_PER_HEX_LAT;
  const px = -HEX_SIZE * 1.5 * q;
  const py = HEX_SIZE * (SQRT3 / 2 * q + SQRT3 * r);
  return { x: px, z: -py };
}

// ═════════════════════════════════════════════════════════════════════════════
// ParkBoundaries
// ═════════════════════════════════════════════════════════════════════════════

export class ParkBoundaries {
  private scene: THREE.Scene;
  private group: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'park_boundaries';
    this.scene.add(this.group);
  }

  build(scene: THREE.Scene, getTerrainY?: (wx: number, wz: number) => number): void {
    this.dispose();
    this.group = new THREE.Group();
    this.group.name = 'park_boundaries';
    this.scene.add(this.group);

    for (const park of PARKS) {
      const line = this.buildParkLine(park, getTerrainY);
      if (line) {
        this.group.add(line);
      }
    }
  }

  private buildParkLine(
    park: ParkDef,
    getTerrainY?: (wx: number, wz: number) => number,
  ): THREE.LineSegments | THREE.LineLoop | null {
    if (park.polygon.length < 3) return null;

    const color = TYPE_COLORS[park.type] ?? 0xffffff;
    const isDashed = park.type === 'national_forest';

    const points: THREE.Vector3[] = [];
    for (const [lon, lat] of park.polygon) {
      const { x, z } = geoToWorld(lon, lat);
      let y = 0;
      if (getTerrainY) {
        const sampled = getTerrainY(x, z);
        if (sampled !== undefined) y = sampled;
      }
      points.push(new THREE.Vector3(x, y + Y_OFFSET, z));
    }

    if (isDashed) {
      return this.buildDashedLine(park.name, points, color);
    }

    return this.buildSolidLine(park.name, points, color);
  }

  private buildSolidLine(
    name: string,
    points: THREE.Vector3[],
    color: number,
  ): THREE.LineLoop {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color,
      linewidth: 1,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });

    const line = new THREE.LineLoop(geometry, material);
    line.name = `park_boundary_${name}`;
    line.renderOrder = 10;
    return line;
  }

  private buildDashedLine(
    name: string,
    points: THREE.Vector3[],
    color: number,
  ): THREE.LineSegments {
    const closed = [...points, points[0]];

    const dashVerts: THREE.Vector3[] = [];
    const dashRatio = 0.6;
    const segmentLength = 12;

    for (let i = 0; i < closed.length - 1; i++) {
      const a = closed[i];
      const b = closed[i + 1];
      const edgeLen = a.distanceTo(b);
      const dir = new THREE.Vector3().subVectors(b, a).normalize();

      let traveled = 0;
      while (traveled < edgeLen) {
        const dashEnd = Math.min(traveled + segmentLength * dashRatio, edgeLen);
        const gapEnd = Math.min(dashEnd + segmentLength * (1 - dashRatio), edgeLen);

        dashVerts.push(
          new THREE.Vector3().copy(a).addScaledVector(dir, traveled),
          new THREE.Vector3().copy(a).addScaledVector(dir, dashEnd),
        );

        traveled = gapEnd;
      }
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(dashVerts);

    const material = new THREE.LineBasicMaterial({
      color,
      linewidth: 1,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });

    const line = new THREE.LineSegments(geometry, material);
    line.name = `park_boundary_${name}`;
    line.renderOrder = 10;
    return line;
  }

  dispose(): void {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.LineSegments || obj instanceof THREE.LineLoop) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      }
    });
    this.scene.remove(this.group);
  }
}
