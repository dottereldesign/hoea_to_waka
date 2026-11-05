// Samples the authored vector curves for the optional reference-guided refinement.
const { chromium } = require('playwright');
const fs = require('node:fs');
fs.mkdirSync('tmp', { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(fs.readFileSync('assets/colour-testing/community.svg', 'utf8'));
    const contours = await page.locator('svg').evaluate(svg => [...svg.querySelectorAll('path,circle,ellipse')].filter(e => e.getAttribute('fill') !== 'none').map(e => {
      const length = e.getTotalLength(), count = Math.max(12, Math.ceil(length / 2.5));
      return Array.from({ length: count }, (_, i) => {
        const p = e.getPointAtLength(length * i / count);
        return [p.x, p.y];
      });
    }));
    fs.writeFileSync('tmp/community-contours.json', JSON.stringify(contours));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
