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
const horizontal=await cropArtwork([...wordmark.slice(0,symbol.length),...fullName.paths],width,height);
const tagline=await cropArtwork(line,width,height);
function stacked(withLine){const w=720,nameScale=640/name.w,textTop=356,textHeight=name.h*nameScale,lineScale=Math.min(nameScale,640/tagline.w),lineTop=textTop+textHeight+26;
 const paths=[...transform(symbol,280/385,(w-280)/2,36),...transform(name.paths,nameScale,(w-name.w*nameScale)/2,textTop)];
 if(withLine)paths.push(...transform(tagline.paths,lineScale,(w-tagline.w*lineScale)/2,lineTop));
 return {paths,w,h:Math.ceil((withLine?lineTop+tagline.h*lineScale:textTop+textHeight)+36)};
}
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
 put('READ ME.txt',`Hoea tō Waka — ${pack.label}\n\n${pack.id==='logomarks'?'Symbol only, without lettering.':pack.id==='wordmarks'?'The outlined brand name, without the symbol or brand line.':pack.id==='url-wordmarks'?'The website address as outlined artwork: hoeatowaka.co.nz. Use when directing people to the website; keep the actual website link clickable in digital material.':'Four fixed layouts: Horizontal (the existing full logo), Horizontal - No Brand Line, Stacked, and Stacked - No Brand Line. Use Horizontal - No Brand Line as the primary lock-up, matching the website header. Choose a stacked layout for a narrow or square placement. Use a No Brand Line version when the small wording would be difficult to read. If the full brand line is present, retain its two rules. Do not rearrange parts yourself.'}\n\nRGB: SVG for scalable digital work, transparent PNG for presentations and office apps, PDF/EPS for vector workflows.\nCMYK: PDF and EPS for print. Black is 100% K; white is unprinted/knockout artwork and requires an appropriate background or substrate. These files do not specify white-ink printing. Ask your printer to confirm the production setup and supply a proof.\n\nBlack and white versions are included. White artwork may look empty on a white viewer background. All lettering is outlined; fonts do not need to be installed. Keep proportions, the macron and all artwork intact. No native Illustrator source is included; Illustrator can open the vector files.\n\nGuide: https://www.hoeatowaka.co.nz/about/brand-guidelines/\n`);
 await writeFile(new URL(`hoea-to-waka-${pack.id}-pack.zip`,out),zipSync(entries,{level:6}));
}
const imageEntries={},imageRoot='Hoea to Waka Images';
for(const name of ['shirt-example','travel-mug','stickers-mockup','totebag-mockup','lanyard-mockup','enamel-mockup','business-cards'])imageEntries[`${imageRoot}/Mockup previews/${name}.webp`]=[new Uint8Array(await readFile(new URL(`../assets/brand-previews/${name}.webp`,import.meta.url))),options];
imageEntries[`${imageRoot}/READ ME.txt`]=[encode('Hoea tō Waka — Images\n\nThis pack contains seven WebP mockup previews already displayed in the brand guide. Use them as visual references for placement and presentation. They are not editable production templates, print-ready artwork or a photography library. Do not send these previews to a manufacturer as final artwork. Prepare production work with the logo, font and supplier specifications instead.\n\nGuide: https://www.hoeatowaka.co.nz/about/brand-guidelines/\n'),options];
await writeFile(new URL('hoea-to-waka-images-pack.zip',out),zipSync(imageEntries,{level:6}));
console.log('Hero downloads: logomarks, wordmarks, URL wordmarks, lockups and image packs; RGB/CMYK artwork folders');
