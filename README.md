# Hoea tō Waka website

Static public website and internal brand-guidelines reference for Hoea tō Waka Training Ltd.

The public site includes 51 component layouts (50 directions plus Original), 10 coordinated colour palettes, and 10 font families with 10 suggested typography pairings. Use the bottom-left **Colours & type** button for site-wide foundations, and **Design studio** for layouts. See [DESIGN-STUDIO.md](DESIGN-STUDIO.md) for the layout library and [theme research](design/THEME-RESEARCH.md) for palette and typography decisions.

## Preview locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

The GitHub Pages preview is available at [https://dottereldesign.github.io/hoea_to_waka/](https://dottereldesign.github.io/hoea_to_waka/).

## Public routes

- `/` — Home
- `/about/` — About Anna Brown and the model
- `/services/` — Services overview
- `/services/in-house-workshops/` — In-house resilience workshops
- `/services/resilience-one-on-one/` — Individual resilience coaching
- `/services/workshops-for-support-professionals/` — Training for support professionals
- `/resources/` — Books, waiata, and song resources
- `/contact/` — Contact details and enquiry form

Each clean route is backed by an `index.html` inside the matching directory. Depth-aware relative links keep navigation and assets working both at a domain root and at the GitHub Pages project path `/hoea_to_waka/`.

## Shared public-site files

- `site.css` — Public website design system and responsive layout
- `site.js` — Persistent light/dark theme, navigation, mobile menu, contact-form email preparation, and current year
- `assets/` — Logos and optimised public image assets

## Brand reference

- `/about/brand-guidelines/` — Brand-guidelines presentation
- `/about/jamies-workspace/` — Internal client-confirmation workspace
- `styles.css` — Styles used by the brand-guidelines presentation

The brand-guidelines page remains linked from the footer, but uses `noindex,follow` so search engines prioritise the customer-facing pages. Jamie's Workspace uses `noindex,nofollow` and is intentionally excluded from public navigation and the sitemap.

## SEO and redirects

- `sitemap.xml` lists only canonical, indexable production URLs.
- `robots.txt` advertises the sitemap; `_headers` adds host-level `X-Robots-Tag` protection for internal/reference content.
- `_redirects` contains permanent redirects from the previous Wix routes and the earlier flat `.html` build.
- Lightweight `.html` redirect documents and the route-aware `404.html` provide fallbacks on static hosts that do not process `_redirects`.
- Every public page has a unique title and description, a canonical URL, Open Graph and social-card metadata, and page-specific JSON-LD.
- The canonical production origin is `https://www.hoeatowaka.co.nz`.

When deploying somewhere that does not support `_redirects` or `_headers`, reproduce those rules in that platform's redirect and response-header configuration so migrations use HTTP 301 responses and internal reference material remains out of search.

## Colour themes and typography

**Colours & type** offers 10 mixed-hue palettes, each with 60 shades and light/dark modes. Settings affect all layouts, nested card/button/form/field variations, gradients, controls and the brand reference, and persist across routes in this browser. Image and logo artwork retains its original colours. Original restores a composition, not independent colours or fonts.

The Typography tab offers 10 curated pairings and six independent roles: display headings, section/card headings, paragraphs, eyebrows, buttons/navigation, and captions/small print. All roles have the same 10 locally hosted font families, including Māori macrons. **Export** downloads colour, typography, mode and saved layout choices; **Reset colours & type** restores the default Tidal Bloom / Coastal editorial combination without resetting layouts.

Source files are in `design/theme-data.mjs`, `design/theme-init.js`, `design/appearance.jsx` and `design/appearance.css`. `node scripts/build.mjs` compiles the shared theme assets and migrates legacy CSS paint/font declarations into theme tokens. Keep editing `site.css`, `styles.css` and the design source CSS, then rebuild; generated files under `assets/` are committed for the static host. `node scripts/verify-themes.cjs` exercises palette/layout coverage, persistence, typography, form state, responsive views and accessibility. Refresh bundled free fonts only when needed with `node scripts/fetch-theme-fonts.mjs`; licences are included beside the font files.

## Contact form

The current static form prepares a pre-addressed email in the visitor's email application. Before launch, connect it to a hosted form endpoint or the final website platform if submissions need to work without a local email app.
