import './style.css';
import { MAP_WIDTH, MAP_HEIGHT } from '@/constants';
import { ThreeRenderer } from '@/rendering/three/ThreeRenderer';
import { PickingSystem } from '@/rendering/three/PickingSystem';
import { CameraControls } from '@/input/CameraControls';
import { Tooltip } from '@/ui/Tooltip';
import { InfoPanel } from '@/ui/InfoPanel';
import { SearchPanel } from '@/ui/SearchPanel';
import { LegendPanel } from '@/ui/LegendPanel';
import { MinimapRenderer } from '@/rendering/three/overlays/MinimapRenderer';
import { CompassHUD } from '@/ui/CompassHUD';

// Loading screen helpers
function setLoadingProgress(pct: number, status: string): void {
  const bar = document.getElementById('loading-bar');
  const statusEl = document.getElementById('loading-status');
  if (bar) bar.style.width = `${pct}%`;
  if (statusEl) statusEl.textContent = status;
}

function dismissLoading(): void {
  const screen = document.getElementById('loading-screen');
  if (screen) {
    screen.classList.add('hidden');
    setTimeout(() => screen.remove(), 600);
  }
}

async function init(): Promise<void> {
  // Load real USGS elevation data before anything else
  setLoadingProgress(2, 'Loading elevation data...');
  const { loadHeightmap } = await import('@/rendering/RealHeightMap');
  await loadHeightmap();
  setLoadingProgress(8, 'Elevation data loaded');

  setLoadingProgress(10, 'Generating map data...');

  // Phase 1: Generate Utah map data
  const { generateUtahMap } = await import('@/core/map/UtahMapData');
  const tileData = generateUtahMap();
  setLoadingProgress(15, `Generated ${tileData.length} tiles`);

  // Phase 2: Create GameMap
  const { GameMap } = await import('@/core/map/GameMap');
  const gameMap = new GameMap(MAP_WIDTH, MAP_HEIGHT);
  gameMap.loadTiles(tileData);
  setLoadingProgress(20, 'Map loaded');

  // Phase 3: Initialize Three.js renderer
  setLoadingProgress(30, 'Initializing renderer...');
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) throw new Error('Canvas element #game-canvas not found');

  const renderer = new ThreeRenderer();
  renderer.init(canvas);
  setLoadingProgress(40, 'Renderer initialized');

  // Phase 4: Build terrain mesh
  setLoadingProgress(50, 'Building terrain...');
  await renderer.buildTerrain(gameMap);
  setLoadingProgress(90, 'Terrain built');

  // Log map stats
  const landTiles = gameMap.getLandTiles();
  const waterTiles = gameMap.getAllTiles().filter(t => t.isWater);
  const cities = gameMap.getAllTiles().filter(t => t.isCity);
  const parks = new Set(gameMap.getAllTiles().filter(t => t.park).map(t => t.park));

  console.log('=== UTAH MAP STATS ===');
  console.log(`Total tiles: ${gameMap.tileCount}`);
  console.log(`Land tiles: ${landTiles.length}`);
  console.log(`Water tiles: ${waterTiles.length}`);
  console.log(`Cities: ${cities.length}`);
  console.log(`Parks: ${parks.size}`);
  console.log(`Terrain types used: ${new Set(gameMap.getAllTiles().map(t => t.terrain)).size}`);

  // Phase 5: UI systems (tile picking, tooltip, info panel)
  const terrainMeshes = renderer.getTerrainMeshes();
  const picker = new PickingSystem(renderer.threeCamera.camera, terrainMeshes, gameMap);
  const tooltip = new Tooltip();
  const infoPanel = new InfoPanel();

  let pendingMove: { x: number; y: number } | null = null;
  let rafQueued = false;

  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    pendingMove = { x: e.clientX, y: e.clientY };
    if (rafQueued) return;
    rafQueued = true;
    requestAnimationFrame(() => {
      rafQueued = false;
      if (!pendingMove) return;
      const { x, y } = pendingMove;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const ndcX = (x / w) * 2 - 1;
      const ndcY = -(y / h) * 2 + 1;
      const tile = picker.pickTile(ndcX, ndcY);
      if (tile) tooltip.show(tile, x, y);
      else tooltip.hide();
    });
  });

  canvas.addEventListener('mouseleave', () => tooltip.hide());

  canvas.addEventListener('click', (e: MouseEvent) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const ndcX = (e.clientX / w) * 2 - 1;
    const ndcY = -(e.clientY / h) * 2 + 1;
    const tile = picker.pickTile(ndcX, ndcY);
    if (tile) infoPanel.show(tile);
    renderer.scheduler.setDirty('selection');
  });

  // Keyboard camera controls
  const cameraControls = new CameraControls(renderer.threeCamera);
  cameraControls.onKeyMove = () => renderer.scheduler.setDirty('camera');

  // Search / legend / minimap panels
  const searchPanel = new SearchPanel(gameMap, (worldX, worldZ) => {
    renderer.threeCamera.flyTo(worldX, worldZ);
  });
  const legendPanel = new LegendPanel();
  const minimap = new MinimapRenderer();
  minimap.build(gameMap);
  minimap.setOnJump((worldX, worldZ) => {
    renderer.threeCamera.flyTo(worldX, worldZ);
  });
  let minimapVisible = true;

  // Compass HUD — rotates with camera
  const compass = new CompassHUD();

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    const typing = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

    if (e.key === 'Escape') {
      infoPanel.hide();
      searchPanel.close();
      return;
    }
    if (typing) return;

    if (e.key === '/') {
      e.preventDefault();
      searchPanel.open();
      return;
    }
    if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      legendPanel.toggle();
      return;
    }
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      minimapVisible = !minimapVisible;
      minimap.setVisible(minimapVisible);
      return;
    }
    if (e.key === '\\') {
      e.preventDefault();
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      return;
    }
  });

  // Phase 6: Start render loop
  setLoadingProgress(100, 'Ready');
  setTimeout(dismissLoading, 300);

  let lastTimestamp = 0;
  function loop(timestamp: number): void {
    const dt = lastTimestamp === 0 ? 1 / 60 : Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    cameraControls.update(dt);
    renderer.threeCamera.update(dt);
    renderer.updateWeather(timestamp);
    renderer.renderIfDirty(timestamp);

    const camPos = renderer.threeCamera.camera.position;
    const camTarget = renderer.threeCamera.controls.target;
    const dx = camPos.x - camTarget.x;
    const dy = camPos.y - camTarget.y;
    const dz = camPos.z - camTarget.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    minimap.updateViewport(camTarget.x, camTarget.z, dist);

    // Update compass with camera azimuth
    compass.update(renderer.threeCamera.getAzimuthAngle());

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Handle window resize
  window.addEventListener('resize', () => renderer.resize());
}

init().catch(console.error);
