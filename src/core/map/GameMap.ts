import { Tile } from './Tile';
import type { TileData } from './Tile';

/** Grid-based tile container for Utah terrain */
export class GameMap {
  readonly width: number;
  readonly height: number;

  private _tiles = new Map<string, Tile>();
  private _allTilesCache: Tile[] | null = null;
  private _landTilesCache: Tile[] | null = null;
  private _terrainHeights = new Map<string, number>();
  private _mountainDepths = new Map<string, number>();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /** Load tiles from generated map data */
  loadTiles(tiles: TileData[]): void {
    this._tiles.clear();
    this._allTilesCache = null;
    this._landTilesCache = null;

    for (const td of tiles) {
      const tile = new Tile(td);
      this._tiles.set(`${td.q},${td.r}`, tile);
    }
  }

  /** Get tile at (col, row) — O(1) */
  getTile(col: number, row: number): Tile | undefined {
    return this._tiles.get(`${col},${row}`);
  }

  /** Get tile by pre-computed key string — O(1) */
  getTileByKey(key: string): Tile | undefined {
    return this._tiles.get(key);
  }

  /** Get 4-connected grid neighbors */
  getNeighborTiles(col: number, row: number): Tile[] {
    const neighbors: Tile[] = [];
    const offsets = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dc, dr] of offsets) {
      const t = this._tiles.get(`${col + dc},${row + dr}`);
      if (t) neighbors.push(t);
    }
    return neighbors;
  }

  /** All tiles (lazy cached) */
  getAllTiles(): Tile[] {
    if (!this._allTilesCache) {
      this._allTilesCache = Array.from(this._tiles.values());
    }
    return this._allTilesCache;
  }

  /** Cached land tiles */
  getLandTiles(): Tile[] {
    if (!this._landTilesCache) {
      this._landTilesCache = [];
      for (const tile of this._tiles.values()) {
        if (tile.isLand) this._landTilesCache.push(tile);
      }
    }
    return this._landTilesCache;
  }

  /** Find a city tile by name */
  findCityTile(cityName: string): Tile | undefined {
    for (const tile of this._tiles.values()) {
      if (tile.city === cityName) return tile;
    }
    return undefined;
  }

  /** Store terrain heights computed by the rendering layer */
  setTerrainHeights(heights: Map<string, number>): void {
    this._terrainHeights = heights;
  }

  /** Get terrain height at a grid cell */
  getTerrainHeight(col: number, row: number): number | undefined {
    return this._terrainHeights.get(`${col},${row}`);
  }

  /** Whether terrain heights have been populated */
  get hasTerrainHeights(): boolean {
    return this._terrainHeights.size > 0;
  }

  /** Store mountain depth values */
  setMountainDepths(depths: Map<string, number>): void {
    this._mountainDepths = depths;
  }

  /** Get mountain depth at a grid cell */
  getMountainDepth(col: number, row: number): number | undefined {
    return this._mountainDepths.get(`${col},${row}`);
  }

  /** Total tile count */
  get tileCount(): number {
    return this._tiles.size;
  }
}
