import { mkdir, copyFile, cp } from 'node:fs/promises';
// Explicit public-site allowlist. Never upload the repository root or private notes.
await mkdir('_site',{recursive:true});
for(const file of ['index.html','404.html','site.css','site.js','styles.css','contact.js','robots.txt','sitemap.xml','_redirects','_headers','brand-guidelines.html','contact.html','in-house-workshops.html','individual-coaching.html','resources.html','services.html','support-professionals.html','DESIGN-STUDIO.md']) await copyFile(file,`_site/${file}`);
for(const dir of ['assets','services','resources','contact','illustrations']) await cp(dir,`_site/${dir}`,{recursive:true});
await mkdir('_site/about',{recursive:true});
await copyFile('about/index.html','_site/about/index.html');
await cp('about/brand-guidelines','_site/about/brand-guidelines',{recursive:true});
console.log('Public site staged in _site. Internal workspaces and source files excluded.');
