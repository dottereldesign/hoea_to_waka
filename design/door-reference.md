# Door animation study

Reference supplied by the user: `door.mp4`, 720 × 720, 30 fps, six seconds.
Inspected 45 extracted frames, plus individual opening/holding/closing frames.
Local analysis and comparisons are under `tmp/door-reference/` and `tmp/door-render/`.
The uploaded video is not shipped to the website.

Implementation: `assets/brand-door.js`, `assets/brand-door.css`, inline SVG in the
brand guidelines immediately below the Discover hero. The artwork, stars, grain,
perspective and animation are generated in code; no raster animation is used.

The hinge sits at x = 239, with a 245 × 496 leaf starting at y = 105. The reference
opens to approximately 54.7 degrees. A 1375-unit perspective distance and y = 365
vanishing point reproduce the slightly asymmetric rise/fall of the free edge.
The lever, backplate and collar are projected separately. The lever has a small
projection away from the door face; the edge latch sits on the return, not the leaf.

Motion samples follow the reference's six-second cycle. Monotone Hermite
interpolation avoids stopping at every measured sample. Stars use a deterministic
seed, restrained glow, slow drift, and a one-time canvas grain tile reused as a cached SVG pattern.

Four options: Reference (video), Mirror (screenshot orientation), Ocean (brand
colours), Midnight (dark screenshot treatment). Pause and Replay are provided;
reduced motion uses a static open door. Animation suspends offscreen and in hidden
tabs. The entire study is excluded from exported AI brand instructions.

## Moonlit ocean alternatives

Options 05–08 add a semicircular arch, a circular portal, a full-height oval and
a door with clipped corners. Each leaf and its fixed opening share the same
sampled outline when closed. Projection changes the full outline and its return;
the lever and plate are positioned proportionally, while the latch follows the
curved edge at handle height.

These four options reveal an ocean whose main fill is exactly `#0D4687`, a masked
crescent moon, 75 deterministic stars and the cached grain texture. Two independent
wave surfaces, a fine crest and short moon reflections move inside the opening's
clip. Their eight-second cycle holds the door open longer than the original
six-second studies. Reduced motion freezes the complete open composition; Pause
freezes both door and scenery. Selecting an ocean option while paused resumes
from the open pose without snapping closed.

`scripts/brand-door-tides.cjs` checks the four unique outlines, matching closed
geometry, no blue leaking from a closed door, rendered `#0D4687` pixels, hardware
placement, continuous wave movement during the open hold, playback and keyboard
selection. `scripts/brand-door.cjs` covers all eight options across screen sizes
and themes, and retains the original reference geometry and timing checks.

## Homepage use

The homepage organisation CTA reuses the Moon arch through `[data-moon-door]`.
Crossing the entry threshold starts the original 1.4-second opening, which runs
to completion even if scrolling stops. Scrolling back above the section triggers
the same motion in reverse; returning triggers a fresh opening. Scroll position
only triggers open/close and never sets the angle. A small entry/exit threshold
gap prevents boundary flicker. The homepage has no symbol or playback button.
Menu coverage, hidden-tab suspension and reduced motion are supported.
Reduced motion and the no-JavaScript fallback show the open Moon arch.

The original rotating-photo CTA now follows Meet Anna Brown on About, retaining
its eight photos, upright rotation, copy and contact link. Image and link paths
are relative to About. Its rotation also pauses while the header menu is open.
`scripts/home-moon-door.cjs` checks the production layout, timed opening, closing and re-entry;
`scripts/cta-orbit.cjs` now checks the moved section on About.
