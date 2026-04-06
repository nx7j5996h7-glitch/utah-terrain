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
13. [Loading Cost Analysis](#13-loading-cost-analysis)
14. [Version History & Development](#14-version-history--development)
15. [Comparison with Aveneg](#15-comparison-with-aveneg)
16. [Known Issues & Future Work](#16-known-issues--future-work)

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

## 13. Loading Cost Analysis

### Initial Load Breakdown

The app performs these operations on first load, in sequence:

| Step | What it does | Time (M2 Pro) | Data Size | Blocking? |
|------|-------------|---------------|-----------|-----------|
| 1. Heightmap fetch | Download `utah-elevation.png` from local server | 50-200ms | 7.6 MB | Yes (network) |
| 2. Heightmap decode | Canvas drawImage + getImageData to decode RGB→elevation | 100-300ms | 20 MB decoded | Yes (CPU) |
| 3. Map generation | `generateUtahMap()` — 22,400 tiles, polygon containment checks | 200-500ms | ~2 MB | Yes (CPU) |
| 4. Terrain mesh build | `TerrainMeshBuilder.build()` — vertex generation, smoothing, carving | 3,000-8,000ms | ~180 MB GPU | Yes (CPU) |
| 5. River rasterization | `RiverMap.build()` — 4096x4096 texture from 5504 waypoints | 200-400ms | 64 MB texture | Yes (CPU) |
| 6. Road rasterization | `RoadMap.build()` — 4096x4096 SDF texture | 100-200ms | 16 MB texture | Yes (CPU) |
| 7. Shadow baking | `ShadowBaker.build()` — 512x512 raymarch | 100-300ms | 1 MB texture | Yes (CPU) |
| 8. Water planes | `WaterPlane.build()` — 14 plane meshes | <50ms | ~2 MB GPU | No |
| 9. Vegetation scatter | `VegetationScatter.build()` — 163k instance placement | 500-1500ms | ~12 MB GPU | Yes (CPU) |
| 10. UI initialization | City markers, labels, minimap, compass | <100ms | ~1 MB | No |
| **Total** | | **5-12 seconds** | **~300 MB** | |

### Step 4 Deep Dive — Terrain Build

The terrain build (Step 4) dominates load time at 60-70% of total. Within it:

| Sub-step | What | Time (ms) | Notes |
|----------|------|-----------|-------|
| Vertex positions + heights | Sample heightmap per vertex (3.8M calls) | 1500-3000 | `sampleRealHeight()` per vertex |
| Vertex colors | `computeVariedColor()` with 5 noise evals per vertex | 800-2000 | Most expensive sub-step per vertex |
| Coastal smoothing | 8-pass Laplacian on boundary vertices | 200-500 | Scales with coast length, not vertex count |
| Landmark sculpting | 37 landmarks modify heights + colors | 100-300 | Only touches vertices within radius |
| Boundary blending | 8-neighbor terrain type comparison per vertex | 300-600 | Skips interior vertices |
| River valley carving | BFS + depression on river-adjacent vertices | 200-500 | Only river-adjacent vertices |
| Chunk splitting | Sort vertices into 64 chunks + build BufferGeometry | 200-400 | Memory-bound (copying arrays) |

### Loading Options & Their Costs

#### Option A: Current Default (GRID_SPACING=250)
- **Load time:** 5-8 seconds
- **GPU memory:** ~300 MB
- **Runtime FPS:** 30-50 fps (M2 Pro), 15-30 fps (M1 Air)
- **Visual quality:** Good — visible tessellation on mountains, smooth deserts
- **Best for:** Development, powerful hardware

#### Option B: Fast Load (GRID_SPACING=400)
- **Load time:** 2-4 seconds
- **GPU memory:** ~180 MB
- **Runtime FPS:** 55-60 fps (M2 Pro), 30-45 fps (M1 Air)
- **Visual quality:** Strategy-game aesthetic — visible facets everywhere
- **Best for:** Presentations, weaker hardware, when load time matters

#### Option C: Quality (GRID_SPACING=150)
- **Load time:** 12-20 seconds
- **GPU memory:** ~500 MB
- **Runtime FPS:** 15-30 fps (M2 Pro) — below target
- **Visual quality:** Smooth mountains, minimal faceting
- **Best for:** Screenshots, offline rendering — not real-time

#### Option D: Ultra-Low-Poly (GRID_SPACING=600)
- **Load time:** 1-2 seconds
- **GPU memory:** ~80 MB
- **Runtime FPS:** 60 fps (any hardware)
- **Visual quality:** Deliberately low-poly, abstract
- **Best for:** Mobile, embedded, rapid prototyping

#### Option E: CDLOD Quadtree (not yet implemented)
- **Load time:** <1 second (heightmap upload to GPU only)
- **GPU memory:** ~50 MB + streaming tiles
- **Runtime FPS:** 60 fps (50-150 patches visible)
- **Visual quality:** 100m near camera, 1km far — best of all worlds
- **Best for:** Production deployment — the correct solution

### Texture Memory Budget

| Texture | Resolution | Format | GPU Memory |
|---------|-----------|--------|------------|
| River map | 4096x4096 | RGBA8 | 64 MB |
| Road SDF | 4096x4096 | R8 | 16 MB |
| Heightmap (CPU only) | 2048x2560 | decoded RGBA | 20 MB CPU only |
| Shadow/AO | 512x512 | RGBA8 | 1 MB |
| Regional features | 160x140 | RGBA8 | <0.1 MB |
| Sky gradient | 2x512 | RGBA8 | <0.1 MB |
| **Total GPU textures** | | | **~81 MB** |

The river/road textures at 4096x4096 are the largest memory consumers. Reducing to 2048x2048 saves ~60 MB but halves resolution (rivers become ~52m/texel, most rivers invisible).

### Network Transfer

| Asset | Size | Cached? |
|-------|------|---------|
| `utah-elevation.png` | 7.6 MB | Yes (browser cache) |
| `utah-elevation-meta.json` | 0.2 KB | Yes |
| JavaScript bundle | ~180 KB (gzip) | Yes |
| CSS | 0.3 KB | Yes |
| Country Roads MP3 (if present) | ~5 MB | Yes |
| **First load** | **~13 MB** | |
| **Repeat load** | **~0 MB** | (all cached) |

### Background Tab Loading

The terrain build uses `MessageChannel`-based yielding instead of `setTimeout` to avoid browser throttling in background tabs. Browsers throttle `setTimeout` to ~1 second intervals in background tabs, which would turn a 5-second build into 90+ seconds. `MessageChannel.postMessage` is not throttled.

However, CSS animations (the loading bar) may still pause in background tabs — this is browser-controlled and cannot be overridden.

---

## 14. Version History & Development

This project has undergone extensive iterative development over a long session with Claude Code. The history below documents the major architectural decisions, bugs, and pivots.

### Pre-Git Era (v0.x — before version control)

#### v0.1 — Initial Scaffold
The project began as a Vite + TypeScript + Three.js scaffold with the goal of creating a geographically accurate 3D terrain map of Utah. The architecture was heavily inspired by the Aveneg/Trump: Total War project, which uses a hex-based terrain system for a Middle East strategy game. Multiple Claude Opus agents were deployed in parallel to research Aveneg's codebase and extract architectural patterns.

Key systems adapted from Aveneg:
- `MeshStandardMaterial` with `onBeforeCompile` GLSL injection
- 15 procedural terrain type patterns
- InstancedMesh vegetation with spatial grid LOD
- Gerstner wave water planes
- Custom fog shader chunk
- Flat-top axial hex coordinate system (q, r)

#### v0.2 — Geographic Data
Extensive geographic research produced hand-authored polygon data for Utah's regions, terrain zones, mountain ranges, rivers, roads, cities, parks, geological formations, and feature zones. This data lives in `src/data/` as TypeScript arrays of [lon, lat] coordinate pairs.

The data was researched by multiple parallel Claude agents studying Utah's geography, geology, ecology, and hydrology. Each data file represents dozens of hand-traced polygons covering the state.

#### v0.3 — Real Elevation Data
A critical improvement over Aveneg: instead of procedural noise for elevation, real USGS/SRTM elevation data was downloaded from AWS Terrain Tiles (Mapzen Terrarium format). A custom Node.js script (`scripts/fetch-heightmap-rgb.mjs`) downloads zoom-9 tiles covering Utah, stitches them, and encodes as a 2048x2560 RGB PNG with 16-bit precision (R*256+G).

This immediately gave the map real mountain profiles, canyon depths, mesa formations, and valley shapes — all in correct geographic positions.

#### v0.4 — The East/West Flip Saga
One of the most persistent bugs: the map was mirrored east/west. Salt Lake City appeared on the wrong side of the Wasatch Mountains. This was eventually traced to the hex coordinate system's `hexToPixel` function, which needed a negated X axis to produce correct east-on-right orientation with the camera at azimuth=PI.

The fix required negating X in `hexToPixel`, `pixelToHex`, and **nine separate `geoToWorld` functions** scattered across the codebase. Each had to match exactly, or rivers, roads, cities, and water bodies would drift from the terrain. This was the strongest argument for eventually removing hex coordinates entirely.

#### v0.5 — Water Rendering Iterations
Water rendering went through many iterations:
1. **Full-map water plane** — a single plane covering the entire map. Caused water to bleed through mountain valleys and canyon floors.
2. **Sunken water vertices** — water hex tiles placed at Y=-1.5. Created 50+ unit canyon cliffs at every lake edge where real heightmap terrain met the fixed-low water.
3. **Per-lake water planes** — individual planes for each water body polygon. Eliminated bleeding but rectangular bounding boxes extend beyond lake shapes.
4. **Transparent water** — alpha-blended water. Looked washed out at distance due to fog interaction. Changed to fully opaque.
5. **Water vertices at terrain level** — water hex vertices placed at Y=0 (water plane level) instead of sunken. Prevented canyon walls at lake edges.
6. **Water vertices at real elevation** (current) — sample the real heightmap and place water vertices 5m below terrain. Lakes sit flush with surroundings.

#### v0.6 — River Rendering Iterations
Rivers also went through major changes:
1. **Terrain type override** — rivers changed terrain type to `river_valley`, creating bright green bands across mountain slopes. Unrealistic.
2. **Shader overlay only** — rivers only set the `waterway` property; rendering is purely in the fragment shader as a blue-tint overlay on whatever terrain they cross. This is the current approach.
3. **Valley carving added** — CPU-side height depression along river paths so rivers sit in carved channels.
4. **Valley depth calibrated** — initially 2.0 (invisible), increased to 15.0, then to 150m at 1:1 scale.

#### v0.7 — Vegetation System
The vegetation system was built to match Aveneg's but with Utah-specific ecology:
- 12 vegetation types (Aveneg has similar variety for Middle East)
- Region-aware density tables (Mojave gets cactus + joshua tree, High Plateaus get conifer boost)
- Feature overrides (pinyon_juniper, dense_forest/forest/woodland tiers)
- Riparian boost near waterways

A critical bug: `VegetationScatter.updateLOD()` was never called in the render loop, making all vegetation invisible. Fixed by adding calls in both `render()` and `renderIfDirty()`.

#### v0.8 — Visual Polish
Multiple passes of visual refinement:
- **Tessellation visibility** — hillshade step was too small (3.0), making every triangle visible. Increased to 8.0 (now 500m at 1:1).
- **Pan speed** — went through 4→0.8→0.25 with altitude scaling to feel right.
- **Compass orientation** — was 180 degrees wrong due to azimuth=PI offset. Fixed with `+PI` in rotation.
- **Color accuracy** — salt flats changed to #F5F3F0, desert to #D4BA88 to match real Utah.
- **Smoothing passes** — global smoothing set to 0 (real data doesn't need it), mountain smoothing set to 0.
- **Fog** — custom shader chunk with clear-to-250-units + gentle exp² ramp, capped at 75% opacity.

#### v0.9 — Border Cleanup
Dead code removal:
- `BorderHexMesh.ts` — floating hex outlines, removed
- `ParkBoundaries.ts` — park boundary outlines, removed (floated in space)
- `EventBus.ts` — never imported, deleted
- Grid overlay — toggled with G key, now a no-op stub

### Git Era

#### v1.0 — Initial Git Commit
First `git init` and initial commit. 53 TypeScript files, TSC clean, build passing.

#### v1.1 — Hex Geometry Removal
**The biggest architectural change.** The entire hex coordinate system (HexCoord.ts, HexUtils.ts, HexGrid.ts) was removed and replaced with direct geographic (lon/lat) → world-space conversion via `GeoCoord.ts`.

Motivation:
- Hex quantization caused persistent texture boundary artifacts
- The map is a visualization, not a game — hex tiles served no purpose
- 9 different `geoToWorld` functions had to stay synchronized
- The sheared hex projection caused multiple coordinate bugs

The new system:
- `geoToWorld(lon, lat)` and `worldToGeo(wx, wz)` as canonical functions
- `sampleTerrainAt(lon, lat)` for continuous terrain sampling (no tile quantization)
- GameMap simplified from `HexGrid<Tile>` to plain `Map<string, Tile>`
- 6 dead files deleted, 20+ files updated, zero TSC errors

Verified numerically: new coordinates match old to within 10⁻¹² precision.

#### v2.0 — River Overhaul + 1:1 Metric Scale (current)

Two major changes in one release:

**Rivers:**
- OSM Overpass API fetch script created (`scripts/fetch-rivers-osm.mjs`)
- 11 rivers fetched with 5504 total waypoints (was 15 rivers with ~600 points)
- Per-river colors matching real geology (Colorado = red-brown, Bear = blue-green)
- River ID encoded in texture G channel for shader color lookup
- River blend increased from 85% to 95% with center darkening
- River texture increased from 2048 to 4096 resolution

**1:1 Metric Scale:**
- `GeoCoord.ts` rewritten with proper equirectangular metric projection
- 1 world unit = 1 meter (was ~91 meters)
- World bounds: 429,000 x 556,600 meters
- `VERTICAL_EXAGGERATION = 1.0` (no exaggeration)
- `logarithmicDepthBuffer: true` (near=10, far=1,000,000)
- All shader noise frequencies divided by ~89
- All distance-based constants (LOD, fog, camera, smoothing) scaled
- All tree geometries rescaled to real meters (conifer: 20m, sagebrush: 1m)
- Per-lake real surface elevations (Bear Lake at 1805m, Fish Lake at 2713m)
- Heightmap returns real meters relative to GSL datum (1280m)

**Additional v2.0 changes:**
- Ethereal sunset border fog beyond map edges
- Sky dome upgraded with sunset horizon band
- 25 MB unused elevation files deleted
- MessageChannel yield for background tab loading
- Parallel dynamic imports in main.ts
- Coastal smoothing reduced from 12 to 8 passes
- Comprehensive MAP_MAKING_GUIDE.md rewrite

### Development Methodology

The project was developed entirely through Claude Code (Anthropic's CLI for Claude), using Claude Opus 4.6 with 1M context. Key patterns:

- **Parallel research agents** — up to 5 Opus subagents deployed simultaneously for deep research (Utah geography, Aveneg architecture, river geodata, LOD techniques, vegetation rendering)
- **Iterative visual refinement** — the user viewed the map frequently, identified issues (east/west flip, water depth, tessellation visibility), and directed fixes
- **Audit-driven development** — a comprehensive 24-category audit prompt (AUDIT_PROMPT.md) was created to verify system coherence after multi-agent changes
- **Sconce** — a companion cactus in the CLI occasionally pointed out code bugs (like boundary check logic)
- **Context management** — the project accumulated enough context that conversation compaction was needed multiple times, with comprehensive summaries preserved

---

## 15. Comparison with Aveneg

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

## 16. Known Issues & Future Work

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
