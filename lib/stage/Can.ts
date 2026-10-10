import * as THREE from 'three';

export type Quality = 'high' | 'low';

export const LABEL_ASPECT = 2400 / 1949;
export const CAN_R = 0.5;
export const CAN_H = (2 * Math.PI * CAN_R) / LABEL_ASPECT;
// Rotates the wrap so the "hiatus" lockup faces the camera at ry = 0.
export const LABEL_FRONT_OFFSET = 0.43;

// Proportions follow a 12 oz sleek can (57 mm wide). 1 mm is about 0.0175 units at CAN_R = 0.5.
// The print wraps the whole painted surface: the bottom roll-in, the straight wall and the
// tapered neck. CAN_H is the length of that surface measured along the profile.
const NECK_R = 0.445;
const FOOT_R = 0.474;
// Lid level, measured up from the top of the print. The seam stands 0.106 above it, so the lid
// sits in a deep countersink like a real end.
export const LID_Y = 0.03;

// Shoulder: a short fillet off the wall, a straight angled cone, a fillet into a short straight neck.
const NECK: [number, number][] = [
  [CAN_R, 0], [CAN_R - 0.003, 0.01], [CAN_R - 0.01, 0.022], [NECK_R + 0.014, 0.066],
  [NECK_R + 0.004, 0.08], [NECK_R, 0.092], [NECK_R, 0.118],
];
// Base: a crisp bevel from the stand ring up into the wall.
const FOOT: [number, number][] = [[FOOT_R, 0], [CAN_R - 0.012, 0.012], [CAN_R - 0.003, 0.024], [CAN_R, 0.034]];

export interface CanGeometries {
  body: THREE.LatheGeometry;
  top: THREE.LatheGeometry;
  bottom: THREE.LatheGeometry;
  tab: THREE.ExtrudeGeometry;
  rivet: THREE.CylinderGeometry;
  score: THREE.ExtrudeGeometry;
  bead: THREE.TorusGeometry;
  dimple: THREE.SphereGeometry;
  dispose(): void;
}

// Painted profile from the bottom edge to the neck, as (radius, height-from-bottom) pairs.
function paintedProfile(): THREE.Vector2[] {
  const pts = FOOT.map(([r, y]) => new THREE.Vector2(r, y));
  const neck = NECK.map(([r, y]) => new THREE.Vector2(r, y));
  const len = (p: THREE.Vector2[]) => p.slice(1).reduce((sum, q, i) => sum + q.distanceTo(p[i]), 0);
  const wall = CAN_H - len(pts) - len(neck);
  const neckBase = pts[pts.length - 1].y + wall;
  return [...pts, ...neck.map((q) => new THREE.Vector2(q.x, neckBase + q.y))];
}

// Lathe whose v runs by arc length, so the label is not stretched on the curved bands.
function paintedBody(): THREE.LatheGeometry {
  const prof = paintedProfile();
  const height = prof[prof.length - 1].y;
  const geo = new THREE.LatheGeometry(prof.map((p) => new THREE.Vector2(p.x, p.y - height / 2)), 160);
  const acc = [0];
  for (let i = 1; i < prof.length; i++) acc.push(acc[i - 1] + prof[i].distanceTo(prof[i - 1]));
  const total = acc[acc.length - 1];
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  // LatheGeometry lays vertices out segment by segment, one profile column at a time.
  for (let k = 0; k < uv.count; k++) uv.setY(k, acc[k % prof.length] / total);
  uv.needsUpdate = true;
  geo.userData.height = height;
  return geo;
}

function tabShape(): THREE.Shape {
  // Ring pull seen from above: rivet end at the origin, finger loop toward +y.
  const w = 0.115;
  const s = new THREE.Shape();
  s.moveTo(-w * 0.7, -0.07);
  s.quadraticCurveTo(0, -0.11, w * 0.7, -0.07);
  s.lineTo(w, 0.12);
  s.quadraticCurveTo(w, 0.25, 0, 0.25);
  s.quadraticCurveTo(-w, 0.25, -w, 0.12);
  s.lineTo(-w * 0.7, -0.07);
  const hole = new THREE.Path();
  hole.absellipse(0, 0.155, 0.07, 0.055, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const slot = new THREE.Path();
  slot.absellipse(0, -0.02, 0.035, 0.022, 0, Math.PI * 2, true);
  s.holes.push(slot);
  return s;
}

// Raised outline of the drink opening, in front of the rivet toward the rim.
function scoreShape(): THREE.Shape {
  const teardrop = (grow: number, path: THREE.Path) => {
    path.moveTo(-0.07 - grow, 0.06);
    path.quadraticCurveTo(0, 0.035 - grow, 0.07 + grow, 0.06);
    path.quadraticCurveTo(0.12 + grow, 0.2, 0, 0.27 + grow);
    path.quadraticCurveTo(-0.12 - grow, 0.2, -0.07 - grow, 0.06);
    return path;
  };
  const s = teardrop(0.006, new THREE.Shape()) as THREE.Shape;
  s.holes.push(teardrop(0, new THREE.Path()));
  return s;
}

export function createCanGeometries(): CanGeometries {
  const body = paintedBody();
  const h = body.userData.height / 2;
  const lathe = (pts: [number, number][]) =>
    new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 128);
  const tab = new THREE.ExtrudeGeometry(tabShape(), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.007, bevelSegments: 3, curveSegments: 32 });
  tab.rotateX(-Math.PI / 2);
  // Loop points back across the lid, the nose sits over the opening.
  tab.rotateY(Math.PI);
  const score = new THREE.ExtrudeGeometry(scoreShape(), { depth: 0.003, bevelEnabled: false, curveSegments: 24 });
  score.rotateX(-Math.PI / 2);
  const g = {
    body,
    // Silver neck, rolled seam, then down the inner wall to the countersink and the lid.
    top: lathe([
      [NECK_R, h], [NECK_R, h + 0.012], [NECK_R + 0.006, h + 0.026], [NECK_R + 0.012, h + 0.036],
      [NECK_R + 0.013, h + 0.05], [NECK_R + 0.013, h + 0.094], [NECK_R + 0.01, h + 0.102], [NECK_R + 0.003, h + 0.106],
      [NECK_R - 0.005, h + 0.103], [NECK_R - 0.009, h + 0.094], [NECK_R - 0.014, h + 0.04], [NECK_R - 0.019, h + 0.02],
      [NECK_R - 0.026, h + 0.014], [NECK_R - 0.033, h + 0.017], [NECK_R - 0.038, h + 0.024], [NECK_R - 0.042, h + LID_Y],
      [0.3, h + LID_Y + 0.003], [0, h + LID_Y + 0.007],
    ]),
    // Dome first, out over the stand ring, up the chime into the print.
    bottom: lathe([
      [0, -h + 0.025], [0.2, -h + 0.008], [0.32, -h - 0.022], [0.37, -h - 0.04], [0.392, -h - 0.046],
      [0.414, -h - 0.042], [0.44, -h - 0.026], [0.462, -h - 0.01], [FOOT_R, -h],
    ]),
    tab,
    rivet: new THREE.CylinderGeometry(0.028, 0.036, 0.02, 32),
    score,
    bead: new THREE.TorusGeometry(0.35, 0.005, 8, 128).rotateX(Math.PI / 2),
    // Small pressed vent dimples near the back of the lid.
    dimple: new THREE.SphereGeometry(0.022, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.35, 1),
  };
  return { ...g, dispose: () => Object.values(g).forEach((x) => x.dispose()) };
}

export interface CanMaterials {
  metal: THREE.MeshStandardMaterial;
  tab: THREE.MeshStandardMaterial;
  label(map: THREE.Texture): THREE.MeshStandardMaterial;
  // Shared by every can: strength (0 to 1) and the lit label rect (u0, v0, u1, v1 in texture space).
  highlight: { uHl: { value: number }; uHlRect: { value: THREE.Vector4 } };
  dispose(): void;
}

// Spotlight on part of the label: everything outside the rect dims, the rect itself lifts a little.
// Applied after tone mapping: the benefit lights push the can well past 1.0, and a multiply before
// the tone curve would barely register.
// A warm brown shade rather than gray, so the shadowed can still sits well on the cream page.
const HL_DIM = 'vec3(0.56, 0.45, 0.39)';
const HL_LIFT = 'vec3(1.04)';
// Corner radius and edge softness in label-height units.
const HL_RADIUS = 0.03;
const HL_FEATHER = 0.035;

function highlightLabel(hl: CanMaterials['highlight']) {
  return (shader: THREE.WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, hl);
    shader.fragmentShader = `uniform float uHl;\nuniform vec4 uHlRect;\n${shader.fragmentShader}`
      .replace('#include <map_fragment>', `#include <map_fragment>
        // Rounded rect in label units (x scaled by the art's aspect so corners stay round).
        vec2 hlUv = vec2(fract(vMapUv.x), vMapUv.y);
        vec2 hlS = vec2(${LABEL_ASPECT.toFixed(4)}, 1.0);
        vec2 hlQ = abs((hlUv - (uHlRect.xy + uHlRect.zw) * 0.5) * hlS) - ((uHlRect.zw - uHlRect.xy) * 0.5 * hlS - ${HL_RADIUS});
        float hlDist = length(max(hlQ, 0.0)) + min(max(hlQ.x, hlQ.y), 0.0) - ${HL_RADIUS};
        float hlIn = 1.0 - smoothstep(-${HL_FEATHER / 2}, ${HL_FEATHER}, hlDist);
        vec3 hlK = mix(vec3(1.0), mix(${HL_DIM}, ${HL_LIFT}, hlIn), uHl);`)
      .replace('#include <tonemapping_fragment>', '#include <tonemapping_fragment>\n        gl_FragColor.rgb = min(gl_FragColor.rgb * hlK, 1.0);');
  };
}

function highlightMetal(hl: CanMaterials['highlight']) {
  return (shader: THREE.WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, hl);
    shader.fragmentShader = `uniform float uHl;\n${shader.fragmentShader}`
      .replace('#include <tonemapping_fragment>', `#include <tonemapping_fragment>\n        gl_FragColor.rgb *= mix(vec3(1.0), ${HL_DIM}, uHl);`);
  };
}

export function createCanMaterials(quality: Quality): CanMaterials {
  const high = quality === 'high';
  const metal = high
    ? new THREE.MeshPhysicalMaterial({ color: 0xe6e6e6, metalness: 1, roughness: 0.17, clearcoat: 0.6, clearcoatRoughness: 0.1 })
    : new THREE.MeshStandardMaterial({ color: 0xe6e6e6, metalness: 1, roughness: 0.2 });
  const tab = new THREE.MeshStandardMaterial({ color: 0xdcdcdc, metalness: 1, roughness: 0.18 });
  const highlight = { uHl: { value: 0 }, uHlRect: { value: new THREE.Vector4(0, 0, 1, 1) } };
  metal.onBeforeCompile = highlightMetal(highlight);
  tab.onBeforeCompile = highlightMetal(highlight);
  // Satin print over aluminium: a little metal shows through, with a soft clearcoat sheen.
  const label = (map: THREE.Texture) => {
    const m = high
      ? new THREE.MeshPhysicalMaterial({ map, metalness: 0.08, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.16, envMapIntensity: 0.7 })
      : new THREE.MeshStandardMaterial({ map, metalness: 0.06, roughness: 0.45, envMapIntensity: 0.55 });
    m.onBeforeCompile = highlightLabel(highlight);
    return m;
  };
  return {
    metal,
    tab,
    label,
    highlight,
    dispose: () => {
      metal.dispose();
      tab.dispose();
    },
  };
}

export function prepareLabelTexture(t: THREE.Texture, anisotropy: number): THREE.Texture {
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.offset.x = LABEL_FRONT_OFFSET;
  t.anisotropy = anisotropy;
  t.needsUpdate = true;
  return t;
}

export class Can {
  readonly group = new THREE.Group();
  readonly label: THREE.MeshStandardMaterial;

  constructor(geo: CanGeometries, mats: CanMaterials, map: THREE.Texture) {
    this.label = mats.label(map);
    const h = geo.body.userData.height / 2;
    const tab = new THREE.Mesh(geo.tab, mats.tab);
    tab.position.set(0, h + LID_Y + 0.012, 0);
    const rivet = new THREE.Mesh(geo.rivet, mats.tab);
    rivet.position.set(0, h + LID_Y + 0.01, 0);
    const score = new THREE.Mesh(geo.score, mats.metal);
    score.position.y = h + LID_Y + 0.003;
    const bead = new THREE.Mesh(geo.bead, mats.metal);
    bead.position.y = h + LID_Y + 0.003;
    const dimples = [-1, 1].map((side) => {
      const d = new THREE.Mesh(geo.dimple, mats.metal);
      d.position.set(side * 0.13, h + LID_Y + 0.004, -0.29);
      return d;
    });
    this.group.add(
      score,
      bead,
      ...dimples,
      new THREE.Mesh(geo.body, this.label),
      new THREE.Mesh(geo.top, mats.metal),
      new THREE.Mesh(geo.bottom, mats.metal),
      tab,
      rivet,
    );
    this.group.rotation.order = 'XZY';
  }

  dispose() {
    this.label.dispose();
  }
}
