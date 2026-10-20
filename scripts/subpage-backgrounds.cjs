const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const routes=['about','model','services','resources','contact','services/in-house-workshops','services/workshops-for-support-professionals','services/resilience-one-on-one'];
(async()=>{
 const server=require('./preview.cjs')(8838),browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  fs.mkdirSync('tmp/subpage-backgrounds',{recursive:true});
  const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const route of routes){
   for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:1000});await page.goto(`http://127.0.0.1:8838/hoea_to_waka/${route}/`);await page.waitForLoadState('networkidle');
    const hero=page.locator('.subpage-hero'),buttons=hero.locator('[data-coaching-choice]');
    if(['model','services/in-house-workshops','resources'].includes(route)){assert.equal(await buttons.count(),0);assert.equal(await hero.getAttribute('data-coaching-version'),route==='resources'?'01':'04');assert.equal(await hero.locator('.coaching-hero__background').count(),1);assert.equal(await hero.locator('.coaching-hero__background').evaluate(e=>getComputedStyle(e).opacity),'1');assert.equal(await hero.locator('h1').evaluate(e=>getComputedStyle(e).color),route==='resources'?'rgb(24, 32, 44)':'rgb(255, 255, 255)');continue;}
    assert.equal(await buttons.count(),4);assert.equal(await hero.getAttribute('data-coaching-version'),'01');
    const height=await hero.evaluate(e=>e.getBoundingClientRect().height),gradients=new Set();
    for(let i=0;i<4;i++){
     const n=String(i+1).padStart(2,'0');await buttons.nth(i).click();
     assert.equal(await hero.getAttribute('data-coaching-version'),n);
     assert.equal(await hero.locator('[aria-pressed="true"]').count(),1);
     const name=await buttons.nth(i).getAttribute('title');assert.equal(await hero.locator('[data-coaching-status]').textContent(),`Background ${n}: ${name}`);
     const state=await hero.evaluate((e,i)=>{const controls=e.querySelector('.coaching-hero__controls').getBoundingClientRect(),lead=e.querySelector('.ds-lead').getBoundingClientRect(),style=getComputedStyle(e.querySelectorAll('.coaching-hero__background')[i]);return{height:e.getBoundingClientRect().height,ink:getComputedStyle(e.querySelector('h1')).color,gradient:style.backgroundImage,opacity:style.opacity,overflow:document.documentElement.scrollWidth>innerWidth,clearance:controls.top-lead.bottom}},i);
     assert.equal(state.height,height);assert.equal(state.opacity,'1');assert(!state.overflow);assert(state.clearance>=12,'Controls clear copy');assert.equal(state.ink,i<2?'rgb(24, 32, 44)':'rgb(255, 255, 255)');gradients.add(state.gradient);
     if(width!==320)await hero.screenshot({path:`tmp/subpage-backgrounds/after-${route.replaceAll('/','-')}-${width}-${n}.png`,style:'.site-header,.skip-link{visibility:hidden!important}'});
     if(width===1440 && [0,2].includes(i)){
      const result=await new(require('@axe-core/playwright').default)({page}).include('.subpage-hero').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations,[]);
     }
    }
    assert.equal(gradients.size,4);
   }
   console.log('PASS: chosen background or variation controls, readable UI and stable layout',route);
  }
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('http://127.0.0.1:8838/hoea_to_waka/about/');await page.waitForLoadState('networkidle');
  await page.locator('[data-coaching-choice="03"]').click();await page.waitForTimeout(200);
  const opacity=await page.locator('.coaching-hero__background').nth(2).evaluate(e=>parseFloat(getComputedStyle(e).opacity));assert(opacity>0&&opacity<1,'Backgrounds crossfade');
  await page.reload();assert.equal(await page.locator('.subpage-hero').getAttribute('data-coaching-version'),'01');
  const native=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce'}),fallback=await native.newPage();
  for(const route of routes){await fallback.goto(`http://127.0.0.1:8838/hoea_to_waka/${route}/`);assert.equal(await fallback.locator('.coaching-hero__background').first().evaluate(e=>getComputedStyle(e).opacity),'1');assert(await fallback.locator('.coaching-hero__controls').isHidden());}
  assert.deepEqual(errors,[]);
  console.log('PASS: smooth crossfade, clean default on reload, and no-JavaScript fallback');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
