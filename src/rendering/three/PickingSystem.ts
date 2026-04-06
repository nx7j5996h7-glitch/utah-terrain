import * as THREE from 'three';
import type { GameMap } from '@/core/map/GameMap';
import type { Tile } from '@/core/map/Tile';
import { worldToGeo } from '@/core/geo/GeoCoord';
import { geoToGrid } from '@/core/map/UtahMapData';

export class PickingSystem {
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private hitPoint = new THREE.Vector3();

  constructor(
    private camera: THREE.PerspectiveCamera,
    private terrainMeshes: THREE.Mesh[],
    private gameMap: GameMap,
  ) {}

  /** Pick the tile under a screen-space mouse position (NDC: -1 to 1) */
  pickTile(ndcX: number, ndcY: number): Tile | null {
    const point = this.pickWorldPoint(ndcX, ndcY);
    if (!point) return null;

    // Convert world hit point to geographic, then to grid cell
    const geo = worldToGeo(point.x, point.z);
    const grid = geoToGrid(geo.lon, geo.lat);
    const tile = this.gameMap.getTile(grid.col, grid.row);
    return tile ?? null;
  }

  /** Pick world position under mouse */
  pickWorldPoint(ndcX: number, ndcY: number): THREE.Vector3 | null {
    this.ndc.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.ndc, this.camera);

    // Try terrain meshes first
    if (this.terrainMeshes.length > 0) {
      const hits = this.raycaster.intersectObjects(this.terrainMeshes, false);
      if (hits.length > 0) {
        return hits[0].point.clone();
      }
    }

    // Fallback: ground plane at Y=0
    const hit = this.raycaster.ray.intersectPlane(this.groundPlane, this.hitPoint);
    if (hit) {
      return hit.clone();
    }

    return null;
  }
}
