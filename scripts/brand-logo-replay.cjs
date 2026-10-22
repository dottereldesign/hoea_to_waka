const {chromium}=require('playwright');
const assert=require('assert/strict');
const fs=require('fs');
(async()=>{
  const server=require('./preview.cjs')(8891),browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    fs.mkdirSync('tmp/brand-logo-replay',{recursive:true});
    const page=await browser.newPage({reducedMotion:'no-preference'}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    for(const width of [1440,390]){
      await page.setViewportSize({width,height:400});
      for(const [id,trigger] of [['cover','.site-preview-brand-hero-logo-study'],['logo','.site-preview-logo-anatomy-layout']]){
        await page.goto('http://127.0.0.1:8891/hoea_to_waka/about/brand-guidelines/');
        await page.waitForLoadState('networkidle');
        const section=page.locator('#'+id);
        const state=()=>section.evaluate((e,id)=>{const a=e.getAnimations({subtree:true}).filter(a=>a.animationName?.startsWith('preview'));return{times:a.map(a=>a.currentTime),duration:Math.max(...a.map(a=>a.effect.getComputedTiming().endTime)),opacity:getComputedStyle(e.querySelector(id==='cover'?'.site-preview-brand-hero-logo':'.site-preview-logo-anatomy-logo')).opacity};},id);
        // Use the same section/diagram trigger as the production code.
        const scroll=ratio=>page.evaluate(({id,ratio})=>{const e=document.querySelector(id==='cover'?'#cover':'#logo .site-preview-logo-anatomy-layout');scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight*ratio,behavior:'instant'});},{id,ratio});
        await scroll(.35);
        await page.waitForTimeout(id==='cover'?450:1000);
        const forward=await state();
        assert(forward.times[0]>(id==='cover'?250:500),'Timeline advances on entry');
        await scroll(id==='cover'?1.05:.8);
        await page.waitForTimeout(250);
        const reversing=await state();
        assert(reversing.times[0]<forward.times[0],'Mid-sequence reverse continues from current position');
        await page.screenshot({path:`tmp/brand-logo-replay/reverse-${id}-${width}.png`,style:'.site-header,.skip-link{visibility:hidden!important}'});
        await page.waitForFunction(id=>document.querySelector('#'+id).getAnimations({subtree:true}).filter(a=>a.animationName?.startsWith('preview')).every(a=>a.currentTime===0),id);
        await scroll(.35);
        await page.waitForFunction(id=>{const a=document.querySelector('#'+id).getAnimations({subtree:true}).filter(a=>a.animationName?.startsWith('preview'));return a.every(a=>a.currentTime>=a.effect.getComputedTiming().endTime);},id);
        assert.equal((await state()).opacity,'1');
        await section.locator(trigger).screenshot({path:`tmp/brand-logo-replay/complete-${id}-${width}.png`,style:'.site-header,.skip-link{visibility:hidden!important}'});
        await scroll(id==='cover'?1.05:.8);
        await page.waitForTimeout(350);
        const reverse=await state();
        assert(reverse.times[0]<reverse.duration-100,'Completed sequence reverses');
        assert(reverse.times[0]>0,'Reverse is gradual');
        await scroll(.35);
        await page.waitForFunction(id=>{const a=document.querySelector('#'+id).getAnimations({subtree:true}).filter(a=>a.animationName?.startsWith('preview'));return a.every(a=>a.currentTime>=a.effect.getComputedTiming().endTime);},id);
        if(id==='cover')assert.equal(await section.locator('.site-preview-brand-hero-cta').evaluate(e=>getComputedStyle(e).pointerEvents),'auto');
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        console.log('PASS reversible drawing, interrupted reversal, replay and layout',id,width);
      }
    }
    assert.deepEqual(errors,[]);
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
