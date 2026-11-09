const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require('playwright');
const Axe = require('@axe-core/playwright').default;
const kinds = ['compass','atlas','ratio','blueprint','bezier','atlas-grid','atlas-outline','original'];
const approved = [...fs.readFileSync('assets/logo-black.svg','utf8').matchAll(/<path[^>]* d="([^"]+)"/g)].map(m=>m[1]);
(async()=>{
  const server = require('./preview.cjs')(8893);
  const browser = await chromium.launch({channel:'chrome'});
  const failures=[];
  fs.mkdirSync('tmp/logo-construction',{recursive:true});
  try {
    const context=await browser.newContext({reducedMotion:'reduce'});
    const page=await context.newPage();
    page.on('pageerror',e=>failures.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&r.url().includes('127.0.0.1'))failures.push(r.url());});
    for(const width of [320,390,760,1100,1440]) {
      await page.setViewportSize({width,height:1100});
      await page.goto('http://127.0.0.1:8893/hoea_to_waka/illustrations/');
      await page.evaluate(()=>document.fonts.ready);
      assert.equal(await page.locator('h1').count(),1);
      assert.equal(await page.locator('main>section').first().getAttribute('id'),'logo-construction');
      for(const kind of kinds) {
        await page.locator(`[data-lc-choice=${kind}]`).click();
        const panel=page.locator(`[data-lc-panel=${kind}]`);
        assert.equal(await page.locator('.lc-panel:visible').count(),1);
        assert.equal(await page.locator('.lc-choice[aria-pressed=true]').count(),1);
        assert.deepEqual(await panel.locator('.lc-outline').evaluateAll(es=>es.map(e=>e.getAttribute('d'))),approved);
        if(kind==='compass'||kind==='atlas-outline')assert.equal(await panel.locator('.lc-ink').count(),0,'Sketch never has a fill layer');
        else assert.deepEqual(await panel.locator('.lc-ink>path').evaluateAll(es=>es.map(e=>e.getAttribute('d'))),approved);
        assert.equal(await panel.evaluate(e=>e.getAnimations({subtree:true}).length),0,'Reduced motion is static');
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No page overflow at '+width);
        const clipped=await panel.locator('.lc-guides circle').evaluateAll(es=>es.filter(e=>{const x=+e.getAttribute('cx'),y=+e.getAttribute('cy'),r=+e.getAttribute('r');return x-r< -110||x+r>500||y-r< -90||y+r>480;}).length);
        assert.equal(clipped,0,'All complete circles fit the shared viewBox');
        if([390,1440].includes(width)) {
          await page.locator('#logo-construction').screenshot({path:`tmp/logo-construction/final-${kind}-${width}.png`,style:'.site-header,.language-menu-trigger{visibility:hidden!important}'});
          const audit=await new Axe({page}).include('#logo-construction').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
          assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],kind+' accessibility '+width);
        }
      }
      console.log('PASS all eight studies, original paths, complete circles and responsive fit',width);
    }
    const phi=await page.locator('[data-lc-panel=ratio] .lc-ratio-ring circle').evaluateAll(es=>es.map(e=>+e.getAttribute('r')));
    for(let i=1;i<phi.length;i++)assert(Math.abs(phi[i-1]/phi[i]-(1+Math.sqrt(5))/2)<.0001,'Genuine phi radius progression');
    await page.setViewportSize({width:1440,height:1100});
    await page.emulateMedia({reducedMotion:'no-preference'});
    for(const kind of kinds) {
      await page.locator(`[data-lc-choice=${kind}]`).click();
      const panel=page.locator(`[data-lc-panel=${kind}]`);
      await page.waitForTimeout(750);
      assert(await panel.locator('.lc-draw').evaluateAll(es=>es.some(e=>{const offset=parseFloat(getComputedStyle(e).strokeDashoffset);return offset>0&&offset<1;})),kind+' is actually drawing');
      await page.locator('[data-lc-pause]').click();
      await panel.evaluate(e=>Promise.all(e.getAnimations({subtree:true}).map(a=>a.ready)));
      const before=await panel.evaluate(e=>e.getAnimations({subtree:true}).map(a=>a.currentTime));
      await page.waitForTimeout(180);
      assert.deepEqual(await panel.evaluate(e=>e.getAnimations({subtree:true}).map(a=>a.currentTime)),before,'Pause freezes every animated layer');
      if(kind==='blueprint')assert(await panel.locator('.lc-reveal').evaluate(e=>parseFloat(getComputedStyle(e).height)<570),'Blueprint uses a progressive reveal');
      await panel.screenshot({path:`tmp/logo-construction/motion-${kind}.png`});
      await page.locator('[data-lc-pause]').click();
      await panel.evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>a.finish()));
      await page.waitForFunction(()=>document.querySelector('.lc-status').textContent==='Study complete');
      assert(await page.locator('[data-lc-pause]').isDisabled());
      await page.locator('[data-lc-replay]').click();
      assert(await panel.evaluate(e=>e.getAnimations({subtree:true}).some(a=>a.playState==='running')),'Replay restarts');
      console.log('PASS distinct motion, pause/resume, completion and replay',kind);
    }
    await page.locator('[data-lc-choice=compass]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('[data-lc-choice=compass]').getAttribute('aria-pressed'),'true');
    await page.locator('[data-lc-guides]').uncheck();
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-lc-panel=compass] .lc-guides')).opacity==='0');
    assert.equal(await page.locator('[data-lc-panel=compass] .lc-guides').evaluate(e=>getComputedStyle(e).opacity),'0');
    await page.locator('[data-lc-guides]').check();
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('#logo-construction').evaluate(e=>e.getAnimations({subtree:true}).length),0);
    const plain=await browser.newPage({javaScriptEnabled:false});
    await plain.goto(page.url());
    assert(await plain.locator('[data-lc-panel=compass] .lc-outline').first().isVisible(),'No-JS outline is visible');
    assert(await plain.locator('.lc-choices').isHidden(),'No-JS has no dead buttons');
    assert.deepEqual(failures,[]);
    console.log('PASS keyboard, guide toggle, live reduced-motion change and no-JS fallback; no browser errors');
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
