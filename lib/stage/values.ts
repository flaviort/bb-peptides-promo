// Every scroll-animated scene parameter. The master timeline writes here; the Stage reads it each frame.
export const DEFAULT_VALUES = {
  camX: 0, camY: -0.2, camZ: 10.6, camRotX: 0, camRotZ: 0, fov: 30,
  spacing: 2.45, wave: 0.35, tilt: 0.3, depth: 1.5,
  row: 0, spread: 1,
  focus: 0, focusX: 0, focusY: 0, focusZ: 0, focusRotX: 0, focusRotY: 0, focusRotZ: 0,
  sideFade: 0, rigY: 0,
  stageLight: 1, key: 1.2, rim: 1.4, ambient: 0.45, accent: 0, exposure: 1.1,
  fogNear: 13, fogFar: 25,
  mouse: 1,
  // Label spotlight for the benefit sections; the rect defaults to the first spot so it never slides in.
  hl: 0, hlU0: 0.325, hlV0: 0.058, hlU1: 0.545, hlV1: 0.138,
};

export type SceneValues = typeof DEFAULT_VALUES;
export type ValueKey = keyof SceneValues;
export const VALUE_KEYS = Object.keys(DEFAULT_VALUES) as ValueKey[];
