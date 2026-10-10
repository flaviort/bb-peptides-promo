# BB Peptides promo landing: design spec

Date: 2026-10-10
Status: approved in brainstorming, pending written-spec review

## 1. Goal

A single-page promo for **Bodybuilding Peptides +** (trybbpeptides.com, powered by bodybuilding.com) built on the Hiatus promo landing (`../hiatus`): same structure, motion system and 3D craft, with BB Peptides products, facts and brand. All 12 injectable vials spin in a hero carousel; scrolling brings one vial forward with its details, then each further page spins it into the next product; the full range returns at the end, followed by how it works, the assessment call to action, FAQ and footer.

Frontend only. Out of scope: cart, checkout, pricing, analytics, CMS, music and sound, age gate, infinite loop, reviews, before/after photos, press logos.

Product truth lives in `PRODUCT.md`. The approved brand sample is `mockups/hero.html` (Ink ground).

## 2. Stack

Forked from Hiatus, same versions: Next.js 16 (App Router, TypeScript), React 19, Tailwind 4, GSAP 3 (ScrollTrigger, SplitText) with `@gsap/react`, Lenis, Three.js (vanilla, no React Three Fiber), Vitest. Read `node_modules/next/dist/docs/` before writing Next-specific code (see `AGENTS.md`).

## 3. Products

Twelve injectable vials, in walk order. Source: `../bodybuilding-peptides/src/db-peptides/products/` (about text, bullets) and `catalog-dosage.ts` (strength).

| # | Product | Category | Strength | Vial | Focus |
|---|---|---|---|---|---|
| 01 | CJC-1295 / Ipamorelin | Muscle Growth | 1.5 mg / 2.5 mg per mL | 6 mL | Growth Hormone Production, Recovery Support, Body Composition |
| 02 | Tesamorelin | Muscle Growth | 3 mg/mL | 5 mL | Growth Hormone Support, Lean Muscle Preservation, Metabolic Health |
| 03 | Tesamorelin / Ipamorelin | Muscle Growth | 3 mg / 2 mg per mL | 5 mL | Growth Hormone Signaling, Recovery Support, Body Composition |
| 04 | MOTS-C | Muscle Growth | 2 mg/mL | 5 mL | Cellular Energy, Exercise Performance, Healthy Aging |
| 05 | BPC-157 | Recovery & Vitality | 3 mg/mL | 5 mL | Natural Healing, Recovery & Mobility, Tissue Health |
| 06 | TB-500 | Recovery & Vitality | 10 mg / 3 mL | 3 mL | Recovery & Mobility, Tissue Health, Physical Performance |
| 07 | Wolverine Blend | Recovery & Vitality | 1.66 mg / 3.33 mg per mL | 3 mL | Recovery & Mobility, Tissue Health, Active Lifestyle |
| 08 | Glow Blend | Recovery & Vitality | 9 mg / 1.66 mg / 3.33 mg per mL | 3 mL | Skin Health, Tissue Recovery, Overall Rejuvenation |
| 09 | Epitalon | Recovery & Vitality | 2 mg/mL | 5 mL | Cellular Health, Healthy Aging, Long-Term Vitality |
| 10 | Thymosin Alpha-1 | Recovery & Vitality | 5 mg/mL | 5 mL | Immune Function, Immune Health, Overall Resilience |
| 11 | Melanotan II | Recovery & Vitality | 2 mg / 1 mL | 5 mL | Melanin Production, Even Skin Tone, Personalized Tanning |
| 12 | Semax / Selank | Neuro & Cognitive | 1 mg / 1 mg per mL | 5 mL | Cognitive Performance, Focus, Stress Management |

- Strength and vial size are the supplied catalog strengths, not dosing schedules.
- Each product has a one or two sentence description condensed from its `about` text, keeping only claims the source makes.
- Product URL: `https://www.trybbpeptides.com/{categorySlug}/{slug}` with the BB repo's `slugify` rules. MOTS-C uses `muscle-growth`. Slugs: `cjc-1295-ipamorelin`, `tesamorelin`, `tesamorelin-ipamorelin`, `mots-c`, `bpc-157`, `tb-500`, `wolverine-blend`, `glow-blend`, `epitalon`, `thymosin-alpha-1`, `melanotan-ii`, `semax-selank`. Links open in a new tab.
- Assessment URL: `https://intake.trybbpeptides.com/s/assessment`.
- Melanotan II's catalog strength is not in `catalog-dosage.ts`; the value above is read off its product render. Confirm with the client before launch.

## 4. Experience

### 4.1 Preloader

Ink screen, the B-mark draws on, a percentage counter tracks real loading (fonts via `document.fonts`, the Three.js chunk, label canvases, environment map). At 100% the intro runs: the lamp fades up, the camera dollies in, vials converge onto the arc, nav and frame slide in, hero copy reveals. An 8s safety timeout lifts the loader and falls back to the static path. The Hiatus open item about a stalled (not failing) load is fixed here: race the Stage import and `load()` against the timeout, dispose and set `webgl: false` on loss.

### 4.2 Scroll architecture

Same as Hiatus: stacked spacer sections with fixed visible layers, one paused master timeline holding every scene value, keyframes placed by section.

Sections: `hero, p01 … p12, range, closing` (15).

- Wheel paging (desktop) and swipe paging (mobile, 24px threshold) from `hero` through `range`. One input moves one section with a cubic ease out (1.4s for hero to p01 and for p12 to range, 0.9s between products), input locked during the move.
- `closing` scrolls freely with native-feeling Lenis scroll.
- No loop. Reaching the end stops at the footer.
- Top progress line in Electric Blue.

### 4.3 Sections

| Section | 3D | Content |
|---|---|---|
| `hero` | All 12 vials on a gentle arc, tilted, dimmed and softened with distance from center. A Light Blue lamp bar above the center vial casts a cool beam; a glossy floor line reflects the center vial. Drag or swipe with momentum and snap, mouse tilt, idle wobble. | Product name (RBNo2.1 italic caps), category and vial size in Light Blue Poppins, square prev and next arrows, 12-step track, 01 / 12 counter, "Physician-guided peptides. Started 100% online." in the frame, "Scroll to explore". Clicking the center vial goes to that product's section. |
| `p01`–`p12` | Side vials fall away and fade. The focus vial sits center, tilted about 14 degrees, mouse influence reduced. Each page spins it one full turn; the label swaps out of sight (4.4). | Left panel: name, category, description, a hairline spec list (Strength, Format "Injectable, 5 mL vial"), three focus tags, "View product" (primary) and "Start assessment" (outline). Ghosted outline name behind the vial. Right rail lists all 12 with the active one marked; clicking jumps. |
| `range` | Camera pulls back; all 12 vials stand in one row. Hovering a vial lifts it and shows its name. | Heading "The full lineup", each vial clickable to its product page. |
| `closing` | Canvas fades out and stops rendering. | How it works, assessment band, FAQ, footer (4.6). |

Entering the walk from the hero: the side vials fall away while the center vial spins once and lands as product 01, so the walk always starts at 01 whichever vial was centered. Clicking the center vial is the shortcut to its own section.

### 4.4 The walk and the label swap

The timeline writes a continuous `walk` value: -1 at `hero`, 0 at `p01` through 11 at `p12`, 12 at `range` and `closing`, interpolated linearly between sections. The focus vial adds `2π × frac(walk)` to its Y rotation, so it turns once per page.

The label the focus vial should show is `labelTarget(walk)`: product `round(walk)` while that is between 0 and 11, otherwise the vial's own product. A pending label is applied only while the vial faces away from the camera (`cos(ry) < -0.2` on its final pose), so a swap is never seen, at any scroll speed, in either direction, including the hero to `p01` move (the vial spins once and lands as product 01) and the `p12` to `range` move (it spins once and becomes itself again before rejoining the row). Vials that are not in focus always show their own product.

Clicking the center vial in the hero pages to that vial's own section; the walk spins through the products in between and lands on it.

During the spin the vial dips slightly and its tilt eases back, so the turn reads as a deliberate move rather than a wobble. The panel copy leaves upward when the label swaps and the new copy reveals as the vial lands (SplitText lines, as in Hiatus). The product shown in the UI is always the label actually on the vial.

### 4.5 Category lighting

The ground stays Ink. Category shows in the light, driven by `walk`:

- Muscle Growth (01–04): Electric Blue floor pool at full strength, warm-white key.
- Recovery & Vitality (05–11): pool cools toward Light Blue, a softer, wider beam.
- Neuro & Cognitive (12): pool narrows to a tight beam on the vial.

Transitions blend over the half-page around a category boundary.

### 4.6 Closing sections

1. **How it works.** Three steps in a hairline row: take the online assessment; a licensed provider reviews your history and goals; if appropriate, your treatment ships from a licensed U.S. compounding pharmacy. Wording comes from the live site's FAQ copy. Note that not everyone is a candidate.
2. **Assessment band.** The one full-bleed Electric Blue field on the page, `couple.mp4` (copied from the BB repo) behind it at low opacity, white type: "Are peptides for you?", "Start your assessment", white primary button to the assessment URL.
3. **FAQ.** The four home FAQs from `home-faqs.ts`, verbatim, in the Hiatus accordion (`aria-expanded`, hover dims siblings).
4. **Footer.** White full lockup, links to trybbpeptides.com (Products, About, FAQ, Terms and Conditions, Privacy Policy, Returns & Refunds), social links from the BB repo, prescription and legal notice, copyright.

### 4.7 Persistent chrome

- Nav: left, Menu (2x2 squares icon, nudges on hover); center, white full lockup linking to trybbpeptides.com; right, FAQ link (jumps to the FAQ) and "Start assessment" (white primary).
- Menu: full-height Ink panel with the 12 products grouped by category, plus FAQ and Start assessment. Focus is trapped while open (fixes the Hiatus open item); Escape closes.
- Frame: corner brackets in white at 30%, counter on the right edge.
- Buttons: brand book behaviour. Primary is White with Dark Gray text, turning Electric Blue with White text on hover. Outline is a 1px White at 60% border, filling White on hover. 48px tall, square. Hiatus's rolling-letter hover stays on desktop.

## 5. Visual system

Approved in `mockups/hero.html` with the Ink ground.

- Colors: only the brand four. Ground Dark Gray `#111111`; Electric Blue `#3B60FF` for light pools, active states and the assessment band; Light Blue `#89B5FC` for the lamp, category text and secondary light; White for type and primary buttons. Hairlines White at 14% and 30%. Muted text White at 62%. No pure black.
- Light, not fills: the room is lit by radial Electric Blue pools and a Light Blue beam; a faint 12-column hairline grid masked toward the center.
- Type: RBNo2.1 Medium Italic, uppercase, line height 0.92, tracking -0.01em, max 6rem, for product names and section headings. Poppins 400, 500 and 600 for everything else, sentence case. Tabular figures for counters and strengths.
- No eyebrow labels above headings: the category sits under the product name.
- Square corners, no shadows on UI. Depth only in the 3D scene.
- Copy: direct, second person where it fits, no em dashes, no emojis, no claims beyond the source copy.
- Browser surfaces themed: selection Electric Blue, focus outline White 2px at 3px offset, scrollbar dark.
- Fonts: RBNo2.1 is a commercial licence, self-hosted from `../bodybuilding-peptides/src/assets/fonts-peptides/rbno21a-medium-italic-latin.woff2`, never redistributed outside the client's projects. Poppins self-hosted via `next/font`.

### 5.1 3D look

- Vial: about 2:1 height to width, matching the renders. Glass body with rounded heel and short shoulder into the neck, aluminium crimp ring (brushed, bright), Electric Blue flip cap (satin plastic). Glass is a reflection-only shell: a black `MeshPhysicalMaterial` with additive blending, so only the studio reflections and rim highlights render and the Ink ground and light pools show through. Transmission is not used (it renders the transparent page as black). High tier adds a back-face shell and clearcoat; low tier uses a single standard-material shell.
- Label: full-wrap band at the lower two thirds of the body, drawn on a canvas at runtime in Poppins: Electric Blue ground, product name in White SemiBold, category line, strength, a Light Blue stripe with the vial size, "Rx only". The back of the wrap carries a quiet hairline block. 2048px wide on high tier, 1024px on low.
- Environment: studio softboxes baked into the environment map (Hiatus `Studio.ts`), recoloured cool. ACES tone mapping.
- Lights: Light Blue overhead spot on the focus vial, Electric Blue rim from below, neutral key.

## 6. Architecture

```
app/
  layout.tsx            fonts, metadata, inline gate scripts
  page.tsx              sections + chrome, mounts <Experience/>
  globals.css           tokens, Ink ground, light pools, buttons
  opengraph-image.tsx, robots.ts, sitemap.ts, manifest.ts
  stage-test/           dev-only tuning page (from Hiatus)
components/
  Experience.tsx        client root
  Backdrop.tsx          Ink ground, pools, grid (replaces GradientWaves)
  chrome/               Nav, Menu, MainShell, Frame
  sections/             Preloader, HeroLayer, ProductLayer, ProductRail, RangeLayer,
                        HowItWorks, AssessmentBand, FaqSection, Footer
  ui/                   Reveal, Layer, Accordion, RollLabel, icons
lib/
  products.ts           the 12 products (single source of truth), url helpers
  content.ts            how-it-works steps, FAQs, legal, nav and footer links
  site.ts, structured-data.ts, store.ts, boot.ts, persist.ts, debug.ts, progress.ts
  stage/
    ProductModel.ts     interface: group, setLabel(i), dispose()
    Vial.ts             VialModel: geometry, materials
    label.ts            canvas label drawing per product
    Stage.ts, Carousel.ts, layout.ts, Lights.ts, Studio.ts, values.ts, keyframes.ts
    walk.ts             walk value to label index, spin angle, category light mix
  scroll/               Pager, sections, math, timeline, instance
public/
  logos/                white lockup, B-mark
  video/couple.mp4
```

Boundaries:

- `ProductModel` is the only thing `Carousel` and `Stage` know about a vial. A future `GlbModel` implements the same interface; each product entry gains an optional `model` field naming its packaging type.
- `Stage` never imports React or touches DOM outside its canvas. It reads the mutable `values` object (now including `walk` and the category light values) every frame.
- `Pager` owns Lenis and paging and reports section changes to `store`.
- React components read `store` (product index, section) and render HTML only.
- `lib/products.ts` is the only place product facts live. Adding a vial product is one entry; the label draws itself.

Quality tiers: high (desktop, DPR up to 2, two-shell clearcoat glass, 12 vials); low (mobile and low-power, DPR up to 1.5, standard glass, 12 vials, 1024px labels).

## 7. Accessibility and resilience

- `prefers-reduced-motion`: no paging, native scroll, reveals become fades, no idle wobble, the focus vial does not spin; it dips (scales down) through each swap and the label changes at the smallest point.
- All product facts exist as real HTML text; the canvas is `aria-hidden`.
- Real buttons with labels and visible focus; arrow keys switch products in the hero and step through the walk; the menu traps focus.
- No WebGL or load failure: static vial renders from the BB repo (`branding-guide-assets/products/*.webp`, Semax / Selank from `img-peptides`) per product, native scroll, all content intact.
- Contrast: only the brand pairing table (White on Electric Blue, Light Blue on Dark Gray, White on Dark Gray). No White on Light Blue.

## 8. Performance budget

- Initial JS under about 190 KB gzip (Hiatus shipped 184 KB); Three.js in a separate chunk.
- No label texture downloads; label canvases drawn after fonts load.
- `couple.mp4` lazy-loaded when the closing section nears, `preload="none"`, poster frame.
- 60fps on a recent laptop, 30fps floor on mid mobile; render loop pauses when hidden and after the canvas fades in `closing`.
- Lighthouse targets: mobile performance 90+, accessibility, best practices and SEO 100.

## 9. SEO

Title, description and Open Graph from the live site's framing (physician-guided peptides, online assessment). Canonical from `NEXT_PUBLIC_SITE_URL`. JSON-LD: Organization, WebSite, an ItemList of the 12 products linking to their trybbpeptides.com pages, FAQPage from the four FAQs. OG image is a static 1200x630 PNG captured from the built hero (RBNo2.1 ships only as woff2, which the build-time image renderer cannot read).

## 10. Verification

- Unit (Vitest): products (12 entries, unique slugs, URL shape, three focus items, no empty fields); walk math (label index changes only while the label faces away, both directions, fractional steps); sections and keyframes (one keyframe per section, `walk` monotonic across p01–p12); store; scroll math.
- Browser: `npm run shoot` adapted to sections `hero, p01…p12, range, closing` at 1440x900 and 390x844, plus a 1920x1080 hero check. Scripted checks: paging lands on each section, rail jumps work, every product link resolves to the expected URL, reduced-motion and no-WebGL paths work, no console errors.
- `npm test && npx tsc --noEmit && npm run lint && npm run build` all pass.
- Impeccable finish review on the built page against the approved mockup, then DESIGN.md recorded from the build.

## 11. Open items

- Melanotan II strength to confirm with the client (section 3).
- Blender models for every packaging type may arrive later; they slot in behind `ProductModel` and would bring the oral and nasal products into the walk.
- User has flagged "a couple of tweaks" to the approved direction, to be applied during the build.
