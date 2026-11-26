const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const startTestSite = require('./test-site.cjs');

(async () => {
  const {server, base} = await startTestSite();
  const browser = await chromium.launch({channel:'chrome'});
  try {
    const page = await browser.newPage({reducedMotion:'reduce'});
    for (const width of [320,390,768,1440,2560]) {
      await page.setViewportSize({width,height:900});
      await page.goto(base);
      const hero = page.locator('.home-hero');
      const image = hero.locator('.hero-sun-artboard img');
      await image.evaluate(el => el.decode());
      assert.match(await image.getAttribute('src'), /community-chairs\.svg.*#people$/);
      assert.equal(await hero.locator('.hero-sun i').count(), 4);
      assert(await image.isVisible());
      assert.equal(await hero.locator('h1').innerText(), 'Hoea tō Waka');
      assert.equal(await hero.locator('.home-hero-explore').getAttribute('href'), '#services');
      assert.equal(await hero.locator('.home-hero-button-contact').getAttribute('href'), 'contact/');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }
    console.log('PASS seated hero illustration, sun, links and responsive layout');
  } finally { await browser.close(); server.close(); }
})().catch(error => {console.error(error); process.exitCode=1});
