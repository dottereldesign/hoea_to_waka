# Anna's story: five timeline studies

About's existing biography is divided into five factual chapters, without adding
calendar dates or claiming outcomes: eight years of youth work, ten years of
counselling, the need to translate research, personal roots, and the values in
Anna's work. The original qualifications, age range, contexts and heritage remain.

The controls above `#anna-story` select:

1. **Drawn thread:** alternating notes follow a wandering ink route. Nodes and
   copy settle with separate spring weights as they enter the viewport.
2. **Paper chapters:** sticky paper cards yield and rotate slightly as the next
   chapter arrives. Phones and reduced motion use a regular, readable stack.
3. **Small worlds** (default): five inline SVG vignettes unfold on their ground
   lines: a sprout, two chairs, an opening book, a rooted plant and a lighthouse.
   Stroke drawing, leaf hinges, page opening and the light beam follow the entry
   spring. `design/anna-timeline-art.cjs` is the SVG source; HTML holds the actual
   artwork so it is available before JavaScript and without JavaScript.
4. **The horizon:** on larger, taller viewports, ordinary vertical scrolling moves
   a wide chapter rail with a damped spring. The page does not intercept wheel or
   touch input. Smaller viewports and reduced motion use native horizontal scroll
   and chapter buttons; the rail is keyboard focusable. Scrolling back reverses
   the pan. Selecting another study leaves the same five chapters in the DOM.
5. **Constellation:** an asymmetric night chart connects the chapters with a
   drawn route and a deterministic, static star field.

`assets/anna-timelines.js` integrates spring acceleration in substeps of at most
1/120 second. The text, node, paper and pan springs have different damping. RAF
stops after settling; scrolling only schedules measurement and any needed motion.
Hidden pages and `hoea:site-menu` suspend procedural animation without losing its
state. Reduced motion draws the complete illustrations and disables sticky scroll
panning and arrivals. There is no continuous ambient animation loop.

The initial layout, including controls and SVG space, is reserved before script
loading. Disabled controls become active on enhancement; a no-script rule hides
the inactive controls. Variant changes return focus to the selected style button.
Only About loads these assets; homepage door motion is untouched.

Run `node scripts/anna-timelines.cjs` for layouts at 320–1440px, factual copy,
accessibility, spring overshoot and settling, ink drawing, menu suspension, sticky
stacking, horizon panning/reversal, keyboard controls, reduced motion, no-script
content, and delayed-script layout stability. `--runtime-only` skips the layout
matrix. Screenshots are saved under `tmp/anna-timelines/`.
