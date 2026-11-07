const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 try {
  for(const [width,path,style] of [[390,'',1],[768,'about/',2],[1100,'',3],[1440,'',4],[1920,'about/',5]]){
   const context=await browser.newContext({viewport:{width,height:900}});
   const page=await context.newPage();
   await page.goto('http://127.0.0.1:8766/hoea_to_waka/'+path);
   await page.locator('button[data-notice-style="'+style+'"]').click();
   await page.waitForTimeout(1400);
   for(const duration of [180,700]){
    await page.evaluate(()=>scrollTo({top:180,behavior:'instant'}));
    await page.waitForTimeout(600);
    const samples=await page.evaluate(async duration=>{
     const header=document.querySelector('[data-morph-header]');
     const brand=header.querySelector('.site-brand-name');
     const bar=header.querySelector('.site-header-bar');
     const glass=header.querySelector('.site-header-glass');
     const symbol=header.querySelector('.site-brand-symbol');
     const notice=document.querySelector('[data-book-notice]');
     const ids=new Map();let nextId=0;const frames=[];
     const start=performance.now();
     while(performance.now()-start<duration+650){
      const elapsed=performance.now()-start;
      scrollTo({top:Math.max(0,180*(1-elapsed/duration)),behavior:'instant'});
      await new Promise(requestAnimationFrame);
      const rect=brand.getBoundingClientRect();
      const animations=symbol.getAnimations().filter(a=>a.effect.getKeyframes().some(f=>f.transform));
      animations.forEach(a=>{if(!ids.has(a))ids.set(a,++nextId)});
      frames.push({elapsed,scroll:scrollY,notice:notice.getBoundingClientRect().bottom,brandTop:rect.top,brandBottom:rect.bottom,
       ink:getComputedStyle(bar).color,brandInk:getComputedStyle(brand).color,
       links:[...header.querySelectorAll('.site-nav-link,.site-nav-parent-link')].map(e=>getComputedStyle(e).color),
       glass:Number(getComputedStyle(glass).opacity),animations:animations.map(a=>ids.get(a)),pill:header.classList.contains('is-scrolled')});
     }
     return frames;
    },duration);
    fs.writeFileSync('tmp/header-regression-'+width+'-'+duration+'.json',JSON.stringify(samples,null,2));
    assert(samples.every(f=>f.brandInk===f.ink),'Delayed logo colour '+width);
    if(width>=1100){
     assert(samples.every(f=>f.links.every(c=>c===f.ink)),'Delayed navigation colour '+width);
     const ids=new Set(samples.flatMap(f=>f.animations));
     assert.equal(ids.size,1,'Alert restarted the shape animation '+width);
    }
    assert(!samples.at(-1).pill);
    assert(samples.at(-1).brandTop>=samples.at(-1).notice,'Logo occluded by alert');
    console.log('PASS colour synchronisation, no morph restart, visible final logo: '+width+' / '+duration+'ms / style '+style);
   }
   await context.close();
  }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
