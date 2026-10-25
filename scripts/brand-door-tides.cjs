const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const sharp=require('sharp');

(async()=>{
  const server=require('./preview.cjs')(8890),browser=await chromium.launch({channel:'chrome'});
  fs.mkdirSync('tmp/moon-doors',{recursive:true});
  try{
    const page=await browser.newPage({viewport:{width:1000,height:1100}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.clock.install({time:new Date('2026-10-25T00:00:00Z')});
    await page.goto('http://127.0.0.1:8890/about/brand-guidelines/');
    await page.clock.pauseAt(new Date('2026-10-25T00:00:05Z'));
    await page.addStyleTag({content:'.site-header,.brand-jump,.header-motion-lab{visibility:hidden!important}'});
    const study=page.locator('#brand-door-study'),svg=study.locator('svg');
    await svg.scrollIntoViewIfNeeded();await page.clock.runFor(40);
    const outlines=[];
    const countBlue=async buffer=>{const {data}=await sharp(buffer).removeAlpha().raw().toBuffer({resolveWithObject:true});let count=0;for(let i=0;i<data.length;i+=3)if(data[i]===13&&data[i+1]===70&&data[i+2]===135)count++;return count;};
    for(const [name,angle] of [['arch',67],['round',66],['oval',68],['facet',64]]){
      await page.locator(`[data-door-variant=${name}]`).click();await page.clock.runFor(32);
      const closed=await svg.locator('[data-door-panel]').getAttribute('d');
      assert.equal(closed,await svg.locator('#door-portal-clip path').getAttribute('d'),'Leaf and opening have identical closed geometry');
      const closedImage=await svg.screenshot({path:`tmp/moon-doors/${name}-closed.png`});
      assert.equal(await countBlue(closedImage),0,'No ocean leaks around the closed door');
      await page.clock.runFor(1700);
      assert.equal(Number(await svg.getAttribute('data-angle')),angle);
      const wave=await svg.locator('[data-sea-front]').getAttribute('d');
      const panel=await svg.locator('[data-door-panel]').getAttribute('d');
      outlines.push(await svg.locator('#door-portal-clip path').getAttribute('d'));
      const openImage=await svg.screenshot({path:`tmp/moon-doors/${name}-open.png`});
      assert(await countBlue(openImage)>500,'The requested exact blue is visible inside the open doorway');
      const placement=await svg.evaluate(element=>{
        const face=element.querySelector('[data-door-panel]'),side=element.querySelector('[data-door-edge]'),collar=element.querySelector('[data-door-collar]'),latch=element.querySelector('[data-door-latch]').getBBox();
        return {handleInside:face.isPointInFill(new DOMPoint(Number(collar.getAttribute('cx')),Number(collar.getAttribute('cy')))),latchInside:side.isPointInFill(new DOMPoint(latch.x+latch.width/2,latch.y+latch.height/2)),finite:[...element.querySelectorAll('path')].every(p=>!/NaN|Infinity|undefined/.test(p.getAttribute('d')||''))};
      });
      assert(placement.handleInside&&placement.latchInside&&placement.finite,'Handle and latch stay attached to their surfaces');
      await page.evaluate(()=>{window.tideSamples=[];let count=0;const sample=()=>{window.tideSamples.push(Number(document.querySelector('[data-sea-front]').getAttribute('d').match(/^M[-\d.]+ ([-\d.]+)/)[1]));if(++count<45)requestAnimationFrame(sample)};requestAnimationFrame(sample)});
      await page.clock.runFor(750);
      assert.notEqual(await svg.locator('[data-sea-front]').getAttribute('d'),wave);
      assert.equal(await svg.locator('[data-door-panel]').getAttribute('d'),panel,'Door holds still while the tide moves');
      const samples=await page.evaluate(()=>window.tideSamples);
      assert(samples.length>30&&samples.some(y=>y!==samples[0]));
      assert(Math.max(...samples.slice(1).map((y,i)=>Math.abs(y-samples[i])))<1,'Wave moves continuously without a frame jump');
      await page.locator('[data-door-pause]').click();const held=await svg.innerHTML();
      await page.clock.runFor(2000);assert.equal(await svg.innerHTML(),held,'Pause freezes door, sea and sky');
      await page.locator('[data-door-pause]').click();await page.clock.runFor(4000);
      assert(Number(await svg.getAttribute('data-angle'))<angle,'Closing follows the extended open hold');
      await page.clock.runFor(1000);assert(Number(await svg.getAttribute('data-angle'))<2);
      await page.locator('[data-door-replay]').click();await page.clock.runFor(32);
      assert(Number(await svg.getAttribute('data-phase'))<.1);
      console.log('PASS exact-blue moonlit ocean, matching closed clip, projected hardware, continuous waves and eight-second loop',name);
    }
    assert.equal(new Set(outlines).size,4,'Four distinct door outlines');
    await page.locator('[data-door-pause]').click();await page.locator('[data-door-variant=arch]').click();
    const heldAngle=await svg.getAttribute('data-angle');await page.locator('[data-door-pause]').click();await page.clock.runFor(100);
    assert.equal(await svg.getAttribute('data-angle'),heldAngle,'A paused new selection resumes from its open pose');
    await page.locator('[data-door-variant=oval]').focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('[data-door-variant=oval]').getAttribute('aria-pressed'),'true');
    assert.deepEqual(errors,[]);
    console.log('PASS distinct shapes, paused selection continuity and keyboard control');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
