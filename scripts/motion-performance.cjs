const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const label=process.argv[2]||'before';
const routes=[['home','',1440],['home-mobile','',390],['guide','about/brand-guidelines/',1440],['guide-mobile','about/brand-guidelines/',390]];
const percentile=(values,p)=>values.length?[...values].sort((a,b)=>a-b)[Math.min(values.length-1,Math.floor(values.length*p))]:0;
(async()=>{
  const folder=path.resolve('tmp/performance',label);fs.mkdirSync(folder,{recursive:true});
  const server=require('./preview.cjs')(8891),browser=await chromium.launch({channel:'chrome'}),results=[];
  try{
    for(const [name,route,width]of routes){
      const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'no-preference'}),page=await context.newPage(),session=await context.newCDPSession(page),errors=[];
      await session.send('Emulation.setCPUThrottlingRate',{rate:4});
      page.on('pageerror',error=>errors.push(error.message));
      await page.addInitScript(()=>{
        window.__motion={phase:'initial-load',frames:[],tasks:[],clicks:[]};let last;
        const tick=time=>{if(last!==undefined)window.__motion.frames.push({phase:window.__motion.phase,delta:time-last});last=time;requestAnimationFrame(tick);};requestAnimationFrame(tick);
        new PerformanceObserver(list=>list.getEntries().forEach(entry=>window.__motion.tasks.push({phase:window.__motion.phase,duration:entry.duration,start:entry.startTime}))).observe({type:'longtask',buffered:true});
      });
      await session.send('Tracing.start',{categories:'devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline',transferMode:'ReturnAsStream'});
      await page.goto('http://127.0.0.1:8891/'+route,{waitUntil:'load'});await page.waitForTimeout(2200);
      const phase=async value=>page.evaluate(value=>{window.__motion.phase=value;performance.mark('profile:'+value);},value);
      await phase('pill-in');await page.evaluate(()=>scrollTo({top:110,behavior:'instant'}));await page.waitForTimeout(1000);
      await page.locator('.site-header-shell').screenshot({path:path.join(folder,name+'-pill.png')});
      await phase('pill-out');await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(1000);
      if(name==='home'){
        await phase('statement-and-pill');await page.locator('[data-home-statement]').evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight*.48,behavior:'instant'}));await page.waitForTimeout(1500);
      }
      await phase('menu-open');
      const click=await page.locator('[data-menu-toggle]').evaluate(e=>{const start=performance.now();e.click();return performance.now()-start;});
      await page.waitForTimeout(1000);
      await page.locator('.site-menu-panel').screenshot({path:path.join(folder,name+'-menu.png')});
      await phase('menu-close');await page.keyboard.press('Escape');await page.waitForTimeout(1000);
      const timing=await page.evaluate(()=>window.__motion);
      const complete=new Promise(resolve=>session.once('Tracing.tracingComplete',resolve));await session.send('Tracing.end');const {stream}=await complete;
      let raw='';while(true){const chunk=await session.send('IO.read',{handle:stream});raw+=chunk.data;if(chunk.eof)break;}await session.send('IO.close',{handle:stream});
      fs.writeFileSync(path.join(folder,name+'-trace.json'),raw);
      const events=JSON.parse(raw).traceEvents,totals={};
      for(const event of events)if(event.ph==='X'&&['Layout','UpdateLayoutTree','Paint','PrePaint','CompositeLayers','FunctionCall','RunTask'].includes(event.name)){const value=totals[event.name]||{count:0,totalMs:0,maxMs:0};value.count++;value.totalMs+=(event.dur||0)/1000;value.maxMs=Math.max(value.maxMs,(event.dur||0)/1000);totals[event.name]=value;}
      const phases={};for(const phase of new Set(timing.frames.map(frame=>frame.phase))){const values=timing.frames.filter(frame=>frame.phase===phase).map(frame=>frame.delta);phases[phase]={frames:values.length,p50Ms:percentile(values,.5),p95Ms:percentile(values,.95),maxMs:Math.max(...values),over25ms:values.filter(value=>value>25).length,longTasks:timing.tasks.filter(task=>task.phase===phase)};}
      const result={name,route,width,cpuSlowdown:4,clickMs:click,phases,traceTotals:totals,errors};results.push(result);
      fs.writeFileSync(path.join(folder,'motion-summary.json'),JSON.stringify(results,null,2));
      console.log(JSON.stringify({name,clickMs:+click.toFixed(1),phases:Object.fromEntries(Object.entries(phases).map(([key,value])=>[key,{p95:+value.p95Ms.toFixed(1),over25:value.over25ms,longTasks:value.longTasks.length}]))}));
      await context.close();
    }
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
