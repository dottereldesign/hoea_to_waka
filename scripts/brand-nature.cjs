const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Axe=require('@axe-core/playwright').default;

(async()=>{
  const server=require('./preview.cjs')(8891),browser=await chromium.launch({channel:'chrome'});
  fs.mkdirSync('tmp/nature',{recursive:true});
  const names=['fern','tide','arch','rain','bloom','alpine','grass','shell','cove','forest'];
  try{
    const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    for(const width of process.argv.includes('--runtime-only')?[]:[1440,1100,760,390,320])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:1000});
      await page.goto('http://127.0.0.1:8891/about/brand-guidelines/');
      await page.evaluate(theme=>localStorage.setItem('hoea-theme',theme),theme);await page.reload();
      const section=page.locator('#brand-nature-studies'),stage=section.locator('.brand-nature__stage');
      await section.scrollIntoViewIfNeeded();
      const heights=[];
      for(const name of names){
        await section.locator(`[data-nature-study=${name}]`).click();
        assert.equal(await stage.getAttribute('data-study'),name);
        assert.equal(await section.locator('.brand-nature__choices [aria-pressed=true]').count(),1);
        assert.equal(await stage.locator('svg').count(),1,'Only the chosen study is mounted');
        assert(!/NaN|undefined|Infinity/.test(await stage.innerHTML()),'All geometry is finite');
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        const art=await stage.locator('[data-nature-art]').evaluate(e=>{const b=e.getBBox();return {x:b.x,y:b.y,width:b.width,height:b.height};});
        assert(art.x>=0&&art.y>=0&&art.x+art.width<=640&&art.y+art.height<=640,'Artwork stays inside the canvas');
        heights.push(await section.evaluate(e=>e.getBoundingClientRect().height));
        if(width===1440||width===390)await section.screenshot({path:`tmp/nature/${theme}-${width}-${name}.png`,style:'.site-header,.brand-jump,.header-motion-lab{visibility:hidden!important}'});
      }
      assert(Math.max(...heights)-Math.min(...heights)<1,'Switching studies does not move the guide below');
      assert.deepEqual((await new Axe({page}).include('#brand-nature-studies').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations,[]);
      const placement=await section.evaluate(e=>({top:e.getBoundingClientRect().top+scrollY,door:document.querySelector('#brand-door-study').getBoundingClientRect().bottom+scrollY,next:document.querySelector('#contents').getBoundingClientRect().top+scrollY,bottom:e.getBoundingClientRect().bottom+scrollY}));
      assert(placement.top>placement.door&&placement.next>placement.bottom);
      assert(await section.locator('[data-nature-pause]').evaluate(e=>e.hidden));
      console.log('PASS ten unique studies, finite geometry, stable layout, bounds, reduced motion and accessibility',width,theme);
    }
    await context.close();

    const motion=await browser.newPage({viewport:{width:1440,height:1000}});
    motion.on('pageerror',error=>errors.push(error.message));
    await motion.clock.install({time:new Date('2026-10-25T00:00:00Z')});
    await motion.goto('http://127.0.0.1:8891/about/brand-guidelines/');
    await motion.clock.pauseAt(new Date('2026-10-25T00:00:05Z'));
    const section=motion.locator('#brand-nature-studies'),stage=section.locator('.brand-nature__stage');
    await section.scrollIntoViewIfNeeded();await motion.clock.runFor(40);
    for(const name of names){
      await section.locator(`[data-nature-study=${name}]`).click();
      await motion.clock.runFor(650);const early=await stage.innerHTML();
      await motion.clock.runFor(1700);const later=await stage.innerHTML();
      assert.notEqual(later,early,'Study has actual progressive movement: '+name);
      assert(!/NaN|undefined|Infinity/.test(later));
      await stage.screenshot({path:`tmp/nature/motion-${name}.png`});
      await section.locator('[data-nature-pause]').click();
      const held=await stage.innerHTML();await motion.clock.runFor(1600);
      assert.equal(await stage.innerHTML(),held,'Pause freezes the entire artwork');
      await section.locator('[data-nature-replay]').click();await motion.clock.runFor(800);
      assert(Number(await stage.getAttribute('data-phase'))<1,'Replay resets the scene');
    }
    await section.locator('[data-nature-pause]').click();
    await section.locator('[data-nature-study=fern]').click();
    assert(Number(await stage.locator('[data-nature-art]').getAttribute('opacity'))>.9,'Changing study while paused shows a complete preview');
    await section.locator('[data-nature-pause]').click();await motion.clock.runFor(100);
    await motion.evaluate(()=>scrollTo(0,document.body.scrollHeight));await motion.waitForTimeout(60);
    const offscreen=await stage.getAttribute('data-phase');await motion.clock.runFor(2500);
    assert.equal(await stage.getAttribute('data-phase'),offscreen);
    await section.scrollIntoViewIfNeeded();await motion.waitForTimeout(60);await motion.clock.runFor(100);
    assert.notEqual(await stage.getAttribute('data-phase'),offscreen);
    await motion.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
    const hidden=await stage.innerHTML();await motion.clock.runFor(3000);assert.equal(await stage.innerHTML(),hidden);
    await motion.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
    await motion.emulateMedia({reducedMotion:'reduce'});await motion.waitForTimeout(80);await motion.clock.runFor(80);
    assert.equal(await stage.getAttribute('data-phase'),'3.7');
    const still=await stage.innerHTML();await motion.clock.runFor(3000);assert.equal(await stage.innerHTML(),still);
    await section.locator('[data-nature-study=forest]').focus();await motion.keyboard.press('Enter');
    assert.equal(await stage.getAttribute('data-study'),'forest');
    console.log('PASS all ten motion timelines, Pause/Replay, paused switching, offscreen/hidden-tab suspension and keyboard selection');
    await motion.close();

    for(const reducedMotion of ['reduce','no-preference']){
      const delayed=await browser.newPage({viewport:{width:390,height:1000},reducedMotion});
      let release;const held=new Promise(resolve=>release=resolve);
      await delayed.route('**/brand-nature.js?*',async route=>{await held;await route.continue();});
      await delayed.goto('http://127.0.0.1:8891/about/brand-guidelines/',{waitUntil:'commit'});
      await delayed.locator('#brand-nature-studies').waitFor();await delayed.evaluate(()=>document.fonts.ready);
      const height=()=>delayed.locator('#brand-nature-studies').evaluate(e=>e.getBoundingClientRect().height);
      const before=await height();release();await delayed.locator('.brand-nature__enhancement:not([hidden])').waitFor();
      assert.equal(await height(),before,'Late enhancement does not shift the contents');await delayed.close();
    }
    const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8891/about/brand-guidelines/');
    assert(await plain.locator('#brand-nature-studies svg').isVisible());assert(await plain.locator('.brand-nature__enhancement').evaluate(e=>e.hidden));
    await plain.goto('http://127.0.0.1:8891/');assert.equal(await plain.locator('#brand-nature-studies').count(),0);
    assert.deepEqual(errors,[]);
    console.log('PASS stable delayed enhancement, static no-JavaScript fallback and brand-guidelines-only scope');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
