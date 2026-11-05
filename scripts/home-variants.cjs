const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const AxeBuilder = require('@axe-core/playwright').default;
const KEY = 'hoea-home-hero-choice-v2';
(async () => {
 const server = require('./preview.cjs')(8803);
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const url='http://127.0.0.1:8803/hoea_to_waka/';
 fs.mkdirSync('tmp/hero-variation',{recursive:true});
 try {
  for(const width of [320,390,820,1440,2560]) {
   const context=await browser.newContext({viewport:{width,height:1100},reducedMotion:'reduce'});
   const page=await context.newPage();const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(url);await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('html').getAttribute('data-home-hero'),'03');
   const controls=page.locator('.hero-variation-switch');
   assert.equal(await controls.locator('button').count(),3);
   for(const version of ['03','02','01']) {
    const button=controls.locator(`[data-hero-choice="${version}"]`);
    await button.press('Enter');
    assert.equal(await page.locator('html').getAttribute('data-home-hero'),version);
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    assert.equal(await controls.locator('[aria-pressed="true"]').count(),1);
    assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),version);
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.locator('.home-hero-illustration').isVisible(),version!=='01');
    assert.equal(await page.locator('.home-hero-gallery').isVisible(),version==='01');
    const images=page.locator(version!=='01'?'.home-hero-illustration img:visible':'.home-hero-gallery img');
    await images.evaluateAll(es=>Promise.all(es.map(e=>e.decode())));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const stage=await page.locator('.home-hero-stage').boundingBox();const picker=await controls.boundingBox();
    assert(picker.x+picker.width<=stage.width&&picker.y+picker.height<=stage.y+stage.height);
    assert(stage.width-picker.x-picker.width<=30);
    assert(stage.y+stage.height-picker.y-picker.height<=20);
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:`tmp/hero-variation/verified-${version}-${width}.png`});
    const axe=await new AxeBuilder({page}).include('.home-hero-stage').withTags(['wcag2a','wcag2aa']).analyze();
    assert.deepEqual(axe.violations.map(v=>[v.id,v.nodes.map(n=>n.target)]),[]);
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-home-hero'),version);
   }
   const second=await context.newPage();await second.goto(url);
   assert.equal(await second.locator('html').getAttribute('data-home-hero'),'01');
   await controls.locator('[data-hero-choice="02"]').click();
   await second.waitForFunction(()=>document.documentElement.dataset.homeHero==='02');
   assert.equal(await second.locator('[data-hero-choice="02"]').getAttribute('aria-pressed'),'true');
   assert.deepEqual(errors,[]);await context.close();
   console.log(`PASS ${width}px: all three designs, keyboard, saved choice, cross-tab sync, images, controls and contrast`);
  }
  for(const version of ['01','02','03']) {
   const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1100}});
   await context.addInitScript(({key,version})=>localStorage.setItem(key,version),{key:KEY,version});
   const page=await context.newPage();let release;const gate=new Promise(resolve=>{release=resolve;});
   await page.route('**/home-hero-variants.js*',async route=>{await gate;await route.continue();});
   await page.goto(url,{waitUntil:'commit'});await page.locator('#home-hero-title').waitFor();
   await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('html').getAttribute('data-home-hero'),version);
   const layout=()=>page.locator('.home-hero,.home-hero-copy,#home-hero-title,.home-tagline,.home-intro').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{x:r.x,y:r.y,width:r.width,height:r.height,colour:s.color,size:s.fontSize};}));
   const before=await layout();release();await page.waitForLoadState('networkidle');
   const after=await layout(); if(JSON.stringify(after)!==JSON.stringify(before)) console.log(JSON.stringify({version,before,after},null,2)); assert.deepEqual(after,before,`Saved ${version} must not change layout when controls initialise`);
   await context.close();
  }
  console.log('PASS all three saved choices render before the controls script loads');
  const blocked=await browser.newContext({reducedMotion:'reduce'});
  await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('Storage unavailable');};Storage.prototype.setItem=()=>{throw new Error('Storage unavailable');};});
  const blockedPage=await blocked.newPage();await blockedPage.goto(url);
  await blockedPage.locator('[data-hero-choice="01"]').click();
  assert.equal(await blockedPage.locator('html').getAttribute('data-home-hero'),'01');
  await blocked.close();
  const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto(url);
  assert(await plain.locator('.hero-variation-switch').isHidden());
  assert(await plain.locator('.home-hero-gallery').isVisible());
  assert(await plain.locator('.home-hero-illustration').isHidden());
  assert.equal(await plain.locator('h1').count(),1);
  console.log('PASS unavailable storage and no-JavaScript fallback');
 } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
