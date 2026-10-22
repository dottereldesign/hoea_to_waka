import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {parseHTML} from 'linkedom';
const require=createRequire(import.meta.url),svgpath=require('svgpath'),fontkit=require('fontkit');
const {decompress}=require('wawoff2');
const latinSource=fontkit.create(Buffer.from(await decompress(await readFile('assets/fonts/themes/inter-latin-3.woff2'))));
const extendedSource=fontkit.create(Buffer.from(await decompress(await readFile('assets/fonts/themes/inter-latin-ext-2.woff2'))));
const artwork=await readFile('assets/brand-downloads/hoea-to-waka-horizontal-black.svg','utf8');
const scale=520/Number(artwork.match(/viewBox="0 0 ([\d.]+) /)[1]);
const logo=[...artwork.matchAll(/<path[^>]* d="([^"]+)"/g)].map(m=>svgpath(m[1]).matrix([scale,0,0,scale,290,310]).abs().unshort().unarc().round(2).toString());
const facesByWeight=new Map();
function lettering(text,x,y,anchor='start',size=19,weight=500){
 if(!facesByWeight.has(weight))facesByWeight.set(weight,[latinSource.getVariation({wght:weight}),extendedSource.getVariation({wght:weight})]);
 const faces=facesByWeight.get(weight);
 let cursor=0,parts=[];
 for(const character of text){
  const face=faces.find(f=>f.hasGlyphForCodePoint(character.codePointAt(0)));
  const glyph=face.glyphForCodePoint(character.codePointAt(0)),factor=size/face.unitsPerEm;
  if(glyph.path.commands.length)parts.push(svgpath(glyph.path.toSVG()).matrix([factor,0,0,-factor,cursor,0]).abs().unshort().unarc());
  cursor+=glyph.advanceWidth*factor+size*.01;
 }
 const offset=anchor==='middle'?-cursor/2:0;
 return parts.map(p=>p.translate(x+offset,y).round(2).toString()).join('');
}
function bounds(d){
 let x=0,y=0,xs=[],ys=[];
 for(const [command,...v] of svgpath(d).abs().unshort().unarc().segments){
  if(command==='Z')continue;
  if(command==='H'){x=v[0];xs.push(x);ys.push(y);continue;}
  if(command==='V'){y=v[0];xs.push(x);ys.push(y);continue;}
  for(let i=0;i<v.length;i+=2){xs.push(v[i]);ys.push(v[i+1]);}
  [x,y]=v.slice(-2);
 }
 return {x:Math.min(...xs),y:Math.min(...ys),right:Math.max(...xs),bottom:Math.max(...ys)};
}
const fixed=n=>n.toFixed(2);
function hatch(d,seed){
 const b=bounds(d);
 let lines=[];
 // Alternating passes follow the way a pencil shades a small shape by hand.
 const left=b.x-2,right=b.right+2,rise=(right-left)*.23;
 for(let y=b.y-1,i=0;y<b.bottom+rise+2;y+=1.65,i++){
  const jitter=Math.sin(i*2.17+seed)*.26;
  const a=i%2?right:left,z=i%2?left:right;
  const start=i%2?y-rise:y,end=i%2?y:y-rise;
  lines.push(`${i ? 'L' : 'M'}${fixed(a)} ${fixed(start+jitter)}Q${fixed((left+right)/2)} ${fixed(y-rise/2-.35)} ${fixed(z)} ${fixed(end+.18)}`);
 }
 return lines.join('');
}
let serial=0,currentSide='front';
function pencil(d,delay,duration=650){
 const index=serial++,id=`card-${currentSide}-pencil-${index}`,shade=hatch(d,index);
 // Independent light retracing avoids a perfectly machined vector edge.
 return `<g class="bc-pencil-letter"><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${d}"/></clipPath></defs><path class="bc-graphite-outline" data-bc-pencil data-pencil-pass="outline" data-pencil-delay="${delay}" data-pencil-duration="${duration}" pathLength="1" d="${d}"/><path class="bc-graphite-echo" data-bc-pencil data-pencil-pass="echo" data-pencil-delay="${delay+90}" data-pencil-duration="${duration+100}" pathLength="1" transform="translate(.32 -.22)" d="${d}"/><g clip-path="url(#${id})"><path class="bc-graphite-shade" data-bc-pencil data-pencil-pass="shade" data-pencil-delay="${delay+210}" data-pencil-duration="${Math.round(duration*.85)}" pathLength="1" d="${shade}"/></g></g>`;
}
const path='about/brand-guidelines/index.html';let html=await readFile(path,'utf8');
const {document}=parseHTML(html);
const text=selector=>document.querySelector(selector).textContent.replace(/\s+/g,' ').trim();
const name=text('.preview-business-card-name'),role=text('.preview-business-card-role');
const details=[...document.querySelectorAll('.preview-business-card-details p')].map(p=>({label:p.querySelector('strong').textContent.trim(),value:p.textContent.replace(p.querySelector('strong').textContent,'').trim()}));
const services=[...document.querySelectorAll('.preview-business-card-footer span')].map(e=>e.textContent.trim());
const escape=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const original=html.match(/<figure class="brand-card-study"[^>]*>[\s\S]*?<\/figure>/)?.[0];
if(!original)throw Error('Card study template missing');
const template=original.replace(/<div class="brand-card-study__heading">[\s\S]*?<\/div>/,'').replace(/<path class="bc-sketch-stroke"[^>]*\/>/,'');
function dimensions(){return `<g class="bc-dimensions" aria-hidden="true">${pencil(lettering('90 mm',550,53,'middle'),780,650)}<g transform="rotate(90 1062 392)">${pencil(lettering('55 mm',1062,392,'middle'),850,650)}</g></g>`;}
function annotations(){return `<g class="bc-annotations"><path class="bc-pencil" data-bc-draw pathLength="1" d="M90 685L90 737H235M120 655L345 737H455M150 625L610 737H675"/><g aria-hidden="true">${[['Bleed · 3 mm',100,1050],['Trim / cut line',356,1150],['Safe area',685,1250]].map(([text,x,delay])=>pencil(lettering(text,x,772),delay,700)).join('')}</g></g>`;}
function row(value,x,y,size,delay,weight=500,anchor='start'){return `<g data-card-text="${escape(value)}">${pencil(lettering(value,x,y,anchor,size,weight),delay,700)}</g>`;}
function backArtwork(){
 const content=[row(name,200,240,50,380,600),row(role.toUpperCase(),200,282,23,520)];
 details.forEach((detail,i)=>content.push(row(detail.label,200,365+i*45,20,700+i*130,600),row(detail.value,245,365+i*45,28,740+i*130)));
 const positions=[{x:190,w:220},{x:430,w:150},{x:600,w:140}];
 services.forEach((service,i)=>{const {x,w}=positions[i];content.push(`<rect class="bc-service-pill" data-bc-draw pathLength="1" x="${x}" y="563" width="${w}" height="44" rx="22"/>`,row(service,x+w/2,591,19,1180+i*100,500,'middle'));});
 return `<g class="bc-art bc-back-art" aria-hidden="true">${content.join('')}</g>`;
}
function study(side){
 currentSide=side;
 const art=side==='front'?`<g class="bc-art bc-pencil-art" aria-hidden="true">${logo.map((d,i)=>pencil(d,380+i*19,i<5?900:560)).join('')}</g>`:backArtwork();
 const description=side==='front'?'Front of the 90 × 55 mm business card: Hoea tō Waka logo and Strength in Aotearoa wordmark in pencil, with 3 mm bleed, trim and safe-area guides.':`Back of the 90 × 55 mm business card: ${name}, ${role}. ${details.map(d=>d.value).join('; ')}. ${services.join(', ')}. Pencil lettering with 3 mm bleed, trim and safe-area guides.`;
 return template
  .replace(/<figure[^>]*>/,`<figure class="brand-card-study" data-card-study data-card-side="${side}">`)
  .replace(/aria-labelledby="[^"]*"/,`aria-labelledby="card-${side}-title card-${side}-desc"`)
  .replace(/<title[^>]*>[\s\S]*?<\/title>/,`<title id="card-${side}-title">Business card ${side} — pencil study</title>`)
  .replace(/<desc[^>]*>[\s\S]*?<\/desc>/,`<desc id="card-${side}-desc">${escape(description)}</desc>`)
  .replace(/card-(?:front-|back-)?paper-grid/g,`card-${side}-paper-grid`)
  .replace(/<!-- card-pencil-logo:start -->[\s\S]*?<!-- card-pencil-logo:end -->/,`<!-- card-pencil-logo:start -->${art}<!-- card-pencil-logo:end -->`)
  .replace(/<!-- card-pencil-dimensions:start -->[\s\S]*?<!-- card-pencil-dimensions:end -->/,`<!-- card-pencil-dimensions:start -->${dimensions()}<!-- card-pencil-dimensions:end -->`)
  .replace(/<!-- card-pencil-annotations:start -->[\s\S]*?<!-- card-pencil-annotations:end -->/,`<!-- card-pencil-annotations:start -->${annotations()}<!-- card-pencil-annotations:end -->`)
  .replace(/<figcaption>[\s\S]*?<\/figcaption>/,`<figcaption>${side==='front'?'Front · 90 × 55 mm finished card with 3 mm bleed. Keep the logo inside the safe area and confirm the setup with your printer.':'Back · Name, role and contact details, with the same bleed, trim and safe-area guides. Check every contact detail before printing.'}</figcaption>`);
}
const studies=`<!-- card-studies:start -->${study('front')}\n${study('back')}<!-- card-studies:end -->`;
html=html.includes('<!-- card-studies:start -->')?html.replace(/<!-- card-studies:start -->[\s\S]*?<!-- card-studies:end -->/,studies):html.replace(original,studies);
await writeFile(path,html);
console.log(`Card pencil studies: front and back, ${serial} traced shapes with graphite shading`);
