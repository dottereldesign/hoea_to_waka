import fs from 'node:fs';
import path from 'node:path';
import {parseHTML} from 'linkedom';
export const spacingPages=['index.html','about/index.html','model/index.html','services/index.html','services/in-house-workshops/index.html','services/resilience-one-on-one/index.html','services/workshops-for-support-professionals/index.html','resources/index.html','contact/index.html','illustrations/index.html','prompts/index.html','about/brand-guidelines/index.html'];
const theme=['presentation','brand-colours','header','model-button','home-monochrome','static-pages','section-spacing','coaching-hero','subpage-backgrounds','footer-versions','model-benefits','resources-nav'].map(n=>'design/'+n+'.css');
export function spacingSources(){
 const files=new Set();
 for(const page of spacingPages){const {document}=parseHTML(fs.readFileSync(page,'utf8'));for(const link of document.querySelectorAll('link[rel=stylesheet]')){const href=link.getAttribute('href').split('?')[0];if(/^(https?:|\/\/)/.test(href))continue;const file=path.posix.normalize(path.posix.join(path.posix.dirname(page),href));
 if(file.startsWith('assets/page-styles/')){for(const source of ['site.css','design/components.css',...theme])files.add(source);}
 else if(file==='assets/theme.css'){theme.forEach(f=>files.add(f));}
 else if(file==='assets/brand-guide-components.css')files.add('design/brand-contents.css');
 else if(file==='assets/site-palette.css')files.add('site.css');
 else if(file==='assets/components.css')files.add('design/components.css');
 else if(file==='assets/brand-palette.css')files.add('styles.css');
 else if(fs.existsSync(file)&&file!=='assets/spacing-tokens.css')files.add(file);
 }}return [...files].sort();
}
export const isSpacing=property=>/^(?:margin|padding)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?$|^(?:gap|row-gap|column-gap)$/.test(property);
