import { setupModelButtons } from './model-button';
import { setupSiteHeader } from './header';
import { setupHeroVersions, setupCoachingHeroVersions } from './hero-versions';
import { setupFooterVersions } from './footer-versions';

const root=document.documentElement;
const syncMode=()=>{
  const dark=root.dataset.theme==='dark';
  document.querySelectorAll('[data-ds-theme]').forEach(toggle=>{toggle.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');toggle.setAttribute('aria-pressed',String(dark));});
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=getComputedStyle(root).getPropertyValue('--t-bg').trim();
  window.dispatchEvent(new CustomEvent('hoea:mode'));
};
try { localStorage.removeItem('hoea-design-studio-draft-1'); localStorage.removeItem('hoea-appearance-draft-1'); } catch {}
new MutationObserver(syncMode).observe(root,{attributes:true,attributeFilter:['data-theme']});
window.addEventListener('hoea:brand-colours',syncMode);
document.addEventListener('DOMContentLoaded',syncMode,{once:true});
document.addEventListener('DOMContentLoaded',()=>{setupSiteHeader();setupHeroVersions();setupCoachingHeroVersions();setupFooterVersions();setupModelButtons();},{once:true});
