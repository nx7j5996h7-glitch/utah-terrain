import * as THREE from 'three';
import type { TerrainType } from '@/constants';
import {
  MAX_RENDER_SCALE,
  MAX_DPR,
} from '@/constants';
import type { GameMap } from '@/core/map/GameMap';
import { WORLD_BOUNDS } from '@/core/geo/GeoCoord';
import { ThreeCamera } from './ThreeCamera';
import { SceneLighting } from './effects/SceneLighting';
import { AtmosphereEffect } from './effects/AtmosphereEffect';
import { createTerrainMaterial, type TerrainUniforms } from './terrain/TerrainMaterial';
import { TerrainMeshBuilder } from './terrain/TerrainMeshBuilder';
import { WaterPlane } from './terrain/WaterPlane';
import { RiverMap } from './terrain/RiverMap';
import { RoadMap } from './terrain/RoadMap';
import { ShadowBaker } from './terrain/ShadowBaker';
import { HeightMapBaker } from './terrain/HeightMapBaker';
import { RegionalFeatureMap } from '@/rendering/RegionalFeatureMap';
import { CityMarkers } from './objects/CityMarkers';
// ParkBoundaries removed
import { VegetationScatter } from './objects/VegetationScatter';
import { RegionLabels } from './overlays/RegionLabels';
import { GridOverlay } from './overlays/GridOverlay';
// BorderHexMesh removed
import { WeatherParticles } from './effects/WeatherParticles';
import { GraphicsSettingsManager, type GraphicsSettingsData, type QualityPreset } from '@/rendering/GraphicsSettings';
import { RenderScheduler } from '@/rendering/RenderScheduler';
import { RIVERS } from '@/data/rivers-detailed';
import { ROADS } from '@/data/roads';

// ═════════════════════════════════════════════════════════════════════════════
// ThreeRenderer — central rendering orchestrator for the Utah hex terrain map
// ═════════════════════════════════════════════════════════════════════════════

export class ThreeRenderer {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  threeCamera!: ThreeCamera;

  private terrainGroup!: THREE.Group;
  private terrainBuilder = new TerrainMeshBuilder();
  private terrainMaterial!: THREE.MeshStandardMaterial;
  private terrainUniforms!: TerrainUniforms;

  private waterPlane = new WaterPlane();
  private riverMap = new RiverMap();
  private roadMap = new RoadMap();
  private featureMap = new RegionalFeatureMap();
  private shadowBaker = new ShadowBaker();
  private heightMapBaker = new HeightMapBaker();
  // borderHexMesh removed
  private atmosphere!: AtmosphereEffect;
  private canvas!: HTMLCanvasElement;

  // Annotation layers
  private cityMarkers!: CityMarkers;
  private vegetationScatter!: VegetationScatter;
  private regionLabels!: RegionLabels;
  private gridOverlay!: GridOverlay;

  // Quality / scheduling / weather
  readonly settings: GraphicsSettingsManager;
  readonly scheduler: RenderScheduler;
  private weatherParticles: WeatherParticles | null = null;
  private lastFrameTime = 0;

  constructor() {
    this.settings = new GraphicsSettingsManager();
    this.scheduler = new RenderScheduler();
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;

    const s = this.settings.get();
    const dpr = Math.min(window.devicePixelRatio || 1, s.pixelRatio, MAX_DPR);
    const useAntialias = dpr <= 1;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: useAntialias,
      powerPreference: 'default',
      alpha: false,
      stencil: false,
      depth: true,
    });
    this.renderer.setPixelRatio(dpr);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.6;

    const renderScale = Math.min(s.renderScale, MAX_RENDER_SCALE);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.setPixelRatio(dpr * renderScale);

    // Scene
    this.scene = new THREE.Scene();

    // Custom fog: crystal clear nearby, gentle exponential ramp at distance
    // Override fog shader chunk BEFORE any materials compile
    THREE.ShaderChunk.fog_fragment = /* glsl */ `
      #ifdef USE_FOG
        #ifdef FOG_EXP2
          float fogDepthShifted = max( 0.0, vFogDepth - 250.0 );
          float fogFactor = ( 1.0 - exp( - fogDensity * fogDensity * fogDepthShifted * fogDepthShifted ) ) * 0.75;
        #else
          float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
        #endif
        gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
      #endif
    `;
    // Warm haze matching Utah's clear desert sky with distant dust
    this.scene.fog = new THREE.FogExp2(0xd0a880, 0.0010); // warm sunset haze

    this.terrainGroup = new THREE.Group();
    this.terrainGroup.name = 'terrain';
    this.scene.add(this.terrainGroup);

    // Camera
    this.threeCamera = new ThreeCamera(canvas);

    // Lighting
    SceneLighting.setup(this.scene);

    // Atmosphere (sky)
    this.atmosphere = new AtmosphereEffect(this.scene, this.threeCamera.camera);

    // Terrain material
    const { material, uniforms } = createTerrainMaterial();
    this.terrainMaterial = material;
    this.terrainUniforms = uniforms;

    // Camera change → mark dirty
    this.threeCamera.controls.addEventListener('change', () => {
      this.scheduler.setDirty('camera');
    });
    this.threeCamera.onControlsChange = () => this.scheduler.setDirty('camera');

    // Keyboard shortcuts: 1/2/3/4 cycle quality presets
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      let preset: QualityPreset | null = null;
      if (e.code === 'Digit1') preset = 'low';
      else if (e.code === 'Digit2') preset = 'medium';
      else if (e.code === 'Digit3') preset = 'high';
      else if (e.code === 'Digit4') preset = 'ultra';
      if (preset) {
        this.settings.setPreset(preset);
        this.applySettings();
      }
    });

    // React to settings updates
    this.settings.onChange(() => this.applySettings());
  }

  // ── Graphics settings ──────────────────────────────────────────────────────

  applySettings(): void {
    const s = this.settings.get();

    const dpr = Math.min(window.devicePixelRatio || 1, s.pixelRatio, MAX_DPR);
    const renderScale = Math.min(s.renderScale, MAX_RENDER_SCALE);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);
    this.renderer.setPixelRatio(dpr * renderScale);

    if (this.vegetationScatter) {
      this.vegetationScatter.setQuality(s.vegetationDensity);
    }

    if (this.terrainUniforms?.uShadowEnabled) {
      this.terrainUniforms.uShadowEnabled.value = s.shadowQuality ? 1 : 0;
    }

    if (this.weatherParticles) {
      this.weatherParticles.setEnabled(s.weatherEffects);
    }

    const labelsGroup = this.scene.getObjectByName('region_labels');
    if (labelsGroup) labelsGroup.visible = s.regionLabels;

    this.scheduler.setDirty('settings');
  }

  getSettings(): GraphicsSettingsData {
    return this.settings.get();
  }

  // ── Terrain height query ───────────────────────────────────────────────────

  getTerrainY(wx: number, wz: number): number {
    return this.terrainBuilder.sampleHeight(wx, wz) ?? 0;
  }

  // ── Main terrain build ─────────────────────────────────────────────────────

  async buildTerrain(
    gameMap: GameMap,
    onProgress?: (fraction: number, label: string) => void,
  ): Promise<void> {
    // MessageChannel yield — not throttled in background tabs (unlike setTimeout)
    const yieldFn = () => new Promise<void>(r => {
      const ch = new MessageChannel();
      ch.port1.onmessage = () => r();
      ch.port2.postMessage(null);
    });

    // 0. Build river map FIRST so valley carving data is available during terrain build
    this.riverMap.build(RIVERS, gameMap);
    try {
      const riverRaw = this.riverMap.getRawData();
      const rb = this.riverMap.getBounds();
      this.terrainBuilder.setRiverData(
        riverRaw, 4096,
        { x: rb.x, y: rb.y, z: rb.z, w: rb.w },
      );
    } catch {
      // River map may not have data yet on first build
    }

    // 1. Build terrain mesh (publishes tile heights and mountain depths to gameMap)
    const geometries = await this.terrainBuilder.build(gameMap, yieldFn, onProgress);

    // 2. Create chunk meshes
    for (const geom of geometries) {
      const mesh = new THREE.Mesh(geom, this.terrainMaterial);
      mesh.frustumCulled = false; // Must stay false — bounding spheres from scattered vertices are wrong
      this.terrainGroup.add(mesh);
    }

    // 2b. Border hex plates (decorative bowl edge around map boundary)
    // borderHexMesh removed

    // 3. Wire terrain height query to camera (clamp above terrain)
    this.threeCamera.getTerrainHeight = (x, z) => this.getTerrainY(x, z);

    // 4. Bake shadow map
    const sunDir = SceneLighting.getSunDirection();
    const heightSampler = (wx: number, wz: number) => this.terrainBuilder.sampleHeight(wx, wz);
    this.shadowBaker.build(gameMap, sunDir, heightSampler);
    this.terrainUniforms.uShadowMap.value = this.shadowBaker.getTexture();
    this.terrainUniforms.uShadowBounds.value.copy(this.shadowBaker.getBounds());
    this.terrainUniforms.uShadowEnabled.value = 1;

    await yieldFn();

    // 5. Bake height map
    this.heightMapBaker.build(gameMap, heightSampler);
    this.terrainUniforms.uHeightMap.value = this.heightMapBaker.getTexture();
    this.terrainUniforms.uHeightMapBounds.value.copy(this.heightMapBaker.getBounds());
    this.terrainUniforms.uHeightMapRange.value.copy(this.heightMapBaker.getRange());
    this.terrainUniforms.uHeightMapEnabled.value = 1;

    await yieldFn();

    // 6. Water plane
    this.waterPlane.build(this.scene);

    // 7. Overlay maps (roads, regional features — river already built in step 0)
    this.roadMap.build(ROADS, gameMap);
    this.featureMap.build(gameMap);

    // Inject overlay textures via onBeforeCompile
    const mat = this.terrainMaterial as any;
    if (!mat.__overlayUniformsInjected) {
      const originalOnBeforeCompile = mat.onBeforeCompile;
      const riverTex = this.riverMap.getTexture();
      const riverBounds = this.riverMap.getBounds();
      const roadTex = this.roadMap.getTexture();
      const roadBounds = this.roadMap.getBounds();
      const regionTex = this.featureMap.getTexture();
      const regionSize = this.featureMap.getSize();

      mat.onBeforeCompile = (shader: any) => {
        if (originalOnBeforeCompile) {
          originalOnBeforeCompile.call(mat, shader);
        }
        shader.uniforms.uRiverMap = { value: riverTex };
        shader.uniforms.uRiverBounds = { value: riverBounds };
        shader.uniforms.uRiverColors = { value: this.riverMap.getRiverColorsVec3Array() };
        shader.uniforms.uRoadSDF = { value: roadTex };
        shader.uniforms.uRoadBounds = { value: roadBounds };
        shader.uniforms.uRegionMap = { value: regionTex };
        shader.uniforms.uRegionSize = { value: regionSize };
        // Map bounds for border sunset fog
        shader.uniforms.uMapBounds = {
          value: new THREE.Vector4(
            WORLD_BOUNDS.minX, WORLD_BOUNDS.minZ,
            WORLD_BOUNDS.maxX, WORLD_BOUNDS.maxZ,
          ),
        };
      };
      mat.__overlayUniformsInjected = true;
      mat.needsUpdate = true;
    }

    // 8. Vegetation scatter
    this.vegetationScatter = new VegetationScatter(this.scene);
    this.vegetationScatter.build(gameMap, this.scene, heightSampler);

    // 9. Annotation layers (cities, parks, region labels, grid)
    this.cityMarkers = new CityMarkers(this.scene);
    this.cityMarkers.build(gameMap);

    // Park boundary outlines
    // Park boundaries removed

    this.regionLabels = new RegionLabels(this.scene);
    this.regionLabels.build(gameMap, this.scene);

    this.gridOverlay = new GridOverlay(this.scene);
    this.gridOverlay.build(gameMap, this.scene, heightSampler);

    // Keyboard toggle for grid overlay (G key)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'KeyG' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        this.gridOverlay.setVisible(!this.gridOverlay['group'].visible);
      }
    });

    // 10. Weather particles
    this.weatherParticles = new WeatherParticles(this.scene);

    // Apply current settings
    this.applySettings();
    this.scheduler.setDirty('startup');
  }

  // ── LOD updates ────────────────────────────────────────────────────────────

  updateLOD(): void {
    const cam = this.threeCamera.camera;
    if (this.vegetationScatter) {
      this.vegetationScatter.updateLOD(cam.position.x, cam.position.z);
    }
    if (this.cityMarkers) {
      this.cityMarkers.updateLOD(cam.position.x, cam.position.y, cam.position.z);
    }
    if (this.regionLabels) {
      const target = this.threeCamera.controls.target;
      const dx = cam.position.x - target.x;
      const dy = cam.position.y - target.y;
      const dz = cam.position.z - target.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      this.regionLabels.updateLOD(dist);
    }
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  render(): void {
    const t = performance.now();
    this.atmosphere.update();
    this.waterPlane.update(t);
    this.updateLOD(); // Update vegetation, city labels, region labels
    if (this.terrainUniforms?.uTime) {
      this.terrainUniforms.uTime.value = t * 0.001;
    }
    this.renderer.render(this.scene, this.threeCamera.camera);
    this.scheduler.markRendered();
  }

  renderIfDirty(timestamp: number): boolean {
    if (!this.scheduler.shouldRender(timestamp)) return false;
    this.waterPlane.update(timestamp);
    this.atmosphere.update();
    this.updateLOD(); // Update vegetation, city labels, region labels
    if (this.terrainUniforms?.uTime) {
      this.terrainUniforms.uTime.value = timestamp * 0.001;
    }
    this.renderer.render(this.scene, this.threeCamera.camera);
    this.scheduler.markRendered();
    return true;
  }

  updateWeather(timestamp: number): void {
    if (!this.weatherParticles) return;
    const dt = this.lastFrameTime === 0 ? 0.016 : (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;
    const cam = this.threeCamera.camera;
    this.weatherParticles.update(cam.position.x, cam.position.y, cam.position.z, dt);
    if (this.settings.get().weatherEffects) {
      this.scheduler.setDirty('animation');
    }
  }

  // ── Resize ─────────────────────────────────────────────────────────────────

  resize(): void {
    const s = this.settings.get();
    const dpr = Math.min(window.devicePixelRatio || 1, s.pixelRatio, MAX_DPR);
    const renderScale = Math.min(s.renderScale, MAX_RENDER_SCALE);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);
    this.renderer.setPixelRatio(dpr * renderScale);
    this.threeCamera.resize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.scheduler.setDirty('resize');
  }

  // ── Terrain mesh access ────────────────────────────────────────────────────

  getTerrainMeshes(): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    this.terrainGroup.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) meshes.push(obj as THREE.Mesh);
    });
    return meshes;
  }

  // ── Dispose ────────────────────────────────────────────────────────────────

  dispose(): void {
    this.terrainBuilder.dispose();
    this.terrainGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
      }
    });

    this.terrainMaterial?.dispose();
    this.waterPlane.dispose();
    this.riverMap.dispose();
    this.roadMap.dispose();
    this.featureMap.dispose();
    this.shadowBaker.dispose();
    this.heightMapBaker.dispose();

    if (this.terrainUniforms.uShadowMap.value) {
      this.terrainUniforms.uShadowMap.value.dispose();
    }
    if (this.terrainUniforms.uHeightMap.value) {
      this.terrainUniforms.uHeightMap.value.dispose();
    }

    // borderHexMesh removed
    if (this.vegetationScatter) this.vegetationScatter.dispose();
    if (this.cityMarkers) this.cityMarkers.dispose();
    if (this.regionLabels) this.regionLabels.dispose();
    if (this.gridOverlay) this.gridOverlay.dispose();
    if (this.weatherParticles) this.weatherParticles.dispose();

    this.atmosphere.dispose();
    this.threeCamera.dispose();
    this.renderer.dispose();
  }
}
