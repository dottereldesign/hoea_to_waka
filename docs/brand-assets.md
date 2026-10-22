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

## Complete pack

Each download panel also offers `hoea-to-waka-full-logo-pack.zip` as its main action. The archive contains all 66 artwork files in Symbols, Full Logos and Favicons folders, plus a plain-text usage guide. It is generated with stable file dates by the same export script. The green CTA uses Forest 800 with white text and Forest 700 on hover, with reduced-motion support.
