const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const serve = require('./preview.cjs');

(async () => {
  const server = serve(0);
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto('http://127.0.0.1:' + server.address().port + '/hoea_to_waka/about/brand-guidelines/');
      await page.waitForSelector('.header-compositor');
      await page.waitForFunction(() => document.querySelector('[data-header-entrance]').dataset.entranceState !== 'playing');
      const check = async () => {
        const gaps = await page.evaluate(async () => {
          const shell = document.querySelector('.site-header-shell');
          const notice = document.querySelector('[data-book-notice]');
          const gaps = [];
          for (const top of [0, 24, 180, 1200, 18, 90, 5, 0]) {
            scrollTo({ top, behavior: 'instant' });
            gaps.push(shell.getBoundingClientRect().top - Math.max(0, notice.getBoundingClientRect().bottom));
            await new Promise(requestAnimationFrame);
          }
          return gaps;
        });
        assert(gaps.every(gap => Math.abs(gap) < 1), width + 'px notice/header gaps: ' + gaps);
        await page.waitForFunction(() => !document.querySelector('.site-header').classList.contains('has-compact-logo'));
      };
      await page.waitForTimeout(1200);
      await check();
      await page.locator('[data-book-notice] button').click();
      await check();
      await page.locator('.site-menu-toggle').click();
      await page.waitForSelector('.site-menu-panel[open]');
      await page.keyboard.press('Escape');
      await page.close();
      console.log(width, 'passed');
    }
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
