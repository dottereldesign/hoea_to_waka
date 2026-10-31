const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const Axe=require('@axe-core/playwright').default;
(async()=>{
 const server=require('./preview.cjs')(8908),browser=await chromium.launch({channel:'chrome'});
 fs.mkdirSync('tmp/anna-river',{recursive:true});
 try{
  for(const width of [1440,1100,768,760,390,320]){
   const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8908/about/');
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForFunction(()=>document.querySelector('#anna-story').classList.contains('is-enhanced'));
   assert.equal(await page.locator('#anna-story').getAttribute('data-timeline-variant'),'thread2','Ocean passage is the default');
   assert.equal(await page.locator('.anna-river').count(),1,'Default ocean passage prepares its waka route');
   await page.locator('[data-anna-study=thread]').click();
   await page.waitForFunction(()=>!!document.querySelector('.anna-river')?.dataset.stops);
   const svg=page.locator('.anna-river'),root=page.locator('#anna-story');
   const stops=await svg.evaluate(e=>JSON.parse(e.dataset.stops));
   const release=await svg.evaluate(e=>Number(e.dataset.release));
   const setY=async y=>{await page.evaluate(y=>new Promise(resolve=>{scrollTo({top:y,behavior:'instant'});dispatchEvent(new Event('scroll'));requestAnimationFrame(()=>requestAnimationFrame(resolve));}),y);};
   const settle=()=>page.waitForFunction(()=>{const e=document.querySelector('.anna-river');return Math.abs(+e.dataset.distance-Number(e.dataset.target))<.025&&document.querySelector('#anna-story').dataset.timelineState==='settled';});
   await settle();
   assert.equal(Number(await svg.getAttribute('data-distance')),72,'The boat waits at its launch');
   assert(release-await page.evaluate(()=>scrollY)>=40,'A deliberate scroll lead-in');
   assert.equal(await svg.locator('.river-banks>path:not(.river-pencil)').count(),2);
   assert.equal(await svg.locator('.river-kayak__cockpit,.river-paddle__blade,.river-kayak__head').count(),3,'A recognisable top-down kayak');
   assert(await svg.locator('path').evaluateAll(es=>es.every(e=>{const box=e.getBBox();return [box.x,box.y,box.width,box.height].every(Number.isFinite)&&!/(?:NaN|Infinity)/.test(e.getAttribute('d')||'');})));
   await page.evaluate(()=>{window.__riverSamples=[];window.__riverSampling=true;function sample(t){if(!window.__riverSampling)return;const e=document.querySelector('.anna-river');window.__riverSamples.push({t,d:+e.dataset.distance,a:+e.dataset.angle});requestAnimationFrame(sample);}requestAnimationFrame(sample);});
   await setY(stops[0].arrival+12);await settle();
   assert.equal(await svg.getAttribute('data-stop'),'1');
   const one=await svg.evaluate(e=>Number(e.dataset.distance));
   assert(Math.abs(one-stops[0].distance)<.025);
   const copy=root.locator('.anna-milestone__copy').first();
   assert.equal(await copy.evaluate(e=>+getComputedStyle(e).opacity),1);
   assert.equal(await root.locator('.river-node-hit').count(),1);
   await setY(stops[0].departure-8);await settle();
   assert(Math.abs((await svg.evaluate(e=>+e.dataset.distance))-one)<.025,'Scroll within a landing does not move the boat');
   const framesBefore=await root.getAttribute('data-timeline-frame');await page.waitForTimeout(300);
   assert.equal(await root.getAttribute('data-timeline-frame'),framesBefore,'No idle JS animation loop');
   await page.screenshot({path:`tmp/anna-river/landing-${width}.png`,style:'.site-header{visibility:hidden!important}'});
   for(const [i,stop]of stops.entries()){
    await setY(stop.arrival+12);await settle();
    assert.equal(await svg.getAttribute('data-stop'),String(i+1));
    const alignment=await page.evaluate(i=>{const boat=document.querySelector('.river-kayak'),node=document.querySelectorAll('.anna-node')[i],p=new DOMPoint(0,0).matrixTransform(boat.getScreenCTM()),b=node.getBoundingClientRect();return Math.hypot(p.x-b.left-b.width/2,p.y-b.top-b.height/2);},i);
    assert(alignment<1.5,'The kayak lands on its marker: '+alignment);
    assert.equal(await root.locator('.river-node-hit').count(),i+1);
    assert(await root.locator('.anna-milestone__copy').nth(i).evaluate(e=>+getComputedStyle(e).opacity===1));
   }
   await setY(stops[1].arrival+16);await settle();
   assert.equal(await svg.getAttribute('data-stop'),'2','Reverse travel returns to the same landing');
   assert.equal(await root.locator('.river-node-hit').count(),2,'Later chapters retract on reverse travel');
   const samples=await page.evaluate(()=>{window.__riverSampling=false;return window.__riverSamples;});
   assert(samples.some((x,i)=>i&&Math.abs(x.d-samples[i-1].d)>.05&&Math.abs(x.d-samples[i-1].d)<18),'Travel has intermediate positions');
   assert(samples.every((x,i)=>!i||Math.abs(x.a-samples[i-1].a)<12),'Heading has no sharp snaps');
   // The sampler can run before the animation callback; use the maximum 40 ms step bound.
   const jumps=samples.map((x,i)=>!i?0:Math.abs(x.d-samples[i-1].d)).filter(delta=>delta>49);assert.deepEqual(jumps,[],'No teleporting during rapid scroll seeks');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
   if([1440,390].includes(width)){
    await page.screenshot({path:`tmp/anna-river/stop-two-${width}.png`,style:'.site-header{visibility:hidden!important}'});
    const result=await new Axe({page}).include('#anna-story').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations,[]);
    await page.locator('[data-menu-toggle]').click();const frozen=await svg.getAttribute('data-distance');
    assert(!(await svg.evaluate(e=>e.classList.contains('river-is-active'))));await page.waitForTimeout(200);assert.equal(await svg.getAttribute('data-distance'),frozen);
    assert.equal(await svg.evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'No water animation runs behind the menu');
    await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.site-menu-panel').open);await settle();
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(120);
    assert(await root.locator('.anna-milestone__copy').evaluateAll(es=>es.every(e=>+getComputedStyle(e).opacity===1)));
    assert(await svg.evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length===0));
   }
   assert.deepEqual(errors,[]);console.log('PASS river geometry, scroll-only dwell, all five landings, smooth travel/heading, reverse and responsive layout',width);
   await context.close();
  }
  const context=await browser.newContext(),page=await context.newPage();await page.goto('http://127.0.0.1:8908/about/');await page.locator('[data-anna-study=thread]').click();await page.waitForFunction(()=>!!document.querySelector('.anna-river')?.dataset.stops);
  // Capture a real intermediate arrival: the node pulses before the copy settles.
  const first=await page.locator('.anna-river').evaluate(e=>JSON.parse(e.dataset.stops)[0]);
  await page.evaluate(y=>{window.__arrival=[];scrollTo({top:y,behavior:'instant'});dispatchEvent(new Event('scroll'));function sample(t){const node=document.querySelector('.anna-node'),copy=document.querySelector('.anna-milestone__copy');window.__arrival.push({t,hit:node.parentElement.classList.contains('river-node-hit'),opacity:+getComputedStyle(copy).opacity,transform:getComputedStyle(copy).transform,pulse:node.getAnimations().some(a=>a.playState==='running')});if(window.__arrival.length<160)requestAnimationFrame(sample);}requestAnimationFrame(sample);},first.arrival+20);
  await page.waitForTimeout(2400);const arrival=await page.evaluate(()=>window.__arrival);
  assert(arrival.some(x=>x.hit&&x.pulse),'A single landing pulse');assert(arrival.some(x=>x.hit&&x.opacity>0&&x.opacity<1&&x.transform!=='none'),'Copy slides and fades out from the landing');
  assert(arrival.filter(x=>!x.hit).every(x=>x.opacity===0),'No early chapter reveal');
  console.log('PASS arrival pulse and subsequent side reveal, menu suspension, reduced motion and accessibility');await context.close();
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
