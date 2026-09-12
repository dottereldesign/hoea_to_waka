const {chromium}=require('playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');const sharp=require('sharp');const serve=require('./preview.cjs');
const routes=['','about/','services/','services/in-house-workshops/','services/resilience-one-on-one/','services/workshops-for-support-professionals/','resources/','contact/','illustrations/','404.html'];
const folder='tmp/design-studio/expanded';fs.mkdirSync(folder,{recursive:true});
(async()=>{
  const server=serve(8770),browser=await chromium.launch({channel:'chrome',headless:true});
  const failures=[],results=[];
  try{
    for(const width of [1440,390,320,768]){
      const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
      page.on('pageerror',e=>failures.push({width,error:e.message}));
      // No application launches, even if future test cases exercise contact submission.
      await page.route('**/contact.js',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text()).replace('window.location.href =','window.__preparedMailto =')});});
      for(const route of width===320||width===768?['','contact/','resources/']:routes){
        await page.goto(`http://127.0.0.1:8770/hoea_to_waka/${route}?design=0`);
        await page.waitForFunction(()=>window.HoeaDesignStudio?.version===2);
        const original=await page.locator('main').innerText();
        if(route==='contact/')await page.getByLabel('Name',{exact:true}).fill('Preserve this across 51 designs');
        for(let v=6;v<=50;v++){
          await page.evaluate(v=>window.HoeaDesignStudio.all(v),v);
          await page.waitForTimeout(25);
          const state=await page.evaluate(()=>({
            overflow:document.documentElement.scrollWidth>innerWidth+2,
            h1:document.querySelectorAll('h1').length,
            empty:[...document.querySelectorAll('.ds-title,h3')].filter(e=>!e.textContent.trim()).length,
            values:window.HoeaDesignStudio.components.map(c=>c.value),
            broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),
            tinyFields:[...document.querySelectorAll('.ds-preserved-form input:not([type=checkbox]),.ds-preserved-form textarea')].filter(e=>e.getBoundingClientRect().width<140).map(e=>e.name),
          }));
          for(const [k,bad] of Object.entries({overflow:state.overflow,h1:state.h1!==1,empty:state.empty,wrongVariant:state.values.some(n=>n!==v),broken:state.broken.length,tinyFields:state.tinyFields.length}))if(bad)failures.push({width,route,v,error:k,state});
          if(route==='contact/')assert.equal(await page.getByLabel('Name',{exact:true}).inputValue(),'Preserve this across 51 designs');
          if(width===390&&route===''){
            await page.getByRole('button',{name:'Open navigation',exact:true}).click();
            if(!await page.locator('.ds-type-navbar .ds-nav-links').isVisible())failures.push({width,route,v,error:'mobile menu invisible'});
            await page.keyboard.press('Escape');
            if(await page.locator('.ds-type-navbar .ds-nav-links').isVisible())failures.push({width,route,v,error:'mobile menu did not close'});
          }
          results.push({width,route,v});
          if((width===1440||width===390)&&route===''){
            await page.evaluate(async()=>{window.scrollTo(0,0);await Promise.all([...document.querySelectorAll('.ds-type-hero img')].map(i=>i.decode().catch(()=>{})));});
            await page.screenshot({path:`${folder}/home-${width}-${v}.png`});
          }
          if((width===1440||width===390)&&['contact/','resources/'].includes(route)&&(v-6)%5===0){
            await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
            await page.screenshot({path:`${folder}/${route.replace('/','')}-${width}-${v}.png`,fullPage:true});
          }
        }
        await page.evaluate(()=>window.HoeaDesignStudio.all(0));
        assert.equal(await page.locator('main').innerText(),original,'Original content restored');
        console.log(`${width}px ${route||'home'}: 45 added variants checked; Original restored`);
      }
      await page.close();
    }
    for(let group=0;group<9;group++){
      const tiles=await Promise.all(Array.from({length:5},async(_,i)=>({input:await sharp(`${folder}/home-1440-${6+group*5+i}.png`).resize(360,250).toBuffer(),left:i*360,top:0})));
      await sharp({create:{width:1800,height:250,channels:3,background:'#ffffff'}}).composite(tiles).png().toFile(`${folder}/collection-${group+1}.png`);
    }
    fs.writeFileSync(`${folder}/report.json`,JSON.stringify({checks:results.length,failures},null,2));
    console.log(JSON.stringify({checks:results.length,failures},null,2));if(failures.length)process.exitCode=1;
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
