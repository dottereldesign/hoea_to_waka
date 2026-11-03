# Performance audit — 3 November 2026

## Changes

The language menu retains its circle-to-rounded-panel opening, content reveal and reverse closing. Percentage clip geometry removes the opening measurement; closing now has its own ease-out. Interrupted transitions continue from the visible shape. Small local native-label font subsets avoid Windows system-font searches. Hidden layout is prepared on pointer/focus intent and retained after use. No header, statement, door or timeline motion timings were shortened to improve scores.

Shared interactive theme JavaScript dropped from 32,109 to 13,266 bytes by moving guideline-only controls into their own bundle. Pre-paint theme setup is preserved in a 3.7 KB inline bootstrap. Route styles retain the cascade and remove provably absent top-level class/ID selectors; public-page CSS is approximately 87–162 KB instead of 213 KB. A 14.5 KB Inter subset covers macrons, retaining the full font as fallback. About avoids rebuilding identical river geometry; marquee measurements are batched before writes.

## Lighthouse method and results

Baseline is commit b2679c4. Both versions were served locally with gzip and a 600-second cache header, matching the GitHub Pages response settings inspected during this audit. These are single-run Lighthouse lab results with standard mobile throttling and desktop configuration, animations enabled. Scores vary with local CPU load and are not field Core Web Vitals or a live PageSpeed Insights result. Brand guidelines is excluded from the score sweep as requested, but its shared menu remains functionally tested.

All 15 other HTML entry points were audited on mobile and desktop (60 before/after reports). Public pages score 100 for accessibility, best practices and SEO after the update. Private/reference pages and the 404 deliberately retain noindex, so their SEO scores remain lower. About's pre-existing heading-order issue was fixed with an accessible outline heading.

| Page | Mobile before → after | Desktop before → after | Mobile LCP before → after | Mobile TBT before → after |
|---|---:|---:|---:|---:|
| 404.html | 80 → 85 | 99 → 100 | 3.66 → 3.10 s | 282 → 254 ms |
| about/ | 68 → 73 | 99 → 100 | 3.80 → 3.19 s | 695 → 670 ms |
| about/jamies-workspace/ | 80 → 81 | 100 → 99 | 2.80 → 2.26 s | 563 → 626 ms |
| brand/brand-system.html | 95 → 97 | 100 → 100 | 2.42 → 1.81 s | 144 → 138 ms |
| contact/ | 79 → 84 | 100 → 98 | 2.87 → 2.49 s | 532 → 522 ms |
| / | 86 → 85 | 99 → 97 | 3.85 → 3.44 s | 129 → 244 ms |
| illustrations/ | 88 → 81 | 100 → 99 | 3.24 → 4.01 s | 185 → 305 ms |
| model/ | 80 → 79 | 99 → 100 | 3.47 → 3.29 s | 391 → 467 ms |
| pages/home.html | 93 → 95 | 100 → 100 | 2.42 → 1.82 s | 204 → 218 ms |
| prompts/ | 72 → 75 | 99 → 99 | 3.36 → 3.11 s | 615 → 653 ms |
| resources/ | 81 → 84 | 100 → 99 | 3.17 → 2.52 s | 466 → 445 ms |
| services/ | 88 → 82 | 100 → 98 | 2.74 → 2.34 s | 344 → 541 ms |
| services/in-house-workshops/ | 89 → 88 | 99 → 99 | 2.87 → 2.34 s | 249 → 346 ms |
| services/resilience-one-on-one/ | 82 → 81 | 99 → 100 | 2.87 → 2.91 s | 421 → 520 ms |
| services/workshops-for-support-professionals/ | 80 → 85 | 100 → 99 | 3.09 → 2.35 s | 445 → 488 ms |

**100/100 is not achieved across mobile.** Public desktop results are 97–100; public mobile results are 73–88. Most pages paint sooner, but several scores regressed because blocking-time measurements increased. About's river startup, home motion setup and shared style/layout work remain the main mobile CPU costs. The tests do not establish that all remaining work can be removed while preserving every animation. No animation was disabled for the audit. CLS is zero across mobile and effectively zero on desktop (404: 0.00015).

## Language-menu interaction measurements

Chrome at 4× CPU slowdown, 900 ms sampling windows. Synthetic clicks intentionally bypass pointer/focus preparation; this exposes the expensive cold path. Each scenario has one cold opening and two repeat openings. These are handler and frame samples, not field INP.

| Scenario | Cold handler before → after | Repeat handlers after |
|---|---:|---:|
| / · 1440px | 673 → 417 ms | 25, 59 ms |
| / · 390px | 830 → 306 ms | 38, 48 ms |
| about/ · 1440px | 946 → 445 ms | 14, 36 ms |
| about/brand-guidelines/ · 390px | 644 → 166 ms | 50, 31 ms |

Cold handling improved approximately 38–74%. Repeat open handlers were 14–59 ms and close handlers 1–12 ms in this run. First-open stalls and some missed frames remain under severe throttling; this is an improvement, not a claim of flawless 60 fps on every device. The guide's background workload is visible in its frame samples. Raw measurements, including slow frames, are retained in the adjacent JSON.

## Verification

- Sampled morph frames at 1440, 390 and 320 px; forward progress, 24 px radius, interrupted reversal, closed-state visibility and resizing pass. Local screenshots were inspected.
- Language-menu geometry, keyboard navigation, short-screen scrolling, reduced motion and accessibility checked across six widths.
- Header entrance and stress tests passed, including scrolled reload, delayed loading and zero header layout shift.
- Statement spring tests passed at five widths after preserving the existing implementation.
- River reveal checks passed at 1440/390 px, at slow and fast scroll speeds.
- Responsive before/after computed-style comparison covered 13 routes at desktop/mobile widths. No lost component styling was found; only tiny font-shaping width differences. All 158 generated CSS asset references resolve.

- Shared functional checks passed on 16 routes at desktop/mobile sizes, including image loading, navigation, forms and overflow. Main-menu modal isolation, scroll restoration and background animation resumption passed.
- The model-timeline frame-order test still fails in this environment; the unchanged baseline also fails (different intermediate samples are missed during long frames). Its implementation was retained, and this test is not reported as passing. First-scroll frame latency remains an unresolved performance limitation.
- The marquee test originally sampled before its asynchronous IntersectionObserver resumed it. The test now waits for the running state and visible movement, while retaining pause/resume and reduced-motion assertions. It passed at four widths. This is a functional test, not a 200 ms performance guarantee.

Raw Lighthouse HTML/JSON files: tmp/performance/2026-11-03-hosting-before/lighthouse/ and tmp/performance/2026-11-03-hosting-after/lighthouse/. These temporary files are not deployed. Reproduce with the Node 24 runtime and scripts/lighthouse-audit.mjs --gzip --phase=<name> --routes=home,about/,model/,services/,services/in-house-workshops/,services/resilience-one-on-one/,services/workshops-for-support-professionals/,resources/,contact/,illustrations/,404.html,about/jamies-workspace/,prompts/,brand/brand-system.html,pages/home.html; use --root=<baseline-directory> for a matching baseline. See performance-loading.md for regeneration instructions.
