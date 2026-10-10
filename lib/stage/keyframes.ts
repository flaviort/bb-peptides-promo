import { SECTIONS, type SectionId } from '@/lib/scroll/sections';
import { DEFAULT_VALUES, type SceneValues } from './values';
import { CAN_H } from './Can';
import { spotFacing, spotHeight, spotRect, type SpotId } from './spots';

type Patch = Partial<SceneValues>;
const deg = (d: number) => (d * Math.PI) / 180;

const SOLO: Patch = { focus: 1, sideFade: 1, rigY: 1, fogNear: 30, fogFar: 60 };
const BENEFIT: Patch = {
  ...SOLO, camY: 0, fov: 40, focusX: 0.45, focusRotX: 0, focusRotZ: deg(4),
  stageLight: 0, key: 0.8, rim: 1, accent: 1, mouse: 0.15, hl: 1,
};

// Ciao-style benefit close-up: spin the can until the printed claim faces the camera,
// center it in frame and light just that patch of the label.
function benefit(spot: SpotId, turns: number, camZ: number, tilt: number): Patch {
  return {
    ...BENEFIT, ...spotRect(spot), camZ, camRotZ: deg(tilt),
    focusY: -spotHeight(spot, CAN_H), focusRotY: spotFacing(spot, turns),
  };
}

const DESKTOP: Record<SectionId, Patch> = {
  hero: {},
  profile: {
    // Ciao-style close-up: the can fills the frame, lid toward the camera, base running off the bottom.
    ...SOLO, camY: 0, camZ: 3.9, fov: 40, stageLight: 0.5, mouse: 0.3,
    focusX: 0.3, focusY: -0.5, focusRotX: deg(8), focusRotY: deg(6), focusRotZ: deg(22),
  },
  // Turn counts keep the spin going one way: 360, 488, 565 and 712 degrees.
  'benefit-1': benefit('dose', 1, 3, -4),
  'benefit-2': benefit('alcohol', 1, 2.4, 4),
  'benefit-3': benefit('juice', 2, 3, -4),
  'benefit-4': benefit('light', 2, 3, 4),
  statement: {
    ...SOLO, camY: 0, camZ: 7.2, fov: 38, stageLight: 0.4, key: 1.3, mouse: 0.6,
    focusRotX: deg(-6), focusRotY: deg(732), focusRotZ: deg(8),
  },
  range: { camY: 0, camZ: 14, row: 1, rigY: 1, stageLight: 0, key: 1.5, rim: 1.8, fogNear: 22, fogFar: 48 },
  // Scrolling from the row into the FAQ (a short 90vh stretch), the camera drops and pushes in:
  // the cans rise off the top with the page while growing toward the viewer and fanning apart.
  // It then holds through the rest of the page, so nothing moves behind the questions.
  faq: { camY: -7, camZ: 6.5, row: 1, spread: 1.45, rigY: 1, stageLight: 0, mouse: 0, fogNear: 30, fogFar: 60 },
};

function mobileBenefit(spot: SpotId): Patch {
  return { camZ: 5.2, focusX: 0, focusY: -spotHeight(spot, CAN_H) + 0.9 };
}

// Applied after camZ is pushed back 30% on small screens.
const MOBILE: Partial<Record<SectionId, Patch>> = {
  hero: { camZ: 14, camY: -0.6, fogNear: 18, fogFar: 30 },
  profile: { camZ: 7, focusX: 0, focusY: 0.6 },
  // Phones stack the copy below, so each lit spot sits in the upper half instead.
  'benefit-1': mobileBenefit('dose'),
  'benefit-2': mobileBenefit('alcohol'),
  'benefit-3': mobileBenefit('juice'),
  'benefit-4': mobileBenefit('light'),
  // The camera sits 30% further back here, so the drop scales with it.
  faq: { camY: -9 },
};

export function buildKeyframes(mobile: boolean): SceneValues[] {
  return SECTIONS.map((id) => {
    const f: SceneValues = { ...DEFAULT_VALUES, ...DESKTOP[id] };
    if (mobile) {
      f.camZ *= 1.3;
      Object.assign(f, MOBILE[id]);
    }
    return f;
  });
}
