const {chromium}=require('playwright'),assert=require('node:assert/strict'),Axe=require('@axe-core/playwright').default;
(async()=>{const server=require('./preview.cjs')(8894),browser=await chromium.launch({channel:'chrome'});try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8894/hoea_to_waka/concepts/');
 assert.equal(await page.locator('.concept-card').count(),28);
 for(const button of await page.locator('[data-copy]').all()){
  const id=await button.getAttribute('data-copy');await button.click();await page.waitForFunction(()=>!document.querySelector('.concept-copy:disabled'));
  assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n'),await page.locator('#'+id).inputValue());
 }
 await page.locator('[data-filter="roots"]').click();assert.equal(await page.locator('.concept-card:visible').count(),7);
 await page.locator('[data-kind-filter="concept"]').click();assert.equal(await page.locator('.concept-card:visible').count(),4);
 await page.locator('#concept-search').fill('no-such-concept');assert(await page.locator('#concept-empty').isVisible());
 await page.locator('#concept-reset').click();await page.locator('#concept-search').fill('shadow');assert(await page.locator('.concept-card:visible').count()>0);
 await page.locator('[data-show-concept="concept-9"]').click();assert(await page.locator('#concept-9').isVisible());
 await page.locator('#concept-library').scrollIntoViewIfNeeded();await page.screenshot({path:'tmp/concepts-cards.png'});
 const result=await new Axe({page}).include('.concepts-main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 console.log('Accessibility',result.violations.map(v=>({id:v.id,nodes:v.nodes.slice(0,3).map(n=>({target:n.target,summary:n.failureSummary}))})));assert.deepEqual(result.violations,[]);
 for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});await page.evaluate(()=>scrollTo(0,0));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`tmp/concepts-${width}.png`});}
 await page.evaluate(()=>{navigator.clipboard.writeText=()=>Promise.reject(new Error('Denied'));});
 await page.locator('[data-copy]').first().click();assert(await page.locator('.concept-prompt').first().getAttribute('open')!==null);assert((await page.locator('#concept-copy-status').textContent()).includes('selected'));
 const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8894/concepts/');assert.equal(await plain.locator('.concept-card').count(),28);await plain.locator('.concept-prompt summary').first().click();assert(await plain.locator('textarea').first().isVisible());
 assert.deepEqual(errors,[]);console.log('PASS all 28 copies, filters, search, deep links, clipboard fallback, responsive layout and no-JS prompts');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
