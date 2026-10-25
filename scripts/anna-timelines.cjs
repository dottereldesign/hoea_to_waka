const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Axe=require('@axe-core/playwright').default;
const ids=['thread','stack','worlds','horizon','constellation'];
const url='http://127.0.0.1:8889/about/';
const screenshotStyle='.site-header,.skip-link{visibility:hidden!important}';
(async()=>{
  fs.mkdirSync('tmp/anna-timelines',{recursive:true});
  const server=require('./preview.cjs')(8889),browser=await chromium.launch({channel:'chrome'});
  try{
    const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    for(const width of process.argv.includes('--runtime-only')?[]:[1440,1100,900,768,390,320]){
      await page.setViewportSize({width,height:1100});await page.goto(url);await page.evaluate(()=>document.fonts.ready);
      const root=page.locator('#anna-story');
      for(const id of ids){
        await root.locator(`[data-anna-study=${id}]`).click();await page.waitForTimeout(100);
        assert.equal(await root.getAttribute('data-timeline-variant'),id);
        assert.equal(await root.locator('[aria-pressed=true]').count(),1);
        assert.equal(await root.locator('.anna-milestone').count(),5);
        const text=await root.locator('.anna-list').innerText();
        for(const phrase of ['eight years','ten years','thirteen and over','Youth Guarantee','mother of five','Ngāi Tūāhuriri','humility'])assert(text.includes(phrase),phrase);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+id+' '+width);
        assert(await root.locator('.anna-milestone__copy').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1')));
        assert(await root.locator('.anna-world svg path').evaluateAll(paths=>paths.every(path=>{const b=path.getBBox();return [b.x,b.y,b.width,b.height].every(Number.isFinite)})));
        if([1440,320].includes(width))assert.deepEqual((await new Axe({page}).include('#anna-story').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations,[],id+' '+width);
        if([1440,390].includes(width))await root.screenshot({path:`tmp/anna-timelines/${id}-${width}.png`,style:screenshotStyle});
      }
      console.log('PASS all five layouts, complete biography, reduced motion, finite SVG geometry, accessibility and no overflow',width);
    }
    await context.close();
    const motion=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
    motion.on('pageerror',e=>errors.push(e.message));
    await motion.clock.install({time:new Date('2026-10-26T00:00:00Z')});await motion.goto(url);await motion.clock.pauseAt(new Date('2026-10-26T00:00:05Z'));
    const root=motion.locator('#anna-story'),items=root.locator('.anna-milestone'),first=items.first();
    // Flush the standard scroll event: virtual time can defer Chrome compositor events.
    const place=async(locator,fraction)=>{await locator.evaluate((e,p)=>{scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight*p,behavior:'instant'});dispatchEvent(new Event('scroll'));},fraction);await motion.waitForTimeout(60);};
    await place(first,1.15);await motion.clock.runFor(80);
    assert.equal(await first.evaluate(e=>+e.style.getPropertyValue('--tl-p')),0);
    await place(first,.6);await motion.clock.runFor(80);
    const values=[];
    for(let i=0;i<110;i++){await motion.clock.runFor(32);values.push(await first.evaluate(e=>+e.style.getPropertyValue('--tl-p')));}
    assert(values[0]>0&&values[0]<1,'Entry starts promptly: '+JSON.stringify(values.slice(0,8)));
    assert(Math.max(...values)>1.01&&Math.max(...values)<1.08,'Real spring overshoot stays restrained');
    assert.equal(values.at(-1),1,'The landing settles exactly');
    assert(values.slice(1).every((v,i)=>Math.abs(v-values[i])*48<12),'No large per-frame card jumps');
    assert(await first.locator('[data-draw]').evaluateAll(paths=>paths.every(path=>+path.style.strokeDashoffset===0)));
    const count=await root.getAttribute('data-timeline-frame');await motion.clock.runFor(2000);assert.equal(await root.getAttribute('data-timeline-frame'),count,'No idle RAF loop');
    await place(first,1.15);await motion.clock.runFor(80);await place(first,.6);await motion.clock.runFor(150);
    await motion.locator('[data-menu-toggle]').click();const covered=await root.getAttribute('data-timeline-frame');await motion.clock.runFor(500);assert.equal(await root.getAttribute('data-timeline-frame'),covered,'Header menu suspends procedural motion');
    await motion.keyboard.press('Escape');await motion.clock.runFor(2500);assert.equal(await first.evaluate(e=>+e.style.getPropertyValue('--tl-p')),1);
    console.log('PASS spring trajectory, restrained overshoot, exact settling, ink drawing, replay and menu suspension');
    await root.locator('[data-anna-study=stack]').click();await motion.clock.runFor(100);
    await place(items.nth(1),.15);await motion.clock.runFor(2200);
    assert.equal(await first.evaluate(e=>getComputedStyle(e).position),'sticky');
    assert((await first.evaluate(e=>+e.style.getPropertyValue('--tl-cover')))>0,'The preceding page yields as the next lands');
    await root.locator('[data-anna-study=horizon]').click();await motion.clock.runFor(2200);assert(await root.evaluate(e=>e.classList.contains('is-horizon-scroll')));
    const track=root.locator('.anna-list'),start=await track.evaluate(e=>getComputedStyle(e).transform);
    await root.locator('.anna-stage').evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-124+(e.offsetHeight-e.querySelector('.anna-pin').offsetHeight)*.55,behavior:'instant'}));await motion.waitForTimeout(60);await motion.clock.runFor(150);
    const moving=await track.evaluate(e=>getComputedStyle(e).transform);assert.notEqual(moving,start);
    await motion.clock.runFor(2500);const landed=await track.evaluate(e=>getComputedStyle(e).transform);assert.notEqual(landed,moving,'Pan follows with momentum');
    assert.equal(await root.locator('[data-anna-chapter]').textContent(),'03 / 05');
    await place(root.locator('.anna-stage'),.4);await motion.clock.runFor(3000);assert.equal(await root.locator('[data-anna-chapter]').textContent(),'01 / 05');
    console.log('PASS sticky paper stack, horizontal scroll journey, momentum and reverse travel');
    await root.locator('[data-anna-study=constellation]').click();await motion.clock.runFor(2000);assert((await root.locator('.anna-route__ink').getAttribute('d')).includes('C'));
    await motion.emulateMedia({reducedMotion:'reduce'});await motion.waitForTimeout(80);await motion.clock.runFor(100);assert.equal(await root.getAttribute('data-motion-reduced'),'true');
    await root.locator('[data-anna-study=horizon]').click();await motion.clock.runFor(100);assert(!(await root.evaluate(e=>e.classList.contains('is-horizon-scroll'))));
    await root.locator('[data-anna-next]').click();await motion.waitForTimeout(100);await motion.clock.runFor(100);assert.equal(await root.locator('[data-anna-chapter]').textContent(),'02 / 05');
    await motion.close();
    const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto(url);assert.equal(await plain.locator('.anna-world svg').count(),5);assert.equal(await plain.locator('.anna-milestone h3').count(),5);assert(await plain.locator('.anna-studies').isHidden());
    const delayed=await browser.newPage({reducedMotion:'reduce'});let release;const gate=new Promise(resolve=>release=resolve);await delayed.route('**/assets/anna-timelines.js*',async route=>{await gate;await route.continue()});
    await delayed.goto(url,{waitUntil:'commit'});await delayed.locator('#anna-story').waitFor();await delayed.evaluate(()=>document.fonts.ready);
    const before=await delayed.locator('#anna-story').evaluate(e=>e.offsetHeight);release();await delayed.waitForFunction(()=>document.querySelector('#anna-story').classList.contains('is-enhanced'));const after=await delayed.locator('#anna-story').evaluate(e=>e.offsetHeight);assert(Math.abs(after-before)<1,'Delayed enhancement reserves its layout');
    assert.deepEqual(errors,[]);console.log('PASS keyboard chapter controls, dynamic reduced motion, native SVG/story fallback and no delayed layout shift');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
