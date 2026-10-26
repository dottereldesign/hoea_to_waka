const fs=require('node:fs'),path=require('node:path');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),base='https://dottereldesign.github.io/hoea_to_waka/';
const routes=['','about/','model/','services/','services/in-house-workshops/','services/resilience-one-on-one/','services/workshops-for-support-professionals/','resources/','contact/','illustrations/','404.html','about/brand-guidelines/','about/jamies-workspace/','prompts/','brand/brand-system.html','pages/home.html'];
const documents=new Map(),failures=[],external=new Map(),checked=new Set();
function resolve(url){
  let pathname=decodeURIComponent(url.pathname);
  if(url.hostname==='dottereldesign.github.io'){
    if(!pathname.startsWith('/hoea_to_waka/'))return null;
    pathname=pathname.slice('/hoea_to_waka'.length);
  }else if(!['www.hoeatowaka.co.nz','hoeatowaka.co.nz'].includes(url.hostname))return null;
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)&&file!==root)return null;
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');}catch{}
  return file;
}
function document(file){if(!documents.has(file))documents.set(file,parseHTML(fs.readFileSync(file,'utf8')).document);return documents.get(file);}
(async()=>{
  for(const route of routes){
    const page=new URL(route,base),file=resolve(page),doc=document(file);
    for(const element of doc.querySelectorAll('img[srcset],source[srcset]'))for(const candidate of element.getAttribute('srcset').split(',')){
      const value=candidate.trim().split(/\s+/)[0];
      if(!value||value.startsWith('data:'))continue;
      const url=new URL(value,page),target=resolve(url);
      if(target){checked.add(url.href);if(!fs.existsSync(target))failures.push({route,value,reason:'Missing responsive image',target:path.relative(root,target)});}
    }
    for(const element of doc.querySelectorAll('a[href],img[src],script[src],link[rel=stylesheet],link[rel=icon],source[src]')){
      const value=element.getAttribute(element.hasAttribute('href')?'href':'src');
      if(!value||/^(mailto:|tel:|data:|blob:|javascript:)/i.test(value))continue;
      let url;try{url=new URL(value,page);}catch{failures.push({route,value,reason:'Invalid URL'});continue;}
      const target=resolve(url);
      if(!target){if(element.tagName==='A'&&/^https?:$/.test(url.protocol)){const entry=external.get(url.href)||{url:url.href,pages:[]};entry.pages.push(route||'/');external.set(url.href,entry);}continue;}
      checked.add(url.href);
      if(!fs.existsSync(target)){failures.push({route,value,reason:'Missing local file',target:path.relative(root,target)});continue;}
      if(element.tagName==='A'&&url.hash&&path.extname(target)==='.html'){
        const id=decodeURIComponent(url.hash.slice(1));
        if(id&&!document(target).getElementById(id)&&!document(target).querySelector(`[name="${id.replaceAll('"','\\"')}"]`))failures.push({route,value,reason:'Missing anchor',target:path.relative(root,target)});
      }
    }
  }
  const links=[...external.values()];
  // Check every external destination linked from the homepage; do not download bodies.
  const homepage=links.filter(link=>link.pages.includes('/'));
  let cursor=0;
  await Promise.all(Array.from({length:3},async()=>{while(cursor<homepage.length){const link=homepage[cursor++];try{const response=await fetch(link.url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(15000)});link.status=response.status;link.final=response.url;link.result=response.ok?'reachable':'requires manual verification (server refused HEAD or access)';}catch(error){link.result='unverified';link.error=error.message;}}}));
  const result={pages:routes.length,localDestinations:checked.size,externalDestinations:links.length,homepageExternalChecks:homepage.length,failures,external:links};
  fs.mkdirSync(path.join(root,'tmp/performance'),{recursive:true});fs.writeFileSync(path.join(root,'tmp/performance/links.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({pages:result.pages,localDestinations:checked.size,externalDestinations:links.length,homepageExternalChecks:homepage.length,failures},null,2));
  if(failures.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
