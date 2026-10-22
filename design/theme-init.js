const roles=['display','heading','body','eyebrow','ui','small'].map(id=>({id}));
import { applyBrandColours, setupBrandEditor } from './brand-colours';
import { setupSiteHeader } from './header';
import { setupHeroVersions, setupCoachingHeroVersions } from './hero-versions';
import { setupFooterVersions } from './footer-versions';
import { setupStatementCopy } from './statement-copy';
import { setupTypographyStudies } from './typography-studies';
import { setupBrandDownloads, setupBrandGalleries } from './brand-assets';

const root=document.documentElement;
function apply(){
  root.dataset.palette='hoea';
  root.dataset.typography='inter';
  // Typography is fixed site-wide, including browsers with older saved font choices.
  for(const role of roles){root.style.setProperty(`--font-${role.id}`,'"Inter", Arial, sans-serif');root.style.setProperty(`--font-weight-${role.id}`,role.id==='eyebrow'?400:['display','heading'].includes(role.id)?600:500);}
  applyBrandColours();
}
const syncMode=()=>{
  const dark=root.dataset.theme==='dark';
  document.querySelectorAll('[data-ds-theme]').forEach(toggle=>{toggle.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');toggle.setAttribute('aria-pressed',String(dark));});
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=getComputedStyle(root).getPropertyValue('--t-bg').trim();
  window.dispatchEvent(new CustomEvent('hoea:mode'));
};
try { localStorage.removeItem('hoea-design-studio-draft-1'); localStorage.removeItem('hoea-appearance-draft-1'); } catch {}
apply();
new MutationObserver(syncMode).observe(root,{attributes:true,attributeFilter:['data-theme']});
window.addEventListener('hoea:brand-colours',syncMode);
document.addEventListener('DOMContentLoaded',syncMode,{once:true});
document.addEventListener('DOMContentLoaded',()=>{setupBrandEditor();setupSiteHeader();setupHeroVersions();setupCoachingHeroVersions();setupFooterVersions();setupStatementCopy();setupTypographyStudies();setupBrandDownloads();setupBrandGalleries();},{once:true});
