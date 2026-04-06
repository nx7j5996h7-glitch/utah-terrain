import * as THREE from 'three';
import { CITIES, type CityDef } from '@/data/cities';
import { geoToWorld } from '@/core/geo/GeoCoord';
import type { GameMap } from '@/core/map/GameMap';

// ── Population tier thresholds ─────────────────────────────────────────────
const TIER_LARGE  = 50_000;
const TIER_MEDIUM = 10_000;
const TIER_SMALL  = 5_000;

// ── LOD distances ──────────────────────────────────────────────────────────
const LABEL_DIST_LARGE = 70000;  // 70km — visible from far overview
const LABEL_DIST_SMALL = 35000;  // 35km
const MARKER_DIST      = 130000; // 130km

interface CityEntry {
  marker: THREE.Mesh;
  label: THREE.Sprite;
  worldX: number;
  worldY: number;
  worldZ: number;
  population: number;
}

// ── Text sprite helper ─────────────────────────────────────────────────────

function makeTextSprite(
  text: string,
  fontSize: number,
  spriteScale: number,
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const font = `bold ${fontSize}px sans-serif`;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;

  const padX = fontSize * 0.5;
  const padY = fontSize * 0.4;
  canvas.width = Math.ceil(textWidth + padX * 2);
  canvas.height = Math.ceil(fontSize * 1.4 + padY * 2);

  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 3;
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: false,  // Always render on top — labels should never be hidden by terrain
    sizeAttenuation: true,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.renderOrder = 100; // Render after all terrain/water/vegetation

  const aspect = canvas.width / canvas.height;
  sprite.scale.set(spriteScale * aspect, spriteScale, 1);

  return sprite;
}

// ═══════════════════════════════════════════════════════════════════════════
// CityMarkers
// ═══════════════════════════════════════════════════════════════════════════

export class CityMarkers {
  private scene: THREE.Scene;
  private group = new THREE.Group();
  private entries: CityEntry[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group.name = 'city_markers';
    this.scene.add(this.group);
  }

  build(gameMap: GameMap): void {
    for (const city of CITIES) {
      // Skip tiny cities by default — they become visible when zoomed in
      if (city.population < TIER_SMALL && city.population > 0) continue;

      const tile = gameMap.findCityTile(city.name);

      let x: number, z: number, y: number;

      const world = geoToWorld(city.lon, city.lat);
      x = world.x;
      z = world.z;
      if (tile) {
        const th = gameMap.getTerrainHeight(tile.q, tile.r);
        y = th !== undefined ? th : 0;
      } else {
        y = 0;
      }

      // ── Marker mesh (pin) ──────────────────────────────────────────────
      let markerGeo: THREE.BufferGeometry;
      let markerColor: number;

      const isSLC = city.name === 'Salt Lake City';

      if (isSLC) {
        markerGeo = new THREE.BoxGeometry(1.2, 3, 1.2);
        markerColor = 0xFFF8E8;
      } else if (city.population > TIER_LARGE) {
        markerGeo = new THREE.BoxGeometry(0.8, 2, 0.8);
        markerColor = 0xF0E8DC;
      } else if (city.population > TIER_MEDIUM) {
        markerGeo = new THREE.BoxGeometry(0.5, 1.5, 0.5);
        markerColor = 0xD0D0D0;
      } else {
        markerGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8);
        markerColor = 0xA0A0A0;
      }

      const markerMat = new THREE.MeshStandardMaterial({
        color: markerColor,
        emissive: markerColor,
        emissiveIntensity: isSLC ? 0.35 : 0.15,
        roughness: 0.6,
      });

      const marker = new THREE.Mesh(markerGeo, markerMat);
      const halfH = ((markerGeo as unknown as { parameters?: { height?: number } }).parameters?.height ?? 1) / 2;
      marker.position.set(x, y + halfH, z);
      this.group.add(marker);

      // ── Text label ─────────────────────────────────────────────────────
      let fontSize: number;
      let spriteScale: number;

      if (isSLC) {
        fontSize = 36;
        spriteScale = 14;
      } else if (city.population > TIER_LARGE) {
        fontSize = 28;
        spriteScale = 10;
      } else if (city.population > TIER_MEDIUM) {
        fontSize = 22;
        spriteScale = 7;
      } else {
        fontSize = 16;
        spriteScale = 5;
      }

      const label = makeTextSprite(city.name, fontSize, spriteScale);
      const labelY = y + halfH * 2 + spriteScale * 0.3;
      label.position.set(x, labelY, z);
      this.group.add(label);

      this.entries.push({
        marker,
        label,
        worldX: x,
        worldY: y,
        worldZ: z,
        population: city.population,
      });
    }
  }

  updateLOD(cameraX: number, cameraY: number, cameraZ: number): void {
    for (const entry of this.entries) {
      const dx = cameraX - entry.worldX;
      const dy = cameraY - entry.worldY;
      const dz = cameraZ - entry.worldZ;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const isLargeCity = entry.population > TIER_LARGE;
      const labelDist = isLargeCity ? LABEL_DIST_LARGE : LABEL_DIST_SMALL;

      entry.label.visible = dist < labelDist;
      entry.marker.visible = dist < MARKER_DIST;
    }
  }

  dispose(): void {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) obj.material.dispose();
      }
      if (obj instanceof THREE.Sprite) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    });
    this.scene.remove(this.group);
    this.entries.length = 0;
  }
}
