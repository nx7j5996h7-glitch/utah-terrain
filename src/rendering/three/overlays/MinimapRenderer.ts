/**
 * MinimapRenderer — 2D canvas overlay showing the entire Utah state.
 * - Pre-renders the static terrain once from GameMap tiles using hex coordinates.
 * - Separate overlay canvas updates each frame with the camera viewport rect.
 * - Click the minimap to fly the camera to that world position.
 */

import { MAP_WIDTH, MAP_HEIGHT, TERRAIN_COLORS, HEX_SIZE, SQRT3 } from '@/constants';
import type { TerrainType } from '@/constants';
import type { GameMap } from '@/core/map/GameMap';
import { hexToPixel } from '@/core/hex/HexUtils';

const MINIMAP_W = 200;
const MINIMAP_H = 160;

// Compute world bounds from hex grid dimensions
// Flat-top hex: x = HEX_SIZE * 1.5 * q, y = HEX_SIZE * (sqrt3/2 * q + sqrt3 * r)
const WORLD_WIDTH_APPROX = HEX_SIZE * 1.5 * MAP_WIDTH;
const WORLD_DEPTH_APPROX = HEX_SIZE * SQRT3 * MAP_HEIGHT;

export class MinimapRenderer {
  private readonly root: HTMLDivElement;
  private readonly baseCanvas: HTMLCanvasElement;
  private readonly overlayCanvas: HTMLCanvasElement;
  private readonly baseCtx: CanvasRenderingContext2D;
  private readonly overlayCtx: CanvasRenderingContext2D;
  private readonly styleEl: HTMLStyleElement;

  private onJump: ((worldX: number, worldZ: number) => void) | null = null;
  private worldWidth = WORLD_WIDTH_APPROX;
  private worldDepth = WORLD_DEPTH_APPROX;

  constructor() {
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = MinimapRenderer.CSS;
    document.head.appendChild(this.styleEl);

    this.root = document.createElement('div');
    this.root.className = 'utah-minimap';
    this.root.style.width = `${MINIMAP_W}px`;
    this.root.style.height = `${MINIMAP_H}px`;

    this.baseCanvas = document.createElement('canvas');
    this.baseCanvas.width = MINIMAP_W;
    this.baseCanvas.height = MINIMAP_H;
    this.baseCanvas.className = 'utah-minimap-base';

    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.width = MINIMAP_W;
    this.overlayCanvas.height = MINIMAP_H;
    this.overlayCanvas.className = 'utah-minimap-overlay';

    const bctx = this.baseCanvas.getContext('2d');
    const octx = this.overlayCanvas.getContext('2d');
    if (!bctx || !octx) throw new Error('MinimapRenderer: 2D context unavailable');
    this.baseCtx = bctx;
    this.overlayCtx = octx;

    this.baseCtx.fillStyle = '#1a1a1a';
    this.baseCtx.fillRect(0, 0, MINIMAP_W, MINIMAP_H);

    this.root.appendChild(this.baseCanvas);
    this.root.appendChild(this.overlayCanvas);

    const overlay = document.getElementById('ui-overlay');
    if (overlay) overlay.appendChild(this.root);
    else document.body.appendChild(this.root);

    this.overlayCanvas.addEventListener('click', (e) => this.onClick(e));
  }

  setOnJump(fn: (worldX: number, worldZ: number) => void): void {
    this.onJump = fn;
  }

  build(gameMap: GameMap): void {
    const ctx = this.baseCtx;

    ctx.fillStyle = TERRAIN_COLORS.water;
    ctx.fillRect(0, 0, MINIMAP_W, MINIMAP_H);

    // Compute actual world bounds from all tiles
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    const allTiles = gameMap.getAllTiles();
    const tilePixels: { px: number; py: number; terrain: TerrainType }[] = [];

    for (const tile of allTiles) {
      const pixel = hexToPixel({ q: tile.q, r: tile.r }, HEX_SIZE);
      const px = pixel.x;
      const py = pixel.y;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
      tilePixels.push({ px, py, terrain: tile.terrain });
    }

    // Add padding for hex radius
    minX -= HEX_SIZE;
    maxX += HEX_SIZE;
    minY -= HEX_SIZE;
    maxY += HEX_SIZE;

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;

    // Store actual world bounds for viewport/click mapping
    this.worldWidth = rangeX;
    this.worldDepth = rangeY;

    // Draw each tile as a small colored dot/rect
    const dotW = Math.max(2, MINIMAP_W / MAP_WIDTH);
    const dotH = Math.max(2, MINIMAP_H / MAP_HEIGHT);

    for (const { px, py, terrain } of tilePixels) {
      const mx = ((px - minX) / rangeX) * MINIMAP_W;
      const my = ((py - minY) / rangeY) * MINIMAP_H;

      ctx.fillStyle = TERRAIN_COLORS[terrain] ?? '#000000';
      ctx.fillRect(mx - dotW / 2, my - dotH / 2, dotW, dotH);
    }
  }

  updateViewport(worldX: number, worldZ: number, cameraDist: number): void {
    const ctx = this.overlayCtx;
    ctx.clearRect(0, 0, MINIMAP_W, MINIMAP_H);

    // World x maps to minimap x, world z (negative) maps to minimap y
    const px = (worldX / this.worldWidth) * MINIMAP_W;
    const pz = (-worldZ / this.worldDepth) * MINIMAP_H;

    const halfWorld = Math.max(cameraDist * 0.6, 50);
    const halfW = (halfWorld / this.worldWidth) * MINIMAP_W;
    const halfH = (halfWorld / this.worldDepth) * MINIMAP_H;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px - halfW, pz - halfH, halfW * 2, halfH * 2);

    ctx.fillStyle = '#c45b28';
    ctx.beginPath();
    ctx.arc(px, pz, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  setVisible(visible: boolean): void {
    this.root.style.display = visible ? 'block' : 'none';
  }

  dispose(): void {
    this.root.remove();
    this.styleEl.remove();
  }

  private onClick(e: MouseEvent): void {
    if (!this.onJump) return;
    const rect = this.overlayCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldX = (x / MINIMAP_W) * this.worldWidth;
    const worldZ = -((y / MINIMAP_H) * this.worldDepth);
    this.onJump(worldX, worldZ);
  }

  private static readonly CSS = `
.utah-minimap {
  position: fixed;
  right: 16px;
  bottom: 16px;
  border: 1px solid rgba(196, 91, 40, 0.35);
  border-radius: 4px;
  background: rgba(14, 14, 16, 0.92);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  padding: 4px;
  z-index: 40;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.utah-minimap-base,
.utah-minimap-overlay {
  position: absolute;
  top: 4px;
  left: 4px;
  display: block;
  border-radius: 2px;
}
.utah-minimap-overlay {
  cursor: crosshair;
}
.utah-minimap-overlay:hover {
  outline: 1px solid rgba(196, 91, 40, 0.5);
}
`;
}
