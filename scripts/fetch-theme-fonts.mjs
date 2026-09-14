import { mkdir, writeFile } from 'node:fs/promises';
import { fonts } from '../design/theme-data.mjs';
await mkdir('assets/fonts/themes',{recursive:true});
const css=[];
for(const font of fonts.filter(f=>!process.argv[2]||f.id===process.argv[2])){
  const weights=font.weights;
  const axes=font.italics?`ital,wght@${[0,1].flatMap(i=>weights.split(';').map(w=>`${i},${w}`)).join(';')}`:`wght@${weights}`;
  const response=await fetch(`https://fonts.googleapis.com/css2?family=${font.name.replaceAll(' ','+')}:${axes}&display=swap`,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}});
  if(!response.ok)throw new Error(`${font.name}: ${response.status}`);
  const source=await response.text();
  const blocks=[...source.matchAll(/\/\* (latin(?:-ext)?) \*\/\s*(@font-face\s*\{[^}]+\})/g)];
  if(!blocks.some(b=>b[1]==='latin-ext'))throw new Error(`Missing macron coverage: ${font.name}`);
  let i=0;
  for(const [,subset,block] of blocks){
    const remote=block.match(/url\(([^)]+)\)/)[1];const file=`${font.id}-${subset}-${i++}.woff2`;
    const download=await fetch(remote);if(!download.ok)throw new Error(`Font download failed: ${remote}`);
    await writeFile(`assets/fonts/themes/${file}`,Buffer.from(await download.arrayBuffer()));
    css.push(block.replace(remote,`fonts/themes/${file}`));
  }
  const licence=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${font.id.replaceAll('-','')}/OFL.txt`);
  if(!licence.ok)throw new Error(`Licence missing: ${font.name}`);
  await writeFile(`assets/fonts/themes/${font.id}-OFL.txt`,(await licence.text()).replace(/[ \t]+$/gm,''));
  console.log(`${font.name}: ${blocks.length} local subsets + OFL licence`);
}
await writeFile(process.argv[2]?'tmp/extra-font.css':'design/theme-fonts.css',css.join('\n\n')+'\n');
