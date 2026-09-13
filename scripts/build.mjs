import { build } from 'esbuild';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { tokeniseCSS } from './theme-css.mjs';
import { palettes, legacyColour, semanticTokens, tone } from '../design/theme-data.mjs';
import assert from 'node:assert/strict';
// Regression: a named CSS colour must never rewrite part of a custom-property name.
assert.equal(tokeniseCSS('.sample{color:var(--white);background:var(--black)}',new Set()),'.sample{color:var(--white);background:var(--black)}');
const colours=new Set();
const studioCSS=tokeniseCSS(await readFile('design/studio.css','utf8')+'\n'+await readFile('design/extended.css','utf8'),colours);
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
for(const palette of palettes){
  const paint=[...colours].map(c=>`--paint-${c.slice(1)}:${legacyColour(c,palette)}`);
  const levels=[.975,.93,.86,.76,.64,.50,.36,.24,.15,.08,.035,.009];
  palette.colours.forEach((seed,family)=>levels.forEach((level,i)=>paint.push(`--ramp-${family}-${i+1}:${tone(seed,level)}`)));
  themeCSS+=`\nhtml[data-palette="${palette.id}"],[data-component-palette="${palette.id}"]{${paint.join(';')}}`;
  for(const dark of [false,true]){const mode=dark?'[data-theme="dark"]':':not([data-theme="dark"])';themeCSS+=`\nhtml[data-palette="${palette.id}"]${mode},html${mode} [data-component-palette="${palette.id}"]{${Object.entries(semanticTokens(palette,dark)).map(([key,value])=>`--t-${key}:${value}`).join(';')}}`;}
}
themeCSS+=`\n[data-component-palette]{${lightAliases.join(';')}}\nhtml[data-theme="dark"] [data-component-palette]{${darkAliases.join(';')}}`;
await writeFile('assets/theme.css',themeCSS+'\n'+await readFile('design/appearance.css','utf8')+'\n'+await readFile('design/handoff.css','utf8')+'\n'+await readFile('design/component-colours.css','utf8'));
await build({entryPoints:['design/theme-init.js'],bundle:true,minify:true,format:'iife',target:['es2020'],outfile:'assets/theme-init.js'});
await build({entryPoints:['design/appearance.jsx'],bundle:true,minify:true,format:'iife',target:['es2020'],outfile:'assets/appearance.js',define:{'process.env.NODE_ENV':'"production"'}});
await build({ entryPoints: ['design/studio.jsx'], bundle: true, minify: true, format: 'iife', target: ['es2020'], outfile: 'assets/design-studio.js', define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'linked' });
await writeFile('assets/design-studio.css',studioCSS);
await copyFile('design/LICENSE-MOTION-PRIMITIVES.txt','assets/LICENSE-MOTION-PRIMITIVES.txt');
await copyFile('design/THEME-RESEARCH.md','assets/THEME-RESEARCH.md');
