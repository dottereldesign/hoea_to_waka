const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const server=require('./preview.cjs')(8835),browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext(),page=await context.newPage();
  for(const width of [1440,900,390,320]){
   await page.setViewportSize({width,height:1000});
   await page.goto('http://127.0.0.1:8835/hoea_to_waka/');await page.waitForLoadState('networkidle');
   const section=page.locator('[data-component="home:6:testimonials"]');
   await section.scrollIntoViewIfNeeded();
   const measure=()=>section.evaluate(s=>({height:s.getBoundingClientRect().height,controls:s.querySelector('.ds-controls').getBoundingClientRect().y+scrollY,font:parseFloat(getComputedStyle(s.querySelector('figure:not([hidden]) blockquote')).fontSize),overflow:document.documentElement.scrollWidth>innerWidth}));
   const short=await measure();
   await section.locator('[data-next]').click();
   const long=await measure();
   assert(long.font<short.font,'Longer quotes use a smaller font');
   assert(Math.abs(long.height-short.height)<1,'Section height stays stable');
   assert(Math.abs(long.controls-short.controls)<1,'Navigation stays in place');
   assert(!long.overflow);
   assert.equal(await section.getByRole('blockquote').count(),1,'Only the active quote is accessible');
   await section.locator('[data-prev]').click();
   assert.equal((await measure()).height,short.height);
   console.log('PASS: adaptive testimonial size and stable layout at',width);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('figure:not([hidden])').first().evaluate(e=>getComputedStyle(e).animationName),'none');
  const results=await new(require('@axe-core/playwright').default)({page}).include('[data-component="home:6:testimonials"]').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(results.violations,[]);
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
