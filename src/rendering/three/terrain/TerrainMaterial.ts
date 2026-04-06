import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Terrain Material — Utah procedural GLSL shader
// ---------------------------------------------------------------------------
// Returns a MeshStandardMaterial with onBeforeCompile injection that adds
// per-terrain procedural patterns for all 15 Utah terrain types.
//
// Vertex attributes (set by TerrainMeshBuilder):
//   terrainType  (float 0-14)
//   terrainBlend (float 0-1)   — boundary blend factor
//   snowCover    (float 0-1)   — snow amount
//   coastDist    (float)       — signed distance to water edge
// ---------------------------------------------------------------------------

// ---- GLSL chunks ---------------------------------------------------------

const VERTEX_HEADER = /* glsl */ `
  // --- terrain attributes ---
  attribute float terrainType;
  attribute float terrainBlend;
  attribute float snowCover;
  attribute float coastDist;

  // --- uniforms needed in vertex ---
  uniform float     uTime;
  uniform sampler2D uRiverMap;
  uniform vec4      uRiverBounds;  // minX, minZ, 1/rangeX, 1/rangeZ

  // --- varyings ---
  varying float vTerrainType;
  varying float vTerrainBlend;
  varying float vSnowCover;
  varying float vCoastDist;
  varying vec3  vWorldPos;
  varying float vCamDist;
  varying float vRiverDepth;
  varying float vRiverWaveHeight;
`;

const VERTEX_MAIN = /* glsl */ `
  // Pass attributes to fragment
  vTerrainType  = terrainType;
  vTerrainBlend = terrainBlend;
  vSnowCover    = snowCover;
  vCoastDist    = coastDist;

  // World position (model → world)
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;

  // Camera distance for LOD-adaptive noise
  vCamDist = length(cameraPosition - wp.xyz);

  // ── River bank smoothing + wave displacement ──
  vRiverDepth = 0.0;
  vRiverWaveHeight = 0.0;
  bool vertexDisplaced = false;
  float rvDistFade = smoothstep(40000.0, 22000.0, vCamDist);
  vec2 rvUV = (vWorldPos.xz - uRiverBounds.xy) * uRiverBounds.zw;
  if (rvUV.x >= 0.0 && rvUV.x <= 1.0 && rvUV.y >= 0.0 && rvUV.y <= 1.0) {
    vec4 rvSample = texture2D(uRiverMap, rvUV);
    float rvMask = smoothstep(0.05, 0.4, rvSample.r);
    vRiverDepth = rvMask;

    // Bank smoothing — depress terrain Y near river edges
    if (rvMask > 0.01 && rvMask < 0.6 && rvDistFade > 0.01) {
      float bankT = rvMask / 0.6;
      float bankBlend = bankT * bankT * rvDistFade;
      transformed.y -= bankBlend * rvSample.a * 30.0; // meters at 1:1 scale
      vertexDisplaced = true;
    }

    // Gerstner waves on river water surface
    if (rvMask > 0.05 && rvDistFade > 0.01) {
      float waveStr = smoothstep(0.05, 0.2, rvMask) * rvDistFade;
      vec2 wDir1 = normalize(vec2(0.7, 0.7));
      vec2 wDir2 = normalize(vec2(-0.5, 0.86));
      float k1 = 6.2832 / 1200.0;   // wavelength ~1.2km at 1:1 scale
      float a1 = 6.0 / k1 * waveStr; // amplitude ~6m
      float f1 = k1 * (dot(wDir1, vWorldPos.xz) - 300.0 * uTime);
      float k2 = 6.2832 / 800.0;    // wavelength ~800m
      float a2 = 4.5 / k2 * waveStr;
      float f2 = k2 * (dot(wDir2, vWorldPos.xz) - 300.0 * uTime);
      transformed.y += a1 * sin(f1) + a2 * sin(f2);
      vRiverWaveHeight = (a1 * sin(f1) + a2 * sin(f2));
      vertexDisplaced = true;
    }
  }

  // Recompute gl_Position if displaced
  if (vertexDisplaced) {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Fragment: uniforms, varyings, utility functions
// ---------------------------------------------------------------------------
const FRAG_HEADER = /* glsl */ `
  // --- uniforms ---
  uniform float uTime;
  uniform int   uTerrainLOD;       // 0=low 1=medium

  // Height-map (future analytical normals)
  uniform sampler2D uHeightMap;
  uniform vec4      uHeightMapBounds;  // minX, minZ, maxX, maxZ
  uniform vec2      uHeightMapRange;   // minElev, maxElev
  uniform int       uHeightMapEnabled;

  // Baked shadow/AO
  uniform sampler2D uShadowMap;
  uniform vec4      uShadowBounds;     // minX, minZ, maxX, maxZ
  uniform int       uShadowEnabled;

  // River overlay (R=mask, G=riverId, B=flowAngle, A=valleyDepth)
  uniform sampler2D uRiverMap;
  uniform vec4      uRiverBounds;      // minX, minZ, 1/rangeX, 1/rangeZ
  uniform vec3      uRiverColors[16];  // per-river colors

  // Road overlay (R=SDF distance)
  uniform sampler2D uRoadSDF;
  uniform vec4      uRoadBounds;       // minX, minZ, 1/rangeX, 1/rangeZ

  // --- varyings ---
  varying float vTerrainType;
  varying float vTerrainBlend;
  varying float vSnowCover;
  varying float vCoastDist;
  varying vec3  vWorldPos;
  varying float vCamDist;
  varying float vRiverDepth;
  varying float vRiverWaveHeight;

  // =========================================================================
  //  Noise utilities
  // =========================================================================

  // Fast arithmetic hash — vec2 → float [0,1)
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Value noise with smoothstep interpolation
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // smoothstep

    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // 3-octave FBM
  float fbm3(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8); // domain rotation to reduce axis-alignment
    for (int i = 0; i < 3; i++) {
      v += a * vnoise(p);
      p = rot * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  // Distance-adaptive FBM: 2 octaves far, 3 close
  float fbmLOD(vec2 p, float dist) {
    if (uTerrainLOD == 0) return vnoise(p) * 0.5; // low LOD — single sample

    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    int octaves = (dist < 36000.0) ? 3 : 2;
    for (int i = 0; i < 3; i++) {
      if (i >= octaves) break;
      v += a * vnoise(p);
      p = rot * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  // Simple 2D Voronoi distance
  float voronoi(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float md = 1.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 n = vec2(float(x), float(y));
        vec2 o = vec2(hash21(i + n), hash21(i + n + 73.1));
        vec2 r = n + o - f;
        md = min(md, dot(r, r));
      }
    }
    return sqrt(md);
  }
`;

// ---------------------------------------------------------------------------
// Fragment: per-terrain patterns + transitions + shadow + roughness
// ---------------------------------------------------------------------------
const FRAG_COLOR = /* glsl */ `
  {
    // ---- coordinate shorthands ----
    // Scale world position for noise sampling — 1:1 metric scale is ~89x larger
    // than original system, so divide by 89 to preserve noise patterns
    vec2 wp = vWorldPos.xz * 0.0112;
    float ht = vWorldPos.y;
    int tt = int(vTerrainType + 0.5); // round to nearest int

    // ---- per-terrain color shift ----
    vec3 colorShift = vec3(0.0);

    // ---------------------------------------------------------------
    // 0  salt_flat — Voronoi polygon cracks, near-white, faint pink
    // ---------------------------------------------------------------
    if (tt == 0) {
      float cracks = voronoi(wp * 0.08);
      float crackLine = smoothstep(0.04, 0.07, cracks); // 1.0 = cell interior
      float grain = fbmLOD(wp * 0.3, vCamDist) * 0.04;
      colorShift = vec3(-0.05 * (1.0 - crackLine)) // darken cracks
                 + vec3(grain)
                 + vec3(0.012, 0.003, 0.005); // faint pink tinge
    }

    // ---------------------------------------------------------------
    // 1  desert — dune ridges, sand shimmer, fine grain
    // ---------------------------------------------------------------
    else if (tt == 1) {
      // Two angled sine waves with noise warp → directional dune ridges
      float warp = vnoise(wp * 0.04) * 8.0;
      float ridge1 = sin((wp.x * 0.6 + wp.y * 0.35 + warp) * 0.5) * 0.5 + 0.5;
      float ridge2 = sin((wp.x * 0.3 - wp.y * 0.55 + warp * 0.7) * 0.4) * 0.5 + 0.5;
      float dunes = mix(ridge1, ridge2, 0.4);
      float grain = fbmLOD(wp * 1.2, vCamDist) * 0.06;
      // Shimmer — subtle time-based flicker at glancing distance
      float shimmer = vnoise(wp * 0.1 + uTime * 0.02) * 0.015;
      colorShift = vec3(dunes * 0.06 - 0.03) + vec3(grain) + vec3(shimmer);
    }

    // ---------------------------------------------------------------
    // 2  sagebrush — rolling noise, scattered bush clumps
    // ---------------------------------------------------------------
    else if (tt == 2) {
      float roll = fbmLOD(wp * 0.05, vCamDist);
      // Small dark dots — hash-based bush clumps
      float bushId = hash21(floor(wp * 0.6));
      float bushMask = step(0.82, bushId); // ~18% coverage
      float bushDarken = bushMask * -0.06;
      colorShift = vec3(roll * 0.05 - 0.025)
                 + vec3(bushDarken, bushDarken * 0.6, bushDarken * 0.3);
    }

    // ---------------------------------------------------------------
    // 3  red_sandstone — THE signature Utah shader
    //    Diagonal cross-bedding, desert varnish, formation-aware
    // ---------------------------------------------------------------
    else if (tt == 3) {
      // Cross-bedding: angled sine lines at ~30deg and ~60deg
      float warp = vnoise(wp * 0.06) * 6.0;
      float bed30 = sin((wp.x * 0.866 + wp.y * 0.5) * 1.2 + warp) * 0.5 + 0.5;
      float bed60 = sin((wp.x * 0.5 + wp.y * 0.866) * 0.9 + warp * 0.8) * 0.5 + 0.5;
      float bedding = mix(bed30, bed60, 0.5);

      // Desert varnish — dark vertical noise bands (manganese/iron oxide streaks)
      float varnish = vnoise(vec2(wp.x * 0.15, ht * 0.003)) * 0.5 + 0.5;
      varnish = smoothstep(0.35, 0.65, varnish) * -0.08;

      // Fine grain
      float grain = fbmLOD(wp * 0.8, vCamDist) * 0.04;

      colorShift = vec3(bedding * 0.08 - 0.04)
                 + vec3(varnish * 0.7, varnish, varnish * 0.5)
                 + vec3(grain);
    }

    // ---------------------------------------------------------------
    // 4  white_sandstone — large swirls, iron oxide staining
    // ---------------------------------------------------------------
    else if (tt == 4) {
      // Large-scale cross-bedding swirls
      float swirl = fbmLOD(wp * 0.03 + vec2(vnoise(wp * 0.02) * 4.0), vCamDist);
      // Iron oxide staining patches (warm orange-pink)
      float oxide = smoothstep(0.45, 0.7, vnoise(wp * 0.07));
      colorShift = vec3(swirl * 0.06 - 0.03)
                 + vec3(oxide * 0.06, oxide * 0.02, -oxide * 0.01);
    }

    // ---------------------------------------------------------------
    // 5  canyon_floor — brown-tan gravel, moisture gradient, cottonwoods
    // ---------------------------------------------------------------
    else if (tt == 5) {
      float gravel = fbmLOD(wp * 1.5, vCamDist) * 0.06;
      // Moisture: closer to water → slightly darker & greener
      float moisture = smoothstep(30.0, 0.0, max(vCoastDist, 0.0));
      // Cottonwood patches near rivers
      float treeId = hash21(floor(wp * 0.3));
      float treeMask = step(0.88, treeId) * moisture;
      colorShift = vec3(gravel)
                 + vec3(-moisture * 0.03, moisture * 0.03, -moisture * 0.01)
                 + vec3(-treeMask * 0.12, treeMask * 0.06, -treeMask * 0.06);
    }

    // ---------------------------------------------------------------
    // 6  mountain — 5-zone altitude coloring, cliff shading, strata
    // ---------------------------------------------------------------
    else if (tt == 6) {
      // Height thresholds with noise warp (meters at 1:1 scale)
      float nw = vnoise(wp * 0.04) * 200.0;
      float h = ht + nw;

      // 5 altitude zones (dark olive → warm brown → grey-brown → light grey → pale peak)
      vec3 zoneColor = vec3(0.0);
      if (h < 500.0)       zoneColor = vec3(-0.06, -0.02,  0.00); // dark olive (foothills)
      else if (h < 1200.0) zoneColor = vec3( 0.04,  0.01, -0.02); // warm brown (montane)
      else if (h < 2000.0) zoneColor = vec3( 0.01,  0.01,  0.01); // grey-brown (subalpine)
      else if (h < 2600.0) zoneColor = vec3( 0.05,  0.05,  0.05); // light grey (alpine)
      else                  zoneColor = vec3( 0.10,  0.10,  0.10); // pale peak

      // Slope-based cliff darkening via screen-space derivatives
      vec3 dpdx = dFdx(vWorldPos);
      vec3 dpdy = dFdy(vWorldPos);
      vec3 faceNorm = normalize(cross(dpdx, dpdy));
      float slope = 1.0 - faceNorm.y; // 0 = flat, ~1 = vertical

      // Cliff darkening from slope steepness (enhanced)
      vec3 wsNorm = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
      float steepness = 1.0 - abs(wsNorm.y);
      float cliffDark = smoothstep(0.4, 0.8, steepness) * 0.25;
      vec3 cliffDarkenVec = -vec3(cliffDark, cliffDark, cliffDark * 0.7);

      // Geological strata lines on steep faces
      float strataLine = sin(vWorldPos.y * 0.02 + vnoise(wp * 0.08) * 4.0) * 0.5 + 0.5;
      strataLine = smoothstep(0.3, 0.7, strataLine);
      vec3 strataColor = vec3(strataLine * 0.04, strataLine * 0.03, strataLine * 0.02) * smoothstep(0.3, 0.6, steepness);

      // Plateau weathering — subtle top erosion
      float plateau = smoothstep(0.05, 0.0, slope) * fbmLOD(wp * 0.2, vCamDist) * 0.04;

      colorShift = zoneColor
                 + cliffDarkenVec
                 + strataColor
                 + vec3(plateau);
    }

    // ---------------------------------------------------------------
    // 7  conifer_forest — FBM canopy, aspen patches
    // ---------------------------------------------------------------
    else if (tt == 7) {
      float canopy = fbmLOD(wp * 0.15, vCamDist);
      // Bright aspen patches (warm yellow-green)
      float aspenId = hash21(floor(wp * 0.12));
      float aspenMask = smoothstep(0.85, 0.95, aspenId);
      colorShift = vec3(canopy * 0.06 - 0.03)
                 + vec3(aspenMask * 0.08, aspenMask * 0.10, -aspenMask * 0.04);
    }

    // ---------------------------------------------------------------
    // 8  alpine — grey rock, snow patches, tundra wildflower specks
    // ---------------------------------------------------------------
    else if (tt == 8) {
      // Noise-warped snowline
      float snowNoise = fbmLOD(wp * 0.08, vCamDist);
      float snowPatch = smoothstep(0.4, 0.6, snowNoise + vSnowCover * 0.5);
      // Tundra wildflower color specks
      float flowerId = hash21(floor(wp * 2.0));
      float flowerMask = step(0.96, flowerId); // rare specks
      vec3 flowerColor = vec3(
        hash21(floor(wp * 2.0) + 11.0) * 0.08,
        hash21(floor(wp * 2.0) + 22.0) * 0.04,
        hash21(floor(wp * 2.0) + 33.0) * 0.06
      );
      colorShift = vec3(snowPatch * 0.12)
                 + flowerColor * flowerMask * (1.0 - snowPatch);
    }

    // ---------------------------------------------------------------
    // 9  river_valley — lush green crop patchwork, hedgerow lines
    // ---------------------------------------------------------------
    else if (tt == 9) {
      // Crop patchwork grid
      vec2 field = fract(wp * 0.04);
      float fieldId = hash21(floor(wp * 0.04));
      float fieldHue = fieldId * 0.08 - 0.04; // shift green hue per field
      // Hedgerow lines along field edges
      float edgeX = smoothstep(0.0, 0.06, field.x) * smoothstep(1.0, 0.94, field.x);
      float edgeZ = smoothstep(0.0, 0.06, field.y) * smoothstep(1.0, 0.94, field.y);
      float hedgerow = 1.0 - edgeX * edgeZ; // 1 at edges, 0 interior
      colorShift = vec3(-hedgerow * 0.06, fieldHue + hedgerow * 0.02, -hedgerow * 0.03)
                 + vec3(fbmLOD(wp * 0.3, vCamDist) * 0.04 - 0.02);
    }

    // ---------------------------------------------------------------
    // 10 marsh — animated puddle shimmer, voronoi mud cracks, reeds
    // ---------------------------------------------------------------
    else if (tt == 10) {
      // Voronoi mud cracks
      float cracks = voronoi(wp * 0.12);
      float crackLine = smoothstep(0.05, 0.10, cracks);

      // Animated puddle shimmer in crack depressions
      float puddle = (1.0 - crackLine) * 0.5;
      float shimmer = sin(uTime * 1.5 + vnoise(wp * 0.3) * 6.0) * 0.02 * puddle;

      // Reed patches
      float reedId = hash21(floor(wp * 0.5));
      float reedMask = step(0.78, reedId) * 0.04;

      colorShift = vec3(-0.04 * (1.0 - crackLine)) // dark crack lines
                 + vec3(shimmer, shimmer * 0.8, shimmer * 1.2)
                 + vec3(-reedMask, reedMask * 0.5, -reedMask * 0.5);
    }

    // ---------------------------------------------------------------
    // 11 urban — subtle block grid pattern, grey-tan base
    // ---------------------------------------------------------------
    else if (tt == 11) {
      // Block grid
      vec2 block = fract(wp * 0.06);
      float gridX = smoothstep(0.0, 0.04, block.x) * smoothstep(1.0, 0.96, block.x);
      float gridZ = smoothstep(0.0, 0.04, block.y) * smoothstep(1.0, 0.96, block.y);
      float road = 1.0 - gridX * gridZ; // 1 at grid lines
      float blockId = hash21(floor(wp * 0.06));
      float blockVariation = blockId * 0.04 - 0.02;
      colorShift = vec3(-road * 0.04) + vec3(blockVariation);
    }

    // ---------------------------------------------------------------
    // 12 badlands — blue-grey, extremely fine ripple ridges, lunar
    // ---------------------------------------------------------------
    else if (tt == 12) {
      // Fine ripple ridges
      float warp = vnoise(wp * 0.08) * 4.0;
      float ripple = sin((wp.x + wp.y * 0.3 + warp) * 3.0) * 0.5 + 0.5;
      ripple = smoothstep(0.3, 0.7, ripple) * 0.04;
      float smooth_noise = vnoise(wp * 0.06) * 0.03;
      colorShift = vec3(ripple * 0.6, ripple * 0.6, ripple) // slightly blue-tinted ridges
                 + vec3(smooth_noise);
    }

    // ---------------------------------------------------------------
    // 13 lava_field — black basalt, flow ridges, red oxidation, cinder
    // ---------------------------------------------------------------
    else if (tt == 13) {
      // Flow ridges — elongated sine pattern
      float warp = vnoise(wp * 0.05) * 5.0;
      float flow = sin((wp.x * 0.3 + wp.y * 0.8 + warp) * 0.8) * 0.5 + 0.5;
      flow = smoothstep(0.35, 0.65, flow) * 0.04;

      // Red oxidation patches
      float oxide = smoothstep(0.6, 0.8, vnoise(wp * 0.09));
      vec3 oxideColor = vec3(oxide * 0.08, oxide * 0.01, -oxide * 0.01);

      // Cinder texture — high-frequency noise
      float cinder = fbmLOD(wp * 2.0, vCamDist) * 0.04;

      colorShift = vec3(flow) + oxideColor + vec3(cinder);
    }

    // ---------------------------------------------------------------
    // 14 water — skip (handled by water plane)
    // ---------------------------------------------------------------
    // (no colorShift for water)

    // ===================================================================
    //  Terrain transition blending
    // ===================================================================
    // Scale colorShift by blend purity — suppresses patterns near boundaries
    float ttPurity = 1.0 - smoothstep(0.05, 0.35, vTerrainBlend);
    colorShift *= ttPurity;

    // Noise-warped terrain transition — creates organic boundary shapes
    if (vTerrainBlend > 0.05) {
      float tNoise = vnoise(wp * 0.015) * 0.7 + vnoise(wp * 0.04 + 42.0) * 0.3;
      float warpedBlend = vTerrainBlend + (tNoise - 0.5) * 0.25;
      float patternMask = 1.0 - smoothstep(0.05, 0.45, warpedBlend);
      colorShift *= patternMask;
    }

    // ===================================================================
    //  Snow cover overlay
    // ===================================================================
    float snowMask = smoothstep(0.0, 0.4, vSnowCover + vnoise(wp * 0.1) * 0.2 - 0.1);
    vec3 snowTint = vec3(0.15, 0.15, 0.16) * snowMask; // brighten toward white
    colorShift = mix(colorShift, snowTint, snowMask);

    // ===================================================================
    //  Apply color shift to diffuseColor (vertex color)
    // ===================================================================
    diffuseColor.rgb += colorShift;

    // ===================================================================
    //  River overlay — per-river color from geology
    // ===================================================================
    {
      vec2 rvUV = (wp - uRiverBounds.xy) * uRiverBounds.zw;
      if (rvUV.x >= 0.0 && rvUV.x <= 1.0 && rvUV.y >= 0.0 && rvUV.y <= 1.0) {
        vec4 rvSample = texture2D(uRiverMap, rvUV);
        float rvMask = smoothstep(0.05, 0.35, rvSample.r);
        if (rvMask > 0.01) {
          // Per-river color lookup from G channel (encoded as riverId * 17/255)
          int riverId = int(rvSample.g * 15.0 + 0.5);
          riverId = clamp(riverId, 0, 15);
          vec3 riverColor = uRiverColors[riverId];
          // Darken center for depth — matches lake appearance
          riverColor *= 0.65 + 0.35 * (1.0 - rvMask);
          // Bank zone: darken terrain near river edges
          float bankMask = smoothstep(0.01, 0.15, rvSample.r) * (1.0 - rvMask);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.70, bankMask * 0.5);
          // Water zone: strong blend toward river color (0.95 = very opaque water)
          diffuseColor.rgb = mix(diffuseColor.rgb, riverColor, rvMask * 0.95);
        }
      }
    }

    // ===================================================================
    //  Road overlay — darker path along roads
    // ===================================================================
    {
      vec2 rdUV = (wp - uRoadBounds.xy) * uRoadBounds.zw;
      if (rdUV.x >= 0.0 && rdUV.x <= 1.0 && rdUV.y >= 0.0 && rdUV.y <= 1.0) {
        float roadDist = texture2D(uRoadSDF, rdUV).r;
        float roadMask = smoothstep(0.4, 0.15, roadDist); // closer = stronger
        if (roadMask > 0.01) {
          // Road tint — grey asphalt for interstates, lighter for other roads
          vec3 roadColor = vec3(0.35, 0.33, 0.32);
          diffuseColor.rgb = mix(diffuseColor.rgb, roadColor, roadMask * 0.6);
        }
      }
    }

    // ===================================================================
    //  Baked shadow / AO (when enabled)
    // ===================================================================
    if (uShadowEnabled == 1) {
      // Map world XZ to shadow UV
      vec2 sUV = (wp - uShadowBounds.xy) / (uShadowBounds.zw - uShadowBounds.xy);
      if (sUV.x >= 0.0 && sUV.x <= 1.0 && sUV.y >= 0.0 && sUV.y <= 1.0) {
        vec3 shadowSample = texture2D(uShadowMap, sUV).rgb;
        float shadow = shadowSample.r; // R = shadow factor
        float ao     = shadowSample.g; // G = ambient occlusion
        // Reduced multipliers to prevent over-darkening (CPU hillshade already dims)
        diffuseColor.rgb *= mix(1.0, shadow, 0.2) * mix(1.0, ao, 0.15);
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Fragment: per-terrain procedural bump mapping
// ---------------------------------------------------------------------------
const FRAG_BUMP = /* glsl */ `
  {
    float bumpDist = length(cameraPosition - vWorldPos);
    float bumpFade = smoothstep(45000.0, 13000.0, bumpDist);

    if (bumpFade > 0.01) {
      int tt = int(vTerrainType + 0.5);
      float bumpScale = 0.0;
      float bumpFreq = 0.0034; // 0.3 / 89 for 1:1 metric scale

      if      (tt == 0)  bumpScale = 0.04;  // salt_flat (subtle)
      else if (tt == 1)  bumpScale = 0.07;  // desert (dune ridges)
      else if (tt == 2)  bumpScale = 0.06;  // sagebrush
      else if (tt == 3)  bumpScale = 0.12;  // red_sandstone (cross-bedding)
      else if (tt == 4)  bumpScale = 0.08;  // white_sandstone
      else if (tt == 5)  bumpScale = 0.05;  // canyon_floor
      else if (tt == 6) { bumpScale = 0.20; bumpFreq = 0.002; } // mountain (dramatic)
      else if (tt == 7)  bumpScale = 0.06;  // conifer_forest
      else if (tt == 8)  bumpScale = 0.10;  // alpine (rocky)
      else if (tt == 9)  bumpScale = 0.05;  // river_valley
      else if (tt == 10) bumpScale = 0.07;  // marsh
      else if (tt == 11) bumpScale = 0.03;  // urban (subtle)
      else if (tt == 12) bumpScale = 0.10;  // badlands (eroded)
      else if (tt == 13) bumpScale = 0.12;  // lava_field (rough)

      bumpScale *= bumpFade;

      // Suppress bump on river and road areas
      float riverMask = smoothstep(0.05, 0.2, vRiverDepth);
      bumpScale *= (1.0 - riverMask);

      if (bumpScale > 0.001) {
        float bH = fbmLOD(vWorldPos.xz * bumpFreq, bumpDist) * bumpScale;
        vec3 dpdx_b = dFdx(vWorldPos);
        vec3 dpdy_b = dFdy(vWorldPos);
        float dhdx_b = dFdx(bH);
        float dhdy_b = dFdy(bH);
        vec3 crossX = cross(normal, dpdy_b);
        vec3 crossY = cross(dpdx_b, normal);
        float det = dot(dpdx_b, crossX);
        if (abs(det) > 0.0001) {
          vec3 surfGrad = (crossX * dhdx_b + crossY * dhdy_b) / det;
          normal = normalize(normal - surfGrad);
        }
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Fragment: per-terrain roughness
// ---------------------------------------------------------------------------
const FRAG_ROUGHNESS = /* glsl */ `
  {
    int tt = int(vTerrainType + 0.5);
    float r = 0.92; // default

    if      (tt == 0)  r = 0.80; // salt_flat
    else if (tt == 1)  r = 0.88; // desert
    else if (tt == 2)  r = 0.92; // sagebrush
    else if (tt == 3)  r = 0.90; // red_sandstone
    else if (tt == 4)  r = 0.85; // white_sandstone
    else if (tt == 5)  r = 0.90; // canyon_floor
    else if (tt == 6)  r = 0.96; // mountain
    else if (tt == 7)  r = 0.94; // conifer_forest
    else if (tt == 8)  r = 0.93; // alpine
    else if (tt == 9)  r = 0.86; // river_valley
    else if (tt == 10) r = 0.78; // marsh
    else if (tt == 11) r = 0.85; // urban
    else if (tt == 12) r = 0.88; // badlands
    else if (tt == 13) r = 0.95; // lava_field
    else if (tt == 14) r = 0.95; // water

    roughnessFactor = r;
  }
`;

// ---------------------------------------------------------------------------
// Uniform handles for external update (e.g. animation loop)
// ---------------------------------------------------------------------------
export interface TerrainUniforms {
  uTime: THREE.IUniform<number>;
  uTerrainLOD: THREE.IUniform<number>;
  uHeightMap: THREE.IUniform<THREE.Texture | null>;
  uHeightMapBounds: THREE.IUniform<THREE.Vector4>;
  uHeightMapRange: THREE.IUniform<THREE.Vector2>;
  uHeightMapEnabled: THREE.IUniform<number>;
  uShadowMap: THREE.IUniform<THREE.Texture | null>;
  uShadowBounds: THREE.IUniform<THREE.Vector4>;
  uShadowEnabled: THREE.IUniform<number>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------
export function createTerrainMaterial(): {
  material: THREE.MeshStandardMaterial;
  uniforms: TerrainUniforms;
} {
  const uniforms: TerrainUniforms = {
    uTime:             { value: 0 },
    uTerrainLOD:       { value: 1 },
    uHeightMap:        { value: null },
    uHeightMapBounds:  { value: new THREE.Vector4(0, 0, 1, 1) },
    uHeightMapRange:   { value: new THREE.Vector2(0, 1) },
    uHeightMapEnabled: { value: 0 },
    uShadowMap:        { value: null },
    uShadowBounds:     { value: new THREE.Vector4(0, 0, 1, 1) },
    uShadowEnabled:    { value: 0 },
  };

  const material = new THREE.MeshStandardMaterial({
    roughness: 0.92,
    metalness: 0,
    flatShading: false,
    vertexColors: true,
    side: THREE.DoubleSide,
  });

  material.onBeforeCompile = (shader) => {
    // Merge uniforms into shader
    for (const [key, val] of Object.entries(uniforms)) {
      shader.uniforms[key] = val;
    }

    // ------ Vertex shader injection ------
    // 1. Declare attributes + varyings before main()
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      '#include <common>\n' + VERTEX_HEADER,
    );

    // 2. Pass values in main() — inject after begin_vertex so position is available
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      '#include <worldpos_vertex>\n' + VERTEX_MAIN,
    );

    // ------ Fragment shader injection ------
    // 1. Declare uniforms, varyings, utilities before main()
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      '#include <common>\n' + FRAG_HEADER,
    );

    // 2. Per-terrain coloring after vertex color is applied
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      '#include <color_fragment>\n' + FRAG_COLOR,
    );

    // 3. Per-terrain procedural bump mapping
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_maps>',
      '#include <normal_fragment_maps>\n' + FRAG_BUMP,
    );

    // 4. Per-terrain roughness
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      '#include <roughnessmap_fragment>\n' + FRAG_ROUGHNESS,
    );
  };

  // Ensure Three.js recompiles when uniforms change
  material.customProgramCacheKey = () => 'utah_terrain_v2';

  return { material, uniforms };
}
