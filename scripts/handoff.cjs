const {chromium}=require('playwright');const {default:AxeBuilder}=require('@axe-core/playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const serve=require('./preview.cjs');
const folder='tmp/handoff';fs.mkdirSync(folder,{recursive:true});
(async()=>{const server=serve(8782),browser=await chromium.launch({channel:'chrome',headless:true});const errors=[];try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:8782/hoea_to_waka/';
  const ready=()=>page.waitForFunction(()=>window.HoeaDesignStudio?.export);
  await page.goto(base);await ready();
  const hero=page.locator('.ds-switcher[data-component-key="home:1:hero"]');
  const neighbours=await page.evaluate(()=>window.HoeaDesignStudio.components.filter(c=>c.type!=='hero').map(c=>c.value));
  await hero.getByRole('button',{name:'Next Homepage hero design',exact:true}).click();assert.equal(await page.locator('.ds-type-hero').getAttribute('data-design'),'2');assert.equal(await page.locator('.ds-picker').evaluate(d=>d.open),false);
  assert.deepEqual(await page.evaluate(()=>window.HoeaDesignStudio.components.filter(c=>c.type!=='hero').map(c=>c.value)),neighbours);
  await page.evaluate(()=>window.HoeaDesignStudio.choose('home:1:hero',50));await hero.getByRole('button',{name:'Next Homepage hero design',exact:true}).click();assert.equal(await page.locator('.home-hero').count(),1);
  await hero.getByRole('button',{name:'Previous Homepage hero design',exact:true}).click();assert.equal(await page.locator('.ds-type-hero').getAttribute('data-design'),'50');
  assert.equal(await hero.locator('[data-step="-1"]').evaluate(el=>document.activeElement===el),true);
  await hero.getByRole('button',{name:'Change Homepage hero design',exact:true}).click();assert.equal(await page.locator('.ds-picker .ds-choice').count(),51);await page.keyboard.press('Escape');
  await page.evaluate(()=>{window.HoeaDesignStudio.choose('home:1:hero',4);window.HoeaDesignStudio.choose('navbar',3);window.HoeaDesignStudio.choose('footer',5);window.HoeaAppearance.setPalette('moss-mulberry');window.HoeaAppearance.setMode('dark');});
  // Footer action survives every composition, including preserved Original.
  for(let v=0;v<=50;v++){await page.evaluate(v=>window.HoeaDesignStudio.choose('footer',v),v);assert.equal(await page.locator('footer .ds-handoff-button').count(),1);}
  await page.evaluate(()=>window.HoeaDesignStudio.choose('footer',5));
  await page.goto(base+'contact/');await ready();
  await page.getByLabel('Name',{exact:true}).fill('PRIVATE INPUT MUST NOT EXPORT');await page.getByLabel('Email',{exact:true}).fill('private-input@example.test');
  const contactKey=await page.evaluate(()=>window.HoeaDesignStudio.components.find(c=>c.type==='contact').key);
  await page.evaluate(key=>window.HoeaDesignStudio.choose(key,6),contactKey);
  await page.getByLabel('Name',{exact:true}).scrollIntoViewIfNeeded();await page.waitForTimeout(100);
  const field=page.locator('.ds-switcher').filter({has:page.getByRole('button',{name:'Next field design',exact:true})}).first();const fieldKey=await field.getAttribute('data-component-key');
  await field.getByRole('button',{name:'Next field design',exact:true}).click();assert.equal(await page.locator('#contact-name').evaluate(el=>el.closest('.field').dataset.atomVariant),'1');
  await field.getByRole('button',{name:'Previous field design',exact:true}).click();await field.getByRole('button',{name:'Previous field design',exact:true}).click();assert.equal(await page.locator('#contact-name').evaluate(el=>el.closest('.field').dataset.atomVariant),'50');
  assert.equal(await page.getByLabel('Name',{exact:true}).inputValue(),'PRIVATE INPUT MUST NOT EXPORT');
  await page.evaluate(key=>window.HoeaDesignStudio.choose(key,7),contactKey);
  await page.getByLabel('Name',{exact:true}).scrollIntoViewIfNeeded();await page.waitForTimeout(100);await page.getByRole('button',{name:'Next field design',exact:true}).first().click();
  await page.evaluate(key=>window.HoeaDesignStudio.choose(key,6),contactKey);
  assert.equal(await page.locator('#contact-name').evaluate(el=>el.closest('.field').dataset.atomVariant),'50');
  // Different open pages must not overwrite each other's choices when saving.
  const other=await context.newPage();await other.goto(base+'about/');await other.waitForFunction(()=>window.HoeaDesignStudio?.export);const aboutKey=await other.evaluate(()=>window.HoeaDesignStudio.components.find(c=>c.type==='header').key);await other.evaluate(key=>window.HoeaDesignStudio.choose(key,19),aboutKey);
  await page.evaluate(key=>window.HoeaDesignStudio.choose(key,6),contactKey);
  await page.goto(base+'resources/');await ready();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export my design choices',exact:true}).click();const download=await downloadPromise;await download.saveAs(`${folder}/example-client-design.json`);const data=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  assert.equal(data.format,'hoea-to-waka/client-design-handoff');assert.equal(data.pages.length,10);assert.equal(data.colour.id,'moss-mulberry');assert.equal(data.colour.mode,'dark');assert.equal(data.effectiveChoices['home:1:hero'],4);assert.equal(data.effectiveChoices[aboutKey],19);assert.equal(data.effectiveChoices[contactKey],6);assert.equal(data.effectiveChoices[fieldKey],50);
  assert(!Object.keys(data.effectiveChoices).some(k=>k.startsWith(`${contactKey}:v7:`)));assert.equal(data.effectiveChoices.navbar,3);assert.equal(data.effectiveChoices.footer,5);
  assert(!JSON.stringify(data).includes('PRIVATE INPUT'));assert(!JSON.stringify(data).includes('private-input@'));assert(!('typography' in data));assert(!('appearance' in data));assert(data.summary.components>50);
  assert.equal(data.pages.find(p=>p.path==='contact/').components.find(c=>c.key===contactKey).details.find(d=>d.key===fieldKey).label,'Name');
  // Verify the exported manifest matches actual studio keys on every route.
  for(const exported of data.pages){await page.goto(base+(exported.path==='/'?'':exported.path));await ready();const keys=await page.evaluate(()=>window.HoeaDesignStudio.components.filter(c=>!['navbar','footer'].includes(c.type)).map(c=>c.key));assert.deepEqual(exported.components.map(c=>c.key),keys);}
  console.log(`PASS: arrows, wraparound, focus, 51 footer mounts, nested choices, private-input exclusion and ${data.summary.components} exported components across 10 verified routes.`);
  // Failure must not produce an incomplete handoff or leave the action disabled.
  await page.goto(base);await ready();
  await page.route('**/about/',r=>r.fulfill({status:503,body:'Unavailable'}));assert.equal(await page.evaluate(()=>window.HoeaDesignStudio.export()),null);assert.equal(await page.locator('.ds-handoff-button').isDisabled(),false);await page.unroute('**/about/');
  const violations=[];
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:1000});await page.goto(base+'?design=1');await ready();await page.evaluate(()=>window.HoeaAppearance.reset());await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:`${folder}/arrows-${width}.png`});
    const out=await page.locator('.ds-switcher:visible').evaluateAll(groups=>groups.filter(g=>{const r=g.getBoundingClientRect();return r.x<0||r.right>innerWidth+1||r.bottom>innerHeight+1}).length);assert.equal(out,0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
    await page.locator('footer .ds-handoff').scrollIntoViewIfNeeded();await page.screenshot({path:`${folder}/footer-${width}.png`});
    const report=await new AxeBuilder({page}).include('.ds-switcher').include('.ds-handoff').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();violations.push(...report.violations);
  }
  fs.writeFileSync(`${folder}/verification.json`,JSON.stringify({components:data.summary.components,nestedOverrides:data.summary.nestedOverrides,errors,violations},null,2));assert.deepEqual(errors,[]);assert.deepEqual(violations,[]);console.log('PASS: failed-export recovery; responsive arrows/footer; accessible controls.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
