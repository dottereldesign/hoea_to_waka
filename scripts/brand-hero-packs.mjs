import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import svgpath from 'svgpath';
import {symbol,wordmark,width,height,lettering,svg,eps,name as fullName} from './brand-downloads.mjs';
const require=createRequire(import.meta.url),sharp=require('sharp'),PDFDocument=require('pdfkit');
const {zipSync}=require('fflate');
const out=new URL('../assets/brand-downloads/',import.meta.url),options={mtime:new Date('2026-10-25T00:00:00Z')};
const encode=text=>new TextEncoder().encode(text);
async function textArtwork(text){
 // Obtain real ink bounds before shifting the original vector paths.
 const probe=lettering(text,140,24,170,600,-4.9),probeSVG=svg(probe.paths,Math.ceil(probe.width+48),230,'#202329');
 const {info}=await sharp(Buffer.from(probeSVG)).trim({background:'#00000000'}).png().toBuffer({resolveWithObject:true});
 const left=-(info.trimOffsetLeft||0),top=-(info.trimOffsetTop||0);
 return {paths:probe.paths.map(d=>svgpath(d).translate(-left+4,-top+4).abs().toString()),w:info.width+8,h:info.height+8};
}
async function pdf(paths,w,h,colour){const doc=new PDFDocument({size:[w,h],margin:0,compress:true,info:{Title:'Hoea tō Waka brand artwork',CreationDate:new Date('2026-10-25T00:00:00Z'),ModDate:new Date('2026-10-25T00:00:00Z')}}),chunks=[];doc.on('data',chunk=>chunks.push(chunk));const done=new Promise((resolve,reject)=>{doc.on('end',resolve);doc.on('error',reject)});for(const path of paths)doc.path(path).fill(colour);doc.end();await done;return Buffer.concat(chunks)}
const name=await textArtwork('Hoea tō Waka'),url=await textArtwork('hoeatowaka.co.nz');
const transform=(paths,scale,x,y)=>paths.map(d=>svgpath(d).matrix([scale,0,0,scale,x,y]).abs().toString());
const line=wordmark.slice(symbol.length+fullName.paths.length);
async function cropArtwork(paths,w,h){const {info}=await sharp(Buffer.from(svg(paths,w,h,'#202329'))).trim({background:'#00000000'}).png().toBuffer({resolveWithObject:true});return {paths:transform(paths,1,(info.trimOffsetLeft||0)+4,(info.trimOffsetTop||0)+4),w:info.width+8,h:info.height+8}}
const tagline=await cropArtwork(line,width,height);
// Measure actual ink at 2x, so padding and the macron are included consistently.
async function ink(paths,w,h){const {info}=await sharp(Buffer.from(svg(paths,w,h,'#202329'))).resize({width:Math.round(w*2)}).trim({background:'#00000000'}).png().toBuffer({resolveWithObject:true});return {x:-(info.trimOffsetLeft||0)/2,y:-(info.trimOffsetTop||0)/2,w:info.width/2,h:info.height/2}}
const symbolInk=await ink(symbol,385,384),nameInk=await ink(name.paths,name.w,name.h);
const H=280,x=H/4;
function place(paths,box,target){return transform(paths,target.h/box.h,target.x-box.x*target.h/box.h,target.y-box.y*target.h/box.h)}
function measuredLayout(vertical){const nameHeight=vertical?H/3:H/2,markW=symbolInk.w/symbolInk.h*H,nameW=nameInk.w/nameInk.h*nameHeight;
 const w=Math.ceil(vertical?nameW+2*x:markW+nameW+3*x),h=vertical?H+nameHeight+3*x:H+2*x;
 const mark={x:vertical?(w-markW)/2:x,y:x,w:markW,h:H},text={x:vertical?(w-nameW)/2:mark.x+mark.w+x,y:vertical?mark.y+H+x:x+(H-nameHeight)/2,w:nameW,h:nameHeight};
 return {paths:[...place(symbol,symbolInk,mark),...place(name.paths,nameInk,text)],w:Math.ceil(w),h:Math.ceil(h),mark,name:text,gap:x};
}
const horizontal=measuredLayout(false),stackedBase=measuredLayout(true);
function stacked(withLine){if(!withLine)return stackedBase;const scale=stackedBase.name.h/nameInk.h,lineScale=Math.min(scale,stackedBase.name.w/tagline.w),lineTop=stackedBase.name.y+stackedBase.name.h+x/2;return {paths:[...stackedBase.paths,...transform(tagline.paths,lineScale,(stackedBase.w-tagline.w*lineScale)/2,lineTop)],w:stackedBase.w,h:Math.ceil(lineTop+tagline.h*lineScale+x)}}
const round=value=>Math.round(value*1000)/1000;
function construction(layout,vertical,colour){const margin=60,w=layout.w+2*margin,h=layout.h+2*margin,m=layout.mark,n=layout.name;
 const segment=(x1,y1,x2,y2)=>`<path d="M${round(x1)} ${round(y1)}L${round(x2)} ${round(y2)}"/>`;
 const label=(px,py,text,anchor='middle')=>`<text x="${round(px)}" y="${round(py)}" text-anchor="${anchor}">${text}</text>`;
 const measure=(x1,y1,x2,y2,text)=>{const v=x1===x2;return segment(x1,y1,x2,y2)+(v?segment(x1-6,y1,x1+6,y1)+segment(x2-6,y2,x2+6,y2):segment(x1,y1-6,x1,y1+6)+segment(x2,y2-6,x2,y2+6))+(v?label(x1-12,(y1+y2)/2+8,text,'end'):label((x1+x2)/2,y1-12,text))};
 const guides=[`<rect x="0" y="0" width="${layout.w}" height="${layout.h}"/>`,... [m,n].map(b=>`<rect x="${round(b.x)}" y="${round(b.y)}" width="${round(b.w)}" height="${round(b.h)}"/>`)];
 for(const b of [m,n]){guides.push(segment(b.x,0,b.x,layout.h),segment(b.x+b.w,0,b.x+b.w,layout.h),segment(0,b.y,layout.w,b.y),segment(0,b.y+b.h,layout.w,b.y+b.h));}
 if(vertical)guides.push(segment(layout.w/2,0,layout.w/2,layout.h));else guides.push(segment(0,m.y+H/2,layout.w,m.y+H/2));
 const dims=[measure(m.x-30,m.y,m.x-30,m.y+H,'H')];
 if(vertical){dims.push(measure(m.x+m.w+35,m.y+H,m.x+m.w+35,n.y,'x'),measure(0,layout.h-24,n.x,layout.h-24,'x'));}
 else{dims.push(measure(m.x+m.w,m.y-28,n.x,m.y-28,'x'),measure(0,layout.h-24,m.x,layout.h-24,'x'));}
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>Hoea tō Waka ${vertical?'stacked':'horizontal'} lock-up construction</title><desc>H is the symbol height. x is one quarter of H. The gap and minimum outer clear space are x. The name is ${vertical?'one third':'half'} the symbol height, including its macron.</desc><g transform="translate(${margin} ${margin})" fill="none" stroke="${colour}" stroke-width="1" stroke-dasharray="3 6" opacity=".3">${guides.join('')}</g><g transform="translate(${margin} ${margin})">${layout.paths.map(d=>`<path fill="${colour}" d="${d}"/>`).join('')}</g><g transform="translate(${margin} ${margin})" fill="none" stroke="${colour}" stroke-width="1.5" opacity=".85">${dims.join('')}</g><style>path,rect{vector-effect:non-scaling-stroke}text{fill:${colour};stroke:none;font:30px Arial,sans-serif}@media(max-width:500px){text{font-size:72px}}</style></svg>\n`;
}
for(const [id,layout,vertical]of [['horizontal',horizontal,false],['stacked',stackedBase,true]])for(const [colour,ink]of [['black','#202329'],['white','#FFFFFF']])await writeFile(new URL(`hoea-to-waka-lockups-${id}-construction-${colour}.svg`,out),construction(layout,vertical,ink));
const dimensions=layout=>({width:layout.w,height:layout.h,mark:layout.mark,name:layout.name,gap:layout.gap});
await writeFile(new URL('lockup-construction.json',out),JSON.stringify({H,x,minimumClearSpace:x,horizontal:dimensions(horizontal),stacked:dimensions(stackedBase)},null,2)+'\n');
const lockups=[{name:'Horizontal',id:'horizontal',paths:wordmark,w:width,h:height},{name:'Horizontal - No Brand Line',id:'horizontal-no-brand-line',...horizontal},{name:'Stacked',id:'stacked',...stacked(true)},{name:'Stacked - No Brand Line',id:'stacked-no-brand-line',...stacked(false)}];
const art=[
 {id:'logomarks',label:'Logomarks',variants:[{name:'Symbol',paths:symbol,w:385,h:384}]},
 {id:'wordmarks',label:'Wordmarks',variants:[{name:'Name',...name}]},
 {id:'url-wordmarks',label:'URL Wordmarks',variants:[{name:'Website',...url}]},
 {id:'lockups',label:'Lockups',variants:lockups}
];
for(const pack of art){const entries={},root=`Hoea to Waka ${pack.label}`;
 const put=(path,bytes)=>{entries[`${root}/${path}`]=[typeof bytes==='string'?encode(bytes):new Uint8Array(bytes),options]};
 for(const variant of pack.variants)for(const colour of ['Black','White']){const ink=colour==='White'?'#FFFFFF':'#202329',base=`hoea-to-waka-${pack.id}${pack.id==='lockups'?'-'+variant.id:''}-${colour.toLowerCase()}`,folder=pack.id==='lockups'?`${variant.name}/`:'';
 const source=svg(variant.paths,variant.w,variant.h,ink),png=await sharp(Buffer.from(source)).resize({width:pack.id==='logomarks'?1024:2560}).png().toBuffer();
 put(`${folder}RGB/SVG/${base}.svg`,source);put(`${folder}RGB/PNG/${base}.png`,png);
 put(`${folder}RGB/PDF/${base}.pdf`,await pdf(variant.paths,variant.w,variant.h,ink));
 put(`${folder}RGB/EPS/${base}.eps`,eps(variant.paths,variant.w,variant.h,ink));
 if(['lockups','url-wordmarks'].includes(pack.id))await writeFile(new URL(base+'.svg',out),source);
 put(`${folder}CMYK/PDF/${base}.pdf`,await pdf(variant.paths,variant.w,variant.h,colour==='White'?[0,0,0,0]:[0,0,0,100]));
 put(`${folder}CMYK/EPS/${base}.eps`,eps(variant.paths,variant.w,variant.h,ink).replace(/[\d.]+ [\d.]+ [\d.]+ setrgbcolor/,colour==='White'?'0 0 0 0 setcmykcolor':'0 0 0 1 setcmykcolor'));
 }
 put('READ ME.txt',`Hoea tō Waka — ${pack.label}\n\n${pack.id==='logomarks'?'Symbol only, without lettering.':pack.id==='wordmarks'?'The outlined brand name, without the symbol or brand line.':pack.id==='url-wordmarks'?'The website address as outlined artwork: hoeatowaka.co.nz. Use when directing people to the website; keep the actual website link clickable in digital material.':'Four fixed layouts: Horizontal (the existing full logo), Horizontal - No Brand Line, Stacked, and Stacked - No Brand Line. Use Horizontal - No Brand Line as the primary lock-up. Choose a stacked layout for a narrow or square placement. For the two No Brand Line layouts, H is the actual symbol height; x = H/4. The gap and minimum outer clear space are x. The horizontal name height is H/2; the stacked name height is H/3, including the macron. Horizontal artwork is centred vertically and stacked artwork shares a centre axis. These proportions are built into the files. If the full brand line is present, retain its two rules. Do not rearrange parts yourself.'}\n\nRGB: SVG for scalable digital work, transparent PNG for presentations and office apps, PDF/EPS for vector workflows.\nCMYK: PDF and EPS for print. Black is 100% K; white is unprinted/knockout artwork and requires an appropriate background or substrate. These files do not specify white-ink printing. Ask your printer to confirm the production setup and supply a proof.\n\nBlack and white versions are included. White artwork may look empty on a white viewer background. All lettering is outlined; fonts do not need to be installed. Keep proportions, the macron and all artwork intact. No native Illustrator source is included; Illustrator can open the vector files.\n\nGuide: https://www.hoeatowaka.co.nz/about/brand-guidelines/\n`);
 await writeFile(new URL(`hoea-to-waka-${pack.id}-pack.zip`,out),zipSync(entries,{level:6}));
}
const imageEntries={},imageRoot='Hoea to Waka Images';
for(const name of ['shirt-example','travel-mug','stickers-mockup','totebag-mockup','lanyard-mockup','enamel-mockup','business-cards'])imageEntries[`${imageRoot}/Mockup previews/${name}.webp`]=[new Uint8Array(await readFile(new URL(`../assets/brand-previews/${name}.webp`,import.meta.url))),options];
imageEntries[`${imageRoot}/READ ME.txt`]=[encode('Hoea tō Waka — Images\n\nThis pack contains seven WebP mockup previews already displayed in the brand guide. Use them as visual references for placement and presentation. They are not editable production templates, print-ready artwork or a photography library. Do not send these previews to a manufacturer as final artwork. Prepare production work with the logo, font and supplier specifications instead.\n\nGuide: https://www.hoeatowaka.co.nz/about/brand-guidelines/\n'),options];
await writeFile(new URL('hoea-to-waka-images-pack.zip',out),zipSync(imageEntries,{level:6}));
console.log('Hero downloads: logomarks, wordmarks, URL wordmarks, lockups and image packs; RGB/CMYK artwork folders');
