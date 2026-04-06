import{A as e,B as t,C as n,D as r,E as i,F as a,G as o,H as s,I as c,J as l,K as u,L as d,M as f,N as p,O as m,P as h,R as g,S as _,T as v,U as y,V as b,W as x,X as S,Y as C,_ as w,a as T,b as E,c as D,d as O,f as k,g as A,h as j,i as ee,j as te,k as ne,l as re,m as ie,n as ae,o as M,p as N,q as oe,r as se,s as ce,t as le,u as P,v as ue,w as F,x as de,y as fe,z as pe}from"./vendor-three-Bv8r0Bp_.js";import{t as me}from"./vendor-gsap-Dpz1gysz.js";import{t as he}from"./vendor-misc-KveqTjgi.js";var ge=Object.defineProperty,_e=(e,t)=>{let n={};for(var r in e)ge(n,r,{get:e[r],enumerable:!0});return t||ge(n,Symbol.toStringTag,{value:`Module`}),n};(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var ve=Math.sqrt(3),I=-114.05,L=(-109.05-I)/160,ye=5/140,be=1400,xe=.087,Se=1.396,Ce=.25,we={salt_flat:0,desert:1,sagebrush:2,red_sandstone:3,white_sandstone:4,canyon_floor:5,mountain:6,conifer_forest:7,alpine:8,river_valley:9,marsh:10,urban:11,badlands:12,lava_field:13,water:14},Te={salt_flat:`#F5F3F0`,desert:`#D4BA88`,sagebrush:`#8B9A6B`,red_sandstone:`#C45B28`,white_sandstone:`#E8D8C0`,canyon_floor:`#A08060`,mountain:`#7A7A6A`,conifer_forest:`#2D5A3D`,alpine:`#9A9A9A`,river_valley:`#5A7A3A`,marsh:`#4A6840`,urban:`#988878`,badlands:`#8A8A98`,lava_field:`#3A3A3A`,water:`#2A6B88`},Ee={salt_flat:`#F0EDE4`,desert:`#C49860`,sagebrush:`#7A8A5A`,red_sandstone:`#D47038`,white_sandstone:`#F0E8DC`,canyon_floor:`#8A7050`,mountain:`#6A6A5A`,conifer_forest:`#1A4A2D`,alpine:`#D0D0D0`,river_valley:`#4A6A2A`,marsh:`#3A5830`,urban:`#887868`,badlands:`#7A7A88`,lava_field:`#4A3A2A`,water:`#3A7B98`},De={salt_flat:`#FAFAFA`,desert:`#E8D8A8`,sagebrush:`#9BAA7B`,red_sandstone:`#8B3A1A`,white_sandstone:`#E0D4B8`,canyon_floor:`#B89070`,mountain:`#8A8A7A`,conifer_forest:`#3D6A4D`,alpine:`#F0F0F0`,river_valley:`#6A8A4A`,marsh:`#5A7850`,urban:`#A89888`,badlands:`#9A9AA8`,lava_field:`#2A2A2A`,water:`#1A5A78`},Oe={1:[.91,.85,.75],2:[.83,.44,.22],3:[.55,.22,.1],4:[.9,.55,.4],5:[.54,.54,.6],6:[.85,.7,.55],7:[.45,.28,.15],8:[.5,.35,.45],9:[.65,.3,.18],10:[.72,.2,.1],11:[.78,.78,.72],12:[.55,.6,.5],13:[.55,.3,.38],14:[.7,.7,.68]},ke=.75,Ae=1.5;function je(e,t){return`${e},${t}`}function Me(e){return{q:e.x,r:e.z}}function Ne(e,t,n){let r=Math.round(e),i=Math.round(t),a=Math.round(n),o=Math.abs(r-e),s=Math.abs(i-t),c=Math.abs(a-n);return o>s&&o>c?r=-i-a:s>c?i=-r-a:a=-r-i,{x:r,y:i,z:a}}var Pe=[{q:1,r:0},{q:1,r:-1},{q:0,r:-1},{q:-1,r:0},{q:-1,r:1},{q:0,r:1}],Fe=[];for(let e=0;e<6;e++)Fe.push({q:0,r:0});function Ie(e){for(let t=0;t<6;t++)Fe[t].q=e.q+Pe[t].q,Fe[t].r=e.r+Pe[t].r;return Fe}var Le={q:0,r:0};function Re(e,t){let n=Pe[t%6];return Le.q=e.q+n.q,Le.r=e.r+n.r,Le}var ze=Math.sqrt(3),Be=ze/2,Ve=ze/3;function R(e,t){return{x:-t*(3/2*e.q),y:t*(Be*e.q+ze*e.r)}}function He(e,t,n){let r=-e,i=2/3*r/n,a=(-1/3*r+Ve*t)/n;return Me(Ne(i,-i-a,a))}var Ue=new Float64Array(6),We=new Float64Array(6);for(let e=0;e<6;e++){let t=Math.PI/180*(60*e);Ue[e]=Math.cos(t),We[e]=Math.sin(t)}function Ge(e,t){let n=[];for(let r=0;r<6;r++)n.push({x:e.x+t*Ue[r],y:e.y+t*We[r]});return n}var Ke=class e{camera;controls;_flyTween=null;onControlsChange=null;getTerrainHeight=null;constructor(e){this.camera=new p(50,e.clientWidth/e.clientHeight,1,5e3);let t=R({q:80,r:70},20),n=t.x,r=-t.y;this.controls=new le(this.camera,e),this.controls.target.set(n,0,r),this.controls.minDistance=15,this.controls.maxDistance=be,this.controls.minPolarAngle=xe,this.controls.maxPolarAngle=Se,this.controls.enableDamping=!0,this.controls.dampingFactor=.08,this.controls.screenSpacePanning=!1,this.controls.panSpeed=1.5,this.controls.zoomSpeed=2,this.controls.rotateSpeed=.5;let i=.8,a=Math.PI;this.camera.position.set(n+280*Math.sin(i)*Math.sin(a),280*Math.cos(i),r+280*Math.sin(i)*Math.cos(a)),this.controls.addEventListener(`change`,()=>{this.onControlsChange&&this.onControlsChange()}),this.controls.update()}getCamera(){return this.camera}getControls(){return this.controls}getAzimuthAngle(){return this.controls.getAzimuthalAngle()}panWorld(e,t){this.cancelFly(),this.controls.target.x+=e,this.controls.target.z+=t,this.camera.position.x+=e,this.camera.position.z+=t}_panFwd=new C;_panRight=new C;static _UP=new C(0,1,0);panViewRelative(t,n){this._panFwd.subVectors(this.controls.target,this.camera.position),this._panFwd.y=0,this._panFwd.lengthSq()<.001?this._panFwd.set(0,0,-1):this._panFwd.normalize(),this._panRight.crossVectors(this._panFwd,e._UP).normalize();let r=Math.max(1,this.camera.position.y),i=Math.max(.08,r/150),a=(this._panFwd.x*t+this._panRight.x*n)*i,o=(this._panFwd.z*t+this._panRight.z*n)*i;this.panWorld(a,o)}flyTo(e,t,n,r=.8){this.cancelFly();let i={x:this.controls.target.x,y:this.controls.target.y,z:this.controls.target.z},a=new C().subVectors(this.camera.position,this.controls.target);n!==void 0&&a.normalize().multiplyScalar(n),this._flyTween=me.to(i,{x:e,y:0,z:t,duration:r,ease:`power3.inOut`,onUpdate:()=>{this.controls.target.set(i.x,i.y,i.z),this.camera.position.set(i.x+a.x,i.y+a.y,i.z+a.z)},onComplete:()=>{this._flyTween=null}})}rotateAzimuth(e){let t=this.camera.position.clone().sub(this.controls.target),n=Math.cos(e),r=Math.sin(e),i=t.x*n-t.z*r,a=t.x*r+t.z*n;t.x=i,t.z=a,this.camera.position.copy(this.controls.target).add(t)}rotatePolar(e){let t=this.camera.position.clone().sub(this.controls.target),n=t.length(),r=Math.acos(Math.min(1,Math.max(-1,t.y/n))),i=Math.atan2(t.x,t.z),a=Math.max(xe,Math.min(Se,r+e));t.y=n*Math.cos(a);let o=n*Math.sin(a);t.x=o*Math.sin(i),t.z=o*Math.cos(i),this.camera.position.copy(this.controls.target).add(t)}update(e){if(this.controls.update(e),!this._flyTween){let e=5;if(this.getTerrainHeight){let t=this.getTerrainHeight(this.camera.position.x,this.camera.position.z);e=Math.max(e,t+8)}this.camera.position.y<e&&(this.camera.position.y=e)}}resize(e,t){this.camera.aspect=e/t,this.camera.updateProjectionMatrix()}cancelFly(){this._flyTween&&=(this._flyTween.kill(),null)}dispose(){this.cancelFly(),this.controls.dispose()}},qe=new C,Je=class{static setup(e){let t=new ie(16772829,1.5);t.position.set(250,280,-180),e.add(t),qe.copy(t.position).normalize();let n=new ee(9083562,.55);e.add(n);let r=new ue(10535136,12884072,.45);e.add(r)}static getSunDirection(){return qe}};function Ye(){let e=document.createElement(`canvas`);e.width=2,e.height=512;let t=e.getContext(`2d`),n=t.createLinearGradient(0,0,0,512);n.addColorStop(0,`#2850a0`),n.addColorStop(.15,`#4070b8`),n.addColorStop(.3,`#6090cc`),n.addColorStop(.4,`#88aad8`),n.addColorStop(.45,`#a8bcd8`),n.addColorStop(.48,`#c0c8cc`),n.addColorStop(.5,`#c8c4b8`),n.addColorStop(.55,`#8a8478`),n.addColorStop(.7,`#5a5550`),n.addColorStop(1,`#3a3530`),t.fillStyle=n,t.fillRect(0,0,2,512);let r=new D(e);return r.magFilter=F,r.minFilter=F,r}var Xe=class{skyMesh;skyTexture;camera;constructor(e,t){this.camera=t,this.skyTexture=Ye(),this.skyMesh=new r(new x(3e3,32,16),new m({map:this.skyTexture,side:1,depthWrite:!1})),this.skyMesh.frustumCulled=!1,this.skyMesh.renderOrder=-1,e.add(this.skyMesh)}update(){this.skyMesh.position.copy(this.camera.position)}dispose(){this.skyMesh.geometry.dispose(),this.skyMesh.material.dispose(),this.skyTexture.dispose(),this.skyMesh.removeFromParent()}},Ze=`
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
`,Qe=`
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
  float rvDistFade = smoothstep(450.0, 250.0, vCamDist);
  vec2 rvUV = (vWorldPos.xz - uRiverBounds.xy) * uRiverBounds.zw;
  if (rvUV.x >= 0.0 && rvUV.x <= 1.0 && rvUV.y >= 0.0 && rvUV.y <= 1.0) {
    vec4 rvSample = texture2D(uRiverMap, rvUV);
    float rvMask = smoothstep(0.05, 0.4, rvSample.r);
    vRiverDepth = rvMask;

    // Bank smoothing — depress terrain Y near river edges
    if (rvMask > 0.01 && rvMask < 0.6 && rvDistFade > 0.01) {
      float bankT = rvMask / 0.6;
      float bankBlend = bankT * bankT * rvDistFade;
      transformed.y -= bankBlend * rvSample.a * 0.3;
      vertexDisplaced = true;
    }

    // Gerstner waves on river water surface
    if (rvMask > 0.05 && rvDistFade > 0.01) {
      float waveStr = smoothstep(0.05, 0.2, rvMask) * rvDistFade;
      vec2 wDir1 = normalize(vec2(0.7, 0.7));
      vec2 wDir2 = normalize(vec2(-0.5, 0.86));
      float k1 = 6.2832 / 14.0;
      float a1 = 0.07 / k1 * waveStr;
      float f1 = k1 * (dot(wDir1, vWorldPos.xz) - 3.5 * uTime);
      float k2 = 6.2832 / 9.0;
      float a2 = 0.055 / k2 * waveStr;
      float f2 = k2 * (dot(wDir2, vWorldPos.xz) - 3.5 * uTime);
      transformed.y += a1 * sin(f1) + a2 * sin(f2);
      vRiverWaveHeight = (a1 * sin(f1) + a2 * sin(f2));
      vertexDisplaced = true;
    }
  }

  // Recompute gl_Position if displaced
  if (vertexDisplaced) {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`,$e=`
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

  // River overlay (R=mask, A=valleyDepth)
  uniform sampler2D uRiverMap;
  uniform vec4      uRiverBounds;      // minX, minZ, 1/rangeX, 1/rangeZ

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
    int octaves = (dist < 400.0) ? 3 : 2;
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
`,et=`
  {
    // ---- coordinate shorthands ----
    vec2 wp = vWorldPos.xz;
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
      float varnish = vnoise(vec2(wp.x * 0.15, ht * 0.3)) * 0.5 + 0.5;
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
      // Height thresholds with noise warp
      float nw = vnoise(wp * 0.04) * 8.0;
      float h = ht + nw;

      // 5 altitude zones (dark olive → warm brown → grey-brown → light grey → pale peak)
      vec3 zoneColor = vec3(0.0);
      if (h < 15.0)      zoneColor = vec3(-0.06, -0.02,  0.00); // dark olive
      else if (h < 30.0) zoneColor = vec3( 0.04,  0.01, -0.02); // warm brown
      else if (h < 50.0) zoneColor = vec3( 0.01,  0.01,  0.01); // grey-brown
      else if (h < 70.0) zoneColor = vec3( 0.05,  0.05,  0.05); // light grey
      else                zoneColor = vec3( 0.10,  0.10,  0.10); // pale peak

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
      float strataLine = sin(vWorldPos.y * 1.8 + vnoise(wp * 0.08) * 4.0) * 0.5 + 0.5;
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
    //  River overlay — blue tint along rivers
    // ===================================================================
    {
      vec2 rvUV = (wp - uRiverBounds.xy) * uRiverBounds.zw;
      if (rvUV.x >= 0.0 && rvUV.x <= 1.0 && rvUV.y >= 0.0 && rvUV.y <= 1.0) {
        vec4 rvSample = texture2D(uRiverMap, rvUV);
        float rvMask = smoothstep(0.05, 0.35, rvSample.r);
        if (rvMask > 0.01) {
          // River water tint — dark blue-green
          vec3 riverColor = vec3(0.15, 0.42, 0.52); // Exact match: WaterPlane shallowColor
          // Bank zone: darken terrain near river edges
          float bankMask = smoothstep(0.01, 0.15, rvSample.r) * (1.0 - rvMask);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.75, bankMask * 0.4);
          // Water zone: blend toward river color
          diffuseColor.rgb = mix(diffuseColor.rgb, riverColor, rvMask * 0.85);
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
`,tt=`
  {
    float bumpDist = length(cameraPosition - vWorldPos);
    float bumpFade = smoothstep(500.0, 150.0, bumpDist);

    if (bumpFade > 0.01) {
      int tt = int(vTerrainType + 0.5);
      float bumpScale = 0.0;
      float bumpFreq = 0.3;

      if      (tt == 0)  bumpScale = 0.04;  // salt_flat (subtle)
      else if (tt == 1)  bumpScale = 0.07;  // desert (dune ridges)
      else if (tt == 2)  bumpScale = 0.06;  // sagebrush
      else if (tt == 3)  bumpScale = 0.12;  // red_sandstone (cross-bedding)
      else if (tt == 4)  bumpScale = 0.08;  // white_sandstone
      else if (tt == 5)  bumpScale = 0.05;  // canyon_floor
      else if (tt == 6) { bumpScale = 0.20; bumpFreq = 0.18; } // mountain (dramatic)
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
`,nt=`
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
`;function rt(){let t={uTime:{value:0},uTerrainLOD:{value:1},uHeightMap:{value:null},uHeightMapBounds:{value:new S(0,0,1,1)},uHeightMapRange:{value:new l(0,1)},uHeightMapEnabled:{value:0},uShadowMap:{value:null},uShadowBounds:{value:new S(0,0,1,1)},uShadowEnabled:{value:0}},n=new e({roughness:.92,metalness:0,flatShading:!1,vertexColors:!0,side:2});return n.onBeforeCompile=e=>{for(let[n,r]of Object.entries(t))e.uniforms[n]=r;e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
`+Ze),e.vertexShader=e.vertexShader.replace(`#include <worldpos_vertex>`,`#include <worldpos_vertex>
`+Qe),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
`+$e),e.fragmentShader=e.fragmentShader.replace(`#include <color_fragment>`,`#include <color_fragment>
`+et),e.fragmentShader=e.fragmentShader.replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>
`+tt),e.fragmentShader=e.fragmentShader.replace(`#include <roughnessmap_fragment>`,`#include <roughnessmap_fragment>
`+nt)},n.customProgramCacheKey=()=>`utah_terrain_v2`,{material:n,uniforms:t}}function it(e){return()=>{e|=0,e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}var at=new Map,ot=256;function st(e){let t=at.get(e);if(t)return t;if(at.size>=ot){let e=at.keys().next().value;at.delete(e)}return t=he(it(e)),at.set(e,t),t}function ct(e){return e=(e>>16^e)*73244475,e=(e>>16^e)*73244475,e=e>>16^e,e&2147483647}function lt(e,t,n){let r=Math.max(0,Math.min(1,(n-e)/(t-e)));return r*r*(3-2*r)}function z(e,t,n){return st(n)(e,t)*.5+.5}function B(e,t,n,r=3){let i=0,a=.5,o=1,s=0;for(let c=0;c<r;c++)i+=a*z(e*o,t*o,n+c*1e3),s+=a,a*=.5,o*=2;return i/s}function ut(e,t,n,r=3,i=.5){let a=B(e+5.2,t+1.3,n+100,r)*i,o=B(e+1.7,t+9.2,n+200,r)*i;return B(e+a,t+o,n,r)}function V(e,t,n,r=4){let i=0,a=.5,o=1,s=0,c=1;for(let l=0;l<r;l++){let r=z(e*o,t*o,n+l*1e3);r=1-Math.abs(r*2-1),r*=r,r*=c,c=Math.min(1,r*2),i+=r*a,s+=a,a*=.5,o*=2}return i/s}function dt(e,t,n){let r=Math.floor(e),i=Math.floor(t),a=999,o=999,s=0;for(let c=-1;c<=1;c++)for(let l=-1;l<=1;l++){let u=r+l,d=i+c,f=u+(ct(u+ct(d+n))&65535)/65535,p=d+(ct(d+ct(u+n+7777))&65535)/65535,m=(e-f)*(e-f)+(t-p)*(t-p);m<a?(o=a,a=m,s=ct(u*31337+d*7919+n)):m<o&&(o=m)}return{dist:Math.sqrt(a),dist2:Math.sqrt(o),cellValue:(s&65535)/65535}}function ft(e,t,n,r=3,i=0){let a=B(e,t,n,2),o=Math.cos(i),s=Math.sin(i),c=e+o*a*.5,l=t+s*a*.5;return V(c*o+l*s,(-c*s+l*o)/3,n+500,r)}function pt(e,t,n,r,i){let a=Math.cos(n),o=Math.sin(n);return B(e*a+t*o,(-e*o+t*a)/r,i,3)}var mt=_e({isHeightmapLoaded:()=>Tt,loadHeightmap:()=>Ct,sampleElevationGeo:()=>wt}),ht={west:-114.609375,east:-108.984375,north:42.03297433244139,south:36.5978891330702},gt=226,_t=4354,vt=_t-gt,yt=null,bt=0,xt=0,St=!1;async function Ct(){let e=new Image;e.src=`./utah-elevation.png`,await new Promise((t,n)=>{e.onload=()=>t(),e.onerror=()=>n(Error(`Failed to load utah-elevation.png`))});let t=document.createElement(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0);let r=n.getImageData(0,0,e.width,e.height);bt=e.width,xt=e.height,yt=new Uint16Array(e.width*e.height);for(let e=0;e<yt.length;e++){let t=r.data[e*4],n=r.data[e*4+1];yt[e]=t*256+n}St=!0,console.log(`Heightmap loaded: ${bt}x${xt}, 16-bit precision (${gt}m to ${_t}m)`)}function wt(e,t){if(!St||!yt)return;let n=(e-ht.west)/(ht.east-ht.west),r=(ht.north-t)/(ht.north-ht.south);if(n<0||n>1||r<0||r>1)return;let i=n*(bt-1),a=r*(xt-1),o=Math.floor(i),s=Math.floor(a),c=Math.min(o+1,bt-1),l=Math.min(s+1,xt-1),u=i-o,d=a-s,f=yt[s*bt+o],p=yt[s*bt+c],m=yt[l*bt+o],h=yt[l*bt+c];return gt+(f*(1-u)*(1-d)+p*u*(1-d)+m*(1-u)*d+h*u*d)/65535*vt}function Tt(){return St}var H=42,Et=250/280,Dt=180/280,Ot=1/Math.sqrt(Et*Et+Dt*Dt+1),kt=Math.sqrt(3);kt/2;var At={salt_flat:3e3,desert:3100,sagebrush:3200,red_sandstone:3300,white_sandstone:3400,canyon_floor:3500,conifer_forest:3600,alpine:3700,river_valley:3800,marsh:3900,urban:4e3,badlands:4100,lava_field:4200};function jt(e,t,n=1,r=0,i=`range`){if(i===`laccolith`)return Mt(e,t);if(i===`plateau`)return Nt(e,t,r);let a=e+B(e*.006,t*.006,H+2070,3)*6,o=t+B(e*.006+5.3,t*.006+1.7,H+2071,3)*6,s=dt(a*.007,o*.007,H+2050),c=s.dist2-s.dist,l=Math.min(1,Math.max(0,(c-.02)*3)),u=l*l*(3-2*l),d=B(a*.01,o*.01,H+2080,2),f=V(a*.03,o*.03,H+2e3,4),p=B(a*.012,o*.012,H+2001,3),m=ut(a*.02,o*.02,H+2003,3,.5),h=m*m*Math.sqrt(m),g=ft(a*.025,o*.025,H+2004,3,1.8),_=V(a*.06,o*.06,H+2005,3),v=.5+d*.5,y=V(a*.08,o*.08,H+2006,2)*v,b=B(a*.1,o*.1,H+2002,2)*v,x=V(a*.011,o*.011,H+2060,3),S=Math.max(0,1-x),C=0;if(r!==0){let e=r*Math.PI/180;C=pt(a*.025,o*.025,e,4,H+2010);let t=e+Math.PI*.5,n=pt(a*.03,o*.03,t,2.5,H+2011);C=C*.65+n*.35}let w=C>0?.22:0,T=1-w,E=(((f*.26+p*.22+h*.13+_*.12)*T+C*w)*(.45+g*.55)+y*.1+b*.06)*(.6+u*.4),D=p*.5+.08,O=Math.abs(E-D),k=V((a-8)*.03,o*.03,H+2001,4),A=V((a+8)*.03,o*.03,H+2001,4),j=V(a*.03,(o-8)*.03,H+2001,4),ee=V(a*.03,(o+8)*.03,H+2001,4),te=Math.abs(A-k)/16,ne=Math.abs(ee-j)/16,re=Math.min(te,ne),ie=S*(.35+O*.6+re*1.5),ae=Math.min(ie,.65),M=E*(1-ae)+D*ae,N=Math.max(0,Math.min(1,(M-.03)*2.1));return N>.85?.85+(N-.85)*.4:N>.62?.62+(N-.62)*.82:N}function Mt(e,t){let n=ut(e*.008,t*.008,H+5e3,3,.4),r=B(e*.005,t*.005,H+5001,2),i=V(e*.04,t*.04,H+5002,3),a=n*n;return Math.min(1,a*.55+r*.3+i*.15)}function Nt(e,t,n){let r=B(e*.006,t*.006,H+6e3,3),i=Math.floor(r*4)/4,a=r,o=i*.6+a*.4,s=V(e*.02,t*.02,H+6001,3),c=B(e*.03,t*.03,H+6002,2),l=0;if(n!==0){let r=n*Math.PI/180;l=pt(e*.015,t*.015,r,3,H+6003)}return Math.min(1,o*.5+s*.2+c*.15+l*.15)}function Pt(e,t,n){let r=jt(e-n,t),i=jt(e+n,t),a=jt(e,t-n),o=jt(e,t+n),s=(i-r)/(2*n),c=(o-a)/(2*n);return Math.max(0,(-Et*s-Dt*c+1)*Ot)}function Ft(e,t,n){let r=At[n]??4500;switch(n){case`salt_flat`:{let n=dt(e*.03,t*.03,H+r),i=lt(.02,.08,n.dist2-n.dist),a=B(e*.002,t*.002,H+r+1,2);return i*.02+a*.03}case`desert`:{let n=pt(e*.04,t*.04,Math.PI*.15,4,H+r),i=B(e*.008,t*.008,H+r+1,2),a=ft(e*.03,t*.03,H+r+2,2,Math.PI*.15);return(n*.4+i*.45+a*.15)*.35}case`sagebrush`:{let n=B(e*.015,t*.015,H+r,3),i=lt(.4,.6,B(e*.008,t*.008,H+r+1,2)),a=B(e*.005,t*.005,H+r+2,2),o=ft(e*.02,t*.02,H+r+3,2,0);return(n*.3+i*.25+a*.3+o*.15)*.4}case`red_sandstone`:{let n=B(e*.01,t*.01,H+r,3),i=Math.floor(n*5)/5,a=pt(e*.06,t*.06,Math.PI*.1,5,H+r+1),o=B(e*.006,t*.006,H+r+2,2),s=V(e*.04,t*.04,H+r+3,3);return(i*.35+a*.15+o*.3+s*.2)*.5}case`white_sandstone`:{let n=ut(e*.012,t*.012,H+r,2,.3),i=B(e*.008,t*.008,H+r+1,2),a=z(e*.02,t*.02,H+r+2);return(n*.45+i*.35+a*.2)*.45}case`canyon_floor`:{let n=B(e*.005,t*.005,H+r,2),i=z(e*.03,t*.03,H+r+1);return(n*.7+i*.3)*.15}case`conifer_forest`:{let n=B(e*.012,t*.012,H+r,3),i=B(e*.005,t*.005,H+r+1,2),a=z(e*.04,t*.04,H+r+2);return(n*.4+i*.4+a*.2)*.45}case`alpine`:{let n=V(e*.03,t*.03,H+r,4),i=B(e*.015,t*.015,H+r+1,2),a=V(e*.08,t*.08,H+r+2,3);return(n*.4+i*.35+a*.25)*.55}case`river_valley`:{let n=B(e*.006,t*.006,H+r,2),i=z(e*.025,t*.025,H+r+1);return(n*.6+i*.4)*.2}case`marsh`:{let n=lt(.3,.1,dt(e*.05,t*.05,H+r).dist),i=B(e*.008,t*.008,H+r+1,2);return(n*.4+i*.6)*.1}case`urban`:{let n=B(e*.006,t*.006,H+r,2),i=z(e*.015,t*.015,H+r+1);return(n*.6+i*.4)*.05}case`badlands`:{let n=V(e*.12,t*.12,H+r,5),i=B(e*.01,t*.01,H+r+1,2),a=ft(e*.06,t*.06,H+r+2,3,Math.PI*.3);return(n*.35+i*.35+a*.3)*.5}case`lava_field`:{let n=dt(e*.04,t*.04,H+r),i=lt(.05,.15,n.dist2-n.dist),a=V(e*.05,t*.05,H+r+1,4),o=pt(e*.02,t*.02,Math.PI*.6,2,H+r+2);return(i*.3+a*.4+o*.3)*.4}default:return B(e*.02,t*.02,H,2)*.3}}function It(e,t){let n=-e/(20*1.5),r=t/(20*kt)-n/2;return{lon:I+n*L,lat:42-r*ye}}function Lt(e,t){if(!Tt())return 0;let n=It(e,t),r=wt(n.lon,n.lat);return r===void 0?0:(r-226)/4128*12*18+B(e*.05,t*.05,H,2)*.5}function Rt(e,t){let n=.015;return{dx:(z(e*n,t*n,H+2e3)-.5)*4,dz:(z(e*n,t*n,H+2100)-.5)*4}}function zt(e,t){return B(e*.012,t*.012,H+3e3,2)}function Bt(e,t){return z(e*.04,t*.04,H+3100)}function Vt(e){return e>=1?0:Math.sqrt(1-e*e)}var Ht={sampleMountainHeight:jt,sample:(e,t,n)=>jt(e,t,1,n??0),sampleTerrain:Ft,sampleRealHeight:Lt,hillshade:Pt,sampleDesertHeight:Ft,sampleLaccolith:Mt,samplePlateau:Nt,sampleCoastPerturb:Rt,sampleColorNoise:zt,sampleFineColorNoise:Bt,dome:Vt},Ut=[{name:`Wasatch Range`,elevation:11,ridgeAngle:0,type:`range`,polygon:[[-111.82,42],[-111.62,42],[-111.58,41.6],[-111.55,41.2],[-111.55,40.8],[-111.58,40.4],[-111.62,40.1],[-111.68,39.85],[-111.75,39.72],[-111.88,39.72],[-111.82,39.9],[-111.78,40.15],[-111.75,40.45],[-111.72,40.8],[-111.72,41.2],[-111.75,41.6]]},{name:`Uinta Mountains`,elevation:14,ridgeAngle:90,type:`range`,polygon:[[-111.2,40.95],[-110.8,40.93],[-110.4,40.9],[-110,40.85],[-109.65,40.8],[-109.4,40.72],[-109.35,40.6],[-109.4,40.52],[-109.65,40.55],[-110,40.58],[-110.4,40.6],[-110.8,40.62],[-111.2,40.65]]},{name:`Bear River Range`,elevation:8,ridgeAngle:0,type:`range`,polygon:[[-111.62,42],[-111.48,42],[-111.42,41.85],[-111.4,41.68],[-111.42,41.52],[-111.52,41.5],[-111.58,41.65],[-111.6,41.82]]},{name:`Wellsville Mountains`,elevation:8,ridgeAngle:0,type:`range`,polygon:[[-111.98,41.68],[-111.9,41.68],[-111.88,41.58],[-111.9,41.5],[-111.98,41.52]]},{name:`Deep Creek Range`,elevation:11,ridgeAngle:0,type:`range`,polygon:[[-114,40.1],[-113.82,40.1],[-113.78,39.95],[-113.78,39.75],[-113.82,39.65],[-114,39.68]]},{name:`Stansbury Mountains`,elevation:10,ridgeAngle:0,type:`range`,polygon:[[-112.7,40.68],[-112.52,40.68],[-112.48,40.55],[-112.48,40.38],[-112.55,40.32],[-112.7,40.35]]},{name:`Oquirrh Mountains`,elevation:9,ridgeAngle:0,type:`range`,polygon:[[-112.22,40.72],[-112.06,40.72],[-112.02,40.58],[-112.02,40.42],[-112.08,40.38],[-112.22,40.42]]},{name:`House Range`,elevation:8,ridgeAngle:0,type:`range`,polygon:[[-113.3,39.3],[-113.12,39.3],[-113.08,39.15],[-113.08,38.95],[-113.15,38.88],[-113.3,38.92]]},{name:`Confusion Range`,elevation:6,ridgeAngle:0,type:`range`,polygon:[[-113.65,39.25],[-113.48,39.25],[-113.45,39.12],[-113.45,38.98],[-113.5,38.92],[-113.65,38.95]]},{name:`Wah Wah Mountains`,elevation:8,ridgeAngle:0,type:`range`,polygon:[[-113.6,38.7],[-113.42,38.7],[-113.38,38.55],[-113.38,38.35],[-113.45,38.28],[-113.6,38.32]]},{name:`Sheeprock Mountains`,elevation:8,ridgeAngle:0,type:`range`,polygon:[[-112.48,39.95],[-112.32,39.95],[-112.28,39.82],[-112.28,39.68],[-112.35,39.62],[-112.48,39.65]]},{name:`Pilot Range`,elevation:9,ridgeAngle:0,type:`range`,polygon:[[-114.05,41.2],[-113.88,41.2],[-113.85,41.08],[-113.85,40.95],[-113.9,40.9],[-114.05,40.92]]},{name:`Cedar Mountains`,elevation:6,ridgeAngle:0,type:`range`,polygon:[[-113,40.82],[-112.85,40.82],[-112.82,40.68],[-112.82,40.55],[-112.88,40.5],[-113,40.52]]},{name:`Mineral Mountains`,elevation:8,ridgeAngle:0,type:`range`,polygon:[[-112.62,38.55],[-112.48,38.55],[-112.45,38.4],[-112.45,38.22],[-112.5,38.15],[-112.62,38.18]]},{name:`Pahvant Range`,elevation:8,ridgeAngle:0,type:`range`,polygon:[[-112.35,39.08],[-112.18,39.08],[-112.15,38.95],[-112.15,38.78],[-112.2,38.72],[-112.35,38.75]]},{name:`Canyon Range`,elevation:7,ridgeAngle:0,type:`range`,polygon:[[-112.25,39.55],[-112.1,39.55],[-112.08,39.42],[-112.08,39.28],[-112.12,39.22],[-112.25,39.25]]},{name:`Raft River Mountains`,elevation:8,ridgeAngle:90,type:`range`,polygon:[[-113.5,41.9],[-113.2,41.92],[-112.95,41.9],[-112.9,41.82],[-112.95,41.75],[-113.2,41.73],[-113.5,41.75]]},{name:`La Sal Mountains`,elevation:12,type:`laccolith`,polygon:[[-109.28,38.55],[-109.15,38.58],[-109.05,38.5],[-109.05,38.38],[-109.12,38.28],[-109.28,38.28],[-109.4,38.35],[-109.42,38.48]]},{name:`Henry Mountains`,elevation:11,type:`laccolith`,polygon:[[-110.72,38.12],[-110.58,38.15],[-110.48,38.08],[-110.48,37.92],[-110.55,37.82],[-110.72,37.82],[-110.82,37.9],[-110.82,38.05]]},{name:`Abajo Mountains`,elevation:10,type:`laccolith`,polygon:[[-109.48,37.95],[-109.35,37.98],[-109.25,37.9],[-109.25,37.78],[-109.32,37.7],[-109.48,37.72],[-109.55,37.8],[-109.55,37.9]]},{name:`Navajo Mountain`,elevation:9,type:`laccolith`,polygon:[[-110.58,37.05],[-110.48,37.08],[-110.38,37.02],[-110.38,36.95],[-110.45,36.9],[-110.58,36.92],[-110.62,36.98]]},{name:`Tushar Mountains`,elevation:11,ridgeAngle:0,type:`range`,polygon:[[-112.48,38.52],[-112.28,38.52],[-112.22,38.42],[-112.22,38.28],[-112.28,38.18],[-112.48,38.2],[-112.55,38.32]]},{name:`Markagunt Plateau`,elevation:10,type:`plateau`,polygon:[[-112.98,37.85],[-112.68,37.85],[-112.58,37.72],[-112.55,37.52],[-112.62,37.38],[-112.8,37.35],[-112.98,37.42]]},{name:`Aquarius Plateau`,elevation:10,type:`plateau`,polygon:[[-111.58,38.22],[-111.32,38.22],[-111.22,38.1],[-111.22,37.92],[-111.32,37.82],[-111.55,37.85],[-111.62,37.98],[-111.62,38.12]]},{name:`Paunsaugunt Plateau`,elevation:8,type:`plateau`,polygon:[[-112.25,37.7],[-112.08,37.7],[-112.02,37.58],[-112.02,37.42],[-112.08,37.32],[-112.25,37.35],[-112.3,37.5]]},{name:`Fish Lake Plateau`,elevation:10,type:`plateau`,polygon:[[-111.78,38.72],[-111.55,38.72],[-111.48,38.58],[-111.48,38.42],[-111.58,38.35],[-111.78,38.38],[-111.82,38.52]]},{name:`Wasatch Plateau`,elevation:9,type:`plateau`,polygon:[[-111.48,39.65],[-111.28,39.65],[-111.22,39.45],[-111.22,39.1],[-111.25,38.85],[-111.38,38.78],[-111.48,38.85],[-111.52,39.1],[-111.52,39.45]]},{name:`Tavaputs Plateau`,elevation:8,type:`plateau`,polygon:[[-110.6,39.85],[-110.1,39.85],[-109.7,39.8],[-109.5,39.75],[-109.5,39.55],[-109.7,39.5],[-110.1,39.52],[-110.6,39.55],[-110.8,39.65]]},{name:`Kaiparowits Plateau`,elevation:6,type:`plateau`,polygon:[[-111.6,37.55],[-111.3,37.55],[-111.15,37.42],[-111.1,37.22],[-111.18,37.1],[-111.4,37.08],[-111.6,37.18],[-111.65,37.38]]},{name:`Pine Valley Mountains`,elevation:9,type:`range`,polygon:[[-113.58,37.48],[-113.4,37.48],[-113.35,37.38],[-113.35,37.25],[-113.42,37.18],[-113.58,37.2],[-113.62,37.32]]}],Wt={"Great Basin":3,"Wasatch Front":1,"Uinta Basin":8,"Colorado Plateau North":4,"Colorado Plateau South":4,"Grand Staircase":5,"High Plateaus":7,"Mojave Fringe":6,"Northern Wasatch-Uinta":2};Ut.map((e,t)=>({rangeIndex:t,angle:e.ridgeAngle===void 0?0:e.ridgeAngle*Math.PI/180})).filter(e=>e.angle!==0||Ut[e.rangeIndex].ridgeAngle===0);var Gt={0:[0,0,0],1:[-.02,-.01,.03],2:[.04,-.02,.02],3:[.02,.02,-.01],4:[.06,-.02,-.04],5:[.04,-.01,-.03],6:[.03,.01,-.02],7:[-.03,.03,-.01],8:[.01,0,-.01]},Kt=`modulepreload`,qt=function(e,t){return new URL(e,t).href},Jt={},Yt=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=qt(t,n),t in Jt)return;Jt[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:Kt,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Xt=42,Zt=4,Qt=4,$t=12,en=0,tn=[1,1,0,-1,-1,0],nn=[0,-1,-1,0,1,1],rn=Math.sqrt(3),an=rn/2;function on(e){let t=e.replace(`#`,``);return[parseInt(t.substring(0,2),16)/255,parseInt(t.substring(2,4),16)/255,parseInt(t.substring(4,6),16)/255]}var sn={},cn={},ln={};for(let e of Object.keys(Te))sn[e]=on(Te[e]),cn[e]=on(Ee[e]),ln[e]=on(De[e]);var un=Object.keys(we),dn=Array(un.length).fill(null);for(let e of un){let t=we[e];dn[t]=sn[e]??null}function fn(e,t){return`${e*100|0},${t*100|0}`}function pn(e,t,n,r,i,a){let o=Ht.sampleRealHeight(e,t);return o===0?r===`mountain`?n*12+Ht.sampleMountainHeight(e,t,1,i??0,a??`range`)*7*n*.5:n*12*.3+Ht.sampleDesertHeight(e,t,r)*12:o}function mn(e,t,n,r,i,a,o){let s=sn[n]??[.5,.5,.5],c=cn[n]??s,l=ln[n]??s,u=z(e*.015,t*.015,Xt),d=z(e*.04,t*.04,Xt+100),f=z(e*.1,t*.1,Xt+200),p=.45+(u-.5)*.25,m=.3+(d-.5)*.15,h=1-p-m,g=Math.max(0,h),_=s[0]*p+c[0]*m+l[0]*g,v=s[1]*p+c[1]*m+l[1]*g,y=s[2]*p+c[2]*m+l[2]*g,b=(f-.5)*.08;if(_+=b,v+=b,y+=b,a&&Oe[a]){let n=Oe[a],r=.25+z(e*.008,t*.008,Xt+5e3)*.3;_=_*(1-r)+n[0]*r,v=v*(1-r)+n[1]*r,y=y*(1-r)+n[2]*r}if(i>0&&Gt[i]){let e=Gt[i];_+=e[0],v+=e[1],y+=e[2]}if(r>10){let e=1-(r-10)*.03;_*=e,v*=e,y*=e}let x=Ht.sampleRealHeight(e-8,-t)||o,S=Ht.sampleRealHeight(e+8,-t)||o,C=Ht.sampleRealHeight(e,-(t-8))||o,w=Ht.sampleRealHeight(e,-(t+8))||o,T=(S-x)/16,E=(w-C)/16,D=Math.max(0,(-.893*T-.643*E+1)*.577),O;O=n===`mountain`||n===`alpine`?.58+D*.5:n===`desert`||n===`red_sandstone`||n===`badlands`?.62+D*.45:n===`conifer_forest`||n===`sagebrush`?.68+D*.38:.75+D*.3,_*=O,v*=O,y*=O;let k=Math.abs(D-.5)*2;if(k>.4&&n===`mountain`){let e=(k-.4)*.15;_-=e,v-=e,y-=e*.8}let A=[.98,.97,.96];if((n===`mountain`||n===`alpine`)&&o>120){let n=Math.min(1,(o-120)/60)*(.5+z(e*.01,t*.01,Xt+7777)*.5),r=.85+D*.15;_=_*(1-n)+A[0]*r*n,v=v*(1-n)+A[1]*r*n,y=y*(1-n)+A[2]*r*n}return[Math.max(0,Math.min(1,_)),Math.max(0,Math.min(1,v)),Math.max(0,Math.min(1,y))]}var hn=class{chunks=[];gridMinX=0;gridMinZ=0;gridCols=0;gridRows=0;gridHeights=null;riverData=null;riverTexWidth=0;riverBoundsMinX=0;riverBoundsMinZ=0;riverBoundsInvRangeX=1;riverBoundsInvRangeZ=1;setRiverData(e,t,n){this.riverData=e,this.riverTexWidth=t,this.riverBoundsMinX=n.x,this.riverBoundsMinZ=n.y,this.riverBoundsInvRangeX=n.z,this.riverBoundsInvRangeZ=n.w}sampleRiver(e,t){if(!this.riverData)return[0,0];let n=(e-this.riverBoundsMinX)*this.riverBoundsInvRangeX,r=(t-this.riverBoundsMinZ)*this.riverBoundsInvRangeZ;if(n<0||n>1||r<0||r>1)return[0,0];let i=this.riverTexWidth,a=n*i-.5,o=r*i-.5,s=Math.max(0,Math.floor(a)),c=Math.max(0,Math.floor(o)),l=Math.min(i-1,s+1),u=Math.min(i-1,c+1),d=a-s,f=o-c,p=this.riverData,m=(c*i+s)*4,h=(c*i+l)*4,g=(u*i+s)*4,_=(u*i+l)*4;return[(p[m]*(1-d)*(1-f)+p[h]*d*(1-f)+p[g]*(1-d)*f+p[_]*d*f)/255,(p[m+3]*(1-d)*(1-f)+p[h+3]*d*(1-f)+p[g+3]*(1-d)*f+p[_+3]*d*f)/255]}async build(e,t){for(let e of this.chunks)e.geometry.dispose();this.chunks=[];let n=e.getAllTiles(),r=n.length,i=new Map;for(let e=0;e<r;e++)i.set(`${n[e].q},${n[e].r}`,e);let a=this._computeMountainDepths(n,r,i,e),o=1/0,s=-1/0,c=1/0,l=-1/0,u=new Float64Array(r),d=new Float64Array(r);for(let e=0;e<r;e++){let t=R({q:n[e].q,r:n[e].r},20);u[e]=t.x,d[e]=-t.y,!n[e].isWater&&(t.x-24<o&&(o=t.x-24),t.x+24>s&&(s=t.x+24),-t.y-24<c&&(c=-t.y-24),-t.y+24>l&&(l=-t.y+24))}let f=Math.ceil((s-o)/2)+1,p=Math.ceil((l-c)/2)+1,m=f*p,h=new Float32Array(m*3),g=new Float32Array(m*3),_=new Float32Array(m*3),v=new Float32Array(m),y=new Float32Array(m),b=new Float32Array(m),x=new Float32Array(m).fill(1),S=new Float32Array(m*2),C=new Float32Array(m*2),w=new Int32Array(m).fill(-1),T=new Map;for(let e=0;e<p;e++){t&&e>0&&e%50==0&&await t();for(let t=0;t<f;t++){let r=e*f+t,a=o+t*2,s=c+e*2,l=He(a,-s,20),u=i.get(`${l.q},${l.r}`),d=u===void 0?void 0:n[u];if(h[r*3]=a,h[r*3+2]=s,C[r*2]=a*.01,C[r*2+1]=s*.01,S[r*2]=l.q,S[r*2+1]=l.r,!d||d.isWater||u===void 0){let e=0;if(d&&d.isWater){let t=pn(a,-s,2,`desert`);e=Math.min(0,Math.max(-.5,t*.02))}h[r*3+1]=e,v[r]=we.water;let t=[.05,.18,.28];g[r*3]=t[0],g[r*3+1]=t[1],g[r*3+2]=t[2],_[r*3]=t[0],_[r*3+1]=t[1],_[r*3+2]=t[2];continue}w[r]=u;let p=d.terrain,m=d.elevation,y;y=pn(a,-s,m,p),h[r*3+1]=y;let E=mn(a,s,p,m,Wt[d.region]??0,d.formation,y);if(g[r*3]=E[0],g[r*3+1]=E[1],g[r*3+2]=E[2],_[r*3]=E[0],_[r*3+1]=E[1],_[r*3+2]=E[2],v[r]=we[p]??0,(p===`mountain`||p===`alpine`)&&y>72){let e=z(a*.02,s*.02,Xt+7777);b[r]=Math.min(1,(y-72)/36)*(.6+e*.4)}if(p===`river_valley`||p===`canyon_floor`||p===`marsh`)x[r]=0;else{let e=!1;for(let t=0;t<6;t++){let r=Re({q:d.q,r:d.r},t),a=i.get(`${r.q},${r.r}`),o=a===void 0?void 0:n[a];if(o&&o.isWater){e=!0;break}}x[r]=e?10:100}T.set(fn(a,s),y)}}this.gridMinX=o,this.gridMinZ=c,this.gridCols=f,this.gridRows=p,this.gridHeights=new Float32Array(m);for(let e=0;e<m;e++)this.gridHeights[e]=h[e*3+1];{let e=new Float32Array(m);for(let t=0;t<0;t++){for(let t=0;t<m;t++)e[t]=h[t*3+1];for(let t=1;t<p-1;t++)for(let n=1;n<f-1;n++){let r=t*f+n;if(w[r]<0)continue;let i=[r-1,r+1,r-f,r+f,r-f-1,r-f+1,r+f-1,r+f+1],a=0,o=0;for(let t of i)t>=0&&t<m&&(a+=e[t],o++);if(o===0)continue;let s=a/o;h[r*3+1]=e[r]+(s-e[r])*.15}}for(let e=0;e<p;e++)for(let t=0;t<f;t++){let n=e*f+t;if(w[n]>=0){let r=o+t*2,i=c+e*2;T.set(fn(r,i),h[n*3+1])}}}{let e=new Int16Array(m).fill(-1),t=[];for(let n=1;n<p-1;n++)for(let r=1;r<f-1;r++){let i=n*f+r,a=w[i]<0,o=[i-1,i+1,i-f,i+f];for(let n of o)if(!(n<0||n>=m)&&a!==w[n]<0){e[i]=0,t.push(i);break}}let n=0;for(;n<t.length;){let r=t[n++],i=e[r];if(i>=12)continue;let a=Math.floor(r/f),o=r%f;if(!(a<1||a>=p-1||o<1||o>=f-1))for(let n of[r-1,r+1,r-f,r+f])n>=0&&n<m&&e[n]<0&&(e[n]=i+1,t.push(n))}for(let t=0;t<m;t++){if(w[t]<0)continue;let n=e[t];if(n<0||n>=8)continue;let r=1-n/8,i=.9*r*r;h[t*3+1]=h[t*3+1]*(1-i)+.3*i}let r=new Float32Array(m);for(let t=0;t<12;t++){for(let e=0;e<m;e++)r[e]=h[e*3+1];for(let t=1;t<p-1;t++)for(let n=1;n<f-1;n++){let i=t*f+n;if(e[i]<0||w[i]>=0)continue;let a=1-e[i]/12,o=.5*a*a*a;if(o<.005)continue;let s=[i-1,i+1,i-f,i+f,i-f-1,i-f+1,i+f-1,i+f+1],c=0,l=0;for(let e of s)e>=0&&e<m&&(c+=r[e],l++);l!==0&&(h[i*3+1]=r[i]+(c/l-r[i])*o)}}}for(let e=0;e<m;e++)this.gridHeights[e]=h[e*3+1];t&&await t();try{let{LandmarkSculptor:e}=await Yt(async()=>{let{LandmarkSculptor:e}=await import(`./LandmarkSculptor-DGxZgxnX.js`);return{LandmarkSculptor:e}},[],import.meta.url),t=new e;t.applyToTerrain(this.gridHeights,f,p),t.applyTintsToColorGrid(g,f,p,o,c);for(let e=0;e<p;e++)for(let t=0;t<f;t++){let n=e*f+t;if(w[n]>=0){let r=o+t*2,i=c+e*2;h[n*3+1]=this.gridHeights[n],T.set(fn(r,i),this.gridHeights[n])}}}catch(e){console.warn(`LandmarkSculptor failed, continuing without landmarks:`,e)}t&&await t();for(let t=0;t<m;t++){let r=w[t];if(r<0)continue;let i=n[r],a=h[t*3],o=h[t*3+2],s=a-u[r],c=o-d[r];if(Math.sqrt(s*s+c*c)<20*.2)continue;let l=z(a*.03,o*.03,Xt+4e3)*20*.25,f=z(a*.03,o*.03,Xt+4001)*20*.25,p=a+l,m=o+f,v=p-u[r],b=m-d[r],x=Math.sqrt(v*v+b*b),S=0,C=0,T=0,E=0,D=0;for(let t=0;t<6;t++){let n=i.q+tn[t],r=i.r+nn[t],a=e.getTile(n,r);if(!a||a.terrain===i.terrain||a.terrain===`water`)continue;let o=we[a.terrain]??-1,s=o>=0?dn[o]:null;if(!s)continue;let c=20*1.5*n,l=-(20*(an*n+rn*r)),u=p-c,d=m-l,f=Math.sqrt(u*u+d*d)/(x+.01);if(f>1.6)continue;let h=Math.max(0,Math.min(1,1-(f-.8)/.8));h<=0||(C+=s[0]*h,T+=s[1]*h,E+=s[2]*h,S+=h,h>D&&(D=h))}if(S<=0)continue;let O=C/S,k=T/S,A=E/S,j=Math.min(D,1)*.6;y[t]=j,g[t*3]=g[t*3]*(1-j)+O*j,g[t*3+1]=g[t*3+1]*(1-j)+k*j,g[t*3+2]=g[t*3+2]*(1-j)+A*j,_[t*3]=g[t*3],_[t*3+1]=g[t*3+1],_[t*3+2]=g[t*3+2]}let E=new Int16Array(m).fill(-1),D=[];for(let e=0;e<m;e++){let t=w[e];t<0||(n[t].terrain===`mountain`?(E[e]=0,D.push(e)):h[e*3+1]>3&&(E[e]=1,D.push(e)))}let O=0;for(;O<D.length;){let e=D[O++],t=E[e];if(t>=$t)continue;let n=Math.floor(e/f),r=e%f;if(!(n<1||n>=p-1||r<1||r>=f-1))for(let n of[e-1,e+1,e-f,e+f])n>=0&&n<m&&E[n]<0&&(E[n]=t+1,D.push(n))}let k=new Float32Array(m);for(let e=0;e<en;e++){for(let e=0;e<m;e++)k[e]=h[e*3+1];for(let e=1;e<p-1;e++)for(let t=1;t<f-1;t++){let r=e*f+t;if(E[r]<0)continue;let i=E[r]===0,a=i?1:1-E[r]/$t,o=k[r],s;if(i){let e=Math.max(.5,1-o*.004),t=w[r];s=((t>=0?n[t].elevation:7)<=5?.15:.28)*a*e}else s=.55*a*a*a;if(s<.005)continue;let c=[r-1,r+1,r-f,r+f,r-f-1,r-f+1,r+f-1,r+f+1],l=0,u=0;for(let e of c)e>=0&&e<m&&(l+=k[e],u++);u!==0&&(l/=u,h[r*3+1]=k[r]+(l-k[r])*s,w[r]>=0&&T.set(fn(h[r*3],h[r*3+2]),h[r*3+1]))}}if(this.riverData){let e=new Float32Array(m),t=new Float32Array(m),i=new Float32Array(m),a=new Float32Array(m);a.fill(1/0);let o=[];for(let e=0;e<m;e++){if(w[e]<0)continue;let n=h[e*3],r=h[e*3+2],[s,c]=this.sampleRiver(n,r);t[e]=s,i[e]=c,s>.1&&(a[e]=0,o.push(e))}let s=new Uint8Array(m);for(let e of o)s[e]=1;let c=0;for(;c<o.length;){let e=o[c++],t=Math.floor(e/f),n=e%f,r=a[e];if(r>=16)continue;let l=[n>0?e-1:-1,n<f-1?e+1:-1,t>0?e-f:-1,t<p-1?e+f:-1];for(let t of l){if(t<0||s[t]||w[t]<0)continue;let n=h[t*3]-h[e*3],c=h[t*3+2]-h[e*3+2],l=r+Math.sqrt(n*n+c*c);l<a[t]&&l<16&&(a[t]=l,i[e]>i[t]&&(i[t]=i[e]),s[t]=1,o.push(t))}}let l=1.4,u=new Float32Array(m);u.fill(NaN);{let e=[];for(let n=0;n<m;n++)t[n]>.15&&e.push(n);for(let n of e){let e=Math.floor(n/f),r=n%f,i=0,a=0;for(let n=-3;n<=3;n++)for(let o=-3;o<=3;o++){let s=e+n,c=r+o;if(s<0||s>=p||c<0||c>=f)continue;let l=s*f+c;t[l]>.15&&(i+=h[l*3+1],a++)}u[n]=(a>0?i/a:h[n*3+1])-l}}for(let o=0;o<m;o++){let s=a[o],c=t[o];if(s===1/0&&c<.01)continue;let d=w[o],m=1;if(d>=0&&d<r){let e=n[d];e.isWater?m=0:e.elevation<=1?m=.5:e.elevation<=2&&(m=.8)}let g=h[o*3+1];if(c>.15&&!isNaN(u[o])){let t=u[o];t<g&&(h[o*3+1]=t),e[o]=m}else if(c>.01){let t=g-l,n=Math.floor(o/f),r=o%f,i=1/0;for(let e=-4;e<=4;e++)for(let a=-4;a<=4;a++){let o=n+e,s=r+a;if(o<0||o>=p||s<0||s>=f)continue;let c=o*f+s;if(isNaN(u[c]))continue;let l=e*e+a*a;l<i&&(i=l,t=u[c])}let a=c/.15,s=a*a*(3-2*a)*m;h[o*3+1]=g*(1-s)+t*s,e[o]=s}else{let t=(i[o]>0?i[o]:.5)*15*m*.5,n=1-s/16,r=t*n*n;h[o*3+1]-=r,e[o]=r>.01?n*n*m:0}h[o*3+1]=Math.max(h[o*3+1],-.6)}let d=new Float32Array(m);for(let e=0;e<m;e++)d[e]=h[e*3+1];for(let t=0;t<m;t++){let n=e[t];if(n<.01||n>.9)continue;let r=Math.floor(t/f),i=t%f,a=h[t*3+1],o=1;i>0&&(a+=h[(t-1)*3+1],o++),i<f-1&&(a+=h[(t+1)*3+1],o++),r>0&&(a+=h[(t-f)*3+1],o++),r<p-1&&(a+=h[(t+f)*3+1],o++),d[t]=h[t*3+1]*.6+a/o*.4}for(let t=0;t<m;t++)e[t]<.01||(h[t*3+1]=d[t],T.set(fn(h[t*3],h[t*3+2]),d[t]))}let A=[];for(let e=0;e<p-1;e++)for(let t=0;t<f-1;t++){let n=e*f+t,r=n+1,i=n+f,a=i+1;(w[n]>=0||w[r]>=0||w[i]>=0||w[a]>=0)&&((e+t)%2==0?(A.push(n,i,r),A.push(r,i,a)):(A.push(n,i,a),A.push(n,a,r)))}let j=new Uint16Array(r),ee=(s-o+1)/Zt,te=(l-c+1)/Qt;for(let e=0;e<r;e++){let t=Math.min(Zt-1,Math.max(0,Math.floor((u[e]-o)/ee)));j[e]=Math.min(Qt-1,Math.max(0,Math.floor((d[e]-c)/te)))*Zt+t}let ne=Zt*Qt,re=Array.from({length:ne},()=>[]),ie=Array.from({length:ne},()=>new Set),ae=Array.from({length:ne},()=>new Set);for(let e=0;e<A.length;e+=3){let t=A[e],n=A[e+1],r=A[e+2],i=0;for(let e of[t,n,r])if(w[e]>=0){i=j[w[e]];break}re[i].push(t,n,r),ie[i].add(t),ie[i].add(n),ie[i].add(r);for(let e of[t,n,r])w[e]>=0&&ae[i].add(w[e])}let N=[];for(let e=0;e<ne;e++){let t=ie[e],n=re[e],r=[...ae[e]];if(t.size===0){let e=new ce;this.chunks.push({geometry:e,baseColors:new Float32Array,tileIndices:r,tileLocalVerts:new Map}),N.push(e);continue}let i=new Map,a=[...t];for(let e=0;e<a.length;e++)i.set(a[e],e);let o=a.length,s=new Float32Array(o*3),c=new Float32Array(o*3),l=new Float32Array(o*3),u=new Float32Array(o),d=new Float32Array(o),f=new Float32Array(o),p=new Float32Array(o),m=new Float32Array(o*2),T=new Float32Array(o*2);for(let e=0;e<o;e++){let t=a[e],n=t*3,r=e*3;s[r]=h[n],s[r+1]=h[n+1],s[r+2]=h[n+2],c[r]=g[n],c[r+1]=g[n+1],c[r+2]=g[n+2],l[r]=_[n],l[r+1]=_[n+1],l[r+2]=_[n+2],u[e]=v[t],d[e]=y[t],f[e]=b[t],p[e]=x[t],m[e*2]=S[t*2],m[e*2+1]=S[t*2+1],T[e*2]=C[t*2],T[e*2+1]=C[t*2+1]}let E=new Uint32Array(n.length);for(let e=0;e<n.length;e++)E[e]=i.get(n[e]);let D=new Map;for(let e=0;e<o;e++){let t=w[a[e]];if(t<0)continue;let n=D.get(t);n||(n=[],D.set(t,n)),n.push(e)}let O=new ce;O.setAttribute(`position`,new M(s,3)),O.setAttribute(`color`,new M(c,3)),O.setAttribute(`terrainType`,new M(u,1)),O.setAttribute(`terrainBlend`,new M(d,1)),O.setAttribute(`snowCover`,new M(f,1)),O.setAttribute(`coastDist`,new M(p,1)),O.setAttribute(`hexCoord`,new M(m,2)),O.setAttribute(`uv`,new M(T,2)),O.setIndex(new M(E,1)),O.computeVertexNormals();let k=O.getAttribute(`normal`);for(let e=0;e<o;e++){let t=u[e]===we.mountain?.2:.3,n=k.getY(e);n=Math.max(n,t);let r=k.getX(e),i=k.getZ(e),a=1/Math.sqrt(r*r+n*n+i*i);k.setXYZ(e,r*a,n*a,i*a)}O.computeBoundingBox(),O.computeBoundingSphere(),this.chunks.push({geometry:O,baseColors:l,tileIndices:r,tileLocalVerts:D}),N.push(O)}for(let e=0;e<m;e++)this.gridHeights[e]=h[e*3+1];let oe=new Map,se=new Map;for(let e=0;e<r;e++){let t=n[e],r=`${t.q},${t.r}`,i=(u[e]-o)/2,s=(d[e]-c)/2,l=Math.max(0,Math.min(f-1,Math.round(i))),h=Math.max(0,Math.min(p-1,Math.round(s)))*f+l;h>=0&&h<m&&oe.set(r,this.gridHeights[h]),t.terrain===`mountain`&&se.set(r,a[e])}return e.setTerrainHeights(oe),e.setMountainDepths(se),this.riverData=null,N}_computeMountainDepths(e,t,n,r){let i=new Int8Array(t).fill(-1),a=[];for(let n=0;n<t;n++){if(e[n].terrain!==`mountain`)continue;let t=!1;for(let i=0;i<6;i++){let a=Re({q:e[n].q,r:e[n].r},i),o=r.getTile(a.q,a.r);if(!o||o.terrain!==`mountain`){t=!0;break}}t&&(i[n]=0,a.push(n))}let o=a;for(;o.length>0;){let t=[];for(let r of o){let a=i[r];if(!(a>=4))for(let o=0;o<6;o++){let s=Re({q:e[r].q,r:e[r].r},o),c=n.get(`${s.q},${s.r}`);c===void 0||i[c]>=0||e[c].terrain===`mountain`&&(i[c]=a+1,t.push(c))}}o=t}for(let n=0;n<t;n++)e[n].terrain===`mountain`&&i[n]<0&&(i[n]=4);let s=new Float32Array(t);for(let n=0;n<t;n++)e[n].terrain===`mountain`&&(s[n]=Math.min(1,i[n]/4));return s}sampleHeight(e,t){let n=this.gridHeights;if(!n||this.gridCols<=0)return;let r=(e-this.gridMinX)/2,i=(t-this.gridMinZ)/2,a=Math.floor(r),o=Math.floor(i);if(a<0||o<0||a>=this.gridCols-1||o>=this.gridRows-1)return;let s=r-a,c=i-o,l=o*this.gridCols+a,u=l+1,d=l+this.gridCols,f=d+1,p=n[l],m=n[u],h=n[d],g=n[f];return(o+a)%2==0?s+c<=1?p+(m-p)*s+(h-p)*c:g+(h-g)*(1-s)+(m-g)*(1-c):c>=s?p+(g-h)*s+(h-p)*c:p+(m-p)*s+(g-m)*c}dispose(){for(let e of this.chunks)e.geometry.dispose();this.chunks=[],this.gridHeights=null,this.riverData=null}},gn=[{name:`Great Salt Lake South Arm`,polygon:[[-112.78,41.3],[-112.6,41.3],[-112.4,41.27],[-112.22,41.22],[-112.1,41.16],[-112.02,41.08],[-112,40.98],[-112.02,40.88],[-112.08,40.8],[-112.15,40.73],[-112.22,40.68],[-112.33,40.66],[-112.45,40.68],[-112.55,40.72],[-112.65,40.78],[-112.72,40.85],[-112.78,40.93],[-112.82,41.02],[-112.85,41.12],[-112.82,41.22]]},{name:`Great Salt Lake North Arm`,color:`#C47088`,polygon:[[-112.78,41.3],[-112.82,41.38],[-112.88,41.48],[-112.92,41.55],[-112.98,41.62],[-113.05,41.68],[-113.1,41.72],[-112.9,41.72],[-112.7,41.68],[-112.55,41.62],[-112.42,41.55],[-112.33,41.47],[-112.27,41.38],[-112.22,41.3],[-112.22,41.22],[-112.4,41.27],[-112.6,41.3]]},{name:`Utah Lake`,color:`#4A7060`,polygon:[[-111.86,40.36],[-111.8,40.37],[-111.74,40.35],[-111.71,40.31],[-111.7,40.26],[-111.71,40.2],[-111.72,40.14],[-111.74,40.09],[-111.77,40.05],[-111.82,40.04],[-111.87,40.05],[-111.9,40.08],[-111.92,40.13],[-111.93,40.19],[-111.93,40.25],[-111.91,40.31],[-111.88,40.35]]},{name:`Bear Lake`,color:`#40B8B0`,polygon:[[-111.38,42],[-111.3,42],[-111.24,41.98],[-111.2,41.95],[-111.18,41.9],[-111.18,41.85],[-111.2,41.82],[-111.24,41.79],[-111.3,41.78],[-111.35,41.79],[-111.39,41.82],[-111.41,41.86],[-111.42,41.91],[-111.41,41.96]]},{name:`Lake Powell`,color:`#1A4A6A`,polygon:[[-111.52,37.42],[-111.42,37.38],[-111.32,37.33],[-111.22,37.28],[-111.12,37.22],[-111.05,37.18],[-110.95,37.14],[-110.85,37.12],[-110.75,37.1],[-110.62,37.07],[-110.5,37.05],[-110.42,37.02],[-110.42,37],[-110.55,37.01],[-110.68,37.04],[-110.8,37.06],[-110.92,37.09],[-111.02,37.12],[-111.12,37.16],[-111.22,37.2],[-111.32,37.25],[-111.42,37.3],[-111.5,37.35],[-111.55,37.4]]},{name:`Flaming Gorge Reservoir`,polygon:[[-109.65,41.08],[-109.58,41.06],[-109.52,41.02],[-109.46,40.98],[-109.42,40.94],[-109.4,40.9],[-109.38,40.86],[-109.4,40.84],[-109.44,40.86],[-109.48,40.9],[-109.52,40.94],[-109.56,40.98],[-109.6,41.02],[-109.65,41.05]]},{name:`Strawberry Reservoir`,polygon:[[-111.22,40.19],[-111.16,40.18],[-111.1,40.16],[-111.06,40.13],[-111.05,40.1],[-111.07,40.08],[-111.11,40.08],[-111.16,40.09],[-111.21,40.11],[-111.24,40.14],[-111.25,40.17]]},{name:`Jordanelle Reservoir`,polygon:[[-111.44,40.63],[-111.41,40.62],[-111.39,40.61],[-111.38,40.59],[-111.39,40.58],[-111.41,40.58],[-111.43,40.59],[-111.45,40.6],[-111.46,40.62]]},{name:`Deer Creek Reservoir`,polygon:[[-111.54,40.44],[-111.51,40.43],[-111.49,40.42],[-111.48,40.4],[-111.49,40.39],[-111.51,40.38],[-111.53,40.39],[-111.55,40.41],[-111.55,40.43]]},{name:`Scofield Reservoir`,polygon:[[-111.14,39.82],[-111.11,39.81],[-111.08,39.79],[-111.07,39.77],[-111.08,39.75],[-111.1,39.75],[-111.13,39.76],[-111.15,39.78],[-111.15,39.8]]},{name:`Starvation Reservoir`,polygon:[[-110.5,40.22],[-110.47,40.21],[-110.44,40.19],[-110.42,40.17],[-110.43,40.16],[-110.46,40.16],[-110.49,40.17],[-110.51,40.19],[-110.51,40.21]]},{name:`Sevier Lake`,polygon:[[-113,39.08],[-112.92,39.08],[-112.87,39.02],[-112.85,38.95],[-112.86,38.88],[-112.88,38.82],[-112.92,38.8],[-112.98,38.8],[-113.03,38.84],[-113.07,38.9],[-113.08,38.97],[-113.05,39.04]]},{name:`Willard Bay`,polygon:[[-112.1,41.42],[-112.06,41.42],[-112.03,41.4],[-112.02,41.38],[-112.04,41.37],[-112.07,41.37],[-112.1,41.39]]},{name:`Fish Lake`,polygon:[[-111.73,38.57],[-111.71,38.57],[-111.69,38.56],[-111.68,38.55],[-111.69,38.53],[-111.71,38.53],[-111.73,38.54],[-111.74,38.56]]}],_n=new C(250,280,-180).normalize(),vn=`
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

  // 4 Gerstner waves — calm lake waves (lower steepness than ocean)
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
`,yn=`
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
`,bn=Math.sqrt(3);function xn(e,t){let n=(e-I)/L,r=(42-t)/ye;return{x:-20*1.5*n,z:-(20*(bn/2*n+bn*r))}}var Sn=class{meshes=[];material=null;build(e){this.material=new y({vertexShader:vn,fragmentShader:yn,uniforms:{uTime:{value:0},uSunDir:{value:_n.clone()}},transparent:!1,side:2,depthWrite:!0});for(let t of gn){let n=1/0,i=-1/0,o=1/0,s=-1/0;for(let[e,r]of t.polygon){let t=xn(e,r);t.x<n&&(n=t.x),t.x>i&&(i=t.x),t.z<o&&(o=t.z),t.z>s&&(s=t.z)}n-=60,i+=60,o-=60,s+=60;let c=i-n,l=s-o,u=(n+i)/2,d=(o+s)/2,f=Math.min(64,Math.max(8,Math.round(Math.max(c,l)/8))),p=new a(c,l,f,f);p.rotateX(-Math.PI/2);let m=new r(p,this.material);m.position.set(u,0,d),m.frustumCulled=!1,m.renderOrder=1,e.add(m),this.meshes.push(m)}}update(e){this.material&&(this.material.uniforms.uTime.value=e*.001)}dispose(){for(let e of this.meshes)e.geometry.dispose(),e.parent?.remove(e);this.meshes=[],this.material&&=(this.material.dispose(),null)}},U=2048,Cn=Math.sqrt(3);function wn(e,t){let n=(e-I)/L,r=(42-t)/ye;return{x:-20*1.5*n,z:-(20*(Cn/2*n+Cn*r))}}function Tn(){let e=R({q:0,r:0},20),t=R({q:159,r:139},20),n=Math.min(e.x,t.x)-20,r=Math.max(e.x,t.x)+20,i=Math.min(e.y,t.y)-20;return{minX:n,minZ:-(Math.max(e.y,t.y)+20),maxX:r,maxZ:-i}}var En=class{texture=null;rawData=null;bounds=new S(0,0,1,1);build(e,t){let n=Tn(),r=n.maxX-n.minX,i=n.maxZ-n.minZ;this.bounds.set(n.minX,n.minZ,1/r,1/i);let a=new Uint8Array(U*U*4),o=e=>(e-n.minX)/r*U,s=e=>(e-n.minZ)/i*U;for(let t of e){let e=t.points.map(([e,t])=>{let n=wn(e,t);return{x:n.x,z:n.z}});for(let t=0;t<3;t++)e=Dn(e);let n=e.map(e=>({x:o(e.x),z:s(e.z)})),i=t.width*3*U/r,c=Math.round((t.valleyDepth??0)*255),l=On(n),u=0;for(let e=0;e<n.length-1;e++){let t=n[e],r=n[e+1],o=Math.sqrt((r.x-t.x)**2+(r.z-t.z)**2),s=r.x-t.x,d=r.z-t.z,f=Math.sqrt(s*s+d*d),p=f>0?s/f:0,m=f>0?d/f:0,h=Math.round((p+1)*.5*255),g=Math.round((m+1)*.5*255),_=i+2,v=Math.max(0,Math.floor(Math.min(t.x,r.x)-_)),y=Math.min(U-1,Math.ceil(Math.max(t.x,r.x)+_)),b=Math.max(0,Math.floor(Math.min(t.z,r.z)-_)),x=Math.min(U-1,Math.ceil(Math.max(t.z,r.z)+_));for(let e=b;e<=x;e++)for(let n=v;n<=y;n++){let s=kn(t.x,t.z,r.x,r.z,n+.5,e+.5),d=t.x+s*(r.x-t.x),f=t.z+s*(r.z-t.z),p=Math.sqrt((n+.5-d)**2+(e+.5-f)**2),m=(u+s*o)/l,_=1;m<.15&&(_=.3+m/.15*.7);let v=i*_;if(p>v+1.5)continue;let y;y=p<=v-1.5?255:p>=v+1.5?0:Math.round(255*(1-(p-(v-1.5))/3));let b=(e*U+n)*4;y>a[b]&&(a[b]=y,a[b+1]=h,a[b+2]=g,a[b+3]=c)}u+=o}}An(a,U),this.rawData=a,this.texture=new N(a,U,U,pe,oe),this.texture.minFilter=F,this.texture.magFilter=F,this.texture.needsUpdate=!0}getTexture(){if(!this.texture)throw Error(`RiverMap not built`);return this.texture}getBounds(){return this.bounds}getRawData(){if(!this.rawData)throw Error(`RiverMap not built`);return this.rawData}dispose(){this.texture&&=(this.texture.dispose(),null),this.rawData=null}};function Dn(e){if(e.length<2)return e;let t=[e[0]];for(let n=0;n<e.length-1;n++){let r=e[n],i=e[n+1];t.push({x:r.x*.75+i.x*.25,z:r.z*.75+i.z*.25}),t.push({x:r.x*.25+i.x*.75,z:r.z*.25+i.z*.75})}return t.push(e[e.length-1]),t}function On(e){let t=0;for(let n=1;n<e.length;n++)t+=Math.sqrt((e[n].x-e[n-1].x)**2+(e[n].z-e[n-1].z)**2);return t}function kn(e,t,n,r,i,a){let o=n-e,s=r-t,c=o*o+s*s;if(c<1e-8)return 0;let l=((i-e)*o+(a-t)*s)/c;return Math.max(0,Math.min(1,l))}function An(e,t){let n=new Uint8Array(t*t);for(let r=0;r<t*t;r++)n[r]=e[r*4];let r=[1,2,1,2,4,2,1,2,1];for(let i=1;i<t-1;i++)for(let a=1;a<t-1;a++){let o=0,s=0;for(let e=-1;e<=1;e++)for(let c=-1;c<=1;c++)o+=n[(i+e)*t+(a+c)]*r[s++];e[(i*t+a)*4]=Math.round(o/16)}}var W=2048,jn=Math.sqrt(3);function Mn(e,t){let n=(e-I)/L,r=(42-t)/ye;return{x:-20*1.5*n,z:-(20*(jn/2*n+jn*r))}}function Nn(){let e=R({q:0,r:0},20),t=R({q:159,r:139},20),n=Math.min(e.x,t.x)-20,r=Math.max(e.x,t.x)+20,i=Math.min(e.y,t.y)-20;return{minX:n,minZ:-(Math.max(e.y,t.y)+20),maxX:r,maxZ:-i}}var Pn=class{texture=null;bounds=new S(0,0,1,1);build(e,t){let n=Nn(),r=n.maxX-n.minX,i=n.maxZ-n.minZ;this.bounds.set(n.minX,n.minZ,1/r,1/i);let a=new Uint8Array(W*W);a.fill(0);let o=e=>(e-n.minX)/r*W,s=e=>(e-n.minZ)/i*W;for(let t of e){let e=t.points.map(([e,t])=>{let n=Mn(e,t);return{x:n.x,z:n.z}});e=In(e);let n=e.map(e=>({x:o(e.x),z:s(e.z)})),i=t.width*2.5*W/r,c=i+6;for(let e=0;e<n.length-1;e++){let t=n[e],r=n[e+1],o=c,s=Math.max(0,Math.floor(Math.min(t.x,r.x)-o)),l=Math.min(W-1,Math.ceil(Math.max(t.x,r.x)+o)),u=Math.max(0,Math.floor(Math.min(t.z,r.z)-o)),d=Math.min(W-1,Math.ceil(Math.max(t.z,r.z)+o));for(let e=u;e<=d;e++)for(let n=s;n<=l;n++){let o=Fn(t.x,t.z,r.x,r.z,n+.5,e+.5),s=t.x+o*(r.x-t.x),c=t.z+o*(r.z-t.z),l=128+(i-Math.sqrt((n+.5-s)**2+(e+.5-c)**2))*4,u=Math.max(0,Math.min(255,Math.round(l))),d=e*W+n;u>a[d]&&(a[d]=u)}}}this.texture=new N(a,W,W,b,oe),this.texture.minFilter=F,this.texture.magFilter=F,this.texture.needsUpdate=!0}getTexture(){if(!this.texture)throw Error(`RoadMap not built`);return this.texture}getBounds(){return this.bounds}dispose(){this.texture&&=(this.texture.dispose(),null)}};function Fn(e,t,n,r,i,a){let o=n-e,s=r-t,c=o*o+s*s;if(c<1e-8)return 0;let l=((i-e)*o+(a-t)*s)/c;return Math.max(0,Math.min(1,l))}function In(e){if(e.length<2)return e;let t=[e[0]];for(let n=0;n<e.length-1;n++){let r=e[n],i=e[n+1],a=Math.sqrt((i.x-r.x)**2+(i.z-r.z)**2);if(a>80){let e=(r.x+i.x)*.5,n=(r.z+i.z)*.5,o=i.x-r.x,s=i.z-r.z,c=Math.sqrt(o*o+s*s),l=-s/c,u=o/c,d=((e*127.1+n*311.7)%1e3/1e3-.5)*a*.05;t.push({x:e+l*d,z:n+u*d})}t.push(i)}return t}var G=512,Ln=20,Rn=300/Ln,zn=2,Bn=10,Vn=.55,Hn=6,Un=4,Wn=30,Gn=.5,Kn=.3,qn=[.12,.35,.8],Jn=20;function Yn(){let e=R({q:0,r:0},20),t=R({q:159,r:139},20),n=Math.min(e.x,t.x)-20,r=Math.max(e.x,t.x)+20,i=Math.min(e.y,t.y)-20;return{minX:n,minZ:-(Math.max(e.y,t.y)+20),maxX:r,maxZ:-i}}var Xn=class{texture=null;bounds=new S(0,0,1,1);build(e,t,n){let r=t.clone().normalize(),i=Yn();this.bounds.set(i.minX,i.minZ,i.maxX,i.maxZ);let a=i.maxX-i.minX,o=i.maxZ-i.minZ,s=new Uint8Array(G*G*4),c=Qn(),l=.6*Bn,u=.8*Bn,d=(e,t)=>n(e,t)??0;for(let e=0;e<G;e++){let t=e/(G-1),n=i.minZ+t*o;for(let t=0;t<G;t++){let o=t/(G-1),f=i.minX+o*a,p=d(f,n),m=0;for(let e=0;e<zn;e++){let t=e===0?f:f+l,i=e===0?n:n+u,a=e===0?p:d(t,i);m+=Zn(t,i,a,r,d)?0:1}let h=Vn+m/zn*(1-Vn),g=0;for(let e=0;e<Hn;e++){let t=c[e],r=!1;for(let e=1;e<=Un;e++){let i=e/Un,a=f+t.dx*i*Wn,o=n+t.dz*i*Wn,s=p+Kn+t.dy*i*Wn;if(d(a,o)>s){r=!0;break}}r&&g++}let _=Gn+(1-g/Hn)*(1-Gn),v=0;for(let e=0;e<qn.length;e++){let t=qn[e];v+=B(f*t,n*t,542+e,3)-.5}let y=128+v*Jn,b=(e*G+t)*4;s[b]=Math.max(0,Math.min(255,Math.round(h*255))),s[b+1]=Math.max(0,Math.min(255,Math.round(_*255))),s[b+2]=Math.max(0,Math.min(255,Math.round(y))),s[b+3]=255}}this.texture=new N(s,G,G,pe,oe),this.texture.magFilter=F,this.texture.minFilter=F,this.texture.wrapS=re,this.texture.wrapT=re,this.texture.needsUpdate=!0}getTexture(){if(!this.texture)throw Error(`ShadowBaker: call build() first`);return this.texture}getBounds(){return this.bounds}dispose(){this.texture&&=(this.texture.dispose(),null)}};function Zn(e,t,n,r,i){for(let a=1;a<=Ln;a++){let o=a*Rn,s=e+r.x*o,c=t+r.z*o,l=n+r.y*o;if(i(s,c)>l)return!0}return!1}function Qn(){let e=[],t=Math.PI*(3-Math.sqrt(5));for(let n=0;n<Hn;n++){let r=(15+75*(n/(Hn-1)))*Math.PI/180,i=t*n,a=Math.cos(r),o=Math.sin(r);e.push({dx:Math.cos(i)*a,dy:o,dz:Math.sin(i)*a})}return e}var K=1024;function $n(){let e=R({q:0,r:0},20),t=R({q:159,r:139},20),n=Math.min(e.x,t.x)-20,r=Math.max(e.x,t.x)+20,i=Math.min(e.y,t.y)-20;return{minX:n,minZ:-(Math.max(e.y,t.y)+20),maxX:r,maxZ:-i}}var er=class{texture=null;bounds=new S(0,0,1,1);range=new l(0,1);build(e,t){let n=$n();this.bounds.set(n.minX,n.minZ,n.maxX,n.maxZ);let r=n.maxX-n.minX,i=n.maxZ-n.minZ,a=K*K,o=(e,n)=>t(e,n)??0,s=new Float32Array(a),c=1/0,l=-1/0;for(let e=0;e<K;e++){let t=e/(K-1),a=n.minZ+t*i;for(let t=0;t<K;t++){let i=t/(K-1),u=o(n.minX+i*r,a),d=e*K+t;s[d]=u,u<c&&(c=u),u>l&&(l=u)}}let u=l-c,d=u>0?1/u:0;this.range.set(c,u);let f=new Uint8Array(a);for(let e=0;e<a;e++){let t=(s[e]-c)*d;f[e]=Math.max(0,Math.min(255,Math.round(t*255)))}this.texture=new N(f,K,K,b,oe),this.texture.magFilter=F,this.texture.minFilter=F,this.texture.wrapS=re,this.texture.wrapT=re,this.texture.needsUpdate=!0}getTexture(){if(!this.texture)throw Error(`HeightMapBaker: call build() first`);return this.texture}getBounds(){return this.bounds}getRange(){return this.range}dispose(){this.texture&&=(this.texture.dispose(),null)}},tr=class{texture=null;build(e){let t=new Uint8Array(22400*4);for(let n of e.getAllTiles()){let e=(n.r*160+n.q)*4;if(n.q<0||n.q>=160||n.r<0||n.r>=140)continue;n.terrain,t[e]=128,t[e+1]=Wt[n.region]??0,t[e+2]=0;let r=n.elevation>=12?255:n.elevation>=10?180:n.elevation>=8?80:0;t[e+3]=r}this.texture&&this.texture.dispose(),this.texture=new N(t,160,140,pe),this.texture.magFilter=te,this.texture.minFilter=te,this.texture.needsUpdate=!0}getTexture(){return this.texture}getSize(){return new l(160,140)}dispose(){this.texture&&=(this.texture.dispose(),null)}},nr=[{name:`Salt Lake City`,lon:-111.89,lat:40.76,population:200133},{name:`West Valley City`,lon:-111.99,lat:40.69,population:140230},{name:`West Jordan`,lon:-111.94,lat:40.61,population:116961},{name:`Provo`,lon:-111.66,lat:40.23,population:115162},{name:`St. George`,lon:-113.58,lat:37.1,population:95342},{name:`Orem`,lon:-111.69,lat:40.3,population:97499},{name:`Sandy`,lon:-111.88,lat:40.57,population:96904},{name:`Ogden`,lon:-111.97,lat:41.23,population:87321},{name:`Layton`,lon:-111.97,lat:41.06,population:82426},{name:`South Jordan`,lon:-111.93,lat:40.56,population:77221},{name:`Lehi`,lon:-111.85,lat:40.39,population:75907},{name:`Millcreek`,lon:-111.87,lat:40.69,population:63535},{name:`Taylorsville`,lon:-111.94,lat:40.67,population:60711},{name:`Logan`,lon:-111.83,lat:41.74,population:52778},{name:`Murray`,lon:-111.89,lat:40.67,population:50637},{name:`Draper`,lon:-111.86,lat:40.52,population:51017},{name:`Bountiful`,lon:-111.88,lat:40.89,population:44399},{name:`Riverton`,lon:-111.94,lat:40.52,population:44752},{name:`Roy`,lon:-112.03,lat:41.16,population:39820},{name:`Spanish Fork`,lon:-111.65,lat:40.11,population:42602},{name:`Herriman`,lon:-112.03,lat:40.51,population:55144},{name:`Eagle Mountain`,lon:-112.01,lat:40.31,population:43623},{name:`Pleasant Grove`,lon:-111.74,lat:40.36,population:38781},{name:`Cedar City`,lon:-113.06,lat:37.68,population:35e3},{name:`Kaysville`,lon:-111.94,lat:41.03,population:32509},{name:`Tooele`,lon:-112.3,lat:40.53,population:35742},{name:`Springville`,lon:-111.61,lat:40.17,population:34565},{name:`American Fork`,lon:-111.8,lat:40.38,population:33337},{name:`Cottonwood Heights`,lon:-111.81,lat:40.62,population:34180},{name:`Midvale`,lon:-111.9,lat:40.61,population:34214},{name:`Clearfield`,lon:-112.03,lat:41.1,population:32320},{name:`Saratoga Springs`,lon:-111.9,lat:40.35,population:37696},{name:`Brigham City`,lon:-112.02,lat:41.51,population:19939},{name:`Payson`,lon:-111.73,lat:40.04,population:21093},{name:`Washington`,lon:-113.51,lat:37.13,population:28069},{name:`Hurricane`,lon:-113.29,lat:37.18,population:19650},{name:`Clinton`,lon:-112.05,lat:41.14,population:23555},{name:`North Ogden`,lon:-111.96,lat:41.31,population:20600},{name:`Syracuse`,lon:-112.07,lat:41.09,population:30836},{name:`Farmington`,lon:-111.89,lat:40.98,population:24772},{name:`Holladay`,lon:-111.82,lat:40.67,population:31965},{name:`Highland`,lon:-111.8,lat:40.43,population:19012},{name:`Heber City`,lon:-111.41,lat:40.51,population:16362},{name:`Lindon`,lon:-111.72,lat:40.34,population:11723},{name:`Centerville`,lon:-111.87,lat:40.92,population:17522},{name:`Smithfield`,lon:-111.83,lat:41.84,population:12935},{name:`North Salt Lake`,lon:-111.91,lat:40.85,population:20810},{name:`Mapleton`,lon:-111.58,lat:40.13,population:12173},{name:`Woods Cross`,lon:-111.9,lat:40.87,population:11863},{name:`Vineyard`,lon:-111.75,lat:40.3,population:15505},{name:`Enoch`,lon:-113.03,lat:37.77,population:7568},{name:`Vernal`,lon:-109.53,lat:40.46,population:11169},{name:`Price`,lon:-110.81,lat:39.6,population:8415},{name:`Tremonton`,lon:-112.17,lat:41.71,population:9420},{name:`Roosevelt`,lon:-110.01,lat:40.3,population:7064},{name:`Richfield`,lon:-112.08,lat:38.77,population:7810},{name:`Park City`,lon:-111.5,lat:40.65,population:8376},{name:`Nephi`,lon:-111.84,lat:39.71,population:6076},{name:`Fillmore`,lon:-112.32,lat:38.97,population:2510},{name:`Beaver`,lon:-112.64,lat:38.28,population:3291},{name:`Junction`,lon:-112.22,lat:38.23,population:207},{name:`Panguitch`,lon:-112.43,lat:37.82,population:1717},{name:`Kanab`,lon:-112.53,lat:37.05,population:4826},{name:`Loa`,lon:-111.64,lat:38.4,population:563},{name:`Duchesne`,lon:-110.4,lat:40.16,population:1841},{name:`Manila`,lon:-109.72,lat:40.99,population:359},{name:`Randolph`,lon:-111.18,lat:41.67,population:480},{name:`Morgan`,lon:-111.68,lat:41.04,population:4270},{name:`Coalville`,lon:-111.4,lat:40.92,population:1588},{name:`Manti`,lon:-111.63,lat:39.27,population:3574},{name:`Ephraim`,lon:-111.59,lat:39.36,population:7292},{name:`Delta`,lon:-112.58,lat:39.35,population:3636},{name:`Moab`,lon:-109.55,lat:38.57,population:5366},{name:`Monticello`,lon:-109.34,lat:37.87,population:2058},{name:`Blanding`,lon:-109.48,lat:37.62,population:3478},{name:`Castle Dale`,lon:-111.02,lat:39.21,population:1784},{name:`Springdale`,lon:-112.99,lat:37.19,population:639},{name:`Torrey`,lon:-111.42,lat:38.3,population:242},{name:`Escalante`,lon:-111.6,lat:37.77,population:820},{name:`Boulder`,lon:-111.43,lat:37.9,population:222},{name:`Tropic`,lon:-112.08,lat:37.62,population:530},{name:`Bryce Canyon City`,lon:-112.15,lat:37.65,population:198},{name:`Mexican Hat`,lon:-109.87,lat:37.15,population:31},{name:`Bluff`,lon:-109.55,lat:37.28,population:258},{name:`Hanksville`,lon:-110.71,lat:38.37,population:219},{name:`Green River`,lon:-110.16,lat:38.99,population:952},{name:`Helper`,lon:-110.86,lat:39.68,population:2095},{name:`Wendover`,lon:-114.04,lat:40.74,population:1539},{name:`Salina`,lon:-111.86,lat:38.96,population:2562},{name:`Scipio`,lon:-112.1,lat:39.25,population:372},{name:`Cove Fort`,lon:-112.59,lat:38.6,population:10},{name:`La Verkin`,lon:-113.18,lat:37.2,population:4395},{name:`Virgin`,lon:-113.1,lat:37.21,population:673},{name:`Orderville`,lon:-112.64,lat:37.28,population:596},{name:`Glendale`,lon:-112.6,lat:37.32,population:402},{name:`Mt. Carmel Junction`,lon:-112.48,lat:37.22,population:150},{name:`Henrieville`,lon:-111.98,lat:37.57,population:236},{name:`Cannonville`,lon:-112.06,lat:37.57,population:167},{name:`Antimony`,lon:-111.99,lat:38.1,population:122},{name:`Bicknell`,lon:-111.55,lat:38.34,population:316},{name:`Fruita`,lon:-111.25,lat:38.28,population:0},{name:`Lake Powell (Bullfrog)`,lon:-110.73,lat:37.52,population:50},{name:`Halls Crossing`,lon:-110.72,lat:37.46,population:20},{name:`Ticaboo`,lon:-110.67,lat:37.75,population:49},{name:`Dutch John`,lon:-109.39,lat:40.93,population:143},{name:`Jensen`,lon:-109.35,lat:40.37,population:423},{name:`Ouray`,lon:-109.68,lat:40.09,population:15},{name:`Cisco`,lon:-109.32,lat:38.97,population:0},{name:`Thompson Springs`,lon:-109.71,lat:38.97,population:53},{name:`La Sal`,lon:-109.24,lat:38.31,population:364},{name:`Monument Valley`,lon:-110.1,lat:37,population:200},{name:`Gouldings`,lon:-110.21,lat:37.01,population:80},{name:`Garden City`,lon:-111.4,lat:41.94,population:606},{name:`Snowville`,lon:-112.71,lat:41.97,population:196},{name:`Grouse Creek`,lon:-113.85,lat:41.72,population:80},{name:`Ibapah`,lon:-113.98,lat:40.03,population:40},{name:`Milford`,lon:-113.01,lat:38.4,population:1409},{name:`Minersville`,lon:-112.93,lat:38.22,population:951},{name:`Parowan`,lon:-112.83,lat:37.84,population:3060},{name:`Enterprise`,lon:-113.72,lat:37.57,population:1926},{name:`Ivins`,lon:-113.68,lat:37.17,population:8615},{name:`Leeds`,lon:-113.36,lat:37.24,population:904},{name:`Rockville`,lon:-113.02,lat:37.17,population:243},{name:`Grafton`,lon:-113.07,lat:37.16,population:0},{name:`Grantsville`,lon:-112.47,lat:40.6,population:12049},{name:`Dugway`,lon:-112.69,lat:40.2,population:794},{name:`Vernon`,lon:-112.43,lat:40.09,population:315},{name:`Eureka`,lon:-112.12,lat:39.95,population:692},{name:`Mt. Pleasant`,lon:-111.45,lat:39.55,population:3581},{name:`Spring City`,lon:-111.5,lat:39.48,population:1069},{name:`Huntington`,lon:-111,lat:39.33,population:2129},{name:`Ferron`,lon:-111.13,lat:39.09,population:1632},{name:`Emery`,lon:-111.25,lat:38.92,population:281},{name:`Orangeville`,lon:-111.05,lat:39.23,population:1562},{name:`Sunnyside`,lon:-110.39,lat:39.55,population:266},{name:`East Carbon`,lon:-110.42,lat:39.55,population:1379},{name:`Wellington`,lon:-110.73,lat:39.54,population:1688}],rr=5e4,ir=1e4,ar=5e3,or=800,sr=400,cr=1500;function lr(e,t){let n=(e-I)/L,r=(42-t)/ye;return{x:-20*1.5*n,z:-(20*(ve/2*n+ve*r))}}function ur(e,t,n){let r=document.createElement(`canvas`),i=r.getContext(`2d`),a=`bold ${t}px sans-serif`;i.font=a;let s=i.measureText(e).width,c=t*.5,l=t*.4;r.width=Math.ceil(s+c*2),r.height=Math.ceil(t*1.4+l*2),i.font=a,i.textAlign=`center`,i.textBaseline=`middle`,i.strokeStyle=`rgba(0,0,0,0.8)`,i.lineWidth=3,i.strokeText(e,r.width/2,r.height/2),i.fillStyle=`#FFFFFF`,i.fillText(e,r.width/2,r.height/2);let d=new D(r);d.minFilter=F,d.magFilter=F;let f=new o(new u({map:d,transparent:!0,depthWrite:!1,depthTest:!1,sizeAttenuation:!0}));f.renderOrder=100;let p=r.width/r.height;return f.scale.set(n*p,n,1),f}var dr=class{scene;group=new w;entries=[];constructor(e){this.scene=e,this.group.name=`city_markers`,this.scene.add(this.group)}build(t){for(let n of nr){if(n.population<ar&&n.population>0)continue;let i=t.findCityTile(n.name),a,o,s;if(i){let e=R({q:i.q,r:i.r},20);a=e.x,o=-e.y;let n=t.getTerrainHeight(i.q,i.r);s=n===void 0?0:n}else{let e=lr(n.lon,n.lat);a=e.x,o=e.z,s=0}let c,l,u=n.name===`Salt Lake City`;u?(c=new T(1.2,3,1.2),l=16775400):n.population>rr?(c=new T(.8,2,.8),l=15788252):n.population>ir?(c=new T(.5,1.5,.5),l=13684944):(c=new k(.15,.15,.5,8),l=10526880);let d=new e({color:l,emissive:l,emissiveIntensity:u?.35:.15,roughness:.6}),f=new r(c,d),p=(c.parameters?.height??1)/2;f.position.set(a,s+p,o),this.group.add(f);let m,h;u?(m=36,h=14):n.population>rr?(m=28,h=10):n.population>ir?(m=22,h=7):(m=16,h=5);let g=ur(n.name,m,h),_=s+p*2+h*.3;g.position.set(a,_,o),this.group.add(g),this.entries.push({marker:f,label:g,worldX:a,worldY:s,worldZ:o,population:n.population})}}updateLOD(e,t,n){for(let r of this.entries){let i=e-r.worldX,a=t-r.worldY,o=n-r.worldZ,s=Math.sqrt(i*i+a*a+o*o),c=r.population>rr?or:sr;r.label.visible=s<c,r.marker.visible=s<cr}}dispose(){this.group.traverse(e=>{e instanceof r&&(e.geometry.dispose(),e.material instanceof v&&e.material.dispose()),e instanceof o&&(e.material.map&&e.material.map.dispose(),e.material.dispose())}),this.scene.remove(this.group),this.entries.length=0}},fr=[`conifer`,`aspen`,`pinyon`,`juniper`,`cottonwood`,`sagebrush`,`rabbitbrush`,`cactus`,`joshua_tree`,`rock`,`boulder`,`grass_tuft`],pr={conifer:25e3,aspen:15e3,pinyon:2e4,juniper:2e4,cottonwood:8e3,sagebrush:3e4,rabbitbrush:12e3,cactus:3e3,joshua_tree:2e3,rock:8e3,boulder:4e3,grass_tuft:15e3},mr={conifer_forest:{conifer:2,aspen:1.5,pinyon:0,juniper:0,cottonwood:0,sagebrush:.1,rabbitbrush:0,cactus:0,joshua_tree:0,rock:.3,boulder:.1,grass_tuft:.2},sagebrush:{conifer:0,aspen:0,pinyon:0,juniper:.2,cottonwood:0,sagebrush:2.5,rabbitbrush:1,cactus:0,joshua_tree:0,rock:.1,boulder:0,grass_tuft:1.5},desert:{conifer:0,aspen:0,pinyon:0,juniper:0,cottonwood:0,sagebrush:.3,rabbitbrush:.1,cactus:0,joshua_tree:0,rock:.05,boulder:0,grass_tuft:.5},mountain:{conifer:1,aspen:.5,pinyon:0,juniper:0,cottonwood:0,sagebrush:.2,rabbitbrush:0,cactus:0,joshua_tree:0,rock:.8,boulder:.3,grass_tuft:.3},alpine:{conifer:.2,aspen:0,pinyon:0,juniper:0,cottonwood:0,sagebrush:0,rabbitbrush:0,cactus:0,joshua_tree:0,rock:1.5,boulder:.8,grass_tuft:.2},red_sandstone:{conifer:0,aspen:0,pinyon:.6,juniper:.6,cottonwood:0,sagebrush:.2,rabbitbrush:.1,cactus:0,joshua_tree:0,rock:.4,boulder:.1,grass_tuft:.3},white_sandstone:{conifer:0,aspen:0,pinyon:.3,juniper:.3,cottonwood:0,sagebrush:.1,rabbitbrush:0,cactus:0,joshua_tree:0,rock:.5,boulder:.1,grass_tuft:.2},canyon_floor:{conifer:0,aspen:0,pinyon:.2,juniper:.1,cottonwood:.5,sagebrush:.3,rabbitbrush:.1,cactus:0,joshua_tree:0,rock:.2,boulder:.1,grass_tuft:.6},river_valley:{conifer:.2,aspen:.3,pinyon:0,juniper:0,cottonwood:1,sagebrush:.3,rabbitbrush:.1,cactus:0,joshua_tree:0,rock:.05,boulder:0,grass_tuft:1},marsh:{conifer:0,aspen:0,pinyon:0,juniper:0,cottonwood:.5,sagebrush:.2,rabbitbrush:0,cactus:0,joshua_tree:0,rock:0,boulder:0,grass_tuft:2},badlands:{conifer:0,aspen:0,pinyon:0,juniper:0,cottonwood:0,sagebrush:.3,rabbitbrush:.1,cactus:0,joshua_tree:0,rock:.8,boulder:.2,grass_tuft:.3},lava_field:{conifer:0,aspen:0,pinyon:0,juniper:0,cottonwood:0,sagebrush:.1,rabbitbrush:0,cactus:0,joshua_tree:0,rock:.8,boulder:.3,grass_tuft:.1},salt_flat:{},urban:{},water:{}},hr={dense_forest:{densityMul:14,scaleMul:1.25},forest:{densityMul:8,scaleMul:1.15},woodland:{densityMul:5,scaleMul:1.05}};function gr(e,t){if(t)switch(t){case`pinyon_juniper`:e.pinyon=1.5,e.juniper=1.5;break;case`aspen_grove`:e.aspen=3,e.conifer=.5;break;case`dense_forest`:e.conifer=(e.conifer??0)*3,e.aspen=(e.aspen??0)*2;break;case`forest`:e.conifer=(e.conifer??0)*2,e.aspen=(e.aspen??0)*1.5;break;case`woodland`:e.conifer=(e.conifer??0)*1.2,e.pinyon=Math.max(e.pinyon??0,1),e.juniper=Math.max(e.juniper??0,1);break}}function _r(e,t){/mojave/i.test(t)&&(e.cactus=.8,e.joshua_tree=.5,e.sagebrush=Math.max(e.sagebrush??0,.5)),/high plateaus/i.test(t)&&(e.conifer=(e.conifer??0)*1.5,e.aspen=(e.aspen??0)*1.5),/colorado plateau/i.test(t)&&(e.pinyon=(e.pinyon??0)*1.3,e.juniper=(e.juniper??0)*1.3,e.rock=Math.max((e.rock??0)*1,.5))}function vr(e,t){(t===`desert`||t===`sagebrush`||t===`red_sandstone`)&&(e.cottonwood=Math.max(e.cottonwood??0,.8),e.sagebrush=Math.max(e.sagebrush??0,.3),e.grass_tuft=Math.max(e.grass_tuft??0,.5))}function yr(e){return e?hr[e]??null:null}var br=100,xr=class{cells=new Map;cellSize;constructor(e){this.cellSize=e}key(e,t){return`${e},${t}`}insert(e){let t=Math.floor(e.x/this.cellSize),n=Math.floor(e.z/this.cellSize),r=this.key(t,n),i=this.cells.get(r);i||(i=[],this.cells.set(r,i)),i.push(e)}queryRadius(e,t,n){let r=[],i=Math.floor((e-n)/this.cellSize),a=Math.floor((e+n)/this.cellSize),o=Math.floor((t-n)/this.cellSize),s=Math.floor((t+n)/this.cellSize),c=n*n;for(let n=i;n<=a;n++)for(let i=o;i<=s;i++){let a=this.cells.get(this.key(n,i));if(a)for(let n=0;n<a.length;n++){let i=a[n],o=i.x-e,s=i.z-t;o*o+s*s<=c&&r.push(i)}}return r}clear(){this.cells.clear()}};function q(e,t,n,r){let i=r;return i=(i^e*374761393)>>>0,i=(i^t*668265263)>>>0,i=(i^n*2654435761)>>>0,i=(i>>13^i)*1274126177>>>0,i=(i>>16^i)>>>0,i}function J(e){return(e&2147483647)/2147483647}function Sr(e,t){let n=[];for(let r=0;r<e.length;r++){let i=e[r].clone();i.applyMatrix4(t[r]),n.push(i)}let r=0,i=0;for(let e of n)r+=e.getAttribute(`position`).count,i+=e.index?e.index.count:e.getAttribute(`position`).count;let a=new Float32Array(r*3),o=new Float32Array(r*3),s=[],c=0;for(let e of n){let t=e.getAttribute(`position`),n=e.getAttribute(`normal`);for(let e=0;e<t.count;e++)a[(c+e)*3]=t.getX(e),a[(c+e)*3+1]=t.getY(e),a[(c+e)*3+2]=t.getZ(e),n&&(o[(c+e)*3]=n.getX(e),o[(c+e)*3+1]=n.getY(e),o[(c+e)*3+2]=n.getZ(e));if(e.index)for(let t=0;t<e.index.count;t++)s.push(e.index.array[t]+c);else for(let e=0;e<t.count;e++)s.push(c+e);c+=t.count}let l=new ce;return l.setAttribute(`position`,new M(a,3)),l.setAttribute(`normal`,new M(o,3)),l.setIndex(s),l}function Y(e){return new ne({color:new P(e)})}function Cr(){return Sr([new O(.4,2,6),new k(.06,.06,.5,4)],[new i().makeTranslation(0,1.5,0),new i().makeTranslation(0,.25,0)])}function wr(){return new O(.4,2.5,4)}function Tr(){let e=new x(.3,6,4);return Sr([new k(.04,.04,1.5,5),e],[new i().makeTranslation(0,.75,0),new i().makeTranslation(0,1.75,0)])}function Er(){return new x(.3,4,3)}function Dr(){let e=new x(.4,6,4);return e.scale(1,.6,1),Sr([e,new k(.05,.05,.4,4)],[new i().makeTranslation(0,.7,0),new i().makeTranslation(0,.2,0)])}function Or(){let e=new x(.4,4,3);return e.scale(1,.6,1),e}function kr(){let e=new fe(.35,1),t=e.getAttribute(`position`);for(let e=0;e<t.count;e++){let n=t.getX(e),r=t.getY(e),i=t.getZ(e),a=Math.sin(n*12.3)*Math.cos(i*9.7)*.06;t.setXYZ(e,n+a,r+a*.5,i+a)}return e.computeVertexNormals(),Sr([e,new k(.04,.06,.6,4)],[new i().makeTranslation(0,.9,0),new i().makeTranslation(0,.3,0)])}function Ar(){return new fe(.35,0)}function jr(){let e=new x(.5,6,5);return Sr([new k(.06,.06,2,5),e],[new i().makeTranslation(0,1,0),new i().makeTranslation(0,2.5,0)])}function Mr(){return new x(.5,4,3)}function Nr(){let e=new x(.15,6,4);return e.scale(1,.7,1),e}function Pr(){let e=new x(.15,4,2);return e.scale(1,.7,1),e}function Fr(){return new x(.12,6,4)}function Ir(){return new x(.12,4,3)}function Lr(){return new k(.08,.08,.5,6)}function Rr(){return new k(.08,.08,.5,4)}function zr(){let e=new k(.06,.08,1.5,5),t=new k(.04,.04,.8,4),n=new k(.04,.04,.7,4),r=new x(.15,5,4),a=new x(.12,5,4),o=new i().makeTranslation(0,.75,0),s=new i().makeRotationZ(.6).multiply(new i().makeTranslation(.2,1.6,0)),c=new i().makeRotationZ(-.5).multiply(new i().makeTranslation(-.15,1.5,.1)),l=new i().makeTranslation(.5,1.9,0),u=new i().makeTranslation(-.4,1.8,.1);return Sr([e,t,n,r,a],[o,s,c,l,u])}function Br(){return new k(.12,.08,2,4)}function Vr(){let e=new fe(.3,1),t=e.getAttribute(`position`);for(let e=0;e<t.count;e++){let n=t.getX(e),r=t.getY(e),i=t.getZ(e),a=Math.sin(n*17.1+r*5.3)*Math.cos(i*11.7)*.05;t.setXYZ(e,n+a,r*.7+a*.3,i+a)}return e.computeVertexNormals(),e}function Hr(){return new fe(.3,0)}function Ur(){let e=new fe(.6,1),t=e.getAttribute(`position`);for(let e=0;e<t.count;e++){let n=t.getX(e),r=t.getY(e),i=t.getZ(e),a=Math.sin(n*8.3+i*6.1)*Math.cos(r*7.9)*.08;t.setXYZ(e,n+a,r*.65+a*.2,i+a)}return e.computeVertexNormals(),e}function Wr(){return new fe(.6,0)}function Gr(){return new O(.08,.15,5)}function Kr(){return new O(.08,.15,3)}function qr(){let e=new Map;return e.set(`conifer`,{detail:Cr(),lod:wr(),material:Y(`#1A4A2D`)}),e.set(`aspen`,{detail:Tr(),lod:Er(),material:Y(`#6BAA4B`)}),e.set(`pinyon`,{detail:Dr(),lod:Or(),material:Y(`#5A6A3A`)}),e.set(`juniper`,{detail:kr(),lod:Ar(),material:Y(`#5B6B3A`)}),e.set(`cottonwood`,{detail:jr(),lod:Mr(),material:Y(`#5A8A3A`)}),e.set(`sagebrush`,{detail:Nr(),lod:Pr(),material:Y(`#8B9A6B`)}),e.set(`rabbitbrush`,{detail:Fr(),lod:Ir(),material:Y(`#B8A840`)}),e.set(`cactus`,{detail:Lr(),lod:Rr(),material:Y(`#3A6A2A`)}),e.set(`joshua_tree`,{detail:zr(),lod:Br(),material:Y(`#8A9A6A`)}),e.set(`rock`,{detail:Vr(),lod:Hr(),material:Y(`#7A7A7A`)}),e.set(`boulder`,{detail:Ur(),lod:Wr(),material:Y(`#6A6A6A`)}),e.set(`grass_tuft`,{detail:Gr(),lod:Kr(),material:Y(`#B8A878`)}),e}var Jr=new P(`#D4AA40`),Yr=new P(`#6BAA4B`),Xr=new P(`#7A7A7A`),Zr=new P(`#A05A3A`),Qr=new P(`#6A6A6A`),$r=new P(`#8A4A2A`);function ei(e,t,n,r,i,a,o){let s=[];for(let c=0;c<r;c++){let r=q(e,t,7e3+c*2,n),l=q(e,t,7001+c*2,n),u=J(r)*Math.PI*2,d=J(l)*o*.7;s.push({x:i+Math.cos(u)*d,z:a+Math.sin(u)*d})}return s}function ti(e,t,n){let r=.5,i=n(e,t),a=n(e+r,t),o=n(e,t+r);if(i===void 0||a===void 0||o===void 0)return 0;let s=(a-i)/r,c=(o-i)/r;return Math.atan(Math.sqrt(s*s+c*c))}function ni(e){return e?e===`dense_forest`||e===`forest`||e===`woodland`:!1}function ri(e,t){return!!(t===`red_sandstone`||t===`canyon_floor`||/colorado plateau/i.test(e)||/grand staircase/i.test(e))}var ii=class{scene;detailMeshes=new Map;lodMeshes=new Map;spatialGrid=new xr(br);allInstances=[];lastCamX=1/0;lastCamZ=1/0;qualityScale=1;_mat4=new i;_pos=new C;_quat=new g;_scale=new C;meshDefs=null;group;constructor(e){this.scene=e,this.group=new w,this.group.name=`vegetation_scatter`,this.scene.add(this.group)}build(e,t,n){this.dispose(),this.group=new w,this.group.name=`vegetation_scatter`,this.scene.add(this.group),this.meshDefs=qr(),this.allInstances=[],this.spatialGrid.clear();let r=new Map;for(let e of fr)r.set(e,0);let i=50*Math.PI/180,a=e.getLandTiles();for(let e of a){let t=e.terrain;if(t===`water`||t===`urban`)continue;let a=mr[t],o=a?{...a}:{};gr(o,e.feature),e.region&&_r(o,e.region),e.waterway&&vr(o,t);let s=yr(e.feature),c=[];for(let e of fr){let t=o[e];if(t!==void 0&&t>0){let n=t;s&&(n*=s.densityMul),c.push([e,n])}}if(c.length===0)continue;let l=R({q:e.q,r:e.r},20),u=l.x,d=-l.y,f=20*.866,p=ni(e.feature),m=ri(e.region,t),h=1+Math.floor(J(q(e.q,e.r,6e3,42))*3),g=p?[]:ei(e.q,e.r,42,h,u,d,f),_=s?s.scaleMul:1;for(let[t,a]of c){let o=fr.indexOf(t),s=a*this.qualityScale,c=Math.floor(s),l=s-c,h=c+(J(q(e.q,e.r,9999,42+o))<l?1:0);for(let a=0;a<h;a++){let s=r.get(t);if(s>=Math.floor(pr[t]*this.qualityScale))break;let c=42+o,l=q(e.q,e.r,a*5,c),v=q(e.q,e.r,a*5+1,c),y=q(e.q,e.r,a*5+2,c),b=q(e.q,e.r,a*5+3,c),x=q(e.q,e.r,a*5+4,c),S,C;if(p){let e=f*2/Math.ceil(Math.sqrt(h+1)),t=Math.max(1,Math.ceil(f*2/e)),n=a%t,r=Math.floor(a/t),i=u-f+n*e+e*.5,o=d-f+r*e+e*.5,s=(J(l)-.5)*e*.7,c=(J(v)-.5)*e*.7;S=i+s,C=o+c}else if(J(x)<.6&&g.length>0){let t=Math.floor(J(q(e.q,e.r,a*5+10,c))*g.length),n=g[Math.min(t,g.length-1)],r=J(l)*Math.PI*2,i=J(v)*f*.35;S=n.x+Math.cos(r)*i,C=n.z+Math.sin(r)*i}else{let e=J(l)*Math.PI*2,t=J(v)*f*.9;S=u+Math.cos(e)*t,C=d+Math.sin(e)*t}let w=n(S,C);if(w===void 0||w<-.1||ti(S,C,n)>i||e.elevation>=13)continue;let T=(.7+J(y)*.6)*_,E=J(b)*Math.PI*2,D={x:S,y:w,z:C,type:t,scale:T,rotationY:E,regionIsRedRock:m};this.allInstances.push(D),this.spatialGrid.insert(D),r.set(t,s+1)}}}this.createInstancedMeshes(),this.lastCamX=1/0,this.lastCamZ=1/0}update(e){this.updateLOD(e.x,e.z)}updateLOD(e,t){let n=e-this.lastCamX,r=t-this.lastCamZ;if(n*n+r*r<625)return;this.lastCamX=e,this.lastCamZ=t;let i=this.spatialGrid.queryRadius(e,t,300),a=this.spatialGrid.queryRadius(e,t,500),o=new Set(i),s=[];for(let e of a)o.has(e)||s.push(e);let c=new Map,l=new Map;for(let e of fr)c.set(e,[]),l.set(e,[]);for(let e of i)c.get(e.type).push(e);for(let e of s)l.get(e.type).push(e);for(let e of fr)this.fillInstancedMesh(this.detailMeshes.get(e),c.get(e),e),this.fillInstancedMesh(this.lodMeshes.get(e),l.get(e),e)}setQuality(e){this.qualityScale=Math.max(.1,Math.min(1,e))}dispose(){for(let e of this.detailMeshes.values())e.geometry.dispose(),e.material instanceof v&&e.material.dispose(),this.group.remove(e);for(let e of this.lodMeshes.values())e.geometry.dispose(),e.material instanceof v&&e.material.dispose(),this.group.remove(e);if(this.detailMeshes.clear(),this.lodMeshes.clear(),this.allInstances=[],this.spatialGrid.clear(),this.meshDefs){for(let e of this.meshDefs.values())e.detail.dispose(),e.lod.dispose(),e.material.dispose();this.meshDefs=null}this.scene.remove(this.group)}createInstancedMeshes(){if(this.meshDefs)for(let e of fr){let t=this.meshDefs.get(e);if(!t)continue;let n=pr[e],r=new de(t.detail,t.material.clone(),n);r.matrixAutoUpdate=!1,r.matrixWorldAutoUpdate=!1,r.frustumCulled=!1,r.count=0,r.name=`veg_detail_${e}`,this.detailMeshes.set(e,r),this.group.add(r);let i=new de(t.lod,t.material.clone(),n);i.matrixAutoUpdate=!1,i.matrixWorldAutoUpdate=!1,i.frustumCulled=!1,i.count=0,i.name=`veg_lod_${e}`,this.lodMeshes.set(e,i),this.group.add(i),(e===`aspen`||e===`rock`||e===`boulder`)&&(r.instanceColor=new E(new Float32Array(n*3),3),i.instanceColor=new E(new Float32Array(n*3),3))}}fillInstancedMesh(e,t,n){if(!e)return;let r=Math.min(t.length,e.instanceMatrix.count);e.count=r;let i=n===`aspen`||n===`rock`||n===`boulder`,a=new P;for(let o=0;o<r;o++){let r=t[o];if(this._pos.set(r.x,r.y,r.z),this._quat.setFromAxisAngle(f.DEFAULT_UP,r.rotationY),this._scale.setScalar(r.scale),this._mat4.compose(this._pos,this._quat,this._scale),e.setMatrixAt(o,this._mat4),i&&e.instanceColor){if(n===`aspen`){let e=q(Math.floor(r.x*10),Math.floor(r.z*10),Math.floor(r.x*100)^Math.floor(r.z*100),42);a.copy(J(e)<.3?Jr:Yr)}else n===`rock`?a.copy(r.regionIsRedRock?Zr:Xr):n===`boulder`&&a.copy(r.regionIsRedRock?$r:Qr);e.instanceColor.setXYZ(o,a.r,a.g,a.b)}}e.instanceMatrix.needsUpdate=!0,i&&e.instanceColor&&(e.instanceColor.needsUpdate=!0)}},ai=[{name:`Mojave Fringe`,terrain:`desert`,elevation:1,polygon:[[-114.05,37.6],[-113.6,37.6],[-113.4,37.4],[-113.1,37.3],[-112.95,37.3],[-112.7,37.15],[-112.5,37],[-114.05,37]]},{name:`Great Basin`,terrain:`desert`,elevation:2,polygon:[[-114.05,42],[-112.1,42],[-111.85,41.8],[-111.8,41.3],[-111.85,40.8],[-112,40.5],[-112.1,40.2],[-112,39.8],[-111.95,39.5],[-112.05,39.15],[-112.15,38.8],[-112.3,38.4],[-112.5,38],[-112.7,37.6],[-112.95,37.3],[-113.1,37],[-114.05,37]]},{name:`Wasatch Front`,terrain:`sagebrush`,elevation:3,polygon:[[-112.1,42],[-111.7,42],[-111.65,41.7],[-111.6,41.3],[-111.55,40.9],[-111.6,40.5],[-111.65,40.1],[-111.7,39.7],[-111.8,39.5],[-111.95,39.5],[-112,39.8],[-112.1,40.2],[-112,40.5],[-111.85,40.8],[-111.8,41.3],[-111.85,41.8]]},{name:`Uinta Basin`,terrain:`sagebrush`,elevation:3,polygon:[[-111.3,40.55],[-110.8,40.5],[-110.2,40.48],[-109.8,40.45],[-109.2,40.4],[-109.05,40.35],[-109.05,39.7],[-109.5,39.7],[-110,39.65],[-110.5,39.65],[-111,39.8],[-111.3,40]]},{name:`Colorado Plateau North`,terrain:`red_sandstone`,elevation:4,polygon:[[-111,39.8],[-110.5,39.65],[-110,39.65],[-109.5,39.7],[-109.05,39.7],[-109.05,38.85],[-109.5,38.9],[-110.1,38.9],[-110.5,38.8],[-111,38.65],[-111.3,38.6],[-111.5,38.7],[-111.6,39],[-111.5,39.3],[-111.3,39.6]]},{name:`Colorado Plateau South`,terrain:`red_sandstone`,elevation:4,polygon:[[-111.5,38.7],[-111,38.65],[-110.5,38.8],[-110.1,38.9],[-109.5,38.9],[-109.05,38.85],[-109.05,37],[-110,37],[-110.5,37.05],[-111,37.1],[-111.3,37.3],[-111.5,37.5],[-111.6,37.8],[-111.6,38.1],[-111.55,38.4]]},{name:`Grand Staircase`,terrain:`red_sandstone`,elevation:5,polygon:[[-112.5,37.6],[-111.6,37.8],[-111.5,37.5],[-111.3,37.3],[-111,37.1],[-110,37],[-110,37],[-112.1,37],[-112.5,37],[-112.7,37.15],[-112.65,37.4]]},{name:`High Plateaus`,terrain:`conifer_forest`,elevation:7,polygon:[[-111.95,39.5],[-111.8,39.5],[-111.7,39.7],[-111.65,40.1],[-111.6,40.5],[-111.55,40.9],[-111.3,40.55],[-111.3,40],[-111.3,39.6],[-111.5,39.3],[-111.6,39],[-111.5,38.7],[-111.55,38.4],[-111.6,38.1],[-111.6,37.8],[-112.5,37.6],[-112.65,37.4],[-112.7,37.6],[-112.5,38],[-112.3,38.4],[-112.15,38.8],[-112.05,39.15]]},{name:`Northern Wasatch-Uinta`,terrain:`conifer_forest`,elevation:6,polygon:[[-111.7,42],[-109.05,42],[-109.05,40.35],[-109.2,40.4],[-109.8,40.45],[-110.2,40.48],[-110.8,40.5],[-111.3,40.55],[-111.55,40.9],[-111.6,41.3],[-111.65,41.7]]}],oi=[{terrain:`salt_flat`,elevation:1,polygon:[[-114.05,40.9],[-113.75,40.9],[-113.65,40.8],[-113.6,40.72],[-113.7,40.65],[-114.05,40.6]]},{terrain:`urban`,elevation:2,polygon:[[-112.1,40.85],[-111.82,40.85],[-111.78,40.75],[-111.78,40.6],[-111.82,40.5],[-112.05,40.48],[-112.1,40.55]]},{terrain:`urban`,elevation:2,polygon:[[-111.82,40.35],[-111.68,40.35],[-111.65,40.28],[-111.65,40.15],[-111.72,40.08],[-111.82,40.1],[-111.85,40.2]]},{terrain:`sagebrush`,elevation:2,polygon:[[-111.95,41.95],[-111.72,41.95],[-111.7,41.82],[-111.68,41.68],[-111.72,41.6],[-111.9,41.58],[-111.95,41.7]]},{terrain:`badlands`,elevation:4,polygon:[[-110.95,38.55],[-110.6,38.55],[-110.55,38.4],[-110.55,38.25],[-110.65,38.2],[-110.95,38.25]]},{terrain:`lava_field`,elevation:3,polygon:[[-112.65,38.8],[-112.45,38.8],[-112.4,38.7],[-112.42,38.62],[-112.55,38.58],[-112.65,38.65]]},{terrain:`lava_field`,elevation:2,polygon:[[-113.72,37.25],[-113.58,37.25],[-113.55,37.18],[-113.55,37.12],[-113.62,37.08],[-113.72,37.12]]},{terrain:`salt_flat`,elevation:1,polygon:[[-112.8,39.3],[-112.4,39.3],[-112.3,39.15],[-112.25,38.9],[-112.35,38.75],[-112.65,38.75],[-112.8,38.95]]},{terrain:`marsh`,elevation:1,polygon:[[-112.2,41.2],[-111.95,41.15],[-111.9,41.05],[-111.9,40.9],[-112,40.8],[-112.15,40.78],[-112.3,40.82],[-112.4,40.9],[-112.45,41.05],[-112.35,41.15]]},{terrain:`white_sandstone`,elevation:5,polygon:[[-111.3,38.4],[-111.1,38.4],[-111.05,38.25],[-111.05,38.1],[-111.15,38],[-111.3,38.05],[-111.35,38.2]]},{terrain:`white_sandstone`,elevation:5,polygon:[[-113.05,37.35],[-112.85,37.35],[-112.82,37.25],[-112.82,37.15],[-112.9,37.1],[-113.05,37.15]]},{terrain:`alpine`,elevation:14,polygon:[[-111.15,40.88],[-110.7,40.86],[-110.3,40.82],[-110,40.78],[-109.7,40.72],[-109.65,40.65],[-109.7,40.6],[-110,40.62],[-110.3,40.64],[-110.7,40.67],[-111.15,40.72]]},{terrain:`conifer_forest`,elevation:8,polygon:[[-111.82,41.6],[-111.62,41.6],[-111.58,41.2],[-111.58,40.8],[-111.62,40.4],[-111.68,40.1],[-111.78,39.85],[-111.85,39.85],[-111.8,40.1],[-111.78,40.4],[-111.75,40.8],[-111.75,41.2],[-111.82,41.6]]},{terrain:`conifer_forest`,elevation:8,polygon:[[-111.6,38.25],[-111.3,38.25],[-111.22,38.1],[-111.22,37.92],[-111.35,37.85],[-111.6,37.9],[-111.65,38.05]]},{terrain:`conifer_forest`,elevation:8,polygon:[[-113,37.85],[-112.68,37.85],[-112.6,37.68],[-112.6,37.45],[-112.72,37.38],[-113,37.42]]},{terrain:`conifer_forest`,elevation:8,polygon:[[-111.8,38.7],[-111.55,38.7],[-111.5,38.55],[-111.52,38.42],[-111.65,38.38],[-111.8,38.45]]}];function si(e,t){let n=(e-I)/L,r=(42-t)/ye;return{x:-20*1.5*n,z:-(20*(ve/2*n+ve*r))}}var ci=[{regionName:`Great Basin`,displayName:`GREAT BASIN`,color:`#D8C098`,yOffset:65},{regionName:`Wasatch Front`,displayName:`WASATCH FRONT`,color:`#8B9A6B`,yOffset:70},{regionName:`Uinta Basin`,displayName:`UINTA BASIN`,color:`#8B9A6B`,yOffset:60},{regionName:`Colorado Plateau North`,displayName:`COLORADO PLATEAU`,color:`#C45B28`,yOffset:55},{regionName:`Grand Staircase`,displayName:`GRAND STAIRCASE`,color:`#C45B28`,yOffset:50},{regionName:`High Plateaus`,displayName:`HIGH PLATEAUS`,color:`#2D5A3D`,yOffset:75},{regionName:`Mojave Fringe`,displayName:`MOJAVE FRINGE`,color:`#D8C098`,yOffset:55}],li=500,ui=300;function di(e,t){let n=document.createElement(`canvas`),r=n.getContext(`2d`);r.font=`bold 48px sans-serif`;let i=0;for(let t=0;t<e.length;t++)i+=r.measureText(e[t]).width+(t<e.length-1?8:0);n.width=Math.ceil(i+96),n.height=125,r.font=`bold 48px sans-serif`,r.textBaseline=`middle`;let a=n.height/2,s=48;for(let n=0;n<e.length;n++)r.strokeStyle=`rgba(0,0,0,0.3)`,r.lineWidth=2,r.strokeText(e[n],s,a),r.fillStyle=t,r.globalAlpha=.4,r.fillText(e[n],s,a),r.globalAlpha=1,s+=r.measureText(e[n]).width+8;let c=new D(n);c.minFilter=F,c.magFilter=F;let l=new o(new u({map:c,transparent:!0,depthWrite:!1,depthTest:!1,sizeAttenuation:!0}));l.renderOrder=100;let d=n.width/n.height;return l.scale.set(80*d,80,1),l}var fi=class{scene;group=new w;sprites=[];constructor(e){this.scene=e,this.group.name=`region_labels`,this.scene.add(this.group)}build(e,t){for(let e of ci){let t=ai.find(t=>t.name===e.regionName);if(!t)continue;let n=0,r=0;for(let[e,i]of t.polygon)n+=e,r+=i;let{x:i,z:a}=si(n/t.polygon.length,r/t.polygon.length),o=di(e.displayName,e.color);o.position.set(i,e.yOffset,a),this.group.add(o),this.sprites.push(o)}}setVisible(e){this.group.visible=e}updateLOD(e){if(e>li)for(let e of this.sprites)e.visible=!0,e.material.opacity=1;else if(e>ui){let t=(e-ui)/(li-ui);for(let e of this.sprites)e.visible=!0,e.material.opacity=t}else for(let e of this.sprites)e.visible=!1}dispose(){this.group.traverse(e=>{e instanceof o&&(e.material.map&&e.material.map.dispose(),e.material.dispose())}),this.scene.remove(this.group),this.sprites.length=0}},pi=class{scene;group=new w;constructor(e){this.scene=e,this.group.name=`grid_overlay`,this.group.visible=!1,this.scene.add(this.group)}build(e,t,r){let i=new Set,a=[],o=.15;for(let t of e.getLandTiles()){let e=R({q:t.q,r:t.r},20),n=e.x;-e.y;let s=Ge({x:n,y:e.y},20);for(let e=0;e<6;e++){let t=(e+1)%6,n=s[e],c=s[t],l=n.x,u=-n.y,d=c.x,f=-c.y,p=`${Math.round(l*10)},${Math.round(u*10)}`,m=`${Math.round(d*10)},${Math.round(f*10)}`,h=p<m?`${p}|${m}`:`${m}|${p}`;if(i.has(h))continue;i.add(h);let g=(r(l,u)??0)+o,_=(r(d,f)??0)+o;a.push(l,g,u,d,_,f)}}if(a.length>0){let e=new ce;e.setAttribute(`position`,new j(a,3));let t=new n(e,new _({color:16777215,transparent:!0,opacity:.06,depthWrite:!1}));t.name=`hex_grid`,this.group.add(t)}}setVisible(e){this.group.visible=e}dispose(){this.group.traverse(e=>{e instanceof n&&(e.geometry.dispose(),e.material instanceof v&&e.material.dispose())}),this.scene.remove(this.group)}},mi=2e3,hi=400,gi=200,_i=50,vi=30,yi=5,bi=3,xi=20,Si=1.5,Ci=500,wi=300,Ti=0,Ei=10,Di=8,Oi=2,ki=2,Ai=class{scene;enabled=!0;snowPoints;snowPositions;snowVelocities;dustPoints;dustPositions;dustVelocities;constructor(e){this.scene=e,this.snowPositions=new Float32Array(mi*3),this.snowVelocities=new Float32Array(mi*3);for(let e=0;e<mi;e++)this.snowPositions[e*3+0]=(Math.random()-.5)*hi*2,this.snowPositions[e*3+1]=Math.random()*gi,this.snowPositions[e*3+2]=(Math.random()-.5)*hi*2,this.snowVelocities[e*3+0]=yi+(Math.random()-.5)*2,this.snowVelocities[e*3+1]=-vi*(.7+Math.random()*.6),this.snowVelocities[e*3+2]=bi+(Math.random()-.5)*2;let t=new ce;t.setAttribute(`position`,new M(this.snowPositions,3)),this.snowPoints=new c(t,new d({color:16777215,size:Si,sizeAttenuation:!0,transparent:!0,opacity:.7,depthWrite:!1})),this.snowPoints.name=`weather_snow`,this.snowPoints.visible=!1,this.snowPoints.frustumCulled=!1,this.scene.add(this.snowPoints),this.dustPositions=new Float32Array(Ci*3),this.dustVelocities=new Float32Array(Ci*3);for(let e=0;e<Ci;e++)this.dustPositions[e*3+0]=(Math.random()-.5)*wi*2,this.dustPositions[e*3+1]=Ti+Math.random()*(Ei-Ti),this.dustPositions[e*3+2]=(Math.random()-.5)*wi*2,this.dustVelocities[e*3+0]=(Math.random()-.3)*Di,this.dustVelocities[e*3+1]=(Math.random()-.5)*.5,this.dustVelocities[e*3+2]=(Math.random()-.3)*Di;let n=new ce;n.setAttribute(`position`,new M(this.dustPositions,3)),this.dustPoints=new c(n,new d({color:13940874,size:ki,sizeAttenuation:!0,transparent:!0,opacity:.4,depthWrite:!1})),this.dustPoints.name=`weather_dust`,this.dustPoints.frustumCulled=!1,this.scene.add(this.dustPoints)}update(e,t,n,r){if(!this.enabled)return;let i=Math.min(r,.1),a=t>xi;if(this.snowPoints.visible=a,a){for(let r=0;r<mi;r++){let a=r*3;this.snowPositions[a+0]+=this.snowVelocities[a+0]*i,this.snowPositions[a+1]+=this.snowVelocities[a+1]*i,this.snowPositions[a+2]+=this.snowVelocities[a+2]*i;let o=this.snowPositions[a+1]-t,s=this.snowPositions[a+0]-e,c=this.snowPositions[a+2]-n;(o<-_i||Math.abs(s)>hi||Math.abs(c)>hi)&&(this.snowPositions[a+0]=e+(Math.random()-.5)*hi*2,this.snowPositions[a+1]=t+gi*(.5+Math.random()*.5),this.snowPositions[a+2]=n+(Math.random()-.5)*hi*2)}this.snowPoints.geometry.attributes.position.needsUpdate=!0}for(let t=0;t<Ci;t++){let r=t*3;this.dustVelocities[r+0]+=(Math.random()-.5)*Oi*i,this.dustVelocities[r+2]+=(Math.random()-.5)*Oi*i;let a=this.dustVelocities[r+0],o=this.dustVelocities[r+2],s=Math.sqrt(a*a+o*o);s>Di&&(this.dustVelocities[r+0]=a/s*Di,this.dustVelocities[r+2]=o/s*Di),this.dustPositions[r+0]+=this.dustVelocities[r+0]*i,this.dustPositions[r+1]+=this.dustVelocities[r+1]*i,this.dustPositions[r+2]+=this.dustVelocities[r+2]*i,this.dustPositions[r+1]<Ti?(this.dustPositions[r+1]=Ti,this.dustVelocities[r+1]=Math.abs(this.dustVelocities[r+1])):this.dustPositions[r+1]>Ei&&(this.dustPositions[r+1]=Ei,this.dustVelocities[r+1]=-Math.abs(this.dustVelocities[r+1]));let c=this.dustPositions[r+0]-e,l=this.dustPositions[r+2]-n;(Math.abs(c)>wi||Math.abs(l)>wi)&&(this.dustPositions[r+0]=e+(Math.random()-.5)*wi*2,this.dustPositions[r+2]=n+(Math.random()-.5)*wi*2)}this.dustPoints.geometry.attributes.position.needsUpdate=!0}setEnabled(e){this.enabled=e,this.snowPoints.visible=e,this.dustPoints.visible=e}dispose(){this.scene.remove(this.snowPoints),this.scene.remove(this.dustPoints),this.snowPoints.geometry.dispose(),this.snowPoints.material.dispose(),this.dustPoints.geometry.dispose(),this.dustPoints.material.dispose()}},ji=`utah_graphics_settings_v1`,Mi=class e{static PRESETS={low:{preset:`low`,renderScale:.5,pixelRatio:1,vegetationDensity:.3,shadowQuality:!1,weatherEffects:!1,regionLabels:!1},medium:{preset:`medium`,renderScale:.65,pixelRatio:1.25,vegetationDensity:.6,shadowQuality:!0,weatherEffects:!1,regionLabels:!0},high:{preset:`high`,renderScale:.75,pixelRatio:1.5,vegetationDensity:.85,shadowQuality:!0,weatherEffects:!0,regionLabels:!0},ultra:{preset:`ultra`,renderScale:Math.min(.75,ke),pixelRatio:Math.min(1.5,Ae),vegetationDensity:1,shadowQuality:!0,weatherEffects:!0,regionLabels:!0}};settings;listeners=[];constructor(){let t=this.loadFromStorage();if(t)this.settings=t;else{let t=e.autoDetectPreset();this.settings={...e.PRESETS[t]}}}get(){return{...this.settings}}setPreset(t){this.settings={...e.PRESETS[t]},this.emit(),this.save()}update(e){this.settings={...this.settings,...e},this.emit(),this.save()}onChange(e){this.listeners.push(e)}save(){try{localStorage.setItem(ji,JSON.stringify(this.settings))}catch{}}load(){let e=this.loadFromStorage();e&&(this.settings=e,this.emit())}loadFromStorage(){try{let t=localStorage.getItem(ji);if(!t)return null;let n=JSON.parse(t);if(!n||!n.preset)return null;let r=e.PRESETS[n.preset];return r?{...r,...n}:null}catch{return null}}emit(){let e=this.get();for(let t of this.listeners)t(e)}static autoDetectPreset(){let e=typeof navigator<`u`&&navigator.hardwareConcurrency||4,t=typeof navigator<`u`&&navigator.deviceMemory||4;return e>=8&&t>=8?`high`:e>=6&&t>=4||e>=4&&t>=4?`medium`:`low`}},Ni=1e3/60,Pi=1e3/30,Fi=class{dirty=new Set;continuous=!1;lastRenderTime=0;constructor(){this.dirty.add(`startup`)}setDirty(e){this.dirty.add(e)}shouldRender(e){if(this.continuous)return e-this.lastRenderTime>=Ni;if(this.dirty.size===0)return!1;let t=this.dirty.has(`camera`)||this.dirty.has(`animation`)?Ni:Pi;return!(e-this.lastRenderTime<t)}markRendered(){this.lastRenderTime=performance.now();let e=this.dirty.has(`animation`);this.dirty.clear(),e&&this.dirty.add(`animation`)}setContinuous(e){this.continuous=e,e&&this.dirty.add(`animation`)}},Ii=[{name:`Colorado River`,width:1.2,valleyDepth:.9,valleyWidth:2,navigable:!0,points:[[-109.05,38.98],[-109.1,38.96],[-109.16,38.93],[-109.22,38.9],[-109.28,38.87],[-109.33,38.84],[-109.38,38.81],[-109.42,38.79],[-109.44,38.76],[-109.46,38.73],[-109.48,38.71],[-109.5,38.68],[-109.53,38.65],[-109.55,38.62],[-109.57,38.6],[-109.58,38.58],[-109.6,38.57],[-109.62,38.55],[-109.63,38.53],[-109.62,38.5],[-109.6,38.48],[-109.59,38.45],[-109.62,38.42],[-109.65,38.4],[-109.68,38.37],[-109.72,38.35],[-109.78,38.32],[-109.82,38.28],[-109.85,38.24],[-109.88,38.2],[-109.9,38.16],[-109.9,38.12],[-109.92,38.08],[-109.93,38.05],[-109.95,38.02],[-109.98,37.98],[-110.02,37.94],[-110.06,37.9],[-110.1,37.86],[-110.14,37.82],[-110.18,37.78],[-110.22,37.74],[-110.25,37.7],[-110.28,37.66],[-110.3,37.62],[-110.33,37.58],[-110.36,37.54],[-110.38,37.5],[-110.4,37.46],[-110.42,37.42],[-110.44,37.38],[-110.46,37.34],[-110.48,37.3],[-110.5,37.26],[-110.53,37.22],[-110.56,37.18],[-110.6,37.14],[-110.65,37.1],[-110.72,37.08],[-110.8,37.06],[-110.88,37.05],[-110.95,37.04]]},{name:`Green River`,width:1,valleyDepth:.85,valleyWidth:1.8,navigable:!0,points:[[-109.55,41],[-109.52,40.96],[-109.5,40.92],[-109.48,40.88],[-109.46,40.84],[-109.44,40.8],[-109.42,40.76],[-109.4,40.72],[-109.38,40.68],[-109.4,40.64],[-109.44,40.6],[-109.48,40.56],[-109.52,40.52],[-109.56,40.48],[-109.58,40.44],[-109.6,40.4],[-109.62,40.36],[-109.64,40.32],[-109.66,40.28],[-109.68,40.24],[-109.7,40.2],[-109.72,40.16],[-109.76,40.12],[-109.8,40.08],[-109.84,40.04],[-109.88,40],[-109.92,39.96],[-109.96,39.92],[-110,39.86],[-110.03,39.8],[-110.06,39.74],[-110.08,39.68],[-110.1,39.62],[-110.11,39.56],[-110.12,39.5],[-110.13,39.44],[-110.14,39.38],[-110.15,39.32],[-110.15,39.26],[-110.15,39.2],[-110.16,39.14],[-110.16,39.08],[-110.16,39.02],[-110.16,38.96],[-110.15,38.9],[-110.14,38.84],[-110.12,38.78],[-110.1,38.72],[-110.08,38.66],[-110.06,38.6],[-110.04,38.54],[-110.02,38.48],[-110,38.42],[-109.98,38.36],[-109.96,38.3],[-109.95,38.24],[-109.94,38.18],[-109.93,38.12],[-109.93,38.06]]},{name:`San Juan River`,width:.8,valleyDepth:.7,valleyWidth:1.5,points:[[-109.05,37.28],[-109.12,37.28],[-109.2,37.28],[-109.28,37.27],[-109.35,37.26],[-109.42,37.25],[-109.48,37.24],[-109.55,37.24],[-109.62,37.22],[-109.68,37.2],[-109.74,37.18],[-109.78,37.17],[-109.82,37.16],[-109.88,37.17],[-109.92,37.16],[-109.96,37.15],[-110,37.14],[-110.05,37.16],[-110.1,37.15],[-110.16,37.14],[-110.22,37.13],[-110.28,37.12],[-110.34,37.1],[-110.38,37.09],[-110.42,37.08],[-110.46,37.06],[-110.5,37.05],[-110.55,37.04],[-110.6,37.03]]},{name:`Virgin River`,width:.6,valleyDepth:.95,valleyWidth:2.5,points:[[-112.68,37.62],[-112.72,37.58],[-112.76,37.54],[-112.82,37.5],[-112.88,37.46],[-112.92,37.42],[-112.95,37.38],[-112.97,37.34],[-112.97,37.3],[-112.96,37.26],[-112.95,37.23],[-112.94,37.2],[-112.96,37.18],[-113,37.17],[-113.06,37.17],[-113.12,37.18],[-113.18,37.19],[-113.24,37.18],[-113.28,37.17],[-113.34,37.15],[-113.4,37.13],[-113.46,37.11],[-113.52,37.1],[-113.58,37.09],[-113.64,37.08],[-113.7,37.07]]},{name:`Bear River`,width:.7,valleyDepth:.3,valleyWidth:1.2,points:[[-110.88,40.72],[-110.82,40.8],[-110.78,40.86],[-110.76,40.92],[-110.8,40.98],[-110.86,41.04],[-110.9,41.1],[-110.94,41.16],[-110.96,41.22],[-110.95,41.3],[-110.96,41.38],[-110.98,41.44],[-111,41.5],[-111.04,41.56],[-111.1,41.62],[-111.18,41.68],[-111.26,41.74],[-111.34,41.78],[-111.42,41.82],[-111.5,41.86],[-111.58,41.9],[-111.66,41.92],[-111.72,41.88],[-111.78,41.84],[-111.82,41.78],[-111.84,41.72],[-111.88,41.66],[-111.92,41.6],[-111.98,41.56],[-112.04,41.52],[-112.1,41.5],[-112.16,41.48],[-112.22,41.46],[-112.28,41.44],[-112.34,41.42],[-112.4,41.4]]},{name:`Sevier River`,width:.6,valleyDepth:.3,valleyWidth:1,points:[[-112.4,37.82],[-112.38,37.88],[-112.36,37.94],[-112.32,38],[-112.28,38.06],[-112.24,38.12],[-112.2,38.18],[-112.16,38.24],[-112.14,38.3],[-112.12,38.36],[-112.1,38.42],[-112.08,38.48],[-112.08,38.54],[-112.08,38.6],[-112.08,38.66],[-112.08,38.72],[-112.08,38.78],[-112.1,38.84],[-112.12,38.9],[-112.14,38.96],[-112.18,39.02],[-112.24,39.06],[-112.3,39.1],[-112.38,39.12],[-112.46,39.12],[-112.54,39.1],[-112.62,39.06],[-112.7,39.02],[-112.78,38.98],[-112.86,38.94],[-112.92,38.9],[-112.96,38.88]]},{name:`Weber River`,width:.5,valleyDepth:.4,valleyWidth:1,points:[[-110.88,40.76],[-110.96,40.74],[-111.04,40.72],[-111.12,40.7],[-111.2,40.68],[-111.26,40.66],[-111.3,40.68],[-111.34,40.72],[-111.36,40.76],[-111.4,40.8],[-111.44,40.84],[-111.48,40.88],[-111.52,40.92],[-111.58,40.96],[-111.66,41],[-111.74,41.04],[-111.82,41.08],[-111.88,41.12],[-111.92,41.16],[-111.96,41.2],[-111.98,41.24],[-112.02,41.26]]},{name:`Provo River`,width:.5,valleyDepth:.5,valleyWidth:1,points:[[-110.92,40.62],[-111,40.6],[-111.1,40.6],[-111.2,40.6],[-111.3,40.6],[-111.36,40.6],[-111.4,40.58],[-111.44,40.55],[-111.48,40.52],[-111.5,40.48],[-111.52,40.44],[-111.54,40.4],[-111.58,40.36],[-111.62,40.32],[-111.66,40.28],[-111.72,40.24]]},{name:`Jordan River`,width:.4,valleyDepth:.15,valleyWidth:.6,points:[[-111.88,40.36],[-111.89,40.4],[-111.9,40.44],[-111.9,40.5],[-111.9,40.56],[-111.9,40.62],[-111.9,40.68],[-111.91,40.72],[-111.92,40.76],[-111.93,40.8],[-111.95,40.84],[-112,40.88],[-112.06,40.92]]},{name:`Escalante River`,width:.4,valleyDepth:.9,valleyWidth:1.8,points:[[-111.6,37.77],[-111.56,37.74],[-111.52,37.72],[-111.48,37.7],[-111.44,37.68],[-111.4,37.65],[-111.36,37.62],[-111.32,37.58],[-111.28,37.54],[-111.24,37.5],[-111.2,37.46],[-111.16,37.42],[-111.14,37.38],[-111.12,37.34],[-111.1,37.3],[-111.08,37.26],[-111.06,37.22],[-111.04,37.2],[-111.02,37.18],[-111,37.16]]},{name:`Fremont/Dirty Devil River`,width:.5,valleyDepth:.6,valleyWidth:1.2,points:[[-111.72,38.56],[-111.66,38.52],[-111.6,38.48],[-111.54,38.44],[-111.48,38.4],[-111.42,38.36],[-111.36,38.32],[-111.28,38.3],[-111.2,38.28],[-111.14,38.26],[-111.08,38.24],[-111.02,38.22],[-110.96,38.18],[-110.92,38.14],[-110.88,38.1],[-110.84,38.04],[-110.8,37.98],[-110.78,37.92],[-110.76,37.86],[-110.74,37.8],[-110.72,37.74],[-110.7,37.68],[-110.68,37.62],[-110.66,37.56],[-110.64,37.5],[-110.62,37.44]]},{name:`Dolores River`,width:.3,valleyDepth:.5,valleyWidth:.8,points:[[-109.05,38.8],[-109.1,38.78],[-109.16,38.76],[-109.22,38.74],[-109.28,38.72],[-109.34,38.73],[-109.4,38.75],[-109.44,38.76]]},{name:`Price River`,width:.4,valleyDepth:.4,valleyWidth:.8,points:[[-111.2,39.72],[-111.12,39.68],[-111.04,39.64],[-110.96,39.62],[-110.88,39.6],[-110.82,39.58],[-110.8,39.6],[-110.72,39.54],[-110.62,39.46],[-110.5,39.38],[-110.38,39.28],[-110.26,39.18],[-110.18,39.08]]},{name:`San Rafael River`,width:.3,valleyDepth:.5,valleyWidth:.8,points:[[-111.2,39.1],[-111.12,39.06],[-111.04,39],[-110.96,38.96],[-110.88,38.92],[-110.78,38.9],[-110.68,38.88],[-110.58,38.86],[-110.48,38.84],[-110.4,38.82],[-110.32,38.8],[-110.24,38.82],[-110.18,38.86],[-110.14,38.9],[-110.12,38.94]]},{name:`Duchesne River`,width:.4,valleyDepth:.3,valleyWidth:.8,points:[[-110.7,40.6],[-110.62,40.52],[-110.54,40.46],[-110.46,40.4],[-110.38,40.34],[-110.3,40.3],[-110.22,40.26],[-110.14,40.22],[-110.06,40.18],[-109.96,40.14],[-109.88,40.1],[-109.8,40.08]]}],Li=[{name:`Interstate 15`,type:`interstate`,width:1,points:[[-113.58,37.08],[-113.52,37.1],[-113.44,37.12],[-113.38,37.15],[-113.3,37.22],[-113.22,37.3],[-113.15,37.42],[-113.08,37.54],[-113.06,37.68],[-112.92,37.82],[-112.78,37.96],[-112.64,38.1],[-112.56,38.2],[-112.44,38.36],[-112.32,38.52],[-112.2,38.66],[-112.12,38.78],[-112.06,38.92],[-112,39.08],[-111.96,39.22],[-111.92,39.38],[-111.88,39.52],[-111.84,39.72],[-111.82,39.9],[-111.78,40.06],[-111.74,40.18],[-111.78,40.34],[-111.82,40.46],[-111.86,40.58],[-111.88,40.66],[-111.9,40.76],[-111.92,40.88],[-111.96,41.06],[-111.98,41.22],[-112,41.38],[-112.02,41.52],[-112.04,41.66],[-112.02,41.82],[-112,42]]},{name:`Interstate 80`,type:`interstate`,width:1,points:[[-114.05,40.74],[-113.7,40.74],[-113.4,40.74],[-113.1,40.73],[-112.8,40.72],[-112.5,40.71],[-112.2,40.7],[-112,40.69],[-111.9,40.68],[-111.82,40.68],[-111.74,40.68],[-111.66,40.7],[-111.56,40.72],[-111.48,40.74],[-111.4,40.76],[-111.3,40.78],[-111.18,40.8],[-111.06,40.82],[-110.9,40.84],[-110.7,40.86],[-110.5,40.88],[-110.3,40.9],[-110.1,40.92],[-109.8,40.94],[-109.5,40.96],[-109.2,40.98],[-109.05,41]]},{name:`Interstate 70`,type:`interstate`,width:1,points:[[-112.2,38.6],[-112.08,38.62],[-111.96,38.64],[-111.84,38.66],[-111.72,38.68],[-111.6,38.7],[-111.48,38.7],[-111.36,38.68],[-111.24,38.66],[-111.12,38.66],[-111,38.68],[-110.88,38.72],[-110.76,38.76],[-110.64,38.8],[-110.5,38.84],[-110.36,38.88],[-110.22,38.92],[-110.16,38.96],[-110.04,38.98],[-109.8,38.98],[-109.6,38.98],[-109.4,38.98],[-109.2,38.98],[-109.05,38.98]]},{name:`Interstate 84`,type:`interstate`,width:1,points:[[-111.98,41.22],[-112.08,41.26],[-112.18,41.3],[-112.28,41.36],[-112.38,41.44],[-112.48,41.52],[-112.58,41.6],[-112.68,41.68],[-112.78,41.78],[-112.88,41.88],[-112.98,41.96],[-113.06,42]]},{name:`US-89`,type:`highway`,width:.6,points:[[-112.53,37.05],[-112.5,37.14],[-112.48,37.22],[-112.42,37.32],[-112.38,37.42],[-112.32,37.54],[-112.28,37.66],[-112.24,37.78],[-112.2,37.9],[-112.16,38.04],[-112.12,38.2],[-112.1,38.4],[-112.08,38.6],[-112.08,38.78],[-112.04,38.96],[-111.96,39.14],[-111.88,39.36],[-111.84,39.56],[-111.8,39.72],[-111.76,39.9],[-111.7,40.1],[-111.66,40.24],[-111.72,40.5],[-111.82,41.04],[-111.84,41.36],[-111.84,41.54],[-111.82,41.74],[-111.6,41.84],[-111.4,41.9],[-111.3,41.94]]},{name:`US-191`,type:`highway`,width:.6,points:[[-109.52,40.46],[-109.5,40.32],[-109.48,40.18],[-109.5,40.06],[-109.56,39.88],[-109.58,39.7],[-109.56,39.52],[-109.54,39.32],[-109.52,39.14],[-109.52,38.98],[-109.54,38.82],[-109.56,38.66],[-109.55,38.57],[-109.52,38.44],[-109.48,38.28],[-109.44,38.12],[-109.4,37.96],[-109.36,37.86],[-109.32,37.72],[-109.48,37.62]]},{name:`US-6`,type:`highway`,width:.6,points:[[-111.66,40.1],[-111.56,40.06],[-111.46,40],[-111.36,39.94],[-111.26,39.88],[-111.16,39.82],[-111.06,39.76],[-110.96,39.7],[-110.86,39.64],[-110.82,39.6],[-110.72,39.5],[-110.58,39.36],[-110.44,39.22],[-110.3,39.1],[-110.16,39]]},{name:`US-40`,type:`highway`,width:.6,points:[[-111.42,40.5],[-111.32,40.46],[-111.22,40.4],[-111.12,40.34],[-111.02,40.28],[-110.88,40.24],[-110.72,40.22],[-110.56,40.22],[-110.4,40.22],[-110.24,40.26],[-110.08,40.3],[-109.88,40.36],[-109.7,40.42],[-109.52,40.46]]},{name:`Scenic Byway 12`,type:`road`,width:.4,points:[[-111.42,38.3],[-111.46,38.24],[-111.48,38.18],[-111.5,38.12],[-111.52,38.06],[-111.52,38],[-111.52,37.94],[-111.5,37.88],[-111.46,37.84],[-111.5,37.8],[-111.55,37.78],[-111.6,37.77],[-111.66,37.74],[-111.72,37.7],[-111.8,37.66],[-111.88,37.62],[-111.96,37.58],[-112.06,37.56],[-112.12,37.56],[-112.18,37.58],[-112.2,37.62]]},{name:`US-163`,type:`highway`,width:.6,points:[[-109.87,37.15],[-109.88,37.1],[-109.9,37.06],[-109.95,37.02],[-110,37],[-110.05,37],[-110.1,37],[-110.18,37]]},{name:`SR-128`,type:`road`,width:.4,points:[[-109.3,38.98],[-109.34,38.94],[-109.38,38.9],[-109.4,38.86],[-109.42,38.82],[-109.44,38.78],[-109.46,38.74],[-109.48,38.7],[-109.52,38.66],[-109.55,38.62],[-109.58,38.58]]},{name:`SR-24`,type:`road`,width:.4,points:[[-110.72,38.37],[-110.8,38.34],[-110.9,38.32],[-111,38.3],[-111.1,38.28],[-111.18,38.28],[-111.26,38.29],[-111.34,38.3],[-111.42,38.3]]},{name:`SR-9`,type:`road`,width:.4,points:[[-113.28,37.17],[-113.2,37.18],[-113.14,37.19],[-113.06,37.17],[-112.99,37.19],[-112.95,37.2],[-112.94,37.24],[-112.9,37.28],[-112.84,37.28],[-112.72,37.24],[-112.6,37.22],[-112.48,37.22]]},{name:`SR-12 (Grand Staircase)`,type:`road`,width:.4,points:[[-112.2,37.62],[-112.14,37.62],[-112.08,37.6],[-112.04,37.58],[-112,37.56],[-111.96,37.58],[-111.9,37.6],[-111.84,37.62],[-111.78,37.66],[-111.72,37.7],[-111.66,37.74],[-111.6,37.77]]}],Ri=class{renderer;scene;threeCamera;terrainGroup;terrainBuilder=new hn;terrainMaterial;terrainUniforms;waterPlane=new Sn;riverMap=new En;roadMap=new Pn;featureMap=new tr;shadowBaker=new Xn;heightMapBaker=new er;atmosphere;canvas;cityMarkers;vegetationScatter;regionLabels;gridOverlay;settings;scheduler;weatherParticles=null;lastFrameTime=0;constructor(){this.settings=new Mi,this.scheduler=new Fi}init(e){this.canvas=e;let t=this.settings.get(),n=Math.min(window.devicePixelRatio||1,t.pixelRatio,Ae);this.renderer=new se({canvas:e,antialias:n<=1,powerPreference:`default`,alpha:!1,stencil:!1,depth:!0}),this.renderer.setPixelRatio(n),this.renderer.toneMapping=4,this.renderer.toneMappingExposure=1.6;let r=Math.min(t.renderScale,ke);this.renderer.setSize(e.clientWidth,e.clientHeight,!1),this.renderer.setPixelRatio(n*r),this.scene=new s,ae.fog_fragment=`
      #ifdef USE_FOG
        #ifdef FOG_EXP2
          float fogDepthShifted = max( 0.0, vFogDepth - 250.0 );
          float fogFactor = ( 1.0 - exp( - fogDensity * fogDensity * fogDepthShifted * fogDepthShifted ) ) * 0.75;
        #else
          float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
        #endif
        gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
      #endif
    `,this.scene.fog=new A(13157560,.001),this.terrainGroup=new w,this.terrainGroup.name=`terrain`,this.scene.add(this.terrainGroup),this.threeCamera=new Ke(e),Je.setup(this.scene),this.atmosphere=new Xe(this.scene,this.threeCamera.camera);let{material:i,uniforms:a}=rt();this.terrainMaterial=i,this.terrainUniforms=a,this.threeCamera.controls.addEventListener(`change`,()=>{this.scheduler.setDirty(`camera`)}),this.threeCamera.onControlsChange=()=>this.scheduler.setDirty(`camera`),window.addEventListener(`keydown`,e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;let t=e.target;if(t&&(t.tagName===`INPUT`||t.tagName===`TEXTAREA`))return;let n=null;e.code===`Digit1`?n=`low`:e.code===`Digit2`?n=`medium`:e.code===`Digit3`?n=`high`:e.code===`Digit4`&&(n=`ultra`),n&&(this.settings.setPreset(n),this.applySettings())}),this.settings.onChange(()=>this.applySettings())}applySettings(){let e=this.settings.get(),t=Math.min(window.devicePixelRatio||1,e.pixelRatio,Ae),n=Math.min(e.renderScale,ke);this.renderer.setSize(this.canvas.clientWidth,this.canvas.clientHeight,!1),this.renderer.setPixelRatio(t*n),this.vegetationScatter&&this.vegetationScatter.setQuality(e.vegetationDensity),this.terrainUniforms?.uShadowEnabled&&(this.terrainUniforms.uShadowEnabled.value=e.shadowQuality?1:0),this.weatherParticles&&this.weatherParticles.setEnabled(e.weatherEffects);let r=this.scene.getObjectByName(`region_labels`);r&&(r.visible=e.regionLabels),this.scheduler.setDirty(`settings`)}getSettings(){return this.settings.get()}getTerrainY(e,t){return this.terrainBuilder.sampleHeight(e,t)??0}async buildTerrain(e){let t=()=>new Promise(e=>setTimeout(e,0));this.riverMap.build(Ii,e);try{let e=this.riverMap.getRawData(),t=this.riverMap.getBounds();this.terrainBuilder.setRiverData(e,2048,{x:t.x,y:t.y,z:t.z,w:t.w})}catch{}let n=await this.terrainBuilder.build(e,t);for(let e of n){let t=new r(e,this.terrainMaterial);t.frustumCulled=!1,this.terrainGroup.add(t)}this.threeCamera.getTerrainHeight=(e,t)=>this.getTerrainY(e,t);let i=Je.getSunDirection(),a=(e,t)=>this.terrainBuilder.sampleHeight(e,t);this.shadowBaker.build(e,i,a),this.terrainUniforms.uShadowMap.value=this.shadowBaker.getTexture(),this.terrainUniforms.uShadowBounds.value.copy(this.shadowBaker.getBounds()),this.terrainUniforms.uShadowEnabled.value=1,await t(),this.heightMapBaker.build(e,a),this.terrainUniforms.uHeightMap.value=this.heightMapBaker.getTexture(),this.terrainUniforms.uHeightMapBounds.value.copy(this.heightMapBaker.getBounds()),this.terrainUniforms.uHeightMapRange.value.copy(this.heightMapBaker.getRange()),this.terrainUniforms.uHeightMapEnabled.value=1,await t(),this.waterPlane.build(this.scene),this.roadMap.build(Li,e),this.featureMap.build(e);let o=this.terrainMaterial;if(!o.__overlayUniformsInjected){let e=o.onBeforeCompile,t=this.riverMap.getTexture(),n=this.riverMap.getBounds(),r=this.roadMap.getTexture(),i=this.roadMap.getBounds(),a=this.featureMap.getTexture(),s=this.featureMap.getSize();o.onBeforeCompile=c=>{e&&e.call(o,c),c.uniforms.uRiverMap={value:t},c.uniforms.uRiverBounds={value:n},c.uniforms.uRoadSDF={value:r},c.uniforms.uRoadBounds={value:i},c.uniforms.uRegionMap={value:a},c.uniforms.uRegionSize={value:s}},o.__overlayUniformsInjected=!0,o.needsUpdate=!0}this.vegetationScatter=new ii(this.scene),this.vegetationScatter.build(e,this.scene,a),this.cityMarkers=new dr(this.scene),this.cityMarkers.build(e),this.regionLabels=new fi(this.scene),this.regionLabels.build(e,this.scene),this.gridOverlay=new pi(this.scene),this.gridOverlay.build(e,this.scene,a),window.addEventListener(`keydown`,e=>{e.code===`KeyG`&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&this.gridOverlay.setVisible(!this.gridOverlay.group.visible)}),this.weatherParticles=new Ai(this.scene),this.applySettings(),this.scheduler.setDirty(`startup`)}updateLOD(){let e=this.threeCamera.camera;if(this.vegetationScatter&&this.vegetationScatter.updateLOD(e.position.x,e.position.z),this.cityMarkers&&this.cityMarkers.updateLOD(e.position.x,e.position.y,e.position.z),this.regionLabels){let t=this.threeCamera.controls.target,n=e.position.x-t.x,r=e.position.y-t.y,i=e.position.z-t.z,a=Math.sqrt(n*n+r*r+i*i);this.regionLabels.updateLOD(a)}}render(){let e=performance.now();this.atmosphere.update(),this.waterPlane.update(e),this.updateLOD(),this.terrainUniforms?.uTime&&(this.terrainUniforms.uTime.value=e*.001),this.renderer.render(this.scene,this.threeCamera.camera),this.scheduler.markRendered()}renderIfDirty(e){return this.scheduler.shouldRender(e)?(this.waterPlane.update(e),this.atmosphere.update(),this.updateLOD(),this.terrainUniforms?.uTime&&(this.terrainUniforms.uTime.value=e*.001),this.renderer.render(this.scene,this.threeCamera.camera),this.scheduler.markRendered(),!0):!1}updateWeather(e){if(!this.weatherParticles)return;let t=this.lastFrameTime===0?.016:(e-this.lastFrameTime)/1e3;this.lastFrameTime=e;let n=this.threeCamera.camera;this.weatherParticles.update(n.position.x,n.position.y,n.position.z,t),this.settings.get().weatherEffects&&this.scheduler.setDirty(`animation`)}resize(){let e=this.settings.get(),t=Math.min(window.devicePixelRatio||1,e.pixelRatio,Ae),n=Math.min(e.renderScale,ke);this.renderer.setSize(this.canvas.clientWidth,this.canvas.clientHeight,!1),this.renderer.setPixelRatio(t*n),this.threeCamera.resize(this.canvas.clientWidth,this.canvas.clientHeight),this.scheduler.setDirty(`resize`)}getTerrainMeshes(){let e=[];return this.terrainGroup.traverse(t=>{t.isMesh&&e.push(t)}),e}dispose(){this.terrainBuilder.dispose(),this.terrainGroup.traverse(e=>{e instanceof r&&e.geometry.dispose()}),this.terrainMaterial?.dispose(),this.waterPlane.dispose(),this.riverMap.dispose(),this.roadMap.dispose(),this.featureMap.dispose(),this.shadowBaker.dispose(),this.heightMapBaker.dispose(),this.terrainUniforms.uShadowMap.value&&this.terrainUniforms.uShadowMap.value.dispose(),this.terrainUniforms.uHeightMap.value&&this.terrainUniforms.uHeightMap.value.dispose(),this.vegetationScatter&&this.vegetationScatter.dispose(),this.cityMarkers&&this.cityMarkers.dispose(),this.regionLabels&&this.regionLabels.dispose(),this.gridOverlay&&this.gridOverlay.dispose(),this.weatherParticles&&this.weatherParticles.dispose(),this.atmosphere.dispose(),this.threeCamera.dispose(),this.renderer.dispose()}},zi=class{raycaster=new t;ndc=new l;groundPlane=new h(new C(0,1,0),0);hitPoint=new C;constructor(e,t,n){this.camera=e,this.terrainMeshes=t,this.gameMap=n}pickTile(e,t){let n=this.pickWorldPoint(e,t);if(!n)return null;let r=He(n.x,-n.z,20);return this.gameMap.getTile(r.q,r.r)??null}pickWorldPoint(e,t){if(this.ndc.set(e,t),this.raycaster.setFromCamera(this.ndc,this.camera),this.terrainMeshes.length>0){let e=this.raycaster.intersectObjects(this.terrainMeshes,!1);if(e.length>0)return e[0].point.clone()}let n=this.raycaster.ray.intersectPlane(this.groundPlane,this.hitPoint);return n?n.clone():null}},Bi=.012,Vi=1.02,Hi=class{threeCamera;keys=new Set;_onKeyDown;_onKeyUp;_onBlur;onKeyMove=null;constructor(e){this.threeCamera=e,this._onKeyDown=e=>{let t=e.target;t&&(t.tagName===`INPUT`||t.tagName===`TEXTAREA`)||this.keys.add(e.code)},this._onKeyUp=e=>{this.keys.delete(e.code)},this._onBlur=()=>{this.keys.clear()},window.addEventListener(`keydown`,this._onKeyDown),window.addEventListener(`keyup`,this._onKeyUp),window.addEventListener(`blur`,this._onBlur)}update(e){if(this.keys.size===0)return;let t=e*120,n=Math.max(10,this.threeCamera.camera.position.y),r=Ce*t*(n/80),i=Bi*t,a=!1,o=0,s=0;if((this.keys.has(`KeyW`)||this.keys.has(`ArrowUp`))&&(o+=r),(this.keys.has(`KeyS`)||this.keys.has(`ArrowDown`))&&(o-=r),(this.keys.has(`KeyD`)||this.keys.has(`ArrowRight`))&&(s+=r),(this.keys.has(`KeyA`)||this.keys.has(`ArrowLeft`))&&(s-=r),(o!==0||s!==0)&&(this.threeCamera.panViewRelative(o,s),a=!0),this.keys.has(`KeyQ`)&&(this.threeCamera.rotateAzimuth(i),a=!0),this.keys.has(`KeyE`)&&(this.threeCamera.rotateAzimuth(-i),a=!0),this.keys.has(`KeyF`)&&(this.threeCamera.rotatePolar(i),a=!0),this.keys.has(`KeyC`)&&(this.threeCamera.rotatePolar(-i),a=!0),this.keys.has(`Equal`)||this.keys.has(`NumpadAdd`)){let e=Vi**+t;this.zoomBy(1/e),a=!0}if(this.keys.has(`Minus`)||this.keys.has(`NumpadSubtract`)){let e=Vi**+t;this.zoomBy(e),a=!0}a&&this.onKeyMove&&this.onKeyMove()}zoomBy(e){let t=this.threeCamera.controls,n=this.threeCamera.camera.position.clone().sub(t.target),r=n.length()*e,i=Math.max(t.minDistance,Math.min(t.maxDistance,r));n.normalize().multiplyScalar(i),this.threeCamera.camera.position.copy(t.target).add(n)}dispose(){window.removeEventListener(`keydown`,this._onKeyDown),window.removeEventListener(`keyup`,this._onKeyUp),window.removeEventListener(`blur`,this._onBlur),this.keys.clear()}};function Ui(e){return e.split(`_`).map(e=>e.length>0?e[0].toUpperCase()+e.slice(1):``).join(` `)}function Wi(e){return e<=3?`low`:e<=7?`mid`:e<=11?`high`:`peak`}function Gi(e){return Ui(e)}var Ki=class{el;constructor(){this.el=document.createElement(`div`),this.el.id=`tile-tooltip`,Object.assign(this.el.style,{position:`fixed`,background:`rgba(26, 26, 26, 0.92)`,color:`#fff`,font:`12px "SF Mono", "Fira Code", Consolas, monospace`,padding:`8px`,borderRadius:`3px`,border:`1px solid #555`,pointerEvents:`none`,zIndex:`50`,display:`none`,whiteSpace:`nowrap`,lineHeight:`1.5`});let e=document.getElementById(`ui-overlay`);e?e.appendChild(this.el):document.body.appendChild(this.el)}show(e,t,n){let r=[];if(r.push(`<div style="font-size:13px;font-weight:700;margin-bottom:2px;">${qi(e.region)}</div>`),r.push(`<div>Elevation ${e.elevation} (${Wi(e.elevation)})</div>`),r.push(`<div>${qi(Ui(e.terrain))}</div>`),e.feature&&r.push(`<div>${qi(Ui(e.feature))}</div>`),e.park){let t=e.parkType?` (${Gi(e.parkType)})`:``;r.push(`<div>${qi(e.park)}${qi(t)}</div>`)}e.city&&r.push(`<div>&bull; City: ${qi(e.city)}</div>`),e.waterway&&r.push(`<div>&bull; River: ${qi(e.waterway)}</div>`),e.road&&r.push(`<div>&bull; Road: ${qi(e.road)}</div>`),this.el.innerHTML=r.join(``),this.el.style.display=`block`,this.el.style.left=`${t+12}px`,this.el.style.top=`${n+12}px`}hide(){this.el.style.display=`none`}dispose(){this.el.remove()}};function qi(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}var Ji={1:`Navajo Sandstone`,2:`Entrada Sandstone`,3:`Wingate Sandstone`,4:`Claron Formation`,5:`Mancos Shale`,6:`Cedar Mesa Sandstone`,7:`Moenkopi Formation`,8:`Chinle Formation`,9:`Kayenta Formation`,10:`De Chelly Sandstone`,11:`Kaibab Limestone`,12:`Morrison Formation`,13:`Uinta Group Quartzite`,14:`Wasatch Limestone`};function Yi(e){return e.split(`_`).map(e=>e.length>0?e[0].toUpperCase()+e.slice(1):``).join(` `)}function Xi(e){return e<=3?`low`:e<=7?`mid`:e<=11?`high`:`peak`}function X(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}var Zi=class{el;bodyEl;titleEl;escHandler;constructor(){this.el=document.createElement(`div`),this.el.id=`tile-info-panel`,Object.assign(this.el.style,{position:`fixed`,top:`16px`,right:`16px`,width:`320px`,background:`rgba(20, 20, 20, 0.94)`,color:`#e0e0e0`,border:`1px solid #444`,borderRadius:`4px`,fontFamily:`system-ui, -apple-system, "Segoe UI", sans-serif`,fontSize:`13px`,lineHeight:`1.5`,boxShadow:`0 4px 20px rgba(0,0,0,0.5)`,transform:`translateX(340px)`,transition:`transform 0.25s ease-out`,zIndex:`60`,pointerEvents:`auto`});let e=document.createElement(`div`);Object.assign(e.style,{display:`flex`,justifyContent:`space-between`,alignItems:`center`,padding:`12px 14px`,borderBottom:`1px solid #333`,background:`rgba(0,0,0,0.3)`}),this.titleEl=document.createElement(`div`),Object.assign(this.titleEl.style,{fontWeight:`700`,fontSize:`14px`,color:`#fff`});let t=document.createElement(`button`);t.textContent=`×`,Object.assign(t.style,{background:`transparent`,border:`none`,color:`#aaa`,fontSize:`20px`,lineHeight:`1`,cursor:`pointer`,padding:`0 4px`,marginLeft:`8px`}),t.addEventListener(`mouseenter`,()=>t.style.color=`#fff`),t.addEventListener(`mouseleave`,()=>t.style.color=`#aaa`),t.addEventListener(`click`,()=>this.hide()),e.appendChild(this.titleEl),e.appendChild(t),this.bodyEl=document.createElement(`div`),Object.assign(this.bodyEl.style,{padding:`12px 14px`}),this.el.appendChild(e),this.el.appendChild(this.bodyEl);let n=document.getElementById(`ui-overlay`);n?n.appendChild(this.el):document.body.appendChild(this.el),this.escHandler=e=>{e.key===`Escape`&&this.hide()},window.addEventListener(`keydown`,this.escHandler)}show(e){this.titleEl.textContent=e.region;let t=[],n=(e,n)=>{t.push(`<div style="display:flex;justify-content:space-between;gap:12px;padding:3px 0;border-bottom:1px dotted #2a2a2a;">
          <span style="color:#888;font-family:'SF Mono','Fira Code',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">${X(e)}</span>
          <span style="color:#e8e8e8;text-align:right;">${n}</span>
        </div>`)};if(n(`Hex`,`(${e.q}, ${e.r})`),n(`Region`,X(e.region)),n(`Terrain`,X(Yi(e.terrain))),n(`Elevation`,`${e.elevation} (${Xi(e.elevation)})`),e.formation!==void 0&&e.formation>0&&n(`Formation`,X(Ji[e.formation]??`Formation ${e.formation}`)),e.feature&&n(`Feature`,X(Yi(e.feature))),e.park){let t=e.parkType?Yi(e.parkType):``;n(`Park`,X(t?`${e.park} (${t})`:e.park))}if(e.city){let t=nr.find(t=>t.name===e.city),r=t?` (pop. ${t.population.toLocaleString()})`:``;n(`City`,X(`${e.city}${r}`))}if(e.waterway&&n(`Waterway`,X(e.waterway)),e.road){let t=e.roadType?` (${Yi(e.roadType)})`:``;n(`Road`,X(`${e.road}${t}`))}this.bodyEl.innerHTML=t.join(``),this.el.style.transform=`translateX(0)`}hide(){this.el.style.transform=`translateX(340px)`}dispose(){window.removeEventListener(`keydown`,this.escHandler),this.el.remove()}},Qi=[{name:`Zion`,type:`national_park`,polygon:[[-113.18,37.45],[-113.02,37.46],[-112.88,37.43],[-112.82,37.35],[-112.83,37.25],[-112.87,37.17],[-112.95,37.13],[-113.08,37.12],[-113.18,37.15],[-113.24,37.22],[-113.25,37.32],[-113.22,37.4]]},{name:`Bryce Canyon`,type:`national_park`,polygon:[[-112.22,37.68],[-112.14,37.68],[-112.1,37.64],[-112.08,37.59],[-112.1,37.54],[-112.13,37.5],[-112.18,37.5],[-112.23,37.53],[-112.25,37.58],[-112.24,37.64]]},{name:`Arches`,type:`national_park`,polygon:[[-109.68,38.82],[-109.55,38.83],[-109.48,38.8],[-109.46,38.73],[-109.48,38.65],[-109.52,38.6],[-109.6,38.58],[-109.68,38.62],[-109.72,38.68],[-109.73,38.75]]},{name:`Canyonlands`,type:`national_park`,polygon:[[-110.22,38.58],[-109.95,38.58],[-109.75,38.5],[-109.68,38.38],[-109.68,38.22],[-109.72,38.08],[-109.8,37.98],[-109.92,37.92],[-110.08,37.9],[-110.22,37.95],[-110.32,38.05],[-110.38,38.18],[-110.38,38.32],[-110.35,38.45]]},{name:`Capitol Reef`,type:`national_park`,polygon:[[-111.3,38.37],[-111.15,38.37],[-111.05,38.3],[-110.98,38.2],[-110.95,38.08],[-110.97,37.95],[-111,37.85],[-111.05,37.78],[-111.12,37.75],[-111.22,37.78],[-111.28,37.85],[-111.32,37.95],[-111.35,38.1],[-111.35,38.25]]},{name:`Grand Staircase-Escalante`,type:`national_monument`,polygon:[[-112.3,37.9],[-111.85,37.9],[-111.45,37.85],[-111.18,37.75],[-111,37.6],[-110.95,37.42],[-111,37.25],[-111.1,37.1],[-111.3,37.02],[-111.55,37],[-111.85,37.05],[-112.1,37.12],[-112.3,37.25],[-112.4,37.42],[-112.42,37.6],[-112.38,37.78]]},{name:`Bears Ears`,type:`national_monument`,polygon:[[-110.2,37.9],[-109.8,37.9],[-109.55,37.82],[-109.4,37.68],[-109.35,37.52],[-109.42,37.38],[-109.55,37.28],[-109.75,37.22],[-109.95,37.22],[-110.12,37.3],[-110.25,37.45],[-110.3,37.62],[-110.28,37.78]]},{name:`Natural Bridges`,type:`national_monument`,polygon:[[-110.05,37.65],[-109.95,37.65],[-109.92,37.6],[-109.93,37.56],[-109.98,37.54],[-110.05,37.55],[-110.08,37.59]]},{name:`Cedar Breaks`,type:`national_monument`,polygon:[[-112.88,37.65],[-112.8,37.65],[-112.78,37.6],[-112.8,37.57],[-112.85,37.56],[-112.9,37.58],[-112.91,37.62]]},{name:`Dinosaur`,type:`national_monument`,polygon:[[-109.5,40.58],[-109.2,40.58],[-109.05,40.52],[-109.05,40.38],[-109.12,40.3],[-109.25,40.28],[-109.4,40.32],[-109.52,40.4],[-109.55,40.5]]},{name:`Rainbow Bridge`,type:`national_monument`,polygon:[[-110.98,37.1],[-110.94,37.1],[-110.93,37.07],[-110.95,37.06],[-110.98,37.07]]},{name:`Glen Canyon`,type:`national_recreation_area`,polygon:[[-111.65,37.55],[-111.3,37.5],[-111,37.4],[-110.72,37.28],[-110.48,37.15],[-110.3,37.05],[-110.28,37],[-110.5,37],[-110.8,37],[-111.1,37],[-111.4,37],[-111.6,37.05],[-111.72,37.15],[-111.78,37.28],[-111.75,37.42]]},{name:`Flaming Gorge`,type:`national_recreation_area`,polygon:[[-109.72,41.15],[-109.52,41.15],[-109.38,41.05],[-109.3,40.92],[-109.3,40.8],[-109.38,40.72],[-109.52,40.68],[-109.68,40.72],[-109.75,40.82],[-109.78,40.95],[-109.78,41.08]]},{name:`Uinta-Wasatch-Cache`,type:`national_forest`,polygon:[[-112,41.95],[-111.6,41.95],[-111.48,41.6],[-111.45,41.2],[-111.5,40.9],[-111.48,40.65],[-111.55,40.3],[-111.65,40.05],[-111.75,39.8],[-111.9,39.8],[-111.95,40.05],[-111.88,40.3],[-111.8,40.55],[-111.4,40.58],[-111.1,40.62],[-110.6,40.6],[-110.15,40.58],[-109.65,40.55],[-109.55,40.65],[-109.55,40.82],[-109.65,40.92],[-110.15,40.92],[-110.6,40.9],[-111.1,40.88],[-111.4,40.85],[-111.7,40.78],[-111.85,40.7],[-112,40.68],[-112.05,40.85],[-112.05,41.2],[-112.05,41.6]]},{name:`Manti-La Sal`,type:`national_forest`,polygon:[[-111.7,39.8],[-111.35,39.8],[-111.2,39.55],[-111.15,39.25],[-111.2,39],[-111.35,38.8],[-111.55,38.7],[-111.7,38.8],[-111.8,39],[-111.82,39.25],[-111.8,39.55]]},{name:`Manti-La Sal (La Sal Division)`,type:`national_forest`,polygon:[[-109.48,38.6],[-109.2,38.6],[-109.08,38.45],[-109.05,38.3],[-109.12,38.18],[-109.28,38.12],[-109.45,38.18],[-109.52,38.32],[-109.52,38.48]]},{name:`Fishlake`,type:`national_forest`,polygon:[[-112.55,38.65],[-112.1,38.65],[-111.82,38.55],[-111.6,38.38],[-111.55,38.15],[-111.6,37.95],[-111.75,37.82],[-111.95,37.75],[-112.2,37.78],[-112.42,37.9],[-112.55,38.1],[-112.6,38.3],[-112.6,38.5]]},{name:`Dixie`,type:`national_forest`,polygon:[[-113,37.9],[-112.55,37.9],[-112.15,37.8],[-111.8,37.68],[-111.55,37.55],[-111.45,37.38],[-111.5,37.22],[-111.65,37.12],[-111.85,37.05],[-112.1,37.05],[-112.4,37.12],[-112.65,37.25],[-112.85,37.4],[-112.98,37.55],[-113.05,37.72]]},{name:`Dead Horse Point`,type:`state_park`,polygon:[[-109.78,38.5],[-109.72,38.5],[-109.7,38.47],[-109.71,38.44],[-109.75,38.43],[-109.79,38.45],[-109.8,38.48]]},{name:`Goblin Valley`,type:`state_park`,polygon:[[-110.72,38.59],[-110.66,38.59],[-110.63,38.56],[-110.63,38.52],[-110.66,38.5],[-110.72,38.5],[-110.74,38.53],[-110.74,38.57]]},{name:`Snow Canyon`,type:`state_park`,polygon:[[-113.68,37.22],[-113.62,37.22],[-113.6,37.18],[-113.6,37.14],[-113.63,37.12],[-113.68,37.13],[-113.7,37.17]]},{name:`Coral Pink Sand Dunes`,type:`state_park`,polygon:[[-112.78,37.08],[-112.72,37.08],[-112.68,37.05],[-112.67,37.01],[-112.7,36.99],[-112.76,36.99],[-112.79,37.02],[-112.8,37.06]]},{name:`Kodachrome Basin`,type:`state_park`,polygon:[[-112,37.52],[-111.95,37.52],[-111.93,37.49],[-111.94,37.47],[-111.98,37.46],[-112.02,37.48],[-112.02,37.51]]},{name:`Antelope Island`,type:`state_park`,polygon:[[-112.28,41.1],[-112.22,41.1],[-112.18,41.06],[-112.17,41],[-112.18,40.95],[-112.2,40.9],[-112.24,40.88],[-112.28,40.9],[-112.3,40.95],[-112.3,41.02],[-112.3,41.07]]},{name:`Bear Lake`,type:`state_park`,polygon:[[-111.4,41.98],[-111.32,41.98],[-111.25,41.94],[-111.22,41.88],[-111.22,41.82],[-111.28,41.8],[-111.35,41.8],[-111.4,41.84],[-111.42,41.9]]},{name:`Goosenecks`,type:`state_park`,polygon:[[-109.95,37.18],[-109.9,37.18],[-109.88,37.16],[-109.89,37.14],[-109.93,37.13],[-109.96,37.15]]}],$i=[{name:`Delicate Arch`,lon:-109.499,lat:38.744,hint:`Arches NP`},{name:`Angels Landing`,lon:-112.948,lat:37.269,hint:`Zion NP`},{name:`Great Salt Lake`,lon:-112.5,lat:41.1,hint:`Saline lake`},{name:`Bonneville Salt Flats`,lon:-113.87,lat:40.76,hint:`Salt flats`},{name:`Monument Valley`,lon:-110.1,lat:37,hint:`Navajo Nation`},{name:`Lake Powell`,lon:-110.73,lat:37.27,hint:`Reservoir`},{name:`Flaming Gorge`,lon:-109.55,lat:40.91,hint:`NE Utah reservoir`},{name:`Bear Lake`,lon:-111.33,lat:41.96,hint:`N Utah lake`},{name:`Kings Peak`,lon:-110.373,lat:40.776,hint:`Highest point, Uintas`},{name:`Mount Timpanogos`,lon:-111.646,lat:40.391,hint:`Wasatch peak`},{name:`Mount Nebo`,lon:-111.76,lat:39.822,hint:`Southern Wasatch peak`},{name:`The Narrows`,lon:-112.947,lat:37.308,hint:`Zion slot canyon`},{name:`Bryce Amphitheater`,lon:-112.166,lat:37.624,hint:`Hoodoo basin`},{name:`Rainbow Bridge`,lon:-110.964,lat:37.077,hint:`Natural bridge`},{name:`Goblin Valley`,lon:-110.7,lat:38.565,hint:`Hoodoo field`},{name:`Antelope Island`,lon:-112.215,lat:40.98,hint:`Great Salt Lake`},{name:`Dead Horse Point`,lon:-109.74,lat:38.475,hint:`Mesa overlook`},{name:`Canyonlands Island`,lon:-109.87,lat:38.39,hint:`Island in the Sky`},{name:`Capitol Reef Waterpocket`,lon:-111.1,lat:38.1,hint:`Waterpocket Fold`},{name:`Cedar Breaks`,lon:-112.845,lat:37.61,hint:`Amphitheater, 10K ft`},{name:`Fish Lake`,lon:-111.72,lat:38.55,hint:`High plateau lake`},{name:`Coral Pink Sand Dunes`,lon:-112.73,lat:37.03,hint:`Aeolian dunes`}];function ea(e,t){let n=R({q:(e-I)/L,r:(42-t)/ye},20);return{x:n.x,z:-n.y}}function ta(e){let t=0,n=0;for(let[r,i]of e)t+=r,n+=i;let r=e.length||1;return{lon:t/r,lat:n/r}}function na(){let e=[];for(let t of nr)e.push({name:t.name,type:`city`,hint:t.population>=1e3?`City · pop ${t.population.toLocaleString()}`:t.population>0?`Town · pop ${t.population}`:`Ghost town`,lon:t.lon,lat:t.lat});for(let t of Qi){let n=ta(t.polygon),r=t.type.replace(/_/g,` `);e.push({name:t.name,type:`park`,parkType:t.type,hint:r.replace(/\b\w/g,e=>e.toUpperCase()),lon:n.lon,lat:n.lat})}for(let t of $i)e.push({name:t.name,type:`landmark`,hint:t.hint,lon:t.lon,lat:t.lat});return e}function ra(e){return e===`city`?`C`:e===`park`?`P`:`L`}var ia=class e{gameMap;onFlyTo;root;input;list;index;results=[];selected=0;isOpen=!1;styleEl;constructor(t,n){this.gameMap=t,this.onFlyTo=n,this.index=na(),this.styleEl=document.createElement(`style`),this.styleEl.textContent=e.CSS,document.head.appendChild(this.styleEl),this.root=document.createElement(`div`),this.root.className=`utah-search-panel`,this.root.style.display=`none`,this.input=document.createElement(`input`),this.input.type=`text`,this.input.className=`utah-search-input`,this.input.placeholder=`Search locations...`,this.input.spellcheck=!1,this.input.autocomplete=`off`,this.list=document.createElement(`div`),this.list.className=`utah-search-results`,this.root.appendChild(this.input),this.root.appendChild(this.list);let r=document.getElementById(`ui-overlay`);r?r.appendChild(this.root):document.body.appendChild(this.root),this.input.addEventListener(`input`,()=>this.onQuery()),this.input.addEventListener(`keydown`,e=>this.onKeyDown(e))}open(){this.isOpen||(this.isOpen=!0,this.root.style.display=`block`,this.input.value=``,this.results=[],this.selected=0,this.renderResults(),requestAnimationFrame(()=>this.input.focus()))}close(){this.isOpen&&(this.isOpen=!1,this.root.style.display=`none`,this.input.blur())}toggle(){this.isOpen?this.close():this.open()}dispose(){this.root.remove(),this.styleEl.remove()}onQuery(){let e=this.input.value.trim().toLowerCase();if(!e)this.results=[];else{let t=[];for(let n of this.index){let r=n.name.toLowerCase(),i=r.indexOf(e);if(i>=0){let e=(i===0?0:100+i)+r.length*.1;t.push({item:n,score:e})}}t.sort((e,t)=>e.score-t.score),this.results=t.slice(0,8).map(e=>e.item)}this.selected=0,this.renderResults()}onKeyDown(e){if(e.key===`Escape`){e.preventDefault(),this.close();return}if(e.key===`ArrowDown`){e.preventDefault(),this.results.length&&(this.selected=(this.selected+1)%this.results.length,this.renderResults());return}if(e.key===`ArrowUp`){e.preventDefault(),this.results.length&&(this.selected=(this.selected-1+this.results.length)%this.results.length,this.renderResults());return}if(e.key===`Enter`){e.preventDefault();let t=this.results[this.selected];t&&this.select(t)}}select(e){let{x:t,z:n}=ea(e.lon,e.lat);this.onFlyTo(t,n),this.close()}renderResults(){if(this.list.innerHTML=``,!this.results.length){this.list.style.display=`none`;return}this.list.style.display=`block`,this.results.forEach((e,t)=>{let n=document.createElement(`div`);n.className=`utah-search-row`+(t===this.selected?` selected`:``);let r=document.createElement(`span`);r.className=`utah-search-icon utah-search-icon-${e.type}`,r.textContent=ra(e.type);let i=document.createElement(`span`);i.className=`utah-search-name`,i.textContent=e.name;let a=document.createElement(`span`);a.className=`utah-search-hint`,a.textContent=e.hint,n.appendChild(r),n.appendChild(i),n.appendChild(a),n.addEventListener(`mouseenter`,()=>{this.selected=t,this.renderResults()}),n.addEventListener(`mousedown`,t=>{t.preventDefault(),this.select(e)}),this.list.appendChild(n)})}static CSS=`
.utah-search-panel {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 480px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  color: #e8e4d8;
  background: rgba(14, 14, 16, 0.92);
  border: 1px solid rgba(196, 91, 40, 0.35);
  border-radius: 6px;
  box-shadow: 0 0 24px rgba(196, 91, 40, 0.18), 0 8px 32px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 50;
}
.utah-search-input {
  width: 100%;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 14px;
  color: #e8e4d8;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(196, 91, 40, 0.25);
  outline: none;
  letter-spacing: 0.5px;
}
.utah-search-input::placeholder {
  color: #6a5a4a;
}
.utah-search-results {
  max-height: 320px;
  overflow-y: auto;
}
.utah-search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  border-left: 2px solid transparent;
}
.utah-search-row.selected {
  background: rgba(196, 91, 40, 0.12);
  border-left-color: #c45b28;
}
.utah-search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 3px;
  flex-shrink: 0;
}
.utah-search-icon-city     { background: #3a5a78; color: #cfe0ef; }
.utah-search-icon-park     { background: #2d5a3d; color: #c0dcc8; }
.utah-search-icon-landmark { background: #c45b28; color: #1a0a04; }
.utah-search-name {
  color: #e8e4d8;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.utah-search-hint {
  color: #7a6a5a;
  font-size: 10px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
`},aa={salt_flat:`Salt Flat`,desert:`Desert`,sagebrush:`Sagebrush`,red_sandstone:`Red Sandstone`,white_sandstone:`White Sandstone`,canyon_floor:`Canyon Floor`,mountain:`Mountain`,conifer_forest:`Conifer Forest`,alpine:`Alpine`,river_valley:`River Valley`,marsh:`Marsh`,urban:`Urban`,badlands:`Badlands`,lava_field:`Lava Field`,water:`Water`},oa=[`salt_flat`,`desert`,`sagebrush`,`red_sandstone`,`white_sandstone`,`canyon_floor`,`badlands`,`lava_field`,`river_valley`,`marsh`,`conifer_forest`,`mountain`,`alpine`,`urban`,`water`];function sa(e){let t=e/15,n=(e,t,n)=>Math.round(e+(t-e)*n),r,i,a;if(t<.5){let e=t/.5;r=n(58,196,e),i=n(74,91,e),a=n(58,40,e)}else{let e=(t-.5)/.5;r=n(196,240,e),i=n(91,237,e),a=n(40,228,e)}let o=e=>e.toString(16).padStart(2,`0`);return`#${o(r)}${o(i)}${o(a)}`}var ca=class e{root;toggleBtn;body;styleEl;expanded=!1;constructor(){this.styleEl=document.createElement(`style`),this.styleEl.textContent=e.CSS,document.head.appendChild(this.styleEl),this.root=document.createElement(`div`),this.root.className=`utah-legend-panel`,this.toggleBtn=document.createElement(`button`),this.toggleBtn.className=`utah-legend-toggle`,this.toggleBtn.type=`button`,this.toggleBtn.textContent=`Legend`,this.toggleBtn.addEventListener(`click`,()=>this.toggle()),this.body=document.createElement(`div`),this.body.className=`utah-legend-body`,this.body.style.display=`none`,this.buildBody(),this.root.appendChild(this.toggleBtn),this.root.appendChild(this.body);let t=document.getElementById(`ui-overlay`);t?t.appendChild(this.root):document.body.appendChild(this.root)}toggle(){this.setVisible(!this.expanded)}setVisible(e){this.expanded=e,this.body.style.display=e?`block`:`none`,this.toggleBtn.classList.toggle(`open`,e)}dispose(){this.root.remove(),this.styleEl.remove()}buildBody(){let e=document.createElement(`div`);e.className=`utah-legend-section`;let t=document.createElement(`div`);t.className=`utah-legend-title`,t.textContent=`Terrain`,e.appendChild(t);for(let t of oa){let n=document.createElement(`div`);n.className=`utah-legend-row`;let r=document.createElement(`span`);r.className=`utah-legend-swatch`,r.style.background=Te[t];let i=document.createElement(`span`);i.className=`utah-legend-label`,i.textContent=aa[t],n.appendChild(r),n.appendChild(i),e.appendChild(n)}this.body.appendChild(e);let n=document.createElement(`div`);n.className=`utah-legend-section`;let r=document.createElement(`div`);r.className=`utah-legend-title`,r.textContent=`Elevation`,n.appendChild(r);let i=document.createElement(`div`);i.className=`utah-legend-ramp`;let a=[];for(let e=0;e<=15;e++){let t=e/15*100;a.push(`${sa(e)} ${t.toFixed(1)}%`)}i.style.background=`linear-gradient(to right, ${a.join(`, `)})`,n.appendChild(i);let o=document.createElement(`div`);o.className=`utah-legend-scale`;let s=document.createElement(`span`);s.textContent=`0`;let c=document.createElement(`span`);c.textContent=`15`,o.appendChild(s),o.appendChild(c),n.appendChild(o),this.body.appendChild(n)}static CSS=`
.utah-legend-panel {
  position: fixed;
  left: 16px;
  bottom: 16px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  color: #e8e4d8;
  z-index: 40;
}
.utah-legend-toggle {
  display: inline-block;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #e8e4d8;
  background: rgba(14, 14, 16, 0.92);
  border: 1px solid rgba(196, 91, 40, 0.35);
  border-radius: 4px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.utah-legend-toggle:hover,
.utah-legend-toggle.open {
  border-color: #c45b28;
  color: #fff;
  box-shadow: 0 0 12px rgba(196, 91, 40, 0.25);
}
.utah-legend-body {
  width: 180px;
  margin-top: 6px;
  padding: 10px 12px;
  background: rgba(14, 14, 16, 0.92);
  border: 1px solid rgba(196, 91, 40, 0.35);
  border-radius: 4px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.utah-legend-section { margin-bottom: 10px; }
.utah-legend-section:last-child { margin-bottom: 0; }
.utah-legend-title {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #c45b28;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(196, 91, 40, 0.2);
}
.utah-legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  font-size: 11px;
  color: #d0c8b8;
}
.utah-legend-swatch {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}
.utah-legend-label { white-space: nowrap; }
.utah-legend-ramp {
  width: 100%;
  height: 10px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.4);
}
.utah-legend-scale {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #7a6a5a;
  margin-top: 3px;
  letter-spacing: 1px;
}
`},Z=200,Q=160,la=20*1.5*160,ua=20*ve*140,da=class e{root;baseCanvas;overlayCanvas;baseCtx;overlayCtx;styleEl;onJump=null;worldWidth=la;worldDepth=ua;constructor(){this.styleEl=document.createElement(`style`),this.styleEl.textContent=e.CSS,document.head.appendChild(this.styleEl),this.root=document.createElement(`div`),this.root.className=`utah-minimap`,this.root.style.width=`${Z}px`,this.root.style.height=`${Q}px`,this.baseCanvas=document.createElement(`canvas`),this.baseCanvas.width=Z,this.baseCanvas.height=Q,this.baseCanvas.className=`utah-minimap-base`,this.overlayCanvas=document.createElement(`canvas`),this.overlayCanvas.width=Z,this.overlayCanvas.height=Q,this.overlayCanvas.className=`utah-minimap-overlay`;let t=this.baseCanvas.getContext(`2d`),n=this.overlayCanvas.getContext(`2d`);if(!t||!n)throw Error(`MinimapRenderer: 2D context unavailable`);this.baseCtx=t,this.overlayCtx=n,this.baseCtx.fillStyle=`#1a1a1a`,this.baseCtx.fillRect(0,0,Z,Q),this.root.appendChild(this.baseCanvas),this.root.appendChild(this.overlayCanvas);let r=document.getElementById(`ui-overlay`);r?r.appendChild(this.root):document.body.appendChild(this.root),this.overlayCanvas.addEventListener(`click`,e=>this.onClick(e))}setOnJump(e){this.onJump=e}build(e){let t=this.baseCtx;t.fillStyle=Te.water,t.fillRect(0,0,Z,Q);let n=1/0,r=-1/0,i=1/0,a=-1/0,o=e.getAllTiles(),s=[];for(let e of o){let t=R({q:e.q,r:e.r},20),o=t.x,c=t.y;o<n&&(n=o),o>r&&(r=o),c<i&&(i=c),c>a&&(a=c),s.push({px:o,py:c,terrain:e.terrain})}n-=20,r+=20,i-=20,a+=20;let c=r-n,l=a-i;this.worldWidth=c,this.worldDepth=l;let u=Math.max(2,Z/160),d=Math.max(2,Q/140);for(let{px:e,py:r,terrain:a}of s){let o=(e-n)/c*Z,s=(r-i)/l*Q;t.fillStyle=Te[a]??`#000000`,t.fillRect(o-u/2,s-d/2,u,d)}}updateViewport(e,t,n){let r=this.overlayCtx;r.clearRect(0,0,Z,Q);let i=e/this.worldWidth*Z,a=-t/this.worldDepth*Q,o=Math.max(n*.6,50),s=o/this.worldWidth*Z,c=o/this.worldDepth*Q;r.strokeStyle=`#ffffff`,r.lineWidth=1.5,r.strokeRect(i-s,a-c,s*2,c*2),r.fillStyle=`#c45b28`,r.beginPath(),r.arc(i,a,2.5,0,Math.PI*2),r.fill()}setVisible(e){this.root.style.display=e?`block`:`none`}dispose(){this.root.remove(),this.styleEl.remove()}onClick(e){if(!this.onJump)return;let t=this.overlayCanvas.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top,i=n/Z*this.worldWidth,a=-(r/Q*this.worldDepth);this.onJump(i,a)}static CSS=`
.utah-minimap {
  position: fixed;
  right: 16px;
  bottom: 16px;
  border: 1px solid rgba(196, 91, 40, 0.35);
  border-radius: 4px;
  background: rgba(14, 14, 16, 0.92);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  padding: 4px;
  z-index: 40;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.utah-minimap-base,
.utah-minimap-overlay {
  position: absolute;
  top: 4px;
  left: 4px;
  display: block;
  border-radius: 2px;
}
.utah-minimap-overlay {
  cursor: crosshair;
}
.utah-minimap-overlay:hover {
  outline: 1px solid rgba(196, 91, 40, 0.5);
}
`},fa=class{container;canvas;ctx;currentAngle=0;size=80;constructor(){this.container=document.createElement(`div`),this.container.style.cssText=`
      position: fixed;
      top: 16px;
      right: 16px;
      width: ${this.size}px;
      height: ${this.size}px;
      z-index: 50;
      pointer-events: none;
      user-select: none;
    `,this.canvas=document.createElement(`canvas`);let e=Math.min(window.devicePixelRatio,2);this.canvas.width=this.size*e,this.canvas.height=this.size*e,this.canvas.style.width=`${this.size}px`,this.canvas.style.height=`${this.size}px`,this.container.appendChild(this.canvas),this.ctx=this.canvas.getContext(`2d`),this.ctx.scale(e,e),document.getElementById(`ui-overlay`)?.appendChild(this.container)??document.body.appendChild(this.container),this.draw()}update(e){let t=Math.round(e*100)/100;t!==this.currentAngle&&(this.currentAngle=t,this.draw())}draw(){let e=this.ctx,t=this.size/2,n=this.size/2,r=this.size/2-4;e.clearRect(0,0,this.size,this.size),e.save(),e.beginPath(),e.arc(t,n,r,0,Math.PI*2),e.fillStyle=`rgba(10, 10, 10, 0.6)`,e.fill(),e.strokeStyle=`rgba(200, 180, 150, 0.3)`,e.lineWidth=1,e.stroke(),e.translate(t,n),e.rotate(-this.currentAngle+Math.PI);let i=r*.65;e.beginPath(),e.moveTo(0,-i),e.lineTo(-4,0),e.lineTo(4,0),e.closePath(),e.fillStyle=`#c45b28`,e.fill(),e.beginPath(),e.moveTo(0,i),e.lineTo(-4,0),e.lineTo(4,0),e.closePath(),e.fillStyle=`rgba(200, 190, 170, 0.5)`,e.fill(),e.beginPath(),e.arc(0,0,3,0,Math.PI*2),e.fillStyle=`#c8b89a`,e.fill(),e.font=`bold 11px "SF Mono", "Fira Code", monospace`,e.textAlign=`center`,e.textBaseline=`middle`;let a=r*.85;e.fillStyle=`#c45b28`,e.fillText(`N`,0,-a),e.fillStyle=`rgba(200, 190, 170, 0.6)`,e.fillText(`S`,0,a),e.fillText(`E`,a,0),e.fillText(`W`,-a,0),e.strokeStyle=`rgba(200, 180, 150, 0.2)`,e.lineWidth=.5;let o=r*.72,s=r*.78;for(let t=0;t<8;t++){if(t%2==0)continue;let n=t*Math.PI/4;e.beginPath(),e.moveTo(Math.sin(n)*o,-Math.cos(n)*o),e.lineTo(Math.sin(n)*s,-Math.cos(n)*s),e.stroke()}e.restore()}dispose(){this.container.remove()}};function $(e,t){let n=document.getElementById(`loading-bar`),r=document.getElementById(`loading-status`);n&&(n.style.width=`${e}%`),r&&(r.textContent=t)}function pa(){let e=document.getElementById(`loading-screen`);e&&(e.classList.add(`hidden`),setTimeout(()=>e.remove(),600))}async function ma(){$(2,`Loading elevation data...`);let{loadHeightmap:e}=await Yt(async()=>{let{loadHeightmap:e}=await Promise.resolve().then(()=>mt);return{loadHeightmap:e}},void 0,import.meta.url);await e(),$(8,`Elevation data loaded`),$(10,`Generating map data...`);let{generateUtahMap:t}=await Yt(async()=>{let{generateUtahMap:e}=await import(`./UtahMapData-BIqJM-bX.js`);return{generateUtahMap:e}},[],import.meta.url),n=t();$(15,`Generated ${n.length} tiles`);let{GameMap:r}=await Yt(async()=>{let{GameMap:e}=await import(`./GameMap-CWcU3vko.js`);return{GameMap:e}},[],import.meta.url),i=new r(160,140);i.loadTiles(n),$(20,`Map loaded`),$(30,`Initializing renderer...`);let a=document.getElementById(`game-canvas`);if(!a)throw Error(`Canvas element #game-canvas not found`);let o=new Ri;o.init(a),$(40,`Renderer initialized`),$(50,`Building terrain...`),await o.buildTerrain(i),$(90,`Terrain built`);let s=i.getLandTiles(),c=i.getAllTiles().filter(e=>e.isWater),l=i.getAllTiles().filter(e=>e.isCity),u=new Set(i.getAllTiles().filter(e=>e.park).map(e=>e.park));console.log(`=== UTAH MAP STATS ===`),console.log(`Total tiles: ${i.tileCount}`),console.log(`Land tiles: ${s.length}`),console.log(`Water tiles: ${c.length}`),console.log(`Cities: ${l.length}`),console.log(`Parks: ${u.size}`),console.log(`Terrain types used: ${new Set(i.getAllTiles().map(e=>e.terrain)).size}`);let d=o.getTerrainMeshes(),f=new zi(o.threeCamera.camera,d,i),p=new Ki,m=new Zi,h=null,g=!1;a.addEventListener(`mousemove`,e=>{h={x:e.clientX,y:e.clientY},!g&&(g=!0,requestAnimationFrame(()=>{if(g=!1,!h)return;let{x:e,y:t}=h,n=a.clientWidth,r=a.clientHeight,i=e/n*2-1,o=-(t/r)*2+1,s=f.pickTile(i,o);s?p.show(s,e,t):p.hide()}))}),a.addEventListener(`mouseleave`,()=>p.hide()),a.addEventListener(`click`,e=>{let t=a.clientWidth,n=a.clientHeight,r=e.clientX/t*2-1,i=-(e.clientY/n)*2+1,s=f.pickTile(r,i);s&&m.show(s),o.scheduler.setDirty(`selection`)});let _=new Hi(o.threeCamera);_.onKeyMove=()=>o.scheduler.setDirty(`camera`);let v=new ia(i,(e,t)=>{o.threeCamera.flyTo(e,t)}),y=new ca,b=new da;b.build(i),b.setOnJump((e,t)=>{o.threeCamera.flyTo(e,t)});let x=!0,S=new fa;window.addEventListener(`keydown`,e=>{let t=e.target,n=!!t&&(t.tagName===`INPUT`||t.tagName===`TEXTAREA`);if(e.key===`Escape`){m.hide(),v.close();return}if(!n){if(e.key===`/`){e.preventDefault(),v.open();return}if(e.key===`l`||e.key===`L`){e.preventDefault(),y.toggle();return}if(e.key===`m`||e.key===`M`){e.preventDefault(),x=!x,b.setVisible(x);return}if(e.key===`\\`){e.preventDefault(),document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{});return}}}),$(100,`Ready`),setTimeout(pa,300);let C=0;function w(e){let t=C===0?1/60:Math.min((e-C)/1e3,.1);C=e,_.update(t),o.threeCamera.update(t),o.updateWeather(e),o.renderIfDirty(e);let n=o.threeCamera.camera.position,r=o.threeCamera.controls.target,i=n.x-r.x,a=n.y-r.y,s=n.z-r.z,c=Math.sqrt(i*i+a*a+s*s);b.updateViewport(r.x,r.z,c),S.update(o.threeCamera.getAzimuthAngle()),requestAnimationFrame(w)}requestAnimationFrame(w),window.addEventListener(`resize`,()=>o.resize())}ma().catch(console.error);export{oi as a,Ut as c,je as d,Ie as f,I as g,ve as h,ai as i,Tt as l,L as m,Li as n,nr as o,ye as p,Ii as r,gn as s,Qi as t,wt as u};