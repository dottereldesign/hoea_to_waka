import {readFile,writeFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
// Regenerate the canonical study before copying it: the guide always uses 08.
await import('./logo-construction.mjs');
const {document}=parseHTML(await readFile('illustrations/index.html','utf8'));
const svg=document.querySelector('[data-lc-panel="atlas-audited"] svg.lc-art');
if(!svg)throw Error('Study 08 artwork missing');
svg.setAttribute('class','brand-hero-outline-art');
for(const selector of ['.lc-circle','.lc-outline'])svg.querySelectorAll(selector).forEach((node,i)=>node.setAttribute('style',`--study-index:${i}`));
const artwork=svg.outerHTML.replaceAll('lc-atlas-audited','brand-outline-08');
const path='about/brand-guidelines/index.html';let html=await readFile(path,'utf8');
const study=`<div class="site-preview-brand-hero-logo-study" data-hero-pencil data-hero-outline="08">${artwork}</div>`;
html=html.replace(/<!-- hero-pencil:start -->[\s\S]*?<!-- hero-pencil:end -->/,`<!-- hero-pencil:start -->${study}<!-- hero-pencil:end -->`);
if(!html.includes('assets/brand-hero-outline.css'))html=html.replace('</head>','<link rel="stylesheet" href="../../assets/brand-hero-outline.css?v=2">\n</head>');
await writeFile(path,html);
console.log('Brand guideline hero: exact study 08 artwork, static grid and animated outlines');
