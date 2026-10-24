import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),sharp=require('sharp'),fontkit=require('fontkit'),PDFDocument=require('pdfkit'),svgpath=require('svgpath');
const {zipSync}=require('fflate');
const out=new URL('../assets/brand-downloads/',import.meta.url);await mkdir(out,{recursive:true});
const {decompress}=require('wawoff2');
const latin=fontkit.create(Buffer.from(await decompress(await readFile(new URL('../assets/fonts/themes/inter-latin-3.woff2',import.meta.url)))));
const extended=fontkit.create(Buffer.from(await decompress(await readFile(new URL('../assets/fonts/themes/inter-latin-ext-2.woff2',import.meta.url)))));
const fontWeights=new Map([500,600].map(weight=>[weight,[latin.getVariation({wght:weight}),extended.getVariation({wght:weight})]]));
const fonts=weight=>fontWeights.get(weight);
function lettering(text,size,x,y,weight=600,tracking=0){
 const faces=fonts(weight);let paths=[],cursor=x;
 for(const character of text){const face=faces.find(f=>f.hasGlyphForCodePoint(character.codePointAt(0)));if(!face)throw Error('Missing glyph '+character);const glyph=face.glyphForCodePoint(character.codePointAt(0)),scale=size/face.unitsPerEm;
 if(glyph.path.commands.length)paths.push(svgpath(glyph.path.toSVG()).matrix([scale,0,0,-scale,cursor,y]).abs().unshort().unarc().toString());
 cursor+=glyph.advanceWidth*scale+tracking;}
 return {paths,width:cursor-x-tracking};
}
const raw=await readFile(new URL('../assets/logo-black.svg',import.meta.url),'utf8');
const symbol=[...raw.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*>/g)].map(m=>m[1]);
const name=lettering('Hoea tō Waka',140,388,209,600,-4.9),taglineWidth=lettering('STRENGTH IN AOTEAROA',40,0,0,500,6.4).width;
const width=Math.ceil(388+name.width+48),height=380;
const taglineX=388+(name.width-taglineWidth)/2;
const wordmark=[...symbol.map(d=>svgpath(d).matrix([280/385,0,0,280/384,48,45]).abs().toString()),...name.paths,...lettering('STRENGTH IN AOTEAROA',40,taglineX,278,500,6.4).paths,
`M${taglineX-65} 262h35v5h-35Z`,`M${taglineX+taglineWidth+30} 262h35v5h-35Z`];
const manifest={version:1,artwork:{},favicon:{sizes:[16,32,48,64,128,180,192,512],formats:['svg','png','webp','ico']}};
function svg(paths,w,h,colour){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${paths.map(d=>`<path fill="${colour}" d="${d}"/>`).join('')}</svg>\n`;}
function eps(paths,w,h,colour){const rgb=colour==='#FFFFFF'?'1 1 1':colour==='#191919'?'0.098039 0.098039 0.098039':'0.12549 0.137255 0.160784';let result=`%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 ${w} ${h}\n%%HiResBoundingBox: 0 0 ${w} ${h}\n%%LanguageLevel: 2\n%%EndComments\ngsave\n0 ${h} translate\n1 -1 scale\n${rgb} setrgbcolor\n`;
 for(const d of paths){result+='newpath\n';let x=0,y=0,sx=0,sy=0;for(const segment of svgpath(d).abs().unshort().unarc().segments){const [cmd,...p]=segment;if(cmd==='M'){[x,y]=p;[sx,sy]=p;result+=`${x} ${y} moveto\n`;}else if(cmd==='L'){[x,y]=p;result+=`${x} ${y} lineto\n`;}else if(cmd==='H'){x=p[0];result+=`${x} ${y} lineto\n`;}else if(cmd==='V'){y=p[0];result+=`${x} ${y} lineto\n`;}else if(cmd==='C'){result+=p.join(' ')+' curveto\n';[x,y]=p.slice(4);}else if(cmd==='Q'){const[qx,qy,nx,ny]=p;result+=`${x+2/3*(qx-x)} ${y+2/3*(qy-y)} ${nx+2/3*(qx-nx)} ${ny+2/3*(qy-ny)} ${nx} ${ny} curveto\n`;x=nx;y=ny;}else if(cmd==='Z'){result+='closepath\n';x=sx;y=sy;}else throw Error('Unsupported EPS command '+cmd);}result+='fill\n';}return result+'grestore\n%%EOF\n';}
async function pdf(paths,w,h,colour,file){const document=new PDFDocument({size:[w,h],margin:0,compress:true,info:{Title:'Hoea tō Waka brand artwork',CreationDate:new Date('2026-10-22T00:00:00Z'),ModDate:new Date('2026-10-22T00:00:00Z')}}),chunks=[];document.on('data',chunk=>chunks.push(chunk));const done=new Promise((resolve,reject)=>{document.on('end',resolve);document.on('error',reject);});for(const d of paths)document.path(d).fill(colour);document.end();await done;await writeFile(new URL(file,out),Buffer.concat(chunks));}
for(const[type,paths,w,h,sizes]of [['symbol',symbol,385,384,[256,512,1024]],['horizontal',wordmark,width,height,[640,1280,2560]]]){
 manifest.artwork[type]={width:w,height:h,sizes,formats:['svg','pdf','eps','png','webp','jpg'],colours:['black','white']};
 for(const variant of ['black','white']){const colour=variant==='white'?'#FFFFFF':type==='symbol'?'#191919':'#202329',base=`hoea-to-waka-${type}-${variant}`,source=svg(paths,w,h,colour);
 await writeFile(new URL(base+'.svg',out),source);await writeFile(new URL(base+'.eps',out),eps(paths,w,h,colour));await pdf(paths,w,h,colour,base+'.pdf');
 for(const size of sizes){const raster=sharp(Buffer.from(source)).resize({width:size});await raster.clone().png().toFile(fileURLToPath(new URL(`${base}-${size}.png`,out)));await raster.clone().webp({lossless:true}).toFile(fileURLToPath(new URL(`${base}-${size}.webp`,out)));await raster.clone().flatten({background:variant==='white'?'#202329':'#FFFFFF'}).jpeg({quality:95,chromaSubsampling:'4:4:4'}).toFile(fileURLToPath(new URL(`${base}-${size}.jpg`,out)));}
 }
}
const favicon=await readFile(new URL('../assets/favicon.svg',import.meta.url));await writeFile(new URL('hoea-to-waka-favicon.svg',out),favicon);const iconImages=[];
for(const size of manifest.favicon.sizes){const raster=sharp(favicon).resize(size,size),png=await raster.clone().png().toBuffer();await writeFile(new URL(`hoea-to-waka-favicon-${size}.png`,out),png);await raster.clone().webp({lossless:true}).toFile(fileURLToPath(new URL(`hoea-to-waka-favicon-${size}.webp`,out)));if([16,32,48].includes(size))iconImages.push({size,png});}
const header=Buffer.alloc(6+16*iconImages.length);header.writeUInt16LE(1,2);header.writeUInt16LE(iconImages.length,4);let offset=header.length;iconImages.forEach(({size,png},i)=>{const at=6+i*16;header[at]=size;header[at+1]=size;header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);header.writeUInt32LE(png.length,at+8);header.writeUInt32LE(offset,at+12);offset+=png.length;});await writeFile(new URL('hoea-to-waka-favicon.ico',out),Buffer.concat([header,...iconImages.map(i=>i.png)]));
await writeFile(new URL('manifest.json',out),JSON.stringify(manifest,null,2)+'\n');
console.log('Brand exports: outlined SVG/PDF/EPS, transparent PNG/WebP, JPG and multi-size ICO');

// Shared outlined source geometry for the purpose-specific hero library.
export {symbol,wordmark,width,height,lettering,svg,eps};

// A curated pack: one scalable vector and one high-resolution PNG per logo.
const archive={};
const archiveOptions={mtime:new Date('2026-10-22T00:00:00Z')};
for(const [type,folder,size] of [['symbol','Symbols',1024],['horizontal','Full Logos',2560]]){
  for(const colour of ['black','white']){
    const base=`hoea-to-waka-${type}-${colour}`;
    for(const [source,target] of [[base+'.svg',base+'.svg'],[base+'-'+size+'.png',base+'.png']]){
      archive[`${folder}/${target}`]=[new Uint8Array(await readFile(new URL(source,out))),archiveOptions];
    }
  }
}
await writeFile(new URL('hoea-to-waka-logo-pack.zip',out),zipSync(archive,{level:6}));

// Small, purpose-specific packs keep each download easy to use.
for(const [pack,files] of [
 ['symbol',[['hoea-to-waka-symbol-black.svg','symbol-black.svg'],['hoea-to-waka-symbol-white.svg','symbol-white.svg'],['hoea-to-waka-symbol-black-1024.png','symbol-black.png'],['hoea-to-waka-symbol-white-1024.png','symbol-white.png']]],
 ['favicon',[['hoea-to-waka-favicon.svg','favicon.svg'],['hoea-to-waka-favicon.ico','favicon.ico'],['hoea-to-waka-favicon-32.png','favicon-32.png'],['hoea-to-waka-apple-touch-icon.png','apple-touch-icon.png'],['hoea-to-waka-favicon-512.png','favicon-512.png']]]
]){const entries={};for(const[source,target]of files)entries[target]=[new Uint8Array(await readFile(new URL(source,out))),archiveOptions];await writeFile(new URL(`hoea-to-waka-${pack}-pack.zip`,out),zipSync(entries,{level:6}));}
const fontEntries={};
for(const[source,target]of [['InterVariable.ttf','Desktop/InterVariable.ttf'],['InterVariable.woff2','Web/InterVariable.woff2'],['Inter-LICENSE.txt','LICENSE.txt']])fontEntries[target]=[new Uint8Array(await readFile(new URL('../design/source-fonts/'+source,import.meta.url))),archiveOptions];
fontEntries['READ ME.txt']=[new TextEncoder().encode('Inter font pack\n\nInstall Desktop/InterVariable.ttf for design and office apps. Use Web/InterVariable.woff2 on websites. These variable fonts contain the full weight range in one file. Use Regular 400 for paragraphs and Semibold 600 for headings and buttons. Both include macrons.\n\nSource: https://github.com/rsms/inter/tree/master/docs/font-files\nLicence: SIL Open Font License 1.1 (included).\n\nABC Marist is not included. Obtain a suitable licence and font files from https://abcdinamo.com/typefaces/marist\n'),archiveOptions];
await writeFile(new URL('hoea-to-waka-font-pack.zip',out),zipSync(fontEntries,{level:6}));
