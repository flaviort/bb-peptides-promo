# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, TypeScript), Tailwind CSS, GSAP (ScrollTrigger, SplitText), Lenis, Three.js (vanilla). Forked from the Hiatus promo landing (`../hiatus`), which is the structural and motion base.

## Users

Visitors arriving from campaigns and social who are curious about peptides for training, recovery and body composition. They want to see what is on offer, understand each product in a sentence, and move to the product page or the online assessment on trybbpeptides.com.

## Product Purpose

A single-page promo for Bodybuilding Peptides + (trybbpeptides.com), powered by bodybuilding.com. It presents the 12 injectable vial products one at a time in a scroll-driven 3D sequence and hands visitors off to the real product pages and the assessment. Frontend only: no cart, checkout or backend.

## Positioning

Physician-guided peptides, started 100% online: complete an assessment, a licensed provider reviews it, and if appropriate the treatment ships from a licensed U.S. compounding pharmacy. This is the framing of the live site and its product data.

## Capabilities and Constraints

- Products in the walk (all injectable vials): CJC-1295 / Ipamorelin, Tesamorelin, Tesamorelin / Ipamorelin, MOTS-C, BPC-157, TB-500, Wolverine Blend, Glow Blend, Epitalon, Thymosin Alpha-1, Melanotan II, Semax / Selank. Oral tablets, capsules and nasal sprays are out of scope for now; Blender models for every packaging type may arrive later.
- Each product shows: category, name, supplied strength and vial size, a short description, three focus bullets, and a link to its trybbpeptides.com product page. No prices.
- Every outbound link points at trybbpeptides.com (product pages) or intake.trybbpeptides.com (assessment).
- No medical, treatment or cure claims beyond the live site's own copy. Prescription required; not everyone is a candidate.
- No invented testimonials, studies, reviews, before/after results or performance data.
- Extras carried from Hiatus: preloader with real progress. Not carried: music, age gate, infinite loop.

## Brand Commitments

Source: Bodybuilding Peptides Plus brand book 2026 (V1.0), recorded in `../bodybuilding-peptides/DESIGN.md`.

- Colors: Electric Blue `#3B60FF`, Light Blue `#89B5FC`, Dark Gray `#111111`, White. The user asked for a darker, blue-led tone for this promo.
- Type: RBNo2.1 Medium Italic in capitals for headlines (licensed, self-hosted woff2, never redistributed); Poppins for body.
- Square corners, no drop shadows, hairline structure. Never White text or the logo on Light Blue.
- Logo: horizontal full lockup with the "powered by bodybuilding.com" line, icon and B-mark, blue and white variants.

## Evidence on Hand

- Product renders, logos and font in `../bodybuilding-peptides/public/branding-guide-assets/` and `src/assets/fonts-peptides/`.
- Product facts in `../bodybuilding-peptides/src/db-peptides/products/` (about text, bullets, catalog strength).
- Home FAQs in `src/db-peptides/shared/home-faqs.ts`; lifestyle video `public/videos-peptides/couple.mp4`.
