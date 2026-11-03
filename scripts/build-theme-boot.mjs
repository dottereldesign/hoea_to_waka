import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
const pages=['index.html','about/index.html','model/index.html','services/index.html','services/in-house-workshops/index.html','services/resilience-one-on-one/index.html','services/workshops-for-support-professionals/index.html','resources/index.html','contact/index.html','illustrations/index.html','404.html','about/brand-guidelines/index.html','about/jamies-workspace/index.html','prompts/index.html','brand/brand-system.html','pages/home.html'];
const result=await build({entryPoints:['design/theme-boot.js'],bundle:true,minify:true,format:'iife',target:['es2020'],write:false});
const boot='<!-- theme-boot:start --><script>'+result.outputFiles[0].text.trim()+'</script><!-- theme-boot:end -->';
for(const page of pages){let html=await readFile(page,'utf8');html=html.replace(/<!-- theme-boot:start -->[\s\S]*?<!-- theme-boot:end -->\s*/,'');html=html.replace(/<script src="([^"]*assets\/theme-init\.js)\?[^" ]+"[^>]*><\/script>/,(_,src)=>boot+'\n<script src="'+src+'?v=33" defer></script>');await writeFile(page,html);}
console.log('Inlined theme bootstrap:',result.outputFiles[0].contents.length,'bytes; deferred interactive setup on',pages.length,'pages');
