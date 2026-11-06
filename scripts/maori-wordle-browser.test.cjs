const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
const url=(process.env.SITE_BASE_URL||'http://127.0.0.1:8766/hoea_to_waka/')+'resources/';
await page.goto(url);
async function seed(guesses=[]){await page.evaluate(guesses=>{const words=window.MaoriWordleWords;const answer='mātua';localStorage.setItem('hoea-maori-wordle-v1',JSON.stringify({version:1,deck:[answer,...words.answers.filter(w=>w!==answer)],index:1,answer,guesses}));},guesses);await page.reload();await page.locator('[data-game-start]').click();}
const input=page.locator('#mw-guess'),submit=page.locator('[data-wordle-form] button'),msg=page.locator('[data-wordle-message]');
await seed();await input.fill('MA\u0304TUA');assert.equal(await input.inputValue(),'MĀTUA');await input.evaluate(e=>e.setSelectionRange(1,2));await page.locator('[data-wordle-keyboard]').getByRole('button',{name:'Delete',exact:true}).click();assert.equal(await input.inputValue(),'MTUA');await input.fill('ma');await submit.click();assert.match(await msg.innerText(),/five letters/);
await input.fill('aaaaa');await submit.click();assert.match(await msg.innerText(),/isn’t in/);assert.equal(await page.locator('.mw-row [data-state]').count(),0);
await input.fill('mamae');await submit.click();assert.deepEqual(await page.locator('.mw-row').first().locator('[data-state]').evaluateAll(es=>es.map(e=>e.dataset.state)),['correct','present','absent','absent','absent']);
await input.fill('mamae');await submit.click();assert.match(await msg.innerText(),/already/);
await input.fill('MATUA');await input.evaluate(e=>e.setSelectionRange(1,2));await page.locator('[data-letter="ā"]').click();assert.equal(await input.inputValue(),'MĀTUA');await submit.click();assert.match(await page.locator('[data-wordle-result-text]').innerText(),/You found/);assert(await input.isHidden());
await page.reload();await page.locator('[data-game-start]').click();assert.match(await page.locator('[data-wordle-result-text]').innerText(),/You found/);
await page.locator('[data-wordle-next]').click();assert.equal(await page.locator('.mw-row [data-state]').count(),0);
await seed(['mamae']);await input.fill('aroha');await page.locator('[data-wordle-close]').click();await page.locator('[data-game-start]').click();assert.equal(await input.inputValue(),'AROHA');
await page.locator('[data-wordle-info]').click();await page.keyboard.press('Escape');assert(await page.locator('.mw-help').isHidden());
for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});await page.locator('#resource-play').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await page.locator('[data-letter]').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44)));if([390,1440].includes(width))await page.locator('[data-wordle-game]').screenshot({path:'tmp/wordle-colours-'+width+'.png',style:'.site-header{visibility:hidden}'});}
await seed(await page.evaluate(()=>window.MaoriWordleWords.allowed.filter(w=>w!=='mātua').slice(0,6)));assert.match(await page.locator('[data-wordle-result-text]').innerText(),/The word was/);assert(await input.isHidden());
await page.evaluate(()=>localStorage.setItem('hoea-maori-wordle-v1','{broken'));await page.reload();await page.locator('[data-game-start]').click();assert.equal(await page.locator('.mw-row').count(),6);
const privatePage=await browser.newPage();await privatePage.addInitScript(()=>{Storage.prototype.getItem=Storage.prototype.setItem=()=>{throw Error('Storage disabled')};});await privatePage.goto(url);await privatePage.locator('[data-game-start]').click();assert(await privatePage.locator('#mw-guess').isVisible());
assert.deepEqual(errors,[]);console.log('PASS validation, repeated-letter UI, macron replacement, win/loss, resume, next, corrupt/blocked storage, help, keyboard targets and 320–1440px layouts');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
