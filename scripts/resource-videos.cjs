const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Axe=require('@axe-core/playwright').default;
(async()=>{
  fs.mkdirSync('tmp/song-covers',{recursive:true});
  const server=require('./preview.cjs')(8888),browser=await chromium.launch({channel:'chrome'});
  try{
    const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    let playerRequests=0;
    page.on('pageerror',e=>errors.push(e.message));
    // Deterministic interaction checks; no third-party video or audio in this test.
    await page.route('https://www.youtube-nocookie.com/**',route=>{playerRequests++;return route.fulfill({contentType:'text/html',body:'<!doctype html><title>YouTube embed test</title><button>Video controls</button>'});});
    for(const width of [1440,900,768,390,320]){
      await page.setViewportSize({width,height:1100});await page.goto('http://127.0.0.1:8888/resources/');
      const videos=page.locator('#resource-videos');await videos.scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);
      await videos.locator('.resource-song-cover img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
      assert.equal(await videos.locator('iframe,.ds-number,.brand-name-text').count(),0);
      assert.equal(await videos.getByRole('button',{name:/^Play /}).count(),2);
      assert.equal(playerRequests,0,'No YouTube player loaded before a click');
      assert.deepEqual(await videos.locator('h3').allTextContents(),['Hoea tō Waka waiata-a-ringa','In This Together']);
      assert.equal(await videos.locator('.resource-video-link').count(),2);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const bounds=await videos.locator('.resource-song-cover').evaluateAll(covers=>covers.map(cover=>{
        const box=cover.getBoundingClientRect(),play=cover.querySelector('.resource-song-play').getBoundingClientRect(),copy=cover.querySelector('.resource-song-copy').getBoundingClientRect();
        return {valid:play.bottom<copy.top&&play.left>=box.left&&copy.right<=box.right&&copy.bottom<=box.bottom};
      }));assert(bounds.every(item=>item.valid),'Play icon and cover typography do not overlap');
      if([1440,320].includes(width))assert.deepEqual((await new Axe({page}).include('#resource-videos').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations,[]);
      if([1440,390,320].includes(width))await videos.screenshot({path:`tmp/song-covers/after-${width}.png`,style:'.site-header{visibility:hidden!important}'});
      console.log('PASS custom cover artwork, title typography, no WATCH labels, branded links, accessibility and responsive bounds',width);
    }
    const videos=page.locator('#resource-videos'),frames=videos.locator('[data-resource-video]');
    await videos.getByRole('button',{name:'Play Hoea tō Waka waiata-a-ringa on YouTube'}).focus();await page.keyboard.press('Space');
    const first=frames.nth(0).locator('iframe');await first.waitFor();
    const source=new URL(await first.getAttribute('src'));assert.equal(source.hostname,'www.youtube-nocookie.com');assert.equal(source.pathname,'/embed/PDqjgS_BJso');assert.equal(source.searchParams.get('autoplay'),'1');assert.equal(source.searchParams.get('playsinline'),'1');assert.equal(await first.getAttribute('referrerpolicy'),'strict-origin-when-cross-origin');assert((await first.getAttribute('allow')).includes('autoplay'));
    await videos.getByRole('button',{name:'Play In This Together on YouTube'}).click();
    assert.equal(await frames.nth(0).locator('iframe').count(),0);assert.equal(await frames.nth(0).locator('.resource-song-cover').count(),1);assert.equal(await frames.nth(1).locator('iframe').count(),1);
    assert((await frames.nth(1).locator('iframe').getAttribute('src')).includes('/embed/pNmZhLGvAS4?'));
    await videos.getByRole('button',{name:'Play Hoea tō Waka waiata-a-ringa on YouTube'}).focus();await page.keyboard.press('Enter');assert.equal(await videos.locator('iframe').count(),1);assert.equal(await frames.nth(1).locator('.resource-song-cover').count(),1);
    const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:8888/resources/');assert.equal(await plain.locator('#resource-videos .resource-song-cover[href^="https://www.youtube.com/watch"]').count(),2);assert.equal(await plain.locator('#resource-videos iframe').count(),0);
    assert.deepEqual(errors,[]);console.log('PASS click/Space/Enter activation, correct autoplay embed URLs, one song at a time, replay and no-JavaScript links');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
