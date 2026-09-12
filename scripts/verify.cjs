const {chromium}=require('playwright');
const fs=require('fs');
const assert=require('assert/strict');
const serve=require('./preview.cjs');
const routes=['','about/','services/','services/in-house-workshops/','services/resilience-one-on-one/','services/workshops-for-support-professionals/','resources/','contact/','illustrations/','404.html'];
(async()=>{
  fs.mkdirSync('tmp/design-studio',{recursive:true});
  const server=serve();const browser=await chromium.launch({channel:'chrome',headless:true});
  const failures=[],results=[];
  try{
    for(const width of [1440,390]){
      const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
      const page=await context.newPage();
      page.on('pageerror',e=>failures.push(`JS: ${e.message}`));
      for(const route of routes){
        await page.goto(`http://127.0.0.1:8766/hoea_to_waka/${route}?design=0`);
        await page.waitForFunction(()=>window.HoeaDesignStudio);
        const sourceText=await page.locator('main').innerText();
        for(let variation=0;variation<=5;variation++){
          await page.evaluate(v=>window.HoeaDesignStudio.all(v),variation);
          await page.waitForTimeout(70);
          const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+2,h1:document.querySelectorAll('h1').length,empty:[...document.querySelectorAll('.ds-title,h3')].filter(e=>!e.textContent.trim()).length,components:window.HoeaDesignStudio.components.map(c=>({type:c.type,value:c.value,items:c.data.items.length})),broken:[...document.querySelectorAll('img')].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));
          if(state.overflow)failures.push(`${width} ${route||'home'} v${variation}: horizontal overflow`);
          if(state.h1!==1)failures.push(`${width} ${route||'home'} v${variation}: ${state.h1} h1 headings`);
          if(state.empty)failures.push(`${width} ${route||'home'} v${variation}: empty headings`);
          if(state.broken.length)failures.push(`${width} ${route||'home'} v${variation}: broken images ${state.broken}`);
          results.push({width,route,variation,...state});
          if((route===''||route==='contact/'||route==='resources/')&&variation>0){
            await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));for(let y=0;y<document.body.scrollHeight;y+=800){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,15));}window.scrollTo(0,0);});
            await page.screenshot({path:`tmp/design-studio/${route.replaceAll('/','')||'home'}-${width}-v${variation}.png`,fullPage:true});
          }
        }
        await page.evaluate(()=>window.HoeaDesignStudio.all(0));
        await page.waitForTimeout(100);
        const restoredText=await page.locator('main').innerText();
        assert.equal(restoredText,sourceText,`${route} original text preserved`);
        console.log(`${width} ${route||'home'}: all 6 views rendered`);
      }
      await context.close();
    }
    fs.writeFileSync('tmp/design-studio/verification.json',JSON.stringify({results,failures},null,2));
    console.log('Failures:',JSON.stringify([...new Set(failures)],null,2));
    if(failures.length)process.exitCode=1;
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
