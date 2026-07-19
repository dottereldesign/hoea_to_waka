# Hoea tō Waka website

Static public website and internal brand-guidelines reference for Hoea tō Waka Training Ltd.

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

## Colour themes

The site defaults to its light theme. The day/night control in every navbar switches the complete site—including the brand-guidelines presentation—and remembers the visitor's choice in the browser.

## Contact form

The current static form prepares a pre-addressed email in the visitor's email application. Before launch, connect it to a hosted form endpoint or the final website platform if submissions need to work without a local email app.
