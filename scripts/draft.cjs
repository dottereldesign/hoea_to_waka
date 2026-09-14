const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),serve=require('./preview.cjs');
const baseline=require('../assets/drafts/draft-1.json');
(async()=>{const server=serve(8789),browser=await chromium.launch({channel:'chrome',headless:true});try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const ready=()=>page.waitForFunction(()=>window.HoeaDesignStudio?.draft);
  await page.goto('http://127.0.0.1:8789/');await ready();
  for(const route of ['','about/','services/','services/in-house-workshops/','services/resilience-one-on-one/','services/workshops-for-support-professionals/','resources/','contact/','illustrations/','404.html']){
    await page.goto('http://127.0.0.1:8789/'+route);await ready();
    const selections=await page.evaluate(()=>window.HoeaDesignStudio.components.map(c=>({key:c.key,value:c.value,colour:c.el.dataset.componentPalette})));
    for(const c of selections){assert.equal(c.value,baseline.effectiveChoices[c.key],c.key);assert.equal(c.colour,baseline.effectiveColourOverrides[c.key],c.key+' colour');}
    assert.equal(await page.evaluate(()=>window.HoeaAppearance.getState().palette),baseline.colour.id);
  }
  const handoff=await page.evaluate(()=>window.HoeaDesignStudio.export());assert.deepEqual(handoff.effectiveChoices,baseline.effectiveChoices);assert.deepEqual(handoff.effectiveColourOverrides,baseline.effectiveColourOverrides);assert.equal(handoff.draft.id,'draft-1');
  await page.goto('http://127.0.0.1:8789/about/');await ready();
  const fonts=await page.evaluate(()=>window.HoeaAppearance.fonts);assert.equal(fonts.length,20);assert.equal(await page.evaluate(()=>window.HoeaAppearance.pairings.length),20);
  for(const font of fonts){const loaded=await page.evaluate(async name=>{const faces=await document.fonts.load(`400 24px "${name}"`,'Hoea tō Waka Ā Ē Ī Ō Ū ā ē ī ō ū');return faces.length>0&&faces.every(f=>f.status==='loaded');},font.name);assert(loaded,font.name);}
  await page.getByRole('button',{name:'Open colours and typography',exact:true}).click();await page.getByRole('tab',{name:'Typography',exact:true}).click();assert.equal(await page.locator('#ap-font-display option').count(),12);await page.locator('#ap-font-display').selectOption('eb-garamond');await page.keyboard.press('Escape');
  await page.evaluate(()=>window.HoeaDesignStudio.choose('about/:1:header',126));await page.reload();await ready();assert.equal(await page.locator('.ds-type-header').getAttribute('data-design'),'126');assert.equal(await page.evaluate(()=>window.HoeaAppearance.getState().roles.display),'eb-garamond');
  await page.getByRole('button',{name:'Open design studio',exact:true}).click();await page.locator('.ds-picker').getByRole('button',{name:'Restore Draft 1',exact:true}).click();assert.equal(await page.locator('.ds-type-header').getAttribute('data-design'),String(baseline.effectiveChoices['about/:1:header']));assert.equal(await page.evaluate(()=>window.HoeaAppearance.getState().roles.display),'eb-garamond');
  await page.reload();await ready();assert.equal(await page.locator('.ds-type-header').getAttribute('data-design'),String(baseline.effectiveChoices['about/:1:header']));
  fs.mkdirSync('tmp/draft-1',{recursive:true});
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:8789/');await ready();await page.evaluate(async()=>{await document.fonts.ready;window.scrollTo(0,0);});await page.waitForTimeout(600);await page.screenshot({path:`tmp/draft-1/home-${width}.png`});await page.locator('.ds-handoff').scrollIntoViewIfNeeded();await page.waitForTimeout(600);await page.screenshot({path:`tmp/draft-1/footer-${width}.png`});}
  // A returning browser starts the new baseline, migrates removed font choices, and
  // keeps the old playground state intact for recovery.
  const returning=await browser.newContext();await returning.addInitScript(()=>{localStorage.setItem('hoea-design-studio-v1',JSON.stringify({navbar:5,'home:1:hero':50}));localStorage.setItem('hoea-appearance-v1',JSON.stringify({palette:'tidal-bloom',pairing:'custom',roles:{display:'outfit',body:'dm-sans'}}));});const other=await returning.newPage();await other.goto('http://127.0.0.1:8789/');await other.waitForFunction(()=>window.HoeaDesignStudio?.draft);assert.equal(await other.evaluate(()=>window.HoeaDesignStudio.components.find(c=>c.type==='navbar').value),0);assert.equal(await other.evaluate(()=>window.HoeaAppearance.getState().roles.display),'instrument-serif');assert.equal(await other.evaluate(()=>JSON.parse(localStorage.getItem('hoea-design-studio-v1')).navbar),5);
  assert.deepEqual(errors,[]);console.log('PASS: exact Draft1 baseline across10 routes,53 exported choices/14 palettes,20 loaded fonts,20 pairings,editable persistence,restore without font reset,old-browser migration and screenshots.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
