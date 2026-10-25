const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Axe = require('@axe-core/playwright').default;

(async () => {
  const server = require('./preview.cjs')(8899);
  const browser = await chromium.launch({channel: 'chrome'});
  fs.mkdirSync('tmp/ai-toast', {recursive: true});
  try {
    const context = await browser.newContext({permissions: ['clipboard-read', 'clipboard-write']});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const toast = page.locator('.brand-ai__feedback');
    const launch = page.locator('.brand-ai__launch');
    for (const width of process.argv.includes('--interactions-only') ? [] : [1440, 760, 390, 320]) for (const theme of ['light', 'dark']) {
      await page.setViewportSize({width, height: 900});
      await page.goto('http://127.0.0.1:8899/about/brand-guidelines/');
      await page.evaluate(theme => localStorage.setItem('hoea-theme', theme), theme); await page.reload();
      for (const provider of ['chatgpt', 'claude', 'gemini', 'deepseek', 'figma']) {
        const source = page.locator(`[data-ai-provider=${provider}]`);
        await source.click();
        await page.waitForFunction(() => document.querySelector('.brand-ai__feedback').dataset.tone === 'success');
        await page.waitForTimeout(450);
        assert.equal(await toast.evaluate(e => getComputedStyle(e).position), 'fixed');
        assert(await toast.evaluate(e => e.matches(':popover-open')));
        const bounds = await toast.boundingBox();
        assert(Math.abs(bounds.x - 16) < 1 && Math.abs(bounds.y + bounds.height - 820) < 1);
        assert(bounds.width <= width - 32 && bounds.y >= 0);
        assert.match(await launch.getAttribute('href'), /^https:\/\//);
        assert.equal(await launch.getAttribute('target'), '_blank');
        const old = await toast.boundingBox();
        await page.evaluate(() => scrollBy(0, 600));
        const scrolled = await toast.boundingBox();
        assert(Math.abs(scrolled.x - old.x) < 1 && Math.abs(scrolled.y + scrolled.height - old.y - old.height) < 1, `Toast stays in viewport when source scrolls away: ${JSON.stringify({old, scrolled})}`);
        if (provider === 'claude') await page.screenshot({path: `tmp/ai-toast/after-${theme}-${width}.png`});
        if (provider === 'claude') assert.deepEqual((await new Axe({page}).include('.brand-ai__feedback').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations, []);
        await page.keyboard.press('Escape');
        assert(await toast.evaluate(e => e.hidden));
        assert(await source.evaluate(e => document.activeElement === e));
      }
      console.log('PASS five fixed bottom-left toasts, scroll persistence, bounds, accessibility and Escape', width, theme);
    }
    await page.setViewportSize({width: 1440, height: 1000});
    await page.goto('http://127.0.0.1:8899/about/brand-guidelines/');
    await page.locator('[data-ai-provider=claude]').click();
    await page.waitForFunction(() => document.querySelector('.brand-ai__feedback').dataset.tone === 'success');
    await launch.hover();
    const arrow = launch.locator('svg');
    const animation = await arrow.evaluate(e => e.getAnimations()[0]?.effect.getKeyframes().map(f => f.transform));
    assert(animation.some(t => t.includes('translate(34px, -34px)')));
    assert(animation.some(t => t.includes('translate(-34px, 34px)')));
    assert.equal(await launch.locator('.brand-ai__launch-icon').evaluate(e => getComputedStyle(e).overflow), 'hidden');
    await page.waitForTimeout(850);
    assert.equal(await arrow.evaluate(e => getComputedStyle(e).transform), 'none');
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.mouse.move(1, 1); await launch.hover();
    assert.equal(await arrow.evaluate(e => e.getAnimations().length), 0);
    console.log('PASS diagonal flight, fully clipped wrap, settled arrow and reduced motion');

    // Virtual time tests the actual timeout without waiting through multiple 12s periods.
    await page.clock.install();
    await page.mouse.move(1, 1);
    await page.locator('[data-ai-provider=chatgpt]').click();
    await page.waitForFunction(() => document.querySelector('.brand-ai__feedback').dataset.tone === 'success');
    await page.clock.runFor(5000);
    await launch.focus();
    await page.clock.runFor(20000);
    assert(await toast.isVisible(), 'Keyboard interaction pauses dismissal');
    await page.locator('[data-ai-provider=chatgpt]').focus();
    await page.clock.runFor(7100);
    assert(await toast.evaluate(e => e.hidden), 'Resumes remaining time and dismisses');
    await page.locator('[data-ai-provider=gemini]').click();
    await page.waitForFunction(() => document.querySelector('.brand-ai__feedback').dataset.tone === 'success');
    await toast.hover(); await page.clock.runFor(16000);
    assert(await toast.isVisible(), 'Hover pauses dismissal');
    await page.mouse.move(1, 1); await page.clock.runFor(12100);
    assert(await toast.evaluate(e => e.hidden));
    await context.route('https://claude.ai/new', route => route.fulfill({contentType: 'text/html', body: '<title>Claude handoff test</title>'}));
    await page.locator('[data-ai-provider=claude]').click();
    await page.waitForFunction(() => document.querySelector('.brand-ai__feedback').dataset.tone === 'success');
    const opened = page.waitForEvent('popup');
    await launch.click();
    const destination = await opened; await destination.waitForLoadState();
    assert.equal(destination.url(), 'https://claude.ai/new');
    assert(await toast.evaluate(e => e.hidden), 'Opening the app dismisses the notification');
    await destination.close();
    assert.deepEqual(errors, []);
    console.log('PASS 12-second dismissal, hover/keyboard pause/resume, actual new-tab handoff and click dismissal');
    await context.close();
  } finally {await browser.close(); server.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
