# Whole-site language switching

English (`en-NZ`) is the original source and default. The menu translates the current page in place. It does not open another website or a new tab. The selection is remembered across site pages, refreshes and new tabs. A `?lang=fr` (or another supported code) URL can be shared; `?lang=en` restores and remembers English.

## Implementation

- `assets/i18n.js` controls locale state, persistence, recovery, document language and translated language controls.
- `assets/language-menu.js` retains the reversible circle-to-panel animation, current-language indication, native names and keyboard controls.
- Choosing a non-English language loads [GTranslate’s current translation engine](https://gtranslate.io/website-translator-widget). It performs automatic client-side page translation. English visits make no requests to a translation provider.
- Page text, titles, navigation, controls, image descriptions, accessibility labels and form placeholders are translated. The engine observes content that becomes visible or is added by scripts. English is restored from the original, not reverse-translated.
- The Anna heading mirrors its translated source while keeping its scroll behaviour. Brand names, book titles, artwork, code examples and design tokens are protected. Text embedded in images and downloaded artwork remains the original artwork.
- These are automatic, client-rendered translations, not human-reviewed language editions or pre-rendered multilingual SEO pages. English source files and structured metadata remain the canonical source. The UI identifies translations as automatic.
- The translation service is an external dependency. No API credentials are embedded. Loading errors leave a working English page with an accessible status message. English can cancel a pending translation. User-entered form values remain unchanged.

## Languages

English, te reo Māori, Samoan, Mandarin (Northern Chinese in the census), Hindi, Tagalog, Cantonese (Yue), French, Punjabi (Panjabi) and Afrikaans, ordered by speaker counts. The unspecified Sinitic category is not a separately selectable language and is excluded.

Source: [2023 Census language counts, Stats NZ data published by Figure.NZ](https://figure.nz/chart/yYLyq5llJTCKpYlV), checked 3 November 2026.

## Verification

`npm run test:i18n` tests actual translations for all nine languages, English restoration, persistence across all 14 pages, navigation/reload, dynamic content, form values, mobile layouts, main menu interaction, accessibility and unavailable-service fallback. It requires internet access. `npm run test:language-menu` tests menu geometry, reverse animation, keyboard controls and short-screen scrolling without calling a translation provider.
