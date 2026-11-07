// Usage: node scripts/header-flash-debug.cjs [capture-name] [page-path]
// Records computed colours, geometry, animation timelines and occlusion each frame,
// plus a screenshot strip. Output: tmp/header-flash-<capture-name>.{json,png}
// Run before and after changes; header-flash-regression.test.cjs checks the invariants.
const {chromium}=require('playwright');
const fs=require('fs');
const sharp=require('sharp');
(async()=>{
 const label=(process.argv[2]||'after').replace(/[^a-z0-9_-]/gi,'-');
 const browser=await chromium.launch({channel:'chrome'});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:8766/hoea_to_waka/'+(process.argv[3]||''));
  await page.waitForTimeout(1600);
  await page.evaluate(()=>scrollTo({top:180,behavior:'instant'}));
  await page.waitForTimeout(700);
  await page.evaluate(()=>{
   window.headerFrames=[];window.captureHeader=true;
   function frame(){
    const header=document.querySelector('[data-morph-header]');
    const notice=document.querySelector('[data-book-notice]');
    const glass=header.querySelector('.site-header-glass');
    const elements=['.site-brand-name','.site-nav','.site-nav-parent-link','.site-menu-toggle'].map(selector=>{
     const element=header.querySelector(selector),rect=element.getBoundingClientRect(),style=getComputedStyle(element);
     return{selector,x:rect.x,y:rect.y,width:rect.width,color:style.color,opacity:style.opacity,
      cover:document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2)?.className};
    });
    headerFrames.push({time:performance.now(),scroll:scrollY,notice:notice.getBoundingClientRect().bottom,
     morph:header.dataset.headerMorph,glassOpacity:getComputedStyle(glass).opacity,elements,
     animations:header.getAnimations({subtree:true}).map(a=>({target:a.effect.target.className,time:a.currentTime,state:a.playState}))});
    if(captureHeader)requestAnimationFrame(frame);
   }
   frame();const start=performance.now();
   function up(time){scrollTo({top:Math.max(0,180-(time-start)*.6),behavior:'instant'});if(time-start<300)requestAnimationFrame(up)}
   requestAnimationFrame(up);
  });
  const layers=[];
  for(let i=0;i<12;i++){
   await page.waitForTimeout(45);
   layers.push({input:await page.screenshot({clip:{x:0,y:0,width:1440,height:145}}),top:i*145,left:0});
  }
  const data=await page.evaluate(()=>{captureHeader=false;return headerFrames});
  fs.mkdirSync('tmp',{recursive:true});
  fs.writeFileSync('tmp/header-flash-'+label+'.json',JSON.stringify(data,null,2));
  await sharp({create:{width:1440,height:1740,channels:3,background:'#ccc'}}).composite(layers).png().toFile('tmp/header-flash-'+label+'.png');
  console.log('Saved frame trace and screenshot strip: tmp/header-flash-'+label);
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
