import * as THREE from 'three';
import { hexToPixel, hexCorners } from '@/core/hex/HexUtils';
import { HEX_SIZE } from '@/constants';
import type { GameMap } from '@/core/map/GameMap';

// ═══════════════════════════════════════════════════════════════════════════
// GridOverlay — Hex grid wireframe overlay (toggled with G key)
// ═══════════════════════════════════════════════════════════════════════════

export class GridOverlay {
  private scene: THREE.Scene;
  private group = new THREE.Group();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group.name = 'grid_overlay';
    this.group.visible = false;
    this.scene.add(this.group);
  }

  build(
    gameMap: GameMap,
    scene: THREE.Scene,
    heightSampler: (wx: number, wz: number) => number | undefined,
  ): void {
    // Track which edges have been drawn to avoid duplicates.
    // Edge key: sorted pair of vertex positions rounded to avoid float issues.
    const drawnEdges = new Set<string>();
    const positions: number[] = [];
    const Y_OFFSET = 0.15;

    for (const tile of gameMap.getLandTiles()) {
      const pixel = hexToPixel({ q: tile.q, r: tile.r }, HEX_SIZE);
      const cx = pixel.x;
      const cz = -pixel.y;

      const corners = hexCorners({ x: cx, y: pixel.y }, HEX_SIZE);

      for (let i = 0; i < 6; i++) {
        const j = (i + 1) % 6;
        const c0 = corners[i];
        const c1 = corners[j];

        // World positions for corners
        const x0 = c0.x;
        const z0 = -c0.y;
        const x1 = c1.x;
        const z1 = -c1.y;

        // Create edge key from sorted rounded positions
        const k0 = `${Math.round(x0 * 10)},${Math.round(z0 * 10)}`;
        const k1 = `${Math.round(x1 * 10)},${Math.round(z1 * 10)}`;
        const edgeKey = k0 < k1 ? `${k0}|${k1}` : `${k1}|${k0}`;

        if (drawnEdges.has(edgeKey)) continue;
        drawnEdges.add(edgeKey);

        // Sample heights at edge endpoints
        const y0 = (heightSampler(x0, z0) ?? 0) + Y_OFFSET;
        const y1 = (heightSampler(x1, z1) ?? 0) + Y_OFFSET;

        positions.push(x0, y0, z0, x1, y1, z1);
      }
    }

    if (positions.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
      });
      const lines = new THREE.LineSegments(geometry, material);
      lines.name = 'hex_grid';
      this.group.add(lines);
    }
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  dispose(): void {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.LineSegments) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) obj.material.dispose();
      }
    });
    this.scene.remove(this.group);
  }
}
