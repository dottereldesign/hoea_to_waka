const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const server=require('./preview.cjs')(8803),browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of[320,390,768,1440,2560]){
  await page.setViewportSize({width,height:1000});await page.goto('http://localhost:8803/hoea_to_waka/');await page.waitForLoadState('networkidle');
  const hero=page.locator('.home-hero'),controls=hero.locator('.hero-version-controls');
  assert.equal(await hero.getAttribute('data-hero-version'),'01');assert(await controls.isVisible());assert.equal(await controls.locator('button').count(),5);
  assert.equal(await page.locator('h1').count(),1);assert.equal(await hero.locator('h1').textContent(),'Hoea tō Waka');
  assert.equal(await hero.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(32, 32, 32)');assert(!(await hero.locator('.home-hero-photo').isVisible()));
  const colourViolations=await page.locator('body *').evaluateAll(es=>es.flatMap(e=>{if(!e.getClientRects().length||e.closest('svg defs,[data-component="home:4:features"]'))return[];const c=getComputedStyle(e);return ['color','backgroundColor','borderTopColor','fill','stroke'].flatMap(prop=>{const m=c[prop]?.match(/^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);return m&&Number(m[4]??1)>0&&(Math.max(+m[1],+m[2],+m[3])-Math.min(+m[1],+m[2],+m[3])>12)?[e.tagName+' '+prop+' '+c[prop]]:[]})}));assert.deepEqual(colourViolations,[],'homepage colours '+width+' '+JSON.stringify(colourViolations));assert.equal(await page.locator('[data-component="home:4:features"]').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(40, 26, 44)');
  assert(await page.locator('main img').evaluateAll(es=>es.every(e=>!getComputedStyle(e).filter.includes('grayscale'))));
  await controls.locator('[data-hero-choice="02"]').click();assert.equal(await hero.getAttribute('data-hero-version'),'02');assert(await hero.locator('.home-hero-photo').isVisible());assert(await hero.locator('.home-hero-mark').isVisible());
  assert.equal(await hero.locator('.home-hero-photo img').getAttribute('src'),'assets/hero-collaboration.webp');
  assert.equal(await controls.locator('[aria-pressed="true"]').textContent(),'02');
  await controls.locator('[data-hero-choice="01"]').press('Enter');assert.equal(await hero.getAttribute('data-hero-version'),'01');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const title=await hero.locator('h1').boundingBox();assert(title.x>=0&&title.x+title.width<=width);
  await page.reload();assert.equal(await hero.getAttribute('data-hero-version'),'01');console.log('Hero and monochrome passed '+width);
 }
 await page.goto('http://localhost:8803/hoea_to_waka/about/');assert.equal(await page.locator('html').evaluate(e=>getComputedStyle(e).getPropertyValue('--brand-ocean-800').trim()),'#243A53');
 const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://localhost:8803/hoea_to_waka/');assert.equal(await plain.locator('.home-hero').getAttribute('data-hero-version'),'01');assert(await plain.locator('.hero-version-controls').isHidden());assert(!(await plain.locator('.home-hero-photo').isVisible()));
 assert.deepEqual(errors,[]);console.log('PASS: neutral homepage only, solid default, preserved photo option, keyboard switching, reload default, no-JS and 320–2560px');
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exit(1)});
