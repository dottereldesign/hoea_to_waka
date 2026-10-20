const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const port=8820,faqSelector='#home-faq',url='http://127.0.0.1:'+port+'/hoea_to_waka/';
(async()=>{
 const server=require('./preview.cjs')(port),browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  fs.mkdirSync('tmp/home-faq-motion',{recursive:true});
  const context=await browser.newContext({reducedMotion:'no-preference'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1440,900,390,320]){
   await page.setViewportSize({width,height:1100});
   await page.goto(url);await page.waitForLoadState('networkidle');
   const faq=page.locator(faqSelector),items=faq.locator('details'),first=items.first(),summary=first.locator('summary');
   assert.equal(await items.count(),8);
   assert.deepEqual(await faq.locator('.home-faq-column').evaluateAll(es=>es.map(e=>[...e.querySelectorAll('summary>span:first-child')].map(n=>n.textContent))),[['01','02','03','04'],['05','06','07','08']]);
   const columns=await faq.locator('.home-faq-column').evaluateAll(es=>es.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y})));
   assert(width>760?columns[1].x>columns[0].x:columns[1].y>columns[0].y);
   const centered=await faq.locator('.ds-section-heading').evaluate(e=>{const a=e.getBoundingClientRect(),b=e.closest('section').getBoundingClientRect();return Math.abs(a.x+a.width/2-b.x-b.width/2)});
   assert(centered<1);
   await summary.scrollIntoViewIfNeeded();
   const collapsed=await first.evaluate(e=>e.getBoundingClientRect().height);
   await summary.click();await page.waitForFunction(h=>document.querySelector('.home-faq-column details').getBoundingClientRect().height>h+1,collapsed);
   const mid=await first.evaluate(e=>e.getBoundingClientRect().height);assert(mid>collapsed,'opening has intermediate height');
   await page.waitForTimeout(450);
   const expanded=await first.evaluate(e=>e.getBoundingClientRect().height);assert(expanded>mid,'opening finishes smoothly');
   const alignment=await first.evaluate(e=>Math.abs(e.querySelector('.ds-answer p').getBoundingClientRect().x-e.querySelector('.home-faq-question').getBoundingClientRect().x));assert(alignment<1,'answer aligned with question '+width);
   if(width>760)assert.equal(await faq.locator('.home-faq-column').nth(1).evaluate(e=>e.getBoundingClientRect().y),columns[1].y+(await page.evaluate(()=>0))- (await page.evaluate(()=>scrollY)),'right column remains anchored');
   if([1440,390].includes(width))await faq.screenshot({path:`tmp/home-faq-motion/open-${width}.png`,style:'.site-header{visibility:hidden!important}'});
   await summary.click();await page.waitForFunction(h=>document.querySelector('.home-faq-column details').getBoundingClientRect().height<h-1,expanded);assert(await first.evaluate(e=>e.open),'stays open while closing');
   const closing=await first.evaluate(e=>e.getBoundingClientRect().height);assert(closing<expanded&&closing>collapsed,'closing has intermediate height');
   await page.waitForTimeout(400);assert.equal(await first.evaluate(e=>e.open),false);
   await summary.click();await page.waitForTimeout(65);await summary.click();await page.waitForTimeout(65);await summary.click();await page.waitForTimeout(500);assert(await first.evaluate(e=>e.open),'rapid reversal ends open');
   await summary.focus();await page.keyboard.press('Enter');await page.waitForTimeout(420);assert.equal(await first.evaluate(e=>e.open),false,'keyboard close');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no overflow '+width);
   console.log('FAQ layout and motion passed '+width);
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator(faqSelector+' summary').first().click();assert(await page.locator(faqSelector+' details').first().evaluate(e=>e.open&&e.getAnimations().length===0));
  const result=await new(require('@axe-core/playwright').default)({page}).include(faqSelector).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations,[]);
  const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto(url);await plain.locator(faqSelector+' summary').first().click();assert(await plain.locator(faqSelector+' details').first().evaluate(e=>e.open));
  assert.deepEqual(errors,[]);console.log('PASS: FAQ columns, answer alignment, fluid open/close, rapid reversal, keyboard, reduced motion, accessibility and native fallback');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
