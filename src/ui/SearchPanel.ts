/**
 * SearchPanel — location search overlay.
 * Press `/` to open, type a location name, arrow keys to navigate, Enter to fly there.
 */

import { CITIES } from '@/data/cities';
import { PARKS } from '@/data/parks';
import { geoToWorld } from '@/core/geo/GeoCoord';
import type { GameMap } from '@/core/map/GameMap';

type FlyToFn = (worldX: number, worldZ: number) => void;

interface SearchItem {
  name: string;
  type: 'city' | 'park' | 'landmark';
  parkType?: string;
  hint: string;
  lon: number;
  lat: number;
}

// ~20 iconic Utah landmarks
const LANDMARKS: { name: string; lon: number; lat: number; hint: string }[] = [
  { name: 'Delicate Arch',          lon: -109.499, lat: 38.744, hint: 'Arches NP' },
  { name: 'Angels Landing',         lon: -112.948, lat: 37.269, hint: 'Zion NP' },
  { name: 'Great Salt Lake',        lon: -112.500, lat: 41.100, hint: 'Saline lake' },
  { name: 'Bonneville Salt Flats',  lon: -113.870, lat: 40.760, hint: 'Salt flats' },
  { name: 'Monument Valley',        lon: -110.100, lat: 37.000, hint: 'Navajo Nation' },
  { name: 'Lake Powell',            lon: -110.730, lat: 37.270, hint: 'Reservoir' },
  { name: 'Flaming Gorge',          lon: -109.550, lat: 40.910, hint: 'NE Utah reservoir' },
  { name: 'Bear Lake',              lon: -111.330, lat: 41.960, hint: 'N Utah lake' },
  { name: 'Kings Peak',             lon: -110.373, lat: 40.776, hint: 'Highest point, Uintas' },
  { name: 'Mount Timpanogos',       lon: -111.646, lat: 40.391, hint: 'Wasatch peak' },
  { name: 'Mount Nebo',             lon: -111.760, lat: 39.822, hint: 'Southern Wasatch peak' },
  { name: 'The Narrows',            lon: -112.947, lat: 37.308, hint: 'Zion slot canyon' },
  { name: 'Bryce Amphitheater',     lon: -112.166, lat: 37.624, hint: 'Hoodoo basin' },
  { name: 'Rainbow Bridge',         lon: -110.964, lat: 37.077, hint: 'Natural bridge' },
  { name: 'Goblin Valley',          lon: -110.700, lat: 38.565, hint: 'Hoodoo field' },
  { name: 'Antelope Island',        lon: -112.215, lat: 40.980, hint: 'Great Salt Lake' },
  { name: 'Dead Horse Point',       lon: -109.740, lat: 38.475, hint: 'Mesa overlook' },
  { name: 'Canyonlands Island',     lon: -109.870, lat: 38.390, hint: 'Island in the Sky' },
  { name: 'Capitol Reef Waterpocket', lon: -111.100, lat: 38.100, hint: 'Waterpocket Fold' },
  { name: 'Cedar Breaks',           lon: -112.845, lat: 37.610, hint: 'Amphitheater, 10K ft' },
  { name: 'Fish Lake',              lon: -111.720, lat: 38.550, hint: 'High plateau lake' },
  { name: 'Coral Pink Sand Dunes',  lon: -112.730, lat: 37.030, hint: 'Aeolian dunes' },
];

/** Polygon centroid (simple average of vertices). */
function polygonCentroid(polygon: [number, number][]): { lon: number; lat: number } {
  let sx = 0, sy = 0;
  for (const [lon, lat] of polygon) { sx += lon; sy += lat; }
  const n = polygon.length || 1;
  return { lon: sx / n, lat: sy / n };
}

function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];
  for (const c of CITIES) {
    items.push({
      name: c.name,
      type: 'city',
      hint: c.population >= 1000
        ? `City · pop ${c.population.toLocaleString()}`
        : c.population > 0 ? `Town · pop ${c.population}` : 'Ghost town',
      lon: c.lon, lat: c.lat,
    });
  }
  for (const p of PARKS) {
    const c = polygonCentroid(p.polygon);
    const typeLabel = p.type.replace(/_/g, ' ');
    items.push({
      name: p.name,
      type: 'park',
      parkType: p.type,
      hint: typeLabel.replace(/\b\w/g, (s) => s.toUpperCase()),
      lon: c.lon, lat: c.lat,
    });
  }
  for (const l of LANDMARKS) {
    items.push({
      name: l.name,
      type: 'landmark',
      hint: l.hint,
      lon: l.lon, lat: l.lat,
    });
  }
  return items;
}

function iconFor(type: SearchItem['type']): string {
  if (type === 'city') return 'C';
  if (type === 'park') return 'P';
  return 'L';
}

export class SearchPanel {
  private readonly gameMap: GameMap;
  private readonly onFlyTo: FlyToFn;
  private readonly root: HTMLDivElement;
  private readonly input: HTMLInputElement;
  private readonly list: HTMLDivElement;
  private readonly index: SearchItem[];
  private results: SearchItem[] = [];
  private selected = 0;
  private isOpen = false;
  private readonly styleEl: HTMLStyleElement;

  constructor(gameMap: GameMap, onFlyTo: FlyToFn) {
    this.gameMap = gameMap;
    this.onFlyTo = onFlyTo;
    this.index = buildSearchIndex();

    this.styleEl = document.createElement('style');
    this.styleEl.textContent = SearchPanel.CSS;
    document.head.appendChild(this.styleEl);

    this.root = document.createElement('div');
    this.root.className = 'utah-search-panel';
    this.root.style.display = 'none';

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'utah-search-input';
    this.input.placeholder = 'Search locations...';
    this.input.spellcheck = false;
    this.input.autocomplete = 'off';

    this.list = document.createElement('div');
    this.list.className = 'utah-search-results';

    this.root.appendChild(this.input);
    this.root.appendChild(this.list);

    const overlay = document.getElementById('ui-overlay');
    if (overlay) overlay.appendChild(this.root);
    else document.body.appendChild(this.root);

    this.input.addEventListener('input', () => this.onQuery());
    this.input.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.root.style.display = 'block';
    this.input.value = '';
    this.results = [];
    this.selected = 0;
    this.renderResults();
    // Auto-focus on next frame so the '/' keypress doesn't land in the input.
    requestAnimationFrame(() => this.input.focus());
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.root.style.display = 'none';
    this.input.blur();
  }

  toggle(): void {
    if (this.isOpen) this.close();
    else this.open();
  }

  dispose(): void {
    this.root.remove();
    this.styleEl.remove();
  }

  // ── Internal ────────────────────────────────────────────────────────────
  private onQuery(): void {
    const q = this.input.value.trim().toLowerCase();
    if (!q) {
      this.results = [];
    } else {
      const matches: { item: SearchItem; score: number }[] = [];
      for (const item of this.index) {
        const lower = item.name.toLowerCase();
        const idx = lower.indexOf(q);
        if (idx >= 0) {
          // Prefer prefix matches, then shorter names.
          const score = (idx === 0 ? 0 : 100 + idx) + lower.length * 0.1;
          matches.push({ item, score });
        }
      }
      matches.sort((a, b) => a.score - b.score);
      this.results = matches.slice(0, 8).map((m) => m.item);
    }
    this.selected = 0;
    this.renderResults();
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.results.length) {
        this.selected = (this.selected + 1) % this.results.length;
        this.renderResults();
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.results.length) {
        this.selected = (this.selected - 1 + this.results.length) % this.results.length;
        this.renderResults();
      }
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const item = this.results[this.selected];
      if (item) this.select(item);
    }
  }

  private select(item: SearchItem): void {
    const { x, z } = geoToWorld(item.lon, item.lat);
    this.onFlyTo(x, z);
    this.close();
  }

  private renderResults(): void {
    this.list.innerHTML = '';
    if (!this.results.length) {
      this.list.style.display = 'none';
      return;
    }
    this.list.style.display = 'block';
    this.results.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'utah-search-row' + (i === this.selected ? ' selected' : '');

      const icon = document.createElement('span');
      icon.className = `utah-search-icon utah-search-icon-${item.type}`;
      icon.textContent = iconFor(item.type);

      const name = document.createElement('span');
      name.className = 'utah-search-name';
      name.textContent = item.name;

      const hint = document.createElement('span');
      hint.className = 'utah-search-hint';
      hint.textContent = item.hint;

      row.appendChild(icon);
      row.appendChild(name);
      row.appendChild(hint);

      row.addEventListener('mouseenter', () => {
        this.selected = i;
        this.renderResults();
      });
      row.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.select(item);
      });

      this.list.appendChild(row);
    });
  }

  private static readonly CSS = `
.utah-search-panel {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 480px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  color: #e8e4d8;
  background: rgba(14, 14, 16, 0.92);
  border: 1px solid rgba(196, 91, 40, 0.35);
  border-radius: 6px;
  box-shadow: 0 0 24px rgba(196, 91, 40, 0.18), 0 8px 32px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 50;
}
.utah-search-input {
  width: 100%;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 14px;
  color: #e8e4d8;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(196, 91, 40, 0.25);
  outline: none;
  letter-spacing: 0.5px;
}
.utah-search-input::placeholder {
  color: #6a5a4a;
}
.utah-search-results {
  max-height: 320px;
  overflow-y: auto;
}
.utah-search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  border-left: 2px solid transparent;
}
.utah-search-row.selected {
  background: rgba(196, 91, 40, 0.12);
  border-left-color: #c45b28;
}
.utah-search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 3px;
  flex-shrink: 0;
}
.utah-search-icon-city     { background: #3a5a78; color: #cfe0ef; }
.utah-search-icon-park     { background: #2d5a3d; color: #c0dcc8; }
.utah-search-icon-landmark { background: #c45b28; color: #1a0a04; }
.utah-search-name {
  color: #e8e4d8;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.utah-search-hint {
  color: #7a6a5a;
  font-size: 10px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
`;
}
