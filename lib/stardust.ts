// Blue stardust over the stage: fine specks that hang in the air, wander slowly and twinkle.
// It draws on its own 2D canvas above the content layers (below the nav), so the specks sit in
// front of the vials and the copy alike. Nearer specks are larger, brighter and wander further.

interface Speck {
  x: number;
  y: number;
  /** 0.3 far to 1 near. */
  z: number;
  phase: number;
  rate: number;
}

const SPRITE = 64;
// About one speck per 11,000 px² of viewport: roughly 120 on a laptop, 30 on a phone.
const AREA_PER_SPECK = 11000;

function makeSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = SPRITE;
  const g = c.getContext('2d')!;
  const r = SPRITE / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, 'rgb(207 224 255 / 1)');
  grad.addColorStop(0.12, 'rgb(137 181 252 / 0.9)');
  grad.addColorStop(0.35, 'rgb(59 96 255 / 0.3)');
  grad.addColorStop(1, 'rgb(59 96 255 / 0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, SPRITE, SPRITE);
  return c;
}

export class Stardust {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly sprite = makeSprite();
  private specks: Speck[] = [];
  private time = 0;
  private shown = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly reduced: boolean) {
    this.ctx = canvas.getContext('2d')!;
    this.resize();
  }

  resize() {
    this.dpr = Math.min(devicePixelRatio, 2);
    this.w = innerWidth;
    this.h = innerHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    const count = Math.round((this.w * this.h) / AREA_PER_SPECK);
    while (this.specks.length < count) {
      this.specks.push({
        x: Math.random(),
        y: Math.random(),
        z: 0.3 + 0.7 * Math.pow(Math.random(), 2),
        phase: Math.random() * Math.PI * 2,
        rate: 0.8 + Math.random() * 1.6,
      });
    }
    this.specks.length = count;
  }

  /** visible fades the dust in on entering the page and out when the stage turns off. */
  render(dt: number, visible: boolean) {
    if (!this.reduced) this.time += dt;
    this.shown += ((visible ? 1 : 0) - this.shown) * (1 - Math.exp(-dt * 3));
    const { ctx, w, h, time: t } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (this.shown < 0.005) return;
    ctx.globalCompositeOperation = 'lighter';
    for (const s of this.specks) {
      const reach = 24 * s.z;
      const x = s.x * w + Math.sin(t * 0.11 + s.phase) * reach;
      const y = s.y * h + Math.sin(t * 0.09 + s.phase * 1.7) * reach;
      const twinkle = Math.pow(0.5 + 0.5 * Math.sin(t * s.rate + s.phase * 3), 6);
      ctx.globalAlpha = (0.15 + 0.85 * twinkle) * s.z * this.shown;
      const size = (6 + 10 * s.z) * (1 + 0.4 * twinkle);
      ctx.drawImage(this.sprite, x - size / 2, y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}
