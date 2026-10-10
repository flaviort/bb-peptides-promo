# BB Peptides promo landing: handoff notes

Next-session agenda and traps: `docs/SESSION-HANDOFF.md`. Design intent: `docs/superpowers/specs/2026-10-10-bb-peptides-promo-design.md`. Build plan: `docs/superpowers/plans/2026-10-10-bb-peptides-promo.md`. Product facts: `PRODUCT.md`. Approved brand sample: `mockups/hero.html`.

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
- Lighthouse on a local production build (2026-10-10): mobile performance 98 (median of 99, 98, 94; LCP about 2.3s, TBT about 40ms, CLS 0), desktop 99. Accessibility, best practices and SEO 100. A cold first run scored 74 (about 2s of script on the simulated phone: Three.js setup and drawing the 12 canvas labels); moving label drawing to an OffscreenCanvas worker is the lever if that matters.
- Phones show part of the range row; the link list below it names all 12 products.
- Running `npm run build` while `npm run dev` is up replaces the dev server's cache; restart the dev server afterwards.
- Copy rule for this repo: no em dashes, no emojis.
