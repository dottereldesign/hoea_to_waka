# Performance audit — 26 October 2026

This audit compares the pre-change site (Git revision 61dc963) with the performance update. The visual brief was to preserve the header entrance, glass pill, expanding menu and spring motion.

## Method and limits

- Lighthouse 13.4.1, installed Chrome, Node 24.19.0. All 16 HTML entry points were audited in both mobile and desktop modes before and after the changes: 64 complete Lighthouse reports, plus pilot runs.
- These are local laboratory scores from the unchanged `scripts/preview.cjs` server. Its responses are uncompressed and do not simulate GitHub Pages cache headers. They are useful for before/after comparisons, not a claim about production PageSpeed or real-user Core Web Vitals.
- Lighthouse's normal mobile/desktop profiles and all four categories were used. Animations were enabled; audits were not skipped. One complete run per page/profile is recorded, so timing and score variation should be expected.
- Motion was also measured separately at 4× CPU slowdown, alternating three baseline/current samples per viewport. The baseline was served read-only from Git; the checkout was never rolled back. That comparison omits expensive tracing, which itself affected the earlier diagnostic recordings.
- Frame intervals are requestAnimationFrame samples on this machine, not a promise of GPU frame rate on every device. Layout counts/durations are Chrome performance metrics. Browser workloads ran sequentially for final measurements.

## What changed

- The header commits its final geometry once, then moves its visible components with transforms. It keeps the 520 ms easing and both settled designs. Reversal samples the current position rather than snapping to an endpoint.
- The entrance measures all targets before creating any animations. Its first-frame safety timer still fails open if the animation script is unavailable.
- The menu keeps its original surface rendering, 620 ms circle-to-panel clip, stagger, reverse and backdrop blur. Background isolation, animation pausing and opening geometry are batched to avoid repeated document passes. Position tracking runs while the header moves instead of reading geometry on every frame of a stationary menu. An experimental surface layer was discarded after mixed benchmark results.
- About 93 KB of minified guideline-only CSS no longer loads on public pages. The shared interaction bundle shrank from about 75 KB to 7 KB; the spring engine loads only on pages that use it.
- Pencil-card animation objects are prepared near their section instead of at initial load. The homepage door scene is prepared ahead of viewport entry. Their authored timing and reversible behaviour remain intact.
- Responsive WebP copies preserve the original image masters, download files and clipboard artwork. Phones can request smaller images; intrinsic dimensions reserve space.
- Duplicate initial theme writes were removed and the reduced-motion layout is established early. Small contrast, heading hierarchy and accessible-name issues were corrected. Redirect entry points now declare their favicon.
- The AI arrow checks publication-animation completion when it approaches view, preserving the drawing sequence without forcing a full-guide style pass during startup. The About timeline avoids an unnecessary initial horizontal-scroll reset after its SVG updates.

## Lighthouse performance

Scores are out of 100. The arrows show before → after. CLS columns are the after-run values.

| Page | Mobile performance | Desktop performance | Mobile LCP | Mobile blocking time | CLS mobile / desktop |
|---|---:|---:|---:|---:|---:|
| / | 40 → 68 | 97 → 98 | 6.40 s → 5.06 s | 1402 → 336 ms | 0.0000 / 0.0000 |
| /about/ | 73 → 73 | 99 → 99 | 5.02 s → 4.14 s | 94 → 312 ms | 0.0000 / 0.0000 |
| /model/ | 55 → 63 | 97 → 99 | 5.95 s → 5.45 s | 621 → 391 ms | 0.0000 / 0.0000 |
| /services/ | 68 → 78 | 99 → 99 | 5.43 s → 4.33 s | 217 → 162 ms | 0.0000 / 0.0000 |
| /services/in-house-workshops/ | 68 → 77 | 99 → 99 | 4.83 s → 4.06 s | 308 → 237 ms | 0.0000 / 0.0000 |
| /services/resilience-one-on-one/ | 53 → 63 | 99 → 99 | 5.05 s → 4.13 s | 1109 → 694 ms | 0.0000 / 0.0000 |
| /services/workshops-for-support-professionals/ | 62 → 67 | 98 → 98 | 4.91 s → 4.37 s | 535 → 477 ms | 0.0000 / 0.0000 |
| /resources/ | 62 → 70 | 98 → 98 | 6.17 s → 4.51 s | 330 → 362 ms | 0.0000 / 0.0000 |
| /contact/ | 60 → 74 | 98 → 99 | 4.83 s → 3.99 s | 568 → 338 ms | 0.0000 / 0.0000 |
| /illustrations/ | 69 → 76 | 97 → 98 | 6.38 s → 4.63 s | 114 → 158 ms | 0.0000 / 0.0000 |
| /404.html | 62 → 61 | 93 → 96 | 7.37 s → 5.87 s | 49 → 252 ms | 0.0000 / 0.0001 |
| /about/brand-guidelines/ | 29 → 30 | 65 → 66 | 9.33 s → 9.68 s | 3386 → 1850 ms | 0.0000 / 0.0000 |
| /about/jamies-workspace/ | 77 → 76 | 100 → 99 | 4.14 s → 3.73 s | 227 → 390 ms | 0.0000 / 0.0000 |
| /prompts/ | 67 → 70 | 98 → 99 | 4.68 s → 4.52 s | 334 → 289 ms | 0.0000 / 0.0000 |
| /brand/brand-system.html | 82 → 84 | 99 → 100 | 3.92 s → 3.62 s | 0 → 150 ms | 0.0000 / 0.0000 |
| /pages/home.html | 82 → 86 | 100 → 100 | 3.92 s → 3.61 s | 0 → 0 ms | 0.0000 / 0.0000 |

## Other Lighthouse categories

These are after-run scores (mobile / desktop).

| Page | Accessibility | Best practices | SEO |
|---|---:|---:|---:|
| / | 100 / 100 | 100 / 100 | 100 / 100 |
| /about/ | 100 / 100 | 100 / 100 | 100 / 100 |
| /model/ | 100 / 100 | 100 / 100 | 100 / 100 |
| /services/ | 100 / 100 | 100 / 100 | 100 / 100 |
| /services/in-house-workshops/ | 100 / 100 | 100 / 100 | 100 / 100 |
| /services/resilience-one-on-one/ | 100 / 100 | 100 / 100 | 100 / 100 |
| /services/workshops-for-support-professionals/ | 100 / 100 | 100 / 100 | 100 / 100 |
| /resources/ | 100 / 100 | 100 / 100 | 100 / 100 |
| /contact/ | 100 / 100 | 100 / 100 | 100 / 100 |
| /illustrations/ | 100 / 100 | 100 / 100 | 100 / 100 |
| /404.html | 100 / 100 | 100 / 100 | 63 / 63 |
| /about/brand-guidelines/ | 100 / 100 | 100 / 100 | 69 / 69 |
| /about/jamies-workspace/ | 100 / 100 | 100 / 100 | 69 / 69 |
| /prompts/ | 100 / 100 | 100 / 100 | 63 / 63 |
| /brand/brand-system.html | 100 / 100 | 100 / 100 | 63 / 63 |
| /pages/home.html | 100 / 100 | 100 / 100 | 63 / 63 |

The guide, workspace, prompt library, redirect stubs and 404 intentionally restrict indexing or are not normal landing pages. Their SEO scores must be interpreted in that context. Noindex was retained rather than removed to increase a score.

## Paired motion measurements

Each cell is the median of three samples. Desktop width was 1440 px; mobile width was 390 px. Each interaction was observed for one second at 4× CPU slowdown. Layout figures include any other work occurring during that observation window.

| Page / viewport | Interaction | Layout passes before → after | Layout time before → after | Frame interval p95 before → after |
|---|---|---:|---:|---:|
| home | pill-in | 7 → 4 | 296.2 → 69.7 ms | 140.0 → 60.0 ms |
| home | pill-out | 7 → 5 | 343.8 → 7.3 ms | 169.6 → 40.0 ms |
| home | menu-open | 3 → 3 | 144.5 → 138.8 ms | 110.0 → 100.1 ms |
| home | menu-close | 2 → 2 | 2.9 → 3.1 ms | 30.0 → 40.0 ms |
| home-mobile | pill-in | 0 → 0 | 0.0 → 0.0 ms | 10.1 → 10.1 ms |
| home-mobile | pill-out | 0 → 0 | 0.0 → 0.0 ms | 10.1 → 10.1 ms |
| home-mobile | menu-open | 3 → 3 | 99.5 → 90.1 ms | 50.1 → 100.1 ms |
| home-mobile | menu-close | 2 → 2 | 3.0 → 2.4 ms | 30.0 → 30.1 ms |
| guide | pill-in | 5 → 4 | 220.7 → 35.4 ms | 150.1 → 50.0 ms |
| guide | pill-out | 5 → 5 | 252.9 → 13.4 ms | 150.1 → 90.1 ms |
| guide | menu-open | 5 → 4 | 111.6 → 149.6 ms | 160.0 → 190.0 ms |
| guide | menu-close | 2 → 2 | 27.4 → 38.4 ms | 30.1 → 30.0 ms |
| guide-mobile | pill-in | 0 → 0 | 0.0 → 0.0 ms | 10.1 → 10.1 ms |
| guide-mobile | pill-out | 0 → 0 | 0.0 → 0.0 ms | 10.1 → 10.1 ms |
| guide-mobile | menu-open | 5 → 4 | 157.3 → 127.1 ms | 140.0 → 100.0 ms |
| guide-mobile | menu-close | 2 → 2 | 33.8 → 24.3 ms | 30.0 → 30.0 ms |

Synthetic menu-click handler duration is reported separately below. This measures synchronous handler work, not real-user INP or the full animation duration. Results that increase are retained; this is not a claim that every interaction became faster on every device.

| Page / viewport | Handler duration before → after |
|---|---:|
| home | 412.9 → 345.2 ms |
| home-mobile | 295.1 → 239.3 ms |
| guide | 479.7 → 424.0 ms |
| guide-mobile | 483.2 → 378.5 ms |

## Verification

- All 16 routes: desktop/mobile smoke checks, images, header navigation, published layouts, main-page overflow and contact controls.
- Delayed-JavaScript and refresh checks: public-page headings/layout; guide landing and AI headings. The guide's lower interactive previews intentionally initialise their own layouts and are not covered by a whole-document no-change assertion. Lighthouse records initial visible layout shift separately.
- Header: 320–1920 px, all ten entrance presets, real scrolled reloads, late scripts, slow image loads, rapid switching, reduced motion and no-JavaScript fallback.
- Menu: opening/closing origin, intermediate clip geometry, staged content, interrupted reversal, resizing, Escape, backdrop dismissal, focus trap, background isolation and clean animation resumption.
- Statement spring, Moon arch entry/re-entry, Anna timeline variations, pencil drawing, book layout and click-to-load resource videos.
- Axe accessibility checks at desktop/mobile sizes and menu checks. Automatic checks do not replace a human accessibility review.
- Link audit: 16 pages, 223 local links/assets/anchors/responsive candidates, 0 missing destinations. Both external homepage destinations responded successfully to HEAD requests. Email/phone links were checked as markup; no messages or calls were sent.
- Settled pill/menu screenshots were compared with the pre-change screenshots. Runtime tests verify that intermediate movement and reversal remain present.

## Remaining limits

The guide is an unusually large interactive demonstration page. It still carries substantial CSS, SVG and preview content, so its throttled mobile score should not be described as excellent merely because individual costs were reduced. Broad CSS removal or hiding animations to improve a score would change the brief. A future structural improvement would split its demonstration tools into separately loaded chapters while retaining the same visual design.

GitHub Pages controls response compression, cache policy and transport. This repository cannot set arbitrary production response headers. External destinations and third-party embeds can also change independently. YouTube remains click-to-load.

## Repeating the checks

Use Node 24 (Lighthouse 13 does not support the repository machine's older Node 20 executable).

```text
node scripts/lighthouse-audit.mjs --phase=after --form=all --force
node scripts/motion-comparison.cjs 61dc963
node scripts/site-link-audit.cjs
node scripts/performance-report.mjs
```

Lighthouse HTML/JSON reports are kept locally under `tmp/performance/{before,after}/lighthouse/`; motion samples and screenshots are under `tmp/performance/`. Those bulky diagnostic files are Git-ignored. The compact audit data alongside this document is committed for review.
