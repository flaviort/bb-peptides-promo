import * as THREE from 'three';
import { CATEGORIES, type Product } from '@/lib/products';
import { LABEL_ASPECT, LABEL_FRONT_OFFSET } from './Vial';

const ELECTRIC = '#3B60FF';
// The lighter stripe printed round the client's vials. Not Light Blue: White stays legible on it.
const STRIPE = '#6E8EFF';
const WHITE = '#FFFFFF';

export function labelLines(name: string): string[] {
  if (name.includes(' / ')) {
    const [first, ...rest] = name.split(' / ');
    return [`${first} /`, rest.join(' / ')];
  }
  if (name.length > 12 && name.includes(' ')) {
    const i = name.lastIndexOf(' ');
    return [name.slice(0, i), name.slice(i + 1)];
  }
  return [name];
}

// Draws one wrap-around label. The canvas center is the front of the vial, the edges meet behind it.
// Type is sized in u, a hundredth of the label height.
export function drawLabel(ctx: CanvasRenderingContext2D, p: Product, w: number, h: number, family: string): void {
  const u = h / 100;
  const left = w * 0.39;
  const maxW = w * 0.24;
  ctx.fillStyle = ELECTRIC;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = STRIPE;
  ctx.fillRect(0, 62 * u, w, 12 * u);

  ctx.fillStyle = WHITE;
  ctx.textBaseline = 'alphabetic';
  const lines = labelLines(p.name);
  let size = 14 * u;
  const fits = () => {
    ctx.font = `600 ${size}px ${family}`;
    return lines.every((l) => ctx.measureText(l).width <= maxW);
  };
  while (!fits() && size > 8 * u) size -= 0.5 * u;
  let y = 6 * u + size;
  for (const line of lines) {
    ctx.fillText(line, left, y);
    y += size * 1.04;
  }
  ctx.font = `400 ${6 * u}px ${family}`;
  ctx.fillText(CATEGORIES[p.category].name, left, y + 1 * u);
  ctx.font = `500 ${6 * u}px ${family}`;
  ctx.fillText(p.strength, left, y + 8.5 * u);
  ctx.font = `600 ${7 * u}px ${family}`;
  ctx.fillText(p.vial, left, 71 * u);
  ctx.globalAlpha = 0.75;
  ctx.font = `400 ${5 * u}px ${family}`;
  ctx.fillText('Rx only', left, 88 * u);
  // Back panel, behind the vial.
  ctx.globalAlpha = 0.85;
  ctx.font = `500 ${5 * u}px ${family}`;
  ctx.fillText('Bodybuilding Peptides +', w * 0.04, 20 * u);
  ctx.fillText('Under prescription', w * 0.04, 88 * u);
  ctx.globalAlpha = 1;
}

export function createLabelTexture(p: Product, width: number, family: string, anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = Math.round(width / LABEL_ASPECT);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  drawLabel(ctx, p, canvas.width, canvas.height, family);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.offset.x = LABEL_FRONT_OFFSET;
  t.anisotropy = anisotropy;
  t.needsUpdate = true;
  return t;
}
