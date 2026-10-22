# Brand guideline editorial basis

Reviewed 22 October 2026. This note records the research and local evidence behind the guide rewrite. External references inform the documentation approach; they do not establish new facts about Hoea tō Waka or endorse its services.

## Editorial decisions

Write for someone making material for the brand who may have no design background. Define an unfamiliar term at first use, explain its purpose, then give a concrete action and an example. The favicon section follows this order: small picture in a browser tab, helps someone find the site again, use the supplied square icon in the website’s site-icon setting.

Keep established names, the vision, mission, contact details, logo artwork and palette values. Describe actual website use rather than inventing brand strategy, cultural authority, minimum logo sizes or print colour specifications. The drawings identify existing logo elements; they do not claim a wider cultural meaning.

Keep the four typography comparison layouts. Explain Inter and ABC Marist by role, define weight numbers and show real site copy. The comparison controls are presentation choices, not four competing brand standards.

Distinguish published design from experimentation: the colour editor is a browser-local preview, supporting swatches are options, and mockups are examples rather than production-ready artwork. Remove arbitrary colour percentages and outdated blue/green button rules. Explain the current Ink/white capsule buttons instead.

Cross-check spacing against `design/section-spacing.css`: 92px above 1100px, 65px at 761–1100px and 60px at 760px and below. Explain exceptions for adjoining blocks without requiring a new spacing scale.

Write audience guidance around decisions people need to make, and describe services using the current website offer. Explain how to apply the identity to business cards, email and social posts. Separate the visual example from the instructions.

Remove the hidden project brief, former site audit and private correspondence notes from the public HTML. They were working material and contradicted the current guide.

## Research and tradeoffs

- [Frontify: Brand guidelines](https://www.frontify.com/en/guide/brand-guidelines) and [Style guides](https://www.frontify.com/en/guide/style-guide): useful documentation connects rules, context, assets and examples. A central web guide can reduce repeated questions and inconsistent files. It still needs maintenance; a live page containing stale rules is not a reliable reference. Applied here through practical descriptions and an explicit update note. Frontify sells guideline software, so its platform claims were not treated as independent evidence of business results.
- [Anna Kaley, Nielsen Norman Group: Content Standards in Design Systems](https://www.nngroup.com/articles/content-design-systems/): content guidance belongs alongside visual guidance. Applied through naming, reader needs, tone and a concrete use/avoid writing example.
- [Therese Fessenden, Nielsen Norman Group: Design Systems 101](https://www.nngroup.com/articles/design-systems-101/): reuse and shared standards support consistency, but creating, teaching and maintaining a system takes work. The response here is a proportionate, usable guide, rather than adding rules for every possible situation.
- [Mailchimp: Brand Assets](https://mailchimp.com/about/brand-assets/): a public example of direct instructions for name spelling, logo versions, backgrounds and clear space. Its specific logo rules are not copied to this brand.
- [Atlassian: Logos](https://atlassian.design/foundations/logos/) and [Typography](https://atlassian.design/foundations/typography/): public examples of connecting assets and type styles to their intended uses. Their font names, dimensions and product hierarchy do not apply to this site.
- [MDN: Favicon](https://developer.mozilla.org/en-US/docs/Glossary/Favicon): technical definition supporting the browser-tab and bookmark explanation. [Google Search Central](https://developers.google.com/search/docs/appearance/favicon-in-search) also documents possible search-result use; the guide does not promise search visibility.
- [W3C: Understanding text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): source for 4.5:1 normal text and 3:1 large text. The table checks specific pairs, not whole-page accessibility. Colour ratio is unchanged by swapping foreground and background, so reversal is not offered as a contrast fix.

## Maintenance

Keep the rendered colour chapter and `scripts/brand-guidelines.mjs` aligned. The source palette labels live in `design/brand-tokens.mjs`. When a website decision changes, update the matching rule and visual example together. Recheck wording, small-screen layout and relevant interactions before publishing.
