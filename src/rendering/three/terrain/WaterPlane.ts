/**
 * Animated water plane for Utah's lakes and reservoirs.
 * Uses Gerstner waves (capped at 4), per-pixel normals, Fresnel reflection.
 * Covers the entire map at Y=WATER_PLANE_Y; terrain mesh pokes through for land.
 */

import * as THREE from 'three';
import { WATER_PLANE_Y } from '@/constants';
import { WATER_BODIES } from '@/data/waterBodies';
import { geoToWorld } from '@/core/geo/GeoCoord';

const SUN_DIR = new THREE.Vector3(250, 280, -180).normalize();

const vertexShader = /* glsl */ `
uniform float uTime;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vWaveHeight;

vec3 gerstnerWave(vec2 pos, vec2 dir, float steepness, float wavelength, float speed) {
  float k = 6.2831853 / wavelength;
  float c = speed / k;
  float a = steepness / k;
  float f = k * (dot(dir, pos) - c * uTime);
  return vec3(dir.x * a * cos(f), a * sin(f), dir.y * a * cos(f));
}

float vhash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = vhash(i);
  float b = vhash(i + vec2(1.0, 0.0));
  float c = vhash(i + vec2(0.0, 1.0));
  float d = vhash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec3 pos = position;

  // Domain warp for organic wave patterns
  float warpX = vnoise(pos.xz * 0.03 + uTime * 0.05) * 2.0 - 1.0;
  float warpZ = vnoise(pos.xz * 0.03 + vec2(50.0, 80.0) + uTime * 0.04) * 2.0 - 1.0;
  vec2 warpedPos = pos.xz + vec2(warpX, warpZ) * 6.0;

  // 4 Gerstner waves — calm lake waves
  vec2 d1 = normalize(vec2(1.0, 0.3));
  vec2 d2 = normalize(vec2(-0.4, 0.9));
  vec2 d3 = normalize(vec2(0.7, -0.7));
  vec2 d4 = normalize(vec2(-0.9, -0.2));

  vec3 totalWave = vec3(0.0);
  totalWave += gerstnerWave(warpedPos, d1, 0.02, 40.0, 1.5);
  totalWave += gerstnerWave(warpedPos, d2, 0.015, 25.0, 1.2);
  totalWave += gerstnerWave(warpedPos, d3, 0.012, 15.0, 2.0);
  totalWave += gerstnerWave(warpedPos, d4, 0.01, 55.0, 0.8);

  pos += totalWave;
  vWaveHeight = totalWave.y;

  vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

  // Analytical normal from wave gradients
  float eps = 0.5;
  vec3 wR = gerstnerWave(warpedPos + vec2(eps, 0.0), d1, 0.02, 40.0, 1.5)
          + gerstnerWave(warpedPos + vec2(eps, 0.0), d2, 0.015, 25.0, 1.2);
  vec3 wL = gerstnerWave(warpedPos - vec2(eps, 0.0), d1, 0.02, 40.0, 1.5)
          + gerstnerWave(warpedPos - vec2(eps, 0.0), d2, 0.015, 25.0, 1.2);
  vec3 wU = gerstnerWave(warpedPos + vec2(0.0, eps), d1, 0.02, 40.0, 1.5)
          + gerstnerWave(warpedPos + vec2(0.0, eps), d2, 0.015, 25.0, 1.2);
  vec3 wD = gerstnerWave(warpedPos - vec2(0.0, eps), d1, 0.02, 40.0, 1.5)
          + gerstnerWave(warpedPos - vec2(0.0, eps), d2, 0.015, 25.0, 1.2);
  vec3 tangent = normalize(vec3(2.0 * eps, wR.y - wL.y, 0.0));
  vec3 bitangent = normalize(vec3(0.0, wU.y - wD.y, 2.0 * eps));
  vNormal = normalize(cross(bitangent, tangent));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uSunDir;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vWaveHeight;

// Per-pixel ripple normals
float phash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float pnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = phash(i);
  float b = phash(i + vec2(1.0, 0.0));
  float c = phash(i + vec2(0.0, 1.0));
  float d = phash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec3 normal = normalize(vNormal);

  // Per-pixel ripple perturbation
  float rScale = 0.15;
  vec2 rUV = vWorldPos.xz * rScale + uTime * vec2(0.3, 0.2);
  float rNx = pnoise(rUV + vec2(0.5, 0.0)) - pnoise(rUV - vec2(0.5, 0.0));
  float rNz = pnoise(rUV + vec2(0.0, 0.5)) - pnoise(rUV - vec2(0.0, 0.5));
  normal = normalize(normal + vec3(rNx * 0.15, 0.0, rNz * 0.15));

  // View direction
  vec3 viewDir = normalize(cameraPosition - vWorldPos);

  // Fresnel
  float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 4.0);

  // Base water color — Utah lake blue-green
  vec3 shallowColor = vec3(0.15, 0.42, 0.52);
  vec3 deepColor = vec3(0.05, 0.18, 0.28);

  // Depth-like variation from noise
  float depthNoise = pnoise(vWorldPos.xz * 0.005 + uTime * 0.02);
  vec3 baseColor = mix(shallowColor, deepColor, depthNoise * 0.6 + 0.2);

  // Caustic dappling
  float caustic = pnoise(vWorldPos.xz * 0.08 + uTime * vec2(0.5, 0.3));
  caustic *= caustic;
  baseColor += vec3(0.03, 0.05, 0.04) * caustic;

  // Sky reflection at glancing angles
  vec3 skyColor = vec3(0.45, 0.60, 0.75);
  baseColor = mix(baseColor, skyColor, fresnel * 0.5);

  // Specular — sun reflection
  vec3 halfVec = normalize(uSunDir + viewDir);
  float spec1 = pow(max(0.0, dot(normal, halfVec)), 128.0);
  float spec2 = pow(max(0.0, dot(normal, halfVec)), 32.0);
  vec3 specular = vec3(1.0, 0.95, 0.85) * (spec1 * 0.6 + spec2 * 0.15);

  // Wave-height foam
  float foam = smoothstep(0.08, 0.15, vWaveHeight) * 0.15;
  float foamBreak = pnoise(vWorldPos.xz * 0.3 + uTime * 0.8);
  foam *= foamBreak;

  vec3 finalColor = baseColor + specular + vec3(foam);

  // No distance fade — lakes must stay visible at all zoom levels
  gl_FragColor = vec4(finalColor, 1.0); // Fully opaque — no terrain showing through
}
`;

export class WaterPlane {
  private meshes: THREE.Mesh[] = [];
  private material: THREE.ShaderMaterial | null = null;

  build(scene: THREE.Scene): void {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSunDir: { value: SUN_DIR.clone() },
      },
      transparent: false,
      side: THREE.DoubleSide,
      depthWrite: true,
    });

    // Create one water plane per water body, sized to its bounding box
    for (const wb of WATER_BODIES) {
      let minX = Infinity, maxX = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;

      for (const [lon, lat] of wb.polygon) {
        const w = geoToWorld(lon, lat);
        if (w.x < minX) minX = w.x;
        if (w.x > maxX) maxX = w.x;
        if (w.z < minZ) minZ = w.z;
        if (w.z > maxZ) maxZ = w.z;
      }

      const pad = 60; // padding for full coverage
      minX -= pad; maxX += pad;
      minZ -= pad; maxZ += pad;

      const width = maxX - minX;
      const depth = maxZ - minZ;
      const centerX = (minX + maxX) / 2;
      const centerZ = (minZ + maxZ) / 2;

      // Subdivisions proportional to size, capped for perf
      const subdiv = Math.min(64, Math.max(8, Math.round(Math.max(width, depth) / 8)));
      const geometry = new THREE.PlaneGeometry(width, depth, subdiv, subdiv);
      geometry.rotateX(-Math.PI / 2);

      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.position.set(centerX, WATER_PLANE_Y, centerZ);
      mesh.frustumCulled = false;
      mesh.renderOrder = 1;
      scene.add(mesh);
      this.meshes.push(mesh);
    }
  }

  update(timestamp: number): void {
    if (this.material) {
      this.material.uniforms.uTime.value = timestamp * 0.001;
    }
  }

  dispose(): void {
    for (const mesh of this.meshes) {
      mesh.geometry.dispose();
      mesh.parent?.remove(mesh);
    }
    this.meshes = [];
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }
  }
}
