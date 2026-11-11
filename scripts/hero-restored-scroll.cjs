const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const server=require('./preview.cjs')(8894),browser=await chromium.launch({channel:'chrome'});
 try {
  for(const [width,reducedMotion] of [[1440,'no-preference'],[390,'no-preference'],[1440,'reduce']]) {
   const page=await browser.newPage({viewport:{width,height:1000},reducedMotion});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   const assertVisible=async()=>{
    await page.waitForFunction(()=>{const copy=document.querySelector('.home-hero-copy');return copy&&!copy.classList.contains('home-hero-motion-pending')});
    await page.waitForFunction(()=>[...document.querySelectorAll('.home-hero-copy .display-title,.home-hero-copy .home-tagline,.home-hero-copy .home-intro,.home-hero-copy .button-row a')].every(e=>Number(getComputedStyle(e).opacity)>.99));
   };
   await page.goto('http://localhost:8894/');await assertVisible();
   await page.evaluate(()=>scrollTo({top:2500,behavior:'instant'}));await page.waitForTimeout(250);
   await page.reload();await page.waitForFunction(()=>scrollY>1000);
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await assertVisible();
   await page.screenshot({path:`tmp/hero-restored-after-${width}-${reducedMotion}.png`});
   assert.deepEqual(errors,[]);await page.close();
   console.log('PASS fresh load and lower-page refresh/return',width,reducedMotion);
  }
 } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
