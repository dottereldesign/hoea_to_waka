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
