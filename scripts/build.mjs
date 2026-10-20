import { build } from 'esbuild';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { tokeniseCSS } from './theme-css.mjs';
import { brandCSS } from './brand-css.mjs';
import { renderBrandGuidelines } from './brand-guidelines.mjs';

// HTML contains the final layouts. This build only compiles their styles and interactions.
const guidePath='about/brand-guidelines/index.html';
const guide=await readFile(guidePath,'utf8');
if(guide.includes('<!-- brand-colours:start -->'))await writeFile(guidePath,guide.replace(/<!-- brand-colours:start -->[\s\S]*?<!-- brand-colours:end -->/,renderBrandGuidelines()));
assert.equal(tokeniseCSS('.sample{color:var(--white);background:var(--black)}',new Set()),'.sample{color:var(--white);background:var(--black)}');
const colours=new Set();
for(const[source,target]of[['site.css','assets/site-palette.css'],['styles.css','assets/brand-palette.css'],['design/components.css','assets/components.css']]){
 const css=tokeniseCSS(await readFile(source,'utf8'),colours).replaceAll('url("assets/','url("').replaceAll("url('assets/","url('").replaceAll('url(assets/','url(');
 await writeFile(target,css);
}
const siteSource=await readFile('site.css','utf8');
const aliases=source=>tokeniseCSS(source,new Set()).match(/--[\w-]+\s*:[^;{}]*var\(--paint-[^;{}]+/g)||[];
const lightAliases=aliases(siteSource.match(/:root\s*\{([^}]+)\}/)[1]);
const darkAliases=aliases(siteSource.match(/html\[data-theme="dark"\]\s*\{([^}]+)\}/)?.[1]||'');
const presentation=tokeniseCSS(await readFile('design/presentation.css','utf8'),colours);
async function collectInline(folder='.'){
 for(const entry of await readdir(folder,{withFileTypes:true})){
  if(entry.name.startsWith('.')||['node_modules','tmp','assets','_site'].includes(entry.name))continue;
  const path=folder+'/'+entry.name;
  if(entry.isDirectory())await collectInline(path);
  else if(entry.name.endsWith('.html'))for(const match of(await readFile(path,'utf8')).matchAll(/#[\da-f]{6}\b/gi))colours.add(match[0].toLowerCase());
 }
}
await collectInline();
let theme=await readFile('design/theme-fonts.css','utf8');
theme+=brandCSS(colours);
theme+='\n[data-component-palette]{'+lightAliases.join(';')+'}\nhtml[data-theme="dark"] [data-component-palette]{'+darkAliases.join(';')+'}';
theme+='\n'+presentation;
for(const file of['brand-colours','header','model-button','home-monochrome','static-pages','section-spacing'])theme+='\n'+await readFile('design/'+file+'.css','utf8');
await writeFile('assets/theme.css',theme);
await build({entryPoints:['design/theme-init.js'],bundle:true,minify:true,format:'iife',target:['es2020'],outfile:'assets/theme-init.js'});
await build({entryPoints:['design/site-interactions.js'],bundle:true,minify:true,format:'iife',target:['es2020'],outfile:'assets/site-interactions.js',legalComments:'linked'});
