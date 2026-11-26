const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const startTestSite = require('./test-site.cjs');

(async () => {
  const {server, base} = await startTestSite();
  const browser = await chromium.launch({channel:'chrome'});
  try {
    const page = await browser.newPage({reducedMotion:'reduce'});
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      await page.goto(base+'resources/');
      const section = page.locator('#resource-videos');
      const tracks = section.locator('[data-track]');
      assert.equal(await tracks.count(),2);
      for (const [index,title,id] of [[1,'In This Together','pNmZhLGvAS4'],[0,'Hoea tō Waka','PDqjgS_BJso']]) {
        await tracks.nth(index).focus();
        await page.keyboard.press('Enter');
        await page.waitForFunction(()=>document.querySelector('[data-music-player]').dataset.playing==='true');
        assert.equal(await section.locator('[data-track-title]').textContent(),title);
        assert.equal(new URL(await section.locator('.music-youtube').getAttribute('href')).searchParams.get('v'),id);
        assert.equal(await tracks.nth(index).getAttribute('aria-current'),'true');
      }
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    }
    const plain=await browser.newPage({javaScriptEnabled:false});
    await plain.goto(base+'resources/');
    assert.equal(await plain.locator('[data-music-fallback] a[href$=".mp3"]').count(),2);
    assert(await plain.locator('[data-music-fallback] a[href*="transcripts"]').isVisible());
    console.log('PASS music selection, playback, YouTube destinations and native fallback');
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
