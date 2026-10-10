import { FIRST_PRODUCT, SECTIONS, type SectionId } from '@/lib/scroll/sections';
import { PRODUCT_COUNT } from '@/lib/products';
import { DEFAULT_VALUES, type SceneValues } from './values';

type Patch = Partial<SceneValues>;
const deg = (d: number) => (d * Math.PI) / 180;

const SOLO: Patch = { focus: 1, sideFade: 1, rigY: 1, fogNear: 30, fogFar: 60 };
// One vial centered, a slight forward lean and a three-quarter tilt, the panel on its left.
// focusRotY stays near 0 so a half turn always puts the label straight away from the camera.
const WALK: Patch = {
  ...SOLO, camY: 0, camZ: 6.4, fov: 34, stageLight: 0.9, key: 1.1, rim: 1.6, accent: 0.4, mouse: 0.25,
  focusX: 0, focusY: -0.15, focusRotX: deg(8), focusRotY: deg(-8), focusRotZ: deg(-12),
};

function desktop(id: SectionId): Patch {
  if (id === 'hero') return {};
  if (id === 'range') {
    return { camY: 0, camZ: 23, row: 1, rigY: 1, stageLight: 0, key: 1.5, rim: 1.8, fogNear: 26, fogFar: 52, walk: PRODUCT_COUNT };
  }
  if (id === 'closing') {
    // The camera drops and pushes in so the row rises out of frame while the page reads on.
    return { camY: -7, camZ: 9, row: 1, spread: 1.45, rigY: 1, stageLight: 0, mouse: 0, fogNear: 30, fogFar: 60, walk: PRODUCT_COUNT };
  }
  return { ...WALK, walk: SECTIONS.indexOf(id) - FIRST_PRODUCT };
}

// Applied after camZ is pushed back 30% on small screens. Phones stack the panel below the vial.
function mobile(id: SectionId, f: SceneValues) {
  if (id === 'hero') Object.assign(f, { camZ: 14, camY: -0.6, fogNear: 18, fogFar: 30 });
  else if (id === 'closing') f.camY = -9;
  else if (id !== 'range') Object.assign(f, { camZ: 12, focusX: 0, focusY: 1.7 });
}

export function buildKeyframes(isMobile: boolean): SceneValues[] {
  return SECTIONS.map((id) => {
    const f: SceneValues = { ...DEFAULT_VALUES, ...desktop(id) };
    if (isMobile) {
      f.camZ *= 1.3;
      mobile(id, f);
    }
    return f;
  });
}
