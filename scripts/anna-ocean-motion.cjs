const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 require('node:fs').mkdirSync('tmp',{recursive:true});
 const server=require('./preview.cjs')(8917);
 const browser=await chromium.launch({channel:'chrome'});
 try{for(const width of [1440,390])for(const speed of [600,1600]){
  const page=await browser.newPage({viewport:{width,height:width<=760?844:1000}});
  await page.goto('http://127.0.0.1:8917/about/');
  
  await page.waitForFunction(()=>!!document.querySelector('.anna-river')?.dataset.stops);
  const result=await page.evaluate(async speed=>{
   const svg=document.querySelector('.anna-river'),items=[...document.querySelectorAll('.anna-milestone')],copies=items.map(e=>e.querySelector('.anna-milestone__copy'));
   const stops=JSON.parse(svg.dataset.stops),start=+svg.dataset.release-50,end=stops.at(-1).departure+150;
   scrollTo({top:start,behavior:"instant"});await new Promise(r=>setTimeout(r,900));
   const seen=[],early=[];let previous,finishedAt;
   await new Promise(resolve=>{function frame(time){if(previous===undefined)previous=time;const y=Math.min(end,scrollY+speed*Math.min(.04,(time-previous)/1000));previous=time;scrollTo({top:y,behavior:"instant"});
    copies.forEach((e,i)=>{const opacity=+getComputedStyle(e).opacity,hit=items[i].classList.contains('river-node-hit');if(opacity>.01&&!hit)early.push(i);if(opacity>.9&&!seen[i])seen[i]={top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,boat:+svg.dataset.distance,node:stops[i].distance};});
    if(y>=end){finishedAt??=time;if(time-finishedAt>700){resolve();return;}}requestAnimationFrame(frame);}requestAnimationFrame(frame);});
   await new Promise(r=>setTimeout(r,500));return {seen,early};
  },speed);
  console.log('PASS waka-triggered reveals within reading area',width,speed,result.seen.map(e=>Math.round(e.top)));
  assert.equal(result.seen.filter(Boolean).length,5,'All chapters reveal during travel');
  assert.equal(result.early.length,0,'No text before waka arrives');
  result.seen.forEach(e=>assert(e.top>80&&e.top<850,'Chapter readable within viewport: '+e.top));
  if(speed===600){await page.locator('.anna-milestone').nth(2).scrollIntoViewIfNeeded();await page.waitForTimeout(400);await page.screenshot({path:`tmp/anna-retimed-${width}.png`});}
  await page.close();
 }}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

