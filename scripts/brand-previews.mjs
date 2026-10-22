import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {mkdir,stat,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),sharp=require('sharp');
const root=new URL('../',import.meta.url),out=new URL('assets/brand-previews/',root);await mkdir(out,{recursive:true});
const items=[['hero_sketch',1254,true],['shirt-example',1200,false],['travel-mug',960,false],['stickers-mockup',1200,false],['totebag-mockup',960,false],['lanyard-mockup',960,false],['enamel-mockup',960,false],['business-cards',1200,false]];
const manifest={};let before=0,after=0;
for(const[name,width,lossless]of items){const source=new URL(`assets/${name}.png`,root),target=new URL(`${name}.webp`,out);const result=await sharp(fileURLToPath(source)).resize({width,withoutEnlargement:true}).webp(lossless?{lossless:true}:{quality:85,effort:5}).toFile(fileURLToPath(target));const original=(await stat(source)).size;before+=original;after+=result.size;manifest[name]={width:result.width,height:result.height,originalBytes:original,previewBytes:result.size};}
await writeFile(new URL('manifest.json',out),JSON.stringify(manifest,null,2)+'\n');
console.log(`Guide images: ${before} -> ${after} bytes (${Math.round((1-after/before)*100)}% smaller)`);
