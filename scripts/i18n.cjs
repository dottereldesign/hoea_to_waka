const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs');
const locales=['mi','sm','zh-CN','hi','tl','yue','fr','pa','af'];
const routes=['/','/about/','/model/','/services/','/services/in-house-workshops/','/services/resilience-one-on-one/','/services/workshops-for-support-professionals/','/resources/','/contact/','/illustrations/','/about/brand-guidelines/','/about/jamies-workspace/','/prompts/','/404.html'];
(async()=>{
 const server=require('./preview.cjs')(8931),browser=await chromium.launch({channel:'chrome'});
 fs.mkdirSync('tmp/i18n',{recursive:true});
 async function ready(page,locale){await page.waitForFunction(locale=>document.documentElement.dataset.languageState==='ready'&&document.documentElement.lang===locale,locale,{timeout:60000});}
 try{
  // Actual provider translations: no mocked strings or requests.
  for(const locale of locales){
   const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/gtranslate|googleapis/.test(r.url()))external.push(r.url());});
   await page.goto('http://127.0.0.1:8931/');await page.waitForSelector('.language-launch');
   assert.equal(external.length,0,'English default makes no translation requests');
   await page.locator('#services').scrollIntoViewIfNeeded();await page.waitForTimeout(650);
   const original=await page.locator('#services h2').textContent();
   await page.locator('.language-launch').click();await page.locator(`[data-language="${locale}"]`).click();await ready(page,locale);
   await page.waitForFunction(original=>document.querySelector('#services h2').textContent!==original,original,{timeout:20000});
   assert.equal(context.pages().length,1,'Switching does not open another page');assert.equal(new URL(page.url()).searchParams.get('lang'),locale);
   assert.equal((await page.locator('.site-brand-name').textContent()).trim(),'Hoea tō Waka');
   if(['fr','mi','zh-CN','hi'].includes(locale))await page.screenshot({path:`tmp/i18n/services-${locale}.png`});
   await page.evaluate(()=>window.hoeaI18n.setLocale('en'));await ready(page,'en-NZ');
   assert.equal((await page.locator('#services h2').textContent()).trim(),original.trim());assert.equal(new URL(page.url()).searchParams.has('lang'),false);
   assert.deepEqual(errors,[]);await context.close();console.log('PASS real in-place translation and exact English restoration',locale);
  }
  // Every site page, retained language on navigation, title/attributes, and dynamic content.
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('hoea-language','fr'));
  for(const route of routes){
   await page.goto('http://127.0.0.1:8931'+route);await ready(page,'fr');
   assert.equal(await page.locator('.language-launch').count(),1);
   await page.evaluate(()=>scrollTo({top:Math.min(700,document.documentElement.scrollHeight-innerHeight),behavior:'instant'}));await page.waitForTimeout(800);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No translated overflow: '+route);
   if(route==='/about/'){
    const title=await page.locator('#anna-story-title').textContent();assert.notEqual(title,'Meet Anna Brown');
    assert.equal(await page.locator('.anna-sticky-title').textContent(),title);
    await page.evaluate(()=>window.hoeaI18n.setLocale('mi'));await ready(page,'mi');await page.waitForTimeout(750);
    assert.equal(await page.locator('.anna-sticky-title').textContent(),await page.locator('#anna-story-title').textContent(),'Docked heading follows locale while original is offscreen');
   }
   if(route==='/contact/'){
    const first=page.locator('input[type=text],input:not([type])').first();if(await first.count()){
     await first.fill('Test name — do not translate');await page.evaluate(()=>window.hoeaI18n.setLocale('mi'));await ready(page,'mi');assert.equal(await first.inputValue(),'Test name — do not translate');
    }
   }
   if(route==='/about/brand-guidelines/')assert.equal(await page.locator('[data-header-entrance]').getAttribute('data-entrance-style'),'Elastic tilt');
   console.log('PASS persistent in-place translation',route);
  }
  await page.goto('http://127.0.0.1:8931/about/');await ready(page,'fr');
  await page.evaluate(()=>{const p=document.createElement('p');p.id='i18n-dynamic-test';p.textContent='Start a conversation about your team';p.style.cssText='position:fixed;top:200px;left:20px;background:white;z-index:100';document.body.append(p);});
  await page.waitForFunction(()=>document.querySelector('#i18n-dynamic-test').textContent!=='Start a conversation about your team',null,{timeout:20000});
  await page.reload();await ready(page,'fr');assert.deepEqual(errors,[]);await context.close();console.log('PASS dynamic text and reload');
  // Mobile, menu labels and controls remain usable with longer text and new scripts.
  for(const [width,locale] of [[390,'fr'],[320,'hi'],[390,'mi'],[320,'zh-CN']]){
   const context=await browser.newContext({viewport:{width,height:844}}),page=await context.newPage();
   await page.goto(`http://127.0.0.1:8931/?lang=${locale}`);await ready(page,locale);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.locator('[data-menu-toggle]').click();await page.waitForTimeout(900);assert(await page.locator('.site-menu-panel').evaluate(x=>x.open));
   await page.keyboard.press('Escape');await page.waitForTimeout(700);await page.locator('.language-launch').click();await page.waitForTimeout(600);
   const axe=await new(require('@axe-core/playwright').default)({page}).include('.language-panel').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations,[]);
   await page.screenshot({path:`tmp/i18n/mobile-${width}-${locale}.png`});await context.close();console.log('PASS translated mobile layout, menu and accessibility',width,locale);
  }
  // A blocked service must leave a functioning English site and allow cancellation.
  const failed=await browser.newContext(),f=await failed.newPage();await f.route('https://cdn.gtranslate.net/**',r=>r.abort());await f.goto('http://127.0.0.1:8931/');
  await f.evaluate(()=>window.hoeaI18n.setLocale('fr'));assert.equal(await f.locator('html').getAttribute('data-language-state'),'error');assert.equal(await f.locator('html').getAttribute('lang'),'en-NZ');assert(await f.locator('.language-status').isVisible());
  await f.locator('.language-launch').click();await f.locator('[data-language=en]').click();assert.equal(await f.locator('html').getAttribute('data-language-state'),'ready');await failed.close();console.log('PASS unavailable-service fallback');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
