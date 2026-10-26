import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const arg=name=>process.argv.find(value=>value.startsWith('--'+name+'='))?.split('=').slice(1).join('=');
const phase=arg('phase')||'before',form=arg('form')||'all';
const force=process.argv.includes('--force');
const allRoutes=['','about/','model/','services/','services/in-house-workshops/','services/resilience-one-on-one/','services/workshops-for-support-professionals/','resources/','contact/','illustrations/','404.html','about/brand-guidelines/','about/jamies-workspace/','prompts/','brand/brand-system.html','pages/home.html'];
const routes=arg('routes')?arg('routes').split(',').map(value=>value==='home'?'':value):allRoutes;
const modes=form==='all'?['mobile','desktop']:[form];
const folder=path.resolve('tmp/performance',phase,'lighthouse');fs.mkdirSync(folder,{recursive:true});
const server=require('./preview.cjs')(8892);
fs.mkdirSync(path.join(folder,'chrome-profile'),{recursive:true});
const chrome=await chromeLauncher.launch({userDataDir:path.join(folder,'chrome-profile'),chromeFlags:['--headless=new','--no-first-run','--no-default-browser-check'],logLevel:'silent'});
let failures=0;
try{
  for(const route of routes)for(const mode of modes){
    const slug=(route||'home').replaceAll('/','_').replace(/_$/,''),file=path.join(folder,slug+'-'+mode);
    if(!force&&fs.existsSync(file+'.json')){console.log('EXISTS',route||'/',mode);continue;}
    try{
      const result=await lighthouse('http://127.0.0.1:8892/hoea_to_waka/'+route,{port:chrome.port,logLevel:'error',output:['json','html'],onlyCategories:['performance','accessibility','best-practices','seo'],maxWaitForLoad:45000},mode==='desktop'?desktopConfig:undefined);
      if(result.lhr.runtimeError)throw new Error(JSON.stringify(result.lhr.runtimeError));
      fs.writeFileSync(file+'.json',result.report[0]);fs.writeFileSync(file+'.html',result.report[1]);
      const lhr=result.lhr;
      console.log(JSON.stringify({route:route||'/',mode,scores:Object.fromEntries(Object.entries(lhr.categories).map(([key,value])=>[key,Math.round(value.score*100)])),lcp:Math.round(lhr.audits['largest-contentful-paint'].numericValue),tbt:Math.round(lhr.audits['total-blocking-time'].numericValue),cls:+lhr.audits['cumulative-layout-shift'].numericValue.toFixed(4)}));
    }catch(error){failures++;console.error('AUDIT ERROR',route||'/',mode,error.message);}
  }
}finally{try{await chrome.kill();}catch(error){console.warn('Chrome cleanup:',error.message);}server.close();}
const summaries=fs.readdirSync(folder).filter(file=>file.endsWith('.json')&&file!=='summary.json').map(file=>{
  const lhr=JSON.parse(fs.readFileSync(path.join(folder,file),'utf8'));
  return {file,requested:lhr.requestedUrl,final:lhr.finalDisplayedUrl||lhr.finalUrl,mode:lhr.configSettings.formFactor,
    scores:Object.fromEntries(Object.entries(lhr.categories).map(([key,value])=>[key,Math.round(value.score*100)])),
    metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(key=>[key,lhr.audits[key]?.numericValue])),
    failures:Object.values(lhr.audits).filter(audit=>audit.score!==null&&audit.score<.9&&!['manual','notApplicable','informative'].includes(audit.scoreDisplayMode)).map(audit=>({id:audit.id,title:audit.title,displayValue:audit.displayValue,metricSavings:audit.metricSavings,details:Array.isArray(audit.details?.items)?audit.details.items.slice(0,5):undefined}))};
});
fs.writeFileSync(path.join(folder,'summary.json'),JSON.stringify(summaries,null,2));
if(failures)process.exitCode=1;
