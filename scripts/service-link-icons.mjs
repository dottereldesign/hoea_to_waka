import {readFile,writeFile,readdir} from 'node:fs/promises';
const services=[['in-house-workshops','shared-waka'],['resilience-one-on-one','single-paddle'],['workshops-for-support-professionals','sheltered-growth']];
const icons=new Map(await Promise.all(services.map(async([slug,name])=>[slug,(await readFile(`assets/icons/services/${name}.svg`,'utf8')).trim()])));
// Put the artwork in the initial HTML, including the brand-guideline preview.
export async function updateServiceLinkIcons(folder='.') {
 for(const entry of await readdir(folder,{withFileTypes:true})) {
  if(entry.name.startsWith('.')||['node_modules','tmp','_site','context','assets'].includes(entry.name))continue;
  const path=folder+'/'+entry.name;
  if(entry.isDirectory()){await updateServiceLinkIcons(path);continue;}
  if(!entry.name.endsWith('.html'))continue;
  const source=await readFile(path,'utf8');
  const updated=source.replace(/<div\b[^>]*class="(?:site-subnav|site-menu-service-links|site-preview-subnav)"[^>]*>[\s\S]*?<\/div>/g,block=>block.replace(/(<a\b[^>]*href="([^"]*)"[^>]*>)([\s\S]*?)(<\/a>)/g,(link,start,href,body,end)=>{
   const slug=services.find(([slug])=>href.endsWith('/'+slug+'/'))?.[0];
   if(!slug)return link;
   const label=body.replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/<\/?span\b[^>]*>/g,'').trim();
   return start+icons.get(slug)+'<span class="service-link-label">'+label+'</span>'+end;
  }));
  if(updated!==source)await writeFile(path,updated);
 }
}
