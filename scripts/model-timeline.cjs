const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),serve=require('./preview.cjs');
(async()=>{const server=serve(8796),browser=await chromium.launch({channel:'chrome',headless:true});try{
  fs.mkdirSync('tmp/model-timeline',{recursive:true});const errors=[];
  const page=await browser.newPage({reducedMotion:'no-preference'});page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:8796/hoea_to_waka/');await page.waitForLoadState('networkidle');
    const section=page.locator('[data-component="home:4:features"]'),path=section.locator('.model-timeline');assert.equal(await path.count(),1);
    await path.evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-innerHeight*.9,behavior:'instant'}));await page.waitForTimeout(150);
    assert.equal(await path.getAttribute('data-timeline-started'),null,'no early trigger');
    assert(await path.locator('article>:is(i,.ds-number,h3,p)').evaluateAll(els=>els.every(el=>getComputedStyle(el).opacity==='0')),'initial hidden content');
    const height=await path.evaluate(el=>el.getBoundingClientRect().height);
    await page.evaluate(()=>{window.__timelineFrames=[];window.__recordTimeline=true;function sample(t){if(!window.__recordTimeline)return;window.__timelineFrames.push({t,items:[...document.querySelectorAll('.model-timeline article')].map(el=>({icon:Number(getComputedStyle(el.querySelector('i')).opacity),number:Number(getComputedStyle(el.querySelector('.ds-number')).opacity),heading:Number(getComputedStyle(el.querySelector('h3')).opacity),text:Number(getComputedStyle(el.querySelector('p')).opacity),line:Number(el.style.getPropertyValue('--timeline-line')||0)}))});requestAnimationFrame(sample)}requestAnimationFrame(sample)});
    await path.evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-innerHeight*.45,behavior:'instant'}));const scroll=await page.evaluate(()=>scrollY);
    await page.waitForFunction(()=>document.querySelector('.model-timeline').dataset.timelineStarted==='true');
    if(width===1440){await page.waitForTimeout(950);await page.screenshot({path:'tmp/model-timeline/mid-animation.png',style:'.site-header,.skip-link{visibility:hidden!important}'});}
    await page.waitForFunction(()=>document.querySelector('.model-timeline').classList.contains('is-timeline-complete'));
    const frames=await page.evaluate(()=>{window.__recordTimeline=false;return window.__timelineFrames});
    const first=(i,key)=>frames.find(f=>f.items[i][key]>.02)?.t;
    for(let i=0;i<3;i++){
      assert(first(i,'icon')<first(i,'number'),'icon before number '+i);
      assert(first(i,'number')<first(i,'heading'),'number before heading '+i);
      assert(first(i,'heading')<first(i,'text'),'heading before paragraph '+i);
      assert(first(i,'text')<first(i,'line'),'copy before connector '+i);
      if(i<2){assert(first(i,'line')<first(i+1,'icon'),'connector precedes next icon');const atNext=frames.find(f=>f.items[i+1].icon>.02);assert(atNext.items[i].line>.96,'line reaches next icon');}
    }
    assert.equal(await page.evaluate(()=>scrollY),scroll,'finishes without scrolling');assert.equal(await path.evaluate(el=>el.getBoundingClientRect().height),height,'no layout jump');
    assert(await path.locator('article>:is(i,.ds-number,h3,p)').evaluateAll(els=>els.every(el=>getComputedStyle(el).opacity==='1')),'all content visible');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow '+width);
    await section.screenshot({path:`tmp/model-timeline/after-${width}.png`,style:'.site-header,.skip-link{visibility:hidden!important}'});
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);assert(await path.evaluate(el=>el.classList.contains('is-timeline-complete')),'no reverse');
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForLoadState('networkidle');assert.equal(await page.locator('.model-timeline').count(),0);assert(await page.locator('.ds-path-line article').evaluateAll(els=>els.every(el=>getComputedStyle(el).opacity==='1')),'reduced motion visible');
  assert.deepEqual(errors,[]);console.log('PASS: actual icon/number/heading/paragraph/line ordering, line reaches next icon, one-time autonomous reveal, stable layout, responsive widths and reduced motion.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
