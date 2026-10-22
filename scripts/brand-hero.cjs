const {chromium}=require('playwright');
const assert=require('assert/strict');
const fs=require('fs');
(async()=>{
  const server=require('./preview.cjs')(8879),browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    fs.mkdirSync('tmp/brand-hero',{recursive:true});
    const errors=[];
    for(const width of [1440,390]){
      const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'no-preference'});
      page.on('pageerror',e=>errors.push(e.message));
      await page.addInitScript(()=>{
        window.__brandFrames=[];
        const sample=t=>{
          const hero=document.querySelector('#cover');
          if(hero?.classList.contains('site-preview-brand-hero-is-ready')){
            window.__brandFrames.push({t,circle:parseFloat(getComputedStyle(hero.querySelector('.site-preview-brand-hero-circle')).opacity),logo:parseFloat(getComputedStyle(hero.querySelector('img')).opacity),title:parseFloat(getComputedStyle(hero.querySelector('h2')).opacity)});
          }
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      await page.goto('http://127.0.0.1:8879/about/brand-guidelines/');
      const hero=page.locator('#cover');
      await hero.evaluate(e=>scrollTo({top:Math.max(0,scrollY+e.getBoundingClientRect().top-innerHeight*.85),behavior:'instant'}));
      await page.waitForTimeout(350);
      await page.screenshot({path:`tmp/brand-hero/mid-${width}.png`});
      await page.waitForFunction(()=>document.querySelector('#cover').classList.contains('site-preview-brand-hero-is-complete'));
      const frames=await page.evaluate(()=>window.__brandFrames);
      const first=key=>frames.find(f=>f[key]>.01);
      assert(first('circle')&&first('logo')&&first('title'));
      assert(first('logo').t-first('circle').t<300,'Logo starts within 300ms of drawing');
      assert(first('title').t-first('circle').t<400,'Title starts within 400ms of drawing');
      assert(frames.find(f=>f.logo===1&&f.title===1).t-first('circle').t<1200,'Main content completes within 1.2 seconds');
      assert(frames.some(f=>f.logo>0&&f.logo<1),'Logo fades smoothly');
      assert.equal(await hero.locator('img').evaluate(e=>getComputedStyle(e).opacity),'1');
      assert.equal(await hero.locator('.site-preview-brand-hero-cta').evaluate(e=>getComputedStyle(e).pointerEvents),'auto');
      await hero.screenshot({path:`tmp/brand-hero/after-${width}.png`});
      await page.close();
      console.log('PASS: immediate viewport entry, smooth reveal and timing',width);
    }
    const reduced=await browser.newPage({reducedMotion:'reduce'});
    await reduced.goto('http://127.0.0.1:8879/about/brand-guidelines/');
    assert.equal(await reduced.locator('#cover img').evaluate(e=>getComputedStyle(e).opacity),'1');
    assert.equal(await reduced.locator('#cover img').evaluate(e=>getComputedStyle(e).animationName),'none');
    const plain=await browser.newPage({javaScriptEnabled:false});
    await plain.goto('http://127.0.0.1:8879/about/brand-guidelines/');
    assert.equal(await plain.locator('#cover img').evaluate(e=>getComputedStyle(e).opacity),'1');
    assert.deepEqual(errors,[]);
    console.log('PASS: reduced motion and no-JavaScript reading');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
