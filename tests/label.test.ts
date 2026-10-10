import { expect, it } from 'vitest';
import { labelLines } from '@/lib/stage/label';
import { LABEL_ASPECT, LABEL_H, VIAL_R } from '@/lib/stage/Vial';

it('breaks combination names after the slash, like the printed vials', () => {
  expect(labelLines('CJC-1295 / Ipamorelin')).toEqual(['CJC-1295 /', 'Ipamorelin']);
  expect(labelLines('Tesamorelin / Ipamorelin')).toEqual(['Tesamorelin /', 'Ipamorelin']);
  expect(labelLines('Semax / Selank')).toEqual(['Semax /', 'Selank']);
});

it('breaks long two-word names and keeps short ones on one line', () => {
  expect(labelLines('Thymosin Alpha-1')).toEqual(['Thymosin', 'Alpha-1']);
  expect(labelLines('Wolverine Blend')).toEqual(['Wolverine', 'Blend']);
  expect(labelLines('Melanotan II')).toEqual(['Melanotan II']);
  expect(labelLines('BPC-157')).toEqual(['BPC-157']);
});

it('sizes the label canvas to the wrap', () => {
  expect(LABEL_ASPECT).toBeCloseTo((2 * Math.PI * (VIAL_R + 0.006)) / LABEL_H);
});
