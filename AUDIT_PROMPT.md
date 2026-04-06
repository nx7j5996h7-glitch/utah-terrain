# Utah 3D Terrain Map — Comprehensive Cohesion Audit

Use this prompt with: `claude -p "$(cat ~/Desktop/utah/AUDIT_PROMPT.md)"`

---

## TASK

Perform a comprehensive cohesion audit of the Utah 3D terrain map at `~/Desktop/utah`. Many independent agents have made changes across the codebase over a long session. Verify everything works together coherently. Fix anything broken.

---

## AUDIT CATEGORIES

### 1. TypeScript Compilation & Build
- Run `npx tsc --noEmit` — must be zero errors
- Run `npm run build` — must succeed
- Check for any implicit `any` types or unused imports

### 2. Import Chain Integrity
- Verify NO files import from `@/core/grid/GridUtils` or `@/core/grid/GridCoord` (deleted modules)
- Verify NO files reference `MAP_COLS`, `MAP_ROWS`, `TILE_SIZE`, `COL_STEP`, `ROW_STEP` (removed constants)
- Verify NO files use `.col` or `.row` on Tile (replaced with `.q` and `.r`)
- Check all `@/` imports resolve to existing files
- Verify NO files import `BorderHexMesh` or `ParkBoundaries` (both removed from ThreeRenderer)

### 3. Coordinate System Consistency (CRITICAL)
The coordinate system uses NEGATED x to achieve north-at-top + east-on-right with camera azimuth=PI:
- `hexToPixel` outputs `x = -HEX_SIZE * 1.5 * q` (negated!)
- `pixelToHex` negates x on input before computing q
- ALL geo→world conversions must use the SAME formula:
  ```
  q = (lon - UTAH_WEST) / DEG_PER_HEX_LON
  r = (UTAH_NORTH - lat) / DEG_PER_HEX_LAT
  x = -HEX_SIZE * 1.5 * q           ← NEGATED
  y = HEX_SIZE * (sqrt3/2 * q + sqrt3 * r)
  worldX = x, worldZ = -y
  ```
- Check EVERY file with inline geoToWorld/geoToWorldPixel: RiverMap.ts, RoadMap.ts, CityMarkers.ts, LandmarkSculptor.ts, RegionLabels.ts, WaterPlane.ts, HeightMapGenerator.ts
- Verify HeightMapGenerator.ts `worldToGeo` uses `q = -wx / (HEX_SIZE * 1.5)` (negated inverse)
- Verify pixelToHex calls use `pixelToHex(wx, -wz, HEX_SIZE)` (negating z back to pixel y)
- Verify camera initial azimuth = Math.PI (south of center, looking north)

### 4. Terrain Build Pipeline Order
Read `TerrainMeshBuilder.ts` and verify this exact order:
1. Dispose old chunks
2. Build tile coordinate lookup
3. Mountain depth BFS
4. Find land bounding box
5. Generate vertex grid (heights from real USGS heightmap via getHeight)
5b. Store gridHeights early (BEFORE smoothing)
6. Global smoothing — should be 0 passes (real heightmap is already smooth)
7. Coastal smoothing (4 passes, radius 4, land flattening radius 2)
7a. Sync gridHeights FROM smoothed positions (AFTER smoothing, BEFORE landmarks)
7b. Landmark sculpting (applyToTerrain on gridHeights + applyTintsToColorGrid on colors)
7c. Sync positions FROM gridHeights (copies landmark modifications back to positions)
8. Terrain boundary color blending (noise-perturbed, BLEND_SCALE=0.60)
9. Mountain Laplacian smoothing — should be 0 passes (real heightmap)
10. River valley carving
11. Generate index buffer (alternating diagonal split)
12. Split into chunks (with snowCover and coastDist attributes)
13. Finalize height grid (copy final positions to gridHeights)
14. Publish to GameMap

### 5. ThreeRenderer Build Pipeline
Read `ThreeRenderer.ts` and verify:
- Custom fog shader chunk set BEFORE any materials compile
- FogExp2 with color #c8c4b8, density 0.0010
- River map built BEFORE terrain (for valley carving data via setRiverData)
- `setRiverData()` called on terrain builder before `build()`
- Road map built after terrain
- Feature map built
- Terrain material created with all uniforms
- Overlay textures wired via onBeforeCompile (river bounds format: minX, minZ, 1/rangeX, 1/rangeZ)
- Shadow baker + height map baker called with heightSampler
- Water plane built (PER-LAKE from WATER_BODIES, NOT full-map)
- Vegetation scatter built AND `updateLOD()` called in BOTH render() and renderIfDirty()
- City markers built
- NO BorderHexMesh (removed)
- NO ParkBoundaries (removed)

### 6. Shader Uniform Wiring
Read `TerrainMaterial.ts` and verify:
- Vertex shader declares: uTime, uRiverMap, uRiverBounds uniforms
- Vertex shader has river bank depression + Gerstner wave displacement code
- vRiverDepth and vRiverWaveHeight varyings declared in BOTH vertex and fragment headers
- Fragment shader declares: uRiverMap, uRiverBounds, uRoadSDF, uRoadBounds, uShadowMap, uShadowBounds
- River overlay sampled in fragment (UV = (wp - bounds.xy) * bounds.zw)
- Road overlay sampled in fragment
- Shadow/AO sampled in fragment
- Bump mapping injection at `#include <normal_fragment_maps>` with per-terrain scale
- Mountain cliff darkening via dFdx/dFdy steepness + geological strata lines
- Terrain pattern suppression near boundaries (ttPurity + noise-warped patternMask from vTerrainBlend)
- uTime updated each frame in ThreeRenderer render() and renderIfDirty()

### 7. Vertex Attributes
Verify TerrainMeshBuilder creates AND TerrainMaterial declares ALL of:
- `terrainType` (float)
- `terrainBlend` (float)
- `snowCover` (float) — populated based on elevation + noise treeline
- `coastDist` (float) — populated based on proximity to water
- `hexCoord` (vec2)

### 8. Data File Consistency
- `constants.ts`: MAP_WIDTH=160, MAP_HEIGHT=140, HEX_SIZE=20
- `constants.ts`: WATER_PLANE_Y=-0.5, WATER_MESH_Y=-2.0
- `constants.ts`: CAMERA_PAN_SPEED=0.25, CAMERA_MAX_DISTANCE=1400
- Terrain colors: salt_flat=#F5F3F0, desert=#D4BA88 (updated for accuracy)
- FORMATION_COLORS has 14 entries matching formation indices
- Water bodies: Utah Lake color=#4A7060, Lake Powell=#1A4A6A, GSL North=#C47088, Bear Lake=#40B8B0
- Regions array: Mojave Fringe BEFORE Great Basin (more specific first)
- Mountains: Tushar type='range' (not 'plateau')
- Cities: Virgin at [-113.10, 37.21] (not same as La Verkin)

### 9. LandmarkSculptor Integration
- 37 landmarks defined with heightFn and tintFn
- `applyToTerrain(gridHeights, numCols, numRows)` — modifies heights in place
- `applyTintsToColorGrid(colors, numCols, numRows, minX, minZ)` — modifies vertex colors
- `tintFn` signature: `(dx, dz, dist) => [r,g,b,strength] | null` — 3 args
- All landmarks use `geoToWorld()` with negated x: `x = -HEX_SIZE * 1.5 * q`
- Called at Step 7b in TerrainMeshBuilder AFTER smoothing, BEFORE mountain Laplacian

### 10. Real Heightmap Integration
- `public/utah-elevation.png` exists (RGB-encoded, R*256+G = 16-bit elevation)
- `public/utah-elevation-meta.json` exists with bounds and elevation range
- `RealHeightMap.ts` loads the PNG, decodes R*256+G for 16-bit precision
- `loadHeightmap()` called in main.ts BEFORE map generation
- `HeightMapGenerator.ts` imports sampleElevationGeo and isHeightmapLoaded
- `sampleRealHeight()` is primary height source in getHeight()
- `worldToGeo()` uses `q = -wx / (HEX_SIZE * 1.5)` (negated to match hexToPixel)
- Exaggeration: normalizedElev × ELEVATION_SCALE × 18

### 11. Camera & Controls
- Initial azimuth = Math.PI (camera south of center, looking north)
- North at top of screen, east on RIGHT (due to negated x-axis)
- Terrain height clamping: camera stays terrainY + 8 above terrain
- Pan speed scales with camera Y height: `CAMERA_PAN_SPEED * dtScale * (camY / 80)`
- Zoom speed = 2.0 on OrbitControls
- Max distance = 1400
- Compass HUD rotates with camera azimuth

### 12. Label Rendering
- All sprite labels have `depthTest: false, depthWrite: false, renderOrder: 100`
- City labels: LOD distance 400 (small) / 800 (large cities >50k)
- Region labels: fade in at 300-500 units (visible zoomed out, hidden close)
- Region labels should not be enormous or clip through terrain

### 13. Vegetation Rendering
- `updateLOD()` called in BOTH `render()` and `renderIfDirty()` in ThreeRenderer
- 12 vegetation types with Utah-specific density tables
- Region-aware overrides (Mojave gets cactus+joshua, High Plateaus boost conifer)
- Feature overrides (pinyon_juniper, dense_forest/forest/woodland tiers)
- Riparian boost near waterways
- InstancedMesh per type, frustumCulled=false
- Spatial grid (100-unit cells) for LOD filtering
- SCATTER_LOD_NEAR=350, SCATTER_LOD_FAR=550

### 14. Color Transition Quality
- Vertex color blending uses noise-perturbed positions (breaks hex pattern)
- BLEND_SCALE = 0.60, skip distance = HEX_SIZE * 0.2
- Shader patterns suppressed near boundaries via ttPurity + noise-warped patternMask
- Terrain hillshade applied per-vertex with per-terrain intensity ranges
- Formation-aware coloring: tile.formation blends vertex color toward FORMATION_COLORS
- Snow cover on mountain/alpine vertices above wy > 120

### 15. Fog Configuration
- Custom fog_fragment shader chunk overrides THREE.ShaderChunk BEFORE materials compile
- FogExp2 color=#c8c4b8 (warm haze), density=0.0010
- Custom chunk: clear to 250 units, gentle exp² ramp, capped at 75% opacity

### 16. Water Rendering
- WaterPlane creates individual planes PER water body (not one giant plane)
- Each lake's plane sized to its polygon bounding box + padding
- Shared ShaderMaterial with Gerstner waves, Fresnel, caustics
- WATER_PLANE_Y = -0.5, WATER_MESH_Y = -2.0
- Water tile vertices in terrain mesh placed at WATER_MESH_Y (below water plane)
- River overlay in terrain shader: color (0.13, 0.38, 0.50) matching lake water
- River vertex displacement: bank depression + 2-frequency Gerstner waves

### 17. Dead Code & Orphan Files
- `BorderHexMesh.ts` — no longer imported, can be deleted
- `ParkBoundaries.ts` — no longer imported, can be deleted
- `EventBus.ts` — never imported, can be deleted
- Check for any other .ts files never imported by anything

### 18. Performance
- No shadow maps (baked only)
- `frustumCulled = false` on terrain chunks and InstancedMesh vegetation
- Global smoothing = 0 passes, mountain smoothing = 0 passes
- Water planes per-lake (not full-map)
- Fog custom shader chunk with distance-shifted exp² (clear nearby)
- Vegetation spatial grid LOD filtering

---

## INSTRUCTIONS

1. Read every file mentioned above — do NOT skip any
2. For each audit category, report PASS or FAIL with specific line numbers
3. For any FAIL, provide the exact fix needed AND implement it
4. Pay special attention to coordinate system consistency (#3) — this has been a recurring source of bugs
5. Verify the terrain build pipeline order (#4) is correct — smoothing→sync→landmarks→sync must be in this exact sequence
6. At the end, run `npx tsc --noEmit` and `npm run build` to verify
7. Report total PASS/FAIL count and summary of fixes applied

### 19. River Valley Carving
- VALLEY_CENTER_DEPTH should be 15.0 (not 2.0) — visible against 100+ unit mountains
- River carving runs at Step 10 in TerrainMeshBuilder
- setRiverData() called in ThreeRenderer BEFORE terrain build
- River overlay in shader uses (0.15, 0.42, 0.52) matching WaterPlane shallowColor
- Water hex vertex colors use (0.05, 0.18, 0.28) matching WaterPlane deepColor

### 20. Elevation-Based Terrain Refinement
- UtahMapData Step 5b: desert/sagebrush tiles with real elevation >2800m → conifer_forest, >2200m → mountain, >1800m → sagebrush
- Requires RealHeightMap to be loaded before generateUtahMap is called
- Prevents entire Great Basin from being monotone desert despite having 3000m+ mountain ranges
- River valley terrain type only assigned on low-elevation tiles (elevation ≤ 5, not mountain/forest/alpine) — prevents green river_valley band from painting over mountain slopes

### 21. River Terrain Override Removed
- Rivers NO LONGER change terrain type to 'river_valley' — they only set the `waterway` field
- River water is rendered purely as a shader overlay (blue tint on whatever terrain the river crosses)
- This prevents unrealistic bright green bands over canyon and mountain terrain
- The river_valley terrain type in constants.ts still exists but should rarely/never be assigned by the pipeline

### 22. X-Negation Consistency
- hexToPixel outputs `x = -HEX_SIZE * 1.5 * q` (NEGATED)
- pixelToHex negates x on input before computing q
- ALL 9 geoToWorld/geoToWorldPixel functions use `-HEX_SIZE * 1.5 * q`
- HeightMapGenerator.worldToGeo uses `q = -wx / (HEX_SIZE * 1.5)`
- Camera azimuth = Math.PI (south of center looking north)
- BorderHexMesh has non-negated CORNER_DX but is removed from ThreeRenderer so doesn't matter

### 23. Water Hex Terrain Height
- Water hex vertices sit at Y=0 (water plane level), NOT at WATER_MESH_Y=-1.5
- This prevents canyon-like cliffs at every lake edge
- Water plane renders on top at Y=0 with waves/color
- Water plane material: transparent=false, depthWrite=true, alpha=1.0 (fully opaque)
- Water plane padding: HEX_SIZE * 3 for full coverage
- Coastal land flattening: radius 8, blend 0.9, target Y=0.3

### 24. Compass Orientation
- Compass rotates by `-azimuth + PI` to account for default azimuth=PI
- At default view, N points up on compass
