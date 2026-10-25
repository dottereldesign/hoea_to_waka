const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');

(async()=>{
  const server=require('./preview.cjs')(8887),browser=await chromium.launch({channel:'chrome'});
  fs.mkdirSync('tmp/menu-perf',{recursive:true});
  const results=[];
  try{
    const context=await browser.newContext(),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    for(const [route,width]of [['about/brand-guidelines/',1440],['about/brand-guidelines/',390],['',1440],['services/',1440]]){
      await page.setViewportSize({width,height:1000});
      await page.goto('http://127.0.0.1:8887/'+route);await page.waitForLoadState('networkidle');
      await page.waitForFunction(()=>!document.querySelector('[data-header-entrance]')||document.querySelector('[data-header-entrance]').dataset.entranceState==='idle');
      await page.evaluate(()=>{
        const box=document.createElement('div');box.id='menu-background-probes';box.setAttribute('aria-hidden','false');
        box.innerHTML='<button tabindex="2" style="position:fixed;left:0;top:196px;width:8px;height:8px;border:0;padding:0" aria-label="Background interaction probe"></button><span></span>';
        document.body.append(box);window.probeClicks=0;box.querySelector('button').addEventListener('click',()=>window.probeClicks++);
        window.runningProbe=box.querySelector('button').animate([{opacity:1},{opacity:.9}],{duration:2000,iterations:Infinity});
        window.pausedProbe=box.querySelector('span').animate([{opacity:1},{opacity:.8}],{duration:2000,iterations:Infinity});window.pausedProbe.pause();
        document.body.style.setProperty('overflow','auto','important');
      });
      const dialog=page.locator('.site-menu-panel'),toggle=page.locator('[data-menu-toggle]'),times=[];
      for(let i=0;i<3;i++){
        times.push(await toggle.evaluate(e=>{const start=performance.now();e.click();return performance.now()-start;}));
        assert(await dialog.evaluate(e=>e.open&&e.matches(':popover-open')&&!e.matches(':modal')&&e.getAttribute('aria-modal')==='true'));
        if(i===0&&width===1440&&route==='about/brand-guidelines/'){
          const session=await context.newCDPSession(page);
          const {root}=await session.send('DOM.getDocument');
          const {nodeId}=await session.send('DOM.querySelector',{nodeId:root.nodeId,selector:'.site-menu-panel'});
          const {nodes}=await session.send('Accessibility.getPartialAXTree',{nodeId});
          const accessible=nodes.find(node=>node.role?.value==='dialog');
          assert(accessible&&!accessible.ignored&&accessible.properties.some(p=>p.name==='modal'&&p.value.value===true),'Browser accessibility tree exposes a modal dialog');
          await session.detach();
        }
        assert.equal(await page.locator('#menu-background-probes').getAttribute('aria-hidden'),'true');
        assert.equal(await page.locator('#menu-background-probes button').getAttribute('tabindex'),'-1');
        assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');
        assert.equal(await page.evaluate(()=>window.runningProbe.playState),'paused');
        const held=await page.evaluate(()=>window.runningProbe.currentTime);await page.waitForTimeout(150);
        assert.equal(await page.evaluate(()=>window.runningProbe.currentTime),held,'Background animation freezes while menu is visible');
        await page.locator('#menu-background-probes button').evaluate(e=>e.focus());
        assert(await dialog.locator('.site-menu-close').evaluate(e=>e===document.activeElement),'Programmatic focus cannot escape');
        await dialog.locator('a[href],button').last().focus();await page.keyboard.press('Tab');
        assert(await dialog.locator('.site-menu-close').evaluate(e=>e===document.activeElement),'Tab wraps inside the menu');
        if(i===1)await page.mouse.click(2,200);else await page.keyboard.press('Escape');
        await page.waitForFunction(()=>!document.querySelector('.site-menu-panel').open);
        assert.equal(await page.evaluate(()=>window.probeClicks),0,'Backdrop blocks pointer interaction with the page');
        assert.equal(await page.locator('#menu-background-probes').getAttribute('aria-hidden'),'false');
        assert.equal(await page.locator('#menu-background-probes button').getAttribute('tabindex'),'2');
        assert.equal(await page.evaluate(()=>document.body.style.getPropertyPriority('overflow')),'important');
        assert.equal(await page.evaluate(()=>document.body.style.overflow),'auto');
        assert.equal(await page.evaluate(()=>window.runningProbe.playState),'running');
        assert.equal(await page.evaluate(()=>window.pausedProbe.playState),'paused','User-paused animations stay paused');
      }
      times.sort((a,b)=>a-b);assert(times[1]<180,'Menu click should not synchronously restyle the entire page: '+JSON.stringify(times));
      results.push({route,width,clickMilliseconds:times});
      console.log('PASS responsive menu, modal isolation, restored attributes/scroll lock, animation pause/resume',JSON.stringify(results.at(-1)));
    }
    await page.goto('http://127.0.0.1:8887/about/brand-guidelines/');
    for(const selector of ['#brand-door-study svg','.brand-nature__stage']){
      await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(300);
      await page.locator('[data-menu-toggle]').click();
      const phase=await page.locator(selector).getAttribute('data-phase');await page.waitForTimeout(300);
      assert.equal(await page.locator(selector).getAttribute('data-phase'),phase,'Canvas/SVG loops stop behind the menu');
      await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.site-menu-panel').open);await page.waitForTimeout(120);
      assert.notEqual(await page.locator(selector).getAttribute('data-phase'),phase,'Background loops resume from the saved position');
    }
    assert.deepEqual(errors,[]);fs.writeFileSync('tmp/menu-perf/current.json',JSON.stringify(results,null,2));
    const fallback=await browser.newPage({reducedMotion:'reduce'});
    await fallback.addInitScript(()=>Object.defineProperty(HTMLElement.prototype,'showPopover',{value:undefined,configurable:true}));
    await fallback.goto('http://127.0.0.1:8887/services/');await fallback.locator('[data-menu-toggle]').click();
    assert(await fallback.locator('.site-menu-panel').evaluate(e=>e.open&&e.matches(':modal')));
    await fallback.keyboard.press('Escape');assert(await fallback.locator('.site-menu-panel').evaluate(e=>!e.open));
    await fallback.close();
    console.log('PASS door and nature loop suspension and clean resumption');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
