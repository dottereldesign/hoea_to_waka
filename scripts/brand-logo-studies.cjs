const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require('playwright');
const Axe = require('@axe-core/playwright').default;

(async () => {
  const server = require('./preview.cjs')(8897);
  const browser = await chromium.launch({channel: 'chrome'});
  fs.mkdirSync('tmp/logo-studies', {recursive: true});
  try {
    const context = await browser.newContext({permissions: ['clipboard-read', 'clipboard-write']});
    const page = await context.newPage();
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => {if (response.url().includes('/logo-hover/') && !response.ok()) failures.push(response.url());});
    for (const theme of ['light', 'dark']) for (const width of [1440, 1100, 760, 390, 320]) {
      await page.setViewportSize({width, height: 1100});
      await page.goto('http://127.0.0.1:8897/about/brand-guidelines/');
      await page.evaluate(theme => localStorage.setItem('hoea-theme', theme), theme);
      await page.reload();
      const section = page.locator('#brand-ai-images');
      await section.scrollIntoViewIfNeeded();
      await page.locator('.logo-copy-studies:not([hidden])').waitFor();
      assert.equal(await section.locator('#brand-ai-images-title').evaluate(e => e.tagName), 'H2');
      for (let style = 1; style <= 6; style++) {
        await page.locator(`[data-logo-style-choice="${style}"]`).click();
        assert.equal(await page.locator('.logo-copy-studies [aria-pressed=true]').count(), 1);
        assert.equal(await page.locator('[data-ai-image]').count(), 2);
        await page.waitForTimeout(800);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const geometry = await section.evaluate(element => {
          const text = element.querySelector('.brand-ai-images__intro').getBoundingClientRect();
          const controls = element.querySelector('.brand-ai-images__controls').getBoundingClientRect();
          return {text: {x: text.x, bottom: text.bottom}, controls: {right: controls.right, y: controls.y}};
        });
        assert(width > 900 ? geometry.controls.right <= geometry.text.x : geometry.text.bottom <= geometry.controls.y + 1);
        const button = section.locator('[data-ai-image=symbol]');
        await button.hover();
        await page.waitForTimeout(1200);
        assert(Math.abs(await button.locator('.logo-copy__wash').evaluate(e => new DOMMatrix(getComputedStyle(e).transform).m42)) < .1);
        if ([1440, 390].includes(width)) await section.screenshot({path: `tmp/logo-studies/${theme}-${width}-${style}.png`, style: '.site-header,.brand-jump,.header-motion-lab{visibility:hidden!important}'});
        await page.mouse.move(1, 1);
      }
      assert.deepEqual((await new Axe({page}).include('#brand-ai-images').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations, []);
      console.log('PASS six layouts, hover fill, columns, overflow and accessibility', theme, width);
    }
    await page.setViewportSize({width: 1440, height: 1000});
    await page.goto('http://127.0.0.1:8897/about/brand-guidelines/');
    const section = page.locator('#brand-ai-images');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const button = section.locator('[data-ai-image=symbol]');
    const y = () => button.locator('.logo-copy__wash').evaluate(e => new DOMMatrix(getComputedStyle(e).transform).m42);
    const start = await y();
    await button.hover(); await page.waitForTimeout(170); const early = await y();
    await page.waitForTimeout(240); const middle = await y();
    assert(start > early && early > middle && middle > 0);
    await page.mouse.move(1, 1); await page.waitForTimeout(90); const draining = await y();
    assert(draining > middle);
    await button.hover(); await page.waitForTimeout(1200); assert(Math.abs(await y()) < .1);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    for (let style = 1; style <= 6; style++) {
      await page.locator(`[data-logo-style-choice="${style}"]`).click();
      const copy = section.locator(`[data-ai-image="${style % 2 ? 'symbol' : 'logo'}"]`);
      await copy.focus(); await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('.brand-ai__status').textContent.includes('image copied.'));
      assert(await page.evaluate(async () => (await navigator.clipboard.read())[0].types.includes('image/png')));
      await page.keyboard.press('Escape');
    }
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.locator('[data-logo-style-choice="2"]').click();
    assert.equal(await page.locator('.brand-ai__image-buttons').evaluate(e => e.getAnimations({subtree: true}).filter(a => a.playState === 'running').length), 0);
    assert.deepEqual(failures, []);
    console.log('PASS sampled progressive fill/reverse, keyboard clipboard in all six styles, reduced motion and real image requests');
    await context.close();

    const delayed = await browser.newPage({viewport: {width: 390, height: 1000}});
    let release;
    const held = new Promise(resolve => release = resolve);
    await delayed.route('**/brand-logo-studies.js?*', async route => {await held; await route.continue();});
    await delayed.goto('http://127.0.0.1:8897/about/brand-guidelines/', {waitUntil: 'commit'});
    await delayed.locator('#brand-ai-images').waitFor();
    await delayed.evaluate(() => document.fonts.ready);
    const measure = () => delayed.locator('#brand-ai-images').evaluate(e => e.getBoundingClientRect().height);
    const before = await measure(); release();
    await delayed.locator('.logo-copy-studies:not([hidden])').waitFor();
    assert.equal(await measure(), before);
    console.log('PASS delayed study enhancement preserves exact section height');
    await delayed.close();
  } finally {await browser.close(); server.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
