const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs');
(async()=>{const server=require('./preview.cjs')(8893),browser=await chromium.launch({channel:'chrome',headless:true});try{
fs.mkdirSync('tmp/typography-studies',{recursive:true});
const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const width of [1440,900,390,320]){
await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:8893/hoea_to_waka/about/brand-guidelines/');await page.waitForLoadState('networkidle');const section=page.locator('#typeface');
assert.equal(await section.locator('.site-preview-typeface-grid').count(),0);assert.equal(await section.locator('[data-type-choice]').count(),2);assert.equal(await section.locator('[data-type-panel]').count(),2);assert(await section.locator('[data-type-panel="3"]').isVisible());
for(const n of [3,4]){
const button=section.locator(`[data-type-choice="${n}"]`);await button.click();
assert.equal(await button.getAttribute('aria-pressed'),'true');assert.equal(await section.locator('.bt-panel:visible').count(),1);const panel=section.locator(`[data-type-panel="${n}"]`);assert(await panel.isVisible());assert(await panel.innerText().then(t=>t.includes('Inter')&&t.includes('350')));
assert(await panel.locator('.bt-quote').evaluate(e=>getComputedStyle(e).fontFamily.includes('ABC Marist')&&getComputedStyle(e).fontWeight==='350'));
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+width+' layout '+n);
assert(await panel.evaluate(e=>{const r=e.getBoundingClientRect();return [...e.querySelectorAll('*')].every(el=>{const b=el.getBoundingClientRect();return b.width===0||(b.left>=r.left-1&&b.right<=r.right+1);});}),'Panel content stays in column '+width+' layout '+n);
if([1440,390].includes(width)){await panel.locator('.bt-credit').last().scrollIntoViewIfNeeded();await section.screenshot({path:`tmp/typography-studies/layout-${n}-${width}.png`,style:'.site-header,.skip-link{visibility:hidden!important}'});const result=await new(require('@axe-core/playwright').default)({page}).include('#typeface').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations,[]);}
}
await section.locator('[data-type-choice="3"]').focus();await page.keyboard.press('Enter');assert(await section.locator('[data-type-panel="3"]').isVisible());assert.equal(await section.locator('[data-type-choice="3"]').evaluate(e=>e===document.activeElement),true);
console.log('PASS two layouts, real copy, typefaces, controls and responsive bounds',width);
}
await page.evaluate(()=>document.documentElement.dataset.theme='dark');const dark=await new(require('@axe-core/playwright').default)({page}).include('#typeface').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(dark.violations,[]);
const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8893/hoea_to_waka/about/brand-guidelines/');assert(await plain.locator('[data-type-panel="3"]').isVisible());assert(await plain.locator('.bt-switcher').isHidden());assert.deepEqual(errors,[]);console.log('PASS keyboard, dark theme and readable no-JavaScript default');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
