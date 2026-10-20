const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const server=require('./preview.cjs')(8798),browser=await chromium.launch({channel:'chrome',headless:true});try{
 fs.mkdirSync('tmp/statement-gap',{recursive:true});
 const page=await browser.newPage({reducedMotion:'no-preference'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of[1689,1440,900,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:8798/hoea_to_waka/');await page.waitForLoadState('networkidle');
  const section=page.locator('[data-home-statement]'),heading=section.locator('h2'),icons=section.locator('.statement-icon');assert.equal(await icons.count(),4);
  assert(await icons.evaluateAll(es=>es.every(e=>e.getBoundingClientRect().width===0&&getComputedStyle(e).marginLeft==='0px'&&getComputedStyle(e.querySelector('svg')).opacity==='0')),'no reserved gap or visible icon before entrance '+width);
  if([1689,390].includes(width))await page.screenshot({path:`tmp/statement-gap/closed-${width}.png`});
  const lines=await heading.locator('.statement-icon-line').allTextContents(),initial=await heading.boundingBox();assert(lines.length>1);
  await page.evaluate(()=>{window.__iconFrames=[];window.__sampleIcons=true;function sample(t){if(!window.__sampleIcons)return;window.__iconFrames.push({t,icons:[...document.querySelectorAll('.statement-icon')].map(e=>({width:e.getBoundingClientRect().width,reveal:Number(e.style.getPropertyValue('--icon-reveal'))}))});requestAnimationFrame(sample)}requestAnimationFrame(sample)});
  await heading.evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight*.4,behavior:'instant'}));const scroll=await page.evaluate(()=>scrollY);
  await page.waitForFunction(()=>[...document.querySelectorAll('.statement-icon')].some(e=>e.getBoundingClientRect().width>1));
  if(width===1689){await page.waitForTimeout(100);await section.screenshot({path:'tmp/statement-gap/mid-desktop.png',style:'.site-header{visibility:hidden!important}'});}
  await page.waitForFunction(()=>[...document.querySelectorAll('.statement-icon')].every(e=>Number(e.style.getPropertyValue('--icon-reveal'))===1));
  const frames=await page.evaluate(()=>{window.__sampleIcons=false;return window.__iconFrames});
  for(let i=0;i<4;i++){const final=await icons.nth(i).evaluate(e=>e.getBoundingClientRect().width);assert(frames.some(f=>f.icons[i].width>0&&f.icons[i].width<final),'gap opens gradually '+i);assert(Math.max(...frames.map(f=>f.icons[i].reveal))>1.005,'gentle spring overshoot '+i);}
  assert.equal((await heading.boundingBox()).height,initial.height,'no jumping between lines');assert.deepEqual(await heading.locator('.statement-icon-line').allTextContents(),lines);
  assert.equal(await page.evaluate(()=>scrollY),scroll,'animation completes without scrolling');
  assert.deepEqual(await icons.locator('svg').evaluateAll(es=>es.map(e=>e.dataset.icon)),['sprout','kiwi','workplace','support']);
  if([1689,390].includes(width))await section.screenshot({path:`tmp/statement-gap/open-${width}.png`,style:'.site-header{visibility:hidden!important}'});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);assert(await icons.evaluateAll(es=>es.every(e=>getComputedStyle(e.querySelector('svg')).opacity==='1')),'no replay');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no overflow '+width);console.log('Gap opening and spring passed '+width);
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForLoadState('networkidle');assert(await page.locator('.statement-icon').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().width>0&&getComputedStyle(e.querySelector('svg')).opacity==='1')));
 const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8798/hoea_to_waka/');assert.equal(await plain.locator('.statement-icon svg').count(),4);assert(await plain.locator('.statement-icon').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().width>0)));
 assert.deepEqual(errors,[]);console.log('PASS: zero gaps before entrance, fluid width and icon spring, stable line groups, once-only autonomous animation, responsive, reduced motion and no-JS');
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exit(1)});
