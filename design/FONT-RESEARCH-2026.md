# Serif headings and sans-serif body text — September 2026

This replaces all 20 earlier picker families. The selection is an editorial recommendation for this site, not a claim that these are the 20 most-used fonts of 2026. Twelve heading serifs provide meaningful differences in structure and mood; eight sans serifs keep paragraph text and controls clear. Twenty pairing previews make those differences visible before applying them.

## Research

- [Jeremiah Shoaf / Typewolf: Google Fonts shortlist, updated January 2026](https://www.typewolf.com/google-fonts). Its curated selection supports several established choices here, including Playfair Display, Alegreya, Libre Baskerville, Spectral, Cardo, Merriweather, Inter, Work Sans and Karla. These are useful enduring options alongside newer display tastes.
- [Typography community: choosing one serif and one sans](https://www.reddit.com/r/typography/comments/1pur1ix/if_you_could_only_use_two_fonts_one_sansserif_one/). Community preferences were used as qualitative input, not a popularity poll or expert consensus.
- [Instrument Serif weight discussion](https://www.reddit.com/r/typography/comments/1bnguuj/are_there_any_fonts_like_instrument_serif_with/). Reports about forced bold informed the decision to apply native heading weights rather than synthetic bold.
- [Instrument's own design notes](https://github.com/Instrument/instrument-serif). Instrument Serif is intended for large sizes. It is a display option, paired with a separate sans for reading text.
- [Google Fonts](https://fonts.google.com/) supplies the actual font assets. All families are free, locally hosted, and accompanied by their OFL licences. Available italics and selected real weight ranges are included.

## The 20 families

| Family | Role and rationale |
| --- | --- |
| Instrument Serif | Narrow, expressive display headings; regular weight protects its fine details. |
| Playfair Display | High contrast, polished editorial presence. |
| EB Garamond | Literary, graceful, less overtly fashionable. |
| Libre Baskerville | Broad, assured classical forms for clear statements. |
| Spectral | Contemporary editorial serif with a calmer rhythm. |
| Alegreya | Lively humanist detail for a personal, approachable voice. |
| Crimson Pro | Restrained book typography, useful for thoughtful content. |
| Vollkorn | Sturdy, warm texture with more visual weight. |
| Cardo | Classical character and an unhurried tone. |
| Merriweather | Substantial, readable headings with familiar warmth. |
| Young Serif | Rounded, distinctive display shapes; use its native regular weight. |
| Eczar | More expressive, energetic forms for a bolder direction. |
| Instrument Sans | A clean companion to characterful headings. |
| Inter | Neutral screen text and crisp controls. |
| Source Sans 3 | Open, humanist paragraph text. |
| Work Sans | Practical, slightly informal grotesque texture. |
| Karla | Friendly detail without competing with the heading. |
| Noto Sans | Broad language coverage and steady reading rhythm. |
| Nunito Sans | Softer, rounded warmth. |
| Hanken Grotesk | Clear contemporary text with a measured tone. |

Start comparisons with Instrument Serif / Instrument Sans, Playfair Display / Inter, and EB Garamond / Source Sans 3. Then try Young Serif for a warmer statement or Spectral for a quieter one. These pairing recommendations are our design judgement, not endorsements attributed to the linked sources.

## Implementation

Heading and display roles expose only serif families; paragraphs, eyebrows, navigation and small text expose only sans serifs. Selecting a pairing updates all six roles. Individual role controls remain available. Removed font IDs migrate to the new default while Draft 1 layouts and colour overrides remain intact.

Font files are inspected for macron glyph coverage, and browser tests verify loading, role restrictions, pairing changes, persistence and responsive presentation. The initial Lato candidate was excluded after its downloaded subsets failed the glyph check; Noto Sans fills that slot.
