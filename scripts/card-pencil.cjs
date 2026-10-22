const{chromium}=require('playwright');const assert=require('assert/strict');const fs=require('fs');const Axe=require('@axe-core/playwright').default;
(async()=>{const server=require('./preview.cjs')(8912),browser=await chromium.launch({channel:'chrome'});try{
 fs.mkdirSync('tmp/card-pencil',{recursive:true});const errors=[];
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8912/about/brand-guidelines/');await page.waitForLoadState('networkidle');const card=page.locator('[data-card-study]');
  await card.evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight*.3,behavior:'instant'}));
  await page.waitForTimeout(500);
  assert.equal(await card.locator('.bc-art image').count(),0,'Artwork is drawn vector strokes');
  assert.equal(await card.locator('.bc-art .bc-pencil-letter').count(),38,'All original brand shapes retained');
  assert.equal(await card.locator('[data-bc-pencil]').count(),129,'Contour, retracing and shading passes present');
  assert(await card.locator('[data-pencil-pass=shade]').evaluateAll(es=>es.every(e=>(e.getAttribute('d').match(/M/g)||[]).length===1)),'Hatching is one continuous pencil journey, so strokes draw consecutively');
  const state=()=>card.evaluate(e=>[...e.querySelectorAll('[data-bc-pencil]')].map(p=>({pass:p.dataset.pencilPass,offset:parseFloat(getComputedStyle(p).strokeDashoffset),opacity:Number(getComputedStyle(p).opacity)})));
  const mid=await state();assert(mid.some(p=>p.offset>0&&p.offset<1),'Contours draw gradually');
  await card.evaluate(e=>{window.__pencilAnimations=e.getAnimations({subtree:true});window.__pencilAnimations.forEach(a=>a.pause());});
  for(const time of [500,1000,1500,2300]){
   await page.evaluate(t=>window.__pencilAnimations.forEach(a=>a.currentTime=t),time);
   if(time===1000){const paths=await state();assert(paths.some(p=>p.pass==='shade'&&p.offset>0&&p.offset<1),'Graphite shading draws as strokes');}
   await card.screenshot({path:`tmp/card-pencil/${width}-${time}.png`,style:'.site-header,.brand-jump{visibility:hidden!important}'});
  }
  assert((await state()).every(p=>p.offset===0&&p.opacity>0),'Every pencil stroke finishes');
  const bounds=await card.locator('.bc-art').evaluate(e=>{const r=e.getBBox();return{x:r.x,y:r.y,right:r.x+r.width,bottom:r.y+r.height}});
  assert(bounds.x>=150&&bounds.right<=950&&bounds.y>=160&&bounds.bottom<=625,'Brand artwork stays within safe area');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Responsive page fits');
  const result=await new Axe({page}).include('[data-card-study]').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations,[]);
  await context.close();console.log('PASS vector artwork, gradual contour and hatch drawing, final strokes, safe area and accessibility',width);
 }
 const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.goto('http://127.0.0.1:8912/about/brand-guidelines/');assert.equal(await reduced.locator('[data-card-study]').evaluate(e=>e.getAnimations({subtree:true}).length),0);
 const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8912/about/brand-guidelines/');assert.equal(await plain.locator('[data-bc-pencil]').count(),129);assert.equal(await plain.locator('.bc-graphite-outline').first().evaluate(e=>getComputedStyle(e).opacity),'0.85');
 assert.deepEqual(errors,[]);console.log('PASS reduced-motion and no-JavaScript artwork');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
