# Colour & typography foundations

Research and design decisions — 12 September 2026.

## Design brief

Keep all 51 existing compositions (Original + 50). Colour and type are independent, site-wide settings: changing either must also affect mixed sections, nested card/button/form/field variations, navigation, utility controls and subsequent routes. Ten palettes, ten free font families, ten curated type pairings. No paid services.

## Research informing the system

- [Radix scale roles](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale): separate quiet backgrounds, component surfaces, borders, fills and text. A palette is a system of usable shades, not a single accent swatch.
- [Atlassian colour](https://atlassian.design/foundations/color): semantic tokens provide consistent application; decorative accents should not replace success/error meanings.
- [Material colour customisation](https://codelabs.developers.google.com/customizing-material-color): relative saturation controls attention. Supporting colours should complement the action colour, not compete everywhere.
- [Google: choosing web fonts](https://design.google/library/choosing-web-fonts-beginners-guide): distinguish display and reading roles; consider character coverage, weight range and the amount of text.
- [Google's expressive variable typography](https://design.google/library/google-sans-flex-font): expressive headings and adaptable type can coexist with legibility. Contemporary does not mean every element has a decorative face.

These are original palette proposals informed by current systems, not claims that a particular hex code is an official 2026 trend. The approach combines earthy and mineral neutrals, unexpected warm/cool accents, and expressive editorial typography with clear interface text.

## Ten deliberately mixed palettes

| Palette | Foundation | Supporting colours | Intent |
| --- | --- | --- | --- |
| Tidal Bloom | Deep teal / shell | Apricot, lavender, sea glass | Coastal warmth with a gentle editorial edge; recommended starting point. |
| Aubergine Garden | Aubergine / rose chalk | Pistachio, dusty rose, ochre | Botanical without a page full of green. |
| Cobalt Atelier | Ink cobalt / porcelain | Vermilion, butter, blue mist | Graphic clarity balanced by warm gallery tones. |
| Terracotta Sky | Clay / limestone | Denim, sage, peach | Human and tactile, anchored by a cool blue counterpoint. |
| Moss & Mulberry | Moss / oat | Mulberry, marigold, pale aqua | Grounded resilience, rich contrast and small moments of energy. |
| Midnight Citrus | Indigo / moonstone | Citron, orchid, glacial blue | Precise and expressive; especially strong in dark mode. |
| Rosewood Lagoon | Rosewood / blush sand | Lagoon, melon, lilac | Warm hospitality with a fresh aquatic balance. |
| Ochre Archive | Ink / parchment | Ochre, eucalyptus, muted coral | An editorial archive with a scholarly, approachable feel. |
| Arctic Poppy | Petrol / ice | Poppy, periwinkle, pale mint | Crisp information design with warm focal points. |
| Plum Sorbet | Plum / vanilla | Persimmon, turquoise, soft lemon | An optimistic, expressive direction without neon overload. |

Each palette has five chromatic families with a 12-step ramp. Semantic light/dark surfaces and paired foregrounds sit above those ramps. Legacy decorative colours are mapped into these same families while preserving relative luminance and alpha, so image scrims and fine borders retain their purpose. Layouts no longer select an unrelated palette. Photographs, illustration pixels and logo artwork remain their original assets.

## Typography selection

Ten families: Manrope, DM Sans, Plus Jakarta Sans, Space Grotesk, Sora, Outfit, Fraunces, Newsreader, Source Serif 4, IBM Plex Mono. Expressive serifs supply editorial warmth; differentiated sans families offer geometric, humanist and technical alternatives; the mono family supplies compact metadata. Every family is available to every role, although curated presets keep body and control text restrained.

Roles: display headings, section/card headings, paragraph text, eyebrows, navigation/buttons/form labels, captions/small print. Role choices override composition-specific fonts without replacing each layout's size and spacing hierarchy. Sample text includes Ā Ē Ī Ō Ū ā ē ī ō ū. Fonts and their open licences are stored locally; only selected faces are requested by normal page text.

## Verification plan

Capture local before/after screenshots. Exercise 10 palettes against all 51 layouts, nested variants, both modes, persistence, mixed routes and font-role changes. Check accessible semantic foreground/background pairs and representative rendered contrast. Inspect desktop and mobile screens, font loading, horizontal overflow, contact-field preservation and existing interactions. Commit and push completed work to origin/main.

## Completed verification

- 1,020 complete palette/layout/mode combinations and 510 nested form/palette combinations passed; all 51 layouts retained.
- Existing route suites passed 1,170 expanded-layout checks and 120 Original/first-five checks, including mobile and intermediate widths.
- 240 additional narrow/intermediate-width checks exercised all ten font families; all families loaded with Latin and Latin Extended subsets.
- Both existing interaction suites passed, covering preserved input, navigation, keyboard tabs, favourites, reset, motion and intercepted email preparation.
- Ten palette/page and ten appearance-dialog accessibility scans passed; a further 24 final home/contact scans passed after allowing the browser to paint changed themes. Automated scanning is a sampled check, not comprehensive accessibility certification.
- Exported JSON, reload and cross-route persistence, cross-tab updates, keyboard focus return, malformed preferences and unavailable localStorage were checked.
- Local screenshots inspected at desktop and mobile widths, including the palette/type dialogs, Original, default light and an alternate dark theme. Photos, logo artwork and historical reference swatches keep their source colours.
