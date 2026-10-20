const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const server=require('./preview.cjs')(8800),browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage();
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1000});
   await page.goto('http://localhost:8800/hoea_to_waka/');
   await page.waitForLoadState('networkidle');
   const button=page.locator('[data-home-statement] .model-button');
   await button.scrollIntoViewIfNeeded();
   assert.equal(await page.locator('.model-button-previews').count(),0);
   assert.equal(await button.evaluate(e=>new URL(e.href).pathname),'/hoea_to_waka/about/');
   assert.equal(await button.evaluate(e=>getComputedStyle(e).borderRadius),'999px');
   assert.equal(await button.locator('.model-button__icon').evaluate(e=>getComputedStyle(e).width),'42px');
   for(const panel of ['home:6:testimonials','home:7:cta']){
    const section=page.locator('[data-component="'+panel+'"]');
    for(const selector of ['.ds-kicker','.ds-title'])assert.equal(await section.locator(selector).first().evaluate(e=>getComputedStyle(e).color),'rgb(32, 32, 32)');
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({path:'tmp/'+panel.split(':')[2]+'-spacing-after-'+width+'.png',style:'.site-header,.site-header *,.skip-link{visibility:hidden!important}'});
   }
   const padding=await page.locator('.home-cta-simple').evaluate(e=>({top:parseFloat(getComputedStyle(e).paddingTop),bottom:parseFloat(getComputedStyle(e).paddingBottom),standard:parseFloat(getComputedStyle(e).getPropertyValue('--section-space'))}));
   assert.equal(padding.top,padding.standard);assert.equal(padding.bottom,padding.standard);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-home-statement] .model-button').hover();
  assert.equal(await page.locator('[data-home-statement] .model-button__icon').evaluate(e=>getComputedStyle(e).transform),'none');
  console.log('PASS: chosen arrow-disc button, no previews, Ink headings, consistent section spacing, responsive layouts and reduced motion');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
