# Load Performance Optimization Suggestions

These are researched suggestions for improving load time in the Utah 3D terrain app. Each has been audited for risk and feasibility. Implement what you agree with — skip what you don't.

---

## 1. Delete unused assets (Zero risk, instant win)

`public/utah-elevation.bin` (20MB), `public/utah-heightmap.png` (4.1MB), and `public/utah-heightmap-meta.json` are shipped in dist/ but never loaded by any code. Delete them.

**Verify first:** grep the codebase for `utah-elevation.bin` and `utah-heightmap.png` to confirm nothing references them. The only elevation loader is `src/rendering/RealHeightMap.ts` which loads `utah-elevation.png`.

---

## 2. Fix background tab loading (Low risk, high value)

The game can't load in a background tab because the yield function in `src/rendering/three/ThreeRenderer.ts` uses `setTimeout(r, 0)`. Browsers throttle `setTimeout` to ~1s intervals in background tabs.

**Fix:** Replace the yield function with a `MessageChannel`-based yield, which browsers do NOT throttle:

```ts
// In ThreeRenderer.buildTerrain(), replace:
const yieldFn = () => new Promise<void>(r => setTimeout(r, 0));

// With:
const yieldFn = () => new Promise<void>(r => {
  const ch = new MessageChannel();
  ch.port1.onmessage = () => r();
  ch.port2.postMessage(null);
});
```

**Research:** Read the current `buildTerrain()` method in `src/rendering/three/ThreeRenderer.ts` (~line 200) to see the yield function. It's used by `TerrainMeshBuilder.build()` which yields every 50 rows during vertex generation.

---

## 3. Pre-compute noise lookup tables (Low-medium risk, significant speedup)

The vertex generation loop in `src/rendering/three/terrain/TerrainMeshBuilder.ts` calls `valueNoise2D()` 5 times per vertex (~253K vertices = ~1.27M noise evaluations). These are all deterministic based on world-space position.

**Fix:** Before the main vertex loop (step 5, ~line 375), add a pre-computation pass that fills 5 `Float32Array` grids with noise values, then replace the `valueNoise2D()` calls in `computeVariedColor()` with direct `array[vi]` lookups.

**The 5 noise calls to pre-compute** (all in the `computeVariedColor` helper and vertex loop body):
- `valueNoise2D(wx*0.015, wz*0.015, SEED)` — palette blend (line ~153)
- `valueNoise2D(wx*0.04, wz*0.04, SEED+100)` — secondary blend (line ~154)
- `valueNoise2D(wx*0.1, wz*0.1, SEED+200)` — fine detail (line ~155)
- `valueNoise2D(wx*0.008, wz*0.008, SEED+5000)` — formation blend (line ~176, conditional but cheap to pre-compute unconditionally)
- `valueNoise2D(wx*0.01, wz*0.01, SEED+7777)` — snow treeline (line ~238, conditional)

**Research:** Read `computeVariedColor()` in TerrainMeshBuilder.ts to find all noise calls. Also read `src/rendering/ProceduralNoise.ts` to understand the noise functions. The `SEED` constant is `GLOBAL_TERRAIN_SEED` (value: 42). World coords are derived from grid position: `wx = minX + col * GRID_SPACING`, `wz = minZ + row * GRID_SPACING`.

**Memory cost:** 5 arrays * 253K floats * 4 bytes = ~5MB. Acceptable.

---

## 4. Reduce coastal smoothing passes (Low risk, minor speedup)

`COAST_SMOOTH_PASSES` is 12 in `src/rendering/three/terrain/TerrainMeshBuilder.ts` (~line 480). Each pass iterates the full ~253K vertex grid. Reducing to 8 saves ~33% of smoothing time.

**Research:** Find `COAST_SMOOTH_PASSES` in TerrainMeshBuilder.ts. It's a local const inside the build method. The smoothing only affects coastal transition zones — the visual difference between 8 and 12 passes is subtle. Test visually after changing.

Note: `MTN_SMOOTH_PASSES` is already 0 (disabled) because real USGS data provides natural mountain profiles.

---

## 5. Parallelize dynamic imports in main.ts (Zero risk, trivial)

In `src/main.ts`, `GameMap` and `UtahMapData` are imported sequentially when they could be parallel:

```ts
// Current (sequential):
const { generateUtahMap } = await import('@/core/map/UtahMapData');
const tileData = generateUtahMap();
const { GameMap } = await import('@/core/map/GameMap');
const { GRID_COLS, GRID_ROWS } = await import('@/core/map/UtahMapData'); // redundant re-import

// Better:
const [{ generateUtahMap, GRID_COLS, GRID_ROWS }, { GameMap }] = await Promise.all([
  import('@/core/map/UtahMapData'),
  import('@/core/map/GameMap'),
]);
const tileData = generateUtahMap();
```

---

## 6. Remove unnecessary yields between fast sync steps (Low risk)

In `src/rendering/three/ThreeRenderer.ts`, `buildTerrain()` has `await yieldFn()` calls between steps 4-7 (shadow baking, heightmap baking, water plane, roads/features). These are all fast synchronous operations — the yields add scheduling delay (~4ms each in foreground, much worse in background).

**Research:** Read `buildTerrain()` in ThreeRenderer.ts. Look for `await yieldFn()` between the shadow baker, height map baker, water plane, and road/feature map builds. These yields exist for progress updates but the steps complete in <10ms each. Remove the yields between them, keep one yield before vegetation scatter (step 8) which is heavier.

---

## What was considered and SKIPPED

- **Web Workers for vertex generation:** Data transfer overhead (~280KB polygon data + 7.6MB heightmap to each worker) would eat most of the parallelization gains. The refactoring is ~3-4 days of work for an estimated 2-3x speedup at best. Not worth it.
- **Replace PNG elevation with compressed binary:** The PNG decode is fast once downloaded. Download speed depends on network, not our code. The 20MB binary that already exists is actually larger than the 7.6MB PNG.
- **Service worker caching:** This is a locally-served vite preview app, not a production web service. Browser cache already handles repeat visits for local servers.
- **Increase GRID_SPACING (2.0 → 3.0):** Would cut vertex count 56% but visibly degrades terrain detail. Quality tradeoff not worth it.
