const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),serve=require('./preview.cjs');
(async()=>{const server=serve(8798),browser=await chromium.launch({channel:'chrome',headless:true});try{
  fs.mkdirSync('tmp/statement-icons',{recursive:true});
  const page=await browser.newPage({reducedMotion:'no-preference'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const selector='[data-component="home:2:statement"]';
  const values=()=>page.locator('.statement-icon').evaluateAll(els=>els.map(el=>({width:el.getBoundingClientRect().width,reveal:Number(el.style.getPropertyValue('--icon-reveal')),opacity:getComputedStyle(el).opacity})));
  async function position(top){await page.locator('.statement-icon-copy').evaluate((el,top)=>scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*top,behavior:'instant'}),top);}
  for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:8798/hoea_to_waka/');await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
    const section=page.locator(selector),heading=section.locator('.statement-icon-copy');
    await page.waitForFunction(()=>document.querySelector('[data-home-statement]')?.classList.contains('statement-icons-ready'));
    assert.equal(await page.locator('.statement-icon').count(),4);assert.deepEqual(await page.locator('.statement-icon svg').evaluateAll(es=>es.map(e=>e.dataset.icon)),['sprout','kiwi','workplace','support']);assert(await page.locator('.statement-icon svg').evaluateAll(es=>es.every(e=>e.getAttribute('fill')==='currentColor'&&!e.hasAttribute('stroke'))),'supplied filled SVG artwork');assert.equal(await section.locator('.ds-kicker').textContent(),'About Hoea tō Waka');assert.equal(await page.locator('[data-statement-icon="leaders"]').count(),0);assert.equal(await page.locator('[data-icon="kiwi"]').count(),1);
    assert.equal(await heading.getAttribute('aria-label'),'Resilience training set in Aotearoa’s unique cultural context, made practical for workplaces, leaders, and support professionals.');
    assert.equal(await heading.locator('[aria-hidden="true"]').count(),5);
    await position(.76);await page.waitForTimeout(250);
    assert((await values()).every(i=>i.reveal===0&&i.width===0&&i.opacity==='0'),'completely hidden before trigger '+width);
    const lineCount=await heading.locator('.statement-icon-line').count(),height=await heading.evaluate(el=>el.getBoundingClientRect().height);
    if(width===1440)await page.screenshot({path:'tmp/statement-icons/hidden-before-trigger.png'});
    await page.evaluate(()=>{window.__iconSamples=[];window.__sampleIcons=true;function sample(){if(!window.__sampleIcons)return;window.__iconSamples.push([...document.querySelectorAll('.statement-icon')].map(el=>Number(el.style.getPropertyValue('--icon-reveal'))));requestAnimationFrame(sample)}requestAnimationFrame(sample)});
    await position(.5);const scroll=await page.evaluate(()=>scrollY);
    await page.waitForFunction(selector=>document.querySelector(selector).dataset.statementRevealed==='true',selector);
    await page.waitForFunction(()=>[...document.querySelectorAll('.statement-icon')].every(el=>el.style.getPropertyValue('--icon-reveal')==='1'));
    assert.equal(await page.evaluate(()=>scrollY),scroll,'finishes while scroll is stationary');
    const samples=await page.evaluate(()=>{window.__sampleIcons=false;return window.__iconSamples});
    assert(samples.some(v=>v[0]>0&&v[0]<1),'intermediate animation frames');
    assert(samples.some(v=>v.some(n=>n>1.005)),'gentle spring overshoot');
    assert(samples.some(v=>v[0]>.1&&v.at(-1)===0),'short stagger');
    assert.equal(await heading.locator('.statement-icon-line').count(),lineCount,'stable line count');assert.equal(await heading.evaluate(el=>el.getBoundingClientRect().height),height,'stable section height');
    const bounds=await heading.locator('.statement-icon-line').evaluateAll(els=>els.map(el=>{const range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect();return{left:r.left,right:r.right}}));assert(bounds.every(r=>r.left>=-1&&r.right<=width+1),'text fits '+width);
    await section.screenshot({path:`tmp/statement-icons/after-${width}.png`});
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);assert((await values()).every(i=>i.reveal===1),'scroll back does not reverse');
    await position(.5);await page.waitForTimeout(100);assert((await values()).every(i=>i.reveal===1),'does not replay on return');
  }
  await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(150);assert((await values()).every(i=>i.reveal===1),'resize preserves finished reveal');
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForLoadState('networkidle');assert((await values()).every(i=>i.reveal===1),'reduced motion immediately visible');
  assert(await page.locator('footer').getByRole('link',{name:'Brand guidelines',exact:true}).count());
  // Hold the enhancement bundle on a hard refresh to inspect the actual first HTML paint.
  const refresh=await browser.newPage({reducedMotion:'no-preference'});
  let release;
  const gate=new Promise(resolve=>{release=resolve});
  await refresh.route('**/assets/site-layouts.js?*',async route=>{await gate;await route.continue()});
  const loading=refresh.goto('http://127.0.0.1:8798/hoea_to_waka/',{waitUntil:'load'});
  await refresh.waitForSelector('[data-home-statement]',{state:'attached'});
  assert.equal(await refresh.locator('[data-scroll-statement],.home-statement-word').count(),0,'retired markup absent from initial HTML');
  assert.equal(await refresh.locator('[data-home-statement]').evaluate(el=>getComputedStyle(el).visibility),'hidden','no obsolete first paint while bundle loads');
  assert.equal(await refresh.locator('[data-home-statement] .ds-kicker').textContent(),'About Hoea tō Waka');
  release();await loading;await refresh.waitForFunction(()=>document.querySelector('[data-home-statement]').classList.contains('statement-icons-ready'));
  assert.equal(await refresh.locator('[data-home-statement]').evaluate(el=>getComputedStyle(el).visibility),'visible');
  await refresh.close();
  const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8798/hoea_to_waka/');assert(await plain.locator('[data-home-statement] h2').isVisible(),'current readable fallback without JavaScript');await plain.close();
  assert.deepEqual(errors,[]);console.log('PASS: hidden until entrance, autonomous spring with overshoot/stagger, no scroll scrubbing/replay, kiwi icon, stable lines, 320/390/768/1440px, resize, reduced motion and accessible sentence.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
