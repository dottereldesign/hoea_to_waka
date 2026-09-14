const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const serve=require('./preview.cjs');

const folder='tmp/catalog';
fs.mkdirSync(folder,{recursive:true});
const ports={catalog:8786};
const routes={hero:'',header:'about/',features:'',contact:'contact/'};
const labels={hero:'Hero Sections',header:'Header Sections',features:'Feature Sections',contact:'Contact Sections'};
const privateName='CATALOG PRIVATE INPUT';

(async()=>{
  const server=serve(ports.catalog);
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const errors=[],violations=[],checks=[],screenshots=[];
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    const base=`http://127.0.0.1:${ports.catalog}/hoea_to_waka/`;
    const ready=()=>page.waitForFunction(()=>window.HoeaDesignStudio?.version===3&&window.HoeaDesignStudio.purposeLayouts?.length===100,null,{timeout:15000});
    const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const goto=async route=>{await page.goto(base+route);await ready();await page.evaluate(()=>document.fonts.ready);await settle();};
    const keyFor=type=>page.evaluate(type=>window.HoeaDesignStudio.components.find(c=>c.type===type)?.key,type);
    const choose=async(key,id)=>{await page.evaluate(({key,id})=>window.HoeaDesignStudio.choose(key,id),{key,id});await settle();};
    const selected=key=>page.evaluate(key=>window.HoeaDesignStudio.components.find(c=>c.key===key)?.value,key);
    const openComponent=async key=>{
      await page.evaluate(key=>window.HoeaDesignStudio.components.find(c=>c.key===key).el.scrollIntoView({block:'start'}),key);
      await settle();
      await page.locator(`.ds-switcher[data-component-key="${key}"] .ds-badge`).click();
      await page.locator('.ds-picker').waitFor({state:'visible'});
    };
    const axe=async(selector,note)=>{
      await settle();
      const report=await new AxeBuilder({page}).include(selector).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      violations.push(...report.violations.map(violation=>({note,...violation})));
    };

    await goto('about/');
    const layouts=await page.evaluate(()=>window.HoeaDesignStudio.purposeLayouts);
    assert.equal(layouts.length,100);
    assert.equal(new Set(layouts.map(layout=>layout.id)).size,100,'Every added layout has a unique stable ID.');
    assert.deepEqual([...new Set(layouts.map(layout=>layout.type))].sort(),['contact','features','header','hero']);
    const byType=Object.fromEntries(Object.keys(routes).map(type=>[type,layouts.filter(layout=>layout.type===type)]));
    for(const [type,entries] of Object.entries(byType)){
      assert.equal(entries.length,25,`${type} has25 new layouts`);
      assert.equal(new Set(entries.map(layout=>layout.name)).size,25,`${type} has descriptive unique names`);
      assert(entries.every(layout=>Number.isInteger(layout.id)&&layout.id>50&&layout.name&&layout.group&&layout.description));
    }
    checks.push('100 unique category-bound additions, with25 per category');

    // The global menu leads to the current page's real header instance.
    const headerKey=await keyFor('header');
    await page.getByRole('button',{name:'Open design studio',exact:true}).click();
    await page.locator('.ds-category-grid').getByRole('button',{name:/^Header Sections/}).click();
    await page.locator('.ds-category-targets').getByRole('button').first().click();
    assert.equal(await page.locator('.ds-category-context h3').innerText(),labels.header);
    assert.equal(await page.locator('.ds-picker .ds-choice:visible').count(),26);
    assert.equal(await page.locator('.ds-earlier .ds-choice').count(),50);
    assert.equal(await page.locator('.ds-earlier').evaluate(element=>element.open),false);
    const headerOptions=await page.evaluate(key=>window.HoeaDesignStudio.options(key),headerKey);
    assert.deepEqual(headerOptions.map(option=>option.id),[0,...byType.header.map(layout=>layout.id)]);
    const group=byType.header[0].group;
    await page.getByRole('group',{name:'Layout purpose',exact:true}).getByRole('button',{name:group,exact:true}).click();
    assert.equal(await page.locator('.ds-picker .ds-choice:visible').count(),byType.header.filter(layout=>layout.group===group).length);
    await page.getByRole('group',{name:'Layout purpose',exact:true}).getByRole('button',{name:'All',exact:true}).click();
    await page.getByRole('searchbox',{name:'Search designs',exact:true}).fill(byType.header[0].name);
    assert.equal(await page.locator(`.ds-choice[data-layout-id="${byType.header[0].id}"]:visible`).count(),1);
    const matches=await page.locator('.ds-picker .ds-choice:visible').evaluateAll(choices=>choices.map(choice=>choice.innerText+' '+choice.title));
    assert(matches.every(text=>text.toLowerCase().includes(byType.header[0].name.toLowerCase())));
    await page.getByRole('searchbox',{name:'Search designs',exact:true}).fill('zzzz-no-layout-matches-zzzz');
    assert.equal(await page.locator('.ds-picker .ds-choice:visible').count(),0);
    await page.getByRole('searchbox',{name:'Search designs',exact:true}).fill('');
    assert.equal(await page.locator('.ds-picker .ds-choice:visible').count(),26);
    await axe('.ds-picker','desktop category picker');
    await page.locator('.ds-earlier summary').click();
    await page.locator('.ds-choice[data-layout-id="19"]').click();
    await page.keyboard.press('Escape');
    assert.equal(await selected(headerKey),19);
    await page.reload();await ready();
    assert.equal(await selected(headerKey),19,'A previously saved legacy header still restores.');
    checks.push('category directory,26 visible choices,50 archived choices, filters, search and legacy restoration');

    // Pin a component through its real menu, then move between new layouts.
    await openComponent(headerKey);
    await page.locator('.ds-component-colours summary').click();
    await page.getByRole('group',{name:'Component colour scheme',exact:true}).getByRole('button',{name:'Moss & Mulberry',exact:true}).click();
    await page.keyboard.press('Escape');
    const headerPalette=()=>page.evaluate(key=>window.HoeaDesignStudio.components.find(c=>c.key===key).el.dataset.componentPalette,headerKey);
    await choose(headerKey,byType.header[0].id);
    assert.equal(await headerPalette(),'moss-mulberry');
    await page.evaluate(()=>window.HoeaAppearance.setPalette('plum-sorbet'));
    await choose(headerKey,byType.header.at(-1).id);
    assert.equal(await headerPalette(),'moss-mulberry');
    await page.evaluate(key=>window.HoeaDesignStudio.components.find(c=>c.key===key).el.scrollIntoView({block:'start'}),headerKey);await settle();
    const headerSwitcher=page.locator(`.ds-switcher[data-component-key="${headerKey}"]`);
    await headerSwitcher.locator('[data-step="1"]').click();assert.equal(await selected(headerKey),0);
    await headerSwitcher.locator('[data-step="1"]').click();assert.equal(await selected(headerKey),byType.header[0].id);
    await headerSwitcher.locator('[data-step="-1"]').click();assert.equal(await selected(headerKey),0);
    await headerSwitcher.locator('[data-step="-1"]').click();assert.equal(await selected(headerKey),byType.header.at(-1).id);
    assert.equal(await headerPalette(),'moss-mulberry');
    const beforeInvalid=await selected(headerKey);
    for(const id of [byType.hero[0].id,byType.features[0].id,byType.contact[0].id,51,-1,999])await choose(headerKey,id);
    assert.equal(await selected(headerKey),beforeInvalid,'A component rejects layouts from another category.');
    checks.push('curated arrow wraparound, independent component colour and wrong-category rejection');

    const keys={header:headerKey};
    const htmlByType={};
    // Render every new layout on its real page, preserving the live contact form.
    for(const [type,entries] of Object.entries(byType)){
      await goto(routes[type]);
      const key=keys[type]=await keyFor(type);assert(key,`A real ${type} target exists on its route.`);
      if(type==='contact'){
        await page.getByLabel('Name',{exact:true}).fill(privateName);
        await page.getByLabel('Email',{exact:true}).fill('catalog-private@example.test');
        await page.getByLabel('How can Anna help?').fill('Preserve this enquiry while choosing a useful form layout.');
      }
      const signatures=[];
      for(const layout of entries){
        await choose(key,layout.id);
        assert.equal(await selected(key),layout.id);
        const state=await page.evaluate(key=>{
          const c=window.HoeaDesignStudio.components.find(c=>c.key===key);
          return {type:c.type,html:c.el.innerHTML,headings:c.el.querySelectorAll('h1').length,pageHeadings:document.querySelectorAll('h1').length,text:c.el.innerText,forms:c.el.querySelectorAll('[data-contact-form]').length};
        },key);
        assert.equal(state.type,type);
        assert(state.text.trim().length>20,`${type} ${layout.id} renders meaningful content.`);
        assert.equal(state.pageHeadings,1,`${type} ${layout.id} keeps one page h1.`);
        assert.equal(state.headings,['hero','header'].includes(type)?1:0,`${type} ${layout.id} uses the right heading level.`);
        if(type==='contact'){
          assert.equal(state.forms,1);
          assert.equal(await page.getByLabel('Name',{exact:true}).inputValue(),privateName);
          assert.equal(await page.getByLabel('Email',{exact:true}).inputValue(),'catalog-private@example.test');
        }
        signatures.push(state.html);
      }
      htmlByType[type]=new Set(signatures).size;
      assert.equal(htmlByType[type],25,`${type} produces25 distinct renderings.`);
    }
    checks.push('all100 layouts render real content with correct heading hierarchy; all25 contact layouts preserve entered data');

    // Choose one nested field treatment, then export through the footer action.
    await choose(keys.contact,byType.contact[0].id);
    await page.getByLabel('Name',{exact:true}).scrollIntoViewIfNeeded();await settle();
    const fieldSwitcher=page.locator('.ds-switcher').filter({has:page.getByRole('button',{name:'Change field design',exact:true})}).first();
    const fieldKey=await fieldSwitcher.getAttribute('data-component-key');assert(fieldKey);
    await fieldSwitcher.locator('.ds-badge').click();
    await page.locator('.ds-choice[data-layout-id="1"]').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#contact-name').evaluate(input=>input.closest('.field').dataset.atomVariant),'1');
    const downloadPromise=page.waitForEvent('download');
    await page.getByRole('button',{name:'Export my design choices',exact:true}).click();
    const download=await downloadPromise;const exportPath=`${folder}/catalog-design-handoff.json`;
    await download.saveAs(exportPath);
    const handoff=JSON.parse(fs.readFileSync(exportPath,'utf8'));
    assert.equal(handoff.schemaVersion,3);assert.equal(handoff.studioVersion,3);
    const selections=handoff.pages.flatMap(route=>route.components);
    for(const [type,key] of Object.entries(keys)){
      const item=selections.find(selection=>selection.key===key);assert(item,`Export includes ${key}.`);
      const expected=type==='contact'?byType[type][0]:byType[type].at(-1);
      assert.equal(item.category,labels[type]);assert.equal(item.design.id,expected.id);
      assert.equal(item.design.name,expected.name);assert.equal(item.design.purpose,expected.group);
    }
    assert.equal(handoff.effectiveColourOverrides[headerKey],'moss-mulberry');
    assert.equal(handoff.effectiveChoices[fieldKey],1);
    assert(selections.find(selection=>selection.key===keys.contact).details.some(detail=>detail.key===fieldKey&&detail.design.id===1));
    assert(!JSON.stringify(handoff).includes(privateName));assert(!JSON.stringify(handoff).includes('catalog-private@'));
    assert(!('typography' in handoff));
    checks.push('schema3 handoff includes category/name/purpose/ID, nested choice and pinned palette; excludes form values');

    // Every new composition fits desktop and narrow mobile widths. Five samples
    // per category are captured at every width for local visual inspection.
    const samples=new Set([0,6,12,18,24]);
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:1000});
      for(const [type,entries] of Object.entries(byType)){
        await goto(routes[type]);const key=await keyFor(type);
        for(let index=0;index<entries.length;index++){
          const layout=entries[index];await choose(key,layout.id);
          await page.evaluate(key=>window.HoeaDesignStudio.components.find(c=>c.key===key).el.scrollIntoView({block:'start'}),key);await settle();
          const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
          assert(overflow<=2,`${type} ${layout.id} overflows ${width}px viewport by ${overflow}px.`);
          if(samples.has(index)){
            const path=`${folder}/${type}-${layout.id}-${width}.png`;
            await page.screenshot({path});screenshots.push(path);
          }
        }
        if(['header','features','contact'].includes(type)&&[1440,390].includes(width)){
          await choose(key,entries[0].id);await axe(`.ds-type-${type}[data-design="${entries[0].id}"]`,`${type} ${width}px`);
        }
      }
      await goto('about/');await openComponent(await keyFor('header'));
      assert.equal(await page.locator('.ds-picker .ds-choice:visible').count(),26);
      assert.equal(await page.locator('.ds-picker').evaluate(element=>element.scrollWidth>element.clientWidth+2),false);
      const pickerPath=`${folder}/picker-${width}.png`;await page.screenshot({path:pickerPath});screenshots.push(pickerPath);
      if(width===390)await axe('.ds-picker','mobile category picker');
      await page.keyboard.press('Escape');
    }
    checks.push('all100 layouts fit1440px/390px/320px;60 representative layout screenshots and3 picker screenshots');
    fs.writeFileSync(`${folder}/verification.json`,JSON.stringify({checks,distinctRenderings:htmlByType,screenshots,errors,violations},null,2));
    assert.deepEqual(errors,[],'No browser JavaScript errors.');
    assert.deepEqual(violations,[],'New layouts and component picker pass focused accessibility checks.');
    console.log('PASS: '+checks.join('; ')+'.');
  }finally{
    fs.writeFileSync(`${folder}/last-run.json`,JSON.stringify({checks,screenshots,errors,violations},null,2));
    await browser.close();server.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
