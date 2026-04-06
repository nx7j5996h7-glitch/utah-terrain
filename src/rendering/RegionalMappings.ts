/**
 * Shared region→tint mapping tables used by both RegionalFeatureMap (GPU texture)
 * and TerrainMeshBuilder (CPU vertex colors). Centralized here to prevent drift.
 */

import { MOUNTAIN_RANGES } from '@/data/mountains';
import { REGIONS } from '@/data/regions';
import {
  TINT_NONE, TINT_WASATCH, TINT_UINTA, TINT_GREAT_BASIN,
  TINT_COLORADO_PLATEAU, TINT_GRAND_STAIRCASE, TINT_MOJAVE,
  TINT_HIGH_PLATEAUS, TINT_UINTA_BASIN,
} from '@/constants';

/** Region name → tint index */
export const REGION_TINT: Record<string, number> = {
  'Great Basin': TINT_GREAT_BASIN,
  'Wasatch Front': TINT_WASATCH,
  'Uinta Basin': TINT_UINTA_BASIN,
  'Colorado Plateau North': TINT_COLORADO_PLATEAU,
  'Colorado Plateau South': TINT_COLORADO_PLATEAU,
  'Grand Staircase': TINT_GRAND_STAIRCASE,
  'High Plateaus': TINT_HIGH_PLATEAUS,
  'Mojave Fringe': TINT_MOJAVE,
  'Northern Wasatch-Uinta': TINT_UINTA,
};

/** Per-range ridge angle entries for directional mountain noise */
export interface RangeRidgeAngle {
  rangeIndex: number;
  angle: number; // radians
}

export const RANGE_RIDGE_ANGLES: RangeRidgeAngle[] = MOUNTAIN_RANGES.map((range, i) => ({
  rangeIndex: i,
  angle: range.ridgeAngle !== undefined ? (range.ridgeAngle * Math.PI / 180) : 0,
})).filter(e => e.angle !== 0 || MOUNTAIN_RANGES[e.rangeIndex].ridgeAngle === 0);

/** Tint colors — subtle hue shifts per region */
export const TINT_COLORS: Record<number, [number, number, number]> = {
  [TINT_NONE]: [0, 0, 0],
  [TINT_WASATCH]: [-0.02, -0.01, 0.03],       // Cool grey limestone
  [TINT_UINTA]: [0.04, -0.02, 0.02],          // Red-purple quartzite
  [TINT_GREAT_BASIN]: [0.02, 0.02, -0.01],    // Pale tan alkali
  [TINT_COLORADO_PLATEAU]: [0.06, -0.02, -0.04], // Warm red-orange sandstone
  [TINT_GRAND_STAIRCASE]: [0.04, -0.01, -0.03],  // Multi-band warm
  [TINT_MOJAVE]: [0.03, 0.01, -0.02],         // Warm gold-tan
  [TINT_HIGH_PLATEAUS]: [-0.03, 0.03, -0.01], // Deep green forest
  [TINT_UINTA_BASIN]: [0.01, 0.0, -0.01],     // Dusty grey-brown
};
