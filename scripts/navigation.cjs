const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const server=require('./preview.cjs')(8829),browser=await chromium.launch({channel:'chrome',headless:true});try{
 const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:8829/hoea_to_waka/';
 for(const route of['','about/','model/','services/','services/in-house-workshops/','services/resilience-one-on-one/','services/workshops-for-support-professionals/','resources/','contact/','illustrations/','404.html','about/brand-guidelines/','about/jamies-workspace/']){
  await page.goto(base+route);await page.waitForLoadState('networkidle');
  const nav=page.locator('nav.site-nav,nav.site-preview-nav').first();
  const links=await nav.locator(':scope > a,:scope > .site-nav-dropdown > a,:scope > .site-preview-nav-item > a').evaluateAll(es=>es.map(e=>({text:e.textContent.trim(),url:e.href})));
  const about=links.findIndex(e=>e.text==='About');assert.equal(links[about+1].text,'Model',route);assert(links[about+2].text.startsWith('Services'),route);
  assert.equal(new URL(links[about+1].url).pathname,route==='404.html'?'/model/':'/hoea_to_waka/model/',route+' correct depth');
  if(await page.locator('.site-menu-links').count())assert.equal(await page.locator('.site-menu-links').getByRole('link',{name:'Model',exact:true,includeHidden:true}).count(),1);
  if(await page.locator('.site-footer .footer-links').count())assert.equal(await page.locator('.site-footer').getByRole('link',{name:'Model',exact:true,includeHidden:true}).count(),1);
 }
 fs.mkdirSync('tmp/model-page',{recursive:true});
 for(const width of[1440,1100,900,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'model/');await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('h1').textContent(),'Model');assert.equal(await page.locator('.site-nav [aria-current="page"]').textContent(),'Model');
  assert(await page.locator('.subpage-hero').evaluate(e=>{const c=getComputedStyle(e);return c.borderRadius==='32px'&&e.getBoundingClientRect().x===8}));
  assert.equal(await page.locator('[data-component="model/:2:features"]').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(40, 26, 44)');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+width);
  if([1440,390].includes(width))await page.screenshot({path:`tmp/model-page/after-${width}.png`,fullPage:true});
  if(width>=1100){await page.evaluate(()=>scrollTo({top:300,behavior:'instant'}));await page.waitForTimeout(100);const clear=await page.locator('[data-morph-header]').evaluate(e=>{const brand=e.querySelector('.site-brand').getBoundingClientRect();return [...e.querySelectorAll('.site-nav-link,.site-nav-parent-link')].every(a=>a.getBoundingClientRect().right<brand.left-5)});assert(clear,'compact nav clears centred logo '+width);}
 }
 await page.locator('[data-menu-toggle]').click();await page.locator('.site-menu-links').getByRole('link',{name:'Model',exact:true}).click();await page.waitForLoadState('networkidle');assert.equal(new URL(page.url()).pathname,'/hoea_to_waka/model/');
 const result=await new(require('@axe-core/playwright').default)({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations,[]);
 const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:1000}});await plain.goto(base+'model/');assert(await plain.locator('h1').isVisible());assert(await plain.locator('.site-nav').getByRole('link',{name:'Model',exact:true}).isVisible());
 assert.deepEqual(errors,[]);console.log('PASS: Model navigation order and nested links across site, active state, shared page chrome, compact header clearance, mobile menu, 320–1440px, accessibility and native fallback');
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exit(1)});
