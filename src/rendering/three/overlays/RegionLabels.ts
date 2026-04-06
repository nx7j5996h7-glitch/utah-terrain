import * as THREE from 'three';
import type { GameMap } from '@/core/map/GameMap';
import { REGIONS } from '@/data/regions';
import { HEX_SIZE, UTAH_WEST, UTAH_NORTH, DEG_PER_HEX_LON, DEG_PER_HEX_LAT, SQRT3 } from '@/constants';

// ── Geo → world conversion (continuous hex math) ──────────────────────────

function geoToWorld(lon: number, lat: number): { x: number; z: number } {
  const q = (lon - UTAH_WEST) / DEG_PER_HEX_LON;
  const r = (UTAH_NORTH - lat) / DEG_PER_HEX_LAT;
  const px = -HEX_SIZE * 1.5 * q;
  const py = HEX_SIZE * (SQRT3 / 2 * q + SQRT3 * r);
  return { x: px, z: -py };
}

// ── Region display config ──────────────────────────────────────────────────

interface RegionDisplayDef {
  regionName: string;
  displayName: string;
  color: string;
  yOffset: number;
}

const REGION_DISPLAY: RegionDisplayDef[] = [
  { regionName: 'Great Basin',            displayName: 'GREAT BASIN',       color: '#D8C098', yOffset: 65 },
  { regionName: 'Wasatch Front',          displayName: 'WASATCH FRONT',     color: '#8B9A6B', yOffset: 70 },
  { regionName: 'Uinta Basin',            displayName: 'UINTA BASIN',       color: '#8B9A6B', yOffset: 60 },
  { regionName: 'Colorado Plateau North', displayName: 'COLORADO PLATEAU',  color: '#C45B28', yOffset: 55 },
  { regionName: 'Grand Staircase',        displayName: 'GRAND STAIRCASE',   color: '#C45B28', yOffset: 50 },
  { regionName: 'High Plateaus',          displayName: 'HIGH PLATEAUS',     color: '#2D5A3D', yOffset: 75 },
  { regionName: 'Mojave Fringe',          displayName: 'MOJAVE FRINGE',     color: '#D8C098', yOffset: 55 },
];

// ── LOD thresholds ─────────────────────────────────────────────────────────

const FADE_IN_DIST  = 500;
const FADE_OUT_DIST = 300;

// ── Text sprite helper ─────────────────────────────────────────────────────

function makeRegionSprite(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const fontSize = 48;
  const letterSpacing = 8;

  ctx.font = `bold ${fontSize}px sans-serif`;
  let totalWidth = 0;
  for (let i = 0; i < text.length; i++) {
    totalWidth += ctx.measureText(text[i]).width + (i < text.length - 1 ? letterSpacing : 0);
  }

  const padX = fontSize;
  const padY = fontSize * 0.5;
  canvas.width = Math.ceil(totalWidth + padX * 2);
  canvas.height = Math.ceil(fontSize * 1.6 + padY * 2);

  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textBaseline = 'middle';

  const startX = padX;
  const centerY = canvas.height / 2;

  let curX = startX;
  for (let i = 0; i < text.length; i++) {
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeText(text[i], curX, centerY);

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.4;
    ctx.fillText(text[i], curX, centerY);
    ctx.globalAlpha = 1.0;

    curX += ctx.measureText(text[i]).width + letterSpacing;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    sizeAttenuation: true,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.renderOrder = 100;

  const aspect = canvas.width / canvas.height;
  const scale = 80;
  sprite.scale.set(scale * aspect, scale, 1);

  return sprite;
}

// ═══════════════════════════════════════════════════════════════════════════
// RegionLabels
// ═══════════════════════════════════════════════════════════════════════════

export class RegionLabels {
  private scene: THREE.Scene;
  private group = new THREE.Group();
  private sprites: THREE.Sprite[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group.name = 'region_labels';
    this.scene.add(this.group);
  }

  build(gameMap: GameMap, scene: THREE.Scene): void {
    for (const display of REGION_DISPLAY) {
      const region = REGIONS.find(r => r.name === display.regionName);
      if (!region) continue;

      let sumLon = 0;
      let sumLat = 0;
      for (const [lon, lat] of region.polygon) {
        sumLon += lon;
        sumLat += lat;
      }
      const centLon = sumLon / region.polygon.length;
      const centLat = sumLat / region.polygon.length;

      const { x, z } = geoToWorld(centLon, centLat);

      const sprite = makeRegionSprite(display.displayName, display.color);
      sprite.position.set(x, display.yOffset, z);
      this.group.add(sprite);
      this.sprites.push(sprite);
    }
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  updateLOD(cameraDist: number): void {
    if (cameraDist > FADE_IN_DIST) {
      for (const s of this.sprites) {
        s.visible = true;
        (s.material as THREE.SpriteMaterial).opacity = 1.0;
      }
    } else if (cameraDist > FADE_OUT_DIST) {
      const t = (cameraDist - FADE_OUT_DIST) / (FADE_IN_DIST - FADE_OUT_DIST);
      for (const s of this.sprites) {
        s.visible = true;
        (s.material as THREE.SpriteMaterial).opacity = t;
      }
    } else {
      for (const s of this.sprites) {
        s.visible = false;
      }
    }
  }

  dispose(): void {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Sprite) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    });
    this.scene.remove(this.group);
    this.sprites.length = 0;
  }
}
