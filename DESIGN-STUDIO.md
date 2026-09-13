# Hoea tō Waka — component design studio

## Shared colours and typography

The layout library now shares 10 site-wide colour palettes and six typography roles. Open **Colours & type** at the bottom left, or use the foundations shortcut inside Design studio. There are 10 font families and 10 suggested pairings. These settings apply to Original and all 50 directions, including nested variations, and persist across routes. Layouts retain their geometry and motion; the new foundations control their colours and fonts. See [research and palette rationale](assets/THEME-RESEARCH.md). Historical colour/font descriptions below describe the original layout explorations.


## Using the studio

Each component control now has **previous / menu / next** buttons. The arrows cycle through all 51 options without opening the menu and wrap between Original and the final direction. Card, button, form and field controls have the same shortcuts; choices save immediately. Controls move around occupied actions so they do not intercept navigation or form buttons.

When finished, use **Export my design choices** in the footer. The downloaded `hoea-client-design-YYYY-MM-DD.json` is the handoff for creating a client-ready site. Attach it or paste its contents into the design conversation. It includes all 10 studio routes, 52 top-level components (including shared navigation/footer), effective design IDs and names, active nested overrides with labels, and the selected colour palette and light/dark mode. Typography and entered enquiry data are excluded. Unchanged sections are explicitly recorded as their effective defaults; overrides belonging to an inactive parent layout are excluded. The exported file describes the chosen state at the time the button was clicked. A failed page read reports an error instead of downloading an incomplete file.

The schema is `hoea-to-waka/client-design-handoff`, version 1. `effectiveChoices` provides exact stable studio keys, while `sharedComponents` and `pages` explain those keys for a reviewer. `selectionRules` documents defaults and indexing. The handoff requests a separate client-ready presentation with the studio tooling removed; exporting does not change the published site or create that presentation automatically. The existing studio export button uses the same handoff format.

Every public section has a small Layers control at its top right. It opens 51 choices: **Original**, the first five designs, and **45 additional directions**. Search by name, collection or motion; use collection filters or star favourites. Hover a choice to see its layout and motion name. Tab, Enter, and Escape work throughout. Native modal dialogs keep the picker above page content; its controls are not clipped by component containers.

Cards, actions, the enquiry form and individual fields have smaller controls for independent treatments. Their first choice restores the section's default treatment. The section-level Original restores the actual pre-existing DOM, including listeners and form state.

The bottom-left **Design studio** control applies a complete direction to the current page, shows/hides detailed controls, pauses motion, exports the browser's choices as JSON, and restores originals. Each section and micro-component stores its own choice in localStorage. Navigation and footer choices carry across pages. `?design=0` through `?design=50` open a particular direction for comparison; ordinary navigation uses your saved choices. New visitors see Editorial.

This is a public design playground as requested. The controls appear on the published website. No selection changes the site for other visitors. Original HTML remains the no-JavaScript fallback. Brand-guidelines reference documents retain their layout while sharing the new colour and typography settings.

## Original five directions

Ten public templates: Home, About, Services, all three service-detail pages, Resources, Contact, Illustrations, and 404.

| Component family | Five new layouts |
| --- | --- |
| Navigation | Editorial masthead; floating island; two-tier grid; journal masthead; navigation dock |
| Home hero | Asymmetric landscape; cinematic horizon; cobalt atlas; photo journal; interactive constellation |
| Page headers | Oversized editorial; image-led header; indexed grid; paper note; orbital heading |
| Brand statement | Editorial manifesto; centred water; graphic poster; letter; compass composition |
| Services | Staggered cards; image panels; indexed rows; field cards; keyboard-accessible tab explorer |
| Features | Editorial columns; asymmetric bento; numbered manifesto; pinned notes; connected pathway |
| Applications | Two-column index; floating islands; icon matrix; checklist; typographic cloud |
| Story/content | Editorial split; immersive image split; two-column reading; journal; constellation |
| Process | Horizontal timeline; vertical river; stepped blocks; numbered journal; expandable steps |
| Testimonials | Asymmetric quotes; cinematic carousel; indexed panels; letters; focused quote explorer |
| CTA | Editorial invitation; image-led invitation; arrow banner; postcard; beacon |
| Contact | Editorial split; image/form split; directory; letter; focused form |
| FAQ | Split accordion; card accordion; numbered index; open journal; exclusive accordion |
| Books | Editorial catalogue; perspective shelf; indexed catalogue; book journal; exhibition |
| Video/waiata | Editorial pair; cinema stack; indexed list; paper cards; circular media |
| Gallery | Grid; masonry; index; photo journal; scroll-snap reel |
| Footer | Editorial sign-off; ocean horizon; large wordmark; journal colophon; compass |
| Quick contact | Circular plus; wave pill; square arrow; envelope; compass |
| 404 | Editorial message; coastal scene; graphic numeral; missing journal page; compass |

The designs change composition, reading hierarchy, image framing, spacing, and motion—not only colour. Reusable typography, link and card functions preserve semantics and business content across the independently authored layouts.

## 45 additional directions

All 19 component families now support another 45 choices (IDs 6–50), alongside the existing five and Original. Cards, buttons, forms and fields also expose the added direction treatments. The added library shares semantic content builders and tokens, but has 45 explicit composition functions: spatial hierarchy, image framing, content arrangements and typography change across directions. Compact navigation and quick-contact patterns adapt the collections to their smaller footprints. Motion has per-direction entrance vectors, durations and stagger timing. No autoplay video or continuous GPU-heavy scene was added.

| IDs | Collection | Directions |
| --- | --- | --- |
| 6–10 | Botanical | Canopy, Fernhouse, Glasshouse, Understory, Seedling |
| 11–15 | Coastal | Tidal, Estuary, Shoreline, Harbour, Sea Glass |
| 16–20 | Sculptural | Monolith, Clay Studio, Archway, Still Life, Balance |
| 21–25 | Editorial | Folio, Dispatch, Margin, Anthology, Colophon |
| 26–30 | Graphic | Signal, Cutout, Assembly, Wayfinder, Playbill |
| 31–35 | Quiet | Stillwater, Linen, Pause, Breathing Room, Soft Focus |
| 36–40 | Nocturnal | Afterglow, Observatory, North Star, Deep Current, Moonrise |
| 41–45 | Playful | Paper Garden, Pebble, Ribbon, Mosaic, Postmark |
| 46–50 | Architectural | Atrium, Terrace, Pavilion, Contour, Threshold |

Picker thumbnails are schematic layout sketches, not screenshots. Hover or focus a tile for its description and motion name, then select to preview the real component. Favourites are browser-local and survive resetting all sections to Original. Existing saved IDs 0–5 are unchanged. Initial navigation reveal remains confined to the homepage.

### Added generated imagery

Three new assets generated using the **built-in image generation tool**, inspected and converted to optimised WebP. These are clearly conceptual visuals, not photographs documenting a real service, person or named location. Existing portraits, book covers and other content imagery remain in the relevant content components.

- `assets/forest-concept.webp` — 1536×864, approximately 299 kB.
- `assets/sculpture-concept.webp` — 1536×864, approximately 83 kB.
- `assets/tide-concept.webp` — 1536×658, approximately 284 kB.

#### Exact prompts

**Forest**

Use case: photorealistic-natural. Asset type: wide website art for a real Aotearoa resilience training business, used as an evocative concept, not a documented location. Primary request: an extraordinary editorial landscape photograph of a quiet native fern forest, pale morning mist and a narrow sunlit stream winding between rocks. Immersive fresh green canopy, tangible leaf texture, understated cinematic light. Composition: wide landscape, generous uncluttered misty space, no people or buildings. No text, logos, cultural carvings, or watermarks. Natural rather than fantasy.

**Sculpture**

Use case: stylized-concept. Asset type: website editorial art for a practical resilience training business. Primary request: a beautiful sculptural still life of three smooth pale limestone arches and one terracotta sphere balanced beside shallow blue-green water, visually expressing connection and a way forward. Premium physical studio photography of a handmade clay sculpture, subtle imperfect stone texture, warm sidelight, soft long shadows, muted sand background. Wide landscape with generous negative space. No text, people, logos, writing, watermark, or cultural motifs. Clearly an abstract concept, not a real product.

**Tide**

Use case: photorealistic-natural. Asset type: wide editorial website concept art for an Aotearoa resilience business. Primary request: an ethereal but believable close aerial photograph of a turquoise ocean tide washing onto black volcanic sand. White foam traces elegant curves through the dark sand, rich jade water and finely textured sparkling volcanic grains. Abstract sweeping diagonal composition, refined natural colours, softly overcast light, no people, animals, boats, buildings, writing, text, logos or watermark. Not a specific identifiable location, no culturally significant sites. Landscape panoramic crop, richly detailed.

## Content and accessibility

Existing service descriptions, contact details, resource titles, and substantive explanatory copy are extracted from the source HTML. New headline copy remains about resilience training and the Aotearoa context. No invented prices, results, clients, credentials, statistics, or endorsements were added. Placeholder/lorem-ipsum testimonials are omitted from the five new layouts; Original preserves the previous content.

The contact form opens a prepared email; it is not a server submission. The existing `contact.js` remains loaded exactly once. Switching designs moves the same form node, preserving entered values and validation. Email, telephone, resource links, service links and the Shielded Site control remain actionable.

Motion respects `prefers-reduced-motion`, can be paused through the studio, uses native scrolling, and does not trap the scroll wheel. Each main direction has a different heading/reveal treatment: staggered rise, blur dissolve, horizontal slide, paper tilt, spring/scale. Looped orbital and float effects stop in reduced-motion mode. Navbar landing reveals remain exclusive to the homepage in Original; new subpage headers appear immediately.

## Research and implementation choices

- [Skelementor Free Components](https://skelementor.com/free-components): reviewed the available component taxonomy and indexed hero, navigation, footer, feature, contact, FAQ and testimonial examples. Some category URLs returned access errors in the research tool. These layouts are original implementations, not copied paid templates.
- [Dribbble editorial wellness direction](https://dribbble.com/shots/27293130-Editorial-Luxury-Website-Design-for-a-Modern-Therapy-Wellness): reference for literary typography, structured margins and paper-like composition.
- [Awwwards storytelling collection](https://www.awwwards.com/websites/storytelling/) and [Ninth Seat](https://www.awwwards.com/sites/ninth-seat-1): references for narrative hierarchy and varied section composition.
- [Motion Primitives](https://github.com/ibelick/motion-primitives): locally adapted TextEffect and AnimatedBackground patterns in `design/motion-primitives.jsx`, using React and Motion. No remote runtime dependency is needed by visitors.
- [Motion documentation](https://motion.dev/docs/react): spring/layout and viewport animation behaviour. React is mounted only in animated headings and the design picker; existing static pages remain the foundation.
- [Lucide](https://lucide.dev/guide/lucide): consistent SVG icons, bundled locally with only the selected exports.
- [Reddit: go-to icon libraries](https://www.reddit.com/r/webdev/comments/1o1v1ww/what_is_your_goto_icon_library_and_why/): the discussion had a visible +50 score in search results; Lucide and other established sets recur in recommendations. This is community preference, not a claim of a definitive 2026 ranking.
- [Reddit: icon-library discussion](https://www.reddit.com/r/webdev/comments/1p72igp/what_icon_libraries_do_you_actually_use/): visible +38 discussion about Lucide and the risk of generic-looking interfaces. Icon choice alone does not create a design.
- [Reddit: kinetic text](https://www.reddit.com/r/web_design/comments/vk21lo/): visible +33 explanation of clipping/keyframes and +14 GSAP recommendation. Used as a community signal; API implementation follows primary documentation.
- [Reddit: animation-heavy websites](https://www.reddit.com/r/web_design/comments/10mb75b/): asset sizing and raster images were a recurring performance concern. The new atmospheric image is a locally served ~248 KB WebP; no video autoplay, external 3D engine, or large image sequence is required.

The UX applies familiar principles from *Don't Make Me Think* (clear labels and destinations), *The Design of Everyday Things* (feedback, visible state, reversible actions), and *Refactoring UI* (hierarchy, contrast and spacing). These are design principles, not claims of direct quotation or endorsement. Mobbin was considered as a reference source, but no authenticated library content was inspected.

## Generated image and optional film

`assets/ocean-concept.webp` was generated using the built-in image-generation tool, then compressed from the original PNG. It is a concept landscape, not evidence of a real workshop location. The source PNG remains in the local generated-images folder.

Prompt: “Generate one wide cinematic photographic website background asset, 1536x1024 landscape. A tranquil deep teal New Zealand coastal inlet seen from an elevated shore at early morning, dark forested hills framing right side, a distant misty ridge, soft silver sunlight on gently rippled water, pale warm cream sky. Rich subtle film grain, editorial travel photography, natural beautiful restrained colors, sophisticated and expansive, usable as immersive background for a resilience training business. Left two thirds mostly open water with quiet tonal contrast for light typography. No people, no boats, no buildings, no text, no logos, no graphic overlays. This is a conceptual atmospheric placeholder, not a claim of any specific location.”

Optional Open water hero film: a 10–15 second silent morning-water loop with a slow aerial pullback; keep the left half quiet for text. Supply 1080p MP4 and WebM plus a poster, ideally under 3 MB. For an additional floating ribbon layer, supply a transparent WebM and a still PNG fallback; if starting from green screen, key it during asset production rather than running expensive live chroma-key processing. Use [Awwwards storytelling examples](https://www.awwwards.com/websites/storytelling/) for pacing. The on-page “The film we imagine” control opens this concept brief and is explicitly not a video player. No further asset is required to use the site.

## Development and deployment

`npm install` then `npm run build` compiles the studio and copies its CSS into `assets/`. The compiled files are committed so the original static hosting model remains usable. On this Windows host, npm's global script-shell setting points to `/bin/bash`; use `npm --script-shell=C:\Windows\System32\cmd.exe run build` if needed, or `node scripts/build.mjs`.

Run `node scripts/preview.cjs` for a local project-path preview. `node scripts/verify.cjs` checks all six designs on all ten templates at desktop and mobile widths, headings, image errors, horizontal overflow and Original restoration. Screenshots and reports go to ignored `tmp/design-studio/`.

The expansion adds `node scripts/verify-expanded.cjs` (1,170 route/viewport/direction checks, all 45 mobile menus, preserved form input and Original restoration); `node scripts/interactions-expanded.cjs` (51-option picker, search, favourites, persistence, whole-page application, independent form treatment, all 51 form states, quick contact, URL selection and 45 motion-enabled mounts); and `node scripts/accessibility-expanded.cjs` (135 WCAG-tagged automated page scans plus the library dialog). All passed after the caption-contrast corrections. An additional 180 intermediate-width checks at 801, 850, 900 and 1100 pixels found no document or navigation overflow. Automated tests complement visual review; they are not a claim of complete accessibility certification. Contact tests intercept email preparation before it can open an external application.

GitHub Pages was returning 404 although its source was configured and the repository was public. GitHub Actions was disabled. Actions is re-enabled for GitHub-owned actions only. `.github/workflows/pages.yml` publishes an explicit public-file allowlist via Pages Actions. It excludes source code, node_modules, local screenshots, internal context and Jamie's private workspace from the deployed artifact. This does not make files in the already-public Git repository private; it only limits website deployment content.

Published URL: https://dottereldesign.github.io/hoea_to_waka/

Individual component palettes: open any component’s menu and choose **Colour scheme**. **Use site theme** is the default; nested cards, buttons, forms and fields offer **Use parent colours**. A pinned palette survives layout changes and follows the site light/dark mode. Nested choices belong to their parent layout. The footer handoff uses schema version 2 and includes `effectiveColourOverrides`, resolved per-component colours and colour-only nested overrides. Typography remains global. Verify with `node scripts/component-colours.cjs`.
