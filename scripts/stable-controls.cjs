const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const serve=require('./preview.cjs');
(async()=>{const server=serve(8788),browser=await chromium.launch({channel:'chrome',headless:true});try{
  const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('tmp/stable-controls',{recursive:true});
  const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  for(const width of [1440,390])for(const type of ['navbar','header','footer']){
    await page.setViewportSize({width,height:1000});await page.addInitScript(()=>localStorage.removeItem('hoea-design-studio-v1'));await page.goto('http://127.0.0.1:8788/about/');await page.waitForFunction(()=>window.HoeaDesignStudio);
    const key=await page.evaluate(type=>{const c=window.HoeaDesignStudio.components.find(c=>c.type===type);c.el.scrollIntoView({block:'start'});return c.key;},type);await settle();
    const group=page.locator(`.ds-switcher[data-component-key="${key}"]`),next=group.locator('[data-step="1"]');
    const start=await group.boundingBox(),button=await next.boundingBox();assert(start&&button);
    await page.screenshot({path:`tmp/stable-controls/${type}-${width}-before.png`});
    const ids=await page.evaluate(key=>window.HoeaDesignStudio.options(key).map(o=>o.id),key);
    let selected=await page.evaluate(key=>window.HoeaDesignStudio.components.find(c=>c.key===key).value,key);
    // Repeatedly click the exact same screen coordinate, as a human does.
    for(let i=0;i<ids.length+2;i++){
      selected=ids[ids.indexOf(selected)<0?1:(ids.indexOf(selected)+1)%ids.length];
      await page.mouse.click(button.x+button.width/2,button.y+button.height/2);await settle();
      assert.equal(await page.evaluate(key=>window.HoeaDesignStudio.components.find(c=>c.key===key).value,key),selected);
      const now=await group.boundingBox();assert(now);assert(Math.abs(now.x-start.x)<1&&Math.abs(now.y-start.y)<1,`${type}/${width}: controls moved`);
    }
    await group.locator('.ds-badge').click();await page.locator('.ds-choice[data-layout-id="0"]').click();await page.keyboard.press('Escape');await settle();
    const afterMenu=await group.boundingBox();assert(Math.abs(afterMenu.x-start.x)<1&&Math.abs(afterMenu.y-start.y)<1,'Menu selection must keep the same anchor');
    await page.screenshot({path:`tmp/stable-controls/${type}-${width}-after.png`});
    await page.mouse.wheel(0,-1000);await page.waitForTimeout(120);await settle();
    if(type==='footer')assert(await group.isHidden()||(await group.boundingBox()).y!==start.y,'Deliberate scrolling releases the footer controls');
  }
  assert.deepEqual(errors,[]);console.log('PASS: fixed-coordinate cycling and menu selection for navigation, page headers and footers at1440/390; intentional scrolling releases anchors.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

