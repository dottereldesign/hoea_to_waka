# Community illustration reconstruction

Completed 6 November 2026. This study lives on `colour-testing/#community-study`.

## Aim and result

Recreate the four people on the mat as editable code, retain the original beside it, and show the same vector artwork with the existing experimental texture overlaid. Add a direct superimposition check and practical colour and hover controls.

The final drawing has eight named scene groups: background, sun, mat, the four people, and cards. The people also contain named parts such as hair, face, shirt, arms and trousers. `assets/colour-testing/community.svg` contains vector geometry and gradients only, with no embedded reference image. It is approximately 33 KB. This is a close reconstruction, not a claim of pixel-identical tracing. Fine contours, local shading and the original pigment remain different.

The page includes the original, clean SVG and textured SVG at the same 3:4 aspect ratio; full-size inspection dialogs; recolouring; optional hover movement with keyboard equivalents; five texture choices and strength; SVG downloads that retain current choices; and aligned fade, wipe and difference comparisons. Reduced motion suppresses the movement. Static images and original downloads remain available without JavaScript.

## Changelog

### First authored pass

- Used the original 1086 × 1448 image as the coordinate system, rather than drawing from a resized screenshot.
- Drew the mat, four distinct poses, hair, clothing, hands, three cards and four sun rings with editable paths and simple circles.
- Established semantic groups before any texture so each person could be moved independently.
- Saved `01-hand-traced.webp` beside the original. This exposed broad colour differences, especially the rose shirt, sage sleeve and skin tones.

### Colour refinement

- Rendered uniquely coloured region masks from the authored geometry, then sampled interior pixels from the reference.
- Excluded a five-pixel boundary and strong colour outliers to avoid sampling a neighbouring shape.
- Fitted restrained linear gradients to the dominant colour variation in 42 visible regions. Fine pigment noise was deliberately excluded from the drawing.
- Kept named CSS colour variables. Connected the speaker’s sleeve and the foreground right sleeve to their respective shirt controls so recolouring does not accidentally recolour skin.
- Made the fitting helper safe to rerun without duplicate gradient IDs.

### Direct overlay and edge corrections

- Saved a true 50% source/vector superimposition and a difference image amplified four times, both at original resolution. These are `02-overlay-before-corrections.webp` and `02-difference-before-corrections.webp`.
- Inspected sun rings, hands, clothing edges, cards, hair and the mat. Side-by-side viewing had concealed small offsets that the overlay revealed immediately.
- Tested reference-guided normal searches within 12 source pixels of visible boundaries. This reduced long contour errors but initially introduced bumps where a contour went behind another object.
- Corrected the helper to distinguish later-painted occluders from a shape’s own visible boundary, interpolate through hidden stretches and smooth the offsets.
- Rejected the aggressive full-scene result even though many pixels improved. It distorted some sun arcs and shared clothing seams. Adopted only useful corrections to the outer sun, mat, foreground teal shirt and hair, and rear pink leg; retained the smoother authored curves elsewhere.
- Replaced the inner circular assumptions with smooth measured ellipses. Preserved smooth silhouettes rather than following texture flecks or making hundreds of tiny patches.
- Saved the final clean render, overlay and amplified difference as the `03-final-*` images.

### Texture and website integration

- Generated a fresh 1086 × 1448 portrait grain field using the refined experiment’s frequency-based method. This avoids enlarging or stretching the earlier 1200 × 720 landscape field.
- The default texture is a separate neutral WebP layer, blended with soft light at 45%. It never contains fragments of the original artwork. The optional pure SVG texture uses deterministic turbulence.
- Added three aligned panels, an overlay inspector and explicit controls. All three inline SVG instances use distinct IDs, so gradients cannot accidentally resolve to another panel’s definitions.
- Made clean and textured exports self-contained. Texture exports embed the selected grain image, or use an SVG filter for the procedural choice.
- Kept the original palette and the previous twenty texture experiments available.

## Measured comparison

The colour-fitted drawing before the edge corrections had a mean absolute RGB channel difference of **3.60 / 255** from the source. The final drawing measures **3.15 / 255**. Pixels with a difference above 40 in any channel fell from **1.95% to 1.42%**.

These measurements include intentionally omitted texture, gradient differences and contour errors. They are **not a percentage fidelity score**, an edge-distance guarantee, or evidence that every path is perfectly traced. The mostly uniform background also influences the mean. Use the overlays and enlarged details to judge local shapes.

## What I would do differently next time

1. Start with both an overlay and difference view before finishing the first trace. Save a baseline, then compare after every layer rather than waiting for the whole scene.
2. Separate composition, silhouette and colour checks. Texture belongs last because it can make a weak trace look more convincing.
3. Establish shared boundaries and generous hidden overlap explicitly. Adjacent sleeve and shirt shapes should share a boundary or overlap cleanly before any movement is added.
4. Do not assume round-looking rings are circles. Measure multiple visible landmarks and allow ellipses or a few smooth curves.
5. Sample large clean interiors for colour. Fit the broad shading rather than copying one noisy pixel, and make material variables explicit from the start.
6. Use automatic edge alignment as a suggestion. Reject snaps near occlusion junctions, check the clean vector at full size, and prefer a small number of smooth curves over a lower image-error score with visible bumps.
7. Build texture at the artwork’s native aspect ratio and resolution. Keep it independently adjustable, and disclose when an SVG export includes a raster grain layer.
8. Decide the interaction first. Whole-person lifts are simple; moving an individual forearm would need a joint and reconstructed hidden anatomy, not just a transform on the existing visible shape.
9. Keep one authoritative reference for future image generation. Prompts can strongly guide palette and character continuity but cannot guarantee identical characters or pixel colours.

## Files and repeatable checks

- Vector master: `assets/colour-testing/community.svg`
- Standalone textured export: `assets/colour-testing/community-textured.svg`
- Portrait grain: `assets/colour-testing/community-grain.webp`
- Page section source: `assets/colour-testing/community-section.html`
- Page behaviour and styles: `assets/colour-testing/community-lab.js` and `.css`
- Colour fitting: `python scripts/refine-community-colours.py INPUT.svg OUTPUT.svg`
- Optional edge suggestion: `node scripts/refine-community-edges.cjs`, then `python scripts/refine-community-edges.py`. Inspect `tmp/community-edge-refined.svg` before adopting any changes; it is not an automatic build step.
- Rebuild portrait texture: `python scripts/build-community-grain.py`
- Rebuild exports and image comparisons: `node scripts/build-community-assets.cjs`
- Embed the authored page section: `node scripts/embed-community-study.cjs`
- Capture before/after page screenshots: `node scripts/capture-community-study.cjs before` or `final`
- Functional and accessibility verification: `node scripts/community-study.cjs`

Comparison captures are saved in `design/comparisons/community-svg/`. The before/after page captures show the layout; the triptych and full-resolution overlays show the artwork. A desktop copy accompanies the prompt library so this experiment is reusable outside the repository.
