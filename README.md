# Hoea tō Waka website

Each page contains its final layout directly in HTML. JavaScript enhances interactions and never selects or rebuilds a design.

Use Node 24.22.3 (pinned in `.nvmrc`) and `npm ci`. npm scripts use the pinned project-local Node executable on Windows as well. Use `npm.cmd` if PowerShell prevents running npm.ps1.

- `npm run build` regenerates the maintained artwork, CSS, JavaScript and marked HTML sections, then creates a fresh `_site/`.
- `npm run stage` packages the checked-in release files. GitHub Pages uses this command. Keep the generated changes with the source changes in the same commit.
- `npm test` and `npm run preview` stage first. The smoke test uses an available port. The interactive preview prints its address and accepts a `PORT` environment variable.
- `npm run test:release` runs the audited regression suites on the staged artifact. The other design-study scripts include historical experiments.

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

The homepage uses the seated community SVG with the soft sun pulse. Brand colour previews remain on `about/brand-guidelines/`, and illustrations remain on `illustrations/`.

`npm test` checks the public routes. `npm run test:first-paint` verifies that delayed JavaScript and old saved preferences cannot replace the published layouts. Changes pushed to `main` are staged by `scripts/stage-site.mjs` and published through GitHub Pages.

- Homepage testimonials: `design/testimonials.js` adds a 650ms crossfade, pause/resume control, and word-count-based reading time (minimum 18 seconds). Rotation suspends offscreen, in background tabs, on hover and while a control has focus. Reduced-motion preferences start playback paused. Run `node scripts/testimonials.cjs` for stable layout and accessibility, and `node scripts/testimonial-autoplay.cjs` for timing, playback controls and transitions.

- Brand guidelines logo introduction retains the original staged construction-guide, circle and sketch reveal. Do not save `site-preview-brand-hero-is-complete` in its authored HTML: the runtime adds it after the four-second sequence. Run `node scripts/brand-hero.cjs` to verify scroll triggering, fresh-load replay, desktop/mobile motion and reduced-motion/no-JavaScript fallbacks.

- Brand guidelines contents is a normal section above Brand Overview, with a two-column index that stacks on mobile. The guide has no sticky sidebar, and Discover links to the contents. Styles live in `design/brand-contents.css`; run `node scripts/brand-contents.cjs` to check navigation, responsive layout, dark theme and accessibility.

- Homepage illustration: `assets/hero-studies/community-chairs.svg` and `assets/hero-sun.css`. Run `npm run test:hero-illustrations` to verify the artwork, controls and responsive fit.

- Resource browsing: `design/resources-nav.css` and `design/resources-nav.js` provide a sticky desktop index, swipeable mobile links, animated active markers and section tracking. Books, purchase links and embedded videos stay in the normal document flow. Run `node scripts/resources-nav.cjs` for responsive navigation, keyboard, reduced-motion and smooth-transition checks.

Publication exclusions are listed in `scripts/public-exclusions.json`. Keep artwork masters, generator inputs and licences in the repository. The shared game page uses `styles.css`, and the guide loads individual logo-hover tiles by a calculated filename.
