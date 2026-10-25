const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Axe=require('@axe-core/playwright').default;
(async()=>{
  fs.mkdirSync('tmp/books-pair',{recursive:true});
  const server=require('./preview.cjs')(8871),browser=await chromium.launch({channel:'chrome'});
  try{
    const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://www.youtube-nocookie.com/**',route=>route.abort());
    for(const width of [1920,1440,1280,1100,900,768,760,390,320]){
      await page.setViewportSize({width,height:1100});await page.goto('http://127.0.0.1:8871/resources/');
      const books=page.locator('#resource-books'),articles=books.locator('article');
      await books.scrollIntoViewIfNeeded();
      await books.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
      assert.equal(await articles.count(),2);assert.equal(await articles.locator(':scope > span').count(),0);
      assert.equal(await page.locator('.resources-browser__sidebar,[data-resources-browser]').count(),0);
      assert.deepEqual(await articles.locator('h3').allTextContents(),['My Brother Hemi','Maia Makes Waves']);
      assert.equal(await books.locator('.model-button').count(),2);
      assert.deepEqual(await books.locator('.book-amazon-button').evaluateAll(links=>links.map(link=>({url:link.href,target:link.target,color:getComputedStyle(link).backgroundColor}))),[
        {url:'https://www.amazon.com.au/dp/B0CJXDSMDG',target:'_blank',color:'rgb(255, 216, 20)'},
        {url:'https://www.amazon.com.au/dp/047373883X',target:'_blank',color:'rgb(255, 216, 20)'}
      ]);
      const geometry=await articles.evaluateAll(items=>items.map(item=>{
        const box=item.getBoundingClientRect(),image=item.querySelector('img').getBoundingClientRect(),copy=item.querySelector(':scope > div').getBoundingClientRect();
        return {x:box.x,y:box.y,right:box.right,bottom:box.bottom,imageRight:image.right,imageBottom:image.bottom,copyX:copy.x,copyY:copy.y,
          contained:[...item.querySelectorAll('img,h3,p,a')].every(node=>{const b=node.getBoundingClientRect();return b.left>=box.left-1&&b.right<=box.right+1})};
      }));
      if(width>760){assert(Math.abs(geometry[0].y-geometry[1].y)<1);assert(geometry[0].right<=geometry[1].x,'Books share a row without overlap');}
      else assert(geometry[0].bottom<=geometry[1].y,'Books stack on phones');
      for(const item of geometry){assert(item.contained,'Book content stays within its column');assert(width>1279?item.imageRight<=item.copyX:item.imageBottom<=item.copyY,'Artwork and copy do not overlap');}
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
      assert.equal(await page.locator('#resource-videos iframe').count(),2);
      if([1440,390].includes(width))assert.deepEqual((await new Axe({page}).include('#resource-books').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations,[]);
      if([1920,1440,900,390].includes(width))await books.screenshot({path:`tmp/books-pair/after-${width}.png`,style:'.site-header{visibility:hidden!important}'});
      console.log('PASS paired books, readable reflow, artwork/copy separation, purchase links and videos',width);
    }
    const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:1440,height:1100}});await plain.goto('http://127.0.0.1:8871/resources/');
    assert.equal(await plain.locator('#resource-books article').count(),2);assert.equal(await plain.locator('.resources-browser__sidebar').count(),0);
    assert.deepEqual(errors,[]);console.log('PASS accessibility and native layout without JavaScript');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
