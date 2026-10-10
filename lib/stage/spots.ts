import { LABEL_FRONT_OFFSET } from './Can';

// Regions of the label art that the benefit sections light up. Measured on the label files
// (all four flavors share one layout) as fractions of the image: x from the left, y from the top.
export interface LabelSpot { x0: number; y0: number; x1: number; y1: number }

export const LABEL_SPOTS = {
  dose: { x0: 0.325, y0: 0.862, x1: 0.545, y1: 0.942 }, // "2mg THC + 20mg CBD per can" pill
  alcohol: { x0: 0.028, y0: 0.302, x1: 0.127, y1: 0.392 }, // "No hangover, alcohol-free, 21+" badge
  juice: { x0: 0.762, y0: 0.058, x1: 0.958, y1: 0.128 }, // "13% organic juice" header
  light: { x0: 0.358, y0: 0.732, x1: 0.548, y1: 0.842 }, // calories, cane sugar, no artificial flavors
} satisfies Record<string, LabelSpot>;

export type SpotId = keyof typeof LABEL_SPOTS;

// Highlight rect in texture space (v runs bottom to top), ready for the shader uniform.
export function spotRect(id: SpotId) {
  const s = LABEL_SPOTS[id];
  return { hlU0: s.x0, hlV0: 1 - s.y1, hlU1: s.x1, hlV1: 1 - s.y0 };
}

// Y rotation that turns a label column to face the camera, plus whole turns so the
// sequence keeps spinning one way. Point at angle phi faces +z when rotation.y = -phi.
export function spotFacing(id: SpotId, turns: number): number {
  const s = LABEL_SPOTS[id];
  const u = (s.x0 + s.x1) / 2 - LABEL_FRONT_OFFSET;
  return -u * Math.PI * 2 + turns * Math.PI * 2;
}

// Height of a spot's center on the can, in can units from its middle (the label spans CAN_H).
export function spotHeight(id: SpotId, canH: number): number {
  const s = LABEL_SPOTS[id];
  return (0.5 - (s.y0 + s.y1) / 2) * canH;
}
