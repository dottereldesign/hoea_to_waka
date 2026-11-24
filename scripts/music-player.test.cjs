const base = process.env.SITE_BASE_URL || 'http://127.0.0.1:8766/hoea_to_waka/';
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome'});try{const c=await b.newContext({viewport:{width:1440,height:1100}});await c.addInitScript(()=>{const Native=window.Audio;window.Audio=function(...args){const a=new Native(...args);window.testAudio=a;return a;};});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base + 'resources/');await p.waitForFunction(()=>window.testAudio?.duration>0);assert(await p.evaluate(()=>testAudio.paused));
const player = p.locator('#resource-music-player');
const panel = player.locator('.music-console');
assert.equal(await player.getAttribute('data-layout'), '4');
assert.equal(await p.locator('[data-credits], [data-music-layout], [data-variation-target="resource-music-player"]').count(), 0);
for (const width of [1440, 768, 390, 320]) {
  await p.setViewportSize({width, height: 1100});
  assert.match(await panel.evaluate(el => getComputedStyle(el).backgroundImage), /url\(/);
  await panel.screenshot({path: 'tmp/music-sleeve-' + width + '.png'});
  assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Overflow at ' + width);
  assert(await panel.evaluate(el => el.scrollWidth <= el.clientWidth + 1), 'Panel overflow at ' + width);
}
await p.setViewportSize({width:1440,height:1100});await p.locator('[data-play]').click();await p.waitForFunction(()=>!testAudio.paused&&testAudio.currentTime>.3);await p.locator('[data-play]').click();assert(await p.evaluate(()=>testAudio.paused));await p.locator('[data-track="1"]').click();await p.waitForFunction(()=>testAudio.src.includes('in-this-together')&&!testAudio.paused);await p.waitForFunction(()=>testAudio.duration>0&&testAudio.readyState>=2);await p.locator('.music-progress input').evaluate(e=>{e.value='30';e.dispatchEvent(new Event('input',{bubbles:true}));});await p.waitForFunction(()=>testAudio.currentTime>=29&&testAudio.currentTime<33&&!testAudio.seeking,null,{timeout:2500});await p.locator('[data-repeat]').click();assert(await p.evaluate(()=>testAudio.loop));
const popPromise=p.waitForEvent('popup');await p.locator('[data-open-player]').click();const pop=await popPromise;await pop.waitForFunction(()=>window.testAudio?.duration>0);await pop.waitForTimeout(800);assert(await p.evaluate(()=>testAudio.paused));if(await pop.evaluate(()=>testAudio.paused))await pop.locator('[data-play]').click();await pop.waitForFunction(()=>!testAudio.paused&&testAudio.currentTime>29);await p.goto(base + 'about/');assert(await pop.evaluate(()=>!testAudio.paused));await pop.screenshot({path:'tmp/music-popout.png'});await pop.locator('[data-play]').click();assert(await pop.evaluate(()=>testAudio.paused));assert.deepEqual(errors,[]);console.log('PASS: 4 responsive Sleeve panorama checks, playback/pause, seek, repeat, credits removal, pop-out handoff and continued playback after navigation.');await c.close();}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
