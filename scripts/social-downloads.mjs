import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const sharp=require('sharp');
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const out=new URL('../assets/social-downloads/',import.meta.url);await mkdir(out,{recursive:true});
const symbol=(await readFile(new URL('../assets/logo-white.svg',import.meta.url),'utf8')).match(/<svg[^>]*>([\s\S]*?)<\/svg>/)[1];
const specs={linkedin:[['profile',400,400],['banner',1512,256],['post',1200,1200]],facebook:[['profile',400,400],['banner',851,315],['post',1080,1080]],instagram:[['profile',400,400],['post',1080,1440],['story',1080,1920]],x:[['profile',400,400],['banner',1500,500],['post',1600,900]]};
for(const [platform,items] of Object.entries(specs))for(const [type,w,h] of items){
 const size=type==='profile'?w*.65:Math.min(w,h)*.19;
 const x=type==='profile'?(w-size)/2:w*.08,y=type==='profile'?(h-size)/2:h*.12;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>Hoea tō Waka ${platform} ${type}${type==='profile'?'':' starting layout'}</title><rect width="${w}" height="${h}" fill="${type==='profile'?'#202329':'#302641'}"/><g transform="translate(${x} ${y}) scale(${size/385})">${symbol}</g></svg>`;
 const base=new URL(`${platform}-${type}-${w}x${h}`,out);
 if(type!=='profile')await writeFile(new URL(base.href+'.svg'),svg);
 await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(base)+'.png');
}
console.log('Social downloads: 12 curated platform sizes, PNG plus editable SVG layouts');

// Approved supplied photograph: preserve the portrait composition for Instagram.
const coast=new URL('../assets/social/coastal-post.png',import.meta.url);
await sharp(fileURLToPath(coast)).resize(1080,1440,{fit:'cover'}).png().toFile(fileURLToPath(new URL('instagram-coastal-post-1080x1440.png',out)));
await sharp(fileURLToPath(coast)).resize(810,1080,{fit:'cover'}).webp({quality:90}).toFile(fileURLToPath(new URL('../assets/social/coastal-post.webp',import.meta.url)));
