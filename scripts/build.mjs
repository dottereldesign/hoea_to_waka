import { build } from 'esbuild';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { tokeniseCSS } from './theme-css.mjs';
import assert from 'node:assert/strict';
import { brandCSS } from './brand-css.mjs';
import { readdir } from 'node:fs/promises';
import { renderBrandGuidelines } from './brand-guidelines.mjs';
const guidePath='about/brand-guidelines/index.html';
const guide=await readFile(guidePath,'utf8');
if(guide.includes('<!-- brand-colours:start -->'))await writeFile(guidePath,guide.replace(/<!-- brand-colours:start -->[\s\S]*?<!-- brand-colours:end -->/,renderBrandGuidelines()));
// Regression: a named CSS colour must never rewrite part of a custom-property name.
assert.equal(tokeniseCSS('.sample{color:var(--white);background:var(--black)}',new Set()),'.sample{color:var(--white);background:var(--black)}');
const colours=new Set();
const studioCSS=tokeniseCSS(await readFile('design/studio.css','utf8')+'\n'+await readFile('design/extended.css','utf8')+'\n'+await readFile('design/purpose-layouts.css','utf8'),colours);
for(const [source,target] of [['site.css','assets/site-palette.css'],['styles.css','assets/brand-palette.css']]){
  const css=tokeniseCSS(await readFile(source,'utf8'),colours).replaceAll('url("assets/','url("').replaceAll("url('assets/","url('").replaceAll('url(assets/','url(');
  await writeFile(target,css);
}
for(const value of (await readFile('design/directions.js','utf8')).matchAll(/#[\da-f]{6}/gi))colours.add(value[0]);
let themeCSS=await readFile('design/theme-fonts.css','utf8');
// Original-site aliases must be recomputed locally too, not inherited from the root palette.
const siteSource=await readFile('site.css','utf8');
const aliases=source=>tokeniseCSS(source,new Set()).match(/--[\w-]+\s*:[^;{}]*var\(--paint-[^;{}]+/g)||[];
const lightAliases=aliases(siteSource.match(/:root\s*\{([^}]+)\}/)[1]);
const darkAliases=aliases(siteSource.match(/html\[data-theme="dark"\]\s*\{([^}]+)\}/)[1]);
const presentation=tokeniseCSS(await readFile('design/presentation.css','utf8'),colours);
async function collectInline(folder='.') {
  for(const entry of await readdir(folder,{withFileTypes:true})) {
    if(entry.name.startsWith('.')||['node_modules','tmp','assets'].includes(entry.name))continue;
    const path=`${folder}/${entry.name}`;
    if(entry.isDirectory())await collectInline(path);
    else if(entry.name.endsWith('.html'))for(const match of (await readFile(path,'utf8')).matchAll(/#[\da-f]{6}\b/gi))colours.add(match[0].toLowerCase());
  }
}
await collectInline();
themeCSS+=brandCSS(colours);
themeCSS+=`\n[data-component-palette]{${lightAliases.join(';')}}\nhtml[data-theme="dark"] [data-component-palette]{${darkAliases.join(';')}}`;
await writeFile('assets/theme.css',themeCSS+'\n'+presentation+'\n'+await readFile('design/brand-colours.css','utf8')+'\n'+await readFile('design/header.css','utf8'));
await build({entryPoints:['design/theme-init.js'],bundle:true,minify:true,format:'iife',target:['es2020'],outfile:'assets/theme-init.js'});
await build({ entryPoints: ['design/site-layouts.jsx'], bundle: true, minify: true, format: 'iife', target: ['es2020'], outfile: 'assets/site-layouts.js', define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'linked' });
await writeFile('assets/design-studio.css',studioCSS);
await copyFile('design/LICENSE-MOTION-PRIMITIVES.txt','assets/LICENSE-MOTION-PRIMITIVES.txt');
await copyFile('design/THEME-RESEARCH.md','assets/THEME-RESEARCH.md');
await copyFile('design/FONT-RESEARCH-2026.md','assets/FONT-RESEARCH-2026.md');
