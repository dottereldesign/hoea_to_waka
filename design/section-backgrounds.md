# Shared section backgrounds

The homepage FAQ is permanently set to 06 · Coastal mesh and has no selector or
selector JavaScript. The shared stylesheet preserves its palette, 8px side insets,
32px radius and existing accordion interactions.

All ten original background studies are available in “A practical reset” on
`services/resilience-one-on-one/`, at `#coaching-outcomes`. Coastal mesh is the
initial selection. The controls retain five flat colours (01–05) and five layered
treatments (06–10): Powder blue, Sage, Warm sand, Soft lilac, Deep ocean, Coastal
mesh, Aurora, Tidal contours, Glass garden and Lunar halo.

`assets/section-backgrounds.css` shares the palettes and selector styling.
`assets/section-backgrounds.js` loads only on the coaching page. Text, borders,
icons, focus indicators and hover states adapt to each palette. Glass garden adds
translucent outcome cards. Meshes, contours and subtle grain stay static.

Controls announce their selected state and work by keyboard. With JavaScript
disabled, the coaching section shows Coastal mesh and hides the inactive controls.
Homepage FAQ details still work natively.

Run `node scripts/section-backgrounds.cjs` for all treatments across five widths,
painted-background text contrast, accessibility, fixed insets, control placement
and native fallbacks. `node scripts/home-faq.cjs` verifies accordion motion.
Screenshots are saved under `tmp/section-backgrounds/`.
