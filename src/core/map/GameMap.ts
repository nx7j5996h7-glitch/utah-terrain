import { HexGrid } from '../hex/HexGrid';
import type { HexCoord } from '../hex/HexCoord';
import { hexNeighbors } from '../hex/HexCoord';
import { Tile } from './Tile';
import type { TileData } from './Tile';

/** Central hex-grid tile container for Utah terrain */
export class GameMap {
  readonly grid = new HexGrid<Tile>();
  readonly width: number;
  readonly height: number;

  private _allTilesCache: Tile[] | null = null;
  private _landTilesCache: Tile[] | null = null;
  private _terrainHeights = new Map<string, number>();
  private _hexMaxSlope = new Map<string, number>();
  private _mountainDepths = new Map<string, number>();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /** Load tiles from generated map data */
  loadTiles(tiles: TileData[]): void {
    this.grid.clear();
    this._allTilesCache = null;
    this._landTilesCache = null;

    for (const td of tiles) {
      const tile = new Tile(td);
      this.grid.set(td.q, td.r, tile);
    }
  }

  /** Get tile at (q, r) — O(1) */
  getTile(q: number, r: number): Tile | undefined {
    return this.grid.get(q, r);
  }

  /** Get tile by pre-computed key string — O(1) */
  getTileByKey(key: string): Tile | undefined {
    return this.grid.getByKey(key);
  }

  /** Get tile by HexCoord — O(1) */
  getTileCoord(coord: HexCoord): Tile | undefined {
    return this.grid.get(coord.q, coord.r);
  }

  /** Get all 6 hex neighbors of (q, r) */
  getNeighborTiles(q: number, r: number): Tile[] {
    const neighbors: Tile[] = [];
    const nbs = hexNeighbors({ q, r });
    for (let i = 0; i < nbs.length; i++) {
      const nq = nbs[i].q, nr = nbs[i].r;
      const t = this.grid.get(nq, nr);
      if (t) neighbors.push(t);
    }
    return neighbors;
  }

  /** Zero-allocation neighbor iteration with buffer guard */
  forEachNeighborTile(q: number, r: number, callback: (tile: Tile) => void): void {
    const nbs = hexNeighbors({ q, r });
    for (let i = 0; i < nbs.length; i++) {
      const nq = nbs[i].q, nr = nbs[i].r;
      const t = this.grid.get(nq, nr);
      if (t) callback(t);
    }
  }

  /** All tiles (lazy cached) */
  getAllTiles(): Tile[] {
    if (!this._allTilesCache) {
      this._allTilesCache = Array.from(this.grid.values());
    }
    return this._allTilesCache;
  }

  /** Cached land tiles */
  getLandTiles(): Tile[] {
    if (!this._landTilesCache) {
      this._landTilesCache = [];
      for (const tile of this.grid.values()) {
        if (tile.isLand) this._landTilesCache.push(tile);
      }
    }
    return this._landTilesCache;
  }

  /** Find a city tile by name */
  findCityTile(cityName: string): Tile | undefined {
    for (const tile of this.grid.values()) {
      if (tile.city === cityName) return tile;
    }
    return undefined;
  }

  /** Store terrain heights computed by the rendering layer */
  setTerrainHeights(heights: Map<string, number>): void {
    this._terrainHeights = heights;
  }

  /** Get terrain height at a tile (set by renderer after build) */
  getTerrainHeight(q: number, r: number): number | undefined {
    return this._terrainHeights.get(`${q},${r}`);
  }

  /** Whether terrain heights have been populated */
  get hasTerrainHeights(): boolean {
    return this._terrainHeights.size > 0;
  }

  /** Store max slope values per hex */
  setHexMaxSlopes(slopes: Map<string, number>): void {
    this._hexMaxSlope = slopes;
  }

  /** Get max slope at a hex */
  getHexMaxSlope(q: number, r: number): number | undefined {
    return this._hexMaxSlope.get(`${q},${r}`);
  }

  /** Store mountain depth values per hex */
  setMountainDepths(depths: Map<string, number>): void {
    this._mountainDepths = depths;
  }

  /** Get mountain depth at a hex */
  getMountainDepth(q: number, r: number): number | undefined {
    return this._mountainDepths.get(`${q},${r}`);
  }

  /** Total tile count */
  get tileCount(): number {
    return this.grid.size;
  }
}
