const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),serve=require('./preview.cjs');
(async()=>{const server=serve(8798),browser=await chromium.launch({channel:'chrome',headless:true});try{
  fs.mkdirSync('tmp/statement-icons',{recursive:true});
  const page=await browser.newPage({reducedMotion:'no-preference'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const selector='[data-component="home:2:statement"]';
  async function at(progress){await page.locator(selector).evaluate((el,p)=>{const top=el.getBoundingClientRect().top+scrollY;scrollTo({top:top-innerHeight*.8+p*innerHeight*.62,behavior:'instant'})},progress);await page.waitForFunction(selector=>{const el=document.querySelector(selector);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const p=reduced?1:Math.max(0,Math.min(1,(innerHeight*.8-el.getBoundingClientRect().top)/(innerHeight*.62)));return [...el.querySelectorAll('.statement-icon')].every((icon,i)=>{const t=reduced?1:Math.max(0,Math.min(1,(p-i*.12)/.45));return Math.abs(Number(icon.style.getPropertyValue('--icon-reveal'))-t*t*(3-2*t))<.01;});},selector);return page.locator('.statement-icon').evaluateAll(els=>els.map(el=>({width:el.getBoundingClientRect().width,reveal:Number(el.style.getPropertyValue('--icon-reveal'))})));}
  for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:8798/hoea_to_waka/');await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
    const section=page.locator(selector),heading=section.locator('.statement-icon-copy');
    assert.equal(await page.locator('.statement-icon').count(),5);
    assert.equal(await heading.getAttribute('aria-label'),'Resilience training set in Aotearoa’s unique cultural context, made practical for workplaces, leaders, and support professionals.');
    assert.equal(await heading.locator('[aria-hidden="true"]').count(),6);
    const before=await at(0),lineCount=await heading.locator('.statement-icon-line').count(),height=await heading.evaluate(el=>el.getBoundingClientRect().height);
    assert(before.every(i=>i.reveal<.01),'initial icons collapsed '+width);
    const middle=await at(.5);assert(middle[0].width>before[0].width);assert(middle.at(-1).reveal<middle[0].reveal,'stagger');
    if(width===1440)await section.screenshot({path:'tmp/statement-icons/mid-scroll-desktop.png'});
    const full=await at(1);assert(full.every(i=>i.reveal>.99),'fully revealed '+width);
    assert.equal(await heading.locator('.statement-icon-line').count(),lineCount,'stable line count');assert.equal(await heading.evaluate(el=>el.getBoundingClientRect().height),height,'stable section height');
    const bounds=await heading.locator('.statement-icon-line').evaluateAll(els=>els.map(el=>{const range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect();return{left:r.left,right:r.right}}));assert(bounds.every(r=>r.left>=-1&&r.right<=width+1),'text fits '+width+' '+JSON.stringify(bounds));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow');
    await section.screenshot({path:`tmp/statement-icons/after-${width}.png`});
    const reversed=await at(0);assert(reversed.every(i=>i.reveal<.01),'reverse scroll');
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);assert((await at(0)).every(i=>i.reveal===1),'reduced motion visible');
    assert.equal(await section.locator('.statement-icon').count(),5,'one set after media change');
    await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(150);
  }
  // Reflow on an actual resize, and on returning to the page's initial position.
  await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(150);await at(1);assert.equal(await page.locator('.statement-icon').count(),5);
  await page.locator('footer').getByRole('link',{name:'Brand guidelines',exact:true}).count().then(n=>assert(n));
  assert.deepEqual(errors,[]);console.log('PASS: five semantic icons, scroll expansion/stagger/reversal, stable text lines, 320/390/768/1440px, resize, reduced motion, accessible sentence and footer preservation.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
