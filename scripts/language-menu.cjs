const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs');
(async()=>{
 const server=require('./preview.cjs')(8923),browser=await chromium.launch({channel:'chrome'});
 fs.mkdirSync('tmp/language-menu',{recursive:true});
 try{
  for(const width of [1440,1100,768,760,390,320]){
   const context=await browser.newContext({viewport:{width,height:width<=390?640:900}}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8923/hoea_to_waka/');
   await page.waitForSelector('.language-launch');
   assert.equal(await page.locator('.header-motion-lab,[data-header-motion-choice]').count(),0);
   await page.locator('.language-launch').click();
   await page.waitForTimeout(600);
   assert.equal(await page.locator('.language-panel a').count(),10);
   assert.equal(await page.locator('.language-launch').getAttribute('aria-expanded'),'true');
   const bounds=await page.locator('.language-panel').boundingBox();
   assert(bounds.x>=0&&bounds.x+bounds.width<=width+.5);
   assert(bounds.y>=0&&bounds.y+bounds.height<=(width<=390?640:900)+.5);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const links=await page.locator('.language-panel a').evaluateAll(xs=>xs.map(x=>({code:x.dataset.language,href:x.href})));
   for(const link of links.filter(x=>x.code!=='en')){const url=new URL(link.href);assert.equal(url.hostname,'translate.google.com');assert.equal(url.searchParams.get('tl'),link.code);assert.equal(url.searchParams.get('u'),'https://dottereldesign.github.io/hoea_to_waka/');}
   await page.keyboard.press('End');
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.language),'af');
   await page.waitForTimeout(100);const last=await page.locator('[data-language=af]').boundingBox();assert(last.y+last.height<=bounds.y+bounds.height-63,'Last language clears close-button footer');
   await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.language),'mi');
   await page.locator('.language-panel').screenshot({path:`tmp/language-menu/open-${width}.png`});
   await page.keyboard.press('Escape');await page.waitForTimeout(600);
   assert.equal(await page.locator('.language-panel').evaluate(x=>x.matches(':popover-open')),false);
   assert.equal(await page.evaluate(()=>document.activeElement.className),'language-launch');
   await page.locator('.language-launch').click();await page.waitForTimeout(100);
   await page.locator('.language-close').click();await page.waitForTimeout(600);
   assert.equal(await page.locator('.language-panel').evaluate(x=>x.matches(':popover-open')),false);
   await page.locator('.language-launch').click();await page.waitForTimeout(600);
   await page.mouse.click(width-10,100);await page.waitForTimeout(600);
   assert.equal(await page.locator('.language-panel').evaluate(x=>x.matches(':popover-open')),false);
   assert.deepEqual(errors,[]);await context.close();console.log('PASS morph, reverse, keyboard, links, outside click, fit',width);
  }
  const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();
  await page.goto('http://127.0.0.1:8923/about/');await page.locator('.language-launch').click();await page.waitForTimeout(100);
  const axe=await new(require('@axe-core/playwright').default)({page}).include('.language-panel').include('.language-launch').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations,[]);
  await page.keyboard.press('Escape');await page.waitForTimeout(50);assert.equal(await page.locator('.language-launch').getAttribute('aria-expanded'),'false');
  await context.close();console.log('PASS reduced motion and accessibility');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
