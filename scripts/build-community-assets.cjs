const fs = require('node:fs');
const sharp = require('sharp');
(async () => {
  const dir = 'assets/colour-testing/';
  const svg = fs.readFileSync(dir+'community.svg','utf8');
  const grain = fs.readFileSync(dir+'community-grain.webp').toString('base64');
  const textured = svg.replace('</svg>', `<image href="data:image/webp;base64,${grain}" width="1086" height="1448" preserveAspectRatio="xMidYMid slice" style="mix-blend-mode:soft-light;opacity:.45"/></svg>`);
  fs.writeFileSync(dir+'community-textured.svg',textured);
  const dest='design/comparisons/community-svg/';
  const reference=await sharp(dir+'reference.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const vector=await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer();
  const blend=Buffer.alloc(vector.length), difference=Buffer.alloc(vector.length);
  let total=0, large=0;
  for(let i=0;i<vector.length;i+=4){let pixel=0;for(let c=0;c<3;c++){const delta=Math.abs(reference.data[i+c]-vector[i+c]);total+=delta;pixel=Math.max(pixel,delta);blend[i+c]=Math.round((reference.data[i+c]+vector[i+c])/2);difference[i+c]=Math.min(255,delta*4);}if(pixel>40)large++;blend[i+3]=difference[i+3]=255;}
  await sharp(blend,{raw:reference.info}).webp({quality:95}).toFile(dest+'03-final-overlay.webp');
  await sharp(difference,{raw:reference.info}).webp({quality:94}).toFile(dest+'03-final-difference-4x.webp');
  await sharp(Buffer.from(svg)).webp({quality:95}).toFile(dest+'03-final-clean.webp');
  const pixels=1086*1448;
  const metrics={date:'2026-11-06',size:[1086,1448],meanAbsoluteChannelError:Math.round(total/pixels/3*100)/100,pixelsWithAnyChannelErrorOver40Percent:Math.round(large/pixels*10000)/100,meaning:'RGB difference includes intentionally omitted original grain, shading differences and contour differences. It is not a percentage fidelity score.',svgBytes:Buffer.byteLength(svg),paths:(svg.match(/<path\b/g)||[]).length};
  fs.writeFileSync(dest+'metrics.json',JSON.stringify(metrics,null,2)+'\n');
  console.log(metrics);
})().catch(e=>{console.error(e);process.exitCode=1});
