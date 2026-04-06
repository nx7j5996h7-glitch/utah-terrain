import type { TerrainType, TerrainFeature } from '@/constants';

/** Immutable tile data from map generation */
export interface TileData {
  readonly q: number;
  readonly r: number;
  readonly terrain: TerrainType;
  readonly region: string;        // e.g. 'Great Basin', 'Colorado Plateau South'
  readonly elevation: number;     // 0-15
  readonly city?: string;
  readonly waterway?: string;
  readonly road?: string;
  readonly roadType?: 'interstate' | 'highway' | 'road';
  readonly feature?: TerrainFeature;
  readonly park?: string;         // park name if in a park boundary
  readonly parkType?: 'national_park' | 'national_monument' | 'state_park' | 'national_forest' | 'national_recreation_area';
  readonly formation?: number;    // geological formation index
  readonly waterColor?: string;   // override water color (e.g. pink GSL north arm)
}

export class Tile implements TileData {
  readonly q: number;
  readonly r: number;
  readonly terrain: TerrainType;
  readonly region: string;
  readonly elevation: number;
  readonly city?: string;
  readonly waterway?: string;
  readonly road?: string;
  readonly roadType?: 'interstate' | 'highway' | 'road';
  readonly feature?: TerrainFeature;
  readonly park?: string;
  readonly parkType?: TileData['parkType'];
  readonly formation?: number;
  readonly waterColor?: string;

  constructor(data: TileData) {
    this.q = data.q;
    this.r = data.r;
    this.terrain = data.terrain;
    this.region = data.region;
    this.elevation = data.elevation;
    this.city = data.city;
    this.waterway = data.waterway;
    this.road = data.road;
    this.roadType = data.roadType;
    this.feature = data.feature;
    this.park = data.park;
    this.parkType = data.parkType;
    this.formation = data.formation;
    this.waterColor = data.waterColor;
  }

  // Cached coord for hex lookups
  private _coord: { q: number; r: number } | null = null;
  get coord(): { q: number; r: number } {
    if (!this._coord) this._coord = { q: this.q, r: this.r };
    return this._coord;
  }

  get isWater(): boolean { return this.terrain === 'water'; }
  get isLand(): boolean { return this.terrain !== 'water'; }
  get isCity(): boolean { return !!this.city; }
  get hasRoad(): boolean { return !!this.road; }
}
