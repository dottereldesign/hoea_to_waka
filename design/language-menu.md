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

## Flag button

The button uses local SVG flags from [flag-icons](https://github.com/lipis/flag-icons), with its MIT license retained in `assets/language-flags/LICENSE.txt`. English and Māori use New Zealand, Samoan uses Samoa, Mandarin uses China, Hindi/Punjabi use India, Tagalog uses the Philippines, Cantonese uses Hong Kong, French uses France, and Afrikaans uses South Africa. Native-language names remain the menu labels and accessible button name. The flag updates only when the selected language is applied successfully; an English fallback restores New Zealand.


## Performance update — 3 November 2026

The panel keeps its native top-layer popover and circle-to-rounded-panel clip. Percentage insets remove the opening geometry read; closing uses its own ease-out instead of running the opening easing backwards. Interrupted transitions begin from the currently displayed clip. The surface has layout/style/paint containment and a clip-path compositor hint.

Tiny local Noto subsets cover the four non-Latin labels (about 5.5 KB total). They load after the document load event, so the first opening does not require Windows to search its system font collection. The hidden layout is prepared on pointer or keyboard intent, and retained after use; it stays invisible and unfocusable when closed. It is not prepared on scroll, to avoid adding work to the first scroll animation.

Run `node scripts/language-menu-motion.cjs` for sampled frames, interrupted reversal and responsive behaviour. Run `node scripts/language-menu-performance.cjs current` for cold/repeated click handlers, frame intervals and Chrome layout/style metrics at 4× CPU slowdown. Output goes to `tmp/performance/`; these are local lab measurements, not field INP or a guaranteed device frame rate.
