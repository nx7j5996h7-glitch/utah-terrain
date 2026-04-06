# Utah 3D Terrain Map — Architecture, Graphics, and Design Guide

Comprehensive documentation of how the Utah terrain visualization works, its strengths and weaknesses, performance characteristics, and architectural decisions.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Coordinate System](#2-coordinate-system)
3. [Real Elevation Data](#3-real-elevation-data)
4. [Terrain Mesh Pipeline](#4-terrain-mesh-pipeline)
5. [Terrain Material & Shaders](#5-terrain-material--shaders)
6. [River System](#6-river-system)
7. [Water Rendering](#7-water-rendering)
8. [Vegetation System](#8-vegetation-system)
9. [Landmark Sculpting](#9-landmark-sculpting)
10. [Camera & Controls](#10-camera--controls)
11. [Performance Analysis](#11-performance-analysis)
12. [Visual Options & Tradeoffs](#12-visual-options--tradeoffs)
13. [Comparison with Aveneg](#13-comparison-with-aveneg)
14. [Known Issues & Future Work](#14-known-issues--future-work)

---

## 1. Architecture Overview

The map is a Three.js WebGL application rendering the full state of Utah (~429km x 557km) at 1:1 metric scale. Key systems:

- **GeoCoord** — WGS84 (lon/lat) to world-space conversion (1 world unit = 1 meter)
- **TerrainMeshBuilder** — generates a continuous vertex grid from USGS heightmap data
- **TerrainMaterial** — GLSL shader with 15 procedural terrain patterns, per-river colors, road overlays
- **RiverMap** — rasterizes OSM river paths into a 4096x4096 RGBA texture
- **WaterPlane** — per-lake Gerstner wave water surfaces at real elevations
- **VegetationScatter** — 12 vegetation types via InstancedMesh with dual LOD tiers
- **LandmarkSculptor** — 37 iconic Utah landmarks with custom height/tint functions

### File Structure
```
src/core/geo/GeoCoord.ts          — coordinate conversion (the foundation)
src/core/map/UtahMapData.ts       — continuous terrain sampler (sampleTerrainAt)
src/core/map/GameMap.ts           — grid-based tile container
src/rendering/three/terrain/      — mesh builder, material, river/road maps, water
src/rendering/three/objects/      — vegetation, city markers, landmarks
src/rendering/three/effects/      — lighting, atmosphere, weather
src/data/                         — geographic polygon/polyline definitions
```

---

## 2. Coordinate System

### 1:1 Metric Projection

The map uses an equirectangular projection centered at Utah's latitude (39.5N):

```
METERS_PER_DEG_LON = 111320 * cos(39.5) = ~85,816 m/deg
METERS_PER_DEG_LAT = 111,320 m/deg

geoToWorld(lon, lat):
  x = (lon - UTAH_WEST) * -85816    (negative = east)
  z = (UTAH_NORTH - lat) * -111320  (negative = south)
```

World bounds: X from 0 to ~-429,080 meters, Z from 0 to ~-556,600 meters.

**Strengths:**
- True metric scale — all distances are real meters
- Simple linear math — no hex shear or non-orthogonal projection
- `worldToGeo()` is trivial division (exact inverse)
- Works with logarithmic depth buffer for the 800km+ far plane

**Weaknesses:**
- Equirectangular distortion increases at extreme latitudes (negligible for Utah's 5-degree span)
- All world coordinates are negative (historical sign convention) — can confuse debugging
- Float32 precision at edges (~5cm at 429,000m) — acceptable for terrain, marginal for sub-centimeter work

### Previous System (removed)

The original system used hex coordinates (q, r) with negated X axis and a non-orthogonal shear in Z. This was removed because:
1. Hex quantization caused visible texture boundary artifacts
2. The hex grid served no gameplay purpose (not a game)
3. 9 different `geoToWorld` functions had to stay synchronized
4. The sheared coordinate math was error-prone (multiple east/west flip bugs)

---

## 3. Real Elevation Data

### USGS Heightmap

The terrain uses real USGS/SRTM elevation data stored as an RGB-encoded PNG (`public/utah-elevation.png`):

- **Resolution:** 2048 x 2560 pixels (zoom level 9)
- **Encoding:** 16-bit elevation in R*256 + G channels
- **Elevation range:** 226m (Great Salt Lake bed) to 4354m (Kings Peak)
- **Coverage:** -114.609 to -108.984 lon, 36.598 to 42.033 lat

### Height Sampling

`HeightMapGenerator.sampleRealHeight(worldX, worldY)` converts world position to geographic coordinates, samples the heightmap with bilinear interpolation, and returns elevation in meters relative to the GSL datum (1280m).

**Strengths:**
- Real topography — every canyon, mesa, and mountain is in the correct position
- 16-bit precision gives sub-meter elevation accuracy
- No procedural noise needed for large-scale terrain shape
- Micro-detail noise added on top for surface texture (5m amplitude)

**Weaknesses:**
- Fixed resolution (~107m per texel) — can't resolve features smaller than ~100m
- Single static file — can't stream higher resolution tiles for close-up viewing
- ~7.6MB download — significant for initial page load

### Vertical Scale

`VERTICAL_EXAGGERATION = 1.0` — true 1:1 scale. Utah's relief (3453m range) is small compared to the 429km width (0.8% ratio). At map overview distances, mountains appear subtle but realistic.

---

## 4. Terrain Mesh Pipeline

### TerrainMeshBuilder.build()

The terrain is generated as a continuous vertex grid with `GRID_SPACING = 250m` between vertices, producing approximately 1716 x 2226 = ~3.8M vertices covering the full state.

**Pipeline steps:**

1. **World bounds** — computed from geographic extent + padding
2. **Vertex generation** — for each grid vertex:
   - Convert (wx, wz) to (lon, lat) via `worldToGeo()`
   - Call `sampleTerrainAt(lon, lat)` for terrain type, region, features
   - Call `getHeight(wx, -wz, ...)` for elevation from USGS heightmap
   - Compute vertex color from terrain type + noise + hillshade + formation
3. **Coastal smoothing** — 8-pass Laplacian smooth on water/land boundary
4. **Landmark sculpting** — 37 landmarks modify height and color
5. **Terrain boundary blending** — grid-neighbor color averaging at terrain transitions
6. **Mountain smoothing** — disabled (real data is smooth enough)
7. **River valley carving** — CPU-side valley depression using river texture data
8. **Index buffer** — alternating diagonal split for quad triangulation
9. **Chunk splitting** — 8x8 spatial chunks for rendering

**Strengths:**
- Continuous vertex grid eliminates hex-boundary artifacts
- Direct geographic sampling — terrain types follow real polygon boundaries
- Real heightmap provides correct elevation everywhere
- Vertex colors include hillshade, geological formation tinting, snow cover
- River valley carving creates realistic canyon profiles

**Weaknesses:**
- Uniform grid — same resolution everywhere, no view-dependent LOD
- ~3.8M vertices is heavy (borderline for 60fps on M2 Pro)
- Build time: 3-8 seconds depending on hardware
- `sampleTerrainAt()` is called per-vertex — polygon containment checks are O(n) per polygon
- If GRID_SPACING increased for performance, terrain detail degrades everywhere

### Tessellation Appearance

The triangulated mesh has a visible tessellated/faceted look, especially on steep mountain slopes. This is caused by flat-shaded triangles at 250m spacing.

**This is actually an interesting aesthetic option.** The tessellation gives the map a stylized, low-poly look reminiscent of strategy game terrain (Civilization, Total War). Some users find it visually appealing.

**Options for controlling tessellation:**
- **GRID_SPACING = 250** (current) — visible facets on mountains, smooth deserts. ~3.8M verts.
- **GRID_SPACING = 400** — more visible tessellation, strategy-game aesthetic. ~1.5M verts. 60fps guaranteed.
- **GRID_SPACING = 150** — smoother mountains, less visible facets. ~10.5M verts. May drop below 60fps.
- **GRID_SPACING = 100** — near-smooth. ~23.6M verts. Will not run at 60fps without CDLOD.
- **flatShading: true** on material — enforces the tessellated look. Currently `flatShading: false`.
- **Vertex normal smoothing** — the builder computes vertex normals and applies minimum Y bias. Increasing the bias makes normals more upward-facing, reducing steep-face darkening but losing cliff detail.

**Performance impact:** Triangle count scales as `1/GRID_SPACING^2`. Halving spacing = 4x triangles.

---

## 5. Terrain Material & Shaders

### Architecture

The terrain uses `MeshStandardMaterial` with extensive `onBeforeCompile` injection. This gives us PBR lighting + shadows while adding custom procedural patterns.

### Vertex Shader Additions
- River bank depression (depress Y near rivers)
- 2-frequency Gerstner waves on river water surfaces
- Attribute passthrough (terrainType, terrainBlend, snowCover, coastDist)

### Fragment Shader: 15 Terrain Patterns

Each terrain type has a unique GLSL pattern:

| Index | Type | Pattern Description |
|-------|------|-------------------|
| 0 | salt_flat | Voronoi polygon cracks + gentle undulation |
| 1 | desert | Dune ridges + heat shimmer |
| 2 | sagebrush | Rolling hills + bush ID hash |
| 3 | red_sandstone | Cross-bedding layers + desert varnish + grain |
| 4 | white_sandstone | Dome swirls + soft grain |
| 5 | canyon_floor | FBM swirl + oxide stain |
| 6 | mountain | 5-zone altitude banding + cliff darkening + geological strata |
| 7 | conifer_forest | Canopy breaks + cottonwood patches near rivers |
| 8 | alpine | Rock + snow noise |
| 9 | river_valley | Field patchwork + hedgerow lines |
| 10 | marsh | Voronoi cracks + reed clusters |
| 11 | urban | City block grid + material variation |
| 12 | badlands | Erosion ripples + smooth clay |
| 13 | lava_field | Basalt flow oxide + rough blocks |
| 14 | water | (handled by WaterPlane) |

### Noise Scaling

All noise frequencies in the fragment shader use a pre-scaled `wp = vWorldPos.xz * 0.0112` to maintain visual pattern density at 1:1 metric scale. This single scaling factor (1/89) compensates for the ~89x larger world compared to the original coordinate system.

**Strengths:**
- Rich procedural detail without textures — infinite resolution at any zoom
- Per-terrain patterns give each region a distinct visual identity
- Formation-aware coloring (14 geological formations) adds geological realism
- Snow cover with noise-warped treeline
- Bump mapping with per-terrain scale and frequency

**Weaknesses:**
- Complex shader (700+ lines GLSL) — hard to debug, shader compilation time
- All patterns are procedural — they look "generated" rather than photographic
- No texture splatting — can't use real satellite imagery
- Distance-based LOD in shader (octave reduction) can cause visible quality transitions
- The `wp` scaling factor couples shader math to the coordinate system

### River Overlay

Rivers are rendered as a fragment shader overlay reading the 4096x4096 RiverMap texture:

- **R channel:** river mask (antialiased)
- **G channel:** river ID (0-15) — indexes into `uRiverColors[16]` uniform array
- **B channel:** flow angle (0-360 degrees)
- **A channel:** valley depth (for CPU carving)

Per-river colors match real geology:
- Colorado/San Juan: muddy red-brown `[0.55, 0.35, 0.17]`
- Green River: olive-green `[0.45, 0.50, 0.35]`
- Bear/Weber/Provo: blue-green `[0.15, 0.42, 0.52]`
- Virgin: milky green-blue `[0.25, 0.55, 0.50]`

Rivers blend at 95% opacity with center darkening for depth appearance.

---

## 6. River System

### Data Source

River paths are fetched from OpenStreetMap via the Overpass API (`scripts/fetch-rivers-osm.mjs`). The script:

1. Queries each named river within Utah bounds
2. Stitches multi-way OSM segments into continuous polylines
3. Applies adaptive Douglas-Peucker simplification:
   - General tolerance: 0.001 degrees (~111m)
   - Meander zones (Dead Horse Point, Goosenecks): 0.0003 degrees (~33m)
4. Outputs `src/data/rivers-detailed.ts` with 11 rivers, 5504 total waypoints

### Iconic Features

The Dead Horse Point meander (~-109.74, 38.46) — a dramatic 270-degree bend in the Colorado River — should be visible with sufficient detail (~29 texels across at 4096 texture resolution). The Goosenecks of the San Juan (~-109.93, 37.17) similarly span 10-15 texels per meander.

### Valley Carving

Rivers carve valleys into the terrain mesh (TerrainMeshBuilder Step 10):
- **Center depth:** 150m (visible against ~3000m mountain heights)
- **Valley radius:** 2000m (8 grid cells at 250m spacing)
- **Water drop:** 50m below surrounding terrain
- **BFS flood-fill** for valley distance computation

**Strengths:**
- Real OSM paths — meanders, confluences, and braids are geographically accurate
- Per-river colors — Colorado is brown, Bear is blue-green (matches reality)
- Adaptive simplification preserves iconic features
- Valley carving creates realistic canyon profiles

**Weaknesses:**
- 6 rivers failed to fetch from OSM (rate limiting) — San Juan, Weber, Provo, etc. missing from detailed data
- 4096 texture = ~105m per texel — rivers under 100m wide are subpixel
- Valley carving is uniform — doesn't respect actual canyon geometry from the heightmap
- Rivers at 1:1 scale (150m wide Colorado) are only ~1.4 texels wide — barely visible
- No river geometry mesh — rivers are purely a texture overlay, no 3D water surface

---

## 7. Water Rendering

### Per-Lake Water Planes

Each water body gets its own Three.js plane mesh positioned at its real elevation:

| Lake | Elevation (m) | World Y |
|------|--------------|---------|
| Great Salt Lake | 1280 | 0 (datum) |
| Utah Lake | 1368 | 88 |
| Bear Lake | 1805 | 525 |
| Strawberry Reservoir | 2316 | 1036 |
| Fish Lake | 2713 | 1433 |
| Lake Powell | 1091 | -189 |

### Gerstner Waves

The water shader uses 4 Gerstner waves with domain warping:
- Wavelengths: 1340m to 4900m (scaled for 1:1)
- Steepness: 0.01-0.02 (calm lake waves)
- Per-pixel ripple normals + Fresnel reflection + caustic dappling

**Strengths:**
- Per-lake planes at correct elevations — lakes sit flush with surrounding terrain
- Gerstner waves give realistic wave motion
- Fully opaque with no transparency artifacts
- Water vertex Y set to terrain elevation - 5m (prevents deep canyon walls at lake edges)

**Weaknesses:**
- Water planes are rectangular bounding boxes — they extend beyond actual lake shapes
- No water mesh geometry (planar only) — no wave interaction with shorelines
- Shared material for all lakes — can't have per-lake wave parameters
- Pink GSL north arm color override not applied to the wave shader (only vertex color)

---

## 8. Vegetation System

### 12 Types

| Type | Real Species | Height (m) | Distribution |
|------|-------------|-----------|--------------|
| conifer | Engelmann spruce, subalpine fir | 20 | Mountain forests |
| aspen | Quaking aspen | 15 | High valleys, N-facing slopes |
| pinyon | Pinyon pine | 6 | Colorado Plateau 1500-2100m |
| juniper | Utah juniper | 7 | Dry foothills, mesas |
| cottonwood | Fremont cottonwood | 18 | Riparian corridors |
| sagebrush | Big sagebrush | 1 | Great Basin dominant |
| rabbitbrush | Rubber rabbitbrush | 0.8 | Disturbed soils |
| cactus | Prickly pear, barrel | 1.5 | Low desert |
| joshua_tree | Joshua tree | 8 | Mojave Fringe only |
| rock | Rock outcrop | 2 | Mountain, canyon |
| boulder | Large boulder | 4 | Talus, riverbeds |
| grass_tuft | Desert grass, cheatgrass | 0.4 | Throughout |

### LOD System

Two-tier InstancedMesh system:
- **Detail tier** (0-5km): Full 3D geometry (50-200 triangles per instance)
- **LOD tier** (5-15km): Simplified geometry (6-12 triangles)
- **Beyond 15km:** Terrain vertex colors provide forest appearance (no instances)

Instance caps: 163,000 total across all types.

**Strengths:**
- Region-aware density (Mojave gets cactus, High Plateaus boost conifer)
- Feature overrides (pinyon_juniper, dense_forest/forest/woodland tiers)
- Riparian boost near waterways
- Deterministic hash-based placement (consistent across reloads)
- Spatial grid for efficient LOD updates

**Weaknesses:**
- At 1:1 scale, 163k instances is sparse — forests look thin
- No billboard tier (3D → nothing transition is abrupt)
- No merged static geometry for mid-distance chunks
- InstancedMesh frustum culling disabled (bounding sphere issues)
- Tree geometries are simple primitives (cones, spheres) — not photorealistic
- Sagebrush at 1.2m radius × 30,000 instances = dominant visual element but looks repetitive

---

## 9. Landmark Sculpting

37 iconic Utah locations with custom height and tint functions:

- **Arches NP** — heightFn creates fin-and-arch topography
- **Bryce Canyon** — hoodoo spire fields
- **Monument Valley** — flat-topped buttes rising from desert floor
- **Zion Canyon** — deep V-cut canyon with wall tinting
- **Bonneville Salt Flats** — perfectly flat white terrain
- etc.

Applied at build time to the vertex grid (modifies heights + colors directly).

---

## 10. Camera & Controls

- **OrbitControls** with azimuth=PI (looking north from south)
- **Logarithmic depth buffer** — enables near=10, far=1,000,000 without z-fighting
- **Pan speed** scales with camera altitude: `CAMERA_PAN_SPEED * dt * (camY / 8000)`
- **Terrain clamping:** camera stays 100m above terrain surface
- **Compass HUD** — rotates with camera azimuth
- **Minimap** — 2D canvas overlay showing full state

---

## 11. Performance Analysis

### Triangle Budget

| Component | Triangles | Draw Calls |
|-----------|-----------|------------|
| Terrain chunks (8x8) | ~7.6M | 64 |
| Detail vegetation | ~3M (15k instances x 200 tri) | 12 |
| LOD vegetation | ~600k (50k x 12 tri) | 12 |
| Water planes | ~50k | 14 |
| City markers | ~2k | ~30 |
| **Total** | **~11.3M** | **~132** |

### Bottlenecks

1. **Terrain vertex count** (3.8M verts / 7.6M tris) — largest single cost. GRID_SPACING=250 is the critical parameter.
2. **Fragment shader complexity** — 15 terrain patterns with noise, bump mapping, river/road overlays. Heavy per-pixel.
3. **Vegetation instance updates** — CPU-side matrix filling on LOD changes.
4. **Build time** — 3-8 seconds initial terrain generation (single-threaded JS).

### GRID_SPACING Impact

| GRID_SPACING | Vertices | Triangles | Build Time | Visual Quality |
|-------------|----------|-----------|------------|----------------|
| 100 | 23.6M | 47.2M | ~30s | Smooth, nearly photographic |
| 150 | 10.5M | 21.0M | ~15s | Good quality, slight facets on peaks |
| 250 (current) | 3.8M | 7.6M | ~5s | Visible tessellation on mountains |
| 400 | 1.5M | 3.0M | ~2s | Strategy-game aesthetic, fast |
| 600 | 0.66M | 1.3M | ~1s | Low-poly look, very fast |

### Optimization Opportunities

1. **CDLOD quadtree terrain** — view-dependent resolution, 50-150 patches visible at any time. Would replace uniform grid with GPU-side heightmap sampling. Major engineering effort but solves the fundamental vertex count problem.
2. **Heightmap texture streaming** — load high-res tiles near camera, coarse tiles far away. Requires tile pyramid generation from USGS data.
3. **Web Workers** — move vertex generation to a worker thread. Data transfer overhead (~7.6MB heightmap) partially offsets parallelization gains.
4. **Noise lookup tables** — pre-compute deterministic noise values into Float32Arrays before the vertex loop. ~5MB memory for ~30% noise evaluation speedup.
5. **Billboard vegetation tier** — textured quads at 2-10km would fill the gap between 3D instances and terrain color.

---

## 12. Visual Options & Tradeoffs

### Tessellation Aesthetic

The faceted/tessellated look from the triangulated mesh is configurable and is genuinely an aesthetic choice, not purely a quality issue.

**Arguments for visible tessellation (GRID_SPACING >= 400):**
- Gives the map a stylized, strategic look (Civilization/Total War aesthetic)
- Smooth performance (1.5M triangles at 400m spacing)
- Mountains have dramatic angular profiles
- Color boundaries between terrain types become crisp geometric edges
- Reminiscent of paper craft or topographic physical models
- Loads in ~2 seconds

**Arguments against (GRID_SPACING <= 200):**
- More realistic/photographic appearance
- Smooth mountain ridgelines
- Less jarring at close zoom distances
- Better represents real canyon/cliff geometry
- But: requires CDLOD for 60fps at GRID_SPACING < 200

**Hybrid approach:** Use GRID_SPACING=400 as the default with a quality toggle. Or implement CDLOD for adaptive resolution (200m near camera, 1000m far away).

### Vertical Exaggeration

Currently `VERTICAL_EXAGGERATION = 1.0` (true 1:1). Options:

| Exaggeration | Kings Peak Height | Visual Effect | Use Case |
|-------------|-----------------|---------------|----------|
| 1.0x | 3074m | Realistic but subtle mountains | Geographic accuracy |
| 2.0x | 6148m | Noticeable relief | Topographic map feel |
| 3.0x | 9222m | Dramatic mountains | Strategy game aesthetic |
| 5.0x | 15370m | Exaggerated, stylized | Presentation/poster |

**Recommended:** Dynamic exaggeration based on camera altitude (1x at ground, 3x at overview). Implemented as a vertex shader uniform — no mesh rebuild needed.

### Per-River Colors vs Uniform Blue

**Per-river (current):** Colorado is brown, Bear is blue — matches reality. More educational/accurate.

**Uniform blue:** All rivers same color. Simpler, more "map-like". Less realistic.

The per-river approach is more interesting but requires the river ID encoding in the texture G channel and the `uRiverColors[16]` uniform array.

---

## 13. Comparison with Aveneg

Aveneg (Trump: Total War) is the reference project this map was architecturally based on. Key differences:

### What Utah Does Better

| Feature | Utah | Aveneg |
|---------|------|--------|
| **Elevation data** | Real USGS 16-bit heightmap | Procedural noise only |
| **Scale** | 1:1 metric (429km x 557km) | Compressed game-scale |
| **River detail** | OSM data (5504 waypoints) | Hand-authored (~100 points) |
| **River colors** | Per-river geological colors | Uniform blue |
| **Geological formations** | 14 formation types with vertex coloring | None |
| **Landmark sculpting** | 37 custom landmark height/tint functions | Generic |
| **Coordinate system** | Clean orthogonal metric projection | Hex-based with shear |
| **Water elevations** | Per-lake real elevations | All at Y=0 |

### What Aveneg Does Better

| Feature | Aveneg | Utah |
|---------|--------|------|
| **Game mechanics** | Full strategy game (units, combat, fog of war) | Pure visualization |
| **LOD terrain** | Chunk-based with multiple resolution tiers | Uniform grid (no LOD) |
| **Vegetation** | Mature multi-tier with billboards | 2-tier only, no billboards |
| **Performance** | Optimized for 60fps gameplay | Borderline at full detail |
| **Hex grid** | Essential for gameplay (movement, combat) | Removed (vestigial) |
| **Forest rendering** | Merged static chunks at distance | InstancedMesh only |
| **Build time** | Fast (smaller map) | 3-8 seconds |

### Architectural Similarities

Both projects share:
- MeshStandardMaterial with onBeforeCompile injection
- Per-terrain GLSL procedural patterns (15 types)
- InstancedMesh vegetation with spatial grid LOD
- Gerstner wave water planes
- Custom fog shader chunk
- CompassHUD with azimuth rotation
- River texture overlay system

### Key Architectural Difference

Aveneg uses hex coordinates as a gameplay foundation — every system (movement, combat, fog of war, territory) depends on discrete hex tiles. Utah removed hex coordinates entirely in favor of continuous geographic sampling because:
1. No gameplay requires discrete tiles
2. Hex quantization created visible texture boundary artifacts
3. Geographic polygons provide more accurate terrain type boundaries
4. The coordinate math is simpler without hex shear

---

## 14. Known Issues & Future Work

### Known Issues

1. **6 rivers missing** from OSM data (rate limited during fetch). Re-run `scripts/fetch-rivers-osm.mjs` to retry.
2. **River texture resolution** at 1:1 scale: 4096 texture covering 429km = ~105m/texel. Rivers under 100m wide are subpixel.
3. **No CDLOD** — the uniform 250m grid is heavy for real-time rendering. Performance-sensitive users should increase GRID_SPACING.
4. **Water plane bounding boxes** extend beyond actual lake boundaries.
5. **Vegetation is sparse** at 1:1 scale — 163k instances covers an area that should have millions of trees.
6. **No billboard vegetation tier** — trees abruptly disappear at LOD boundary.

### Future Work (Priority Order)

1. **CDLOD quadtree terrain** — the single biggest improvement. Replace uniform grid with camera-distance-adaptive resolution.
2. **Billboard vegetation tier** — textured quads at 2-10km distance.
3. **Heightmap tile streaming** — load high-res elevation data near camera.
4. **River geometry mesh** — 3D water surface for major rivers (not just texture overlay).
5. **Dynamic vertical exaggeration** — shader uniform, 1x near ground to 3x at overview.
6. **Terrain forest tinting** — shader-based green tint beyond vegetation render distance.
7. **Satellite imagery overlay** — optional mode using real satellite tiles.
8. **Web Worker terrain generation** — move vertex loop off main thread.
