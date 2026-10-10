# BB Peptides Promo Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A single-page promo for Bodybuilding Peptides + where 12 injectable vials spin in a 3D hero carousel, a scroll walk spins one vial through every product with its details, the full range returns, and the page closes with how it works, the assessment band, FAQ and footer.

**Architecture:** Fork the Hiatus promo (`../hiatus`) and keep its spine: a Three.js `Stage` driven by one paused GSAP master timeline that ScrollTrigger maps from Lenis-paged scroll, fixed HTML layers that reveal per section, and a tiny event store between them. The soda can becomes a procedural `VialModel` behind a `ProductModel` interface, with runtime canvas labels. A continuous `walk` timeline value spins the focus vial once per product and swaps its label only while the label faces away.

**Tech Stack:** Next.js 16.4 (App Router, TypeScript), React 19.3, Tailwind 4, GSAP 3.15 (ScrollTrigger, SplitText, `@gsap/react`), Lenis 1.3, Three.js 0.186, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-10-10-bb-peptides-promo-design.md` (product truth in `PRODUCT.md`, approved look in `mockups/hero.html` with `data-ground="ink"`).

## Global Constraints

- Repo root for every path below: `/Users/flavioczuk/Downloads/_sites/sky/bb-peptides-promo`. Hiatus source: `../hiatus`. BB Peptides source: `../bodybuilding-peptides`.
- Versions are the ones in Hiatus's `package.json`; do not upgrade or add dependencies.
- This Next.js has breaking changes from older versions: read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code (`AGENTS.md`).
- Copy rule: no em dashes, no emojis, anywhere (UI, data, comments, commits). Sentence case in Poppins. Capitals only through the `.display` class (RBNo2.1 Medium Italic).
- Colors: only `#111111` (Ink, the ground), `#3B60FF` (Electric Blue), `#89B5FC` (Light Blue), `#FFFFFF`, plus their alpha. One exception: the lighter stripe `#6E8EFF` printed on the 3D label art, matching the client's renders. Never White text on Light Blue.
- Square corners: no `border-radius`, no `rounded-*` classes. No drop shadows on UI. The only glows are the light on Electric Blue indicators (hero track, focus-tag squares, progress line), as in the approved mockup.
- Links to trybbpeptides.com and the assessment open in a new tab with `rel="noreferrer"`.
- Assessment URL: `https://intake.trybbpeptides.com/s/assessment`. Product URL: `https://www.trybbpeptides.com/{categorySlug}/{slug}`.
- No invented claims, prices, testimonials, studies or reviews. Product copy is condensed from the BB repo's own `about` text.
- RBNo2.1 is a commercial licence: self-host the one woff2, never publish it anywhere else.
- Every task ends with `npm test && npx tsc --noEmit && npm run lint` passing. Tasks that say so also need `npm run build`.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Fast jumps across many products (rail click from p02 to p11, menu jump from the hero): the label must never visibly swap, and the vial and panel must land on the target product. Pinned in Task 6 (`tests/carousel.test.ts`, fine and coarse step cases).
2. Crossing the 760px breakpoint mid-walk rebuilds the keyframes: the walk must stay on the same product. Pinned in Task 6 (`tests/timeline.test.ts`, mobile and desktop `walk` values match).
3. WebGL missing, or the 3D chunk or label build stalls: the page must still enter within about 8s, with renders and product copy driven by the section. Pinned in Task 6 (`tests/timeout.test.ts`, `tests/sections.test.ts`).
4. `prefers-reduced-motion`: no spin, but the label still changes, at the bottom of the dip, and lands correct in both directions. Pinned in Task 6 (`tests/carousel.test.ts`, reduced case).
5. Long names ("Tesamorelin / Ipamorelin", "Thymosin Alpha-1") on a 375px phone and on the label: they must wrap, never overflow. Pinned in Task 5 (`tests/label.test.ts`) and checked visually in Task 13.

---

### Task 1: Fork Hiatus into this repo

**Files:**
- Create: everything copied from `../hiatus` (list below)
- Modify: `package.json`, `.gitignore`, `.claude/launch.json`

**Interfaces:**
- Consumes: nothing.
- Produces: a working Hiatus copy at the repo root that later tasks rewrite.

- [ ] **Step 1: Copy the Hiatus source without build output, history or Hiatus docs**

```bash
cd /Users/flavioczuk/Downloads/_sites/sky/bb-peptides-promo
rsync -a --exclude node_modules --exclude .next --exclude .git --exclude qa --exclude docs \
  --exclude mockups --exclude .superpowers --exclude tsconfig.tsbuildinfo --exclude .DS_Store \
  ../hiatus/ ./
ls
```

Expected: `AGENTS.md app components eslint.config.mjs lib next.config.ts package.json package-lock.json public scripts tests tsconfig.json vitest.config.ts` alongside the existing `PRODUCT.md docs mockups`.

- [ ] **Step 2: Rename the package**

In `package.json` set `"name": "bb-peptides-promo"`. In `package-lock.json` replace the two top-level `"name": "hiatus"` entries (the root and `packages[""]`) with `"name": "bb-peptides-promo"`.

```bash
sed -i '' 's/"name": "hiatus"/"name": "bb-peptides-promo"/g' package.json package-lock.json
grep -n '"name": "bb-peptides-promo"' package.json package-lock.json
```

Expected: one hit in `package.json`, two in `package-lock.json`.

- [ ] **Step 3: Point the launch config at this repo's mockups and dev server**

Replace `.claude/launch.json` with:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "mockups",
      "runtimeExecutable": "python3",
      "runtimeArgs": ["-m", "http.server", "4310", "--directory", "mockups"],
      "port": 4310
    },
    {
      "name": "dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 3000,
      "autoPort": true
    }
  ]
}
```

- [ ] **Step 4: Install and run the Hiatus checks as the baseline**

```bash
npm ci
npm test && npx tsc --noEmit && npm run lint
```

Expected: all Hiatus tests pass, no type or lint errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Fork the Hiatus promo landing as the base

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Brand foundation (fonts, assets, tokens)

**Files:**
- Create: `app/fonts/rbno21a-medium-italic-latin.woff2`, `public/logos/bb-peptides-full-white.svg`, `public/logos/b-mark-white.svg`, `public/video/couple.mp4`, `public/video/couple-poster.jpg`, `public/social/{instagram,facebook,twitter-x,tiktok,threads}.svg`
- Replace: `app/globals.css`, `app/layout.tsx`, `lib/site.ts`, `app/manifest.ts`, `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`
- Delete: `app/fonts/NeueKabel-*.woff2`, `public/placeholders/`, `public/labels/`, `scripts/prepare-assets.sh`, `app/opengraph-image.tsx`, `lib/og/`
- Modify: `package.json` (drop the `assets` script)

**Interfaces:**
- Consumes: Task 1 tree.
- Produces: CSS variables `--font-rbno` and `--font-poppins` on `<html>`; Tailwind colors `ink`, `electric`, `light-blue`; the class vocabulary every later component uses (`.display`, `.btn`, `.btn-primary`, `.btn-outline`, `.btn-square`, `.fade`, `.layer`, `.spacer`, `.stage-canvas`, `.backdrop`, `.pool--*`, `.nav*`, `.menu*`, `.frame*`, `.progress-line`, `.hero-*`, `.product-*`, `.rail-num`, `.range-*`, `.closing*`, `.how*`, `.band*`, `.faq*`, `.acc*`, `.footer*`, `.social`, `.preloader*`, `.dim-list`, `.roll`); `SITE` from `lib/site.ts` with keys `name, shortName, title, description, company, companyUrl, ink`.

- [ ] **Step 1: Copy brand assets from the BB repo**

```bash
cd /Users/flavioczuk/Downloads/_sites/sky/bb-peptides-promo
BB=../bodybuilding-peptides
mkdir -p public/logos public/video public/social
cp $BB/src/assets/fonts-peptides/rbno21a-medium-italic-latin.woff2 app/fonts/
cp $BB/public/branding-guide-assets/logos/bb-peptides-full-white.svg $BB/public/branding-guide-assets/logos/b-mark-white.svg public/logos/
cp $BB/public/videos-peptides/couple.mp4 public/video/
cp $BB/src/assets/svg-peptides/social/*.svg public/social/
cp $BB/src/app/icon.svg $BB/src/app/favicon.ico $BB/src/app/apple-icon.png app/
ffmpeg -y -loglevel error -ss 1 -i public/video/couple.mp4 -frames:v 1 -vf scale=1280:-2 -q:v 4 public/video/couple-poster.jpg
rm -f app/fonts/NeueKabel-*.woff2 scripts/prepare-assets.sh app/opengraph-image.tsx
rm -rf public/placeholders public/labels lib/og
ls app/fonts public/logos public/video public/social
```

Expected: the woff2 in `app/fonts`, two logos, `couple.mp4` and `couple-poster.jpg`, five social SVGs.

- [ ] **Step 2: Drop the `assets` script**

In `package.json` delete the line `"assets": "bash scripts/prepare-assets.sh",`.

- [ ] **Step 3: Replace `lib/site.ts`**

```ts
// Canonical origin for metadata, the sitemap and structured data. Set NEXT_PUBLIC_SITE_URL once the
// production domain is known; on Vercel it falls back to the project's production domain.
const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelProd ? `https://${vercelProd}` : 'http://localhost:3000'),
);

export const SITE = {
  name: 'Bodybuilding Peptides +',
  shortName: 'BB Peptides',
  title: 'Bodybuilding Peptides + | Physician-guided peptides, started online',
  description:
    'Explore 12 physician-guided peptides for muscle growth, recovery and focus, from CJC-1295 / Ipamorelin to BPC-157. Start your online assessment and a licensed provider reviews it.',
  company: 'Bodybuilding Peptides, Inc.',
  companyUrl: 'https://www.trybbpeptides.com',
  ink: '#111111',
} as const;

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
```

- [ ] **Step 4: Replace `app/manifest.ts`**

```ts
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: '/',
    display: 'browser',
    background_color: SITE.ink,
    theme_color: SITE.ink,
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
```

- [ ] **Step 5: Replace `app/layout.tsx`**

Read `node_modules/next/dist/docs/` for `next/font` first (local and Google) to confirm the API is unchanged.

```tsx
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Poppins } from 'next/font/google';
import { SITE, SITE_URL } from '@/lib/site';
import './globals.css';

// RBNo2.1 Medium Italic is a commercial licence: one self-hosted Latin woff2, never redistributed.
const rbno = localFont({
  src: [{ path: './fonts/rbno21a-medium-italic-latin.woff2', weight: '500', style: 'italic' }],
  variable: '--font-rbno',
  display: 'swap',
});

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-poppins', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: SITE.title,
  description: SITE.description,
  applicationName: SITE.shortName,
  publisher: SITE.company,
  category: 'health',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title: SITE.title, description: SITE.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = { themeColor: SITE.ink, colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rbno.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Replace `app/globals.css`**

This is the whole visual system from the approved mockup, translated into the class names later tasks use.

```css
@import "tailwindcss";

@theme {
  --color-ink: #111111;
  --color-electric: #3B60FF;
  --color-light-blue: #89B5FC;
  --font-display: var(--font-rbno), var(--font-poppins), sans-serif;
  --font-sans: var(--font-poppins), system-ui, sans-serif;
  --ease-out-3: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-in-out-3: cubic-bezier(0.645, 0.045, 0.355, 1);
  --ease-out-5: cubic-bezier(0.2, 0.8, 0.2, 1);
}

:root {
  --hair: rgb(255 255 255 / 0.14);
  --hair-strong: rgb(255 255 255 / 0.3);
  --muted: rgb(255 255 255 / 0.62);
  --gutter: clamp(20px, 4vw, 56px);
  --progress: 0;
  color-scheme: dark;
}

html {
  background: var(--color-ink);
  color: #fff;
  -webkit-font-smoothing: antialiased;
  scrollbar-width: none;
  overscroll-behavior: none;
}
html::-webkit-scrollbar { display: none; }
body { font-family: var(--font-sans); background: var(--color-ink); overscroll-behavior: none; }
::selection { background: var(--color-electric); color: #fff; }
:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
/* Tailwind v4 resets buttons to the default cursor. */
:is(a[href], button, [role="button"], summary, label[for], select):not(:disabled, [aria-disabled="true"]) { cursor: pointer; }

/* Lenis */
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-stopped { overflow: clip; }

/* Stage */
.stage-canvas {
  position: fixed; inset: 0; width: 100%; height: 100%; z-index: 1; touch-action: pan-y;
  transition: opacity 0.6s var(--ease-out-3);
}
.stage-canvas.is-off { opacity: 0; }
body.is-grabbing, body.is-grabbing * { cursor: grabbing !important; }
.spacer { height: 125vh; }
.spacer--short { height: 90vh; }

/* Backdrop: the Ink room, lit from the floor. Category shows in the light, not the ground. */
.backdrop { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: var(--color-ink); }
.backdrop > * { position: absolute; inset: 0; }
.pool { opacity: 0; transition: opacity 1s var(--ease-out-3); }
.pool--electric {
  background:
    radial-gradient(120% 70% at 50% 118%, rgb(59 96 255 / 0.42) 0%, rgb(59 96 255 / 0.1) 42%, transparent 70%),
    radial-gradient(60% 40% at 50% 100%, rgb(137 181 252 / 0.16) 0%, transparent 70%);
}
.pool--light {
  background:
    radial-gradient(130% 80% at 50% 120%, rgb(137 181 252 / 0.32) 0%, rgb(137 181 252 / 0.08) 45%, transparent 72%),
    radial-gradient(70% 45% at 50% 100%, rgb(59 96 255 / 0.16) 0%, transparent 70%);
}
.pool--beam {
  background:
    radial-gradient(26% 70% at 50% 0%, rgb(137 181 252 / 0.2) 0%, transparent 80%),
    radial-gradient(36% 30% at 50% 100%, rgb(59 96 255 / 0.3) 0%, transparent 70%);
}
.pool--range { background: radial-gradient(80% 45% at 50% 55%, rgb(59 96 255 / 0.28) 0%, transparent 70%); }
.backdrop[data-light="electric"] .pool--electric,
.backdrop[data-light="light"] .pool--light,
.backdrop[data-light="beam"] .pool--beam,
.backdrop[data-light="range"] .pool--range { opacity: 1; }
.backdrop-grid {
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 0.045) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 0.045) 1px, transparent 1px);
  background-size: calc((100% - 2 * var(--gutter)) / 12) 25%;
  background-position: var(--gutter) 0;
  mask-image: radial-gradient(80% 70% at 50% 45%, #000 20%, transparent 80%);
}

/* Layers */
.layer {
  position: fixed; inset: 0; z-index: 3; pointer-events: none; opacity: 0; visibility: hidden;
  transition: opacity 0.45s var(--ease-out-3), visibility 0s linear 0.45s;
}
.layer.is-active { opacity: 1; visibility: visible; transition-delay: 0s; }
.layer :is(a, button) { pointer-events: auto; }

/* Type */
.display {
  font-family: var(--font-display); font-style: italic; font-weight: 500; text-transform: uppercase;
  line-height: 0.92; letter-spacing: -0.01em; text-wrap: balance;
}
.tabular { font-variant-numeric: tabular-nums; }

/* Buttons: square, white primary, outline secondary (brand book) */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 48px; padding: 0 20px;
  font-size: 14px; font-weight: 600; line-height: 1; white-space: nowrap;
  transition: background-color 0.25s, color 0.25s, box-shadow 0.25s, transform 0.2s;
}
.btn svg { width: 16px; height: 16px; flex: none; transition: transform 0.3s var(--ease-out-5); }
.btn-primary { background: #fff; color: var(--color-ink); }
.btn-outline { box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.6); color: #fff; }
.btn-square {
  display: grid; place-items: center; width: 48px; height: 48px; flex: none;
  box-shadow: inset 0 0 0 1px var(--hair-strong); transition: background-color 0.25s, color 0.25s, transform 0.2s;
}
.btn-square svg { width: 18px; height: 18px; }
.btn:active, .btn-square:active { transform: scale(0.98); }
@media (hover: hover) {
  .btn:hover svg { transform: translateX(3px); }
  .btn-primary:hover { background: var(--color-electric); color: #fff; }
  .btn-outline:hover, .btn-square:hover { background: #fff; color: var(--color-ink); }
}

/* Hover-dimming lists */
.dim-list > * { transition: opacity 0.25s; }
@media (hover: hover) { .dim-list:has(> :hover) > :not(:hover) { opacity: 0.3; } }

/* Rolling letters */
.roll { display: inline-flex; overflow: hidden; line-height: 1; }
.roll .ch { display: inline-block; position: relative; transition: transform 0.4s var(--ease-out-3); transition-delay: calc(var(--i) * 18ms); }
.roll .ch::after { content: attr(data-ch); position: absolute; left: 0; top: 100%; }
@media (hover: hover) { .roll-host:hover .roll .ch { transform: translateY(-100%); } }

/* Simple reveal for blocks SplitText should not split (lists, spec rows, actions) */
.fade { opacity: 0; transform: translateY(12px); transition: opacity 0.5s var(--ease-out-3), transform 0.6s var(--ease-out-3); }
.fade.is-on { opacity: 1; transform: none; }

/* Nav */
.nav {
  position: fixed; inset: 0 0 auto 0; z-index: 6; height: 96px; padding: 0 var(--gutter);
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; pointer-events: none;
  transform: translateY(-100%); transition: transform 0.9s var(--ease-out-3) 0.3s;
}
.nav.is-in { transform: none; }
.nav > * { pointer-events: auto; }
.nav-logo { justify-self: center; display: block; width: clamp(132px, 14vw, 200px); }
.nav-logo img { display: block; width: 100%; height: auto; }
.nav-right { justify-self: end; display: flex; align-items: center; gap: 24px; }
.nav-link { min-height: 44px; font-size: 14px; font-weight: 500; color: var(--muted); transition: color 0.2s; }
@media (hover: hover) { .nav-link:hover { color: #fff; } }
@media (max-width: 640px) {
  .nav { height: 72px; grid-template-columns: auto 1fr auto; gap: 12px; }
  .nav-right .nav-link { display: none; }
  .nav-right .btn { height: 40px; padding: 0 14px; font-size: 13px; }
  .nav-right .btn svg { display: none; }
}

/* Menu */
.menu-toggle { position: relative; z-index: 2; justify-self: start; display: inline-flex; align-items: center; gap: 12px; min-height: 48px; font-size: 14px; font-weight: 500; }
.menu-squares { display: grid; grid-template-columns: repeat(2, 5px); gap: 4px; }
.menu-squares i { width: 5px; height: 5px; background: #fff; transition: transform 0.3s var(--ease-out-5), opacity 0.3s; }
.menu-toggle[aria-expanded="true"] .menu-squares i:nth-child(2),
.menu-toggle[aria-expanded="true"] .menu-squares i:nth-child(3) { opacity: 0.3; }
@media (hover: hover) {
  .menu-toggle:hover .menu-squares i:nth-child(1) { transform: translate(-2px, -2px); }
  .menu-toggle:hover .menu-squares i:nth-child(4) { transform: translate(2px, 2px); }
}
.menu-panel {
  position: fixed; inset: 0; z-index: 1; overflow-y: auto; padding: 128px var(--gutter) 48px;
  display: flex; flex-direction: column; gap: 48px; background: rgb(17 17 17 / 0.97);
  clip-path: inset(0 0 100% 0); visibility: hidden;
  transition: clip-path 0.7s var(--ease-in-out-3), visibility 0s linear 0.7s;
}
.menu-panel.is-open { clip-path: inset(0); visibility: visible; transition-delay: 0s; }
.menu-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; padding-top: 32px; border-top: 1px solid var(--hair); }
.menu-group { opacity: 0; transform: translateY(16px); transition: transform 0.6s var(--ease-out-3), opacity 0.4s; }
.menu-panel.is-open .menu-group { opacity: 1; transform: none; }
.menu-panel.is-open .menu-group:nth-child(2) { transition-delay: 0.06s; }
.menu-panel.is-open .menu-group:nth-child(3) { transition-delay: 0.12s; }
.menu-group-title { margin-bottom: 16px; font-size: 13px; color: var(--color-light-blue); }
.menu-link {
  display: flex; align-items: baseline; gap: 14px; min-height: 44px; text-align: left;
  font-family: var(--font-display); font-style: italic; font-weight: 500; text-transform: uppercase;
  font-size: clamp(1.5rem, 2.4vw, 2.25rem); line-height: 1;
}
.menu-num { font-family: var(--font-sans); font-style: normal; font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
.menu-foot { display: flex; align-items: center; gap: 24px; }
@media (max-width: 860px) {
  .menu-panel { padding-top: 96px; }
  .menu-grid { grid-template-columns: 1fr; gap: 24px; }
}

/* Frame */
.frame { position: fixed; inset: 120px var(--gutter) 40px; z-index: 4; pointer-events: none; opacity: 0; transition: opacity 0.8s var(--ease-out-3) 0.5s; }
.frame.is-in { opacity: 1; }
.frame-corner { position: absolute; width: 14px; height: 14px; border: 0 solid var(--hair-strong); }
.frame-corner.tl { top: 0; left: 0; border-top-width: 1px; border-left-width: 1px; }
.frame-corner.tr { top: 0; right: 0; border-top-width: 1px; border-right-width: 1px; }
.frame-corner.bl { bottom: 0; left: 0; border-bottom-width: 1px; border-left-width: 1px; }
.frame-corner.br { bottom: 0; right: 0; border-bottom-width: 1px; border-right-width: 1px; }
.frame-count {
  position: absolute; right: 0; top: 50%; transform: translate(50%, -50%);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  font-size: 12px; font-weight: 500; color: var(--muted); font-variant-numeric: tabular-nums;
  opacity: 0; transition: opacity 0.4s;
}
.frame-count.is-on { opacity: 1; }
.frame-count-now { color: #fff; }
.frame-count-rule { width: 1px; height: 44px; background: var(--hair-strong); }
.progress-line { position: fixed; inset: 0 0 auto 0; z-index: 7; height: 2px; pointer-events: none; }
.progress-line i {
  display: block; height: 100%; background: var(--color-electric); transform-origin: 0 50%;
  transform: scaleX(var(--progress)); box-shadow: 0 0 10px rgb(59 96 255 / 0.9);
}
@media (max-width: 640px) {
  .frame { inset: 80px 16px 20px; }
  .frame-count { transform: translate(40%, -50%); }
}

/* Hero */
.hero-tagline { position: absolute; top: 148px; left: calc(var(--gutter) + 28px); max-width: 22ch; font-size: 13px; line-height: 1.5; color: var(--muted); }
.hero-title-block { position: absolute; inset: auto 0 clamp(70px, 10vh, 110px) 0; padding: 0 16px; display: flex; flex-direction: column; align-items: center; gap: 18px; }
.hero-name-row { display: flex; align-items: center; gap: clamp(16px, 3vw, 40px); }
.hero-title-stack { display: grid; place-items: center; min-width: 8ch; }
.hero-title-stack > * { grid-area: 1 / 1; }
.hero-title { font-size: clamp(2.4rem, 6.4vw, 6rem); text-align: center; }
.hero-meta { display: flex; align-items: center; gap: 14px; font-size: 15px; color: var(--color-light-blue); }
.hero-meta i { width: 4px; height: 4px; background: var(--color-light-blue); opacity: 0.6; }
.hero-meta-vial { color: var(--muted); font-variant-numeric: tabular-nums; }
.hero-track { display: flex; gap: 6px; }
.hero-track button { position: relative; width: 22px; height: 24px; }
.hero-track button::before {
  content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 2px; transform: translateY(-50%);
  background: rgb(255 255 255 / 0.22); transition: background-color 0.3s, height 0.3s;
}
.hero-track button[aria-pressed="true"]::before { height: 4px; background: var(--color-electric); box-shadow: 0 0 12px rgb(59 96 255 / 0.9); }
@media (hover: hover) { .hero-track button:not([aria-pressed="true"]):hover::before { background: rgb(255 255 255 / 0.6); } }
.hero-hint { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--muted); }
.hero-hint-line { position: relative; width: 1px; height: 22px; overflow: hidden; background: var(--hair-strong); }
.hero-hint-line::after { content: ""; position: absolute; left: 0; top: -100%; width: 1px; height: 100%; background: #fff; animation: drip 1.8s cubic-bezier(0.6, 0, 0.2, 1) infinite; }
@keyframes drip { to { top: 100%; } }
.hero-fallback { position: absolute; left: 50%; top: 44%; height: 46vh; width: auto; transform: translate(-50%, -50%); object-fit: contain; }
@media (max-width: 640px) {
  .hero-tagline { display: none; }
  .hero-name-row .btn-square { display: none; }
  .hero-meta { font-size: 13px; }
  .hero-track { gap: 4px; }
  .hero-track button { width: 20px; }
}

/* Product walk */
.product-ghost {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); pointer-events: none; white-space: nowrap;
  font-family: var(--font-display); font-style: italic; font-weight: 500; text-transform: uppercase;
  font-size: clamp(6rem, 19vw, 18rem); line-height: 0.86; letter-spacing: -0.02em;
  color: transparent; -webkit-text-stroke: 1px rgb(137 181 252 / 0.16);
  transition: opacity 0.4s;
}
.product-stack { position: absolute; left: calc(var(--gutter) + 28px); top: 50%; transform: translateY(-50%); width: min(400px, 32vw); display: grid; }
.product-stack > * { grid-area: 1 / 1; }
.product-panel { display: flex; flex-direction: column; gap: 22px; }
.product-name { font-size: clamp(2.6rem, 4.6vw, 4.4rem); }
.product-cat { margin-top: -8px; font-size: 15px; color: var(--color-light-blue); }
.product-about { max-width: 42ch; font-size: 16px; line-height: 1.625; color: rgb(255 255 255 / 0.84); }
.product-specs { border-top: 1px solid var(--hair); }
.product-specs > div { display: grid; grid-template-columns: 96px 1fr; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--hair); font-size: 14px; }
.product-specs dt { color: var(--muted); }
.product-specs dd { font-variant-numeric: tabular-nums; }
.product-focus { display: flex; flex-wrap: wrap; gap: 8px; }
.product-focus li { display: inline-flex; align-items: center; gap: 10px; height: 36px; padding: 0 14px 0 12px; box-shadow: inset 0 0 0 1px var(--hair-strong); font-size: 13px; font-weight: 500; }
.product-focus li::before { content: ""; width: 6px; height: 6px; background: var(--color-electric); box-shadow: 0 0 8px rgb(59 96 255 / 0.9); }
.product-actions { display: flex; flex-wrap: wrap; gap: 12px; }
.product-rail { position: absolute; right: calc(var(--gutter) + 28px); top: 50%; transform: translateY(-50%); }
.product-rail ol { display: flex; flex-direction: column; gap: 2px; text-align: right; }
.product-rail button { display: inline-flex; align-items: center; justify-content: flex-end; gap: 12px; min-height: 28px; font-size: 13px; color: rgb(255 255 255 / 0.5); transition: color 0.2s; }
.product-rail button::after { content: ""; width: 0; height: 1px; background: var(--color-electric); transition: width 0.35s var(--ease-out-5); }
.product-rail button[aria-current="true"] { color: #fff; }
.product-rail button[aria-current="true"]::after { width: 20px; }
@media (hover: hover) {
  .product-rail button:hover { color: rgb(255 255 255 / 0.85); }
  .product-rail button:not([aria-current="true"]):hover::after { width: 8px; }
}
.rail-num { width: 18px; font-size: 11px; font-variant-numeric: tabular-nums; }
.product-fallback { position: absolute; left: 50%; top: 52%; height: 56vh; width: auto; transform: translate(-50%, -50%) rotate(-12deg); }
@media (max-width: 860px) {
  .product-rail { display: none; }
  .product-ghost { top: 24%; }
  .product-stack { left: 20px; right: 20px; top: auto; bottom: 24px; width: auto; transform: none; }
  .product-panel { gap: 14px; }
  .product-about { font-size: 15px; }
  .product-actions .btn-outline { display: none; }
  .product-specs > div { grid-template-columns: 80px 1fr; padding: 9px 0; }
  .product-fallback { top: 24%; height: 30vh; }
}

/* Range */
.range-title { position: absolute; left: 0; right: 0; top: 18vh; text-align: center; font-size: clamp(2.4rem, 5vw, 4.5rem); }
.range-hover { position: absolute; left: 0; right: 0; bottom: 22vh; min-height: 1.5em; text-align: center; font-size: 15px; color: var(--color-light-blue); opacity: 0; transition: opacity 0.25s; }
.range-hover.is-on { opacity: 1; }
.range-links { position: absolute; left: var(--gutter); right: var(--gutter); bottom: 6vh; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 22px; font-size: 13px; color: var(--muted); }
.range-links a { display: inline-block; min-height: 28px; transition: color 0.2s; }
@media (hover: hover) { .range-links a:hover { color: #fff; } }
.range-fallback { position: absolute; top: 32vh; left: var(--gutter); right: var(--gutter); display: flex; justify-content: center; gap: 1vw; }
.range-fallback img { height: 22vh; width: auto; }

/* Closing */
.closing { position: relative; pointer-events: auto; background: linear-gradient(to bottom, transparent, var(--color-ink) 40vh); }
.closing-block { padding: 112px var(--gutter); }
.closing-title { font-size: clamp(2.6rem, 6vw, 5rem); }
.how { max-width: 1320px; margin: 0 auto; }
.how-steps { margin-top: 56px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--hair); }
.how-steps li { display: flex; flex-direction: column; gap: 12px; padding: 28px 28px 0 0; }
.how-steps li + li { padding-left: 28px; border-left: 1px solid var(--hair); }
.how-num { font-size: 12px; color: var(--color-light-blue); font-variant-numeric: tabular-nums; }
.how-steps h3 { font-size: 20px; font-weight: 600; line-height: 1.3; }
.how-steps p { max-width: 38ch; font-size: 15px; line-height: 1.625; color: rgb(255 255 255 / 0.78); }
.how-note { margin-top: 40px; font-size: 13px; color: var(--muted); }
.band { position: relative; display: flex; align-items: flex-end; min-height: 72vh; overflow: hidden; background: var(--color-electric); }
.band-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.28; mix-blend-mode: luminosity; }
.band-inner { position: relative; width: 100%; padding: 160px var(--gutter) 64px; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 32px; }
.band-mark { display: block; width: 64px; height: auto; margin-bottom: 24px; }
.band-title { font-size: clamp(3rem, 7vw, 6rem); }
.band-copy { margin-top: 16px; max-width: 40ch; font-size: 18px; line-height: 1.6; }
@media (hover: hover) { .band .btn-primary:hover { background: var(--color-ink); color: #fff; } }
.faq { max-width: 960px; margin: 0 auto; }
.faq-list { margin-top: 48px; }
.acc { border-top: 1px solid var(--hair); }
.acc > li { border-bottom: 1px solid var(--hair); }
.acc-button { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 24px; padding: 24px 0; text-align: left; font-size: clamp(18px, 2vw, 22px); font-weight: 500; }
.acc-icon { width: 20px; height: 20px; flex: none; transition: transform 0.5s var(--ease-out-3); }
.acc-button[aria-expanded="true"] .acc-icon { transform: rotate(45deg); }
.acc-panel { transition: grid-template-rows var(--acc-ms) var(--ease-out-3), visibility 0s linear var(--acc-delay); }
.acc-answer { max-width: 70ch; padding: 0 40px 24px 0; font-size: 16px; line-height: 1.625; color: rgb(255 255 255 / 0.78); }
.footer { display: flex; flex-direction: column; gap: 32px; padding: 64px var(--gutter) 48px; border-top: 1px solid var(--hair); }
.footer-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; }
.footer-logo { display: block; width: 220px; }
.footer-logo img { display: block; width: 100%; height: auto; }
.footer-social { display: flex; gap: 8px; }
.social { display: grid; place-items: center; width: 44px; height: 44px; box-shadow: inset 0 0 0 1px var(--hair-strong); transition: background-color 0.2s, color 0.2s; }
.social span { width: 18px; height: 18px; background: currentColor; -webkit-mask: var(--icon) center / contain no-repeat; mask: var(--icon) center / contain no-repeat; }
@media (hover: hover) { .social:hover { background: #fff; color: var(--color-ink); } }
.footer-links { display: flex; flex-wrap: wrap; gap: 8px 28px; font-size: 14px; }
.footer-links a { display: inline-block; min-height: 28px; }
.footer-legal { max-width: 90ch; font-size: 13px; line-height: 1.6; color: var(--muted); }
.footer-legal a { text-decoration: underline; text-underline-offset: 3px; }
.footer-copy { font-size: 12px; color: rgb(255 255 255 / 0.55); }
@media (max-width: 860px) {
  .closing-block { padding: 80px 20px; }
  .how-steps { grid-template-columns: 1fr; }
  .how-steps li { padding: 24px 0; }
  .how-steps li + li { padding-left: 0; border-left: 0; border-top: 1px solid var(--hair); }
  .band-inner { padding: 120px 20px 48px; }
}

/* Preloader */
.preloader {
  position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; align-content: center; gap: 28px;
  background: var(--color-ink); transition: opacity 0.8s var(--ease-out-3), visibility 0s linear 0.8s;
}
.preloader.is-leaving { opacity: 0; visibility: hidden; pointer-events: none; }
.preloader-mark { position: relative; width: 88px; }
.preloader-mark img { display: block; width: 100%; height: auto; }
.preloader-mark .is-ghost { opacity: 0.15; }
.preloader-mark .is-fill { position: absolute; inset: 0; clip-path: inset(calc((1 - var(--p)) * 100%) 0 0 0); transition: clip-path 0.3s var(--ease-out-3); }
.preloader-count { font-size: 13px; font-weight: 500; letter-spacing: 0.2em; color: var(--muted); font-variant-numeric: tabular-nums; }

@media (prefers-reduced-motion: reduce) {
  .hero-hint-line::after { animation: none; }
  .roll .ch { transition: none; }
  .fade { transform: none; transition: opacity 0.3s; }
  .menu-panel { clip-path: none; transition: opacity 0.2s, visibility 0s linear 0.2s; opacity: 0; }
  .menu-panel.is-open { opacity: 1; }
  .menu-group { transform: none; }
  .acc-panel { transition: none; }
}
```

- [ ] **Step 7: Fix any remaining references to removed Hiatus values**

```bash
grep -rn "SITE.cream\|SITE.tagline\|lib/og\|opengraph-image\|NeueKabel\|prepare-assets" app components lib scripts tests package.json
```

Expected: no output. If a hit remains, remove that reference (these files are all rewritten in Task 6; the goal here is only a passing type check).

- [ ] **Step 8: Run the checks and the build**

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

Expected: pass. The page will look broken until Task 6, because the Hiatus components still use classes that no longer exist. That is expected.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Add BB Peptides fonts, assets and the Ink design tokens

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Product data

**Files:**
- Create: `lib/products.ts`, `public/renders/*.webp` (12 files), `tests/products.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type CategorySlug = 'muscle-growth' | 'recovery-and-vitality' | 'neuro-and-cognitive'`
  - `type LightKind = 'electric' | 'light' | 'beam'`
  - `interface Product { id: string; name: string; short: string; category: CategorySlug; strength: string; vial: string; about: string; focus: readonly [string, string, string]; render: string }`
  - `CATEGORIES: Record<CategorySlug, { name: string; light: LightKind }>`, `CATEGORY_ORDER: readonly CategorySlug[]`
  - `PRODUCTS: readonly Product[]` (walk order), `PRODUCT_COUNT: number`
  - `SITE_ORIGIN`, `ASSESSMENT_URL` (strings)
  - `productUrl(p: Product): string`, `wrapIndex(i: number, n?: number): number`, `pad2(n: number): string`

- [ ] **Step 1: Copy the 12 vial renders (static fallback and sitemap images)**

The approved mockup already holds the trimmed vial renders, including the correct Semax / Selank vial (the brand-guide file of that name is the nasal spray).

```bash
mkdir -p public/renders
for id in cjc-1295-ipamorelin tesamorelin tesamorelin-ipamorelin mots-c bpc-157 tb-500 wolverine-blend epitalon thymosin-alpha-1 melanotan-ii semax-selank; do
  cp mockups/assets/$id.webp public/renders/$id.webp
done
cp mockups/assets/glow.webp public/renders/glow-blend.webp
ls public/renders | wc -l
```

Expected: `12`.

- [ ] **Step 2: Write the failing test**

`tests/products.test.ts`:

```ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ASSESSMENT_URL, CATEGORIES, PRODUCTS, PRODUCT_COUNT, pad2, productUrl, wrapIndex } from '@/lib/products';

// Same rules as slugify() in ../bodybuilding-peptides/src/utils-peptides/functions.ts, which builds the live URLs.
const slugify = (s: string) =>
  s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

describe('products', () => {
  it('lists the 12 vials in walk order', () => {
    expect(PRODUCT_COUNT).toBe(12);
    expect(PRODUCTS[0].name).toBe('CJC-1295 / Ipamorelin');
    expect(PRODUCTS[11].name).toBe('Semax / Selank');
  });

  it('uses the live site slugs and unique ids', () => {
    for (const p of PRODUCTS) expect(p.id).toBe(slugify(p.name));
    expect(new Set(PRODUCTS.map((p) => p.id)).size).toBe(12);
  });

  it('builds trybbpeptides.com product URLs', () => {
    for (const p of PRODUCTS) {
      expect(productUrl(p)).toMatch(/^https:\/\/www\.trybbpeptides\.com\/(muscle-growth|recovery-and-vitality|neuro-and-cognitive)\/[a-z0-9-]+$/);
    }
    expect(productUrl(PRODUCTS[3])).toBe('https://www.trybbpeptides.com/muscle-growth/mots-c');
    expect(ASSESSMENT_URL).toBe('https://intake.trybbpeptides.com/s/assessment');
  });

  it('has complete copy with no em dashes', () => {
    for (const p of PRODUCTS) {
      expect(p.focus).toHaveLength(3);
      for (const s of [p.name, p.short, p.strength, p.vial, p.about, ...p.focus]) {
        expect(s.trim().length).toBeGreaterThan(0);
        expect(s).not.toMatch(/[\u2014\u2013]/);
      }
      expect(p.about.length).toBeLessThan(200);
      expect(CATEGORIES[p.category]).toBeDefined();
    }
  });

  it('ships a render for every product', () => {
    for (const p of PRODUCTS) expect(existsSync(join(process.cwd(), 'public', p.render))).toBe(true);
  });

  it('wraps indices and pads numbers', () => {
    expect(wrapIndex(12)).toBe(0);
    expect(wrapIndex(-1)).toBe(11);
    expect(pad2(3)).toBe('03');
  });
});
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `npx vitest run tests/products.test.ts`
Expected: FAIL, cannot resolve `@/lib/products`.

- [ ] **Step 4: Write `lib/products.ts`**

```ts
// The 12 injectable vials, in walk order. Single source of truth for product facts.
// Sources: ../bodybuilding-peptides/src/db-peptides/products/*.ts (about text, focus bullets) and
// catalog-dosage.ts (supplied strength, not a dosing schedule). Descriptions are condensed from the
// about text and keep only claims it makes. Melanotan II has no catalog row: its strength is read
// off the product render and needs the client's confirmation.

export type CategorySlug = 'muscle-growth' | 'recovery-and-vitality' | 'neuro-and-cognitive';
export type LightKind = 'electric' | 'light' | 'beam';

export interface Product {
  id: string;
  name: string;
  /** Short display word for the ghosted outline behind the vial. */
  short: string;
  category: CategorySlug;
  strength: string;
  vial: string;
  about: string;
  focus: readonly [string, string, string];
  render: string;
}

export const SITE_ORIGIN = 'https://www.trybbpeptides.com';
export const ASSESSMENT_URL = 'https://intake.trybbpeptides.com/s/assessment';

export const CATEGORIES: Record<CategorySlug, { name: string; light: LightKind }> = {
  'muscle-growth': { name: 'Muscle Growth', light: 'electric' },
  'recovery-and-vitality': { name: 'Recovery & Vitality', light: 'light' },
  'neuro-and-cognitive': { name: 'Neuro & Cognitive', light: 'beam' },
};

export const CATEGORY_ORDER: readonly CategorySlug[] = ['muscle-growth', 'recovery-and-vitality', 'neuro-and-cognitive'];

const render = (id: string) => `/renders/${id}.webp`;

export const PRODUCTS: readonly Product[] = [
  {
    id: 'cjc-1295-ipamorelin', name: 'CJC-1295 / Ipamorelin', short: 'CJC-1295', category: 'muscle-growth',
    strength: '1.5 mg / 2.5 mg per mL', vial: '6 mL',
    about: 'Complementary peptides used together in physician-directed protocols that support the body’s natural growth hormone production.',
    focus: ['Growth Hormone Production', 'Recovery Support', 'Body Composition'], render: render('cjc-1295-ipamorelin'),
  },
  {
    id: 'tesamorelin', name: 'Tesamorelin', short: 'Tesamorelin', category: 'muscle-growth',
    strength: '3 mg/mL', vial: '5 mL',
    about: 'A synthetic peptide that supports the body’s natural release of growth hormone, used in physician-guided plans for select metabolic and body composition goals.',
    focus: ['Growth Hormone Support', 'Lean Muscle Preservation', 'Metabolic Health'], render: render('tesamorelin'),
  },
  {
    id: 'tesamorelin-ipamorelin', name: 'Tesamorelin / Ipamorelin', short: 'Tesa / Ipa', category: 'muscle-growth',
    strength: '3 mg / 2 mg per mL', vial: '5 mL',
    about: 'Tesamorelin and Ipamorelin in one physician-guided protocol designed to support the body’s natural growth hormone signaling.',
    focus: ['Growth Hormone Signaling', 'Recovery Support', 'Body Composition'], render: render('tesamorelin-ipamorelin'),
  },
  {
    id: 'mots-c', name: 'MOTS-C', short: 'MOTS-C', category: 'muscle-growth',
    strength: '2 mg/mL', vial: '5 mL',
    about: 'A naturally occurring mitochondrial peptide associated with cellular energy production and metabolic health.',
    focus: ['Cellular Energy', 'Exercise Performance', 'Healthy Aging'], render: render('mots-c'),
  },
  {
    id: 'bpc-157', name: 'BPC-157', short: 'BPC-157', category: 'recovery-and-vitality',
    strength: '3 mg/mL', vial: '5 mL',
    about: 'A synthetic peptide that has gained attention for its potential role in supporting the body’s natural healing and recovery processes.',
    focus: ['Natural Healing', 'Recovery & Mobility', 'Tissue Health'], render: render('bpc-157'),
  },
  {
    id: 'tb-500', name: 'TB-500', short: 'TB-500', category: 'recovery-and-vitality',
    strength: '10 mg / 3 mL', vial: '3 mL',
    about: 'A synthetic peptide often included in physician-guided protocols focused on recovery, mobility and tissue health.',
    focus: ['Recovery & Mobility', 'Tissue Health', 'Physical Performance'], render: render('tb-500'),
  },
  {
    id: 'wolverine-blend', name: 'Wolverine Blend', short: 'Wolverine', category: 'recovery-and-vitality',
    strength: '1.66 mg / 3.33 mg per mL', vial: '3 mL',
    about: 'BPC-157 and TB-500 in one formulation, used in physician-guided programs focused on recovery, mobility and tissue health.',
    focus: ['Recovery & Mobility', 'Tissue Health', 'Active Lifestyle'], render: render('wolverine-blend'),
  },
  {
    id: 'glow-blend', name: 'Glow Blend', short: 'Glow', category: 'recovery-and-vitality',
    strength: '9 mg / 1.66 mg / 3.33 mg per mL', vial: '3 mL',
    about: 'GHK-Cu, BPC-157 and TB-500 in a physician-directed formulation designed to support skin health, tissue recovery and overall rejuvenation.',
    focus: ['Skin Health', 'Tissue Recovery', 'Overall Rejuvenation'], render: render('glow-blend'),
  },
  {
    id: 'epitalon', name: 'Epitalon', short: 'Epitalon', category: 'recovery-and-vitality',
    strength: '2 mg/mL', vial: '5 mL',
    about: 'A synthetic peptide of interest in healthy aging medicine for its potential role in supporting cellular health and overall wellness.',
    focus: ['Cellular Health', 'Healthy Aging', 'Long-Term Vitality'], render: render('epitalon'),
  },
  {
    id: 'thymosin-alpha-1', name: 'Thymosin Alpha-1', short: 'Thymosin', category: 'recovery-and-vitality',
    strength: '5 mg/mL', vial: '5 mL',
    about: 'A naturally occurring peptide involved in supporting normal immune system function, used in physician-directed wellness programs.',
    focus: ['Immune Function', 'Immune Health', 'Overall Resilience'], render: render('thymosin-alpha-1'),
  },
  {
    id: 'melanotan-ii', name: 'Melanotan II', short: 'Melanotan', category: 'recovery-and-vitality',
    strength: '2 mg / 1 mL', vial: '5 mL',
    about: 'A synthetic peptide that may support the skin’s natural tanning response by stimulating melanin production.',
    focus: ['Melanin Production', 'Even Skin Tone', 'Personalized Tanning'], render: render('melanotan-ii'),
  },
  {
    id: 'semax-selank', name: 'Semax / Selank', short: 'Semax', category: 'neuro-and-cognitive',
    strength: '1 mg / 1 mg per mL', vial: '5 mL',
    about: 'Semax and Selank in one physician-guided protocol, for cognitive performance, focus and stress management.',
    focus: ['Cognitive Performance', 'Focus', 'Stress Management'], render: render('semax-selank'),
  },
];

export const PRODUCT_COUNT = PRODUCTS.length;

export function productUrl(p: Product): string {
  return `${SITE_ORIGIN}/${p.category}/${p.id}`;
}

export function wrapIndex(i: number, n: number = PRODUCT_COUNT): number {
  return ((i % n) + n) % n;
}

export const pad2 = (n: number): string => String(n).padStart(2, '0');
```

- [ ] **Step 5: Run the test**

Run: `npx vitest run tests/products.test.ts`
Expected: PASS.

- [ ] **Step 6: Full checks and commit**

```bash
npm test && npx tsc --noEmit && npm run lint
git add lib/products.ts tests/products.test.ts public/renders
git commit -m "Add the 12 vial products and their renders

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Walk math

**Files:**
- Create: `lib/stage/walk.ts`, `tests/walk.test.ts`

**Interfaces:**
- Consumes: `CATEGORIES`, `CategorySlug`, `LightKind` from `lib/products.ts`.
- Produces:
  - `TAU: number`
  - `spinAngle(walk: number): number` (radians added to the focus vial's Y rotation, `2π × frac(walk)`)
  - `spinPhase(walk: number): number` (0 at whole products, 1 mid-spin)
  - `labelTarget(walk: number, own: number, count: number): number`
  - `dipScale(walk: number): number` (reduced-motion scale, 1 at whole products, 0.15 mid-swap)
  - `facesAway(ry: number): boolean`
  - `type LightMix = Record<LightKind, number>`; `lightMix(walk: number, categories: readonly CategorySlug[]): LightMix`

- [ ] **Step 1: Write the failing test**

`tests/walk.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '@/lib/products';
import { dipScale, facesAway, labelTarget, lightMix, spinAngle, spinPhase } from '@/lib/stage/walk';

const CATS = PRODUCTS.map((p) => p.category);

describe('spin', () => {
  it('turns once per product and is half a turn at every swap point', () => {
    expect(spinAngle(0)).toBe(0);
    expect(spinAngle(3.25)).toBeCloseTo(Math.PI / 2);
    for (let k = -1; k < 12; k++) expect(spinAngle(k + 0.5)).toBeCloseTo(Math.PI);
  });
  it('phases from 0 at a product to 1 mid-spin', () => {
    expect(spinPhase(4)).toBeCloseTo(0);
    expect(spinPhase(4.5)).toBeCloseTo(1);
    expect(spinPhase(-0.5)).toBeCloseTo(1);
  });
});

describe('labelTarget', () => {
  it('shows the vial’s own product outside the walk', () => {
    expect(labelTarget(-1, 7, 12)).toBe(7);
    expect(labelTarget(-0.6, 7, 12)).toBe(7);
    expect(labelTarget(11.6, 7, 12)).toBe(7);
    expect(labelTarget(12, 7, 12)).toBe(7);
  });
  it('shows the walk product inside it, changing exactly at the half turns', () => {
    expect(labelTarget(-0.4, 7, 12)).toBe(0);
    expect(labelTarget(4.49, 7, 12)).toBe(4);
    expect(labelTarget(4.51, 7, 12)).toBe(5);
    expect(labelTarget(11.4, 7, 12)).toBe(11);
  });
});

describe('reduced-motion dip', () => {
  it('is full size at a product and smallest at a swap', () => {
    expect(dipScale(3)).toBeCloseTo(1);
    expect(dipScale(3.5)).toBeCloseTo(0.15);
    expect(dipScale(-0.5)).toBeCloseTo(0.15);
  });
});

describe('facesAway', () => {
  it('is true only when the label points away from the camera', () => {
    expect(facesAway(Math.PI)).toBe(true);
    expect(facesAway(3 * Math.PI)).toBe(true);
    expect(facesAway(0)).toBe(false);
    expect(facesAway(Math.PI / 2)).toBe(false);
  });
});

describe('lightMix', () => {
  const sum = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);
  it('is pure on a product and blends only across a category boundary', () => {
    expect(lightMix(0, CATS)).toEqual({ electric: 1, light: 0, beam: 0 });
    expect(lightMix(2.5, CATS)).toEqual({ electric: 1, light: 0, beam: 0 });
    const m = lightMix(3.5, CATS); // MOTS-C to BPC-157
    expect(m.electric).toBeCloseTo(0.5);
    expect(m.light).toBeCloseTo(0.5);
    expect(lightMix(11, CATS).beam).toBe(1);
  });
  it('clamps outside the walk and always sums to 1', () => {
    expect(lightMix(-1, CATS).electric).toBe(1);
    expect(lightMix(12, CATS).beam).toBe(1);
    for (let w = -1; w <= 12; w += 0.13) expect(sum(lightMix(w, CATS))).toBeCloseTo(1);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/walk.test.ts`
Expected: FAIL, cannot resolve `@/lib/stage/walk`.

- [ ] **Step 3: Write `lib/stage/walk.ts`**

```ts
import { CATEGORIES, type CategorySlug, type LightKind } from '@/lib/products';

// The walk is one continuous timeline value: -1 on the hero, 0 to 11 across the product sections,
// 12 on the range row. The focus vial turns once per unit, so every half unit, where round(walk)
// changes product, is the moment its label faces straight away from the camera.

export const TAU = Math.PI * 2;

const frac = (x: number) => x - Math.floor(x);

export function spinAngle(walk: number): number {
  return TAU * frac(walk);
}

export function spinPhase(walk: number): number {
  return Math.sin(Math.PI * frac(walk));
}

export function labelTarget(walk: number, own: number, count: number): number {
  // + 0 turns Math.round(-0.4) = -0 into 0.
  const i = Math.round(walk) + 0;
  return i >= 0 && i < count ? i : own;
}

export function dipScale(walk: number): number {
  return 0.15 + 0.85 * Math.abs(Math.cos(Math.PI * walk));
}

export function facesAway(ry: number): boolean {
  return Math.cos(ry) < -0.2;
}

export type LightMix = Record<LightKind, number>;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Category lighting: pure on each product, blended over the middle half of a step that crosses categories.
export function lightMix(walk: number, categories: readonly CategorySlug[]): LightMix {
  const last = categories.length - 1;
  const w = Math.min(last, Math.max(0, walk));
  const i0 = Math.floor(w);
  const i1 = Math.min(last, i0 + 1);
  const s = smoothstep(0.25, 0.75, w - i0);
  const mix: LightMix = { electric: 0, light: 0, beam: 0 };
  mix[CATEGORIES[categories[i0]].light] += 1 - s;
  mix[CATEGORIES[categories[i1]].light] += s;
  return mix;
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/walk.test.ts`
Expected: PASS.

- [ ] **Step 5: Full checks and commit**

```bash
npm test && npx tsc --noEmit && npm run lint
git add lib/stage/walk.ts tests/walk.test.ts
git commit -m "Add the walk math: spin, label target, dip and category light

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 5: Vial model and canvas labels

**Files:**
- Create: `lib/stage/ProductModel.ts`, `lib/stage/Vial.ts`, `lib/stage/label.ts`, `tests/vial.test.ts`, `tests/label.test.ts`

**Interfaces:**
- Consumes: `Product`, `CATEGORIES` from `lib/products.ts`.
- Produces:
  - `interface ProductModel { readonly group: THREE.Group; readonly labelIndex: number; setLabel(index: number): void; dispose(): void }`
  - `type Quality = 'high' | 'low'`
  - Constants `VIAL_R`, `LABEL_H`, `LABEL_ASPECT`, `LABEL_FRONT_OFFSET`, `VIAL_SCALE`, `VIAL_HEIGHT`
  - `createVialGeometries(): VialGeometries`, `createVialMaterials(q: Quality): VialMaterials`
  - `class VialModel implements ProductModel { constructor(geo: VialGeometries, mats: VialMaterials, labels: readonly THREE.Texture[], own: number) }`
  - `labelLines(name: string): string[]`, `drawLabel(ctx, p, w, h, family): void`, `createLabelTexture(p: Product, width: number, family: string, anisotropy: number): THREE.CanvasTexture`

- [ ] **Step 1: Write the failing tests**

`tests/label.test.ts`:

```ts
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
```

`tests/vial.test.ts`:

```ts
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { VIAL_HEIGHT, VIAL_R, VialModel, createVialGeometries, createVialMaterials } from '@/lib/stage/Vial';

const box = (g: THREE.BufferGeometry) => {
  g.computeBoundingBox();
  return g.boundingBox!;
};

describe('vial geometry', () => {
  const geo = createVialGeometries();
  it('stacks glass, crimp and cap from the bottom up', () => {
    expect(box(geo.glass).min.y).toBeCloseTo(0, 1);
    expect(box(geo.crimp).min.y).toBeGreaterThan(box(geo.glass).max.y - 0.1);
    expect(box(geo.cap).min.y).toBeGreaterThanOrEqual(box(geo.crimp).max.y - 1e-6);
    expect(box(geo.cap).max.y).toBeCloseTo(VIAL_HEIGHT);
  });
  it('wraps the label just outside the glass', () => {
    expect(box(geo.label).max.x).toBeGreaterThan(VIAL_R);
    expect(box(geo.glass).max.x).toBeLessThanOrEqual(VIAL_R + 1e-6);
  });
});

describe('VialModel', () => {
  it('starts on its own label and swaps the map in place', () => {
    const labels = [new THREE.Texture(), new THREE.Texture(), new THREE.Texture()];
    const mats = createVialMaterials('low');
    const m = new VialModel(createVialGeometries(), mats, labels, 1);
    expect(m.labelIndex).toBe(1);
    const labelMesh = m.group.getObjectsByProperty('name', 'label')[0] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    expect(labelMesh.material.map).toBe(labels[1]);
    m.setLabel(2);
    expect(m.labelIndex).toBe(2);
    expect(labelMesh.material.map).toBe(labels[2]);
    m.dispose();
    mats.dispose();
  });
  it('centers the vial on its origin', () => {
    const m = new VialModel(createVialGeometries(), createVialMaterials('low'), [new THREE.Texture()], 0);
    const b = new THREE.Box3().setFromObject(m.group);
    expect(Math.abs(b.min.y + b.max.y)).toBeLessThan(0.05);
  });
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run tests/label.test.ts tests/vial.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Write `lib/stage/ProductModel.ts`**

```ts
import type * as THREE from 'three';

// What the carousel and stage know about a product object. The procedural vial implements it today;
// a Blender model per packaging type (capsule bottle, nasal spray) can implement it later.
export interface ProductModel {
  /** Posed every frame by the carousel: position, rotation and scale. */
  readonly group: THREE.Group;
  /** Index into PRODUCTS of the label currently shown. */
  readonly labelIndex: number;
  setLabel(index: number): void;
  dispose(): void;
}
```

- [ ] **Step 4: Write `lib/stage/Vial.ts`**

```ts
import * as THREE from 'three';
import type { ProductModel } from './ProductModel';

export type Quality = 'high' | 'low';

// A 5 mL serum vial in model units: body radius 0.5, base at y = 0. The client's renders are about
// 2:1 tall to wide, with the label over the lower two thirds of the body.
export const VIAL_R = 0.5;
const LABEL_Y0 = 0.14;
const LABEL_Y1 = 0.88;
export const LABEL_H = LABEL_Y1 - LABEL_Y0;
const LABEL_R = VIAL_R + 0.006;
export const LABEL_ASPECT = (2 * Math.PI * LABEL_R) / LABEL_H;
// Canvas labels are drawn with the front panel centered; this turns it to face +z at ry = 0.
export const LABEL_FRONT_OFFSET = 0.5;
export const VIAL_HEIGHT = 1.86;
// Scales the vial to roughly the Hiatus can's height, so the carousel, row and camera keep their framing.
export const VIAL_SCALE = 1.3;

// Profiles as (radius, height) pairs, bottom to top so normals face out.
const GLASS: [number, number][] = [
  [0, 0.03], [0.3, 0.02], [0.42, 0], [0.48, 0.02], [0.5, 0.07], [0.5, 1.16],
  [0.49, 1.22], [0.45, 1.29], [0.36, 1.36], [0.3, 1.41], [0.29, 1.46], [0.29, 1.52],
];
const CRIMP: [number, number][] = [
  [0.29, 1.5], [0.35, 1.5], [0.37, 1.52], [0.37, 1.68], [0.35, 1.7], [0.3, 1.7],
];
const CAP: [number, number][] = [
  [0.3, 1.7], [0.39, 1.7], [0.405, 1.72], [0.41, 1.78], [0.405, 1.82], [0.37, 1.85], [0.3, VIAL_HEIGHT], [0, VIAL_HEIGHT],
];

export interface VialGeometries {
  glass: THREE.LatheGeometry;
  crimp: THREE.LatheGeometry;
  cap: THREE.LatheGeometry;
  label: THREE.CylinderGeometry;
  dispose(): void;
}

const lathe = (pts: [number, number][], segments = 96) =>
  new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), segments);

export function createVialGeometries(): VialGeometries {
  const label = new THREE.CylinderGeometry(LABEL_R, LABEL_R, LABEL_H, 128, 1, true);
  label.translate(0, (LABEL_Y0 + LABEL_Y1) / 2, 0);
  const g = { glass: lathe(GLASS, 128), crimp: lathe(CRIMP), cap: lathe(CAP), label };
  return { ...g, dispose: () => Object.values(g).forEach((x) => x.dispose()) };
}

export interface VialMaterials {
  glass: THREE.Material;
  /** Inner surface of the far wall, high tier only: gives the glass its thickness. */
  glassBack: THREE.Material | null;
  crimp: THREE.MeshStandardMaterial;
  cap: THREE.MeshStandardMaterial;
  label(map: THREE.Texture): THREE.MeshStandardMaterial;
  dispose(): void;
}

// Reflection-only glass: black with additive blending, so only the studio highlights render and
// the Ink page and its light pools show through. Transmission would render the transparent page as black.
function glassMaterial(high: boolean, side: THREE.Side, intensity: number): THREE.Material {
  const common = {
    color: 0x000000, roughness: 0.04, metalness: 0, envMapIntensity: intensity,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side,
  };
  return high
    ? new THREE.MeshPhysicalMaterial({ ...common, clearcoat: 1, clearcoatRoughness: 0.03 })
    : new THREE.MeshStandardMaterial(common);
}

export function createVialMaterials(quality: Quality): VialMaterials {
  const high = quality === 'high';
  const glass = glassMaterial(high, THREE.FrontSide, 2.4);
  const glassBack = high ? glassMaterial(true, THREE.BackSide, 0.9) : null;
  const crimp = new THREE.MeshStandardMaterial({ color: 0xd9dde4, metalness: 1, roughness: 0.22 });
  const cap = high
    ? new THREE.MeshPhysicalMaterial({ color: 0x3b60ff, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.2 })
    : new THREE.MeshStandardMaterial({ color: 0x3b60ff, roughness: 0.4 });
  const label = (map: THREE.Texture) =>
    high
      ? new THREE.MeshPhysicalMaterial({ map, roughness: 0.5, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.3 })
      : new THREE.MeshStandardMaterial({ map, roughness: 0.55, metalness: 0 });
  return {
    glass,
    glassBack,
    crimp,
    cap,
    label,
    dispose: () => [glass, glassBack, crimp, cap].forEach((m) => m?.dispose()),
  };
}

export class VialModel implements ProductModel {
  readonly group = new THREE.Group();
  private readonly labelMat: THREE.MeshStandardMaterial;
  private current: number;

  constructor(geo: VialGeometries, mats: VialMaterials, private readonly labels: readonly THREE.Texture[], own: number) {
    this.current = own;
    this.labelMat = mats.label(labels[own]);
    const label = new THREE.Mesh(geo.label, this.labelMat);
    label.name = 'label';
    const inner = new THREE.Group();
    // Opaque parts first; the additive glass shells draw last, over them.
    inner.add(label, new THREE.Mesh(geo.crimp, mats.crimp), new THREE.Mesh(geo.cap, mats.cap));
    if (mats.glassBack) {
      const back = new THREE.Mesh(geo.glass, mats.glassBack);
      back.renderOrder = 1;
      inner.add(back);
    }
    const front = new THREE.Mesh(geo.glass, mats.glass);
    front.renderOrder = 2;
    inner.add(front);
    inner.position.y = -VIAL_HEIGHT / 2;
    const holder = new THREE.Group();
    holder.scale.setScalar(VIAL_SCALE);
    holder.add(inner);
    this.group.add(holder);
    this.group.rotation.order = 'XZY';
  }

  get labelIndex(): number {
    return this.current;
  }

  setLabel(index: number) {
    if (index === this.current) return;
    this.current = index;
    // Every label texture shares one format, so swapping the map needs no shader recompile.
    this.labelMat.map = this.labels[index];
  }

  dispose() {
    this.labelMat.dispose();
  }
}
```

- [ ] **Step 5: Write `lib/stage/label.ts`**

```ts
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
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run tests/label.test.ts tests/vial.test.ts`
Expected: PASS. If `centers the vial` fails, check `inner.position.y` against `VIAL_HEIGHT`; if the stacking test fails, compare the `GLASS`, `CRIMP` and `CAP` heights.

- [ ] **Step 7: Full checks and commit**

```bash
npm test && npx tsc --noEmit && npm run lint
git add lib/stage/ProductModel.ts lib/stage/Vial.ts lib/stage/label.ts tests/vial.test.ts tests/label.test.ts
git commit -m "Add the procedural vial behind a ProductModel interface, with canvas labels

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Switch the 3D and scroll core to BB Peptides

This task replaces every flavor and can reference in one move, because the scene values, sections, store and stage depend on each other. At the end, the page is the 3D scene only: 12 vials in the hero carousel, the walk, the range row, the preloader and paging. The HTML layers come back in Tasks 7 to 11.

**Files:**
- Replace: `lib/scroll/sections.ts`, `lib/stage/values.ts`, `lib/stage/keyframes.ts`, `lib/stage/layout.ts`, `lib/stage/Carousel.ts`, `lib/stage/Stage.ts`, `lib/stage/Lights.ts`, `lib/store.ts`, `lib/debug.ts`, `lib/boot.ts`, `app/page.tsx`, `components/sections/Preloader.tsx`, `components/dev/StageTest.tsx`
- Create: `lib/timeout.ts`, `tests/timeout.test.ts`, `tests/sections.test.ts`, `tests/carousel.test.ts`
- Modify: `lib/scroll/Pager.ts` (durations), `lib/stage/Studio.ts` (cool tints), `tests/layout.test.ts`, `tests/timeline.test.ts`, `tests/scroll-math.test.ts`, `tests/debug.test.ts`, `tests/store.test.ts`
- Delete: `lib/flavors.ts`, `lib/content.ts`, `lib/email.ts`, `lib/persist.ts`, `lib/structured-data.ts`, `lib/stage/Can.ts`, `lib/stage/spots.ts`, `components/GradientWaves.tsx`, `components/Backdrop.tsx`, `components/sections/{HeroLayer,ProfileLayer,BenefitsLayer,StatementLayer,ClaimRail,Newsletter,FaqSection,Footer}.tsx`, `components/chrome/{Nav,Menu}.tsx`, `components/ui/{icons,Accordion}.tsx`, `app/sitemap.ts`, `tests/{can,flavors,spots,email,persist}.test.ts`

**Interfaces:**
- Consumes: Tasks 3 to 5 (`PRODUCTS`, `PRODUCT_COUNT`, `productUrl`, `wrapIndex`, `CATEGORIES`; walk functions; `VialModel`, `createVialGeometries`, `createVialMaterials`, `createLabelTexture`, `ProductModel`, `Quality`).
- Produces (later tasks rely on these exact names):
  - `lib/scroll/sections.ts`: `SECTIONS`, `SectionId`, `LAST`, `RANGE` (13), `CLOSING` (14), `FIRST_PRODUCT` (1), `LAST_PRODUCT` (12), `WALK_SECTIONS: number[]`, `sectionForProduct(i): number`, `productForSection(s): number | null`, `pageDuration(from, to): number`, `sectionIndex(id): number`
  - `lib/store.ts`: `store`, `useApp`, `AppState { product; productSource: 'ui' | 'stage'; section; hover: number | null; loaded; ready; entered; menuOpen; webgl }`, `selectProduct(i)`
  - `lib/scroll/instance.ts` (unchanged here): `goToSection(i)`
  - `Stage`: `product`, `setProduct(i)`, `step(n)`, `drag(px)`, `release()`, `hitCenter(x, y)`, `hitProduct(x, y): number | null`, `setHover(i | null)`
  - `lib/timeout.ts`: `withTimeout<T>(p: Promise<T>, ms: number): Promise<T>`

- [ ] **Step 1: Delete the Hiatus-only modules, components and tests**

```bash
git rm -q lib/flavors.ts lib/content.ts lib/email.ts lib/persist.ts lib/structured-data.ts lib/stage/Can.ts lib/stage/spots.ts \
  components/GradientWaves.tsx components/Backdrop.tsx \
  components/sections/HeroLayer.tsx components/sections/ProfileLayer.tsx components/sections/BenefitsLayer.tsx \
  components/sections/StatementLayer.tsx components/sections/ClaimRail.tsx components/sections/Newsletter.tsx \
  components/sections/FaqSection.tsx components/sections/Footer.tsx components/chrome/Nav.tsx components/chrome/Menu.tsx \
  components/ui/icons.tsx components/ui/Accordion.tsx app/sitemap.ts \
  tests/can.test.ts tests/flavors.test.ts tests/spots.test.ts tests/email.test.ts tests/persist.test.ts
```

- [ ] **Step 2: Write the new section tests (failing)**

`tests/sections.test.ts`:

```ts
import { expect, it } from 'vitest';
import {
  CLOSING, FIRST_PRODUCT, LAST, LAST_PRODUCT, RANGE, SECTIONS, WALK_SECTIONS, pageDuration, productForSection, sectionForProduct,
} from '@/lib/scroll/sections';

it('lays out hero, 12 products, range and closing', () => {
  expect(SECTIONS).toHaveLength(15);
  expect(SECTIONS[0]).toBe('hero');
  expect(SECTIONS[FIRST_PRODUCT]).toBe('p01');
  expect(SECTIONS[LAST_PRODUCT]).toBe('p12');
  expect(RANGE).toBe(13);
  expect(CLOSING).toBe(14);
  expect(LAST).toBe(14);
  expect(WALK_SECTIONS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

it('maps products to sections and back', () => {
  expect(sectionForProduct(0)).toBe(1);
  expect(sectionForProduct(11)).toBe(12);
  expect(productForSection(1)).toBe(0);
  expect(productForSection(12)).toBe(11);
  expect(productForSection(0)).toBeNull();
  expect(productForSection(RANGE)).toBeNull();
});

it('pages slowly into and out of the walk, quickly between products, longer for jumps', () => {
  expect(pageDuration(0, 1)).toBe(1.4);
  expect(pageDuration(1, 0)).toBe(1.4);
  expect(pageDuration(12, 13)).toBe(1.4);
  expect(pageDuration(2, 3)).toBe(0.9);
  expect(pageDuration(2, 9)).toBeCloseTo(1.8);
  expect(pageDuration(0, 12)).toBe(2.4);
});
```

`tests/timeout.test.ts`:

```ts
import { afterEach, expect, it, vi } from 'vitest';
import { withTimeout } from '@/lib/timeout';

afterEach(() => vi.useRealTimers());

it('resolves when the promise wins', async () => {
  await expect(withTimeout(Promise.resolve(3), 100)).resolves.toBe(3);
});

it('rejects a stalled promise after the timeout', async () => {
  vi.useFakeTimers();
  const p = withTimeout(new Promise(() => {}), 8000);
  vi.advanceTimersByTime(8000);
  await expect(p).rejects.toThrow('timeout');
});
```

Run: `npx vitest run tests/sections.test.ts tests/timeout.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write `lib/scroll/sections.ts` and `lib/timeout.ts`**

`lib/scroll/sections.ts`:

```ts
export const SECTIONS = [
  'hero', 'p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10', 'p11', 'p12', 'range', 'closing',
] as const;

export type SectionId = (typeof SECTIONS)[number];

export const LAST = SECTIONS.length - 1;
export const RANGE = SECTIONS.indexOf('range');
export const CLOSING = SECTIONS.indexOf('closing');
export const FIRST_PRODUCT = 1;
export const LAST_PRODUCT = 12;
export const WALK_SECTIONS = Array.from({ length: LAST_PRODUCT - FIRST_PRODUCT + 1 }, (_, i) => FIRST_PRODUCT + i);

export const sectionForProduct = (i: number): number => FIRST_PRODUCT + i;

export function productForSection(s: number): number | null {
  return s >= FIRST_PRODUCT && s <= LAST_PRODUCT ? s - FIRST_PRODUCT : null;
}

// Into and out of the walk the camera travels, so those pages take longer. Jumps across several
// products add time so each spin stays readable.
export function pageDuration(from: number, to: number): number {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const base = lo === 0 || hi === RANGE ? 1.4 : 0.9;
  return Math.min(2.4, base + 0.15 * (hi - lo - 1));
}

export const sectionIndex = (id: SectionId): number => SECTIONS.indexOf(id);
```

`lib/timeout.ts`:

```ts
// Rejects with Error('timeout') when p has not settled after ms. Used so a stalled 3D chunk or
// label build can never strand the visitor on the preloader.
export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}
```

Run: `npx vitest run tests/sections.test.ts tests/timeout.test.ts`
Expected: PASS.

- [ ] **Step 4: Update `lib/scroll/Pager.ts` to the two-ended duration**

In `animateTo`, read the current section before overwriting it:

```ts
  private animateTo(to: number, scroll: number) {
    const from = this.current;
    this.locked = true;
    this.current = to;
    this.opts.onSection(to);
    this.lenis.scrollTo(scroll, {
      duration: pageDuration(from, to),
```

Leave the rest of the method unchanged. Then add, at the end of the class before `private onScroll`, a method used by the nav's FAQ link in Task 7:

```ts
  scrollToElement(el: HTMLElement) {
    this.lenis.scrollTo(el, { offset: -96, duration: 1.6, force: true });
  }
```

- [ ] **Step 5: Replace `lib/stage/values.ts`**

```ts
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
  // -1 on the hero, 0 to 11 across the product sections, 12 on the range row (see lib/stage/walk.ts).
  walk: -1,
};

export type SceneValues = typeof DEFAULT_VALUES;
export type ValueKey = keyof SceneValues;
export const VALUE_KEYS = Object.keys(DEFAULT_VALUES) as ValueKey[];
```

- [ ] **Step 6: Replace `lib/stage/keyframes.ts`**

```ts
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
    return { camY: 0, camZ: 19, row: 1, rigY: 1, stageLight: 0, key: 1.5, rim: 1.8, fogNear: 26, fogFar: 52, walk: PRODUCT_COUNT };
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
  else if (id !== 'range') Object.assign(f, { camZ: 8.6, focusX: 0, focusY: 0.95 });
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
```

- [ ] **Step 7: Replace `lib/stage/layout.ts`**

```ts
import { wrapIndex } from '@/lib/products';
import type { SceneValues } from './values';

export interface Pose { x: number; y: number; z: number; rx: number; ry: number; rz: number }

// Center-to-center distance in the range row. A vial is about 1.3 units wide (VIAL_SCALE).
export const ROW_GAP = 1.5;

export function wrapOffset(slot: number, pos: number, count: number): number {
  const half = count / 2;
  let o = (slot - pos) % count;
  if (o < -half) o += count;
  else if (o >= half) o -= count;
  return o;
}

// Hero ring: a gentle rising wave, sides pushed back. Every angle is a smooth function of the
// offset, so a vial rolls, leans and turns its label as it travels through the slots.
export function carouselPose(o: number, v: Pick<SceneValues, 'spacing' | 'wave' | 'tilt' | 'depth'>): Pose {
  const a = Math.abs(o);
  return {
    x: o * v.spacing,
    y: Math.sin(o * 0.45) * v.wave * 2.2,
    z: a === 0 ? 0 : -Math.pow(a, 1.3) * v.depth,
    rx: 0.18 + Math.min(a, 3) * 0.1,
    ry: o * 0.42,
    rz: v.tilt * Math.cos(o * 1.25) - o * 0.05,
  };
}

// Range lineup: vials shoulder to shoulder on a line that rises and recedes to the right.
// spread opens the gaps as the row lifts away into the closing sections.
export function rowPose(o: number, spread = 1): Pose {
  return { x: o * ROW_GAP * spread, y: o * 0.17, z: -o * 0.28, rx: o * 0.12, ry: -0.2 + o * 0.03, rz: -0.05 };
}

export function focusPose(v: SceneValues): Pose {
  return { x: v.focusX, y: v.focusY, z: v.focusZ, rx: v.focusRotX, ry: v.focusRotY, rz: v.focusRotZ };
}

export function blendPose(a: Pose, b: Pose, t: number): Pose {
  const l = (x: number, y: number) => x + (y - x) * t;
  return { x: l(a.x, b.x), y: l(a.y, b.y), z: l(a.z, b.z), rx: l(a.rx, b.rx), ry: l(a.ry, b.ry), rz: l(a.rz, b.rz) };
}

export function nearestSlotForProduct(from: number, product: number, count: number): number {
  const base = Math.round(from);
  let best = base;
  let bestD = Infinity;
  for (let s = base - count; s <= base + count; s++) {
    if (wrapIndex(s, count) !== product) continue;
    const d = Math.abs(s - from);
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}

export function productAtPos(pos: number, count: number): number {
  return wrapIndex(Math.round(pos), count);
}
```

- [ ] **Step 8: Update `tests/layout.test.ts`**

Replace the file:

```ts
import { describe, expect, it } from 'vitest';
import {
  ROW_GAP, blendPose, carouselPose, focusPose, nearestSlotForProduct, productAtPos, rowPose, wrapOffset,
} from '@/lib/stage/layout';
import { DEFAULT_VALUES } from '@/lib/stage/values';

describe('wrapOffset', () => {
  it('wraps into [-n/2, n/2)', () => {
    expect(wrapOffset(0, 0, 12)).toBe(0);
    expect(wrapOffset(11, 0, 12)).toBe(-1);
    expect(wrapOffset(1, 11.5, 12)).toBeCloseTo(1.5);
    expect(wrapOffset(6, 0, 12)).toBe(-6);
  });
});

describe('product slots', () => {
  it('picks the nearest slot that shows a product', () => {
    expect(nearestSlotForProduct(0, 11, 12)).toBe(-1);
    expect(nearestSlotForProduct(13, 0, 12)).toBe(12);
    expect(nearestSlotForProduct(1.6, 2, 12)).toBe(2);
  });
  it('reads the product at a carousel position', () => {
    expect(productAtPos(0, 12)).toBe(0);
    expect(productAtPos(-1, 12)).toBe(11);
    expect(productAtPos(13.4, 12)).toBe(1);
  });
});

describe('poses', () => {
  it('centers the middle vial and mirrors the sides in x', () => {
    const c = carouselPose(0, DEFAULT_VALUES);
    expect([c.x, c.z]).toEqual([0, 0]);
    expect(carouselPose(2, DEFAULT_VALUES).x).toBeCloseTo(-carouselPose(-2, DEFAULT_VALUES).x);
  });
  it('blends linearly', () => {
    const a = carouselPose(1, DEFAULT_VALUES);
    const b = rowPose(1);
    expect(blendPose(a, b, 0.5).x).toBeCloseTo((a.x + b.x) / 2);
    expect(blendPose(a, b, 0)).toEqual(a);
  });
  it('reads the focus pose from values', () => {
    expect(focusPose({ ...DEFAULT_VALUES, focusY: 0.5, focusRotY: 2 })).toMatchObject({ y: 0.5, ry: 2 });
  });
  it('packs the range row shoulder to shoulder', () => {
    expect(rowPose(1).x - rowPose(0).x).toBeCloseTo(ROW_GAP);
    expect(ROW_GAP).toBeGreaterThan(1.3); // a vial is 1.3 units wide
    expect(rowPose(1).y).toBeGreaterThan(rowPose(0).y);
  });
});
```

- [ ] **Step 9: Write the carousel test (failing)**

`tests/carousel.test.ts`:

```ts
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Carousel } from '@/lib/stage/Carousel';
import type { ProductModel } from '@/lib/stage/ProductModel';
import { DEFAULT_VALUES, type SceneValues } from '@/lib/stage/values';

class FakeModel implements ProductModel {
  readonly group = new THREE.Group();
  swaps: { to: number; ry: number; scale: number }[] = [];
  constructor(private index: number) {}
  get labelIndex() { return this.index; }
  setLabel(i: number) {
    this.swaps.push({ to: i, ry: this.group.rotation.y, scale: this.group.scale.x });
    this.index = i;
  }
  dispose() {}
}

const N = 12;
const setup = (reduced: boolean, centerOn = 5) => {
  const models = Array.from({ length: N }, (_, i) => new FakeModel(i));
  const c = new Carousel(models, { reduced });
  c.target = c.pos = centerOn;
  return { c, models, center: models[centerOn] };
};

// The timeline drives focus 0 to 1 over hero to p01 (walk -1 to 0) and 1 to 0 over p12 to range (walk 11 to 12).
const valuesAt = (walk: number): SceneValues => {
  const focus = walk < 0 ? walk + 1 : walk > 11 ? 12 - walk : 1;
  return { ...DEFAULT_VALUES, walk, focus, sideFade: focus, focusRotY: -0.14 };
};

const run = (c: Carousel, from: number, to: number, step: number) => {
  const dir = Math.sign(to - from);
  for (let w = from; dir * (to - w) > 1e-9; w += dir * step) c.update(1 / 60, valuesAt(w), { mx: 0, my: 0 });
  c.update(1 / 60, valuesAt(to), { mx: 0, my: 0 });
};

describe('label swaps during the walk', () => {
  it('only swaps while the label faces away, and lands on each product', () => {
    const { c, center } = setup(false);
    run(c, -1, 11, 0.02);
    expect(center.labelIndex).toBe(11);
    expect(center.swaps.map((s) => s.to)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    for (const s of center.swaps) expect(Math.cos(s.ry)).toBeLessThan(-0.2);
  });

  it('turns back into its own product leaving for the range row', () => {
    const { c, center } = setup(false);
    run(c, -1, 12, 0.02);
    expect(center.labelIndex).toBe(5);
    expect(Math.cos(center.swaps[center.swaps.length - 1].ry)).toBeLessThan(-0.2);
  });

  it('walks backwards to the hero just as cleanly', () => {
    const { c, center } = setup(false);
    run(c, -1, 6, 0.02);
    run(c, 6, -1, 0.02);
    expect(center.labelIndex).toBe(5);
    for (const s of center.swaps) expect(Math.cos(s.ry)).toBeLessThan(-0.2);
  });

  it('still lands on the right product when frames are coarse (a fast jump)', () => {
    const { c, center } = setup(false);
    run(c, -1, 10, 0.37);
    expect(center.labelIndex).toBe(10);
  });

  it('leaves vials that are not in focus on their own label', () => {
    const { c, models } = setup(false);
    run(c, -1, 7, 0.05);
    models.forEach((m, i) => { if (i !== 5) expect(m.labelIndex).toBe(i); });
  });
});

describe('reduced motion', () => {
  it('never spins and swaps at the bottom of the dip', () => {
    const { c, center } = setup(true);
    run(c, -1, 4, 0.02);
    expect(center.labelIndex).toBe(4);
    for (const s of center.swaps) expect(s.scale).toBeLessThan(0.75);
    c.update(1 / 60, valuesAt(4), { mx: 0, my: 0 });
    expect(Math.abs(center.group.rotation.y + 0.14)).toBeLessThan(0.01);
  });
});
```

Run: `npx vitest run tests/carousel.test.ts`
Expected: FAIL (the old Carousel takes cans and has no `reduced` option).

- [ ] **Step 10: Replace `lib/stage/Carousel.ts`**

```ts
import * as THREE from 'three';
import type { ProductModel } from './ProductModel';
import type { SceneValues } from './values';
import {
  blendPose, carouselPose, focusPose, nearestSlotForProduct, productAtPos, rowPose, wrapOffset, type Pose,
} from './layout';
import { dipScale, facesAway, labelTarget, spinAngle, spinPhase } from './walk';

export interface FrameInput { mx: number; my: number }
export interface CarouselOptions { reduced: boolean }

export class Carousel {
  readonly group = new THREE.Group();
  pos = 0;
  target = 0;
  /** Product index hovered in the range row, or null. */
  hover: number | null = null;
  private time = 0;
  private center = 0;
  private prevWalk: number | null = null;
  private readonly lift: number[];

  constructor(private readonly models: ProductModel[], private readonly opts: CarouselOptions) {
    models.forEach((m) => this.group.add(m.group));
    this.lift = models.map(() => 0);
  }

  get product(): number {
    return productAtPos(this.target, this.models.length);
  }

  get centerModel(): ProductModel {
    return this.models[this.center];
  }

  dragBy(slots: number) {
    this.target -= slots;
    this.pos = this.target;
  }

  release(lastSlots: number) {
    this.target = Math.round(this.target - lastSlots * 8);
  }

  stepBy(n: number) {
    this.target = Math.round(this.target) + n;
  }

  goToProduct(i: number) {
    this.target = nearestSlotForProduct(this.target, i, this.models.length);
  }

  update(dt: number, v: SceneValues, input: FrameInput) {
    this.time += dt;
    this.pos += (this.target - this.pos) * (1 - Math.exp(-dt * 5));
    const n = this.models.length;
    const reduced = this.opts.reduced;
    // A frame that crosses a half turn swaps at once, so even a coarse frame lands on the right label.
    const crossed = this.prevWalk !== null && Math.round(this.prevWalk) !== Math.round(v.walk);
    this.prevWalk = v.walk;

    let best = Infinity;
    for (let i = 0; i < n; i++) {
      const o = Math.abs(wrapOffset(i, this.pos, n));
      if (o < best) { best = o; this.center = i; }
    }

    for (let i = 0; i < n; i++) {
      const o = wrapOffset(i, this.pos, n);
      let pose: Pose = blendPose(carouselPose(o, v), rowPose(o, v.spread), v.row);
      // Idle wobble keeps each label mostly facing front instead of spinning away. The row holds still.
      if (!reduced) pose.ry += Math.sin(this.time * 0.4 + i * 1.7) * 0.5 * (1 - v.row);
      let scale = 1;
      const w = i === this.center ? v.focus * (1 - Math.min(1, Math.abs(o) * 2)) : 0;
      if (i === this.center) {
        if (w > 0) {
          pose = blendPose(pose, focusPose(v), w);
          if (reduced) {
            scale = 1 + (dipScale(v.walk) - 1) * w;
          } else {
            // The spin is added after the blend, so it completes even while focus fades in or out.
            const phase = spinPhase(v.walk) * w;
            pose.ry += spinAngle(v.walk);
            pose.y -= 0.12 * phase;
            pose.rz *= 1 - 0.5 * phase;
          }
        }
      } else {
        const side = Math.sign(o) || 1;
        pose.x += side * v.sideFade * 8;
        pose.z -= v.sideFade * 3;
      }

      const want = this.hover === i ? v.row : 0;
      this.lift[i] += (want - this.lift[i]) * (1 - Math.exp(-dt * 8));
      pose.y += this.lift[i] * 0.35;

      pose.x += input.mx * 0.2 * v.mouse;
      pose.rx += input.my * 0.15 * v.mouse;
      pose.rz -= input.mx * 0.1 * v.mouse;
      const m = this.models[i];
      m.group.position.set(pose.x, pose.y, pose.z);
      m.group.rotation.set(pose.rx, pose.ry, pose.rz);
      m.group.scale.setScalar(scale);

      const target = w > 0 ? labelTarget(v.walk, i, n) : i;
      if (target !== m.labelIndex) {
        const hidden = w === 0 || crossed || (reduced ? dipScale(v.walk) < 0.4 : facesAway(pose.ry));
        if (hidden) m.setLabel(target);
      }
    }
  }
}
```

Run: `npx vitest run tests/carousel.test.ts`
Expected: PASS. If the "only swaps while the label faces away" case fails on the first swap, check that the spin is added after `blendPose`, not blended with it.

- [ ] **Step 11: Replace `lib/stage/Lights.ts`**

```ts
import * as THREE from 'three';
import type { SceneValues } from './values';
import type { LightMix } from './walk';

// The overhead Light Blue spot pools on the center vial; an Electric Blue rim comes from below and behind.
// rigY lifts the spot out of play between sections. Category light (lib/stage/walk.ts) cools the rim
// toward Light Blue for recovery and narrows the spot for neuro.
const SPOT_Y = 2.4;
const SPOT_TARGET_Y = -1.8;
const ELECTRIC = new THREE.Color('#3B60FF');
const LIGHT = new THREE.Color('#89B5FC');
const WHITE = new THREE.Color('#FFFFFF');

export class Lights {
  private readonly key = new THREE.DirectionalLight(0xf4f7ff, 1);
  private readonly rim = new THREE.DirectionalLight(0x3b60ff, 1);
  private readonly hemi = new THREE.HemisphereLight(0xdfe8ff, 0x111111, 1);
  private readonly stage = new THREE.SpotLight(0x89b5fc, 0, 12, 0.42, 0.7, 1.2);
  private readonly accent = new THREE.SpotLight(0xffffff, 0, 18, 0.32, 0.85, 1);
  private readonly tint = ELECTRIC.clone();
  private readonly tintTarget = ELECTRIC.clone();

  constructor(scene: THREE.Scene) {
    this.key.position.set(3, 4, 6);
    this.rim.position.set(-4, -1.5, -3);
    this.stage.position.set(0, SPOT_Y, 0.2);
    this.stage.target.position.set(0, SPOT_TARGET_Y, 0);
    this.stage.color.copy(WHITE).lerp(LIGHT, 0.6);
    this.accent.position.set(3, 5, 5);
    this.accent.target.position.set(0.6, 0, 0);
    scene.add(this.key, this.rim, this.hemi, this.stage, this.stage.target, this.accent, this.accent.target);
  }

  apply(v: SceneValues, dt: number, mix: LightMix) {
    this.tintTarget.copy(ELECTRIC).lerp(LIGHT, mix.light + mix.beam * 0.5);
    this.tint.lerp(this.tintTarget, 1 - Math.exp(-dt * 4));
    this.key.intensity = v.key * 2;
    this.rim.intensity = v.rim * 1.6 * (1 - 0.4 * mix.beam);
    this.rim.color.copy(this.tint);
    this.hemi.intensity = v.ambient * (1 - 0.5 * mix.beam);
    this.stage.intensity = v.stageLight * 60 * (1 + 0.3 * mix.beam);
    this.stage.angle = 0.42 - 0.16 * mix.beam;
    this.stage.position.y = SPOT_Y + v.rigY * 12;
    this.accent.intensity = v.accent * 60;
    this.accent.color.copy(WHITE).lerp(this.tint, 0.35);
  }
}
```

- [ ] **Step 12: Cool the studio reflections in `lib/stage/Studio.ts`**

```bash
sed -i '' \
  -e 's/new THREE.Color(0.12, 0.105, 0.095)/new THREE.Color(0.095, 0.1, 0.12)/' \
  -e "s/'#fff6ea'/'#f4f7ff'/" -e "s/'#ffe2c4'/'#dbe6ff'/" -e "s/'#fff2e0'/'#f2f5ff'/" \
  -e "s/'#f4c79a'/'#8fa8ff'/" -e "s/'#fff8f0'/'#f6f8ff'/" \
  -e 's/in a dim warm room/in a dim cool room/' -e 's/warm rim strip/cool rim strip/' -e 's/warm bounce from below/blue bounce from below/' \
  lib/stage/Studio.ts
grep -n "#f\|#d\|#8\|Color(" lib/stage/Studio.ts
```

Expected: only the cool values above.

- [ ] **Step 13: Replace `lib/stage/Stage.ts`**

```ts
import * as THREE from 'three';
import { PRODUCTS, PRODUCT_COUNT } from '@/lib/products';
import { DEFAULT_VALUES, type SceneValues } from './values';
import { VialModel, createVialGeometries, createVialMaterials, type Quality, type VialGeometries, type VialMaterials } from './Vial';
import { createLabelTexture } from './label';
import { Carousel } from './Carousel';
import { Lights } from './Lights';
import { createStudioScene } from './Studio';
import { lightMix } from './walk';

export type { Quality };

export interface StageOptions {
  canvas: HTMLCanvasElement;
  quality: Quality;
  /** CSS font-family for the canvas labels, already loaded (see labelFont in lib/boot.ts). */
  labelFont: string;
  background: string;
  reduced: boolean;
  onProgress?: (fraction: number) => void;
}

const CATEGORIES_IN_ORDER = PRODUCTS.map((p) => p.category);

export class Stage {
  readonly values: SceneValues = { ...DEFAULT_VALUES };
  readonly pointer = { x: 0, y: 0 };
  intro = 0;

  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  private readonly fog: THREE.Fog;
  private readonly lights: Lights;
  private readonly raycaster = new THREE.Raycaster();
  private readonly scratch: SceneValues = { ...DEFAULT_VALUES };
  private readonly envMap: THREE.Texture;
  private readonly modelOf = new Map<THREE.Object3D, number>();
  private carousel: Carousel | null = null;
  private models: VialModel[] = [];
  private textures: THREE.Texture[] = [];
  private geo: VialGeometries | null = null;
  private mats: VialMaterials | null = null;
  private lastDragSlots = 0;
  private disposed = false;

  constructor(private readonly opts: StageOptions) {
    const { canvas, quality } = opts;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'high' ? 2 : 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.setClearColor(0x000000, 0);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const studio = createStudioScene();
    this.envMap = pmrem.fromScene(studio.scene, 0.05).texture;
    studio.dispose();
    pmrem.dispose();
    this.scene.environment = this.envMap;
    this.fog = new THREE.Fog(opts.background, 12, 26);
    this.scene.fog = this.fog;
    this.lights = new Lights(this.scene);
    this.resize();
  }

  async load(): Promise<void> {
    const aniso = this.renderer.capabilities.getMaxAnisotropy();
    const width = this.opts.quality === 'high' ? 2048 : 1024;
    for (let i = 0; i < PRODUCT_COUNT; i++) {
      this.textures.push(createLabelTexture(PRODUCTS[i], width, this.opts.labelFont, aniso));
      this.opts.onProgress?.((i + 1) / PRODUCT_COUNT);
      // Yield between labels so the preloader counter can paint.
      await new Promise((r) => setTimeout(r, 0));
      if (this.disposed) return;
    }
    this.geo = createVialGeometries();
    this.mats = createVialMaterials(this.opts.quality);
    this.models = PRODUCTS.map((_, i) => new VialModel(this.geo!, this.mats!, this.textures, i));
    this.models.forEach((m, i) => this.modelOf.set(m.group, i));
    this.carousel = new Carousel(this.models, { reduced: this.opts.reduced });
    this.scene.add(this.carousel.group);
    this.renderer.compile(this.scene, this.camera);
  }

  /** The product the visitor is looking at: the label on the focus vial in the walk, else the hero's center. */
  get product(): number {
    if (!this.carousel) return 0;
    return this.values.focus > 0.5 ? this.carousel.centerModel.labelIndex : this.carousel.product;
  }

  setProduct(index: number) {
    this.carousel?.goToProduct(index);
  }

  step(n: number) {
    this.carousel?.stepBy(n);
  }

  drag(dxPx: number) {
    if (!this.carousel) return;
    const slots = dxPx / this.slotWidthPx();
    this.lastDragSlots = slots;
    this.carousel.dragBy(slots);
  }

  // fling: carry the last drag speed into the snap. Trackpad swipes bring their own inertia, so they skip it.
  release(fling = true) {
    this.carousel?.release(fling ? this.lastDragSlots : 0);
    this.lastDragSlots = 0;
  }

  hitCenter(clientX: number, clientY: number): boolean {
    if (!this.carousel) return false;
    this.aim(clientX, clientY);
    return this.raycaster.intersectObject(this.carousel.centerModel.group, true).length > 0;
  }

  hitProduct(clientX: number, clientY: number): number | null {
    if (!this.carousel) return null;
    this.aim(clientX, clientY);
    const hits = this.raycaster.intersectObjects(this.models.map((m) => m.group), true);
    let o: THREE.Object3D | null = hits[0]?.object ?? null;
    while (o && !this.modelOf.has(o)) o = o.parent;
    return o ? this.modelOf.get(o)! : null;
  }

  setHover(index: number | null) {
    if (this.carousel) this.carousel.hover = index;
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.opts.canvas;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  render(dt: number) {
    if (!this.carousel) return;
    const v = this.values;
    const s = this.scratch;
    const k = this.intro;
    Object.assign(s, v);
    // Intro: vials converge from wide spacing, camera dollies back, lights come up.
    s.spacing = v.spacing * (1 + (1 - k) * 1.5);
    s.camZ = v.camZ - (1 - k) * 3;
    s.stageLight = v.stageLight * k;
    s.key = v.key * k;
    s.rim = v.rim * k;

    this.camera.position.set(s.camX, s.camY, s.camZ);
    this.camera.rotation.set(s.camRotX, 0, s.camRotZ);
    if (this.camera.fov !== s.fov) {
      this.camera.fov = s.fov;
      this.camera.updateProjectionMatrix();
    }
    this.fog.near = s.fogNear;
    this.fog.far = s.fogFar;
    this.renderer.toneMappingExposure = s.exposure;
    this.lights.apply(s, dt, lightMix(s.walk, CATEGORIES_IN_ORDER));
    this.carousel.update(dt, s, { mx: this.pointer.x, my: this.pointer.y });
    this.renderer.render(this.scene, this.camera);
  }

  private aim(clientX: number, clientY: number) {
    const r = this.opts.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
  }

  private slotWidthPx(): number {
    const h = 2 * this.values.camZ * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    return (this.values.spacing / (h * this.camera.aspect)) * this.opts.canvas.clientWidth;
  }

  dispose() {
    this.disposed = true;
    this.models.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
    this.geo?.dispose();
    this.mats?.dispose();
    this.envMap.dispose();
    this.renderer.dispose();
  }
}
```

- [ ] **Step 14: Replace `lib/store.ts` and `lib/debug.ts`**

`lib/store.ts`:

```ts
import { useSyncExternalStore } from 'react';
import { wrapIndex } from './products';

export function createStore<T extends object>(initial: T) {
  let state = initial;
  const subs = new Set<() => void>();
  return {
    get: () => state,
    set(patch: Partial<T>) {
      let changed = false;
      for (const k in patch) if (!Object.is(state[k], patch[k])) changed = true;
      if (!changed) return;
      state = { ...state, ...patch };
      subs.forEach((fn) => fn());
    },
    subscribe(fn: () => void) {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
  };
}

export interface AppState {
  /** Index into PRODUCTS of the product on screen. */
  product: number;
  /** 'ui' when a control picked it (the stage should follow), 'stage' when the stage reported it. */
  productSource: 'ui' | 'stage';
  section: number;
  /** Product hovered in the range row. */
  hover: number | null;
  loaded: number;
  ready: boolean;
  entered: boolean;
  menuOpen: boolean;
  webgl: boolean;
}

export const store = createStore<AppState>({
  product: 0,
  productSource: 'ui',
  section: 0,
  hover: null,
  loaded: 0,
  ready: false,
  entered: false,
  menuOpen: false,
  webgl: true,
});

export function useApp<K>(select: (s: AppState) => K): K {
  return useSyncExternalStore(store.subscribe, () => select(store.get()), () => select(store.get()));
}

export function selectProduct(i: number): void {
  store.set({ product: wrapIndex(i), productSource: 'ui' });
}
```

`lib/debug.ts`:

```ts
import { PRODUCTS } from './products';
import { SECTIONS, type SectionId } from './scroll/sections';

export interface Debug {
  skipIntro: boolean;
  section: number | null;
  product: number | null;
}

const OFF: Debug = { skipIntro: false, section: null, product: null };

// Dev only (or a build with NEXT_PUBLIC_DEBUG=1): /?intro=skip&section=<id|index>&product=<id>
export function readDebug(search: string = typeof location === 'undefined' ? '' : location.search): Debug {
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_DEBUG) return OFF;
  const q = new URLSearchParams(search);
  const rawSection = q.get('section');
  let section: number | null = null;
  if (rawSection !== null) {
    const byId = SECTIONS.indexOf(rawSection as SectionId);
    const byIndex = Number(rawSection);
    if (byId >= 0) section = byId;
    else if (Number.isInteger(byIndex) && byIndex >= 0 && byIndex < SECTIONS.length) section = byIndex;
  }
  const p = PRODUCTS.findIndex((x) => x.id === q.get('product'));
  return { skipIntro: q.get('intro') === 'skip', section, product: p >= 0 ? p : null };
}
```

Replace `tests/debug.test.ts`:

```ts
import { expect, it } from 'vitest';
import { readDebug } from '@/lib/debug';

it('parses section ids, indices and products', () => {
  expect(readDebug('?intro=skip&section=p03&product=tb-500')).toEqual({ skipIntro: true, section: 3, product: 5 });
  expect(readDebug('?section=13')).toEqual({ skipIntro: false, section: 13, product: null });
  expect(readDebug('?section=bogus&product=nope')).toEqual({ skipIntro: false, section: null, product: null });
});
```

Append to `tests/store.test.ts`:

```ts
import { selectProduct, store } from '@/lib/store';

it('wraps product selection and marks it as a UI choice', () => {
  selectProduct(-1);
  expect(store.get()).toMatchObject({ product: 11, productSource: 'ui' });
  selectProduct(12);
  expect(store.get().product).toBe(0);
});
```

(Move the new `import` line to the top of the file next to the existing imports.)

- [ ] **Step 15: Update `tests/timeline.test.ts` and `tests/scroll-math.test.ts`**

`tests/timeline.test.ts`, replace the file:

```ts
import { describe, expect, it } from 'vitest';
import { DEFAULT_VALUES, VALUE_KEYS } from '@/lib/stage/values';
import { buildKeyframes } from '@/lib/stage/keyframes';
import { buildMasterTimeline } from '@/lib/scroll/timeline';
import { LAST, RANGE, SECTIONS, sectionForProduct } from '@/lib/scroll/sections';

describe('keyframes', () => {
  const desk = buildKeyframes(false);
  const mob = buildKeyframes(true);
  it('has one complete frame per section', () => {
    expect(desk).toHaveLength(SECTIONS.length);
    for (const f of desk) expect(Object.keys(f).sort()).toEqual([...VALUE_KEYS].sort());
  });
  it('starts at the defaults', () => {
    expect(desk[0]).toEqual(DEFAULT_VALUES);
  });
  it('walks -1 on the hero, one product per section, 12 from the range on', () => {
    expect(desk[0].walk).toBe(-1);
    for (let i = 0; i < 12; i++) expect(desk[sectionForProduct(i)].walk).toBe(i);
    expect(desk[RANGE].walk).toBe(12);
    expect(desk[LAST].walk).toBe(12);
  });
  it('keeps the same walk on mobile, so a breakpoint change never changes the product', () => {
    expect(mob.map((f) => f.walk)).toEqual(desk.map((f) => f.walk));
  });
  it('frames the hero wider on mobile', () => {
    expect(mob[0].camZ).toBeGreaterThan(desk[0].camZ);
  });
});

describe('master timeline', () => {
  it('lands exactly on each section keyframe and interpolates linearly', () => {
    const v = { ...DEFAULT_VALUES };
    const frames = buildKeyframes(false);
    const tl = buildMasterTimeline(v, frames);
    expect(tl.duration()).toBe(LAST);
    for (const i of [1, 5, 12, RANGE, LAST]) {
      tl.seek(i);
      expect(v.camZ).toBeCloseTo(frames[i].camZ);
      expect(v.walk).toBeCloseTo(frames[i].walk);
      expect(v.row).toBeCloseTo(frames[i].row);
    }
    tl.seek(4.5);
    expect(v.walk).toBeCloseTo(3.5);
  });
});
```

`tests/scroll-math.test.ts`, replace the `TOPS` constant and the expectations that use section numbers:

```ts
import { describe, expect, it } from 'vitest';
import { nearestSection, planPage, scrollToTime, sectionAt, zoneFor } from '@/lib/scroll/math';

const VH = 800;
// hero and p01 to p12 every 1000, range at 13000, closing (the last section) at 13720.
const TOPS = [...Array.from({ length: 14 }, (_, i) => i * 1000), 13720];

describe('scrollToTime', () => {
  it('maps tops to integer times and interpolates between', () => {
    expect(scrollToTime(0, TOPS)).toBe(0);
    expect(scrollToTime(500, TOPS)).toBeCloseTo(0.5);
    expect(scrollToTime(13360, TOPS)).toBeCloseTo(13.5);
    expect(scrollToTime(13720, TOPS)).toBe(14);
    expect(scrollToTime(99999, TOPS)).toBe(14);
  });
});

describe('section lookup', () => {
  it('finds the nearest top and the section under mid-viewport', () => {
    expect(nearestSection(1400, TOPS)).toBe(1);
    expect(nearestSection(1600, TOPS)).toBe(2);
    expect(sectionAt(700, TOPS, VH)).toBe(1);
    expect(sectionAt(500, TOPS, VH)).toBe(0);
  });
});

describe('zoneFor', () => {
  it('pages everywhere above the range row', () => {
    expect(zoneFor(0, VH, TOPS, 1)).toBe('paged');
    expect(zoneFor(12000, VH, TOPS, 1)).toBe('paged');
  });
  it('scrolls freely from the range row to the end of the page', () => {
    expect(zoneFor(13000, VH, TOPS, 1)).toBe('free');
    expect(zoneFor(13500, VH, TOPS, -1)).toBe('free');
    expect(zoneFor(20000, VH, TOPS, -1)).toBe('free');
  });
  it('pages back up from the top of the range row', () => {
    expect(zoneFor(13000, VH, TOPS, -1)).toBe('paged');
  });
});

describe('planPage', () => {
  it('steps forward and back', () => {
    expect(planPage(0, VH, TOPS, 1)).toEqual({ to: 1, scroll: 1000 });
    expect(planPage(12000, VH, TOPS, 1)).toEqual({ to: 13, scroll: 13000 });
    expect(planPage(13000, VH, TOPS, -1)).toEqual({ to: 12, scroll: 12000 });
  });
  it('stays on the hero when scrolling up from it', () => {
    expect(planPage(0, VH, TOPS, -1)).toBeNull();
  });
  it('never pages past the range row: the page just ends', () => {
    expect(planPage(13000, VH, TOPS, 1)).toBeNull();
  });
});
```

- [ ] **Step 16: Replace `lib/boot.ts`**

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PRODUCTS, productUrl } from './products';
import { store } from './store';
import { createProgress } from './progress';
import { readDebug } from './debug';
import { withTimeout } from './timeout';
import { Pager } from './scroll/Pager';
import { CLOSING, RANGE, SECTIONS, productForSection, sectionForProduct, type SectionId } from './scroll/sections';
import { setPager } from './scroll/instance';
import { scrollToTime } from './scroll/math';
import { buildMasterTimeline } from './scroll/timeline';
import { buildKeyframes } from './stage/keyframes';
import { DEFAULT_VALUES } from './stage/values';
import type { Stage, Quality } from './stage/Stage';

const INK = '#111111';
const LOAD_TIMEOUT = 8000;

function hasWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

// next/font exposes the hashed Poppins family on <html>; the canvas labels need it loaded first.
async function labelFont(): Promise<string> {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-poppins').trim() || 'Poppins, sans-serif';
  await Promise.all(['400', '500', '600'].map((w) => document.fonts.load(`${w} 64px ${family}`))).catch(() => undefined);
  return family;
}

export async function boot(canvas: HTMLCanvasElement): Promise<() => void> {
  gsap.registerPlugin(ScrollTrigger);
  const cleanups: (() => void)[] = [];
  const debug = readDebug();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileQuery = matchMedia('(max-width: 760px)');
  const quality: Quality = mobileQuery.matches || (navigator.hardwareConcurrency ?? 8) <= 4 ? 'low' : 'high';

  if (debug.product !== null) store.set({ product: debug.product, productSource: 'ui' });

  // Loading
  const progress = createProgress({ models: 3, fonts: 1 }, (v) => {
    store.set({ loaded: v });
    if (v >= 1) store.set({ ready: true });
  });
  void document.fonts.ready.then(() => progress.update('fonts', 1));

  // Every step races the timeout: a stalled chunk or label build drops to the static path instead of hanging.
  let stage: Stage | null = null;
  if (hasWebGL()) {
    let s: Stage | null = null;
    try {
      const font = await withTimeout(labelFont(), LOAD_TIMEOUT);
      const { Stage } = await withTimeout(import('./stage/Stage'), LOAD_TIMEOUT);
      s = new Stage({ canvas, quality, labelFont: font, background: INK, reduced, onProgress: (f) => progress.update('models', f) });
      await withTimeout(s.load(), LOAD_TIMEOUT);
      stage = s;
      stage.setProduct(store.get().product);
    } catch {
      s?.dispose();
      store.set({ webgl: false });
    }
  } else {
    store.set({ webgl: false });
  }
  progress.update('models', 1);
  progress.update('fonts', 1);

  // Scroll
  const pager = new Pager({
    paging: !reduced,
    onSection: (i) => {
      store.set({ section: i });
      // Without the stage, the section alone decides which product the walk shows.
      const p = productForSection(i);
      if (!stage && p !== null) store.set({ product: p, productSource: 'stage' });
    },
  });
  setPager(pager);
  pager.stop();
  pager.measure();
  const values = stage?.values ?? { ...DEFAULT_VALUES };
  let master = buildMasterTimeline(values, buildKeyframes(mobileQuery.matches));
  const root = document.documentElement.style;
  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      master.time(scrollToTime(self.scroll(), pager.sectionTops));
      root.setProperty('--progress', self.progress.toFixed(4));
    },
  });
  pager.lenis.on('scroll', ScrollTrigger.update);

  const onResize = () => {
    pager.measure();
    stage?.resize();
    ScrollTrigger.refresh();
    master.time(scrollToTime(scrollY, pager.sectionTops));
  };
  const onBreakpoint = () => {
    master.kill();
    master = buildMasterTimeline(values, buildKeyframes(mobileQuery.matches));
    onResize();
  };
  addEventListener('resize', onResize);
  mobileQuery.addEventListener('change', onBreakpoint);
  cleanups.push(() => {
    removeEventListener('resize', onResize);
    mobileQuery.removeEventListener('change', onBreakpoint);
  });

  // Frame loop: Lenis first so the timeline reads this frame's scroll. Once the closing sections
  // are well in view the canvas fades out and stops rendering.
  const tick = (time: number, deltaMs: number) => {
    pager.raf(time * 1000);
    const closingTop = pager.sectionTops[CLOSING];
    const off = closingTop !== undefined && pager.lenis.scroll > closingTop + innerHeight * 0.5;
    canvas.classList.toggle('is-off', off);
    if (!stage || off) return;
    stage.render(Math.min(deltaMs, 100) / 1000);
    const p = stage.product;
    if (p !== store.get().product) store.set({ product: p, productSource: 'stage' });
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Hero drag and center-vial click; range hover and click
  if (stage) {
    const st = stage;
    let dragging = false;
    let lastX = 0;
    let moved = 0;
    const canDrag = () => store.get().entered && store.get().section === 0;
    const inRange = () => store.get().entered && store.get().section === RANGE;
    const down = (e: PointerEvent) => {
      if (inRange()) {
        const hit = st.hitProduct(e.clientX, e.clientY);
        if (hit !== null) window.open(productUrl(PRODUCTS[hit]), '_blank', 'noreferrer');
        return;
      }
      if (!canDrag()) return;
      dragging = true;
      lastX = e.clientX;
      moved = 0;
      canvas.setPointerCapture(e.pointerId);
      document.body.classList.add('is-grabbing');
    };
    const move = (e: PointerEvent) => {
      st.pointer.x = e.clientX / innerWidth - 0.5;
      st.pointer.y = e.clientY / innerHeight - 0.5;
      if (dragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        moved += Math.abs(dx);
        st.drag(dx);
        return;
      }
      if (inRange()) {
        const hit = st.hitProduct(e.clientX, e.clientY);
        st.setHover(hit);
        store.set({ hover: hit });
        canvas.style.cursor = hit === null ? '' : 'pointer';
        return;
      }
      canvas.style.cursor = canDrag() ? (st.hitCenter(e.clientX, e.clientY) ? 'pointer' : 'grab') : '';
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove('is-grabbing');
      if (moved < 6 && e.type === 'pointerup' && st.hitCenter(e.clientX, e.clientY)) {
        pager.goTo(sectionForProduct(st.product));
        return;
      }
      st.release();
    };
    // Two-finger sideways swipe on a trackpad (or shift+wheel) drags the carousel, then snaps once it goes quiet.
    let wheelIdle: ReturnType<typeof setTimeout> | undefined;
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (e.cancelable) e.preventDefault();
      if (!canDrag() || dragging) return;
      st.drag(-e.deltaX * (e.deltaMode === 1 ? 16 : 1));
      clearTimeout(wheelIdle);
      wheelIdle = setTimeout(() => st.release(false), 140);
    };
    canvas.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    addEventListener('wheel', wheel, { passive: false });
    cleanups.push(() => {
      clearTimeout(wheelIdle);
      removeEventListener('wheel', wheel);
      canvas.removeEventListener('pointerdown', down);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', up);
    });
  }

  // Store reactions
  let prev = store.get();
  const enter = () => {
    pager.start();
    if (stage) {
      if (debug.skipIntro || reduced) stage.intro = 1;
      else gsap.to(stage, { intro: 1, duration: 2.4, ease: 'power3.out' });
    }
    if (debug.section !== null) pager.jump(debug.section);
    else {
      // Deep links such as #p05 open on that section.
      const fromHash = SECTIONS.indexOf(location.hash.slice(1) as SectionId);
      if (fromHash > 0) pager.jump(fromHash);
    }
  };
  // prev is advanced before any side effect: reactions below can set the store again,
  // and the nested callback must compare against this state, not the stale one.
  const unsubscribe = store.subscribe(() => {
    const s = store.get();
    const p = prev;
    prev = s;
    if (s.product !== p.product && s.productSource === 'ui') stage?.setProduct(s.product);
    if (s.section !== p.section && p.section === RANGE) {
      stage?.setHover(null);
      if (s.hover !== null) store.set({ hover: null });
    }
    if (s.entered && !p.entered) enter();
    if (s.ready && debug.skipIntro && !s.entered) store.set({ entered: true });
  });
  // A remount (dev strict mode, HMR) can find the store already entered.
  const initial = store.get();
  if (initial.entered) enter();
  else if (initial.ready && debug.skipIntro) store.set({ entered: true });

  return () => {
    unsubscribe();
    gsap.ticker.remove(tick);
    trigger.kill();
    master.kill();
    cleanups.forEach((fn) => fn());
    pager.destroy();
    setPager(null);
    if (stage) gsap.killTweensOf(stage);
    document.body.classList.remove('is-grabbing');
    canvas.classList.remove('is-off');
    stage?.dispose();
  };
}
```

- [ ] **Step 17: Replace `components/sections/Preloader.tsx`**

```tsx
'use client';

import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import { store, useApp } from '@/lib/store';
import { cn } from '@/lib/cn';

// Ink screen, the B-mark fills from the bottom with real loading progress, then the page enters.
export function Preloader() {
  const loaded = useApp((s) => s.loaded);
  const ready = useApp((s) => s.ready);
  const entered = useApp((s) => s.entered);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!ready || entered) return;
    const t = setTimeout(() => store.set({ entered: true }), 400);
    return () => clearTimeout(t);
  }, [ready, entered]);

  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => setGone(true), 1000);
    return () => clearTimeout(t);
  }, [entered]);

  if (gone) return null;
  const pct = Math.round(loaded * 100);

  return (
    <div className={cn('preloader', entered && 'is-leaving')} role="status" aria-live="polite" aria-label={`Loading, ${pct}%`}>
      <div className="preloader-mark" style={{ '--p': loaded } as CSSProperties} aria-hidden="true">
        <Image className="is-ghost" src="/logos/b-mark-white.svg" alt="" width={88} height={67} priority unoptimized />
        <Image className="is-fill" src="/logos/b-mark-white.svg" alt="" width={88} height={67} priority unoptimized />
      </div>
      <p className="preloader-count" aria-hidden="true">{String(pct).padStart(2, '0')}%</p>
    </div>
  );
}
```

- [ ] **Step 18: Replace `app/page.tsx` with the scene-only page**

```tsx
import { Experience } from '@/components/Experience';
import { MainShell } from '@/components/chrome/MainShell';
import { Preloader } from '@/components/sections/Preloader';
import { SECTIONS } from '@/lib/scroll/sections';

export default function Page() {
  return (
    <>
      <div className="backdrop" aria-hidden="true" />
      <Experience />
      <MainShell>
        {SECTIONS.map((id) => (
          <div key={id} id={id} data-section={id} aria-hidden="true" className={id === 'range' ? 'spacer spacer--short' : 'spacer'} />
        ))}
      </MainShell>
      <Preloader />
    </>
  );
}
```

- [ ] **Step 19: Replace `components/dev/StageTest.tsx`**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { PRODUCTS, PRODUCT_COUNT } from '@/lib/products';
import { SECTIONS, LAST } from '@/lib/scroll/sections';
import { buildKeyframes } from '@/lib/stage/keyframes';
import { buildMasterTimeline } from '@/lib/scroll/timeline';
import type { Stage } from '@/lib/stage/Stage';

export function StageTest() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [time, setTime] = useState(0);
  const [product, setProduct] = useState(0);

  useEffect(() => {
    let alive = true;
    let tick: ((t: number, d: number) => void) | null = null;
    const onResize = () => stage.current?.resize();
    import('@/lib/stage/Stage').then(async ({ Stage }) => {
      await document.fonts.ready;
      const family = getComputedStyle(document.documentElement).getPropertyValue('--font-poppins').trim() || 'Poppins, sans-serif';
      const s = new Stage({ canvas: canvas.current!, quality: 'high', labelFont: family, background: '#111111', reduced: false });
      await s.load();
      if (!alive) return s.dispose();
      s.intro = 1;
      stage.current = s;
      tl.current = buildMasterTimeline(s.values, buildKeyframes(innerWidth < 760));
      // Dev-only deep link for screenshots: ?t=<timeline time>&product=<index>.
      const q = new URLSearchParams(location.search);
      const t = Math.min(LAST, Math.max(0, Number(q.get('t')) || 0));
      const p = (Number(q.get('product')) || 0) % PRODUCT_COUNT;
      tl.current.time(t);
      setTime(t);
      setProduct(p);
      s.setProduct(p);
      tick = (_t, d) => s.render(d / 1000);
      gsap.ticker.add(tick);
      addEventListener('resize', onResize);
    });
    return () => {
      alive = false;
      removeEventListener('resize', onResize);
      if (tick) gsap.ticker.remove(tick);
      stage.current?.dispose();
    };
  }, []);

  useEffect(() => {
    tl.current?.time(time);
  }, [time]);

  const pick = (i: number) => {
    const n = (i + PRODUCT_COUNT) % PRODUCT_COUNT;
    setProduct(n);
    stage.current?.setProduct(n);
  };

  return (
    <div className="fixed inset-0 bg-ink">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 bg-white/10 p-3 text-xs text-white">
        <button onClick={() => pick(product - 1)}>prev</button>
        <span className="w-44">{PRODUCTS[product].name}</span>
        <button onClick={() => pick(product + 1)}>next</button>
        <input className="flex-1" type="range" min={0} max={LAST} step={0.01} value={time} onChange={(e) => setTime(+e.target.value)} />
        <span className="w-40 tabular">{time.toFixed(2)} {SECTIONS[Math.min(LAST, Math.round(time))]}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 20: Run every check and the build**

```bash
grep -rn "flavor\|Flavor\|FLAVORS\|Can\b\|ageOk\|persist" lib components app tests --include=*.ts --include=*.tsx
npm test && npx tsc --noEmit && npm run lint && npm run build
```

Expected: the grep prints nothing (fix any leftover reference), and all checks pass.

- [ ] **Step 21: Look at it**

Start the dev server (`preview_start` with the `dev` configuration in `.claude/launch.json`, or `npm run dev`). Open `/?intro=skip`, `/?intro=skip&section=p01`, `/?intro=skip&section=p05`, `/?intro=skip&section=range` at 1440x900, and `/stage-test?t=1.5`. Confirm: 12 vials with readable labels on the arc; the walk shows one vial centered with its label front-on; the vial spins between pages without a visible label change; the range row shows 12 vials. Note framing problems for Task 13, but do fix anything broken (black glass, mirrored or upside-down labels, vials off screen) now: the label direction depends on `LABEL_FRONT_OFFSET` and the texture's `flipY`; vial size on `VIAL_SCALE`; walk framing on `WALK` in `keyframes.ts`.

- [ ] **Step 22: Commit**

```bash
git add -A
git commit -m "Switch the 3D and scroll core to the 12 vials and the product walk

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 7: Persistent chrome (backdrop, frame, nav, menu)

**Files:**
- Create: `components/ui/icons.tsx`, `components/Backdrop.tsx`, `components/chrome/Frame.tsx`, `components/chrome/Nav.tsx`, `components/chrome/Menu.tsx`, `tests/groups.test.ts`
- Modify: `lib/products.ts` (add `productGroups`), `lib/scroll/instance.ts` (add `scrollToId`), `app/page.tsx`

**Interfaces:**
- Consumes: `store`, `useApp`, sections helpers, `Pager.scrollToElement` (Task 6), `PRODUCTS`, `CATEGORIES`, `CATEGORY_ORDER`, `ASSESSMENT_URL`, `SITE_ORIGIN`, `pad2`.
- Produces: `IconArrow()`, `IconChevron({ dir })`, `IconPlus()`; `productGroups(): { category: CategorySlug; name: string; items: { product: Product; index: number }[] }[]`; `scrollToId(id: string): void`; components `Backdrop`, `Frame`, `Nav`, `Menu`.

- [ ] **Step 1: Write the failing test**

`tests/groups.test.ts`:

```ts
import { expect, it } from 'vitest';
import { productGroups } from '@/lib/products';

it('groups the walk by category, keeping each product’s walk index', () => {
  const g = productGroups();
  expect(g.map((x) => x.name)).toEqual(['Muscle Growth', 'Recovery & Vitality', 'Neuro & Cognitive']);
  expect(g.map((x) => x.items.length)).toEqual([4, 7, 1]);
  expect(g[1].items[0]).toMatchObject({ index: 4, product: { id: 'bpc-157' } });
  expect(g[2].items[0].index).toBe(11);
});
```

Run: `npx vitest run tests/groups.test.ts`
Expected: FAIL, `productGroups` is not exported.

- [ ] **Step 2: Add `productGroups` to `lib/products.ts`**

Append:

```ts
export function productGroups(): { category: CategorySlug; name: string; items: { product: Product; index: number }[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    name: CATEGORIES[category].name,
    items: PRODUCTS.map((product, index) => ({ product, index })).filter((x) => x.product.category === category),
  }));
}
```

Run: `npx vitest run tests/groups.test.ts`
Expected: PASS.

- [ ] **Step 3: Add `scrollToId` to `lib/scroll/instance.ts`**

Append:

```ts
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) pager?.scrollToElement(el);
}
```

- [ ] **Step 4: Write `components/ui/icons.tsx`**

```tsx
// One stroke icon set at 1.6px, drawn for this page.
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, 'aria-hidden': true } as const;

export const IconArrow = () => (
  <svg {...base} viewBox="0 0 16 16"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
);

export const IconChevron = ({ dir }: { dir: 1 | -1 }) => (
  <svg {...base} viewBox="0 0 18 18"><path d={dir > 0 ? 'M7 3l6 6-6 6' : 'M11 3 5 9l6 6'} /></svg>
);

export const IconPlus = () => (
  <svg {...base} viewBox="0 0 20 20"><path d="M10 3v14M3 10h14" /></svg>
);
```

- [ ] **Step 5: Write `components/Backdrop.tsx`**

```tsx
'use client';

import { CATEGORIES, PRODUCTS } from '@/lib/products';
import { RANGE, productForSection } from '@/lib/scroll/sections';
import { useApp } from '@/lib/store';

// The Ink room. Which floor pool is lit follows the category on screen (spec 4.5).
export function Backdrop() {
  const section = useApp((s) => s.section);
  const product = useApp((s) => s.product);
  const inWalk = productForSection(section) !== null;
  const light = inWalk ? CATEGORIES[PRODUCTS[product].category].light : section === RANGE ? 'range' : 'electric';
  return (
    <div className="backdrop" data-light={light} aria-hidden="true">
      <div className="pool pool--electric" />
      <div className="pool pool--light" />
      <div className="pool pool--beam" />
      <div className="pool pool--range" />
      <div className="backdrop-grid" />
    </div>
  );
}
```

- [ ] **Step 6: Write `components/chrome/Frame.tsx`**

```tsx
'use client';

import { PRODUCT_COUNT, pad2 } from '@/lib/products';
import { LAST_PRODUCT } from '@/lib/scroll/sections';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/cn';

// Corner brackets, the 01 / 12 counter and the top progress line (its width is --progress, set in lib/boot.ts).
export function Frame() {
  const entered = useApp((s) => s.entered);
  const section = useApp((s) => s.section);
  const product = useApp((s) => s.product);
  return (
    <>
      <div className={cn('frame', entered && 'is-in')} aria-hidden="true">
        <span className="frame-corner tl" />
        <span className="frame-corner tr" />
        <span className="frame-corner bl" />
        <span className="frame-corner br" />
        <div className={cn('frame-count', section <= LAST_PRODUCT && 'is-on')}>
          <span className="frame-count-now">{pad2(product + 1)}</span>
          <span className="frame-count-rule" />
          <span>{pad2(PRODUCT_COUNT)}</span>
        </div>
      </div>
      <div className="progress-line" aria-hidden="true"><i /></div>
    </>
  );
}
```

- [ ] **Step 7: Write `components/chrome/Menu.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { ASSESSMENT_URL, pad2, productGroups } from '@/lib/products';
import { sectionForProduct } from '@/lib/scroll/sections';
import { goToSection, scrollToId } from '@/lib/scroll/instance';
import { store, useApp } from '@/lib/store';
import { cn } from '@/lib/cn';

const GROUPS = productGroups();

// Full-screen Ink menu: the 12 products by category, FAQ and the assessment. Focus stays inside
// while it is open; Escape closes it and returns focus to the toggle.
export function Menu() {
  const open = useApp((s) => s.menuOpen);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = panel.current;
    if (!el) return;
    el.querySelector<HTMLElement>('a[href], button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        store.set({ menuOpen: false });
        toggle.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !toggle.current) return;
      const items = [toggle.current, ...el.querySelectorAll<HTMLElement>('a[href], button')];
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
      e.preventDefault();
      items[next].focus();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => store.set({ menuOpen: false });

  return (
    <>
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => store.set({ menuOpen: !open })}
        className="menu-toggle"
      >
        <span className="menu-squares" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="max-sm:sr-only">{open ? 'Close' : 'Menu'}</span>
      </button>
      <div id="site-menu" ref={panel} role="dialog" aria-modal="true" aria-label="Menu" inert={!open} className={cn('menu-panel', open && 'is-open')}>
        <nav aria-label="Products" className="menu-grid">
          {GROUPS.map((g) => (
            <section key={g.category} className="menu-group">
              <h2 className="menu-group-title">{g.name}</h2>
              <ul className="dim-list">
                {g.items.map(({ product, index }) => (
                  <li key={product.id}>
                    <button type="button" className="menu-link" onClick={() => { close(); goToSection(sectionForProduct(index)); }}>
                      <span className="menu-num">{pad2(index + 1)}</span>
                      {product.name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
        <div className="menu-foot">
          <button type="button" className="nav-link" onClick={() => { close(); scrollToId('faq'); }}>FAQ</button>
          <a className="btn btn-primary" href={ASSESSMENT_URL} target="_blank" rel="noreferrer">Start assessment</a>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 8: Write `components/chrome/Nav.tsx`**

```tsx
'use client';

import Image from 'next/image';
import { ASSESSMENT_URL, SITE_ORIGIN } from '@/lib/products';
import { scrollToId } from '@/lib/scroll/instance';
import { useApp } from '@/lib/store';
import { RollLabel } from '@/components/ui/RollLabel';
import { IconArrow } from '@/components/ui/icons';
import { Menu } from './Menu';
import { cn } from '@/lib/cn';

export function Nav() {
  const entered = useApp((s) => s.entered);
  return (
    <header inert={!entered} className={cn('nav', entered && 'is-in')}>
      <Menu />
      <a className="nav-logo" href={SITE_ORIGIN} target="_blank" rel="noreferrer" aria-label="Bodybuilding Peptides +, powered by bodybuilding.com. Opens trybbpeptides.com">
        <Image src="/logos/bb-peptides-full-white.svg" alt="" width={500} height={133} unoptimized priority />
      </a>
      <div className="nav-right">
        <button type="button" className="nav-link" onClick={() => scrollToId('faq')}>FAQ</button>
        <a className="btn btn-primary roll-host" href={ASSESSMENT_URL} target="_blank" rel="noreferrer" aria-label="Start assessment">
          <RollLabel text="Start assessment" />
          <IconArrow />
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 9: Mount the chrome in `app/page.tsx`**

Replace the placeholder `<div className="backdrop" aria-hidden="true" />` with `<Backdrop />`, and add `<Frame />` and `<Nav />` after `<Experience />`:

```tsx
import { Backdrop } from '@/components/Backdrop';
import { Experience } from '@/components/Experience';
import { Frame } from '@/components/chrome/Frame';
import { MainShell } from '@/components/chrome/MainShell';
import { Nav } from '@/components/chrome/Nav';
import { Preloader } from '@/components/sections/Preloader';
import { SECTIONS } from '@/lib/scroll/sections';

export default function Page() {
  return (
    <>
      <Backdrop />
      <Experience />
      <Frame />
      <Nav />
      <MainShell>
        {SECTIONS.map((id) => (
          <div key={id} id={id} data-section={id} aria-hidden="true" className={id === 'range' ? 'spacer spacer--short' : 'spacer'} />
        ))}
      </MainShell>
      <Preloader />
    </>
  );
}
```

- [ ] **Step 10: Check in the browser**

Run checks: `npm test && npx tsc --noEmit && npm run lint`. Then on the dev server at `/?intro=skip` (1440x900 and 375x812): the nav slides in with the white lockup centered; the menu opens full screen with three category columns (one column on a phone), Tab cycles inside it, Escape closes it and focus returns to the toggle; clicking "BPC-157" pages to `p05`; FAQ scrolls to the end of the page (the FAQ itself arrives in Task 11); the progress line grows as you page; the floor pool cools on `p05` to `p11` and narrows on `p12`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "Add the Ink backdrop, frame, progress line, nav and focus-trapped menu

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Hero layer

**Files:**
- Create: `components/sections/HeroLayer.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Layer`, `Reveal` (unchanged from Hiatus), `selectProduct`, `store`, `useApp`, `PRODUCTS`, `CATEGORIES`, `IconChevron`.
- Produces: `HeroLayer` (layer for section 0).

- [ ] **Step 1: Write `components/sections/HeroLayer.tsx`**

```tsx
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CATEGORIES, PRODUCTS } from '@/lib/products';
import { selectProduct, store, useApp } from '@/lib/store';
import { Layer } from '@/components/ui/Layer';
import { Reveal } from '@/components/ui/Reveal';
import { IconChevron } from '@/components/ui/icons';

// The outgoing name animates up and out while the new one reveals by character.
function ProductTitle({ index, show }: { index: number; show: boolean }) {
  const [items, setItems] = useState([{ index, n: 0 }]);
  const last = items[items.length - 1];
  if (last.index !== index) setItems([last, { index, n: last.n + 1 }]);
  return (
    <div className="hero-title-stack">
      {items.map((it, i) => {
        const current = i === items.length - 1;
        return (
          <div key={it.n} aria-hidden={current ? undefined : true}>
            <Reveal as="h1" mode="chars" show={show && current} delay={current ? 0.25 : 0} className="display hero-title">
              {PRODUCTS[it.index].name}
            </Reveal>
          </div>
        );
      })}
    </div>
  );
}

function Arrow({ dir }: { dir: 1 | -1 }) {
  return (
    <button
      type="button"
      className="btn-square"
      aria-label={dir > 0 ? 'Next product' : 'Previous product'}
      onClick={() => selectProduct(store.get().product + dir)}
    >
      <IconChevron dir={dir} />
    </button>
  );
}

export function HeroLayer() {
  const index = useApp((s) => s.product);
  const webgl = useApp((s) => s.webgl);
  const section = useApp((s) => s.section);
  const p = PRODUCTS[index];

  useEffect(() => {
    if (section !== 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (store.get().menuOpen || !store.get().entered) return;
      if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
      if (e.key === 'ArrowRight') selectProduct(store.get().product + 1);
      if (e.key === 'ArrowLeft') selectProduct(store.get().product - 1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [section]);

  return (
    <Layer indices={[0]} label="All products">
      {(active) => (
        <>
          {!webgl && <Image className="hero-fallback" src={p.render} alt={`${p.name} vial`} width={320} height={640} priority />}
          <Reveal as="p" show={active} delay={0.2} className="hero-tagline">Physician-guided peptides. Started 100% online.</Reveal>
          <div className="hero-title-block">
            <div className="hero-name-row">
              <Arrow dir={-1} />
              <ProductTitle index={index} show={active} />
              <Arrow dir={1} />
            </div>
            <p className="hero-meta">
              <span>{CATEGORIES[p.category].name}</span>
              <i aria-hidden="true" />
              <span className="hero-meta-vial">{p.vial} vial</span>
            </p>
            <div className="hero-track" role="group" aria-label="Choose a product">
              {PRODUCTS.map((q, i) => (
                <button key={q.id} type="button" aria-label={q.name} aria-pressed={i === index} onClick={() => selectProduct(i)} />
              ))}
            </div>
          </div>
          <Reveal show={active} delay={0.35} className="hero-hint">
            <span className="hero-hint-line" aria-hidden="true" />
            Scroll to explore
          </Reveal>
        </>
      )}
    </Layer>
  );
}
```

- [ ] **Step 2: Mount it**

In `app/page.tsx` add `import { HeroLayer } from '@/components/sections/HeroLayer';` and render `<HeroLayer />` right after `<Experience />`.

- [ ] **Step 3: Check in the browser**

Run checks: `npm test && npx tsc --noEmit && npm run lint`. At `/?intro=skip` compare with `mockups/hero.html` (Ink ground) at 1440x900 and 375x812: name in RBNo2.1 capitals under the center vial, category and vial size in Light Blue below it, the 12-step track, arrows either side (hidden on the phone), tagline top left, "Scroll to explore" at the bottom. Arrows, track, keyboard arrows and dragging must all move the carousel, and the name must change as the center vial changes. "Tesamorelin / Ipamorelin" must wrap on the phone without overflowing.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add the hero layer: product name, meta, arrows and track

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Product walk layer and rail

**Files:**
- Create: `components/sections/ProductLayer.tsx`, `components/sections/ProductRail.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Layer`, `Reveal`, `RollLabel`, `IconArrow`, `goToSection`, `WALK_SECTIONS`, `FIRST_PRODUCT`, `LAST_PRODUCT`, `productForSection`, `sectionForProduct`, `PRODUCTS`, `CATEGORIES`, `ASSESSMENT_URL`, `productUrl`, `pad2`.
- Produces: `ProductLayer` (layer for sections 1 to 12), `ProductRail({ current })`.

- [ ] **Step 1: Write `components/sections/ProductRail.tsx`**

```tsx
'use client';

import { PRODUCTS, pad2 } from '@/lib/products';
import { sectionForProduct } from '@/lib/scroll/sections';
import { goToSection } from '@/lib/scroll/instance';

export function ProductRail({ current }: { current: number }) {
  return (
    <nav aria-label="All products" className="product-rail">
      <ol>
        {PRODUCTS.map((p, i) => (
          <li key={p.id}>
            <button type="button" aria-current={i === current ? 'true' : undefined} onClick={() => goToSection(sectionForProduct(i))}>
              <span className="rail-num">{pad2(i + 1)}</span>
              {p.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 2: Write `components/sections/ProductLayer.tsx`**

```tsx
'use client';

import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import { ASSESSMENT_URL, CATEGORIES, PRODUCTS, productUrl, type Product } from '@/lib/products';
import { FIRST_PRODUCT, LAST_PRODUCT, WALK_SECTIONS, productForSection } from '@/lib/scroll/sections';
import { goToSection } from '@/lib/scroll/instance';
import { store, useApp } from '@/lib/store';
import { Layer } from '@/components/ui/Layer';
import { Reveal } from '@/components/ui/Reveal';
import { RollLabel } from '@/components/ui/RollLabel';
import { IconArrow } from '@/components/ui/icons';
import { ProductRail } from './ProductRail';
import { cn } from '@/lib/cn';

const fadeDelay = (show: boolean, s: number): CSSProperties => ({ transitionDelay: show ? `${s}s` : '0s' });

function ProductPanel({ p, show, delay, current }: { p: Product; show: boolean; delay: number; current: boolean }) {
  return (
    <article className="product-panel" aria-hidden={current ? undefined : true} inert={!current}>
      <Reveal as="h2" show={show} delay={delay} className="display product-name">{p.name}</Reveal>
      <Reveal as="p" show={show} delay={delay + 0.05} className="product-cat">{CATEGORIES[p.category].name}</Reveal>
      <Reveal as="p" show={show} delay={delay + 0.1} className="product-about">{p.about}</Reveal>
      <dl className={cn('product-specs fade', show && 'is-on')} style={fadeDelay(show, delay + 0.2)}>
        <div><dt>Strength</dt><dd>{p.strength}</dd></div>
        <div><dt>Format</dt><dd>Injectable, {p.vial} vial</dd></div>
      </dl>
      <ul className={cn('product-focus fade', show && 'is-on')} style={fadeDelay(show, delay + 0.26)}>
        {p.focus.map((f) => <li key={f}>{f}</li>)}
      </ul>
      <div className={cn('product-actions fade', show && 'is-on')} style={fadeDelay(show, delay + 0.32)}>
        <a className="btn btn-primary roll-host" href={productUrl(p)} target="_blank" rel="noreferrer" aria-label={`View ${p.name} on trybbpeptides.com`}>
          <RollLabel text="View product" />
          <IconArrow />
        </a>
        <a className="btn btn-outline" href={ASSESSMENT_URL} target="_blank" rel="noreferrer">Start assessment</a>
      </div>
    </article>
  );
}

// The outgoing panel leaves upward while the new one reveals, so copy swaps with the label on the vial.
function PanelStack({ index, show }: { index: number; show: boolean }) {
  const [items, setItems] = useState([{ index, n: 0 }]);
  const last = items[items.length - 1];
  if (last.index !== index) setItems([last, { index, n: last.n + 1 }]);
  return (
    <div className="product-stack">
      {items.map((it, i) => {
        const current = i === items.length - 1;
        return <ProductPanel key={it.n} p={PRODUCTS[it.index]} show={show && current} delay={current ? 0.3 : 0} current={current} />;
      })}
    </div>
  );
}

export function ProductLayer() {
  const index = useApp((s) => s.product);
  const section = useApp((s) => s.section);
  const webgl = useApp((s) => s.webgl);
  const p = PRODUCTS[index];

  // Left and right arrows step through the walk.
  useEffect(() => {
    if (productForSection(section) === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (store.get().menuOpen || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
      if (e.key === 'ArrowRight' && section < LAST_PRODUCT) goToSection(section + 1);
      if (e.key === 'ArrowLeft' && section > FIRST_PRODUCT) goToSection(section - 1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [section]);

  return (
    <Layer indices={WALK_SECTIONS} label="Product details">
      {(active) => (
        <>
          <p className="product-ghost" aria-hidden="true">{p.short}</p>
          {!webgl && <Image className="product-fallback" src={p.render} alt={`${p.name} vial`} width={320} height={640} />}
          <PanelStack index={index} show={active} />
          <ProductRail current={index} />
        </>
      )}
    </Layer>
  );
}
```

- [ ] **Step 3: Mount it**

In `app/page.tsx` add `import { ProductLayer } from '@/components/sections/ProductLayer';` and render `<ProductLayer />` after `<HeroLayer />`.

- [ ] **Step 4: Check in the browser**

Run checks: `npm test && npx tsc --noEmit && npm run lint`. At 1440x900 page from the hero into the walk and through to `p12`: the vial spins once per page, the label never visibly changes, the panel copy leaves and the new copy reveals as the vial lands, the rail marks the current product, and clicking a rail item far away (01 to 11) lands on it with the right label. "View product" opens the matching trybbpeptides.com page in a new tab. At 375x812 the vial sits in the top half and the panel stacks below without overlapping it; tune `focusY` and `camZ` in `mobile()` in `lib/stage/keyframes.ts` if they collide. Also load with WebGL disabled (in Chrome, `--disable-webgl`, or temporarily make `hasWebGL()` return false): the render image and copy must still follow the section.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add the product walk panel, ghost name and product rail

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Range layer

**Files:**
- Create: `components/sections/RangeLayer.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Layer`, `Reveal`, `RANGE`, `useApp` (`hover`, `webgl`), `PRODUCTS`, `productUrl`.
- Produces: `RangeLayer` (layer for section 13).

- [ ] **Step 1: Write `components/sections/RangeLayer.tsx`**

```tsx
'use client';

import Image from 'next/image';
import { PRODUCTS, productUrl } from '@/lib/products';
import { RANGE } from '@/lib/scroll/sections';
import { useApp } from '@/lib/store';
import { Layer } from '@/components/ui/Layer';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';

// Hovering a vial in the row (lib/boot.ts) lifts it and names it here. The links below are the
// keyboard and touch route to every product page.
export function RangeLayer() {
  const hover = useApp((s) => s.hover);
  const webgl = useApp((s) => s.webgl);
  return (
    <Layer indices={[RANGE]} label="The full lineup">
      {(active) => (
        <>
          <Reveal as="h2" show={active} className="display range-title">The full lineup</Reveal>
          {!webgl && (
            <div className="range-fallback" aria-hidden="true">
              {PRODUCTS.map((p) => <Image key={p.id} src={p.render} alt="" width={160} height={320} />)}
            </div>
          )}
          <p className={cn('range-hover', hover !== null && 'is-on')} aria-hidden="true">{hover !== null ? PRODUCTS[hover].name : ''}</p>
          <ul className={cn('range-links dim-list fade', active && 'is-on')} style={{ transitionDelay: active ? '0.3s' : '0s' }}>
            {PRODUCTS.map((p) => (
              <li key={p.id}>
                <a href={productUrl(p)} target="_blank" rel="noreferrer">{p.name}</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </Layer>
  );
}
```

- [ ] **Step 2: Mount it**

In `app/page.tsx` add `import { RangeLayer } from '@/components/sections/RangeLayer';` and render `<RangeLayer />` after `<ProductLayer />`.

- [ ] **Step 3: Check in the browser**

Run checks: `npm test && npx tsc --noEmit && npm run lint`. At `/?intro=skip&section=range`: 12 vials in one row, all inside the viewport at 1440 and 1920 wide (adjust `camZ` in the `range` keyframe or `ROW_GAP` if the ends clip); hovering a vial lifts it and shows its name in Light Blue; clicking it opens its product page; the link list sits at the bottom and wraps on a phone.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add the range row layer with hover names and product links

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Closing sections

**Files:**
- Create: `lib/content.ts`, `tests/content.test.ts`, `components/ui/Accordion.tsx`, `components/sections/HowItWorks.tsx`, `components/sections/AssessmentBand.tsx`, `components/sections/FaqSection.tsx`, `components/sections/Footer.tsx`, `components/sections/ClosingSection.tsx`
- Modify: `app/page.tsx`, `app/globals.css` (one rule)

**Interfaces:**
- Consumes: `CLOSING`, `useApp`, `Reveal`, `IconPlus`, `ASSESSMENT_URL`, `SITE_ORIGIN`, `pad2`.
- Produces: `HOW_IT_WORKS`, `CANDIDATE_NOTE`, `FAQS: readonly { q: string; a: string }[]`, `LEGAL`, `SUPPORT_EMAIL`, `COPYRIGHT`, `FOOTER_LINKS`, `SOCIAL` from `lib/content.ts`; `Accordion({ items })`; `ClosingSection`.

- [ ] **Step 1: Write the failing test**

`tests/content.test.ts`:

```ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { CANDIDATE_NOTE, COPYRIGHT, FAQS, FOOTER_LINKS, HOW_IT_WORKS, LEGAL, SOCIAL } from '@/lib/content';

it('carries the live site FAQ and three steps', () => {
  expect(FAQS.map((f) => f.q)).toEqual([
    'What are peptides?',
    'How do I choose the right peptide?',
    'How should I store my peptides?',
    'Do I need a healthcare provider before use?',
  ]);
  expect(HOW_IT_WORKS).toHaveLength(3);
});

it('has no em or en dashes anywhere', () => {
  const all = [
    CANDIDATE_NOTE, COPYRIGHT, LEGAL,
    ...FAQS.flatMap((f) => [f.q, f.a]),
    ...HOW_IT_WORKS.flatMap((s) => [s.title, s.body]),
    ...FOOTER_LINKS.map((l) => l.label),
  ];
  for (const s of all) expect(s).not.toMatch(/[\u2014\u2013]/);
});

it('links only to trybbpeptides.com and ships every social icon', () => {
  for (const l of FOOTER_LINKS) expect(l.href.startsWith('https://www.trybbpeptides.com')).toBe(true);
  expect(SOCIAL).toHaveLength(5);
  for (const s of SOCIAL) expect(existsSync(join(process.cwd(), 'public/social', `${s.id}.svg`))).toBe(true);
});
```

Run: `npx vitest run tests/content.test.ts`
Expected: FAIL, cannot resolve `@/lib/content`.

- [ ] **Step 2: Write `lib/content.ts`**

The four FAQs are verbatim from `../bodybuilding-peptides/src/db-peptides/shared/home-faqs.ts`; the legal line and copyright are verbatim from that repo's footer. The three steps paraphrase the last FAQ answer and add no new claim.

```ts
import { SITE_ORIGIN } from './products';

export const HOW_IT_WORKS = [
  {
    title: 'Take the online assessment',
    body: 'Tell us about your goals, health history and symptoms. It happens 100% online, through a secure medical questionnaire.',
  },
  {
    title: 'A licensed provider reviews it',
    body: 'A licensed healthcare provider reviews your information. If they need more, they may ask for a phone or video consultation first.',
  },
  {
    title: 'Treatment ships to you',
    body: 'When a prescription is appropriate, it is fulfilled by a licensed U.S. compounding pharmacy and shipped directly to you.',
  },
] as const;

export const CANDIDATE_NOTE = 'A prescription is required. Prescriptions are issued only when medically appropriate, and not everyone is a candidate.';

export const FAQS = [
  {
    q: 'What are peptides?',
    a: 'Peptides are short chains of amino acids used in physician-guided wellness programs to support goals across metabolic health, recovery and repair, healthy aging, brain health, immune function, skin and hair, and sexual wellness. Options on our platform include 5-Amino-1MQ and MOTS-C to support weight management, BPC-157 and Glow Blend to support recovery, and Semax / Selank to support cognitive wellness.',
  },
  {
    q: 'How do I choose the right peptide?',
    a: 'Start with your goals (weight loss, recovery, healthy aging, brain health, sleep, immune support, skin and hair, sexual wellness, or digestive wellness) then complete our online health assessment. A licensed healthcare provider reviews your medical history, symptoms, and goals and, if appropriate, recommends a personalized treatment plan. Prescriptions are issued only when medically appropriate, and not everyone is a candidate.',
  },
  {
    q: 'How should I store my peptides?',
    a: 'Storage instructions depend on the specific formulation prescribed for you. Follow the guidance included with your medication from the licensed compounding pharmacy and your healthcare provider. If you have questions about refrigeration, light exposure, or how long a product remains usable after opening, contact your provider or pharmacy for product-specific directions.',
  },
  {
    q: 'Do I need a healthcare provider before use?',
    a: 'Yes. A prescription is required. Treatments are available only after evaluation by a licensed healthcare provider. Getting started is easy: complete our online health assessment, and a provider will review your information. In many cases the consultation can be completed through our secure medical questionnaire; if more information is needed, they may request a phone or video consultation before recommending treatment. When prescribed, medication is fulfilled by a licensed U.S. compounding pharmacy and shipped directly to you.',
  },
] as const;

export const LEGAL =
  'All medications are prescribed by licensed healthcare providers and fulfilled by licensed U.S. compounding pharmacies. Compounded medications are not FDA-approved. Individual results may vary. Results are not guaranteed. The information on this website is for educational purposes only and is not intended as medical advice or to diagnose, treat, cure, or prevent any disease.';

export const SUPPORT_EMAIL = 'support@trybbpeptides.com';

export const COPYRIGHT = '© 2026 Bodybuilding Peptides, Inc. All rights reserved. Bodybuilding Peptides is a trademark of Bodybuilding.com, Inc.';

export const FOOTER_LINKS = [
  { label: 'All products', href: `${SITE_ORIGIN}/` },
  { label: 'About', href: `${SITE_ORIGIN}/about` },
  { label: 'FAQ', href: `${SITE_ORIGIN}/faq` },
  { label: 'Terms and Conditions', href: `${SITE_ORIGIN}/terms-and-conditions` },
  { label: 'Privacy Policy', href: `${SITE_ORIGIN}/privacy-policy` },
  { label: 'Returns & Refunds', href: `${SITE_ORIGIN}/returns-and-refunds` },
] as const;

export const SOCIAL = [
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/bodybuildingcom/' },
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/Bodybuildingcom/' },
  { id: 'twitter-x', label: 'X', href: 'https://twitter.com/bodybuildingcom' },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@bodybuildingcom' },
  { id: 'threads', label: 'Threads', href: 'https://www.threads.net/@bodybuildingcom' },
] as const;
```

Run: `npx vitest run tests/content.test.ts`
Expected: PASS.

- [ ] **Step 3: Write `components/ui/Accordion.tsx`**

```tsx
'use client';

import { useId, useState, type CSSProperties } from 'react';
import { IconPlus } from './icons';
import { cn } from '@/lib/cn';

// One duration for the height collapse and the delayed visibility flip, so a closing panel hides exactly when it is shut.
const COLLAPSE_MS = 500;

export function Accordion({ items }: { items: readonly { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <ul className="acc dim-list">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <li key={it.q}>
            <h3>
              <button
                type="button"
                id={`${id}-b${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-p${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="acc-button"
              >
                {it.q}
                <span className="acc-icon"><IconPlus /></span>
              </button>
            </h3>
            <div
              id={`${id}-p${i}`}
              role="region"
              aria-labelledby={`${id}-b${i}`}
              inert={!isOpen}
              style={{ '--acc-ms': `${COLLAPSE_MS}ms`, '--acc-delay': isOpen ? '0ms' : `${COLLAPSE_MS}ms` } as CSSProperties}
              className={cn('acc-panel grid', isOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]')}
            >
              <div className="overflow-hidden">
                <p className="acc-answer">{it.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
```

Add to `app/globals.css`, right after the `.acc-icon` rule: `.acc-icon svg { display: block; width: 100%; height: 100%; }`

- [ ] **Step 4: Write the four closing components**

`components/sections/HowItWorks.tsx`:

```tsx
'use client';

import { CANDIDATE_NOTE, HOW_IT_WORKS } from '@/lib/content';
import { pad2 } from '@/lib/products';
import { CLOSING } from '@/lib/scroll/sections';
import { useApp } from '@/lib/store';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';

export function HowItWorks() {
  const shown = useApp((s) => s.entered && s.section === CLOSING);
  return (
    <section aria-labelledby="how-title" className="closing-block how">
      <Reveal as="h2" show={shown} className="display closing-title"><span id="how-title">How it works</span></Reveal>
      <ol className={cn('how-steps fade', shown && 'is-on')} style={{ transitionDelay: shown ? '0.2s' : '0s' }}>
        {HOW_IT_WORKS.map((s, i) => (
          <li key={s.title}>
            <span className="how-num">{pad2(i + 1)}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
      <p className="how-note">{CANDIDATE_NOTE}</p>
    </section>
  );
}
```

`components/sections/AssessmentBand.tsx`:

```tsx
'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { ASSESSMENT_URL } from '@/lib/products';
import { RollLabel } from '@/components/ui/RollLabel';
import { IconArrow } from '@/components/ui/icons';

// The one full Electric Blue field on the page, at the moment we ask for the action.
// The video loads only as the band nears the viewport and pauses when it leaves.
export function AssessmentBand() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) v.src = '/video/couple.mp4';
          if (!reduced) void v.play().catch(() => undefined);
        } else {
          v.pause();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="band-title" className="band">
      <video ref={video} className="band-video" muted loop playsInline preload="none" poster="/video/couple-poster.jpg" aria-hidden="true" />
      <div className="band-inner">
        <div>
          <Image className="band-mark" src="/logos/b-mark-white.svg" alt="" width={88} height={67} unoptimized />
          <h2 id="band-title" className="display band-title">Are peptides for you?</h2>
          <p className="band-copy">Start your assessment today. It is 100% online, and a licensed provider reviews every one.</p>
        </div>
        <a className="btn btn-primary roll-host" href={ASSESSMENT_URL} target="_blank" rel="noreferrer" aria-label="Start your assessment">
          <RollLabel text="Start your assessment" />
          <IconArrow />
        </a>
      </div>
    </section>
  );
}
```

`components/sections/FaqSection.tsx`:

```tsx
'use client';

import { FAQS } from '@/lib/content';
import { CLOSING } from '@/lib/scroll/sections';
import { useApp } from '@/lib/store';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Accordion';

export function FaqSection() {
  const shown = useApp((s) => s.entered && s.section === CLOSING);
  return (
    <section id="faq" aria-labelledby="faq-title" className="closing-block faq">
      <Reveal as="h2" show={shown} className="display closing-title"><span id="faq-title">Questions, answered</span></Reveal>
      <div className="faq-list">
        <Accordion items={FAQS} />
      </div>
    </section>
  );
}
```

`components/sections/Footer.tsx`:

```tsx
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { COPYRIGHT, FOOTER_LINKS, LEGAL, SOCIAL, SUPPORT_EMAIL } from '@/lib/content';
import { SITE_ORIGIN } from '@/lib/products';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <a className="footer-logo" href={SITE_ORIGIN} target="_blank" rel="noreferrer" aria-label="Bodybuilding Peptides +, powered by bodybuilding.com">
          <Image src="/logos/bb-peptides-full-white.svg" alt="" width={500} height={133} unoptimized />
        </a>
        <ul className="footer-social">
          {SOCIAL.map((s) => (
            <li key={s.id}>
              <a className="social" href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                <span style={{ '--icon': `url(/social/${s.id}.svg)` } as CSSProperties} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <ul className="footer-links dim-list">
        {FOOTER_LINKS.map((l) => (
          <li key={l.label}><a href={l.href} target="_blank" rel="noreferrer">{l.label}</a></li>
        ))}
      </ul>
      <p className="footer-legal">
        {LEGAL} For questions about our pharmacy partners, contact <a href={`mailto:${SUPPORT_EMAIL}`}>our support team</a>.
      </p>
      <p className="footer-copy">{COPYRIGHT}</p>
    </footer>
  );
}
```

`components/sections/ClosingSection.tsx`:

```tsx
import { HowItWorks } from './HowItWorks';
import { AssessmentBand } from './AssessmentBand';
import { FaqSection } from './FaqSection';
import { Footer } from './Footer';

// The one free-scrolling section. Its top is the "closing" section boundary the pager and timeline measure.
export function ClosingSection() {
  return (
    <section id="closing" data-section="closing" aria-label="How it works, assessment and questions" className="closing">
      <HowItWorks />
      <AssessmentBand />
      <FaqSection />
      <Footer />
    </section>
  );
}
```

- [ ] **Step 5: Render the closing section in `app/page.tsx`**

Add `import { ClosingSection } from '@/components/sections/ClosingSection';` and change the spacer map to:

```tsx
        {SECTIONS.map((id) =>
          id === 'closing' ? (
            <ClosingSection key={id} />
          ) : (
            <div key={id} id={id} data-section={id} aria-hidden="true" className={id === 'range' ? 'spacer spacer--short' : 'spacer'} />
          ),
        )}
```

- [ ] **Step 6: Check in the browser**

Run checks: `npm test && npx tsc --noEmit && npm run lint && npm run build`. Scroll past the range row: the vials rise out of frame and the canvas fades; "How it works" shows three steps in a hairline row (stacked on a phone); the Electric Blue band plays the muted video behind white type and the button turns Ink on hover; the FAQ opens the first answer, toggles with Enter and Space; the footer shows the lockup, five social icons, links, legal and copyright. Nav "FAQ" lands on the FAQ heading below the nav.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add how it works, the assessment band, FAQ and footer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: SEO

**Files:**
- Create: `lib/structured-data.ts`, `app/sitemap.ts`, `tests/structured-data.test.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `FAQS`, `PRODUCTS`, `productUrl`, `SITE_ORIGIN`, `SITE`, `absoluteUrl`.
- Produces: `structuredData(): { '@context': string; '@graph': object[] }`.

- [ ] **Step 1: Write the failing test**

`tests/structured-data.test.ts`:

```ts
import { expect, it } from 'vitest';
import { structuredData } from '@/lib/structured-data';
import { PRODUCTS, productUrl } from '@/lib/products';

it('describes the organization, site, the 12 vials and the FAQ', () => {
  const g = structuredData()['@graph'] as Record<string, unknown>[];
  expect(g.map((n) => n['@type'])).toEqual(['Organization', 'WebSite', 'ItemList', 'FAQPage']);
  const list = g[2] as { itemListElement: { url: string; position: number }[] };
  expect(list.itemListElement.map((i) => i.url)).toEqual(PRODUCTS.map(productUrl));
  expect(list.itemListElement[0].position).toBe(1);
  expect((g[3] as { mainEntity: unknown[] }).mainEntity).toHaveLength(4);
});
```

Run: `npx vitest run tests/structured-data.test.ts`
Expected: FAIL.

- [ ] **Step 2: Write `lib/structured-data.ts`**

```ts
import { FAQS } from './content';
import { PRODUCTS, SITE_ORIGIN, productUrl } from './products';
import { SITE, absoluteUrl } from './site';

// One @graph for the page: who runs it, the site, the 12 vials (each pointing at its live product page), and the FAQ.
export function structuredData() {
  const org = { '@id': `${SITE_ORIGIN}/#organization` };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', ...org, name: SITE.company, url: SITE.companyUrl, logo: absoluteUrl('/logos/bb-peptides-full-white.svg') },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        url: absoluteUrl('/'),
        name: SITE.name,
        description: SITE.description,
        inLanguage: 'en-US',
        publisher: org,
      },
      {
        '@type': 'ItemList',
        '@id': absoluteUrl('/#products'),
        name: 'Bodybuilding Peptides + vials',
        numberOfItems: PRODUCTS.length,
        itemListElement: PRODUCTS.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.name,
          url: productUrl(p),
          image: absoluteUrl(p.render),
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': absoluteUrl('/#faq'),
        mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  };
}
```

- [ ] **Step 3: Write `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/lib/products';
import { absoluteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'monthly',
      priority: 1,
      images: PRODUCTS.map((p) => absoluteUrl(p.render)),
    },
  ];
}
```

- [ ] **Step 4: Emit the JSON-LD in `app/page.tsx`**

Add `import { structuredData } from '@/lib/structured-data';` and, as the first child of the fragment:

```tsx
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, '\\u003c') }}
      />
```

- [ ] **Step 5: Run checks and the build**

```bash
npx vitest run tests/structured-data.test.ts
npm test && npx tsc --noEmit && npm run lint && npm run build
```

Expected: PASS. In the build output, `/sitemap.xml`, `/robots.txt` and `/manifest.webmanifest` are listed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add structured data for the 12 vials and the FAQ, and the sitemap

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Visual QA, share image, review and handoff

**Files:**
- Modify: `scripts/shoot.mjs`, anything the review round finds
- Create: `app/opengraph-image.png`, `app/twitter-image.png`, `app/opengraph-image.alt.txt`, `app/twitter-image.alt.txt`, `docs/HANDOFF.md`, `DESIGN.md` (by the documenter)

**Interfaces:**
- Consumes: the finished page.
- Produces: screenshots in `qa/shots/` (gitignored), the share image, a reviewed build, `DESIGN.md`, `docs/HANDOFF.md`.

- [ ] **Step 1: Point the screenshot script at the new sections**

In `scripts/shoot.mjs`:
- Replace the `SECTIONS` and `FLAVORS` constants with:

```js
const SECTIONS = (process.env.SECTIONS ?? 'hero,p01,p03,p05,p08,p12,range,closing').split(',');
```

- Add `og: [1200, 630]` to `ALL_VIEWPORTS`.
- Change `mkdtempSync(join(tmpdir(), 'hiatus-shoot-'))` to `mkdtempSync(join(tmpdir(), 'bbp-shoot-'))`.
- Replace the inner `for (const fl of FLAVORS) { ... }` loop with a single capture per section:

```js
    for (const sec of SECTIONS) {
      const file = `${OUT}/${vp}-${sec}.png`;
      try {
        await cdp.send('Page.navigate', { url: `${BASE}/?intro=skip&section=${sec}` });
        await sleep(500);
        const until = Date.now() + TIMEOUT;
        for (;;) {
          const { result } = await cdp.send('Runtime.evaluate', {
            expression: "document.readyState === 'complete' && !document.querySelector('.preloader')",
          });
          if (result.value === true) break;
          if (Date.now() > until) throw new Error('preloader still on screen');
          await sleep(250);
        }
        await sleep(SETTLE);
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
        writeFileSync(file, Buffer.from(data, 'base64'));
        console.log(file);
      } catch (err) {
        failed++;
        console.error(`${file}: ${err.message}`);
      }
    }
```

- Update the header comment's env list (drop `FLAVORS`).

- [ ] **Step 2: Build with debug params on and capture**

```bash
NEXT_PUBLIC_DEBUG=1 npm run build && (npx next start -p 3100 &) && sleep 4
npm run shoot
VIEWPORTS=laptop SECTIONS=hero,p03 npm run shoot
```

Expected: `qa/shots/{desktop,wide,mobile}-{section}.png` for every section listed, and `laptop-hero.png`, `laptop-p03.png`. A capture is valid only if it shows what its name says: no black canvas, no preloader, no half-revealed copy. Recapture any invalid one with `SETTLE=5000`.

- [ ] **Step 3: Review the captures against the brief in one batch**

Open every capture. Check, and write down every miss before fixing anything:
- Hero matches `mockups/hero.html` (Ink): lamp beam, glossy floor line, arc, name scale, track, tagline, counter.
- Walk: vial label front-on and readable, panel never overlaps the vial, rail on desktop only, ghost name behind, category light visibly different on `p05` and `p12`.
- `p03` mobile: "Tesamorelin / Ipamorelin" wraps cleanly; nothing overflows 375 to 390px wide.
- Range: all 12 vials in frame at 1280, 1440 and 1920 wide.
- Closing: hairline steps, band, FAQ, footer; nothing from the canvas shows through.
- Brand rules: only the four colors, square corners, no White on Light Blue, no em dashes in visible copy.

Then run the mechanical detector once:

```bash
/Users/flavioczuk/.claude/skills/impeccable/scripts/impeccable detect --json app components
```

- [ ] **Step 4: Fix everything from Step 3 in one batch, rebuild, recapture once**

Typical places: framing in `lib/stage/keyframes.ts` (`WALK`, `range`, `mobile()`), vial look in `lib/stage/Vial.ts` (glass `envMapIntensity`, cap roughness), label layout in `lib/stage/label.ts`, light in `lib/stage/Lights.ts`, layout and type in `app/globals.css`. Then:

```bash
npm test && npx tsc --noEmit && npm run lint
pkill -f "next start -p 3100"; NEXT_PUBLIC_DEBUG=1 npm run build && (npx next start -p 3100 &) && sleep 4
npm run shoot
```

Review the new captures once. Do not start a third round; list anything left for the finish review.

- [ ] **Step 5: Make the share image**

```bash
VIEWPORTS=og SECTIONS=hero npm run shoot
cp qa/shots/og-hero.png app/opengraph-image.png
cp qa/shots/og-hero.png app/twitter-image.png
echo "Twelve Bodybuilding Peptides + vials on a dark stage, CJC-1295 / Ipamorelin in the center" > app/opengraph-image.alt.txt
cp app/opengraph-image.alt.txt app/twitter-image.alt.txt
pkill -f "next start -p 3100"
npm run build
```

Expected: the build lists `/opengraph-image.png` and `/twitter-image.png`.

- [ ] **Step 6: Measure performance**

```bash
npm run build && (npx next start -p 3200 &) && sleep 4
npx --yes lighthouse@12 http://localhost:3200 --quiet --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=qa/lighthouse.json
node -e "const r=require('./qa/lighthouse.json');for(const[k,v]of Object.entries(r.categories))console.log(k,Math.round(v.score*100))"
pkill -f "next start -p 3200"
```

Expected: accessibility, best practices and SEO 100; performance 90+ on the default mobile run. Record the numbers in the handoff. Fix accessibility findings now; leave performance tuning beyond that for a follow-up and say so.

- [ ] **Step 7: Write `docs/HANDOFF.md`**

```markdown
# BB Peptides promo landing: handoff notes

Design intent: `docs/superpowers/specs/2026-10-10-bb-peptides-promo-design.md`. Build plan: `docs/superpowers/plans/2026-10-10-bb-peptides-promo.md`. Product facts: `PRODUCT.md`. Approved brand sample: `mockups/hero.html`.

## Run it

    npm run dev

- Debug params (dev, or a build with `NEXT_PUBLIC_DEBUG=1`): `/?intro=skip&section=<id|index>&product=<id>`
  - sections: `hero, p01 ... p12, range, closing`
  - products: the ids in `lib/products.ts`, for example `bpc-157`
- 3D tuning page with a timeline scrubber: `/stage-test` (dev only).
- Screenshots: `npm run shoot` against a debug build on :3100. Output in `qa/shots/`. Env: `SECTIONS`, `VIEWPORTS`, `BASE`, `OUT`.
- Checks: `npm test && npx tsc --noEmit && npm run lint && npm run build`.

## Where to tweak what

| Want to change | File |
|---|---|
| Products, copy, strengths, focus bullets, URLs | `lib/products.ts` |
| How it works, FAQ, legal, footer links, socials | `lib/content.ts` |
| Camera, vial pose and lights per section | `lib/stage/keyframes.ts` (hero = `DEFAULT_VALUES` in `lib/stage/values.ts`) |
| The walk: spin, label swap rule, category light mix | `lib/stage/walk.ts`, `lib/stage/Carousel.ts` |
| Vial shape and materials | `lib/stage/Vial.ts` |
| Label artwork | `lib/stage/label.ts` |
| Lights | `lib/stage/Lights.ts`; reflections in `lib/stage/Studio.ts` |
| Paging feel and durations | `lib/scroll/sections.ts` (`pageDuration`), `lib/scroll/Pager.ts` |
| Tokens and every component style | `app/globals.css` |
| Section UI | `components/sections/*`; chrome in `components/chrome/*` |

## Swapping in Blender models later

`lib/stage/ProductModel.ts` is the only contract the carousel and stage use. A GLB model per packaging type implements `group`, `labelIndex`, `setLabel(i)` and `dispose()`; give each product a `model` field naming its packaging and pick the class in `Stage.load()`. The oral and nasal products can then join `PRODUCTS`.

## Open items

- Melanotan II strength ("2 mg / 1 mL") is read off its render; confirm with the client.
- Lighthouse (local production build): fill in from Task 13 Step 6.
- Copy rule for this repo: no em dashes, no emojis.
```

Fill in the Lighthouse line with the numbers from Step 6.

- [ ] **Step 8: Finish review and design record (Impeccable)**

Capture `qa/review/desktop.png` (1440 wide, the hero) and `qa/review/mobile.png` (390 wide, the hero) from the latest shots, then spawn the `impeccable-finish-reviewer` agent with: the original request (promo landing for BB Peptides on the Hiatus layout, products spinning, a walk through every vial, range, FAQ and assessment, Ink ground), the spec path, `PRODUCT.md`, `mockups/hero.html` as the approved reference, every capture in `qa/shots/` and `qa/review/`, the detector output from Step 3, and `/Users/flavioczuk/.claude/skills/impeccable/reference/craft-floor.md`. Act on its disposition word (`ship`, `fix`, `rebuild`, `recapture`) as `reference/new-work.md` section 7 describes, within two rounds. Then spawn the `impeccable-documenter` agent with the project root, `app/page.tsx` as the artifact, the spec, `PRODUCT.md` and `/Users/flavioczuk/.claude/skills/impeccable/reference/document.md`, to write `DESIGN.md` and `.impeccable/design.json` from the build.

- [ ] **Step 9: Final checks and commit**

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
git add -A
git commit -m "Add the share image, handoff notes and design record after visual QA

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
