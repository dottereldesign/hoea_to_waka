import * as css from 'css-tree';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';import {createHash} from 'node:crypto';
const pages=['index.html','about/index.html','model/index.html','services/index.html','services/in-house-workshops/index.html','services/resilience-one-on-one/index.html','services/workshops-for-support-professionals/index.html','resources/index.html','contact/index.html','illustrations/index.html','404.html','about/jamies-workspace/index.html','prompts/index.html'];
const sources=['site-palette','components','theme'];
const source=await Promise.all(sources.map(name=>readFile('assets/'+name+'.css','utf8')));
await mkdir('assets/page-styles',{recursive:true});
// Keep all states, attributes, pseudo-classes, keyframes, and dynamically named variants.
// Only remove selectors with a required, top-level class/ID absent from both markup
// and the page's scripts. Never reason from the current viewport or CSS coverage.
for(const file of pages){
 let html=await readFile(file,'utf8'),evidence=html;
 for(const match of html.matchAll(/<script[^>]+src="([^"?]+)[^"]*"/g)){
  if(/^https?:/.test(match[1]))continue;
  try{evidence+='\n'+await readFile(path.resolve(path.dirname(file),match[1]),'utf8');}catch{}
 }
 const known=new Set(evidence.match(/[a-zA-Z_][\w-]*/g)||[]);
 const dynamic=/^(?:is-|has-|ds-v\d|ex-v\d)/;
 const ast=css.parse(source.join('\n'));
 css.walk(ast,{visit:'Rule',enter(node,item,list){
  if(node.prelude?.type!=='SelectorList')return;
  node.prelude.children.forEach((selector,selectorItem,selectors)=>{
   let impossible=false;
   selector.children.forEach(part=>{if(['ClassSelector','IdSelector'].includes(part.type)&&!known.has(part.name)&&!dynamic.test(part.name))impossible=true;});
   if(impossible)selectors.remove(selectorItem);
  });
  if(node.prelude.children.isEmpty)list.remove(item);
 }});
 // Relative assets used to resolve beside theme.css; the bundle is one directory deeper.
 css.walk(ast,{visit:'Url',enter(node){if(!/^(?:data:|https?:|\/|#)/.test(node.value))node.value='../'+node.value;}});
 const result=css.generate(ast),slug=file==='index.html'?'home':file.replace(/\/index.html$/,'').replace(/\.html$/,'').replaceAll('/','-');
 const target='assets/page-styles/'+slug+'.css',hash=createHash('sha256').update(result).digest('hex').slice(0,10);
 await writeFile(target,result);
 let prefix=path.relative(path.dirname(file),'assets').replaceAll('\\','/');if(!prefix)prefix='assets';
 // Replace the old three blocking stylesheets with one smaller, route-specific sheet.
 html=html.replace(/\s*<link rel="stylesheet" href="[^"]*assets\/(?:site-palette|components)\.css[^" ]*">/g,'');
 html=html.replace(/<link rel="stylesheet" href="[^"]*assets\/(?:theme\.css|page-styles\/[^"?]+\.css)[^"]*">/,`<link rel="stylesheet" href="${prefix}/page-styles/${slug}.css?v=${hash}">`);
 await writeFile(file,html);console.log(file,source.join('').length,'→',result.length);
}
