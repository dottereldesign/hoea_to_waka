const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Axe=require('@axe-core/playwright').default;
(async()=>{
 const server=require('./preview.cjs')(8898),browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  fs.mkdirSync('tmp/brand-jump',{recursive:true});
  const errors=[];
  for(const width of [1440,390,320]){
   const context=await browser.newContext({viewport:{width,height:844}}),page=await context.newPage();
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8898/about/brand-guidelines/#chapter-logo');
   await page.waitForLoadState('networkidle');
   const toggle=page.locator('.brand-jump__toggle'),panel=page.locator('.brand-jump__panel');
   assert.equal(await panel.evaluate(e=>e.inert),true);
   assert.equal(await panel.getByRole('link').count(),9);
   await page.screenshot({path:`tmp/brand-jump/closed-${width}.png`});
   await toggle.click();
   await page.waitForTimeout(950);
   assert.equal(await toggle.getAttribute('aria-expanded'),'true');
   assert.equal(await panel.evaluate(e=>e.inert),false);
   const bounds=await panel.boundingBox();
   assert(bounds.x>=12&&bounds.x+bounds.width<=width&&bounds.y>=0&&bounds.y+bounds.height<=844,'Panel fits viewport');
   assert.equal(await panel.locator('a').last().evaluate(e=>getComputedStyle(e).opacity),'1');
   assert.deepEqual(await panel.locator('a').evaluateAll(es=>es.map(e=>e.getAttribute('href'))),await page.locator('#contents nav a').evaluateAll(es=>es.map(e=>e.getAttribute('href'))));
   await page.screenshot({path:`tmp/brand-jump/open-${width}.png`});
   const axe=await new Axe({page}).include('.brand-jump').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   assert.deepEqual(axe.violations,[]);
   await page.keyboard.press('Escape');
   assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   assert(await toggle.evaluate(e=>e===document.activeElement));
   await page.waitForTimeout(650);
   await page.keyboard.press('Enter');
   await page.keyboard.press('Tab');
   assert(await panel.locator('a').first().evaluate(e=>e===document.activeElement),'Keyboard enters chapter links');
   for(let i=0;i<8;i++) await page.keyboard.press('Tab');
   assert(await panel.locator('a').last().evaluate(e=>e===document.activeElement));
   await page.keyboard.press('Tab');
   assert.equal(await toggle.getAttribute('aria-expanded'),'false','Tab can leave the menu');
   await page.keyboard.press('Escape');
   await toggle.click();
   await page.waitForTimeout(90);
   const continuity=await panel.evaluate(e=>{const before=getComputedStyle(e).clipPath;document.querySelector('.brand-jump__toggle').click();return [before,getComputedStyle(e).clipPath]});
   assert.equal(continuity[0],continuity[1],'Direction change preserves current outline');
   await page.waitForTimeout(80);
   await toggle.click();
   await page.waitForTimeout(950);
   assert.equal(await toggle.getAttribute('aria-expanded'),'true');
   await page.mouse.click(10,100);
   assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   await toggle.click();
   await page.waitForTimeout(950);
   await panel.locator('a[href="#chapter-typeface"]').click();
   assert.equal(await page.evaluate(()=>location.hash),'#chapter-typeface');
   assert.equal(await panel.evaluate(e=>e.inert),true);
   await page.waitForFunction(()=>Math.abs(document.querySelector('#chapter-typeface').getBoundingClientRect().top)<120);
   assert.equal(await page.evaluate(()=>document.activeElement.id),'chapter-typeface');
   if(width===1440){
    await page.waitForTimeout(950);
    await toggle.click();
    await panel.evaluate(e=>{window.__jumpAnimations=[...e.getAnimations({subtree:true}),...document.querySelector('.brand-jump__toggle').getAnimations({subtree:true})];window.__jumpAnimations.forEach(a=>a.pause());});
    for(const time of [0,70,150,270,450,950]){
     await page.evaluate(t=>window.__jumpAnimations.forEach(a=>a.currentTime=t),time);
     await page.screenshot({path:`tmp/brand-jump/morph-${time}.png`});
    }
   }
   await context.close();
   console.log('PASS viewport, all chapter targets, axe, keyboard, outside dismiss, reversal and navigation',width);
  }
  const reducedContext=await browser.newContext({reducedMotion:'reduce'}),reduced=await reducedContext.newPage();
  await reduced.goto('http://127.0.0.1:8898/about/brand-guidelines/');
  await reduced.locator('.brand-jump__toggle').click();
  assert.equal(await reduced.locator('.brand-jump__panel').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  for(let i=0;i<9;i++){
   if(i)await reduced.locator('.brand-jump__toggle').click();
   const link=reduced.locator('.brand-jump__link').nth(i),href=await link.getAttribute('href');
   await link.click();assert.equal(await reduced.evaluate(()=>location.hash),href);
  }
  await reduced.evaluate(()=>localStorage.setItem('hoea-theme','dark'));
  await reduced.reload();await reduced.locator('.brand-jump__toggle').click();
  await reduced.screenshot({path:'tmp/brand-jump/dark.png'});
  const dark=await new Axe({page:reduced}).include('.brand-jump').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(dark.violations,[]);
  await reduced.goto('http://127.0.0.1:8898/about/');
  assert.equal(await reduced.locator('.brand-jump').count(),0,'Only brand guidelines gets the button');
  assert.deepEqual(errors,[]);
  console.log('PASS reduced motion, every chapter navigation, dark theme and page-only scope');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
