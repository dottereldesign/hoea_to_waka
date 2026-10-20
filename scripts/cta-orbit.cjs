const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const serve = require('./preview.cjs');

(async () => {
  const server = serve(8793);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    fs.mkdirSync('tmp/cta-orbit', { recursive: true });
    const page = await browser.newPage({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const section = page.locator('[data-component="home:7:cta"]');
    const photo = section.locator('[data-cta-orbit] img').first();
    const transform = () => photo.evaluate(el => getComputedStyle(el).transform);
    await page.goto('http://127.0.0.1:8793/hoea_to_waka/');
    await page.waitForLoadState('networkidle');
    await section.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.home-cta-simple').classList.contains('is-orbit-running'));
    const animation = await section.locator('[data-cta-orbit]').evaluate(el => el.getAnimations()[0].effect.getTiming());
    assert.equal(animation.duration, 96000);
    assert.equal(animation.easing, 'linear');
    assert.equal(animation.iterations, Infinity);
    let before = await transform();
    await page.waitForTimeout(600);
    assert.notEqual(await transform(), before, 'orbit moves independently of scrolling');
    assert(await photo.evaluate(el => {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1;
    }), 'photos stay upright');
    assert.equal(await section.locator('[data-orbit-pause]').count(), 0);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForFunction(() => !document.querySelector('.home-cta-simple').classList.contains('is-orbit-running'));
    before = await transform();
    await page.waitForTimeout(200);
    assert.equal(await transform(), before, 'offscreen orbit does not keep animating');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [2560, 1440, 1280, 1024, 768, 600, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('http://127.0.0.1:8793/hoea_to_waka/');
      await page.waitForLoadState('networkidle');
      await section.scrollIntoViewIfNeeded();
      await section.locator('img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
      assert.equal(await section.locator('img').count(), 8);
      assert.equal(await section.locator('[data-cta-orbit]').getAttribute('aria-hidden'), 'true');
      assert.equal(await section.locator('h2').textContent(), 'Bring the model into your organisation.');
      assert.deepEqual(await section.locator('.home-cta-actions a').allTextContents(), ['Start a conversation']);
      assert.deepEqual(await section.locator('.home-cta-actions a').evaluateAll(els => els.map(el => new URL(el.href).pathname)), ['/hoea_to_waka/contact/']);
      assert.equal(await section.locator('[data-cta-orbit]').evaluate(el => getComputedStyle(el).animationName), 'none');
      assert.equal(await section.locator('[data-orbit-pause]').count(), 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no page overflow at ' + width);
      const overlap = await section.evaluate(el => {
        const orbit = el.querySelector('[data-cta-orbit]');
        const heading = el.querySelector('.home-cta-copy').getBoundingClientRect();
        const body = el.querySelector('.home-cta-body').getBoundingClientRect();
        let worst = 0;
        // Sweep a complete revolution: no photo may pass over copy or buttons.
        for (let angle = 0; angle < 360; angle += 3) {
          orbit.style.setProperty('--cta-orbit-angle', angle + 'deg');
          for (const img of orbit.querySelectorAll('img')) {
            const r = img.getBoundingClientRect();
            for (const q of [heading, body]) {
              const area = Math.max(0, Math.min(r.right, q.right) - Math.max(r.left, q.left)) * Math.max(0, Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top));
              worst = Math.max(worst, area);
            }
          }
        }
        orbit.style.removeProperty('--cta-orbit-angle');
        return worst;
      });
      assert.equal(overlap, 0, 'photos clear the copy throughout the orbit at ' + width);
      if ([1440, 390, 320].includes(width)) await section.screenshot({ path: `tmp/cta-orbit/after-${width}.png`, style: '.site-header,.skip-link{visibility:hidden!important}' });
    }
    const plain = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
    await plain.goto('http://127.0.0.1:8793/hoea_to_waka/');
    assert.equal(await plain.locator('.home-cta-orbit img').count(), 8);
    assert.equal(await plain.locator('.home-cta-orbit').evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
    assert(await plain.getByRole('link', { name: 'Start a conversation', exact: true }).isVisible());
    await plain.close();
    assert.deepEqual(errors, []);
    console.log('PASS: continuous upright orbit without a pause button, offscreen pause, unchanged copy and links, all-angle clearance at 320–2560px, reduced motion and no-JS fallback.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
