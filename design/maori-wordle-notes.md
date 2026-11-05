# Māori Wordle — 6 November 2026

Replaced the Resources game teaser with a playable five-tile, six-guess game in the existing forest, cream, apricot, sage and dark-purple palette.

## Vocabulary

Source: https://word-lists.learn.maori.nz/all.php (Māori Word Lists, accessed 6 November 2026).
100 distinct answers and 287 accepted guesses. Entries are NFC-normalised, lowercase, five written Unicode characters, restricted to Māori letters. The answer set uses frequent eligible entries, excluding some proper/group names and spelling variants; accepted guesses retain those entries. This is a finite vocabulary game, not a comprehensive dictionary or a wellbeing-only vocabulary list. Definitions are not copied; completed rounds link to the Māori dictionary for learning.

Macron vowels occupy one tile and differ from short vowels. The digraphs ng and wh occupy two tiles; the instructions explain this convention explicitly.

## Behaviour

Each browser gets its own Fisher–Yates shuffle using crypto randomness where available. Progress is saved locally, including the current guesses and remaining deck. All 100 answers are played before reshuffling; the previous answer cannot immediately repeat at the new cycle boundary. Independent browsers may occasionally draw the same first word; there is no shared server allocation. Clearing storage starts a new shuffled journey. If storage is blocked, the current session remains playable.

Scoring assigns exact matches first, then counts remaining occurrences for misplaced letters. Tile symbols and accessible names supplement colours. On-screen macron keys, physical keyboard entry, NFC input normalisation, a persistent live status, visible focus and reduced-motion compatibility are included.

## Verification

- `node scripts/maori-wordle-core.test.cjs`: vocabulary lengths and uniqueness, duplicate letters, macrons, complete shuffle cycle, malformed saved data.
- Local Chrome/Playwright: win, six-guess loss, unsupported and repeated guesses, decomposed macron entry, reload/resume, completed-round reload, next round, on-screen controls, unavailable storage.
- Rendered checks at 1440, 768, 390 and 320 pixels; no horizontal overflow.
- Scoped axe WCAG A/AA checks pass at desktop and mobile sizes.
- Removed inherited oversized paragraph typography from game controls after mobile comparison; compacted board spacing while retaining 44px keyboard buttons.

Screenshots from verification: `tmp/maori-wordle-1440.png`, `tmp/maori-wordle-768.png`, `tmp/maori-wordle-390.png`, `tmp/maori-wordle-320.png` (local, ignored).
