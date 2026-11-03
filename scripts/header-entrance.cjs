const {chromium}=require('playwright'),assert=require('assert/strict');
(async()=>{const server=require('./preview.cjs')(8896),browser=await chromium.launch({channel:'chrome'});try{
 for(const path of ['/','/about/brand-guidelines/'])for(const width of [1440,760,390,320]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>sessionStorage.setItem('hoea-header-motion-style','9'));
  await page.goto('http://127.0.0.1:8896'+path);
  await page.waitForFunction(()=>document.querySelector('[data-header-entrance]')?.dataset.entranceStyle==='Elastic tilt');
  await page.waitForFunction(()=>document.querySelector('[data-header-entrance]').dataset.entranceState==='idle');
  assert.equal(await page.locator('.header-motion-lab,[data-header-motion-choice]').count(),0);
  assert.equal(await page.locator('.language-launch').count(),1);
  await page.evaluate(()=>scrollTo({top:450,behavior:'instant'}));await page.waitForTimeout(650);
  await page.reload();await page.waitForFunction(()=>document.querySelector('[data-header-entrance]')?.dataset.entranceState==='idle');
  assert.equal(await page.locator('[data-header-entrance]').getAttribute('data-entrance-style'),'Elastic tilt');
  if(width>=1100)assert(await page.locator('[data-header-entrance]').evaluate(e=>e.classList.contains('is-scrolled')));
  await page.locator('[data-menu-toggle]').click();await page.waitForTimeout(700);assert(await page.locator('.site-menu-panel').evaluate(e=>e.open));
  const gap=await page.evaluate(()=>{const a=document.querySelector('[data-menu-toggle]').getBoundingClientRect(),b=document.querySelector('.site-menu-close').getBoundingClientRect();return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))});assert(gap<1);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.site-menu-panel').open);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  await context.close();console.log('PASS sole Elastic tilt, legacy preference ignored, reload, main menu origin',path,width);
 }
 const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();await page.goto('http://127.0.0.1:8896/');await page.waitForFunction(()=>document.querySelector('[data-header-entrance]')?.dataset.entranceBound==='true');assert.equal(await page.locator('.site-brand').evaluate(e=>+getComputedStyle(e).opacity),1);assert.equal(await page.locator('[data-header-entrance]').evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.id.startsWith('header-entrance-')).length),0);await context.close();
 const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8896/');assert(await plain.locator('.site-brand').isVisible());await plain.close();console.log('PASS reduced motion and no-JavaScript header');
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
