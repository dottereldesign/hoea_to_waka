const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 try{
  for(const width of [390,768,1440])for(const reducedMotion of ['no-preference','reduce']){
   const page=await browser.newPage({viewport:{width,height:1100},reducedMotion});
   await page.addInitScript(()=>{
    window.wakaFrames=[];
    function sample(){
     const boat=document.querySelector('.river-kayak');
     if(boat){const r=boat.getBoundingClientRect();wakaFrames.push({transform:boat.getAttribute('transform'),visible:getComputedStyle(boat).visibility==='visible',x:r.x,y:r.y});}
     if(performance.now()<5000)requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
   });
   for(let pass=0;pass<2;pass++){
    if(pass)await page.reload();else await page.goto('http://127.0.0.1:8766/hoea_to_waka/about/');
    await page.waitForTimeout(600);
    const frames=await page.evaluate(()=>wakaFrames);
    const visible=frames.filter(f=>f.visible);
    assert(visible.length,'Waka never appeared');
    assert(visible.every(f=>/^translate\(/.test(f.transform)),'Visible waka has no river position');
    assert(visible.every((f,i)=>!i||Math.abs(f.x-visible[i-1].x)<8),'Waka jumped horizontally');
    fs.writeFileSync(`tmp/waka-first-paint-${width}-${reducedMotion}-${pass}.json`,JSON.stringify(frames,null,2));
   }
   await page.screenshot({path:`tmp/waka-fixed-${width}-${reducedMotion}.png`});
   await page.close();console.log('PASS initial load and refresh',width,reducedMotion);
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
