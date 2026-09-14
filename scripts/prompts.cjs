const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const serve=require('./preview.cjs');

(async()=>{
  const server=serve(8787),browser=await chromium.launch({channel:'chrome',headless:true});
  const errors=[];
  fs.mkdirSync('tmp/prompts',{recursive:true});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:8787/hoea_to_waka/prompts/');
    await page.waitForSelector('.prompt-card');await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('.prompt-card').count(),12);
    assert.equal(await page.locator('#prompt-categories button').count(),11);
    assert.match(await page.locator('#prompt-count').textContent(),/^100 ideas/);
    await page.screenshot({path:'tmp/prompts/desktop.png',fullPage:false});
    await page.getByRole('button',{name:'Copy prompt: The listening circle',exact:true}).click();
    const copied=await page.evaluate(()=>navigator.clipboard.readText());
    assert.match(copied,/small group of six adults/);assert.match(copied,/Output: one finished 16:9 image/);assert.match(copied,/Tidal Bloom/);
    await page.evaluate(()=>window.HoeaAppearance.setPalette('moss-mulberry'));
    await page.getByRole('button',{name:'Copy prompt: The listening circle',exact:true}).click();
    assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/Moss & Mulberry/);
    await page.getByRole('button',{name:'New Zealand reimagined 10',exact:true}).click();
    assert.equal(await page.locator('.prompt-card').count(),10);
    assert.equal(await page.locator('.prompt-card').first().getAttribute('data-prompt-id'),'IMG-031');
    await page.getByRole('button',{name:'All image ideas 100',exact:true}).click();
    await page.locator('#prompt-search').fill('braided');
    assert.equal(await page.locator('.prompt-card').count(),1);
    assert.equal(await page.locator('.prompt-card h2').textContent(),'A braided way forward');
    await page.locator('#prompt-search').fill('not-a-real-prompt-query');
    assert.equal(await page.locator('.prompt-card').count(),0);
    assert.equal(await page.locator('#prompt-empty').isVisible(),true);
    await page.getByRole('button',{name:'Show all ideas',exact:true}).click();
    while(await page.locator('#prompt-more').isVisible())await page.locator('#prompt-more').click();
    assert.equal(await page.locator('.prompt-card').count(),100);
    const prompts=await page.locator('.prompt-full-text').allTextContents();
    assert.equal(new Set(prompts).size,100);
    assert.ok(prompts.every(text=>text.length>1100&&/Art direction:/.test(text)&&/Output:/.test(text)));
    assert.ok(prompts.every(text=>!/Māori|Maori|tribal|indigenous pattern/i.test(text)));
    await page.getByRole('button',{name:'All image ideas 100',exact:true}).click();
    await page.evaluate(()=>window.scrollTo(0,0));
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:1000});
      for(const mode of ['light','dark']){
        await page.evaluate(mode=>window.HoeaAppearance.setMode(mode),mode);
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width}px ${mode}: horizontal overflow`);
        if(width!==320){
          const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
          fs.writeFileSync(`tmp/prompts/axe-${width}-${mode}.json`,JSON.stringify(result.violations,null,2));
          assert.deepEqual(result.violations.map(v=>v.id),[],`${width}px ${mode}: accessibility`);
        }
      }
      await page.screenshot({path:`tmp/prompts/${width}-dark.png`,fullPage:false});
    }
    await context.close();
    const fallbackContext=await browser.newContext({viewport:{width:390,height:844}});
    await fallbackContext.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:undefined}));
    const fallbackPage=await fallbackContext.newPage();
    await fallbackPage.goto('http://127.0.0.1:8787/hoea_to_waka/prompts/');
    await fallbackPage.getByRole('button',{name:'Copy prompt: The listening circle',exact:true}).click();
    assert.equal(await fallbackPage.locator('#prompt-copy-dialog').evaluate(el=>el.open),true);
    assert.match(await fallbackPage.locator('#prompt-copy-text').inputValue(),/small group of six adults/);
    assert.equal(await fallbackPage.locator('#prompt-copy-text').evaluate(el=>el.selectionStart===0&&el.selectionEnd===el.value.length),true);
    await fallbackPage.getByRole('button',{name:'Done',exact:true}).click();
    assert.equal(await fallbackPage.getByRole('button',{name:'Copy prompt: The listening circle',exact:true}).evaluate(el=>el===document.activeElement),true);
    assert.deepEqual(errors,[]);
    console.log('100 prompts verified: complete unique text, palette-aware clipboard, search, categories, progressive browsing, manual-copy fallback, mobile overflow and light/dark accessibility.');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
