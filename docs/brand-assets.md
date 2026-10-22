# Brand asset downloads and previews

The Brand Guidelines page keeps downloads in the introduction column of Logo Anatomy, Logo Backgrounds and Favicon. `design/brand-assets.js` binds the format, colour and width choices to static files, so downloads work on GitHub Pages without a server. The default SVG link and black/white SVG shortcuts also work without JavaScript.

## Artwork

- Symbol: approved `assets/logo-black.svg` paths, without the name.
- Horizontal logo: symbol, Inter Semibold name, Inter Medium brand line and both rules. Text is converted to paths using the existing Inter font files, including the extended Latin glyph for ō.
- Colours: black and white.
- Vector: SVG, PDF and EPS. These can be resized in design software.
- Raster: transparent PNG and lossless WebP. JPG is flattened onto white for black artwork, or Ink for white artwork.
- Symbol raster widths: 256, 512 and 1024px.
- Horizontal raster widths: 640, 1280 and 2560px.

The favicon retains its individual rounded white frame. PNG and WebP are available at 16, 32, 48, 64, 128, 180, 192 and 512px. SVG is scalable. The ICO contains PNG representations at 16, 32 and 48px in one icon file.

Generate files with `node scripts/brand-downloads.mjs`; the main build also regenerates them after the favicon. PDF metadata uses a fixed artwork date so identical artwork produces stable output. The public files are in `assets/brand-downloads/`, with a manifest consumed by the selector code. Run `node scripts/brand-assets.cjs` to verify download routes, file formats, dimensions, browser downloads and preview interactions.

## Email and social previews

Five email signatures share the same contact information: Classic split, Type first, Full wordmark, Ink panel and Compact. The numbered choices sit in the left column. These are layout previews in the guide, rather than deployed email-client settings.

Three coded profile previews show LinkedIn, Facebook and Instagram. They are labelled as illustrative, including handles and counts. The platform controls are decorative, not connected actions. Existing brand photographs and the supplied symbol are used; third-party screenshots are not bundled or republished.

Reference material reviewed for platform structure:

- [LinkedIn company Page example](https://www.linkedin.com/help/linkedin/answer/a542848)
- [LinkedIn Page image specifications](https://www.linkedin.com/help/linkedin/answer/a563309/image-specifications-for-your-linkedin-pages-and-career-pages?lang=en)
- [Facebook Page layout reference](https://www.salesmartly.com/en/blog/docs/create-facebook-business-page)
- [Instagram web-profile layout reference](https://igfoexport.com/guide/export-instagram-following)

UI details can vary by account, viewport and platform update. Keep the coded examples consistent with the profile treatments being reviewed rather than presenting them as live account screenshots.

## Logo pack

Each download panel offers “Download Logo pack” as its main action. The ZIP contains eight essential files in two folders: Symbols and Full Logos. Each includes black and white artwork as scalable SVG and transparent high-resolution PNG. Symbol PNGs are 1024px wide and full-logo PNGs are 2560px wide. There are no duplicate sizes or extra formats in the pack. Other formats and favicons remain available through the individual download controls. The archive uses stable file dates. The CTA uses vibrant lime (#A8F000) with Ink text and a dark icon circle. Its hover colour is #BEFF24, with reduced-motion support.


## Social platform gallery and downloads

The Social Media chapter has four platform previews: LinkedIn, Facebook, Instagram and X. Large icon tabs, previous/next buttons, keyboard arrows (plus Home/End) and horizontal drag/swipe select the platform. Selection also changes the downloads in the left column. The track and viewport height animate without autoplay; reduced motion removes transitions. Inactive slides are inert and hidden from assistive technology. Without JavaScript all previews and downloads remain visible.

`scripts/social-downloads.mjs` runs during the normal build. It exports one 400 × 400 PNG profile logo per platform and these blank branded starting layouts, as PNG and editable SVG:

| Platform | Banner | Post | Story |
| --- | --- | --- | --- |
| LinkedIn | 1512 × 256 | 1200 × 1200 | - |
| Facebook | 851 × 315 | 1080 × 1080 | - |
| Instagram | - | 1080 × 1440 | 1080 × 1920 |
| X | 1500 × 500 | 1600 × 900 | - |

Sizes are practical export choices, not claims that platforms accept only these dimensions. Keep important artwork clear of crop edges and check each platform's upload preview. Profile PNGs contain the white symbol on dark ink. Templates have a purple background and small white symbol, leaving room for the user's content. The original eight-file Logo pack remains unchanged and has a quiet download link in this chapter.

References checked 22 October 2026:
- LinkedIn Page logo/cover guidance: https://www.linkedin.com/help/linkedin/answer/a563309/image-specifications-for-your-linkedin-pages-and-career-pages?lang=en
- X profile/header guidance: https://help.x.com/en/managing-your-account/common-issues-when-uploading-profile-photo.html
- Facebook Page image guidance: https://www.facebook.com/help/125379114252045 (login restricted in this environment; 851 × 315 used as the working cover canvas).
- Instagram photo resolution guidance: https://help.instagram.com/1631821640426723 (portrait canvas chosen at 3:4).

Run `node scripts/social-previews.cjs` for interaction, accessibility, responsive fit, download pixel dimensions, reduced motion and no-JavaScript checks. Screenshots are saved under ignored `tmp/social-previews/`.

The Instagram preview's coastal post uses the supplied portrait photograph in assets/social/coastal-post.png. Its optimized WebP preview preserves the composition; the separate coastal photo download is a ready-to-post 1080 × 1440 PNG. The blank post template remains available.


## Guideline image performance

The supplied Strength in Aotearoa artwork is the middle Instagram post. Its original lives in `design/source-images/`, outside the public site staging allowlist. `scripts/social-downloads.mjs` produces a 720 × 960 WebP preview and a separate 1080 × 1440 PNG download. The coastal preview also uses 720 × 960 WebP. High-resolution PNG downloads are links, not image sources, so they are fetched only when requested.

`scripts/brand-previews.mjs` generates WebP previews for the sketch, six merchandise mockups and business-card photo. Logos remain SVG. The sketch uses lossless WebP to preserve its fine lines; photographs use quality 85 with suitable pixel widths. Their combined source size is 16,263,850 bytes versus 1,250,388 bytes for previews, a 92% reduction. Originals remain available in the repository.

Off-screen images use native lazy loading and asynchronous decoding. Preview dimensions reserve their layout space. The sketch remains eager/high priority for its animation. Local Chrome checks at 1440px and 390px fetched 478,702 image bytes initially, with no mockup or download PNG requests until needed. These figures measure image payloads, not total page transfer or a guarantee of frame rates on every device. The staged and reversible logo-animation tests still pass after the changes.

Run `node scripts/brand-image-performance.cjs` to check the image budget, initial requests, responsive layout, image decoding and ready-to-post download dimensions.


## Focused packs and construction study

The Symbol panel downloads `hoea-to-waka-symbol-pack.zip`: four files, black and white SVGs and 1024px PNGs. The Favicon panel downloads `hoea-to-waka-favicon-pack.zip`: SVG, multi-size ICO, and 32/180/512px PNGs. The Logo panel and social shortcut retain the existing eight-file Logo pack.

Typography offers `hoea-to-waka-font-pack.zip`, containing Inter Variable in TTF for desktop apps and WOFF2 for the web, plus the OFL licence and a short installation/use note. Full fonts include the macrons needed for te reo Māori. Source files are kept in `design/source-fonts/`, excluded from public staging; the ZIP is only fetched on download. Source: https://github.com/rsms/inter/tree/master/docs/font-files and https://github.com/rsms/inter/blob/master/LICENSE.txt. ABC Marist is not redistributed or converted; the guide links to https://abcdinamo.com/typefaces/marist. Dinamo's restrictions are at https://abcdinamo.com/licenses.

The business-card construction study is native SVG with a faint paper grid, sketch strokes, bleed boundary, crop marks, trim line, safe area and dimension annotations. The 90 × 55 mm / 3 mm bleed setup is an illustrative example to confirm with the printer. It is not a production artwork download. A small scoped Web Animations controller draws the guides and reveals the mark as the diagram enters view; it reverses smoothly when the diagram goes back below the trigger. There is no continuous JavaScript animation loop. Reduced motion and no-JavaScript both show the completed diagram.

The logo study regression came from HTML height=1254 combined with a CSS width of 77% and no automatic height. Its study became 340 × 1254 instead of 340 × 340. An explicit automatic image height and square aspect ratio restore the correct geometry, with paint contained to the study. The test now checks the square dimensions and every guide's bounds as well as the existing staged/reversible animation tests.

Run `node scripts/brand-packs-card.cjs` for pack contents/actual browser downloads, Inter macrons, sketch drawing/reversal/replay, bounded logo guides, accessibility and responsive layout.
