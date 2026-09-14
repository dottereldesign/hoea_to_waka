const {chromium}=require('playwright');const {default:AxeBuilder}=require('@axe-core/playwright');const fs=require('node:fs');const serve=require('./preview.cjs');
(async()=>{const server=serve(8772),browser=await chromium.launch({channel:'chrome',headless:true});const failures=[];try{
  const context=await browser.newContext({viewport:{width:1024,height:1000},reducedMotion:'reduce'});const page=await context.newPage();
  for(const route of ['','contact/','resources/']){
    await page.goto(`http://127.0.0.1:8772/hoea_to_waka/${route}`);await page.waitForFunction(()=>window.HoeaDesignStudio?.version>=2);
    for(let v=6;v<=50;v++){
      await page.evaluate(v=>window.HoeaDesignStudio.all(v),v);
      const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      for(const issue of report.violations)failures.push({route,v,rule:issue.id,nodes:issue.nodes.map(n=>({target:n.target,summary:n.failureSummary}))});
      if((v-5)%5===0)console.log(`${route||'home'} checked through ${v}`);
      fs.writeFileSync('tmp/design-studio/expanded/accessibility.json',JSON.stringify(failures,null,2));
    }
  }
  await page.goto('http://127.0.0.1:8772/hoea_to_waka/');await page.waitForFunction(()=>window.HoeaDesignStudio?.version>=2);await page.getByRole('button',{name:'Open design studio',exact:true}).click();
  const picker=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();for(const issue of picker.violations)failures.push({picker:true,rule:issue.id,nodes:issue.nodes.map(n=>n.failureSummary)});
  fs.writeFileSync('tmp/design-studio/expanded/accessibility.json',JSON.stringify(failures,null,2));console.log(JSON.stringify({pageScans:135,pickerScans:1,failures:failures.length}));if(failures.length)process.exitCode=1;
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
