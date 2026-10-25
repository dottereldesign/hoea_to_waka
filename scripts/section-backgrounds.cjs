const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {PNG}=require('pngjs');
const Axe=require('@axe-core/playwright').default;
const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
(async()=>{
  const server=require('./preview.cjs')(8886),browser=await chromium.launch({channel:'chrome'});
  fs.mkdirSync('tmp/section-backgrounds',{recursive:true});
  try{
    const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    if(process.argv.includes('--runtime-only'))await page.goto('http://127.0.0.1:8886/services/resilience-one-on-one/');
    for(const width of process.argv.includes('--runtime-only')?[]:[1440,900,600,390,320]){
      await page.setViewportSize({width,height:1100});await page.goto('http://127.0.0.1:8886/services/resilience-one-on-one/');
      const faq=page.locator('#coaching-outcomes');await faq.scrollIntoViewIfNeeded();
      assert.equal(await faq.locator('[data-background-choice]').count(),10);
      assert.equal(await faq.locator('.pp-feature').count(),3);
      for(let index=1;index<=10;index++){
        const id=String(index).padStart(2,'0'),button=faq.locator(`[data-background-choice="${id}"]`);
        await button.click();
        assert.equal(await faq.getAttribute('data-background-style'),id);
        assert.equal(await faq.locator('[aria-pressed="true"]').count(),1);
        assert.deepEqual(await faq.locator('.pp-feature h3').allTextContents(),['Greater focus','Meaningful goals','Sustainable wellbeing']);
        const geometry=await faq.evaluate(e=>{
          const box=e.getBoundingClientRect(),s=getComputedStyle(e);
          const within=[...e.querySelectorAll('button,.pp-intro,.pp-feature')].filter(n=>n.getBoundingClientRect().height).every(n=>{const b=n.getBoundingClientRect();return b.left>=box.left&&b.right<=box.right});
          return {left:box.left-e.parentElement.getBoundingClientRect().left,right:e.parentElement.getBoundingClientRect().right-box.right,radius:s.borderTopLeftRadius,within,overflow:document.documentElement.scrollWidth>innerWidth,background:s.backgroundImage};
        });
        assert.equal(geometry.left,8);assert.equal(geometry.right,8);assert.equal(geometry.radius,'32px');assert(geometry.within);assert(!geometry.overflow);
        assert.equal(geometry.background==='none',index<=5,'Five flat and five layered backgrounds');
        if([1440,320].includes(width)){
          const result=await new Axe({page}).include('#coaching-outcomes').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
          assert.deepEqual(result.violations,[],`Accessibility ${width} style ${id}`);
          await faq.screenshot({path:`tmp/section-backgrounds/${id}-${width}.png`,style:'.site-header,.header-motion-lab{visibility:hidden!important}'});
        }
        if(width===1440){
          // Check actual painted gradients/noise, rather than just their base colour.
          const colors=await faq.evaluate(e=>['--study-ink','--study-muted'].map(name=>{
            const probe=document.createElement('span');probe.style.color=getComputedStyle(e).getPropertyValue(name);e.append(probe);const rgb=getComputedStyle(probe).color.match(/[\d.]+/g).slice(0,3).map(Number);probe.remove();return rgb;
          }));
          const pixels=PNG.sync.read(await faq.screenshot({style:'#coaching-outcomes .pp-shell{visibility:hidden!important}.site-header,.header-motion-lab{visibility:hidden!important}'}));
          let minimum=Infinity;
          for(let y=36;y<pixels.height-36;y+=24)for(let x=36;x<pixels.width-36;x+=24){
            const offset=(y*pixels.width+x)*4,bg=luminance([...pixels.data.subarray(offset,offset+3)]);
            for(const color of colors)minimum=Math.min(minimum,contrast(luminance(color),bg));
          }
          assert(minimum>=4.5,`Text contrast ${id}: ${minimum.toFixed(2)}`);
          console.log(`PASS ${id}: painted background contrast ${minimum.toFixed(2)}:1`);
        }
      }
      console.log('PASS all ten styles, 8px margins, rounded corners, preserved outcome cards and no overflow',width);
    }
    await page.locator('[data-background-choice="05"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#coaching-outcomes').getAttribute('data-background-style'),'05');
    await page.goto('http://127.0.0.1:8886/contact/');assert.equal(await page.locator('[data-background-style-picker]').count(),0);assert.equal(await page.locator('link[href*="section-backgrounds"],script[src*="section-backgrounds"]').count(),0);
    await page.goto('http://127.0.0.1:8886/');
    const home=page.locator('#home-faq');assert.equal(await home.getAttribute('data-background-style'),'06');assert.equal(await home.locator('[data-background-choice]').count(),0);
    assert.equal(await page.locator('script[src*="section-backgrounds"]').count(),0);
    await home.locator('summary').first().click();assert(await home.locator('details').first().evaluate(e=>e.open));
    for(const width of [1440,390,320]){await page.setViewportSize({width,height:1100});await home.screenshot({path:`tmp/section-backgrounds/faq-fixed-${width}.png`,style:'.site-header,.header-motion-lab{visibility:hidden!important}'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
    const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8886/');await plain.locator('#home-faq summary').first().click();assert(await plain.locator('#home-faq details').first().evaluate(e=>e.open));
    await plain.goto('http://127.0.0.1:8886/services/resilience-one-on-one/');assert(await plain.locator('[data-background-style-picker]').evaluate(e=>e.hidden));
    assert.deepEqual(errors,[]);console.log('PASS keyboard selection, coaching-only controls, fixed Coastal mesh FAQ and native no-JavaScript fallback');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
