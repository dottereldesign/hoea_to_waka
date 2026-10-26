import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

// Keep the supplied masters. Browsers choose a smaller, high-quality copy when
// the image occupies a small slot; downloads and clipboard artwork stay intact.
const pages=['index.html','about/index.html','model/index.html','services/index.html','services/in-house-workshops/index.html','services/resilience-one-on-one/index.html','services/workshops-for-support-professionals/index.html','resources/index.html','contact/index.html'];
const output='assets/responsive';
await fs.mkdir(output,{recursive:true});
const copies=new Map();
let changed=0;
for(const page of pages){
  let html=await fs.readFile(page,'utf8');
  for(const match of [...html.matchAll(/<img\b[^>]*>/g)]){
    const tag=match[0],src=tag.match(/\bsrc="([^"]+)"/)?.[1];
    if(!src||/\bsrcset=/.test(tag)||/^(?:https?:|data:)/.test(src)||! /\.(webp|png|jpe?g)(\?|$)/i.test(src))continue;
    const file=path.resolve(path.dirname(page),src.split('?')[0]);
    const meta=await sharp(file).metadata();
    if(meta.width<=640||meta.pages>1)continue;
    if(!copies.has(file)){
      const hash=crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex').slice(0,10);
      const variants=[];
      for(const width of [480,768,1200].filter(width=>width<meta.width)){
        const name=path.basename(file,path.extname(file))+'-'+hash+'-'+width+'.webp';
        const target=path.join(output,name);
        await sharp(file).resize({width,withoutEnlargement:true}).webp({quality:90,alphaQuality:100,effort:6}).toFile(target);
        variants.push({target,width});
      }
      copies.set(file,variants);
    }
    const candidates=copies.get(file).map(({target,width})=>path.relative(path.dirname(page),target).replaceAll('\\','/')+' '+width+'w');
    candidates.push(src+' '+meta.width+'w');
    const sizes=/book|my-brother-hemi|maia-makes-waves/i.test(src)?'(max-width:760px) min(320px,calc(100vw - 44px)),320px':/service-/.test(src)?'(max-width:760px) calc(100vw - 60px),440px':/model-reflection/.test(src)?'(max-width:760px) calc(100vw - 60px),600px':'(max-width:760px) calc(100vw - 44px),100vw';
    let next=tag.replace(/>$/,` srcset="${candidates.join(', ')}" sizes="${sizes}">`);
    if(!/\bwidth=/.test(tag))next=next.replace(/>$/,` width="${meta.width}" height="${meta.height}">`);
    html=html.replace(tag,next);changed++;
  }
  await fs.writeFile(page,html);
}
console.log(`Responsive slots: ${changed}; preserved masters: ${copies.size}`);
