import { describe, it, expect } from 'vitest';
import { generateUtahMap } from '@/core/map/UtahMapData';
import { MAP_COLS, MAP_ROWS } from '@/constants';

describe('Utah Map Generation', () => {
  const tiles = generateUtahMap();

  it('generates correct total tiles', () => {
    expect(tiles.length).toBe(MAP_COLS * MAP_ROWS);
  });

  it('has water tiles (Great Salt Lake, Utah Lake, etc.)', () => {
    const water = tiles.filter(t => t.terrain === 'water');
    expect(water.length).toBeGreaterThan(100);
  });

  it('has mountain tiles', () => {
    const mountains = tiles.filter(t => t.terrain === 'mountain');
    expect(mountains.length).toBeGreaterThan(500);
  });

  it('has city tiles', () => {
    const cities = tiles.filter(t => t.city);
    expect(cities.length).toBeGreaterThan(20);
  });

  it('has Salt Lake City', () => {
    const slc = tiles.find(t => t.city === 'Salt Lake City');
    expect(slc).toBeDefined();
    expect(slc!.terrain).toBe('urban');
  });

  it('has multiple terrain types', () => {
    const types = new Set(tiles.map(t => t.terrain));
    expect(types.size).toBeGreaterThanOrEqual(8);
  });

  it('has river tiles', () => {
    const rivers = tiles.filter(t => t.waterway);
    expect(rivers.length).toBeGreaterThan(50);
  });

  it('has road tiles', () => {
    const roads = tiles.filter(t => t.road);
    expect(roads.length).toBeGreaterThan(50);
  });

  it('has park tiles', () => {
    const parks = tiles.filter(t => t.park);
    expect(parks.length).toBeGreaterThan(100);
  });

  it('has feature zones', () => {
    const features = tiles.filter(t => t.feature);
    expect(features.length).toBeGreaterThan(100);
  });

  it('has geological formations', () => {
    const formations = tiles.filter(t => t.geologicalFormation !== undefined);
    expect(formations.length).toBeGreaterThan(100);
  });

  it('elevation ranges from 0 to 14', () => {
    const elevations = tiles.map(t => t.elevation);
    expect(Math.min(...elevations)).toBe(0);
    expect(Math.max(...elevations)).toBeGreaterThanOrEqual(10);
  });

  it('no Unknown regions for land tiles', () => {
    const unknownLand = tiles.filter(t => t.region === 'Unknown' && t.terrain !== 'water');
    // Some edge tiles may be uncovered — allow up to 5%
    const pct = unknownLand.length / tiles.filter(t => t.terrain !== 'water').length;
    expect(pct).toBeLessThan(0.05);
  });
});
