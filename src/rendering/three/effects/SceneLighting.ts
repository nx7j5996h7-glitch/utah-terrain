/**
 * Static scene lighting — DirectionalLight (sun) + AmbientLight + HemisphereLight.
 * Clear high-desert sunlight for Utah terrain.
 */

import * as THREE from 'three';

const _sunDir = new THREE.Vector3();

export class SceneLighting {
  /** Adds all lights to the scene. */
  static setup(scene: THREE.Scene): void {
    // Directional sun — warm golden light at ~50° elevation.
    // Position (250, 280, -180) proven good for terrain relief in Aveneg.
    const sun = new THREE.DirectionalLight(0xffeedd, 1.5);
    sun.position.set(250000, 280000, -180000); // far away for 1:1 metric scale
    scene.add(sun);

    // Pre-compute static sun direction
    _sunDir.copy(sun.position).normalize();

    // Ambient light — slightly cooler than Aveneg to match Utah's
    // higher altitude clear sky (less atmospheric scattering).
    const ambient = new THREE.AmbientLight(0x8a9aaa, 0.55);
    scene.add(ambient);

    // Hemisphere light — blue sky above, warm red-rock ground bounce below.
    const hemisphere = new THREE.HemisphereLight(0xa0c0e0, 0xc49868, 0.45);
    scene.add(hemisphere);
  }

  /** Normalized sun direction for water/shadow shaders. */
  static getSunDirection(): THREE.Vector3 {
    return _sunDir;
  }
}
