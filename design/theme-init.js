import { palettes, roles } from './theme-data.mjs';
import { draft, appearanceStorageKey } from './draft';
import { setupButtons } from './buttons';

const key=appearanceStorageKey,root=document.documentElement;
const defaults={palette:draft.colour.id};
function sanitise(value){return {palette:palettes.some(p=>p.id===value?.palette)?value.palette:defaults.palette};}
function read(){try{return sanitise(JSON.parse(localStorage.getItem(key))||defaults);}catch{return sanitise(defaults);}}
let state=read();
function apply(){
  root.dataset.palette=state.palette;
  root.dataset.typography='inter';
  // Typography is fixed site-wide, including browsers with older saved font choices.
  for(const role of roles){root.style.setProperty(`--font-${role.id}`,'"Inter", Arial, sans-serif');root.style.setProperty(`--font-weight-${role.id}`,['display','heading'].includes(role.id)?600:500);}
  window.dispatchEvent(new CustomEvent('hoea:appearance',{detail:structuredClone(state)}));
}
const syncMode=()=>{
  const dark=root.dataset.theme==='dark';
  document.querySelectorAll('[data-ds-theme]').forEach(toggle=>{toggle.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');toggle.setAttribute('aria-pressed',String(dark));});
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=getComputedStyle(root).getPropertyValue('--t-bg').trim()||palettes.find(p=>p.id===state.palette).colours[4];
  window.dispatchEvent(new CustomEvent('hoea:mode'));
};
apply();
new MutationObserver(syncMode).observe(root,{attributes:true,attributeFilter:['data-theme']});
document.addEventListener('DOMContentLoaded',syncMode,{once:true});
document.addEventListener('DOMContentLoaded',()=>setupButtons(),{once:true});
