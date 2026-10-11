# Session handoff: BB Peptides promo landing

Start here in the next session. This covers where the build stands, what is still open, and the traps that cost time last session. For how to run and where to tweak each thing, see `docs/HANDOFF.md`.

## Where things stand (2026-10-10)

- The first full build is done and merged: `main`, `origin/main` and `build/promo-landing` all point at `c3beb78`.
- 82 tests pass (`npm test`). The type check, lint and production build are clean.
- Lighthouse on a local production build: phone performance 98 (median of three runs), desktop 99; accessibility, best practices and SEO 100.
- The user likes the direction and has said a couple of adjustments will follow. Those adjustments are the agenda for the next session.

## Read these first

| File | What it holds |
|---|---|
| `PRODUCT.md` | Product truth: who it is for, the 12 vials, constraints, brand commitments |
| `DESIGN.md`, `.impeccable/design.json` | The visual system, as built: tokens, type, named rules, the signature interaction |
| `docs/superpowers/specs/2026-10-10-bb-peptides-promo-design.md` | The approved design spec |
| `docs/superpowers/plans/2026-10-10-bb-peptides-promo.md` | The build plan; all 13 tasks are done |
| `docs/HANDOFF.md` | How to run it, debug params, the file for each tweak, open items |
| `mockups/hero.html` | The brand sample the user approved (Ink ground) |

## How the user likes to work

- **Process:** run `/superpowers:brainstorming` for any new work and `/impeccable` for everything visual. Ask one question at a time and get approval before building.
- **Copy:** no em dashes and no emojis anywhere, including code comments and commit messages (global rule in `~/.claude/CLAUDE.md`).
- **Brand:** only the four brand colors (Ink `#111111`, Electric Blue `#3B60FF`, Light Blue `#89B5FC`, White). RBNo2.1 italic capitals for names and headlines, Poppins for everything else, square corners. The user chose the darker "Ink" ground over a navy one.
- **Base:** the layout is a fork of the Hiatus promo (`../hiatus`); the client source is `../bodybuilding-peptides`.

## Open adjustments (likely agenda)

### Raised by the design review, not yet resolved

1. **Lit label colour.** Under the walk lamp, the label and cap read lighter than Electric Blue (they sample about `#6276F9`, against `#3B60FF`). Lowering the walk key light and spot did not fix it.
   - Next lever: the label material in `lib/stage/Vial.ts`, either lower albedo or a slightly darker canvas fill in `lib/stage/label.ts`. Check the cap and the spot tint in `lib/stage/Lights.ts` too.
2. **Hero hierarchy.** Outer vials now shrink (`lib/stage/Carousel.ts`) and fade into the fog (`lib/stage/values.ts`, fog 11 to 21). The two nearest neighbours are still as bright as the lit center vial.
   - Option: dim the off-center labels per model, for example a `setDim(k)` on `VialModel` that scales the label colour.
   - Not built: the floor reflection under the center vial that the mockup has.
3. **Melanotan II strength.** "2 mg / 1 mL" is read off its product render; the client catalog has no entry for it. It ships on the page and the label as fact, so it needs client confirmation (`lib/products.ts`).

### Smaller items deferred from the code review

- The no-WebGL path still pages section by section; the spec asks for native scroll there (`lib/boot.ts`, `paging: !reduced`).
- The focus vial can change if a wheel scroll arrives before a long hero carousel move has settled. Fix: freeze `center` while `focus > 0`, or set `pos = target` when leaving the hero (`lib/stage/Carousel.ts`).
- The `facesAway` threshold (`cos(ry) < -0.2`, in `lib/stage/walk.ts`) is loose; about -0.6 would be safer. Only deferred swaps use it, because swaps normally happen on the half-turn frame.
- Long names ("Tesamorelin / Ipamorelin", "Thymosin Alpha-1") have not been checked on a short 375x667 phone. The panel grows upward and may cover the vial.
- `SITE_URL` falls back to `http://localhost:3000` outside Vercel when `NEXT_PUBLIC_SITE_URL` is unset (`lib/site.ts`). Set the variable before deploying anywhere else.
- No tests yet for reduced motion going backwards, or for the boot-timeout wiring.

## Decisions already made (do not undo without a reason)

- **Light and glass:**
  - Neutral tone mapping instead of ACES, because ACES washed Electric Blue into lavender.
  - The glass is reflection-only, with additive blending and a faint `0x0a1028` tint. Transmission renders the transparent page black.
- **Walk:**
  - The walk value runs -1 (hero), 0 to 11 (products), 12 (range).
  - Labels swap at the half turn, plus on the very first frame (for deep links).
  - Jumps take at least 0.28s per product with a sine ease, so swaps never show, even at 30fps.
- **Range:** the row is placed by product index (always 01 to 12, centred), with the camera at `camZ: 26`. Phones show part of the row; the name list below covers all 12.
- **Chrome:**
  - The 01 / 12 counter was removed, since the hero track and walk rail already show position. Phones hide the rail, so since 2026-10-10 they show a small vertical 01 / 12 beside the walk vial.
  - The nav gets an Ink background, and the frame hides, over the closing sections.
- **Labels:** they keep category, strength, volume and "Rx only", like most of the client's own renders.
- **Visual direction:** the Impeccable concept roll was not run. The brand book plus the approved mockup pinned the look, and `DESIGN.md` records this.

## Traps from last session

- **Builds break the dev server.** Running `npm run build` while `npm run dev` is up replaces the dev cache, and the dev server then serves stale CSS. Restart the dev server after any build.
- **`next build` can ship stale CSS.** On 2026-10-11 a rebuild kept an old `globals.css` chunk (same hash, new rules missing). If a CSS change does not show, `rm -rf .next` and build again, and grep the built chunk for the new rule.
- **The hidden browser pane pauses animation frames,** so Lenis and the walk do not advance there. Check scroll behaviour with `node scripts/verify-paging.mjs` (headless Chrome against the dev server on :3000), and screenshots with `npm run shoot` (headless Chrome against a `NEXT_PUBLIC_DEBUG=1` build on :3100, output in `qa/shots/`, which is gitignored).
- **Screenshots can show a stale frame.** A screenshot taken right after a navigation may show a frame from before the stage reported the product. Read the DOM, or wait and screenshot again, before treating it as a bug.
- **Edit CSS with exact, unique anchors.** A text replace that matched `.pool--range {` twice corrupted the floor-light rules once.
- **Run the detector after UI edits:** `/Users/flavioczuk/.claude/skills/impeccable/scripts/impeccable detect --json app components`. It was clean at the end.
- **Shipped images carry their origin** (`impeccable embed-prompt --scan public app` reports 16 of 16). Embed the origin in any new or replaced raster.

## Quick commands

    npm run dev                                   # http://localhost:3000/?intro=skip
    open "http://localhost:3000/?intro=skip&section=p05"
    npm test && npx tsc --noEmit && npm run lint && npm run build
    node scripts/verify-paging.mjs                # needs npm run dev on :3000
    NEXT_PUBLIC_DEBUG=1 npm run build && npx next start -p 3100   # then: npm run shoot
