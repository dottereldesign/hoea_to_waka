# Workshop SVG illustrations — 6 November 2026

## Placement
- `assets/workshop-art/blooming-profile.svg`: Wellbeing / Notice needs before overwhelm.
- `assets/workshop-art/shared-puzzle.svg`: Connection / Understand each other better.
- The Meaning slide is unchanged.

## Construction and colour
Both are hand-built vector illustrations using paths, groups, clipping paths and subtle linear gradients at the original 1448 × 1086 coordinate size. No embedded raster images, grain filters, tracing service or font dependencies. Semantic group IDs separate people, hands, pieces, stems, flowers and petals for future edits.

Source images supplied by the user: `Blooming profile against evergreen.png` and `Four pieces, one shared solution.png` in Downloads. Kept their evergreen background and overall composition. Replaced the darkest purple with #281A2C (crown interior, upper-left hair and lower-left dark clothing); retained distinct lighter plum shades for the puzzle piece and clothing panels. Navy hair remains navy.

These are close clean-vector recreations, not pixel-identical reproductions: original raster grain is intentionally omitted, and curves/shading are simplified. The reference-to-SVG comparison and 50% overlay are saved in `design/comparisons/workshop-blooming-svg.png` and `design/comparisons/workshop-puzzle-svg.png`.

## Refinements from comparison
- Matched face silhouette, open crown, curved stems, bell flowers and scattered petals in source coordinates.
- Closed a thin seam between the pink profile's overlapping shading bands by sharing the boundary curve.
- Corrected the lower-left neck/ear connection in the puzzle image.
- Increased the peach-piece/foreground-hand contrast so the hand remains legible.
- Kept full artwork visible with object-fit: contain and matching evergreen backing, rather than cropping the landscape composition into the narrow desktop slot. Mobile images keep their 4:3 ratio.

## Checks
Rendered against originals side-by-side and overlaid. Checked both carousel slides at 1440, 768 and 390 pixels, image loading, navigation, no horizontal overflow, no page errors and scoped axe A/AA checks. Before/after page captures are in local `tmp/workshop-*.png` files.

For future tracing, establish shared edges and skin/puzzle contrast early, then check at the final display size as well as full resolution. Keep shape groups separate so later hover motion does not require retracing.
