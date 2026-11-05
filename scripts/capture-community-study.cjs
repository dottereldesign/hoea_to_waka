const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const destination = path.resolve('design/comparisons/community-svg');
async function main() {
  const mode = process.argv[2] || 'after';
  fs.mkdirSync(destination, { recursive: true });
  const server = require('./preview.cjs')(8891);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:8891/hoea_to_waka/colour-testing/');
    await page.waitForLoadState('networkidle');
    await sharp(await page.screenshot()).webp({ quality: 90 }).toFile(path.join(destination, `${mode}-page.webp`));
    if (mode === 'before') return;
    await page.locator('#community-study').scrollIntoViewIfNeeded();
    await sharp(await page.locator('.community-triptych').screenshot()).webp({ quality: 94 }).toFile(path.join(destination, `${mode}-comparison.webp`));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#community-study').scrollIntoViewIfNeeded();
    await sharp(await page.locator('#community-study').screenshot({style:'.site-header,.skip-link,.language-menu{visibility:hidden!important}'})).webp({ quality: 88 }).toFile(path.join(destination, `${mode}-mobile.webp`));
  } finally { await browser.close(); server.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
