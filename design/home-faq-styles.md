# Homepage FAQ background studies

The homepage-only selector offers five flat colours (01–05) and five layered
treatments (06–10). Coastal mesh (06) is the initial selection. The alternatives
are Powder blue, Sage, Warm sand, Soft lilac, Deep ocean, Aurora, Tidal contours,
Glass garden and Lunar halo. Buttons announce their names and selected state;
changing a style preserves open answers and the existing accordion motion.

All treatments retain 8px side margins and a 32px radius. Each palette defines
text, answer copy, number, rule, icon, hover and focus colours. Meshes, grain and
contours are static CSS backgrounds; no animation loops, video, large images or
backdrop blurs are added. Glass garden uses translucent column surfaces.

`assets/home-faq-styles.css` and `assets/home-faq-styles.js` load only on the
homepage. Native details and the default background still work without JavaScript;
the preview selector stays hidden in that case. Contact FAQs are unchanged.

Run `node scripts/home-faq-styles.cjs` for all ten treatments at five widths,
painted-background text contrast, accessibility, keyboard selection, fixed insets
and native fallback. `node scripts/home-faq.cjs` checks existing accordion motion.
Local screenshots are saved under `tmp/faq-styles/`.
