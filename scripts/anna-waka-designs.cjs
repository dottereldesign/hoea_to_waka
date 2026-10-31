const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const server=require('./preview.cjs')(8919),b=await chromium.launch({channel:'chrome'});try{fs.mkdirSync('tmp/waka-designs',{recursive:true});for(const width of [1440,390]){
 const p=await b.newPage({viewport:{width,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8919/about/');await p.waitForFunction(()=>!!document.querySelector('.anna-river')?.dataset.stops);
 assert.equal(await p.locator('.anna-river').getAttribute('data-waka-design'),'2','Cedar canoe is the default');
 const hulls=new Set();
 for(let i=0;i<10;i++){await p.locator(`button[data-waka-design="${i}"]`).click();assert.equal(await p.locator('.anna-waka-options [aria-pressed=true]').count(),1);assert.equal(await p.locator('.anna-river').getAttribute('data-waka-design'),String(i+1));hulls.add(await p.locator('.river-kayak__hull').getAttribute('d'));await p.locator('.anna-waka-controls').screenshot({path:`tmp/waka-designs/${width}-${i}.png`});}
 assert.equal(hulls.size,10,'Ten distinct silhouettes');await p.locator('.anna-milestone').nth(2).scrollIntoViewIfNeeded();await p.waitForTimeout(500);await p.screenshot({path:`tmp/waka-designs/controls-${width}.png`});
 const box=await p.locator('.anna-waka-controls').boundingBox();assert(box.y>=80&&box.y<130,'Switcher stays available during journey');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);console.log('PASS ten distinct waka designs, selection and sticky toolbar',width);await p.close();
}}finally{await b.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
