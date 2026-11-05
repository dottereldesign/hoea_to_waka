const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const sharp = require('sharp');
(async()=>{
  const server=require('./preview.cjs')(8892), browser=await chromium.launch({channel:'chrome',headless:true});
  const errors=[],failed=[];
  try {
    const context=await browser.newContext({viewport:{width:1600,height:1100},reducedMotion:'reduce',acceptDownloads:true});
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
    await page.goto('http://127.0.0.1:8892/hoea_to_waka/colour-testing/');
    await page.locator('[data-community-svg="flat"] > svg').waitFor();
    await page.waitForLoadState('networkidle');
    const root=page.locator('#community-study');
    assert.equal(await root.locator('.community-triptych figure').count(),3);
    assert.equal(await root.locator('[data-community-svg="flat"] image').count(),0,'Clean SVG contains no raster imagery');
    const ids=await root.locator('[id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(new Set(ids).size,ids.length,'Unique SVG IDs');
    const initial=await root.locator('[data-art="flat"]').screenshot();
    await page.locator('#community-colour').fill('#5577ee');
    const changed=await root.locator('[data-art="flat"]').screenshot();assert(!initial.equals(changed),'Recolour visibly changes SVG');
    assert.match(await root.locator('#community-status').textContent(),/#5577EE/);
    await page.locator('#community-reset').click();
    assert.equal(await root.evaluate(e=>e.style.getPropertyValue('--community-listener-front-top')),'');
    await page.locator('#community-strength').fill('0');
    assert.equal(await page.locator('#community-strength-value').textContent(),'0%');
    const pixelAlignment=await page.addStyleTag({content:'.community-triptych{grid-template-columns:repeat(3,330px)!important}'});
    await page.mouse.move(0,0);await root.locator('[data-art="flat"]').evaluate(e=>e.querySelectorAll('[data-active]').forEach(x=>x.removeAttribute('data-active')));
    const flat=await root.locator('[data-art="flat"]').screenshot(),textured=await root.locator('[data-art="textured"]').screenshot();
    const fa=await sharp(flat).resize(330,440,{fit:'fill'}).raw().toBuffer(),ta=await sharp(textured).resize(330,440,{fit:'fill'}).raw().toBuffer();
    assert.equal(fa.length,ta.length);let pixelDifference=0;for(let i=0;i<fa.length;i++)pixelDifference+=Math.abs(fa[i]-ta[i]);
    assert(pixelDifference/fa.length<1,'Zero texture matches clean SVG within subpixel rasterisation tolerance: '+pixelDifference/fa.length);
    await pixelAlignment.evaluate(e=>e.remove());
    for(const value of ['texture-01.webp','texture-06.webp','texture-17.webp','procedural','community-grain.webp']){
      await page.locator('#community-texture').selectOption(value);await page.locator('#community-strength').fill('70');
      if(value==='procedural')assert.equal(await root.locator('.community-procedural').count(),2);
      else await root.locator('[data-art="textured"] .community-grain').evaluate(async e=>await e.decode());
    }
    for(const value of ['blend','wipe','difference']){await page.locator('#community-compare-mode').selectOption(value);assert.equal(await root.locator('.community-overlay').getAttribute('data-mode'),value);}
    assert(await page.locator('#community-compare-slider').isDisabled());
    await page.locator('#community-compare-mode').selectOption('blend');
    await page.locator('#community-compare-slider').fill('100');await page.waitForFunction(()=>getComputedStyle(document.querySelector('.community-overlay-code')).opacity==='1');
    await page.locator('#community-compare-slider').fill('0');await page.waitForFunction(()=>getComputedStyle(document.querySelector('.community-overlay-code')).opacity==='0');
    await page.locator('#community-reset').click();
    await page.locator('[data-preview-layer="speaker"]').focus();
    assert.equal(await root.locator('.community-interactive [data-layer="speaker"][data-active]').count(),2);
    assert.equal(await root.locator('[data-art="flat"] [data-layer="speaker"]').evaluate(e=>getComputedStyle(e).transform),'none','Reduced motion avoids transforms');
    await page.locator('[data-community-enlarge="flat"]').click();assert(await page.locator('#community-dialog').isVisible());
    await page.keyboard.press('Escape');assert(!await page.locator('#community-dialog').isVisible());
    for(const kind of ['flat','textured']){
      const downloaded=page.waitForEvent('download');await page.locator(`[data-community-download="${kind}"]`).click();
      const download=await downloaded,path=await download.path(),content=fs.readFileSync(path,'utf8');assert(content.startsWith('<svg'));if(kind==='textured')assert(content.includes('data:image/webp;base64,'));
    }
    await page.locator('#community-texture').selectOption('procedural');
    const dp=page.waitForEvent('download');await page.locator('[data-community-download="textured"]').click();
    assert(fs.readFileSync(await(await dp).path(),'utf8').includes('feTurbulence'));
    await page.locator('#community-reset').click();
    for(const width of [320,390,768,1024,1600,2560]){
      await page.setViewportSize({width,height:1100});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+width);
      for(const art of await root.locator('.community-triptych .community-art').all()) {const b=await art.boundingBox();assert(Math.abs(b.width/b.height-.75)<.002);}
    }
    const axe=await new(require('@axe-core/playwright').default)({page}).include('#community-study').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.locator('[data-preview-layer="speaker"]').focus();await page.waitForTimeout(400);
    assert.notEqual(await root.locator('[data-art="flat"] [data-layer="speaker"]').evaluate(e=>getComputedStyle(e).transform),'none','Hover motion animates a group');
    await page.locator('#community-motion').uncheck();await page.waitForTimeout(400);
    assert.equal(await root.locator('[data-art="flat"] [data-layer="speaker"]').evaluate(e=>getComputedStyle(e).transform),'none');
    await page.locator('#texture-01 [data-enlarge]').click();
    assert(await page.locator('.lab-dialog').isVisible(),'Earlier texture inspector still opens its own dialog');
    assert(!await page.locator('#community-dialog').isVisible());
    await page.locator('#close-preview').click();
    const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
    await nojs.goto('http://127.0.0.1:8892/hoea_to_waka/colour-testing/');
    await nojs.locator('#community-study').scrollIntoViewIfNeeded();
    assert.equal(await nojs.locator('.community-triptych figure').count(),3);
    assert(await nojs.locator('[data-community-download="textured"]').isVisible());
    assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
    console.log('PASS comparison, recolour, textures, precise overlay, hover, reduced motion, keyboard, downloads, dialog, 320–2560px, accessibility and no-JavaScript fallback.');
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
