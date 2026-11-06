import { readFileSync } from 'node:fs';

// Reuse the published palette, including usage links and artwork shades.
// Colour-testing is generated from palette.json by build-brand-palette.py.
export function renderBrandGuidelines() {
  const page = readFileSync(new URL('../colour-testing/index.html', import.meta.url), 'utf8');
  const start = page.indexOf('<section id="palette"');
  const end = page.indexOf('<section id="community-study"', start);
  if (start < 0 || end < 0) throw new Error('Cannot locate the current brand palette');
  const palette = page.slice(start, end)
    .replaceAll('href="../', 'href="../../')
    .replace('<h1 id="palette-title">', '<h2 id="palette-title">')
    .replace('Brand colour palette</h1>', 'Brand colour palette</h2>');
  return `<!-- brand-colours:start -->
<section class="site-preview-section brand-colour-section" id="colours" aria-labelledby="palette-title">
<div class="palette-lab"><div class="palette-lab__wrap">${palette}</div></div>
<p id="guide-palette-status" class="ds-sr-only" role="status"></p>
</section>
<!-- brand-colours:end -->`;
}
