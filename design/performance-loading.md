# Loading and page-style builds

The pre-paint theme bootstrap (`design/theme-boot.js`) is inlined by `scripts/build-theme-boot.mjs`. It establishes the original font roles, reduced-motion layout and saved palette before paint. Interactive setup remains deferred in `assets/theme-init.js`; guideline-only controls live in `assets/guide-init.js`.

`node scripts/build-page-styles.mjs` combines the existing `site-palette.css`, `components.css` and `theme.css` in their original cascade order. Each public page receives a content-versioned stylesheet under `assets/page-styles/`. A selector is removed only when it requires a top-level class/ID absent from that page's markup and loaded scripts. Nested selectors, pseudo-classes, attributes, keyframes and common dynamic state/variant classes are retained. This is not viewport/coverage-based pruning: below-fold, hover, focus and animation styles remain included. Guideline CSS is kept whole. The two historical reference pages continue using their original style bundles.

The normal build invokes both generators. When changing a component or its generated class names, regenerate page styles and run the responsive/component tests. Do not hand-edit the generated page styles. Relative image/font URLs are rebased by the generator; all font and image masters remain available.

`assets/fonts/themes/inter-latin-extended-a.woff2` is a subset of the existing Inter file, preserving variation and shaping tables. It prioritises the Latin Extended A block (including Māori macrons); the full extended font still handles other ranges. Rebuild it with `python scripts/subset-inter.py` after installing FontTools and Brotli. The original font and license remain unchanged.

The ordinary preview server is still uncompressed. Lighthouse's optional `--gzip` mode uses gzip for text assets and a 600-second cache header, matching the delivery settings observed on GitHub Pages on 3 November 2026. Both versions must use the same mode for comparisons. This is a local approximation, not a substitute for production latency, PageSpeed Insights or real-user Core Web Vitals.
