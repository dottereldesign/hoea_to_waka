# Hoea tō Waka website

Each page contains its final layout directly in HTML. JavaScript enhances interactions and never selects or rebuilds a design.

Run `npm run build` after changing styles or interaction modules. Run `npm run preview` and open http://127.0.0.1:8766/hoea_to_waka/ for a local preview.

- Content and layouts: edit the relevant page HTML directly.
- Current component styles: `design/components.css` and `design/presentation.css`.
- Brand colours: `design/brand-tokens.mjs` and `design/brand-colours.css`.
- Typography: `design/theme-fonts.css` and `design/static-pages.css`.
- Navigation: `design/header.js` and `design/header.css`.
- Service menu icons: `assets/icons/services/`; the build embeds these SVGs directly into each page's navigation.
- Page interactions: `design/site-interactions.js`, with modules for statement icons, timelines, the marquee and the photo orbit.

The recent 01/02 hero comparison remains. Historical layout selectors, nested variations and the previous marquee comparison are removed. Brand colour previews remain on `about/brand-guidelines/`, and illustrations remain on `illustrations/`.

`npm test` checks the public routes. `npm run test:first-paint` verifies that delayed JavaScript and old saved preferences cannot replace the published layouts. Changes pushed to `main` are staged by `scripts/stage-site.mjs` and published through GitHub Pages.
