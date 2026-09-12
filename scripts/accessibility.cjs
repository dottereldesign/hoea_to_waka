const {chromium}=require('playwright');const {default:AxeBuilder}=require('@axe-core/playwright');const serve=require('./preview.cjs');const fs=require('fs');
(async()=>{const server=serve(8768);const browser=await chromium.launch({channel:'chrome',headless:true});const failures=[];try{
  const context=await browser.newContext({reducedMotion:'reduce'});const page=await context.newPage();
  for(const width of [320,768,1024]){
    await page.setViewportSize({width,height:1000});
    for(const route of ['','contact/','resources/']){
      await page.goto(`http://127.0.0.1:8768/hoea_to_waka/${route}`);await page.waitForFunction(()=>window.HoeaDesignStudio);
      for(let v=1;v<=5;v++){
        await page.evaluate(v=>window.HoeaDesignStudio.all(v),v);await page.waitForTimeout(40);
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);if(overflow)failures.push({width,route,v,error:'horizontal overflow'});
        if(width===1024){const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();for(const violation of result.violations)failures.push({width,route,v,rule:violation.id,nodes:violation.nodes.map(n=>({html:n.html,summary:n.failureSummary}))});}
      }
    }
    console.log(`Checked ${width}px`);
  }
  fs.writeFileSync('tmp/design-studio/accessibility.json',JSON.stringify(failures,null,2));console.log(JSON.stringify(failures,null,2));if(failures.length)process.exitCode=1;
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
