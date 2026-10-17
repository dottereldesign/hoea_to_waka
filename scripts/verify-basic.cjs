const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const serve=require('./preview.cjs');
const baseline=require('../assets/drafts/draft-1.json');
const routes=['','about/','services/','services/in-house-workshops/','services/resilience-one-on-one/','services/workshops-for-support-professionals/','resources/','contact/','illustrations/','404.html','about/brand-guidelines/','about/jamies-workspace/','prompts/','brand/brand-system.html','pages/home.html'];
(async()=>{const server=serve(8791),browser=await chromium.launch({channel:'chrome',headless:true});const errors=[];try{
  const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  fs.mkdirSync('tmp/basic-site',{recursive:true});
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:width===390?844:1000});
    for(const route of routes){
      const response=await page.goto('http://127.0.0.1:8791/hoea_to_waka/'+route);assert.equal(response.status(),200,route);
      await page.waitForLoadState('networkidle');
      assert.equal(await page.locator('.ap-launcher,.ap-dialog,.ds-overlay,.ds-picker,.ds-switcher,.ds-dock,.ds-handoff').count(),0,route+' editor UI');
      assert.equal(await page.evaluate(()=>Boolean(window.HoeaDesignStudio||window.HoeaAppearance)),false,route+' editor API');
      const components=await page.locator('.ds-component').evaluateAll(els=>els.map(el=>({key:el.dataset.component,value:Number(el.dataset.design),colour:el.dataset.componentPalette})));
      for(const c of components){assert.equal(c.value,baseline.effectiveChoices[c.key],route+' '+c.key);assert.equal(c.colour,baseline.effectiveColourOverrides[c.key],route+' colour '+c.key);}
      assert.equal(await page.locator('h1').count(),1,route+' h1');
      if(routes.indexOf(route)<10)assert.match(await page.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily),/Instrument Serif/,route+' heading font');
      assert.deepEqual(await page.locator('img').evaluateAll(els=>els.filter(i=>i.currentSrc&&i.complete&&!i.naturalWidth).map(i=>i.currentSrc)),[],route+' broken images');
      if(routes.indexOf(route)<10){
        assert.equal(components.length,Object.entries(baseline.effectiveChoices).filter(([k,v])=>v>0&&k.startsWith((route||'home')+':')&&k.split(':').length===3).length,route+' rendered sections');
        if(await page.locator('footer').count()){assert(await page.locator('footer a[href*="brand-guidelines"]').count(),route+' brand link');
        assert(await page.locator('footer a[href*="illustrations"]').count(),route+' illustrations link');
        assert(await page.locator('footer [data-shielded-site]').count(),route+' shielded link');}
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' overflow '+width);
      }
      if(['','about/','contact/'].includes(route))await page.screenshot({path:`tmp/basic-site/after-${route.replaceAll('/','')||'home'}-${width===390?'mobile':'desktop'}.png`,fullPage:true});
    }
  }
  await page.goto('http://127.0.0.1:8791/hoea_to_waka/contact/');
  await page.route('**/contact.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('window.location.href =','window.__preparedMailto =')});});
  await page.reload();
  await page.getByLabel('Name',{exact:true}).fill('Site verification');await page.getByLabel('Email',{exact:true}).fill('test@example.com');await page.getByLabel('How can Anna help?').fill('Testing the simplified site.');await page.getByRole('button',{name:'Prepare email',exact:true}).click();
  assert.match(await page.evaluate(()=>window.__preparedMailto),/^mailto:anna@hoeatowaka\.co\.nz/);
  await page.locator('[data-quick-toggle]').click();assert(await page.locator('.ds-quick-panel').isVisible());await page.keyboard.press('Escape');assert.equal(await page.locator('.ds-quick-panel').isVisible(),false);
  await page.locator('[data-menu-toggle]').click();assert(await page.locator('[data-site-header]').evaluate(el=>el.classList.contains('is-open')));await page.keyboard.press('Escape');assert.equal(await page.locator('[data-site-header]').evaluate(el=>el.classList.contains('is-open')),false);
  const saved=await browser.newContext({reducedMotion:'reduce'});await saved.addInitScript(()=>{
    localStorage.setItem('hoea-design-studio-draft-1',JSON.stringify({'home:2:statement':3,'colour:home:2:statement':'arctic-poppy'}));
    localStorage.setItem('hoea-appearance-draft-1',JSON.stringify({palette:'plum-sorbet',roles:{display:'eb-garamond'}}));
  });const returning=await saved.newPage();await returning.goto('http://127.0.0.1:8791/hoea_to_waka/?design=5');await returning.waitForLoadState('networkidle');
  assert.equal(await returning.locator('[data-component="home:2:statement"]').getAttribute('data-design'),'3');assert.equal(await returning.locator('[data-component="home:2:statement"]').getAttribute('data-component-palette'),'arctic-poppy');assert.equal(await returning.locator('html').getAttribute('data-palette'),'plum-sorbet');assert.match(await returning.locator('html').getAttribute('style'),/EB Garamond/);
  await returning.emulateMedia({reducedMotion:'no-preference'});await returning.waitForTimeout(500);await returning.emulateMedia({reducedMotion:'reduce'});
  await saved.close();assert.deepEqual(errors,[]);
  console.log('PASS: 15 routes at desktop/mobile, published layouts and palettes, removed editor UI/APIs, footer links, image loading, main-page overflow, contact email preparation, quick contact, mobile navigation, saved presentation and disabled query overrides.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
