import * as THREE from 'three';

// The full lineup's backdrop: a room of Light Blue grid lines receding from the camera, with an
// Electric Blue scan band sweeping down its length. One full-screen quad drawn behind everything
// in the scene; each pixel casts a ray from the camera and finds the wall, floor or ceiling it hits.
// It sits on the far plane and skips every pixel a vial covers (the opaque parts by depth, the glass by
// the stencil mask in Vial.ts), so the lines and the scan glow pass behind the products.

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uMix;
uniform float uAspect;
uniform float uTan;
uniform vec2 uTilt;
varying vec2 vUv;

const vec3 LINE = vec3(0.537, 0.71, 0.988);
const vec3 SCAN = vec3(0.231, 0.376, 1.0);
// Half width and half height of the room, in units of distance from the camera.
const float W = 1.7;
const float H = 1.0;
// A sweep runs the room's length in SWEEP seconds, then rests for the rest of the CYCLE.
const float SWEEP = 3.2;
const float CYCLE = 5.0;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  vec3 d = normalize(vec3(p.x * uAspect * uTan, p.y * uTan, -1.0));
  d.xz = rot(uTilt.x) * d.xz;
  d.yz = rot(uTilt.y) * d.yz;

  float tx = W / max(abs(d.x), 1e-4);
  float ty = H / max(abs(d.y), 1e-4);
  vec3 h = d * min(tx, ty);
  // Side walls are gridded along depth and height, floor and ceiling along width and depth.
  vec2 cell = tx < ty ? vec2(h.z, h.y) : vec2(h.x, h.z);
  float depth = -h.z;

  vec2 g = cell * 2.0;
  vec2 fw = fwidth(g);
  vec2 a = abs(fract(g - 0.5) - 0.5) / max(fw, 1e-4);
  float line = 1.0 - min(min(a.x, a.y), 1.0);
  // Far away the cells shrink under a pixel: fade them before they shimmer.
  line *= 1.0 - smoothstep(0.25, 0.6, max(fw.x, fw.y));
  float fog = exp(-depth * 0.09);

  float cyc = mod(uTime, CYCLE);
  float u = clamp(cyc / SWEEP, 0.0, 1.0);
  u = u * u * (3.0 - 2.0 * u);
  float zs = mix(0.6, 24.0, u);
  float alive = smoothstep(0.0, 0.08, u) * (1.0 - smoothstep(0.85, 1.0, u));
  float band = exp(-pow((depth - zs) / (0.35 + zs * 0.04), 2.0)) * alive;
  float trail = exp(-max(zs - depth, 0.0) * 0.6) * step(depth, zs) * alive;

  vec3 col = LINE * line * 0.32 * fog;
  col += SCAN * band * (line * 2.2 + 0.18) * (0.35 + 0.65 * fog);
  col += SCAN * trail * line * 0.5 * fog;
  col += vec3(1.0) * band * line * 0.35 * fog;

  float k = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  gl_FragColor = vec4(col, k) * uMix;
}
`;

export class GridRoom {
  readonly mesh: THREE.Mesh;
  private readonly material: THREE.ShaderMaterial;
  private time = 0;
  private shown = 0;
  private readonly tilt = new THREE.Vector2();

  constructor(private readonly reduced: boolean) {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMix: { value: 0 },
        uAspect: { value: 1 },
        uTan: { value: 0.27 },
        uTilt: { value: this.tilt },
      },
      transparent: true,
      depthTest: true,
      depthWrite: false,
      stencilWrite: true,
      stencilWriteMask: 0,
      stencilRef: 1,
      stencilFunc: THREE.NotEqualStencilFunc,
      // Premultiplied: the canvas is transparent over the CSS room, so alpha follows the light.
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -10;
  }

  /** want is 0 to 1: how much of the lineup is on screen. pointer is -0.5 to 0.5 on both axes (lib/boot.ts). */
  update(dt: number, want: number, camera: THREE.PerspectiveCamera, pointer: { x: number; y: number }) {
    if (!this.reduced) this.time += dt;
    this.shown += (want - this.shown) * (1 - Math.exp(-dt * 4));
    const k = 1 - Math.exp(-dt * 3);
    this.tilt.x += (pointer.x * 0.16 - this.tilt.x) * k;
    this.tilt.y += (-pointer.y * 0.1 - this.tilt.y) * k;
    const u = this.material.uniforms;
    u.uTime.value = this.time;
    u.uMix.value = this.shown;
    u.uAspect.value = camera.aspect;
    u.uTan.value = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    this.mesh.visible = this.shown > 0.005;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
