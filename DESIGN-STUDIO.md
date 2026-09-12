# Hoea tō Waka — component design studio

## Using the studio

Every public section has a small Layers control at its top right. It opens six choices: **Original**, plus **Editorial**, **Open water**, **Blueprint**, **Field notes**, and **Constellation**. Hover a choice to see its layout and motion name. Tab, Enter, and Escape work throughout. Native modal dialogs keep the picker above page content; its controls are not clipped by component containers.

Cards, actions, the enquiry form and individual fields have smaller controls for independent treatments. Their first choice restores the section's default treatment. The section-level Original restores the actual pre-existing DOM, including listeners and form state.

The bottom-left **Design studio** control applies a complete direction to the current page, shows/hides detailed controls, pauses motion, exports the browser's choices as JSON, and restores originals. Each section and micro-component stores its own choice in localStorage. Navigation and footer choices carry across pages. `?design=0` through `?design=5` open a particular direction for comparison; ordinary navigation uses your saved choices. New visitors see Editorial.

This is a public design playground as requested. The controls appear on the published website. No selection changes the site for other visitors. Original HTML remains the no-JavaScript fallback. Brand-guidelines reference documents keep their existing presentation.

## Coverage and direction

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

GitHub Pages was returning 404 although its source was configured and the repository was public. GitHub Actions was disabled. Actions is re-enabled for GitHub-owned actions only. `.github/workflows/pages.yml` publishes an explicit public-file allowlist via Pages Actions. It excludes source code, node_modules, local screenshots, internal context and Jamie's private workspace from the deployed artifact. This does not make files in the already-public Git repository private; it only limits website deployment content.

Published URL: https://dottereldesign.github.io/hoea_to_waka/
