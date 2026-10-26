const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const routes=[['home','',1440],['home-mobile','',390],['guide','about/brand-guidelines/',1440],['guide-mobile','about/brand-guidelines/',390]];
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
// Pass the pre-change Git revision to repeat a comparison after committing.
const baseline=process.argv[2]||'HEAD';
const originals=new Map();
const changed=execFileSync('git',['diff','--name-only',baseline],{encoding:'utf8'}).trim().split(/\r?\n/);
for(const file of changed)try{originals.set(file,execFileSync('git',['show',baseline+':'+file],{maxBuffer:10*1024*1024}));}catch{}
const mime=file=>/\.css$/.test(file)?'text/css':/\.js$/.test(file)?'application/javascript':/\.html$/.test(file)?'text/html':'application/octet-stream';
(async()=>{
 const server=require('./preview.cjs')(8898),browser=await chromium.launch({channel:'chrome'}),results=[];
 try{
  for(const [name,route,width] of routes)for(let repeat=0;repeat<3;repeat++)for(const version of repeat%2?['after','before']:['before','after']){
   const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),session=await context.newCDPSession(page);
   await session.send('Emulation.setCPUThrottlingRate',{rate:4});await session.send('Performance.enable');
   if(version==='before')await page.route('http://127.0.0.1:8898/**',async request=>{
    let file=decodeURIComponent(new URL(request.request().url()).pathname).replace(/^\/(?:hoea_to_waka\/)?/,'');
    if(!file||file.endsWith('/'))file+='index.html';
    const original=originals.get(file);
    if(original)await request.fulfill({body:original,contentType:mime(file)});else await request.continue();
   });
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.__sample={deltas:[],tasks:[],active:false};let previous;requestAnimationFrame(function tick(t){if(window.__sample.active&&previous)window.__sample.deltas.push(t-previous);previous=t;requestAnimationFrame(tick)});new PerformanceObserver(list=>{if(window.__sample.active)window.__sample.tasks.push(...list.getEntries().map(e=>e.duration));}).observe({type:'longtask'});});
   await page.goto('http://127.0.0.1:8898/'+route);await page.waitForTimeout(1800);
   const metric=async()=>Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
   const measure=async(phase,action)=>{
    const first=await metric();await page.evaluate(()=>{window.__sample={deltas:[],tasks:[],active:true};});
    const click=await action();await page.waitForTimeout(1000);
    const frames=await page.evaluate(()=>{window.__sample.active=false;return window.__sample}),last=await metric();
    const sorted=[...frames.deltas].sort((a,b)=>a-b);
    return {phase,clickMs:typeof click==='number'?click:undefined,p95:sorted[Math.floor(sorted.length*.95)],over25:sorted.filter(x=>x>25).length,frames:sorted.length,longTasks:frames.tasks.length,layoutCount:last.LayoutCount-first.LayoutCount,layoutMs:(last.LayoutDuration-first.LayoutDuration)*1000,styleMs:(last.RecalcStyleDuration-first.RecalcStyleDuration)*1000};
   };
   const phases=[];
   phases.push(await measure('pill-in',()=>page.evaluate(()=>scrollTo({top:110,behavior:'instant'}))));
   phases.push(await measure('pill-out',()=>page.evaluate(()=>scrollTo({top:0,behavior:'instant'}))));
   phases.push(await measure('menu-open',()=>page.locator('[data-menu-toggle]').evaluate(e=>{const start=performance.now();e.click();return performance.now()-start;})));
   phases.push(await measure('menu-close',()=>page.keyboard.press('Escape')));
   results.push({name,version,repeat,cpuSlowdown:4,phases,errors});
   fs.mkdirSync('tmp/performance/paired',{recursive:true});fs.writeFileSync('tmp/performance/paired/samples.json',JSON.stringify(results,null,2));
   console.log(name,version,repeat+1,JSON.stringify(phases.map(x=>({phase:x.phase,click:x.clickMs,layouts:x.layoutCount,layoutMs:Math.round(x.layoutMs),p95:x.p95}))));
   await context.close();
  }
  const summary=[];
  for(const [name]of routes)for(const version of ['before','after'])for(const phase of ['pill-in','pill-out','menu-open','menu-close']){
   const values=results.filter(x=>x.name===name&&x.version===version).map(x=>x.phases.find(p=>p.phase===phase));
   summary.push({name,version,phase,...Object.fromEntries(['p95','over25','longTasks','layoutCount','layoutMs','styleMs',...(phase==='menu-open'?['clickMs']:[])].map(key=>[key,median(values.map(x=>x[key]??0))]))});
  }
  fs.writeFileSync('tmp/performance/paired/summary.json',JSON.stringify(summary,null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
