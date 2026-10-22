const{chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs'),Axe=require('@axe-core/playwright').default;
(async()=>{const server=require('./preview.cjs')(8918),browser=await chromium.launch({channel:'chrome'});try{fs.mkdirSync('tmp/brand-ai',{recursive:true});const context=await browser.newContext({reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const expected=fs.readFileSync('about/brand-guidelines/brand-context.md','utf8').replaceAll('\r\n','\n'),figma=fs.readFileSync('about/brand-guidelines/figma-context.md','utf8').replaceAll('\r\n','\n');
const {colours,roleAliases}=await import('../design/brand-tokens.mjs');const tokens=JSON.parse(fs.readFileSync('about/brand-guidelines/brand-tokens.json','utf8'));
assert.equal(Object.keys(tokens.brand).length,colours.length);
for(const c of colours){const value=tokens.brand[c.id].$value;assert.equal(value.colorSpace,'srgb');assert.equal('#'+value.components.map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase(),c.hex);}
for(const[key,id]of Object.entries(roleAliases))assert.equal(tokens.semantic[key].$value,`{brand.${id}}`);
assert.deepEqual(Object.values(tokens.sectionSpacing).map(t=>t.$value.value),[92,65,60]);
assert(!expected.includes('<svg')&&!expected.includes('248 Followers')&&!expected.includes('Give your AI the full picture')&&!expected.includes('undefined'));
for(const content of ['Hoea tō Waka','Strength in Aotearoa','## Audience','## Typography','## Section Spacing','## Social Media','## Colours','ABC Marist','licensed separately','https://dottereldesign.github.io/hoea_to_waka/assets/brand-downloads/'])assert(expected.includes(content),'Export includes '+content);
assert(figma.includes('auto layout')&&figma.endsWith(expected));console.log('PASS published token fidelity, macrons, guide coverage, real asset URLs and Figma brief');

for(const width of[1440,1100,760,390,320]){
 await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:8918/hoea_to_waka/about/brand-guidelines/');await page.waitForLoadState('networkidle');const section=page.locator('.brand-ai');await section.scrollIntoViewIfNeeded();
 await page.screenshot({path:`tmp/brand-ai/default-${width}.png`});
 assert.equal(await section.locator('[data-ai-provider]').count(),6);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 for(const name of['chatgpt','claude','gemini','deepseek','figma','generic']){
  const button=section.locator(`[data-ai-provider=${name}]`);await button.click();await page.waitForFunction(()=>!document.querySelector('.brand-ai__feedback').hidden&&!document.querySelector('.brand-ai__status').textContent.includes('could not be loaded'));
  await page.waitForFunction(()=>document.querySelector('.brand-ai__status').textContent.startsWith('Copied')&&!document.querySelector('[data-ai-provider][aria-busy]'));
  assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n'),name==='figma'?figma:expected,'Clipboard has complete correct context');
  assert.equal(context.pages().length,1,'Copy does not silently open/send to provider');
  const popup=section.locator('.brand-ai__feedback'),box=await popup.boundingBox();assert(box.x>=0&&box.x+box.width<=width&&box.y>=0&&box.y+box.height<=1000,'Feedback stays in viewport');
  if(name==='chatgpt')await page.screenshot({path:`tmp/brand-ai/copied-${width}.png`});
  if(name!=='generic')assert.match(await section.locator('.brand-ai__open').getAttribute('href'),/^https:\/\//);
  await page.keyboard.press('Escape');assert(await button.evaluate(e=>document.activeElement===e));
 }
 await section.locator('summary').click();const files=section.locator('.brand-ai__files'),box=await files.boundingBox();assert(box.x>=0&&box.x+box.width<=width,'Downloads stay in viewport');
 for(const a of await files.locator('a').all()){const res=await page.request.get(new URL(await a.getAttribute('href'),page.url()).href);assert(res.ok(),'Download reachable');}
 const result=await new Axe({page}).include('.brand-ai').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations,[]);
 await page.keyboard.press('Escape');console.log('PASS six copy actions, actual clipboard, provider handoff, file links, viewport bounds and axe',width);
}
await page.evaluate(()=>localStorage.setItem('hoea-theme','dark'));await page.reload();await page.locator('[data-ai-provider=claude]').click();await page.waitForFunction(()=>document.querySelector('.brand-ai__status').textContent.startsWith('Copied'));await page.locator('.brand-ai').scrollIntoViewIfNeeded();await page.screenshot({path:'tmp/brand-ai/dark.png'});assert.deepEqual((await new Axe({page}).include('.brand-ai').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations,[]);
await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(Error('denied'))},configurable:true});document.execCommand=()=>false;});await page.reload();await page.locator('[data-ai-provider=figma]').click();await page.waitForFunction(()=>!document.querySelector('.brand-ai__manual').hidden);assert.equal(await page.locator('.brand-ai__manual textarea').inputValue(),figma);assert.match(await page.locator('.brand-ai__status').textContent(),/Automatic copying is unavailable/);assert(await page.locator('.brand-ai__manual textarea').evaluate(e=>e===document.activeElement&&e.selectionEnd===e.value.length));
const legacy=await context.newPage();await legacy.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(Error('denied'))},configurable:true}));await legacy.goto('http://127.0.0.1:8918/about/brand-guidelines/');await legacy.locator('[data-ai-provider=chatgpt]').click();await legacy.waitForFunction(()=>document.querySelector('.brand-ai__status').textContent.startsWith('Copied'));const probe=await context.newPage();await probe.goto('http://127.0.0.1:8918/about/brand-guidelines/');assert.equal((await probe.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n'),expected);await probe.close();await legacy.close();
const offline=await context.newPage();await offline.route('**/brand-context.md',route=>route.fulfill({status:503,body:'Unavailable'}));await offline.goto('http://127.0.0.1:8918/about/brand-guidelines/');await offline.locator('[data-ai-provider=chatgpt]').click();await offline.waitForFunction(()=>document.querySelector('.brand-ai__status').textContent.includes('could not be loaded'));assert(await offline.locator('.brand-ai__open').evaluate(e=>e.hidden));
const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8918/about/brand-guidelines/');assert(await plain.locator('[data-ai-provider=generic]').evaluate(e=>e.hidden));assert.equal(await plain.locator('.brand-ai__files a').count(),4);
assert.deepEqual(errors,[]);console.log('PASS dark theme, clipboard denial/manual fallback, fetch failure and no-JavaScript downloads');
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
