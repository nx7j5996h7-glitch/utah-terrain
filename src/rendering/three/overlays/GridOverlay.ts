import * as THREE from 'three';
import type { GameMap } from '@/core/map/GameMap';

/**
 * GridOverlay — Stub. Hex grid overlay removed with hex geometry system.
 * Kept as a no-op to avoid breaking ThreeRenderer toggle code.
 */
export class GridOverlay {
  private group = new THREE.Group();

  constructor(scene: THREE.Scene) {
    this.group.name = 'grid_overlay';
    this.group.visible = false;
    scene.add(this.group);
  }

  build(
    _gameMap: GameMap,
    _scene: THREE.Scene,
    _heightSampler: (wx: number, wz: number) => number | undefined,
  ): void {
    // No-op — hex grid overlay removed
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  dispose(): void {
    this.group.parent?.remove(this.group);
  }
}
