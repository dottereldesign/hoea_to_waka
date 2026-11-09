# Logo construction studies

The first section on `/illustrations/` contains seven motion studies and a copy of
the original brand-guideline pencil-to-ink study. The brand-guideline page is
unchanged. Study 01 is permanently unfilled.

## Artwork and geometry

`scripts/logo-construction.mjs` reads every path directly from
`assets/logo-black.svg`. Both the contour and ink layers retain the original
`d` strings. Construction geometry lives in the same SVG coordinate system as
the artwork, so the guides remain registered at every viewport size.

The fitted circles pass through the start, midpoint and end of selected original
cubic Bézier segments. The build checks 101 samples along each segment and
rejects any radial deviation over 0.85 artwork units. These are local circular
approximations of the existing curves, not a claim that all the artwork consists
of perfect circular arcs.

| Feature | Path / segment (zero based) | Radius | Maximum radial deviation |
| --- | --- | --- | --- |
| Crown | 5 / 2 | 55.101 | 0.121 |
| Wahine | 1 / 12 | 89.397 | 0.813 |
| Outer current | 3 / 6 | 159.349 | 0.320 |
| Inner current | 6 / 8 | 140.123 | 0.303 |
| Paddle | 2 / 9 | 70.172 | 0.204 |

The golden-ratio study uses `φ = (1 + sqrt(5)) / 2`. Its four nested radii are
`r, r/φ, r/φ², r/φ³`; the circles share a tangent point on the outer-current
circle. The page describes this as an exploration of proportion, not evidence
of the logo's historical construction. The vector-anatomy study uses actual
control points from the approved Bézier paths.

## Motion

1. **Compass sketch:** rotating compass arms, circle tracing, unfilled contours.
2. **Curve atlas:** staggered circle and matching-curve traces followed by ink.
3. **Golden rhythm:** circles expand from their shared tangent, then ink appears.
4. **The drafting room:** dimensions and guides draw before a vertical clip reveal.
5. **Vector anatomy:** handles extend, contours draw, circles and ink resolve.
6. **Curve atlas · grid:** the Curve Atlas paths and motion on white, with the Compass Sketch grid.
7. **Curve atlas · outline:** study 06 with an unfilled ink-black logo contour. The isolated seam sliver (master path index 4) is omitted in this study only, removing a stray stroke at the paddle join.
8. **Original reference:** the original circle layout and pencil hatching to ink.

All sequences finish, support pause/resume and replay, pause while offscreen,
and resolve immediately when reduced motion is enabled. With JavaScript off,
the outline study remains visible and inactive controls stay hidden.

## Research

- [Akrivi: Create a Construction Grid](https://akrivi.helpscoutdocs.com/article/38-how-to-use-logo-grid-generator)
  — circles, anchors, handles, outlines and spacing are separate, deliberate
  construction layers; clean overlapping elements before presentation.
- [Adobe: Create with shapes](https://www.adobe.com/learn/illustrator/web/use-shape-builder-to-combine-merge-shapes)
  — geometric primitives and alignment guides support shape construction.
- [Adobe: Create shapes with Shape Builder](https://helpx.adobe.com/illustrator/desktop/manage-objects/reshape-transform-objects/create-shapes-using-the-shape-builder-tool.html)
  — overlapping shape regions can be combined or removed. Here the existing
  logo is retained; only the surrounding construction presentation is generated.

## Build and verify

`node scripts/logo-construction.mjs` regenerates the section, also called by the
normal site build. Styles and runtime are standalone assets to avoid modifying
the rest of the illustration page.

`node scripts/logo-construction.cjs` checks unchanged logo paths, complete circle
bounds, phi ratios, all eight selections at five widths, animation progress,
pause/resume/replay, keyboard use, guide visibility, reduced motion and a
no-JavaScript fallback. It runs scoped axe audits and saves desktop/mobile
screenshots in ignored `tmp/logo-construction/`.

Study 07 also uses a boolean union of master paths 2 and 3 at the wave/paddle join, stored in `design/logo-outline-join.json`. This removes the internal overlap edge without altering the combined silhouette. It was computed with skia-pathops UNION using fontTools SVG parsing; a source hash prevents stale geometry after master edits.

The wave tip in study 07 similarly joins master paths 6 and 7. A sub-0.01-unit doubled-back seam at their join is removed from the merged outline to prevent a dark crossbar. The source master and other studies remain unchanged.

Study 07 keeps its grid visible and static from the start. Only the construction circles and logo animate; there is no grid lead-in.

In study 07, the three central construction spokes share the centre of the inner wahine circle. They are visual alignment guides rather than individual radius measurements; the fitted circles and contact points stay in place.
