# 3D Terrain Map Making Guide — Claude Code Framework

A comprehensive guide for creating realistic 3D hex-based terrain maps of any geographic region using Three.js, based on lessons learned from the Aveneg (Middle East) and Utah projects.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Geographic Data Research](#2-geographic-data-research)
3. [Real Elevation Data](#3-real-elevation-data)
4. [Hex Grid System](#4-hex-grid-system)
5. [Coordinate System](#5-coordinate-system)
6. [Terrain Mesh Building](#6-terrain-mesh-building)
7. [Terrain Material & Shaders](#7-terrain-material--shaders)
8. [Water Rendering](#8-water-rendering)
9. [Vegetation System](#9-vegetation-system)
10. [Landmark Sculpting](#10-landmark-sculpting)
11. [UI & Camera](#11-ui--camera)
12. [Common Issues & Fixes](#12-common-issues--fixes)
13. [Performance Guidelines](#13-performance-guidelines)
14. [Quality Checklist](#14-quality-checklist)

---

## 1. Project Setup

### Tech Stack
```
three ^0.183.2    — 3D rendering
gsap ^3.14.2      — Camera animations (flyTo, shake)
simplex-noise     — Procedural noise for terrain detail
seedrandom        — Deterministic RNG
@floating-ui/dom  — Tooltip positioning
vite              — Build tool
vitest            — Testing
typescript strict — Type safety
```

### File Structure
```
src/
  constants.ts              — Grid dimensions, terrain types, colors, formations
  main.ts                   — Entry point, init sequence
  core/
    hex/                    — HexCoord, HexGrid, HexUtils (flat-top axial)
    map/                    — Tile, GameMap, [Region]MapData
  data/                     — Geographic data (water, mountains, rivers, cities, parks, etc.)
  rendering/
    RealHeightMap.ts        — USGS elevation data loader
    HeightMapGenerator.ts   — Height sampling (real + procedural micro-detail)
    ProceduralNoise.ts      — Noise function library
    RegionalFeatureMap.ts   — Per-tile RGBA feature texture
    RegionalMappings.ts     — Regional tints and ridge angles
    three/
      ThreeRenderer.ts      — Central orchestrator
      ThreeCamera.ts        — OrbitControls + terrain clamping
      terrain/
        TerrainMeshBuilder.ts  — THE most important file: continuous vertex grid
        TerrainMaterial.ts     — GLSL shader with per-terrain patterns
        WaterPlane.ts          — Per-lake Gerstner wave water
        RiverMap.ts            — River rasterization to DataTexture
        RoadMap.ts             — Road SDF rasterization
        ShadowBaker.ts         — Baked shadows + AO
        HeightMapBaker.ts      — Baked heightmap for normals
      objects/
        VegetationScatter.ts   — InstancedMesh vegetation with dual LOD
        CityMarkers.ts         — City labels + markers
        LandmarkSculptor.ts    — Iconic location terrain sculpting
      overlays/
        GridOverlay.ts         — Hex wireframe (G key)
        MinimapRenderer.ts     — Canvas minimap
        RegionLabels.ts        — Floating region names
      effects/
        SceneLighting.ts       — Sun + ambient + hemisphere
        AtmosphereEffect.ts    — Gradient sky sphere
  input/
    CameraControls.ts       — WASD/QE/FC keyboard controls
  ui/
    Tooltip.ts, InfoPanel.ts, SearchPanel.ts, LegendPanel.ts, CompassHUD.ts
  utils/
    EventBus.ts
scripts/
  fetch-heightmap-rgb.mjs   — Downloads real USGS elevation data
public/
  [region]-elevation.png    — RGB-encoded heightmap
  [region]-elevation-meta.json
```

---

## 2. Geographic Data Research

### What You Need for Any Region

Before writing code, research and collect ALL of this data as `[lon, lat]` polygon/polyline arrays:

1. **Political/geographic boundaries** — The bounding box (N/S/E/W in degrees)
2. **Water bodies** — Lakes, reservoirs, seas as polygons. Include special colors (e.g., pink salt lakes, turquoise mineral lakes)
3. **Physiographic regions** — Major terrain provinces as polygons with default terrain type. ORDER MATTERS: specific regions before general ones
4. **Terrain zones** — Sub-region terrain overrides (e.g., salt flats, urban areas, alpine zones)
5. **Mountain ranges** — Polygons with elevation (0-15), ridge angle (degrees), and type (`range`/`laccolith`/`plateau`)
6. **Rivers** — Polyline waypoints with width, valleyDepth (0-1), valleyWidth
7. **Roads** — Polyline waypoints with width and type (interstate/highway/road)
8. **Cities** — Point locations with population
9. **Parks/monuments** — Boundary polygons with type
10. **Geological formations** — Polygons with formation index for shader coloring
11. **Feature zones** — Polygons for terrain features (hoodoos, slot canyons, forests, etc.)

### Data Sources
- **OpenStreetMap** — boundaries, roads, cities
- **USGS** — elevation data, geological maps
- **National Park Service** — park boundaries
- **Wikipedia/geology references** — formation types, mountain classifications
- **Google Earth** — visual verification of polygon positions

### Critical Rule: Region Ordering
Place MORE SPECIFIC regions BEFORE more general ones in the array. The map generation pipeline takes the FIRST match. If "Mojave Fringe" is listed after "Great Basin" and Great Basin's polygon contains Mojave Fringe, the Fringe will never be assigned.

---

## 3. Real Elevation Data

### Why Real Data Matters
Procedural noise CANNOT replicate real terrain. A hand-tuned noise function will never produce the Wasatch Fault scarp, the Grand Staircase cliff steps, or Zion Narrows. Real USGS/SRTM data gives you geographically accurate terrain for free.

### Fetching Elevation Data
Use the free AWS Terrain Tiles (Mapzen Terrarium format):

```bash
node scripts/fetch-heightmap-rgb.mjs 9  # zoom 9 ≈ 150m/pixel
```

**Tile URL**: `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`

**Encoding**: `elevation_meters = (R * 256 + G + B / 256) - 32768`

**Output**: RGB PNG where R*256+G gives 16-bit elevation. Load in browser via canvas, decode R*256+G per pixel.

### Zoom Level Selection
| Zoom | Resolution | Tiles for 5°×5° | File Size |
|------|-----------|----------------|-----------|
| 8    | ~300m     | ~45            | ~3 MB     |
| 9    | ~150m     | ~80            | ~8 MB     |
| 10   | ~75m      | ~300           | ~30 MB    |

Zoom 9 is the sweet spot — detailed enough for all major features, small enough to load quickly.

### Heightmap Integration
```typescript
// At runtime, load PNG and decode:
const imageData = ctx.getImageData(0, 0, img.width, img.height);
for (let i = 0; i < pixels; i++) {
  const r = imageData.data[i * 4];
  const g = imageData.data[i * 4 + 1];
  elevation16bit[i] = r * 256 + g; // 0-65535
}

// Sample with bilinear interpolation:
function sampleElevation(lon, lat) {
  const u = (lon - bounds.west) / (bounds.east - bounds.west);
  const v = (bounds.north - lat) / (bounds.north - bounds.south);
  // bilinear interpolation at (u * width, v * height)
  return MIN_ELEV + (interpolated / 65535) * RANGE;
}
```

### Vertical Exaggeration
Real terrain relief is too subtle at map scale. Apply 15-20x vertical exaggeration:
```typescript
const worldHeight = normalizedElev * ELEVATION_SCALE * 18;
```

---

## 4. Hex Grid System

### Axial Coordinates (Flat-Top)
Use flat-top hexagons with axial coordinates (q=column, r=row):
- `hexToPixel`: `x = size * 1.5 * q`, `y = size * (√3/2 * q + √3 * r)`
- `pixelToHex`: inverse with cube rounding

### Grid Sizing
- **HEX_SIZE = 20** world units (center to vertex)
- **Grid dimensions**: At least as many hexes as the reference (Aveneg uses 120×100 = 12,000). More hexes = finer geographic resolution.
- **Rule of thumb**: Each hex should cover 3-8 km for good detail

### Geo ↔ Hex Conversion
```typescript
function geoToHex(lon, lat) {
  const q = Math.round((lon - REGION_WEST) / DEG_PER_HEX_LON);
  const r = Math.round((REGION_NORTH - lat) / DEG_PER_HEX_LAT);
  return { q, r };
}
```

---

## 5. Coordinate System

### THE MOST CRITICAL SECTION — GET THIS RIGHT FIRST

The coordinate mapping between geographic, hex, pixel, and Three.js coordinates is the #1 source of bugs. Every file that touches coordinates must be consistent.

### The Problem
Three.js uses Y-up, with camera looking along -Z by default. But with OrbitControls, you can orbit to any angle. The challenge: achieving BOTH north-at-top AND east-on-right simultaneously.

### The Solution: Negate X
To get north-at-top with camera at azimuth=PI (south of center, looking north) AND east-on-right:

```
hexToPixel:  x = -size * 1.5 * q    ← NEGATED
             y = size * (√3/2 * q + √3 * r)

world:       worldX = pixel.x       (negated, so -x = east)
             worldZ = -pixel.y      (negated, so -z = south)

camera:      azimuth = PI           (south of center, looking north)
             screen right = -worldX = +q = east ✓
             screen top = +worldZ = north ✓
```

### Consistency Checklist
EVERY file with geo→world conversion must use:
```typescript
x = -HEX_SIZE * 1.5 * q    // NEGATED
y = HEX_SIZE * (√3/2 * q + √3 * r)
worldX = x, worldZ = -y
```

And the inverse (worldToGeo) must negate x:
```typescript
q = -wx / (HEX_SIZE * 1.5)  // NEGATED
```

### Files That Need This
- HexUtils.ts (hexToPixel, pixelToHex)
- RiverMap.ts, RoadMap.ts (geoToWorldPixel)
- CityMarkers.ts, LandmarkSculptor.ts, RegionLabels.ts, WaterPlane.ts (geoToWorld)
- HeightMapGenerator.ts (worldToGeo)
- TerrainMeshBuilder.ts (tileCX = pixel.x)

---

## 6. Terrain Mesh Building

### Architecture
Single continuous vertex grid at GRID_SPACING=2.0 world units. NOT per-hex geometry. Each vertex:
1. Find which hex tile it belongs to (via pixelToHex)
2. Sample height from real heightmap
3. Compute color from terrain type + formation + hillshade + snow
4. Store terrain type as vertex attribute for shader patterns

### Build Pipeline (14 Steps)
1. Dispose old chunks
2. Build tile coordinate lookup (Map<string, number>)
3. Mountain depth BFS (edge=0 through 1.0 interior)
4. Find land bounding box
5. Generate vertex grid (heights from real heightmap)
6. Coastal smoothing (land vertices near water pulled toward water level)
7. Landmark sculpting (heightFn + tintFn for iconic locations)
8. Terrain boundary color blending (noise-perturbed for organic boundaries)
9. River valley carving
10. Generate index buffer (alternating diagonal split)
11. Split into chunks (4×4)
12. Compute normals
13. Store height grid for runtime queries
14. Publish heights to GameMap

### Smoothing Rules with Real Heightmap
- **Global Laplacian smoothing: 0 passes** — real data is already smooth
- **Mountain smoothing: 0 passes** — real mountains have correct profiles
- **Coastal smoothing: 4-8 passes** — needed to transition from real-heightmap land to flat water
- Rule: NEVER smooth away real geographic features. Only smooth artificial transitions (hex boundaries, water edges).

### Coastal Land Flattening
The biggest visual artifact: cliff walls at lake edges where real heightmap land (maybe 40 world units) meets water tiles at -1.5. Fix with aggressive land flattening:
```typescript
const COAST_LAND_FLAT_RADIUS = 5; // grid cells
const flatBlend = 0.9 * flatT * flatT;  // strong
const baseY = 0.5; // just above water plane
```

### Vertex Attributes
Each vertex needs these attributes for the shader:
- `terrainType` (float) — which terrain pattern to apply
- `terrainBlend` (float) — proximity to different terrain (for pattern suppression)
- `snowCover` (float) — elevation-based snow with noise treeline
- `coastDist` (float) — distance to water (for moisture effects)
- `hexCoord` (vec2) — hex coordinates for feature map lookup

---

## 7. Terrain Material & Shaders

### Architecture
MeshStandardMaterial with `onBeforeCompile` GLSL injection. Vertex colors from mesh builder, per-terrain patterns in fragment shader.

### Vertex Shader
- Pass all attributes as varyings to fragment
- River bank depression (terrain Y drops near rivers)
- Gerstner waves on river surfaces (2-3 waves, distance-faded)

### Fragment Shader — Per-Terrain Patterns
Each terrain type gets a unique visual pattern applied as `colorShift` on vertex colors:
- Desert: directional dune ridges (sine + noise warp)
- Mountain: 5-zone altitude coloring + cliff darkening + geological strata
- Forest: canopy variation + aspen patches
- Salt flat: voronoi crystal cracks
- Marsh: animated puddles + mud cracks + reeds
- etc.

### Overlay Textures
- **River map** (2048²): R=mask, G/B=flow direction, A=valley depth
- **Road map** (2048²): R=SDF distance
- **Shadow map** (512²): R=shadow, G=AO, B=detail noise
- **Height map** (1024²): R=normalized height for analytical normals

### Bounds Format
River and road maps use `(minX, minZ, 1/rangeX, 1/rangeZ)` — shader does `UV = (pos - min) * invRange`.
Shadow and height maps use `(minX, minZ, maxX, maxZ)` — shader does `UV = (pos - min) / (max - min)`.

### Bump Mapping
Per-terrain FBM bump with distance fade (500→150 units):
- Mountain: 0.20 scale (dramatic)
- Sandstone: 0.12 (cross-bedding)
- Desert: 0.07 (dune ridges)
- Urban: 0.03 (subtle)

### Color Transition Quality
Two layers prevent hex-boundary artifacts:
1. **Vertex level**: Noise-perturbed blend positions break hexagonal pattern
2. **Shader level**: `vTerrainBlend` suppresses patterns near boundaries with noise-warped mask

---

## 8. Water Rendering

### Per-Lake Water Planes (NOT Full-Map)
Create individual water planes per water body, sized to bounding box. This prevents water from appearing in valleys/canyons where it shouldn't be.

### Water Shader
- 4 Gerstner waves (calm lake parameters, not ocean)
- Domain warping for organic wave patterns
- Per-pixel ripple normals (4 sine octaves)
- Fresnel reflection, dual specular
- Caustic dappling
- NO distance fade — water must be visible at all zoom levels

### Water Tile Heights
Terrain mesh places water hex vertices at `WATER_MESH_Y` (below water plane), colored dark to match water plane's deep color. This eliminates the "two different colored water" artifact.

---

## 9. Vegetation System

### Region-Aware Density Tables
Define vegetation types appropriate to the region. For each terrain type × region combination, set densities per vegetation type.

### Forest Tiers
- Dense forest: 14x density, 1.25x scale
- Forest: 8x density, 1.15x scale  
- Woodland: 5x density, 1.05x scale

### Placement Strategies
- Forest tiles: grid-based scatter with 70% noise jitter
- Non-forest: cluster-biased (60% toward natural cluster centers)
- Validation: skip below water, slope > 50°, above snowline

### Dual LOD
- Detail geometry near camera (200-400 vertices per tree)
- LOD geometry far (12-20 vertices)
- Spatial grid (100-unit cells) for efficient filtering

### CRITICAL: Call updateLOD() Every Frame
The vegetation InstancedMesh matrices are populated in updateLOD(). If this isn't called in the render loop, vegetation is invisible.

---

## 10. Landmark Sculpting

### Civ-Style Exaggerated Features
Each iconic location gets custom `heightFn` and `tintFn` that modify the terrain mesh vertices within a radius. Features are exaggerated beyond geographic scale to be recognizable from hex-level zoom.

### Examples
- Canyon: two parallel cliff walls with depressed floor
- Hoodoo field: procedural Gaussian spires
- Mesa/butte: flat top with power-8 cliff edges
- Arch: two pillars with curved bridge
- Salt flat: negative height (force flat) + crack pattern tint

### Integration Point
Applied in TerrainMeshBuilder AFTER coastal smoothing, BEFORE mountain Laplacian. Heights go to gridHeights, colors go to the vertex color array.

---

## 11. UI & Camera

### Camera Setup
- OrbitControls with damping
- Terrain height clamping (camera stays above terrain)
- Pan speed scales with camera Y height (not orbit distance)
- Fog: custom shader chunk, clear nearby, gentle exp² ramp at distance

### Labels
- `depthTest: false, depthWrite: false, renderOrder: 100` — always visible
- City labels: LOD distance based on population
- Region labels: visible when zoomed out, hidden close

### Compass HUD
Dynamic rotating compass rose, updates with camera azimuth angle.

---

## 12. Common Issues & Fixes

### East/West Flip
**Symptom**: Geographic features appear on wrong side.
**Cause**: Camera azimuth and world x-axis don't agree.
**Fix**: Negate x in hexToPixel AND all geoToWorld functions. Use azimuth=PI.

### Water Bleeding Through Terrain
**Symptom**: Blue water visible through valley floors.
**Cause**: Full-map water plane at fixed Y level.
**Fix**: Per-lake water planes instead of one giant plane.

### Hex-Shaped Color Boundaries
**Symptom**: Visible hexagonal color transitions.
**Fix**: Noise-perturbed blend positions + shader pattern suppression near boundaries.

### Frills/Jagged Edges
**Symptom**: Stepped/jagged terrain features.
**Cause with procedural heights**: Missing 3-hex quartic kernel interpolation.
**Cause with real heightmap**: Over-smoothing destroying real features.
**Fix for real heightmap**: Set smoothing passes to 0. Real SRTM data is already smooth.

### Cliff Walls at Lake Edges
**Symptom**: Vertical walls between land and water.
**Cause**: Real heightmap land at 40+ world units, water tiles at -1.5.
**Fix**: Aggressive coastal land flattening (radius 5, blend 0.9, target just above water).

### Vegetation Not Showing
**Symptom**: No trees/bushes despite VegetationScatter being built.
**Cause**: `updateLOD()` not called in render loop.
**Fix**: Call `this.updateLOD()` in both `render()` and `renderIfDirty()`.

### Two-Colored Water
**Symptom**: Terrain water color visible under/around water plane.
**Cause**: Terrain water vertex color doesn't match water plane deep color.
**Fix**: Set water vertex color to water plane's deep color (0.05, 0.18, 0.28).

### Labels Hidden Behind Terrain
**Symptom**: City/region names disappear behind mountains.
**Fix**: `depthTest: false`, `renderOrder: 100` on all sprite materials.

### Shader Uniforms Not Working
**Symptom**: Overlay textures (river, road, shadow) have no visual effect.
**Cause**: Uniforms declared in shader but not sampled, OR bounds format mismatch.
**Fix**: Verify uniform is declared, assigned in onBeforeCompile, AND sampled with texture2D in the fragment shader. Check bounds format matches UV computation.

---

## 13. Performance Guidelines

### Mandatory Rules (from Aveneg)
- **No shadow maps** — use baked shadows/AO instead
- **Render scale capped at 0.75** — higher gives no visible benefit
- **DPR capped at 1.5** — no benefit beyond this
- **Max 4 Gerstner waves** — indistinguishable from 6
- **frustumCulled = false** on terrain chunks and InstancedMesh — bounding spheres are wrong
- **Never dispose shared geometries/materials**
- **Delta-time-scale all per-frame speeds** — consistent behavior on 60/120/240Hz

### Texture Sizes
- River/road maps: 2048²
- Shadow/AO: 512²
- Height map: 1024²
- Feature map: MAP_WIDTH × MAP_HEIGHT

### Dirty-Flag Rendering
Only re-render when something changed. Track dirty sources: camera, hover, selection, animation, resize. ~95% CPU reduction at idle.

---

## 14. Quality Checklist

Before declaring the map "done", verify:

- [ ] TypeScript compiles with zero errors
- [ ] Vite builds successfully
- [ ] North is at top of screen, east on right
- [ ] Geographic features in correct positions (check 5+ known landmarks)
- [ ] Mountains have dramatic vertical exaggeration
- [ ] Canyons/valleys are visible depressions
- [ ] Rivers visible as colored overlay on terrain
- [ ] Roads visible
- [ ] Lakes have water planes with waves
- [ ] No water bleeding through terrain
- [ ] No cliff walls at lake edges
- [ ] Vegetation visible and varies with terrain/region
- [ ] Cities labeled with population-based LOD
- [ ] Terrain colors match real-world geology
- [ ] Formation-aware coloring visible (different sandstone types look different)
- [ ] Hillshade creates visible light/shadow variation
- [ ] Bump mapping adds surface texture
- [ ] Fog creates atmospheric depth at distance
- [ ] WASD pans, Q/E rotates, F/C tilts, scroll zooms
- [ ] Camera doesn't clip through terrain
- [ ] Compass HUD rotates correctly
- [ ] 60fps on target hardware

---

## Workflow Summary

1. **Research** geographic data → polygon/polyline arrays
2. **Fetch** real elevation data from AWS Terrain Tiles
3. **Set up** hex grid with correct coordinate system (NEGATE X!)
4. **Generate** map tiles from geographic data (generateMap pipeline)
5. **Build** terrain mesh from real heightmap + hex tile colors
6. **Add** shader patterns, river/road overlays, shadow baking
7. **Add** vegetation, city markers, landmarks
8. **Polish** camera, fog, labels, compass
9. **Audit** coordinate consistency, shader wiring, build pipeline order
10. **Test** visually against real-world reference images

---

*Generated from the Utah 3D Terrain Map project, April 2026.*
*Framework based on Aveneg/Trump:Total War architecture.*

---

## Addendum: Lessons Learned (Utah Session)

### River Terrain Override is a Trap
Do NOT change hex terrain type along rivers. Rivers in canyon country will create unrealistic bright green bands over rock terrain. Instead:
- Set only the `waterway` field on tiles near rivers
- Render rivers as a shader overlay (blue tint) on whatever terrain they cross
- The river overlay + valley carving handle the visual rendering

### Elevation-Based Terrain Refinement
Hand-drawn region polygons can't cover every mountain slope. Use the real heightmap to refine terrain types:
- If real elevation > 2800m and tile is desert → conifer_forest
- If real elevation > 2200m and tile is desert → mountain
- If real elevation > 1800m and tile is desert → sagebrush
This requires the heightmap to be loaded BEFORE map generation.

### Valley Carving Depth Must Match Exaggeration
If mountains are 100-200 world units tall (18x exaggeration), a 2-unit valley is invisible. Valley carving depth should be 10-20+ world units.

### Hillshade Step Size Controls Tessellation Visibility
A small hillshade step (3 world units) makes every triangle face visible via sharp light/dark changes. Use 8+ world units for smoother hillshade that follows terrain-scale features.

### Per-Lake Water Planes, Not Full-Map
A single full-map water plane bleeds through every valley and canyon. Create individual water planes per water body from their polygon bounding boxes.

### Water Hex Vertices Must Be at Water Plane Level
NEVER sink water hex vertices to a fixed negative Y. This creates massive cliff walls at every lake edge. Instead:
- Water hex vertices: Y = 0 (same as water plane)
- Coastal land: slopes gently from real heightmap height down to 0
- Water plane: opaque, renders on top with waves/color, depthWrite=true
- Result: seamless transition from land into water
