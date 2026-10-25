const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {PNG}=require('pngjs');
const Axe=require('@axe-core/playwright').default;
const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
(async()=>{
  const server=require('./preview.cjs')(8886),browser=await chromium.launch({channel:'chrome'});
  fs.mkdirSync('tmp/faq-styles',{recursive:true});
  try{
    const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    if(process.argv.includes('--runtime-only'))await page.goto('http://127.0.0.1:8886/');
    for(const width of process.argv.includes('--runtime-only')?[]:[1440,900,600,390,320]){
      await page.setViewportSize({width,height:1100});await page.goto('http://127.0.0.1:8886/');
      const faq=page.locator('#home-faq');await faq.scrollIntoViewIfNeeded();
      assert.equal(await faq.locator('[data-faq-choice]').count(),10);
      await faq.locator('summary').first().click();
      for(let index=1;index<=10;index++){
        const id=String(index).padStart(2,'0'),button=faq.locator(`[data-faq-choice="${id}"]`);
        await button.click();
        assert.equal(await faq.getAttribute('data-faq-style'),id);
        assert.equal(await faq.locator('[aria-pressed="true"]').count(),1);
        assert(await faq.locator('details').first().evaluate(e=>e.open),'Switching backgrounds preserves open answers');
        const geometry=await faq.evaluate(e=>{
          const box=e.getBoundingClientRect(),s=getComputedStyle(e);
          const within=[...e.querySelectorAll('button,summary,.ds-answer p')].filter(n=>n.getBoundingClientRect().height).every(n=>{const b=n.getBoundingClientRect();return b.left>=box.left&&b.right<=box.right});
          return {left:box.left-e.parentElement.getBoundingClientRect().left,right:e.parentElement.getBoundingClientRect().right-box.right,radius:s.borderTopLeftRadius,within,overflow:document.documentElement.scrollWidth>innerWidth,background:s.backgroundImage};
        });
        assert.equal(geometry.left,8);assert.equal(geometry.right,8);assert.equal(geometry.radius,'32px');assert(geometry.within);assert(!geometry.overflow);
        assert.equal(geometry.background==='none',index<=5,'Five flat and five layered backgrounds');
        if([1440,320].includes(width)){
          const result=await new Axe({page}).include('#home-faq').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
          assert.deepEqual(result.violations,[],`Accessibility ${width} style ${id}`);
          await faq.screenshot({path:`tmp/faq-styles/${id}-${width}.png`,style:'.site-header,.header-motion-lab{visibility:hidden!important}'});
        }
        if(width===1440){
          // Check actual painted gradients/noise, rather than just their base colour.
          const colors=await faq.evaluate(e=>['--faq-ink','--faq-muted'].map(name=>{
            const probe=document.createElement('span');probe.style.color=getComputedStyle(e).getPropertyValue(name);e.append(probe);const rgb=getComputedStyle(probe).color.match(/[\d.]+/g).slice(0,3).map(Number);probe.remove();return rgb;
          }));
          const pixels=PNG.sync.read(await faq.screenshot({style:'#home-faq .ds-faq-editorial{visibility:hidden!important}.site-header,.header-motion-lab{visibility:hidden!important}'}));
          let minimum=Infinity;
          for(let y=36;y<pixels.height-36;y+=24)for(let x=36;x<pixels.width-36;x+=24){
            const offset=(y*pixels.width+x)*4,bg=luminance([...pixels.data.subarray(offset,offset+3)]);
            for(const color of colors)minimum=Math.min(minimum,contrast(luminance(color),bg));
          }
          assert(minimum>=4.5,`Text contrast ${id}: ${minimum.toFixed(2)}`);
          console.log(`PASS ${id}: painted background contrast ${minimum.toFixed(2)}:1`);
        }
      }
      console.log('PASS all ten styles, 8px margins, rounded corners, open-answer preservation and no overflow',width);
    }
    await page.locator('[data-faq-choice="05"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#home-faq').getAttribute('data-faq-style'),'05');
    await page.goto('http://127.0.0.1:8886/contact/');assert.equal(await page.locator('[data-faq-style-picker]').count(),0);assert.equal(await page.locator('link[href*="home-faq-styles"],script[src*="home-faq-styles"]').count(),0);
    const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8886/');assert(await plain.locator('[data-faq-style-picker]').evaluate(e=>e.hidden));await plain.locator('#home-faq summary').first().click();assert(await plain.locator('#home-faq details').first().evaluate(e=>e.open));
    assert.deepEqual(errors,[]);console.log('PASS keyboard selection, homepage-only styles and native no-JavaScript FAQ');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
