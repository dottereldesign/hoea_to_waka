const{chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs'),sharp=require('sharp'),Axe=require('@axe-core/playwright').default;
const URL_VALUE='https://dottereldesign.github.io/hoea_to_waka/about/brand-guidelines';
(async()=>{const server=require('./preview.cjs')(8921),browser=await chromium.launch({channel:'chrome'});try{fs.mkdirSync('tmp/brand-share',{recursive:true});const errors=[];
for(const[width,height]of[[1440,1000],[1100,900],[390,844],[320,844],[390,500]]){
 const context=await browser.newContext({viewport:{width,height},permissions:['clipboard-read','clipboard-write']}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{navigator.share=async data=>{window.__shareData=data;};});
 await page.goto('http://127.0.0.1:8921/hoea_to_waka/about/brand-guidelines/');await page.waitForLoadState('networkidle');const trigger=page.locator('#brand-share-trigger'),panel=page.locator('#brand-share-panel');
 await trigger.scrollIntoViewIfNeeded();await page.screenshot({path:`tmp/brand-share/closed-${width}-${height}.png`});await trigger.click();await page.waitForTimeout(900);
 assert.equal(await trigger.getAttribute('aria-expanded'),'true');const box=await panel.boundingBox();assert(box.x>=15&&box.y>=15&&box.x+box.width<=width&&box.y+box.height<=height-15,'Sharing panel fits viewport');
 assert.equal(await panel.evaluate(e=>getComputedStyle(e).scrollbarWidth),'none');assert.equal(await panel.evaluate(e=>e.scrollWidth-e.clientWidth),0,'No horizontal scrollbars');
 const arrow=await panel.evaluate(e=>{const qr=e.querySelector('.brand-share__qr').getBoundingClientRect(),svg=e.querySelector('.brand-share__note svg'),point=new DOMPoint(8,40).matrixTransform(svg.getScreenCTM());return{tipX:point.x,tipY:point.y,right:qr.right,top:qr.top,bottom:qr.bottom};});
 assert(Math.abs(arrow.tipX-arrow.right-4)<1&&arrow.tipY>arrow.top&&arrow.tipY<arrow.bottom,'Arrow tip aims at the QR edge');
 await panel.locator('.brand-share__qr').screenshot({path:`tmp/brand-share/scan-${width}-${height}.png`});await page.screenshot({path:`tmp/brand-share/open-${width}-${height}.png`});
 await panel.locator('.brand-share__copy').click();await page.waitForFunction(()=>document.querySelector('.brand-share__status').textContent.startsWith('Link copied'));assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),URL_VALUE);
 const mail=new URL(await panel.locator('[data-share-email]').getAttribute('href'));assert(mail.searchParams.get('body').includes(URL_VALUE)&&mail.searchParams.get('subject').includes('tō Waka'));
 const whatsapp=new URL(await panel.locator('[data-share-whatsapp]').getAttribute('href'));assert(whatsapp.searchParams.get('text').includes(URL_VALUE));
 const linkedin=new URL(await panel.locator('[data-share-linkedin]').getAttribute('href'));assert.equal(linkedin.searchParams.get('url'),URL_VALUE);
 await panel.locator('[data-share-native]').click();assert.equal(await page.evaluate(()=>window.__shareData.url),URL_VALUE);
 await page.evaluate(()=>navigator.share=async()=>{throw new DOMException('Cancelled','AbortError');});await panel.locator('[data-share-native]').click();assert.match(await panel.locator('.brand-share__status').textContent(),/cancelled/);
 const download=page.waitForEvent('download');await panel.locator('a[download]').click();const file=await download;assert.equal(file.suggestedFilename(),'hoea-to-waka-brand-guide-qr.png');assert.equal(await file.failure(),null);assert.equal((await sharp(await file.path()).metadata()).width,720);const closeBox=await panel.locator('.brand-share__close').boundingBox();assert(closeBox.y>=16&&closeBox.y+closeBox.height<=height-16,'Close control stays visible while content scrolls');
 const result=await new Axe({page}).include('#brand-share-panel').include('#brand-share-trigger').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations,[]);
 await panel.locator('a[download]').focus();await page.keyboard.press('Tab');await page.waitForTimeout(700);assert.equal(await trigger.getAttribute('aria-expanded'),'false','Tab can leave the sharing panel');assert(await trigger.evaluate(e=>e===document.activeElement));await page.keyboard.press('Enter');await page.waitForTimeout(900);
 await page.keyboard.press('Escape');await page.waitForTimeout(700);assert(!(await panel.evaluate(e=>e.matches(':popover-open'))));assert(await trigger.evaluate(e=>e===document.activeElement));
 await page.keyboard.press('Enter');await page.waitForTimeout(180);const continuity=await panel.evaluate(e=>{const before=getComputedStyle(e).clipPath;document.querySelector('.brand-share__close').click();return[before,getComputedStyle(e).clipPath]});assert.equal(continuity[0],continuity[1],'Closing continues from the current contour');
 await page.waitForTimeout(70);await trigger.click({force:true});await page.waitForTimeout(900);assert.equal(await trigger.getAttribute('aria-expanded'),'true');
 await page.mouse.click(width-10,Math.min(height-10,120));await page.waitForTimeout(700);assert.equal(await trigger.getAttribute('aria-expanded'),'false');
 await trigger.click();await page.waitForTimeout(900);
 if(width===1440){
  const image=await panel.screenshot({style:'#brand-share-panel > *{visibility:hidden!important}'});const{data,info}=await sharp(image).removeAlpha().raw().toBuffer({resolveWithObject:true});const {contrast}=await import('../design/brand-tokens.mjs');let minimum=100;for(let y=20;y<info.height-20;y+=5)for(let x=20;x<info.width-20;x+=5){const n=(y*info.width+x)*3;const hex='#'+[data[n],data[n+1],data[n+2]].map(v=>v.toString(16).padStart(2,'0')).join('');minimum=Math.min(minimum,contrast('#202329',hex));}assert(minimum>=4.5,'Dark text has AA contrast across the mesh');console.log('PASS sampled mesh minimum text contrast',minimum.toFixed(2));
  await panel.locator('.brand-share__close').click();await page.waitForTimeout(700);await trigger.click();
  await panel.evaluate(e=>{window.__shareAnimations=e.getAnimations({subtree:true});window.__shareAnimations.forEach(a=>a.pause());});
  for(const time of[0,70,150,280,450,900]){await page.evaluate(t=>window.__shareAnimations.forEach(a=>a.currentTime=t),time);await page.screenshot({path:`tmp/brand-share/morph-${time}.png`});}
 }
 await context.close();console.log('PASS QR/arrow geometry, copy, sharing URLs, native share/cancel, PNG save, axe, bounds and reversible motion',width,height);
}
const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.goto('http://127.0.0.1:8921/about/brand-guidelines/');await reduced.locator('#brand-share-trigger').click();await reduced.waitForFunction(()=>document.querySelector('#brand-share-panel').dataset.open==='true');assert.equal(await reduced.locator('#brand-share-panel').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');await reduced.keyboard.press('Escape');assert(!(await reduced.locator('#brand-share-panel').evaluate(e=>e.matches(':popover-open'))));
const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8921/about/brand-guidelines/');assert((await plain.locator('#brand-share-trigger').getAttribute('href')).endsWith('brand-guide-qr.svg'));
assert.deepEqual(errors,[]);console.log('PASS reduced motion and QR fallback without JavaScript');
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
