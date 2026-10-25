const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Axe = require('@axe-core/playwright').default;

(async () => {
  const server = require('./preview.cjs')(8894);
  const browser = await chromium.launch({channel:'chrome'});
  fs.mkdirSync('tmp/door-render', {recursive:true});
  try {
    const context = await browser.newContext({reducedMotion:'reduce'});
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    for (const width of process.argv.includes('--runtime-only') ? [] : [1440,760,390,320]) for (const theme of ['light','dark']) {
      await page.setViewportSize({width,height:1000});
      await page.goto('http://127.0.0.1:8894/about/brand-guidelines/');
      await page.evaluate(theme => localStorage.setItem('hoea-theme',theme),theme); await page.reload();
      const study = page.locator('#brand-door-study');
      await study.scrollIntoViewIfNeeded();
      for (const variant of ['reference','mirror','ocean','midnight','arch','round','oval','facet']) {
        await page.locator(`[data-door-variant=${variant}]`).click();
        assert.equal(await study.locator('[aria-pressed=true]').count(),1);
        const angles={reference:'54.700',mirror:'45.000',ocean:'54.700',midnight:'45.000',arch:'67.000',round:'66.000',oval:'68.000',facet:'64.000'};
        assert.equal(await study.locator('svg').getAttribute('data-angle'),angles[variant]);
        if(['arch','round','oval','facet'].includes(variant)){
          assert.equal(await study.locator('[data-sea-front]').getAttribute('fill'),'#0D4687');
          assert.equal(await study.locator('[data-door-tide]').getAttribute('display'),'inline');
          assert.equal(await study.locator('[data-tide-stars] circle').count(),75);
          assert(await study.locator('[data-door-moon]').isVisible());
        }
        if ([1440,390].includes(width)) await study.screenshot({path:`tmp/door-render/${theme}-${width}-${variant}.png`,style:'.site-header,.brand-jump,.header-motion-lab{visibility:hidden!important}'});
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const placement = await study.evaluate(e => ({top:e.getBoundingClientRect().top+scrollY,cta:document.querySelector('.site-preview-brand-hero-cta').getBoundingClientRect().bottom+scrollY,next:document.querySelector('#contents').getBoundingClientRect().top+scrollY,bottom:e.getBoundingClientRect().bottom+scrollY}));
      assert(placement.top >= placement.cta && placement.next > placement.bottom);
      assert.deepEqual((await new Axe({page}).include('#brand-door-study').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations,[]);
      assert(await page.locator('[data-door-pause]').evaluate(e => e.hidden));
      console.log('PASS eight variants, moon/ocean artwork, placement, responsive fit, reduced motion and accessibility',width,theme);
    }
    await page.setViewportSize({width:1000,height:1000});
    if (process.argv.includes('--runtime-only')) await page.goto('http://127.0.0.1:8894/about/brand-guidelines/');
    await page.locator('[data-door-variant=reference]').click();
    const geometry = await page.locator('#brand-door-study svg').evaluate(svg => {
      const box = selector => {const b=svg.querySelector(selector).getBBox();return {x:b.x,y:b.y,width:b.width,height:b.height};};
      return {panel:box('[data-door-panel]'),lever:box('[data-door-lever]'),plate:box('[data-door-plate]'),edge:box('[data-door-edge]'),latch:box('[data-door-latch]')};
    });
    assert(Math.abs(geometry.panel.x-239)<.1);
    assert(Math.abs(geometry.panel.width-166)<2);
    assert(Math.abs(geometry.panel.y-60)<2);
    assert(Math.abs(geometry.panel.y+geometry.panel.height-642)<2);
    assert(geometry.lever.x>327 && geometry.lever.x<336 && geometry.lever.width>30 && geometry.lever.width<40);
    assert(geometry.lever.y>356 && geometry.lever.y<362);
    assert(geometry.plate.height>47 && geometry.plate.height<52);
    assert(geometry.latch.x>geometry.edge.x && geometry.latch.x+geometry.latch.width<geometry.edge.x+geometry.edge.width);
    console.log('PASS measured reference perspective, projecting lever, backplate and edge latch geometry',JSON.stringify(geometry));
    await context.close();

    const motion = await browser.newPage({viewport:{width:1000,height:1000}});
    await motion.clock.install({time:new Date('2026-10-25T00:00:00Z')});
    await motion.goto('http://127.0.0.1:8894/about/brand-guidelines/');
    await motion.clock.pauseAt(new Date('2026-10-25T00:00:05Z'));
    await motion.addStyleTag({content:'.brand-door-study__stage{width:720px!important;max-width:none!important}.site-header,.brand-jump,.header-motion-lab{visibility:hidden!important}'});
    const svg = motion.locator('#brand-door-study svg');
    await svg.scrollIntoViewIfNeeded(); await motion.clock.runFor(40);
    await motion.locator('[data-door-replay]').click(); await motion.clock.runFor(32);
    let last=0;
    for (const [ms,expected] of [[0,0],[400,6],[800,34],[1400,54.7],[3000,54.7],[4600,35],[5200,0],[6000,0]]) {
      await motion.clock.runFor(ms-last);last=ms;
      assert(Math.abs(Number(await svg.getAttribute('data-angle'))-expected)<2);
      await svg.screenshot({path:`tmp/door-render/motion-${ms}.png`});
    }
    await motion.locator('[data-door-pause]').click();
    const phase = await svg.getAttribute('data-phase'); await motion.clock.runFor(2500);
    assert.equal(await svg.getAttribute('data-phase'),phase);
    await motion.locator('[data-door-pause]').click(); await motion.clock.runFor(100);
    assert.notEqual(await svg.getAttribute('data-phase'),phase);
    await motion.evaluate(() => scrollTo(0,document.body.scrollHeight)); await motion.waitForTimeout(60);
    const offscreen = await svg.getAttribute('data-phase'); await motion.clock.runFor(2000);
    assert.equal(await svg.getAttribute('data-phase'),offscreen);
    await svg.scrollIntoViewIfNeeded(); await motion.waitForTimeout(60); await motion.clock.runFor(100);
    assert.notEqual(await svg.getAttribute('data-phase'),offscreen);
    await motion.evaluate(() => {Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
    const hidden = await svg.getAttribute('data-phase'); await motion.clock.runFor(5000);
    assert.equal(await svg.getAttribute('data-phase'),hidden);
    await motion.evaluate(() => {Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
    await motion.emulateMedia({reducedMotion:'reduce'});
    await motion.waitForTimeout(80); await motion.clock.runFor(64);
    assert.equal(await svg.getAttribute('data-angle'),'54.700');
    await motion.locator('[data-door-variant=midnight]').focus(); await motion.keyboard.press('Enter');
    assert.equal(await svg.getAttribute('data-angle'),'45.000');
    console.log('PASS sampled six-second opening/holding/closing loop, Pause/Replay, offscreen/hidden-tab suspension and keyboard variants');
    await motion.close();
    const plain = await browser.newPage({javaScriptEnabled:false});
    await plain.goto('http://127.0.0.1:8894/about/brand-guidelines/');
    assert(await plain.locator('#brand-door-study svg').isVisible());
    assert(await plain.locator('.brand-door-study__controls').evaluate(e => e.hidden));
    await plain.goto('http://127.0.0.1:8894/');
    assert.equal(await plain.locator('#brand-door-study').count(),0);
    await plain.close();
    for (const reducedMotion of ['reduce','no-preference']) {
      const delayed = await browser.newPage({viewport:{width:390,height:1000},reducedMotion});
      let release;
      const held = new Promise(resolve => release=resolve);
      await delayed.route('**/brand-door.js?*',async route => {await held;await route.continue();});
      await delayed.goto('http://127.0.0.1:8894/about/brand-guidelines/',{waitUntil:'commit'});
      await delayed.locator('#brand-door-study').waitFor();
      await delayed.evaluate(() => document.fonts.ready);
      const height = () => delayed.locator('#brand-door-study').evaluate(e => e.getBoundingClientRect().height);
      const before = await height();release();
      await delayed.locator('.brand-door-study__controls:not([hidden])').waitFor();
      assert.equal(await height(),before,'Enhancement reserves its control space without shifting the contents');
      await delayed.close();
    }
    assert.deepEqual(errors,[]);
    console.log('PASS static no-JavaScript artwork, brand-guide-only scope and stable delayed enhancement');
  } finally {await browser.close();server.close();}
})().catch(error => {console.error(error);process.exitCode=1;});
