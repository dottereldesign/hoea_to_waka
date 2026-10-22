import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),svgpath=require('svgpath'),fontkit=require('fontkit');
const {decompress}=require('wawoff2');
const latin=fontkit.create(Buffer.from(await decompress(await readFile('assets/fonts/themes/inter-latin-3.woff2')))).getVariation({wght:500});
const extended=fontkit.create(Buffer.from(await decompress(await readFile('assets/fonts/themes/inter-latin-ext-2.woff2')))).getVariation({wght:500});
const artwork=await readFile('assets/brand-downloads/hoea-to-waka-horizontal-black.svg','utf8');
const scale=520/Number(artwork.match(/viewBox="0 0 ([\d.]+) /)[1]);
const logo=[...artwork.matchAll(/<path[^>]* d="([^"]+)"/g)].map(m=>svgpath(m[1]).matrix([scale,0,0,scale,290,310]).abs().unshort().unarc().round(2).toString());
function lettering(text,x,y,anchor='start'){
 let cursor=0,parts=[];
 for(const character of text){
  const face=[latin,extended].find(f=>f.hasGlyphForCodePoint(character.codePointAt(0)));
  const glyph=face.glyphForCodePoint(character.codePointAt(0)),factor=19/face.unitsPerEm;
  if(glyph.path.commands.length)parts.push(svgpath(glyph.path.toSVG()).matrix([factor,0,0,-factor,cursor,0]).abs().unshort().unarc());
  cursor+=glyph.advanceWidth*factor+.19;
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
let serial=0;
function pencil(d,delay,duration=650){
 const index=serial++,id=`card-pencil-${index}`,shade=hatch(d,index);
 // Independent light retracing avoids a perfectly machined vector edge.
 return `<g class="bc-pencil-letter"><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${d}"/></clipPath></defs><path class="bc-graphite-outline" data-bc-pencil data-pencil-pass="outline" data-pencil-delay="${delay}" data-pencil-duration="${duration}" pathLength="1" d="${d}"/><path class="bc-graphite-echo" data-bc-pencil data-pencil-pass="echo" data-pencil-delay="${delay+90}" data-pencil-duration="${duration+100}" pathLength="1" transform="translate(.32 -.22)" d="${d}"/><g clip-path="url(#${id})"><path class="bc-graphite-shade" data-bc-pencil data-pencil-pass="shade" data-pencil-delay="${delay+210}" data-pencil-duration="${Math.round(duration*.85)}" pathLength="1" d="${shade}"/></g></g>`;
}
const logoMarkup=`<g class="bc-art bc-pencil-art" aria-hidden="true">${logo.map((d,i)=>pencil(d,380+i*19,i<5?900:560)).join('')}</g>`;
const dimensions=`<g class="bc-dimensions" aria-hidden="true">${pencil(lettering('90 mm',550,53,'middle'),780,650)}<g transform="rotate(90 1062 392)">${pencil(lettering('55 mm',1062,392,'middle'),850,650)}</g></g>`;
const annotations=`<g class="bc-annotations"><path class="bc-pencil" data-bc-draw pathLength="1" d="M90 685L90 737H235M120 655L345 737H455M150 625L610 737H675"/><g aria-hidden="true">${[['Bleed · 3 mm',100,1050],['Trim / cut line',356,1150],['Safe area',685,1250]].map(([text,x,delay])=>pencil(lettering(text,x,772),delay,700)).join('')}</g></g>`;
const path='about/brand-guidelines/index.html';let html=await readFile(path,'utf8');
html=html.replace(/<!-- card-pencil-logo:start -->[\s\S]*?<!-- card-pencil-logo:end -->|<g class="bc-art" data-bc-reveal>[\s\S]*?<\/g>/,`<!-- card-pencil-logo:start -->${logoMarkup}<!-- card-pencil-logo:end -->`);
html=html.replace(/<!-- card-pencil-dimensions:start -->[\s\S]*?<!-- card-pencil-dimensions:end -->|<g class="bc-dimensions" data-bc-reveal>[\s\S]*?<\/g>/,`<!-- card-pencil-dimensions:start -->${dimensions}<!-- card-pencil-dimensions:end -->`);
html=html.replace(/<!-- card-pencil-annotations:start -->[\s\S]*?<!-- card-pencil-annotations:end -->|<g class="bc-annotations" data-bc-reveal>[\s\S]*?<\/g>/,`<!-- card-pencil-annotations:start -->${annotations}<!-- card-pencil-annotations:end -->`);
html=html.replace('Example front design with the Hoea tō Waka logo. The outside line is the bleed edge, the solid line is the finished card, and the inner dashed line keeps important content clear of the cut.','Pencil construction of the Hoea tō Waka logo and wordmark, Strength in Aotearoa. The card is 90 mm by 55 mm, with 3 mm bleed. The outside line is the bleed edge, the solid line is the finished card, and the inner dashed line is the safe area.');
await writeFile(path,html);
console.log(`Card pencil artwork: ${logo.length} brand shapes, ${serial} traced shapes with graphite shading`);
