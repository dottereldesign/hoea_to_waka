# Hoea tō Waka website

Each page contains its final layout directly in HTML. JavaScript enhances interactions and never selects or rebuilds a design.

Run `npm run build` after changing styles or interaction modules. Run `npm run preview` and open http://127.0.0.1:8766/hoea_to_waka/ for a local preview.

- Content and layouts: edit the relevant page HTML directly.
- Current component styles: `design/components.css` and `design/presentation.css`.
- Brand colours: `design/brand-tokens.mjs` and `design/brand-colours.css`.
- Typography: `design/theme-fonts.css` and `design/static-pages.css`.
- Footer comparisons: `design/footer-versions.css` and `design/footer-versions.js`; the four arrangements share each page's existing footer content. Run `npm run test:footer-versions` for responsive layout, link and accessibility checks.
- Navigation: `design/header.js` and `design/header.css`.
- Subpage background comparisons: `design/subpage-backgrounds.css` defines each page's four cloud palettes; `design/coaching-hero.css` shares the grain and controls. Labels live in each page's HTML. Run `npm run test:subpage-backgrounds` to check all four options across screen sizes.
- Service menu icons: `assets/icons/services/`; the build embeds these SVGs directly into each page's navigation.
- Page interactions: `design/site-interactions.js`, with modules for statement icons, timelines, the marquee and the photo orbit.
- Model benefits: `design/model-benefits.css`. Transparent artwork and generation prompts are in `assets/model-benefits/`; run `npm run test:model-benefits` to check visible artwork, responsive layout and accessibility.

The homepage hero comparison keeps 01/02 and adds illustrated SVG studies 03/04/05. Historical layout selectors, nested variations and the previous marquee comparison are removed. Brand colour previews remain on `about/brand-guidelines/`, and illustrations remain on `illustrations/`.

`npm test` checks the public routes. `npm run test:first-paint` verifies that delayed JavaScript and old saved preferences cannot replace the published layouts. Changes pushed to `main` are staged by `scripts/stage-site.mjs` and published through GitHub Pages.

- Homepage testimonials: `design/testimonials.js` adds a 650ms crossfade, pause/resume control, and word-count-based reading time (minimum 18 seconds). Rotation suspends offscreen, in background tabs, on hover and while a control has focus. Reduced-motion preferences start playback paused. Run `node scripts/testimonials.cjs` for stable layout and accessibility, and `node scripts/testimonial-autoplay.cjs` for timing, playback controls and transitions.

- Brand guidelines logo introduction retains the original staged construction-guide, circle and sketch reveal. Do not save `site-preview-brand-hero-is-complete` in its authored HTML: the runtime adds it after the four-second sequence. Run `node scripts/brand-hero.cjs` to verify scroll triggering, fresh-load replay, desktop/mobile motion and reduced-motion/no-JavaScript fallbacks.

- Brand guidelines contents is a normal section above Brand Overview, with a two-column index that stacks on mobile. The guide has no sticky sidebar, and Discover links to the contents. Styles live in `design/brand-contents.css`; run `node scripts/brand-contents.cjs` to check navigation, responsive layout, dark theme and accessibility.

- Illustrated hero studies: `assets/hero-studies/` contains the editable SVG scenes and separate grain overlay. Styling is in `design/hero-illustrations.css`. Run `node scripts/hero-illustrations.cjs` for the scene controls, grain comparison, accessibility and responsive checks.
