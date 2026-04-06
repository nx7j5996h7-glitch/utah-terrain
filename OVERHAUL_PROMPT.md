# Utah 3D Terrain Map — Complete Overhaul Prompt

Use this prompt with: `claude -p "$(cat ~/Desktop/utah/OVERHAUL_PROMPT.md)"`

---

## TASK

Completely overhaul the Utah 3D terrain map project at `~/Desktop/utah`. The current implementation has critical rendering bugs (overlay textures built but never sampled in shaders, LOD never called, landmark/park code dead, formation data never reaches GPU, broken coordinate scaling, wrong water plane gaps, etc.) and uses a square grid instead of hexes. 

**Rebuild it from scratch** using the EXACT same engine architecture, patterns, and conventions as the Aveneg/Trump:Total War project at `~/Desktop/Aveneg`. Same hex coordinate system, same Three.js rendering pipeline, same terrain mesh approach, same shader injection pattern, same file structure — but covering Utah instead of the Middle East, with a larger and more detailed map.

Use many opus subagents in parallel to work on independent systems simultaneously. Break the work into waves. After each wave, run `npx tsc --noEmit` and `npx vitest run` to verify.

---

## CRITICAL CONSTRAINTS

1. **USE HEXES** — flat-top axial coordinates (q, r), exactly like Aveneg. NOT a square grid. Import and adapt Aveneg's HexCoord.ts, HexGrid.ts, HexUtils.ts patterns.

2. **MATCH AVENEG'S PROPORTIONS — EXAGGERATE EVERYTHING** — Aveneg uses ~18x vertical exaggeration (mountains appear 18x taller than geographically proportional). Use the same `ELEVATION_SCALE = 8.0`, `MOUNTAIN_HEIGHT_BOOST = 5.0` constants. The visual drama should be identical. This applies to ALL terrain, not just mountains — hills, mesas, plateaus, canyon rims, escarpments, ridgelines, dune fields, and even gentle rolling terrain should be dramatically exaggerated. In Aveneg, even "flat" desert terrain has height multipliers (desert=0.35, arid_steppe=0.40, fertile=0.34) that create visible rolling topography. Utah's terrain should feel even MORE dramatic than the Middle East: the Wasatch Fault scarp should be a massive wall, canyon depths should be dizzying, the Grand Staircase cliff steps should be clearly visible color-coded terraces, mesa tops should be visibly flat-topped with sharp drop-offs, and the Bonneville Salt Flats should be strikingly, perfectly flat in contrast. Every terrain type needs its own height variation profile — nothing should look geometrically flat except salt flats.

3. **MATCH AVENEG'S RENDERING PIPELINE** — Single continuous terrain mesh at GRID_SPACING=2.0, vertex-colored per terrain type, TerrainMaterial with onBeforeCompile GLSL injection, baked shadow/AO/height/pattern textures, RiverMap/RoadMap DataTexture overlays, Gerstner wave water plane, InstancedMesh vegetation with dual LOD.

4. **GEOGRAPHIC ACCURACY** — Utah's boundaries are exactly: North 42.0°N, South 37.0°N, East 109.05°W, West 114.05°W (5° × 5°). All coordinates for mountains, rivers, cities, parks must use real-world lat/lon positions. Read Aveneg's FixedMapData.ts to understand the polygon-based geographic data format, then create an equivalent UtahMapData.ts.

5. **MUST RUN ON M2 PRO MACBOOK** — Follow Aveneg's performance rules: no shadow maps (baked only), terrain shader max LOD 1, render scale capped at 0.75, DPR capped at 1.5, max 4 Gerstner waves, never dispose shared geometries, frustumCulled=false on InstancedMesh.

6. **LATITUDE CORRECTION** — At Utah's latitude (~39.5°N), 1° longitude = 85.9 km but 1° latitude = 111.3 km. The hex grid must account for this aspect ratio difference so Utah doesn't appear horizontally stretched.

---

## REFERENCE: AVENEG ARCHITECTURE (read these files)

Before writing any code, read these Aveneg files to understand the patterns:

- `~/Desktop/Aveneg/CLAUDE.md` — Full project documentation and mandatory patterns
- `~/Desktop/Aveneg/package.json` — Exact dependency versions
- `~/Desktop/Aveneg/src/constants.ts` — HEX_SIZE=20, MAP_WIDTH=120, MAP_HEIGHT=100, ELEVATION_SCALE=8.0, MOUNTAIN_HEIGHT_BOOST=5.0, all terrain colors
- `~/Desktop/Aveneg/src/core/hex/HexCoord.ts` — Axial coordinate system, hexKey/hexFromKey, neighbors, distance
- `~/Desktop/Aveneg/src/core/hex/HexUtils.ts` — hexToPixel/pixelToHex formulas (flat-top)
- `~/Desktop/Aveneg/src/core/hex/HexGrid.ts` — Generic grid container with parallel coords map
- `~/Desktop/Aveneg/src/core/map/Tile.ts` — TerrainType, TileData, Tile class
- `~/Desktop/Aveneg/src/core/map/GameMap.ts` — Tile grid with controller index
- `~/Desktop/Aveneg/src/core/map/FixedMapData.ts` — THE TEMPLATE: geoToHex, regions as polygons, cities, rivers (WaterwayDef with width/valleyDepth), roads, mountains, resources, feature zones, the 17-step generateFixedMap() pipeline
- `~/Desktop/Aveneg/src/rendering/three/ThreeRenderer.ts` — Renderer init, buildTerrain() pipeline
- `~/Desktop/Aveneg/src/rendering/three/terrain/TerrainMeshBuilder.ts` — Continuous vertex grid, per-vertex height/color, mountain depth BFS, foothill blending, Laplacian smoothing, coastline perturbation, chunk system
- `~/Desktop/Aveneg/src/rendering/three/terrain/TerrainMaterial.ts` — onBeforeCompile GLSL: vertex attributes, fragment terrain patterns, river/road overlays, shadow/AO, roughness
- `~/Desktop/Aveneg/src/rendering/HeightMapGenerator.ts` — 8-stage mountain noise pipeline
- `~/Desktop/Aveneg/src/rendering/ProceduralNoise.ts` — Noise function library
- `~/Desktop/Aveneg/src/rendering/RegionalFeatureMap.ts` — Per-tile RGBA feature texture
- `~/Desktop/Aveneg/src/rendering/RegionalMappings.ts` — Regional tints and ridge angles
- `~/Desktop/Aveneg/src/rendering/three/terrain/RiverMap.ts` — River rasterization to 2048² DataTexture
- `~/Desktop/Aveneg/src/rendering/three/terrain/RoadMap.ts` — Road SDF rasterization
- `~/Desktop/Aveneg/src/rendering/three/terrain/ShadowBaker.ts` — Baked shadows + AO
- `~/Desktop/Aveneg/src/rendering/three/terrain/HeightMapBaker.ts` — Baked heightmap for normals
- `~/Desktop/Aveneg/src/rendering/three/terrain/WaterPlane.ts` — Gerstner wave water
- `~/Desktop/Aveneg/src/rendering/three/objects/VegetationScatter.ts` — InstancedMesh vegetation with dual LOD and SpatialGrid
- `~/Desktop/Aveneg/src/rendering/three/ThreeCamera.ts` — Orbit camera + GSAP flyTo
- `~/Desktop/Aveneg/src/rendering/three/effects/SceneLighting.ts` — Directional + Ambient + Hemisphere
- `~/Desktop/Aveneg/src/rendering/three/effects/AtmosphereEffect.ts` — Gradient sky
- `~/Desktop/Aveneg/src/input/CameraControls.ts` — WASD pan, Q/E rotate azimuth, F/C tilt polar

---

## UTAH MAP SPECIFICATIONS

### Hex Grid Dimensions
- **Grid size: 90 cols × 70 rows = 6,300 hexes** (at ~8 km/hex, giving good geographic resolution)
- **HEX_SIZE = 20** world units (same as Aveneg)
- **Longitude: 114.05°W (q=0) → 109.05°W (q=89)** — degrees per hex: 5.0/90 = 0.0556°/hex
- **Latitude: 42.0°N (r=0) → 37.0°N (r=69)** — degrees per hex: 5.0/70 = 0.0714°/hex
- **geoToHex formula**: `q = round((114.05 + lon) / 0.0556)`, `r = round((42.0 - lat) / 0.0714)`

### Terrain Types (15, replacing Aveneg's 10)
| ID | Type | Color | Utah Context |
|----|------|-------|-------------|
| 0 | salt_flat | #E8E4D8 | Bonneville, Sevier playa |
| 1 | desert | #D8C098 | Great Basin floor |
| 2 | sagebrush | #8B9A6B | Western UT valleys |
| 3 | red_sandstone | #C45B28 | Entrada, Wingate, de Chelly |
| 4 | white_sandstone | #E8D8C0 | Navajo domes (Zion, Capitol Reef) |
| 5 | canyon_floor | #A08060 | River-cut canyon bottoms |
| 6 | mountain | #7A7A6A | Wasatch, Uinta peaks |
| 7 | conifer_forest | #2D5A3D | Montane/subalpine forests |
| 8 | alpine | #9A9A9A | Above treeline (>11,500 ft) |
| 9 | river_valley | #5A7A3A | Irrigated corridors |
| 10 | marsh | #4A6840 | GSL wetlands |
| 11 | urban | #988878 | SLC, Provo, Ogden |
| 12 | badlands | #8A8A98 | Mancos Shale (Factory Butte) |
| 13 | lava_field | #3A3A3A | Black Rock Desert, Snow Canyon |
| 14 | water | #2A6B88 | Lakes, reservoirs |

### Terrain Features (18 overlays)
hoodoo_field, arch_concentration, slot_canyon, sand_dune, pinyon_juniper, aspen_grove, cryptobiotic_crust, hot_spring, mine, cliff_dwelling, petrified_forest, hanging_garden, natural_bridge, escarpment, volcanic_cone, dense_forest, forest, woodland

### Mountain Ranges (with ridge angles for directional noise)
- Wasatch Range: elev 11, ridgeAngle 0° (N-S), polygon along 111.55-111.85°W, 39.8-42.0°N
- Uinta Mountains: elev 14, ridgeAngle 90° (E-W!), 109.5-111.2°W, 40.5-41.0°N
- La Sal: elev 12, laccolith (dome profile, no ridge angle), center 38.44°N 109.23°W
- Henry: elev 11, laccolith, center 38.0°N 110.8°W
- Abajo: elev 10, laccolith, center 37.84°N 109.46°W
- Tushar: elev 11, ridgeAngle 0°, center 38.37°N 112.37°W
- Deep Creek: elev 11, ridgeAngle 0°, center 39.83°N 113.92°W
- Stansbury: elev 10, ridgeAngle 0°
- Oquirrh: elev 9, ridgeAngle 0°
- Markagunt Plateau: elev 10 (plateau type)
- Aquarius/Boulder Mtn: elev 10 (plateau, highest timbered in N. America)
- Plus ~15 more Basin and Range mountains (all N-S trending, ridgeAngle 0°)

### Rivers (traced with [lon,lat] waypoints)
- Colorado River: width 1.2, valleyDepth 0.9, navigable, ~60 waypoints from CO border through Moab, Cataract Canyon, to Lake Powell
- Green River: width 1.0, valleyDepth 0.85, navigable, ~50 waypoints from Flaming Gorge through Desolation Canyon to confluence
- San Juan: width 0.8, valleyDepth 0.7, ~30 waypoints through Goosenecks
- Virgin River: width 0.6, valleyDepth 0.95 (Zion Narrows!), ~25 waypoints
- Bear River: width 0.7, valleyDepth 0.3, ~35 waypoints (complex looping course)
- Sevier: width 0.6, valleyDepth 0.3, ~30 waypoints (longest river entirely in UT)
- Weber, Provo, Jordan, Escalante, Fremont/Dirty Devil, Dolores, Price, San Rafael, Duchesne

### Cities (exact coordinates from census data)
- Salt Lake City: 40.7608°N, 111.8910°W, pop 208,007
- Provo: 40.2338°N, 111.6585°W, pop 114,766
- Ogden: 41.2230°N, 111.9738°W, pop 87,321
- St. George: 37.0965°N, 113.5684°W, pop 101,995
- Plus ~50 more cities/towns including all park gateway towns (Springdale, Moab, Torrey, Escalante, etc.)

### Parks (boundary polygons)
- 5 National Parks: Zion (37.30°N, 113.03°W), Bryce (37.59°N, 112.19°W), Arches (38.73°N, 109.59°W), Canyonlands (38.33°N, 109.88°W), Capitol Reef (38.09°N, 111.15°W)
- National Monuments: Grand Staircase-Escalante, Bears Ears, Natural Bridges, Cedar Breaks, Dinosaur
- National Forests: Uinta-Wasatch-Cache, Manti-La Sal, Fishlake, Dixie
- Key State Parks: Dead Horse Point, Goblin Valley, Snow Canyon, Coral Pink Sand Dunes, Antelope Island, Kodachrome Basin

### Water Bodies
- Great Salt Lake: two polygons — south arm (blue-green) + north arm (pink #C47088, halophilic bacteria)
- Utah Lake, Bear Lake (turquoise #40B8B0), Lake Powell, Flaming Gorge Reservoir
- Strawberry, Jordanelle, Deer Creek, Scofield, Starvation reservoirs
- Antelope Island MUST be carved out of the GSL polygon (not rendered as water)

### Regional Tints (like Aveneg's 8 Middle East tints)
| Idx | Region | Tint Character |
|-----|--------|---------------|
| 1 | Wasatch Front | Cool grey limestone |
| 2 | Uinta Mountains | Red-purple quartzite |
| 3 | Great Basin | Pale tan alkali |
| 4 | Colorado Plateau | Warm red-orange sandstone |
| 5 | Grand Staircase | Multi-band (per cliff step) |
| 6 | Mojave Fringe | Warm gold-tan |
| 7 | High Plateaus | Deep green forest |
| 8 | Uinta Basin | Dusty grey-brown |

### Geological Formation Zones (for shader coloring)
- Grand Staircase 5 cliff steps: Pink (Claron #EA7220) → Grey (Mancos #8A8A8A) → White (Navajo #F0E8DC) → Vermilion (Kayenta #A04428) → Chocolate (Moenkopi #6A4A38)
- Monument Valley: De Chelly formation (deep red #A83020)
- Arches/Moab: Entrada (salmon-orange #D47038)
- Canyonlands Needles: Cedar Mesa (red-white banded)
- Capitol Reef: Wingate (dark red-brown #A04428)
- Uinta Mountains: Uinta Group quartzite (red-purple)

### Vegetation Zones (6, elevation-driven)
| Zone | Elevation | Species |
|------|-----------|---------|
| Alpine tundra | >11,500 ft | Cushion plants, rock |
| Subalpine | 9,500-11,500 | Engelmann spruce, subalpine fir |
| Montane | 7,000-9,500 | Douglas fir, aspen (golden/green), blue spruce |
| PJ Woodland | 5,000-7,500 | Pinyon pine, Utah juniper (THE most widespread) |
| Sagebrush | 4,500-7,000 | Big sagebrush, rabbitbrush |
| Mojave | <3,500 (SW only) | Creosote, Joshua tree, cactus |
| Riparian | Along rivers | Cottonwood, willow |

---

## IMPLEMENTATION WAVES

### Wave 1: Project Foundation
- Delete current `src/` contents and rebuild from scratch
- Set up package.json with EXACT same dependencies as Aveneg (three ^0.183.2, gsap ^3.14.2, etc.)
- Create tsconfig.json, vite.config.ts, index.html, launch.command matching Aveneg patterns
- Create `src/core/hex/` — adapt HexCoord.ts, HexGrid.ts, HexUtils.ts from Aveneg
- Create `src/constants.ts` with Utah terrain types, colors, hex grid dimensions
- Create `src/core/map/Tile.ts` and `src/core/map/GameMap.ts`
- Create `src/utils/EventBus.ts`

### Wave 2: Geographic Data
- Create `src/core/map/UtahMapData.ts` following Aveneg's FixedMapData.ts pattern exactly
- Define all water bodies, regions, terrain zones, mountain ranges, rivers, roads, cities, feature zones, formation zones, parks as [lon,lat] polygon/polyline arrays
- Implement generateUtahMap() with the same 17-step pipeline as Aveneg's generateFixedMap()
- Antelope Island carve-out from Great Salt Lake
- Latitude correction for proper aspect ratio

### Wave 3: Core Rendering
- Create `src/rendering/three/ThreeRenderer.ts` — adapt from Aveneg (same init sequence)
- Create `src/rendering/three/ThreeCamera.ts` — orbit camera with WASD pan, Q/E rotate, F/C tilt
- Create `src/rendering/three/effects/SceneLighting.ts` — directional + ambient + hemisphere
- Create `src/rendering/three/effects/AtmosphereEffect.ts` — sky sphere that follows camera
- Create `src/rendering/ProceduralNoise.ts` — all noise functions
- Create `src/rendering/HeightMapGenerator.ts` — Utah-adapted height pipeline with laccolith dome profiles
- Build terrain mesh: continuous vertex grid at GRID_SPACING=2.0, per-vertex height/color, mountain depth BFS, foothill blending, Laplacian smoothing, coastline perturbation, chunk system

### Wave 4: Shader Pipeline + Overlays
- Create `src/rendering/three/terrain/TerrainMaterial.ts` — onBeforeCompile GLSL for all 15 Utah terrain types
- Create `src/rendering/three/terrain/RiverMap.ts` — river rasterization to 2048² DataTexture
- Create `src/rendering/three/terrain/RoadMap.ts` — road SDF rasterization
- Create `src/rendering/RegionalFeatureMap.ts` — per-tile RGBA (ridge angles, tints, features, snow)
- Create `src/rendering/RegionalMappings.ts` — Utah region tints and ridge angles
- Create `src/rendering/three/terrain/ShadowBaker.ts` — baked shadow + AO
- Create `src/rendering/three/terrain/HeightMapBaker.ts` — baked height for normals
- Create `src/rendering/three/terrain/WaterPlane.ts` — Gerstner wave water with per-lake coloring
- Wire ALL overlay textures into the shader (rivers, roads, features, shadows, height — the current project builds these but NEVER samples them in GLSL)
- Update uTime each frame for animated effects

### Wave 5: Objects + Vegetation + Landmarks
- Create `src/rendering/three/objects/VegetationScatter.ts` — 6 vegetation zones, InstancedMesh with dual LOD
- Create `src/rendering/three/objects/LandmarkSculptor.ts` — 30+ landmark height/tint sculpting functions
- Create `src/rendering/three/objects/CityMarkers.ts` — city markers with text labels
- Create `src/rendering/three/objects/ParkBoundaries.ts` — colored park outlines
- Wire ALL into ThreeRenderer.buildTerrain() and the render/LOD loop

### Wave 6: UI + Polish
- Create `src/rendering/three/PickingSystem.ts` — raycasting tile selection
- Create `src/ui/Tooltip.ts` — hover tooltip showing region/terrain/elevation
- Create `src/ui/InfoPanel.ts` — click-to-open detailed tile info
- Create `src/ui/SearchPanel.ts` — `/` key search for cities/parks/landmarks
- Create `src/ui/LegendPanel.ts` — L key terrain color legend
- Create `src/rendering/three/overlays/MinimapRenderer.ts` — M key canvas minimap
- Create `src/rendering/three/overlays/GridOverlay.ts` — G key hex grid wireframe
- Create `src/rendering/GraphicsSettings.ts` — quality presets (low/med/high/ultra)
- Create `src/rendering/RenderScheduler.ts` — dirty-flag rendering
- `\` key toggles fullscreen
- Keyboard: 1/2/3/4 cycle quality presets

### Wave 7: Testing + Verification
- Write tests for map generation (tile counts, terrain distribution, city placement, etc.)
- Run `npx tsc --noEmit` — must pass with zero errors
- Run `npx vitest run` — all tests pass
- Visual verification: terrain loads, mountains dramatic, canyons deep, rivers visible, cities labeled, parks outlined
- Performance: 60fps on M2 Pro at default zoom

---

## WHAT TO PRESERVE FROM CURRENT PROJECT
- `~/Desktop/utah/` as the project location
- The geographic research data (water body positions, mountain range polygons, river paths, city coordinates) in `src/data/` — these are largely accurate and can be adapted to hex coordinates
- The general concept of 15 terrain types and 18 terrain features

## WHAT TO DELETE AND REBUILD
- ALL files in `src/core/grid/` (square grid → hex grid)
- `src/core/map/UtahMapData.ts` (rewrite for hex grid with proper pipeline)
- `src/rendering/three/ThreeRenderer.ts` (rewrite following Aveneg patterns)
- `src/rendering/three/ThreeCamera.ts` (rewrite with proper WASD/QE/FC controls)
- `src/rendering/three/terrain/TerrainMaterial.ts` (rewrite with ALL uniforms properly wired)
- ALL effect/overlay/object files (rewrite to actually be called and functional)

---

## SUCCESS CRITERIA
1. TypeScript compiles with zero errors
2. All tests pass
3. Opening localhost shows a dramatic 3D hex-based terrain map of Utah
4. Mountains (Wasatch, Uintas) rise dramatically with ~18x vertical exaggeration
5. Canyons (Colorado, Green, Zion) carve deeply into plateaus
6. All 15 terrain types are visually distinct with proper colors
7. Rivers are visible as blue overlay on terrain
8. Roads (I-15, I-80, I-70) are visible
9. Cities have markers and labels
10. National parks have colored boundary outlines
11. Vegetation varies correctly with elevation (alpine → subalpine → montane → PJ → sagebrush → Mojave)
12. Great Salt Lake shows pink north arm / blue south arm with Antelope Island as land
13. WASD pans, Q/E rotates, F/C tilts, mouse drag orbits, scroll zooms
14. `/` opens search, L toggles legend, M toggles minimap, G toggles hex grid, `\` toggles fullscreen
15. Tooltip shows tile info on hover, info panel on click
16. Sustained 60fps on M2 Pro MacBook at all zoom levels
