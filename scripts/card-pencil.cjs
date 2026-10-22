const{chromium}=require('playwright');const assert=require('assert/strict');const fs=require('fs');const Axe=require('@axe-core/playwright').default;
(async()=>{const server=require('./preview.cjs')(8912),browser=await chromium.launch({channel:'chrome'});try{
 fs.mkdirSync('tmp/card-sides',{recursive:true});const errors=[];
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8912/about/brand-guidelines/');await page.waitForLoadState('networkidle');assert.equal(await page.locator('[data-card-study]').count(),2);
  assert.equal(await page.locator('.brand-card-study__heading,.bc-sketch-stroke').count(),0,'No outer heading or stray logo underline');
  const ids=await page.locator('[data-card-study] [id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(ids.length,new Set(ids).size,'Both drawings have unique SVG references');
  const waitReset=side=>page.waitForFunction(side=>document.querySelector(`[data-card-side=${side}]`).getAnimations({subtree:true}).every(a=>a.currentTime===0),side);
  const waitComplete=side=>page.waitForFunction(side=>document.querySelector(`[data-card-side=${side}]`).getAnimations({subtree:true}).every(a=>a.currentTime>=a.effect.getComputedTiming().endTime),side);
  for(const side of['front','back']){
   const card=page.locator(`[data-card-side=${side}]`),scroll=ratio=>card.evaluate((e,ratio)=>scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight*ratio,behavior:'instant'}),ratio);
   await scroll(.98);await waitReset(side);await scroll(.3);await page.waitForTimeout(700);
   assert.equal(await card.evaluate(e=>getComputedStyle(e).borderWidth),'0px','Outer frame removed');assert.equal(await card.evaluate(e=>getComputedStyle(e).borderRadius),'0px');
   assert.equal(await card.locator('.bc-trim,.bc-safe,.bc-crop').count(),3,'Construction guides remain');
   assert.equal(await card.locator('[data-bc-pencil]').count(),side==='front'?129:54);
   assert(await card.locator('[data-pencil-pass=shade]').evaluateAll(es=>es.every(e=>(e.getAttribute('d').match(/M/g)||[]).length===1)),'Pencil shading follows continuous strokes');
   const state=()=>card.evaluate(e=>[...e.querySelectorAll('[data-bc-pencil]')].map(p=>({pass:p.dataset.pencilPass,offset:parseFloat(getComputedStyle(p).strokeDashoffset),opacity:Number(getComputedStyle(p).opacity)})));
   assert((await state()).some(p=>p.offset>0&&p.offset<1),'Contours draw gradually');
   await card.evaluate(e=>{window.__pencilAnimations=e.getAnimations({subtree:true});window.__pencilAnimations.forEach(a=>a.pause());});
   for(const time of [700,1200,2300]){await page.evaluate(t=>window.__pencilAnimations.forEach(a=>a.currentTime=t),time);if(time===1200)assert((await state()).some(p=>p.pass==='shade'&&p.offset>0&&p.offset<1));await card.screenshot({path:`tmp/card-sides/${side}-${width}-${time}.png`,style:'.site-header,.brand-jump{visibility:hidden!important}'});}
   assert((await state()).every(p=>p.offset===0&&p.opacity>0),'All pencil strokes finish');
   const bounds=await card.locator('.bc-art').evaluate(e=>{const boxes=[...e.querySelectorAll('.bc-graphite-outline,rect')].map(p=>p.getBBox());return{x:Math.min(...boxes.map(r=>r.x)),y:Math.min(...boxes.map(r=>r.y)),right:Math.max(...boxes.map(r=>r.x+r.width)),bottom:Math.max(...boxes.map(r=>r.y+r.height))}});assert(bounds.x>=150&&bounds.right<=950&&bounds.y>=160&&bounds.bottom<=625,'Artwork stays inside safe area');
   if(side==='front')assert.equal(await card.locator('.bc-art .bc-pencil-letter').count(),38,'Original brand artwork retained');
   if(side==='back'){
    const text=await card.locator('[data-card-text]').evaluateAll(es=>es.map(e=>e.dataset.cardText));const expected=await page.locator('.preview-business-card-back').evaluate(e=>[e.querySelector('.preview-business-card-name').textContent.trim(),e.querySelector('.preview-business-card-role').textContent.trim().toUpperCase(),...[...e.querySelectorAll('.preview-business-card-details p')].map(p=>p.textContent.replace(p.querySelector('strong').textContent,'').trim()),...[...e.querySelectorAll('.preview-business-card-footer span')].map(s=>s.textContent.trim())]);assert(expected.every(t=>text.includes(t)),'Back uses the real name, role, contact details and services');assert((await card.locator('desc').textContent()).includes('Ōtautahi Christchurch'));
   }
   await scroll(.98);await page.waitForTimeout(300);assert.equal(await card.getAttribute('data-card-state'),'reversing');assert(await card.evaluate(e=>e.getAnimations({subtree:true}).some(a=>a.currentTime>0&&a.currentTime<2300)),'Reverse is gradual');await waitReset(side);await scroll(.3);await waitComplete(side);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const result=await new Axe({page}).include(`[data-card-side=${side}]`).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations,[]);
   console.log('PASS frameless construction, pencil drawing/reverse/replay, safe area and accessibility',side,width);
  }
  await context.close();
 }
 const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.goto('http://127.0.0.1:8912/about/brand-guidelines/');assert(await reduced.locator('[data-card-study]').evaluateAll(es=>es.every(e=>e.getAnimations({subtree:true}).length===0)));
 const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8912/about/brand-guidelines/');assert.equal(await plain.locator('[data-card-study]').count(),2);assert.equal(await plain.locator('[data-bc-pencil]').count(),183);assert.equal(await plain.locator('.bc-graphite-outline').first().evaluate(e=>getComputedStyle(e).opacity),'0.85');
 assert.deepEqual(errors,[]);console.log('PASS both static drawings for reduced-motion and no-JavaScript reading');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
