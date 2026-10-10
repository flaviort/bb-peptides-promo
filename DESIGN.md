---
name: Bodybuilding Peptides + Promo
description: A lit product stage for the 12 injectable vials, one at a time under a cool lamp on an Ink room.
colors:
  ink: "#111111"
  electric-blue: "#3B60FF"
  light-blue: "#89B5FC"
  white: "#FFFFFF"
  label-stripe: "#6E8EFF"
  hairline: "rgb(255 255 255 / 0.14)"
  hairline-strong: "rgb(255 255 255 / 0.3)"
  muted: "rgb(255 255 255 / 0.62)"
typography:
  display:
    fontFamily: "RBNo2.1, Poppins, sans-serif"
    fontSize: "clamp(2.4rem, 6.4vw, 6rem)"
    fontWeight: 500
    lineHeight: 0.92
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "RBNo2.1, Poppins, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 5rem)"
    fontWeight: 500
    lineHeight: 0.92
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1
rounded:
  none: "0px"
spacing:
  gutter: "clamp(20px, 4vw, 56px)"
  xs: "8px"
  sm: "12px"
  md: "24px"
  lg: "48px"
  section: "112px"
components:
  button-primary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.electric-blue}"
    textColor: "{colors.white}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-outline-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
  button-square:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    size: "48px"
  focus-chip:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "0 14px 0 12px"
    height: "36px"
  nav-link:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    height: "44px"
---

# Design System: Bodybuilding Peptides + Promo

## Overview

**Creative North Star: "The Lamp Room"**

A dark room, one lamp, one vial. The page is an Ink (#111111) ground that the brand blues light from above and below, never paint. Electric Blue arrives as floor pools, the vial labels and a handful of glowing indicators; Light Blue is the lamp itself and the category text it would print in. White carries the type. The whole range appears first as an arc of 12 vials, then the scroll walks them one at a time: each focus vial makes one full turn per page in place, its label swaps only while it faces away, and the copy panel swaps in the same beat. Blue stardust hangs in the air in front of all of it.

Structure is drawn, not boxed. Hairlines (1px white at 14% and 30%), a faint 12-column floor grid and square controls hold the page together; nothing is rounded and nothing floats on a drop shadow. Display type is RBNo2.1 Medium Italic in capitals, set huge and tight; everything that has to be read is Poppins. Density is low on the stage (one name, one meta line, one track) and rises only in the closing reading sections.

Provenance: this world was pinned by the client's 2026 brand book (recorded in `../bodybuilding-peptides/DESIGN.md`) and a brand sample the user approved (`mockups/hero.html`, with the Ink ground chosen by the user). The Impeccable concept roll was deliberately not run, so there is no seed key. The structural and motion base is forked from the Hiatus promo (`../hiatus`).

**Key Characteristics:**
- Ink ground, lit by Electric Blue and Light Blue gradients that read as light falling on a floor.
- One focus vial at a time; the label and the panel copy swap together while the vial faces away.
- RBNo2.1 Medium Italic caps for names and headlines, Poppins for everything read.
- Square corners everywhere; hairlines instead of cards.
- Glow is reserved for light sources and Electric Blue indicators.

## Colors

Four brand colors and one label-only tint, with white alphas doing all the neutral work.

### Primary
- **Electric Blue** (#3B60FF): the brand's voice. Floor light pools (`.pool--electric`, up to 42% alpha), the vial label ground and cap, the 2px scroll progress line, the active hero track step, the focus-chip dot, the product rail tick, text selection, the primary button hover and the one full-color field on the page, the assessment band.

### Secondary
- **Light Blue** (#89B5FC): the lamp. The hero lamp bar and beam, the floor line, the recovery category pool, the overhead 3D spot (mixed 60% into white), category names (`.hero-meta`, `.product-cat`, `.range-hover`, `.menu-group-title`), step numbers in How it works, and the outlined ghost name at 16% alpha.

### Tertiary
- **Label Stripe** (#6E8EFF): the lighter band printed round the client's vials. It exists only on the canvas-drawn 3D label, behind the vial size. White on it is about 3:1, so only 600-weight label type sits there.

### Neutral
- **Ink** (#111111): page ground, preloader, menu panel (97%), solid nav (94%), primary button text, the hemisphere light's ground color.
- **White** (#FFFFFF): headlines, body, primary button fill, focus ring, square control icons.
- **Muted** (rgb(255 255 255 / 0.62)): secondary text: tagline, nav links, spec terms, notes, legal, vial size, counters.
- **Hairline** (rgb(255 255 255 / 0.14)): dividers, spec rows, accordion rules, the nav and footer edge.
- **Hairline Strong** (rgb(255 255 255 / 0.3)): outlines on square controls, chips and social buttons.

### Named Rules
**The Light Not Paint Rule.** On the stage, blue is never a flat fill behind content. It arrives as radial pools from below, a beam from above, a lamp bar or a lit indicator. The single exception is the assessment band, the one full Electric Blue field, placed at the moment the page asks for the action.

**The No White On Light Blue Rule.** Light Blue is a text and light color on Ink. Never set White text or the logo on a Light Blue fill (brand book).

**The Category Light Rule.** Each category owns a lighting state, not a ground color: Muscle Growth is the Electric pool, Recovery & Vitality the Light Blue pool, Neuro & Cognitive the narrow beam. Crossing categories blends the pools and the 3D rim tint over the middle half of a step.

## Typography

**Display Font:** RBNo2.1 Medium Italic (self-hosted Latin woff2, licensed; falls back to Poppins)
**Body Font:** Poppins 400, 500, 600 (with system-ui)

**Character:** A fast, slanted, all-caps sports face for names and headlines against a round, plain geometric sans that does every reading job. The italic carries the energy; Poppins keeps the facts calm.

### Hierarchy
- **Display** (500 italic caps, clamp(2.4rem, 6.4vw, 6rem), line-height 0.92, -0.01em): the hero product name, revealed by character. The ghost name behind the walk vial (its own back layer, under the canvas) goes larger (clamp(6rem, 19vw, 18rem), 0.86, -0.02em) as a 1px Light Blue outline at 16%.
- **Headline** (500 italic caps, clamp(2.6rem, 6vw, 5rem), 0.92): closing section titles. The band title runs to 6rem, the walk product name to 4.4rem, the range title to 4.5rem (a fixed 3.4rem on phones, where it is the only copy on the lineup), menu links at clamp(1.5rem, 2.4vw, 2.25rem).
- **Title** (Poppins 600, 20px, 1.3): How it works step titles. Accordion questions use 500 at clamp(18px, 2vw, 22px).
- **Body** (Poppins 400, 16px, 1.625): product about (42ch), FAQ answers (70ch), step copy at 15px (38ch). Band copy runs 18px / 1.6.
- **Label** (Poppins 500 to 600, 13 to 15px, line-height 1): buttons (14px 600), nav links, category meta (15px), chips (13px 500), rail and range links (13px). Numbers are tabular everywhere they count.

### Named Rules
**The Italic Caps Is For Names Rule.** RBNo2.1 sets product names, section headlines and menu links, always italic, uppercase and 500. It never sets a sentence of body copy, a button or a label.

**The Tabular Count Rule.** Strengths, vial sizes, step numbers, menu numbers, rail numbers and the preloader count use `font-variant-numeric: tabular-nums`.

## Layout

The stage is a fixed full-viewport canvas (z 2) over a fixed Backdrop (z 0) and a back layer for the walk's ghost name (z 1), with fixed content layers (z 3) that cross-fade per scroll page, the stardust canvas (z 5) and a fixed nav (z 6). Scroll is paged: each section is a 125vh spacer and the Pager snaps the timeline between keyframes. The closing reading sections scroll normally over an Ink gradient.

The horizontal unit is `--gutter` (clamp(20px, 4vw, 56px)). The backdrop grid divides the space inside the gutters into 12 columns at 4.5% white, masked to fade at the edges. Stage copy sits 28px inside the gutter (tagline top-left, product panel left at min(400px, 32vw), product rail right).

Spacing steps observed: 8, 12, 24, 32, 48px for gaps, 112px vertical padding in closing blocks (80px on small screens), max widths of 1320px (How it works) and 960px (FAQ).

Breakpoints: 860px drops the product rail, stacks the product panel along the bottom and collapses the menu and How it works to one column; 640px shortens the nav to 72px, hides the hero tagline and arrows.

## Elevation & Depth

Flat UI, lit room. No component lifts off the page with a drop shadow. Depth comes from the 3D stage (fog that dissolves the hero arc into the Ink, a cool overhead spot, an Electric Blue rim from below and behind), from the radial floor pools, and from layering fixed planes. `box-shadow` appears in two roles only: as an inset 1px hairline that draws outlines without changing box size, and as a glow on things that emit light.

### Shadow Vocabulary
- **Hairline outline** (`box-shadow: inset 0 0 0 1px var(--hair-strong)`): square controls, focus chips, social buttons. The outline button uses white at 60%.
- **Indicator glow** (`box-shadow: 0 0 12px rgb(59 96 255 / 0.9)`): the active hero track step; 10px on the progress line, 8px on the chip dot.
- **Lamp glow** (`box-shadow: 0 0 24px 6px rgb(137 181 252 / 0.55), 0 10px 60px 20px rgb(59 96 255 / 0.35)`): the hero lamp bar only.

### Named Rules
**The Only Light Glows Rule.** A glow is allowed when the element is a light source or an Electric Blue indicator (lamp, progress line, active step, chip dot). Buttons, panels, chips and menus never get a shadow.

## Shapes

Square, always (0px radius, no exceptions in the build). Controls are squares or rectangles outlined by a 1px hairline. Small marks are squares too: the 2x2 menu-toggle squares (5px), the 4px meta separator, the 6px chip dot, the 4px track bars. The beam is a clipped trapezoid (`clip-path: polygon(40% 0, 60% 0, 92% 100%, 8% 100%)` on a child) whose parent is blurred 28px and masked to fade toward the floor, so its edges feather instead of cutting. Icons are a single stroke set at 1.6px.

## Components

### Buttons
Blunt, square, high contrast.
- **Shape:** square corners (0px), 48px tall, 20px side padding, 14px Poppins 600, 10px gap to a 16px stroke arrow.
- **Primary:** White fill, Ink text. Hover goes to Electric Blue with White text; on the Electric band the hover goes to Ink. The label rolls letter by letter (18ms stagger) and the arrow nudges 3px right.
- **Outline:** transparent with a 1px inset White 60% outline; hover fills White with Ink text.
- **Square:** 48px, hairline-strong outline, 18px chevron; hover fills White. Used for the hero previous and next arrows.
- **Active:** scale(0.98). **Focus:** 2px White outline, 3px offset (global).

### Chips
- **Focus chip:** 36px tall, inset hairline-strong outline, 13px 500 White, led by a 6px Electric Blue square dot with an 8px glow. Three per product, read-only.

### Cards / Containers
There are no cards. Grouping uses hairline rules: spec rows (96px term column, 12px vertical padding), How it works columns divided by vertical hairlines, accordion items between top and bottom hairlines.

### Navigation
- **Nav:** 96px (72px on phones), three columns: menu toggle left, centered white lockup (clamp(132px, 14vw, 200px)), FAQ link and primary Start assessment right. Transparent over the stage; over the closing sections it gains a 94% Ink ground and a bottom hairline.
- **Menu:** full-screen 97% Ink panel that wipes down with `clip-path`, three category groups with Light Blue group names, italic caps links with tabular muted numbers, hover dims siblings to 30%.
- **Product rail:** right-aligned list of 13px names at 50% White; the current one goes White with a 20px Electric Blue tick that scales in.

### Hero track
Twelve 22px hit targets, each a 4px bar at 22% White drawn at half height. The current step grows to full height in Electric Blue with a 12px glow.

### Accordion
Question rows at clamp(18px, 2vw, 22px) 500 with a 20px stroke plus that rotates 45 degrees when open; answers at 16px / 1.625 in 78% White, 70ch.

### The Stage (signature)
A 5 mL serum vial: reflection-only glass (additive blending, clearcoat, faint blue body tint #0A1028) so the Ink and pools show through, a chrome crimp (#D9DDE4, metal 1, roughness 0.22), an Electric Blue cap, and a canvas-drawn wrap label (Electric Blue ground, Label Stripe band, White Poppins type, "Rx only" at 75%). The environment is a small HDR product studio of softboxes and strip lights so chrome reads as bands. Hero: 12 vials on an arc, center vial under a Light Blue spot, ring fogged into the Ink from 11 to 21 units. Walk: one vial at three-quarter tilt, panel on its left, one full turn per page about its own long axis, so it spins in place, with a rock of under a degree at mid spin. A jump that skips products makes two turns in at most 1.2s and swaps the label once, straight to the destination. The label texture swaps only when the label faces away from the camera, and the panel copy leaves upward while the new copy reveals in sync.

**Stardust** (`lib/stardust.ts`): a 2D canvas over the content layers, under the nav, about one speck per 11,000 px² of viewport. Each speck is a soft Electric Blue glow with a pale blue-white core; it wanders up to 24px, twinkles, and nearer specks are larger and brighter. It fades in on entering and fades out as soon as the page leaves the lineup for the reading sections.

**Grid room** (`lib/stage/GridRoom.ts`): the full lineup's backdrop, after React Bits' Grid Scan. One full-screen quad drawn behind the vials casts a ray per pixel into a box room (half width 1.7, half height 1) gridded in Light Blue at 32%, fogged with depth. An Electric Blue scan band with a white core sweeps down the room's length in 3.2s every 5s, leaving a short trail on the lines, and the room tilts a few degrees toward the pointer. It fades in with the row and out as the camera drops into the closing page; with reduced motion the sweep stands still. It sits on the far plane and skips every pixel a vial covers (depth for the label and cap, a stencil silhouette for the glass), so the lines and the scan pass behind the products.

**Lineup magnifier** (`rowMagnify` in `lib/stage/layout.ts`): the row swells like a wave around a focus point, up to 1.3x at the peak and back to rest about three vials out, while the neighbours step aside. On desktop the focus follows the cursor; on touch screens it is the middle of the view, which a sideways swipe slides along the row.

## Do's and Don'ts

### Do:
- **Do** put blue on the stage as light: radial pools from the floor, a beam, a lamp bar, a glowing indicator.
- **Do** set product names and headlines in RBNo2.1 Medium Italic caps at weight 500 with line-height 0.92, and everything read in Poppins.
- **Do** keep every corner square (0px) and draw outlines with a 1px inset hairline (rgb(255 255 255 / 0.14) or 0.3).
- **Do** show category with Light Blue text and a lighting state, not a colored ground.
- **Do** use White fill with Ink text for the primary action, Electric Blue on hover.
- **Do** keep one product in focus at a time and swap its label and copy together while the vial faces away.

### Don't:
- **Don't** round anything.
- **Don't** put drop shadows on buttons, panels, chips or menus; glow belongs only to light sources and Electric Blue indicators.
- **Don't** set White text or the logo on a Light Blue fill.
- **Don't** flood the stage with a flat Electric Blue background; the assessment band is the one full blue field.
- **Don't** use the Label Stripe (#6E8EFF) outside the vial label.
- **Don't** set body copy, buttons or labels in the italic display face.
