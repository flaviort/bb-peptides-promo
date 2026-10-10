import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FLAVORS } from '@/lib/flavors';
import { SITE } from '@/lib/site';

// Rendered once at build time. Satori cannot read WOFF2, so lib/og keeps small OTF subsets of Neue Kabel.
export const alt = 'Hiatus THC Seltzer in four flavors: Mango Satsuma, Peach Strawberry, Lemonade and Cherry Pomegranate';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const STRIPES = ['#4A2116', '#A9401F', '#E0702C', '#F2A65A', '#F6CB6E'];
const INK = '#3A1C12';

const dataUri = (buf: Buffer, type: string) => `data:${type};base64,${buf.toString('base64')}`;

// Read at module scope with statically scoped paths, so the route prerenders and only these files are traced.
const [black, bold, logo, ...cans] = await Promise.all([
  readFile(join(process.cwd(), 'lib/og', 'NeueKabel-Black.otf')),
  readFile(join(process.cwd(), 'lib/og', 'NeueKabel-Bold.otf')),
  readFile(join(process.cwd(), 'public/placeholders', 'hiatus-logo.svg')),
  ...FLAVORS.map((f) => readFile(join(process.cwd(), 'public/placeholders', `product-${f.id}.png`))),
]);

export default function Image() {

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: SITE.cream, fontFamily: 'Kabel', color: INK }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 0 64px', width: 450 }}>
          <img src={dataUri(logo, 'image/svg+xml')} width={264} height={198} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 36, fontSize: 64, fontWeight: 900, lineHeight: 0.9, textTransform: 'uppercase', color: '#7A2E12' }}>
            <span>A taste of</span>
            <span>time off</span>
          </div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 18, fontWeight: 700, letterSpacing: 2.5, whiteSpace: 'nowrap', textTransform: 'uppercase', opacity: 0.75 }}>
            THC seltzer · 0% alcohol · 21+
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: -10 }}>
          {cans.map((buf, i) => (
            <img key={FLAVORS[i].id} src={dataUri(buf, 'image/png')} width={262} height={266} alt="" style={{ marginLeft: i ? -94 : 0, marginTop: i % 2 ? 50 : -30 }} />
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 18 }}>
          {STRIPES.map((c) => <div key={c} style={{ flex: 1, background: c }} />)}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Kabel', data: black, weight: 900, style: 'normal' },
        { name: 'Kabel', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
