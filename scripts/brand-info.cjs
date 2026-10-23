const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),Axe=require('@axe-core/playwright').default;
const style='.site-header,.site-header *,.brand-jump,.brand-jump *,.skip-link{visibility:hidden!important}';
(async()=>{const s=require('./preview.cjs')(8947),b=await chromium.launch({channel:'chrome'});try{fs.mkdirSync('tmp/brand-info',{recursive:true});for(const width of[1440,900,390,320]){const c=await b.newContext({viewport:{width,height:900},reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8947/about/brand-guidelines/');const grid=p.locator('.site-preview-brand-overview-grid'),triggers=grid.locator('[data-brand-info]');assert.equal(await triggers.count(),4);assert.equal(await grid.locator('.brand-guide-help:visible').count(),0);for(let i=0;i<4;i++){const trigger=triggers.nth(i),id=await trigger.getAttribute('data-brand-info'),panel=p.locator('#'+id);await trigger.scrollIntoViewIfNeeded();const geometry=await grid.boundingBox();await trigger.click();assert.equal(await trigger.getAttribute('aria-expanded'),'true');assert(await panel.evaluate(e=>e.matches(':popover-open')));assert(await panel.locator('.brand-guide-help').isVisible());const bounds=await panel.boundingBox();assert(bounds.x>=15&&bounds.x+bounds.width<=width-15);assert(bounds.y>=15&&bounds.y+bounds.height<=901-15);assert.deepEqual(await grid.boundingBox(),geometry,'Opening a note never shifts the grid');assert(await panel.locator('.brand-info-content').evaluate(e=>e.scrollWidth===e.clientWidth));for(const theme of['light','dark']){await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);if([1440,390].includes(width)&&[0,3].includes(i)){await p.screenshot({path:`tmp/brand-info/open-${i}-${width}-${theme}.png`,style});const result=await new Axe({page:p}).include('.site-preview-brand-overview-grid').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations,[]);}}await p.keyboard.press('Escape');assert.equal(await trigger.getAttribute('aria-expanded'),'false');assert.equal(await panel.evaluate(e=>e.matches(':popover-open')),false);assert(await trigger.evaluate(e=>e===document.activeElement));const note=await panel.locator('.brand-guide-help').textContent();for(const name of['brand-context.md','figma-context.md'])assert(fs.readFileSync('about/brand-guidelines/'+name,'utf8').includes(note),'Guidance is retained in AI context');}
for(const kind of['vision','mission']){await grid.locator(`[data-copy-statement=brand-${kind}-statement]`).click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),(await grid.locator(`#brand-${kind}-statement`).textContent()).trim());}
await triggers.first().focus();await p.keyboard.press('Enter');assert(await p.locator('#brand-info-name').evaluate(e=>e.matches(':popover-open')));await p.keyboard.press('Shift+Tab');assert.equal(await p.locator('#brand-info-name').evaluate(e=>e.matches(':popover-open')),false);await p.keyboard.press('Enter');await p.locator('#brand-info-name .brand-info-close').click();await triggers.first().click();await triggers.last().evaluate(e=>e.click());assert.equal(await p.locator('.brand-info-panel:popover-open').count(),1);await p.locator('#brand-overview h2').click();assert.equal(await p.locator('.brand-info-panel:popover-open').count(),0);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);await grid.screenshot({path:`tmp/brand-info/closed-${width}.png`,style});await c.close();console.log('PASS four mapped notes, bounds, keyboard/outside/close, both themes, no layout shift, copy and AI context',width);}
const c=await b.newContext({viewport:{width:1440,height:900}}),p=await c.newPage();
await p.goto('http://127.0.0.1:8947/about/brand-guidelines/');
const trigger=p.locator('[data-brand-info]').first(),panel=p.locator('#brand-info-name');
await trigger.scrollIntoViewIfNeeded();await trigger.hover();await p.waitForTimeout(240);
assert.equal(await panel.evaluate(e=>e.matches(':popover-open')),false);
assert.equal(await trigger.evaluate(e=>getComputedStyle(e,'::after').opacity),'1');
await p.evaluate(()=>{window.__brandInfoSnapshot=e=>{
  const r=e.getBoundingClientRect(),clip=getComputedStyle(e).clipPath,n=clip.match(/[-+]?(?:\d*\.?\d+)(?:e[-+]?\d+)?px/gi).map(parseFloat),v=n.slice(0,-1);
  const a=v.length===1?[v[0],v[0],v[0],v[0]]:v.length===2?[v[0],v[1],v[0],v[1]]:v;
  return{width:r.width-a[1]-a[3],height:r.height-a[0]-a[2],x:r.left+a[3],y:r.top+a[0],opacity:+getComputedStyle(e.querySelector('.brand-info-content')).opacity,clip};
}});
const origin=await trigger.boundingBox();
const frames=await trigger.evaluate(e=>new Promise(resolve=>{
  const panel=document.getElementById(e.dataset.brandInfo),start=performance.now();e.click();
  const values=[{ms:0,...window.__brandInfoSnapshot(panel)}];
  function frame(){const ms=performance.now()-start;values.push({ms,...window.__brandInfoSnapshot(panel)});if(ms<850)requestAnimationFrame(frame);else resolve(values)}
  requestAnimationFrame(frame);
}));
fs.writeFileSync('tmp/brand-info/motion-frames.json',JSON.stringify(frames,null,2));
const initial=frames[0],early=frames.find(f=>f.ms>=70&&f.width>40&&f.opacity===0),middle=frames.find(f=>f.opacity>.05&&f.opacity<.95),end=frames.at(-1);
assert(Math.abs(initial.width-36)<1&&Math.abs(initial.height-36)<1,'The first rendered surface is the exact 36px circle');
assert(Math.abs(initial.x-origin.x)<1&&Math.abs(initial.y-origin.y)<1,'Circle starts exactly on the clicked icon');
assert(early&&middle&&middle.width>early.width,'The surface grows before the note reveals');
assert(frames.length>8);assert(frames.every((f,i)=>!i||f.width>=frames[i-1].width-.5),'Opening edges interpolate continuously without reversing or snapping');
assert.equal(end.width,320);assert.equal(end.opacity,1);
fs.writeFileSync('tmp/brand-info/motion-frames.json',JSON.stringify(frames,null,2));
await p.keyboard.press('Escape');await p.waitForTimeout(720);
// Seek the same CSS transitions only for still captures; the live run above remains unmodified.
await trigger.evaluate(e=>new Promise(resolve=>{e.click();requestAnimationFrame(()=>requestAnimationFrame(()=>{for(const a of document.getElementById(e.dataset.brandInfo).getAnimations({subtree:true})){a.pause();a.currentTime=110}resolve()}))}));
await p.screenshot({path:'tmp/brand-info/morph-early.png',style});
await panel.evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>a.currentTime=310));
await p.screenshot({path:'tmp/brand-info/morph-middle.png',style});
await panel.evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>a.play()));await p.waitForTimeout(760);
await p.screenshot({path:'tmp/brand-info/morph-open.png',style});
await p.keyboard.press('Escape');await p.waitForTimeout(110);
const closing=await panel.evaluate(e=>window.__brandInfoSnapshot(e));assert(closing.width>36&&closing.width<320);
await trigger.evaluate(e=>e.click());await p.waitForTimeout(760);
assert(await panel.evaluate(e=>e.matches(':popover-open')),'Reopening cancels an unfinished close');
await p.locator('#brand-info-name .brand-info-close').click();await p.waitForTimeout(720);
assert.equal(await panel.evaluate(e=>e.matches(':popover-open')),false);
console.log('PASS hover instruction, exact circle origin, continuous growing/shrinking clip, delayed text and interrupted close');await c.close();

const compact=await b.newPage({viewport:{width:320,height:280},reducedMotion:'reduce'});await compact.goto('http://127.0.0.1:8947/about/brand-guidelines/');await compact.addStyleTag({content:'.brand-guidelines .brand-info-panel[popover] .brand-info-content .brand-guide-help{font-size:24px!important}'});await compact.locator('[data-brand-info]').first().click();const shortPanel=compact.locator('#brand-info-name'),shortBody=shortPanel.locator('.brand-info-content');const box=await shortPanel.boundingBox();assert(box.y>=16&&box.y+box.height<=264);assert.equal(await shortBody.getAttribute('tabindex'),'0');await compact.keyboard.press('Tab');assert(await shortBody.evaluate(e=>e===document.activeElement));await compact.keyboard.press('End');await compact.waitForTimeout(200);assert(await shortBody.evaluate(e=>e.scrollTop>0));await compact.keyboard.press('Escape');console.log('PASS short viewport placement and keyboard scrolling without visible scrollbars');await compact.close();
const plain=await b.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8947/about/brand-guidelines/');assert.equal(await plain.locator('.site-preview-brand-overview-grid .brand-guide-help:visible').count(),4);assert.equal(await plain.locator('.brand-info-trigger:visible').count(),0);console.log('PASS all four notes remain readable without JavaScript');}finally{await b.close();s.close()}})().catch(e=>{console.error(e);process.exitCode=1});
