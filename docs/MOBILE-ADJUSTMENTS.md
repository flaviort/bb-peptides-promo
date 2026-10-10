# Mobile adjustments (from WhatsApp notes, 2026-10-10)

Notes Flávio sent to himself between 16:45 and 16:50, each with a phone screenshot.

1. **Preloader:** the BB logo is cut off on the right side.
2. **The Full Lineup:**
   - Remove the product names listed under the vials.
   - Add a scroll-down cue like the one on the hero.
   - Make the title a bit bigger.
   - Let the user swipe or scroll left and right through the vials.
3. **Product detail (e.g. CJC-1295 / Ipamorelin):**
   - Anchor the info block (description, strength, format, CTA) to the bottom of the screen so it stays clear of the product.
   - Remove the three benefit tags (Growth Hormone Production, Recovery Support, Body Composition) to give it breathing room.
4. **Range menu (numbered product list):** remove the outline/focus border around the active item on mobile, or fix how it looks.
5. **Menu overflow:** when the menu is taller than the phone screen, the page can't be scrolled. Make it scroll.

## Status

All five were built on 2026-10-10 and checked at 375x667 and 390x844 (headless Chrome, touch emulation):

- The B-mark SVG's viewBox was 88 wide while the art runs to 94.52, which cut the logo in the preloader and the assessment band.
- The lineup slides sideways under a finger (`Stage.panRange`, clamp in `rangePanLimit`), and the pager ignores sideways touch swipes.
- The menu could not scroll because `Pager.intercept` cancels touch events before Lenis reads `data-lenis-prevent`; it now lets marked elements through.
