const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');const serve=require('./preview.cjs');
const folder='tmp/themes';fs.mkdirSync(folder,{recursive:true});
(async()=>{
  const {palettes,fonts,pairings,roles,semanticTokens,contrast}=await import('../design/theme-data.mjs');
  for(const palette of palettes)for(const dark of [false,true]){
    const t=semanticTokens(palette,dark);
    for(const [fg,bg] of [['ink','bg'],['ink','surface'],['muted','bg'],['muted','surface'],['on-action','action'],['on-accent','accent'],['on-highlight','highlight'],['on-inverse','inverse']])assert(contrast(t[fg],t[bg])>=4.5,`${palette.id} ${dark} ${fg}/${bg}: ${contrast(t[fg],t[bg])}`);
  }
  const server=serve(8776),browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],failures=[];let combinations=0;
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    await page.goto('http://127.0.0.1:8776/hoea_to_waka/');await page.waitForFunction(()=>window.HoeaDesignStudio&&window.HoeaAppearance);await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.evaluate(()=>window.HoeaDesignStudio.directions.length),51);
    // Every palette x every complete composition x both modes. Force actual computed styles.
    for(const palette of palettes){
      const result=await page.evaluate(({id})=>{
        const issues=[];window.HoeaAppearance.setPalette(id);
        for(const mode of ['light','dark']){window.HoeaAppearance.setMode(mode);for(let v=0;v<=50;v++){
          window.HoeaDesignStudio.all(v);
          if(document.documentElement.scrollWidth>innerWidth+2)issues.push({mode,v,issue:'horizontal overflow'});
          if(document.querySelectorAll('h1').length!==1)issues.push({mode,v,issue:'heading missing'});
          for(const c of window.HoeaDesignStudio.components){
            const style=getComputedStyle(c.el);if(style.fontFamily!=='Manrope, sans-serif')issues.push({mode,v,type:c.type,issue:'body font disconnected',font:style.fontFamily});
            // Utility wrappers are deliberately transparent around their painted trigger/panel.
            if(v>0&&(!style.getPropertyValue('--ds-bg').trim()||(c.type!=='utility'&&style.backgroundColor==='rgba(0, 0, 0, 0)')))issues.push({mode,v,type:c.type,issue:'missing theme surface'});
          }
        }}return issues;
      },palette);
      failures.push(...result.map(r=>({palette:palette.id,...r})));combinations+=102;console.log(`${palette.name}: 102 layout/mode combinations`);
      fs.writeFileSync(`${folder}/matrix.json`,JSON.stringify({combinations,failures},null,2));
    }
    // Mixed layouts must stay mixed while changing shared settings.
    await page.evaluate(()=>{const s=window.HoeaDesignStudio;s.components.forEach((c,i)=>s.choose(c.key,(i*7)%51));window.HoeaAppearance.setPalette('aubergine-garden');window.HoeaAppearance.setMode('light');});
    const mixed=await page.evaluate(()=>window.HoeaDesignStudio.components.map(c=>c.value));
    for(const pairing of pairings){await page.evaluate(id=>window.HoeaAppearance.setPairing(id),pairing.id);await page.evaluate(()=>document.fonts.ready);assert.deepEqual(await page.evaluate(()=>window.HoeaDesignStudio.components.map(c=>c.value)),mixed);}
    // Every family is really loadable, including macrons, rather than silently falling back.
    for(const font of fonts){assert(await page.evaluate(async name=>(await document.fonts.load(`500 20px "${name}"`,'Hoea tō Waka Ā Ē Ī Ō Ū ā ē ī ō ū')).length>0,font.name),`${font.name} did not load`);}
    await page.getByRole('button',{name:'Open colours and typography',exact:true}).click();
    assert.equal(await page.locator('.ap-palette').count(),10);await page.getByRole('tab',{name:'Typography',exact:true}).click();assert.equal(await page.locator('.ap-role select').count(),6);
    for(const role of roles)await page.locator(`#ap-font-${role.id}`).selectOption('space-grotesk');
    await page.keyboard.press('Escape');
    await page.goto('http://127.0.0.1:8776/hoea_to_waka/contact/');await page.waitForFunction(()=>window.HoeaDesignStudio);
    assert.equal(await page.evaluate(()=>window.HoeaAppearance.getState().palette),'aubergine-garden');
    assert((await page.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily)).includes('Space Grotesk'));
    await page.getByLabel('Name',{exact:true}).fill('Retain my enquiry');
    await page.evaluate(()=>window.HoeaDesignStudio.all(6));
    for(const palette of palettes){await page.evaluate(id=>window.HoeaAppearance.setPalette(id),palette.id);assert.equal(await page.getByLabel('Name',{exact:true}).inputValue(),'Retain my enquiry');}
    // Cycle every nested form variation against every palette, then verify field state.
    await page.locator('[data-contact-form]').scrollIntoViewIfNeeded();await page.waitForTimeout(100);
    await page.getByRole('button',{name:'Change form design',exact:true}).click();
    for(let v=0;v<=50;v++){
      await page.locator('.ds-picker .ds-choice').nth(v).click();
      assert(await page.evaluate(()=>window.HoeaAppearance.palettes.every(p=>{window.HoeaAppearance.setPalette(p.id);const form=document.querySelector('[data-contact-form]');return getComputedStyle(form).color&&form.querySelector('[name="name"]').value==='Retain my enquiry';})),`Nested form ${v} lost state`);
      if(v%10===0)console.log(`Nested forms checked through ${v}`);
    }
    await page.keyboard.press('Escape');await page.evaluate(()=>{window.HoeaAppearance.reset();window.HoeaDesignStudio.all(1);});
    // Desktop/mobile and representative complete-route checks under a second palette.
    for(const width of [1440,390,320,768]){
      await page.setViewportSize({width,height:1000});
      for(const route of ['','about/','services/','services/in-house-workshops/','services/resilience-one-on-one/','services/workshops-for-support-professionals/','resources/','contact/','illustrations/','404.html','about/brand-guidelines/','about/jamies-workspace/']){
        await page.goto(`http://127.0.0.1:8776/hoea_to_waka/${route}`);await page.waitForFunction(()=>window.HoeaAppearance);await page.evaluate(()=>window.HoeaAppearance.setPalette('terracotta-sky'));await page.evaluate(()=>document.fonts.ready);
        if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))failures.push({width,route,issue:'route overflow'});
      }
      await page.goto('http://127.0.0.1:8776/hoea_to_waka/');await page.waitForFunction(()=>window.HoeaDesignStudio);
      await page.screenshot({path:`${folder}/site-${width}.png`,fullPage:true});
      await page.getByRole('button',{name:'Open colours and typography',exact:true}).click();
      await page.screenshot({path:`${folder}/colours-${width}.png`});
      await page.getByRole('tab',{name:'Typography',exact:true}).click();await page.screenshot({path:`${folder}/type-${width}.png`});
      if(await page.locator('.ap-dialog').evaluate(el=>el.scrollWidth>el.clientWidth+2))failures.push({width,issue:'dialog overflow'});
      await page.keyboard.press('Escape');
    }
    await page.setViewportSize({width:1440,height:1000});
    // A11y samples cover all palettes in the actual controls and difficult inverse layouts.
    const a11y=[];
    for(const [index,palette] of palettes.entries()){
      await page.evaluate(({id,index})=>{window.HoeaAppearance.setPalette(id);window.HoeaAppearance.setMode(index%2?'dark':'light');window.HoeaDesignStudio.all([1,2,3,4,5,6,16,26,36,50][index]);},{id:palette.id,index});
      const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      for(const issue of report.violations)a11y.push({palette:palette.id,rule:issue.id,nodes:issue.nodes.map(n=>({target:n.target,summary:n.failureSummary}))});
      await page.getByRole('button',{name:'Open colours and typography',exact:true}).click();
      const dialog=await new AxeBuilder({page}).include('.ap-dialog').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      for(const issue of dialog.violations)a11y.push({palette:palette.id,dialog:true,rule:issue.id,nodes:issue.nodes.map(n=>({target:n.target,summary:n.failureSummary}))});
      await page.keyboard.press('Escape');
    }
    fs.writeFileSync(`${folder}/accessibility.json`,JSON.stringify(a11y,null,2));
    fs.writeFileSync(`${folder}/verification.json`,JSON.stringify({combinations,nestedFormCombinations:510,failures,errors,a11y},null,2));
    console.log(JSON.stringify({combinations,nestedFormCombinations:510,failures:failures.length,errors,a11y:a11y.length}));
    if(failures.length||errors.length||a11y.length)process.exitCode=1;
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
