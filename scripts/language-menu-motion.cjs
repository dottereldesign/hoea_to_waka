const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const server=require('./preview.cjs')(8924),browser=await chromium.launch({channel:'chrome'});
 fs.mkdirSync('tmp/language-menu/motion',{recursive:true});
 try{
  for(const width of [1440,390,320]){
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8924/');await page.evaluate(()=>document.fonts.ready);
   await page.locator('.language-launch').click();
   await page.evaluate(()=>{const panel=document.querySelector('.language-panel');window.menuMotion=panel.getAnimations().find(a=>a.effect.target===panel);window.menuMotion.pause();});
   let previous=-1;
   for(const time of [0,90,220,540]){
    const state=await page.evaluate(async time=>{window.menuMotion.currentTime=time;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return{progress:window.menuMotion.effect.getComputedTiming().progress,clip:getComputedStyle(document.querySelector('.language-panel')).clipPath};},time);
    assert(state.progress>=previous);previous=state.progress;assert(state.clip.includes('24px'));
    if(width!==320)await page.screenshot({path:`tmp/language-menu/motion/open-${width}-${time}.png`});
   }
   await page.evaluate(()=>window.menuMotion.play());await page.waitForTimeout(40);
   await page.locator('.language-close').click();
   await page.waitForFunction(()=>!document.querySelector('.language-panel').matches(':popover-open'));
   // Interrupt an opening, then reverse the closing before it reaches the button.
   await page.evaluate(()=>document.querySelector('.language-launch').click());await page.waitForTimeout(75);
   await page.evaluate(()=>document.querySelector('.language-close').click());await page.waitForTimeout(75);
   await page.evaluate(()=>document.querySelector('.language-launch').click());await page.waitForTimeout(600);
   assert.equal(await page.locator('.language-launch').getAttribute('aria-expanded'),'true');
   assert(await page.locator('.language-panel').evaluate(e=>e.matches(':popover-open')));
   await page.keyboard.press('Escape');await page.waitForTimeout(500);
   assert.equal(await page.locator('.language-panel a').first().evaluate(e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'),false,'Closed content is not exposed');
   await page.locator('.language-launch').click();await page.waitForTimeout(80);await page.setViewportSize({width:width+10,height:800});await page.waitForTimeout(500);
   assert.equal(await page.locator('.language-launch').getAttribute('aria-expanded'),'false');
   assert.deepEqual(errors,[]);await page.close();console.log('PASS circle-to-panel frames, interruption/reversal, hidden closed content and resize',width);
  }
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
