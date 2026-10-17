import { palettes, fonts, roles, pairings, fontsForRole } from './theme-data.mjs';
import { draft, appearanceStorageKey } from './draft';

const key=appearanceStorageKey,root=document.documentElement;
const defaults={palette:draft.colour.id,pairing:pairings[0].id,roles:{...pairings[0].roles}};
const valid=(list,id)=>list.some(item=>item.id===id);
function sanitise(value){const selectedRoles=Object.fromEntries(roles.map(role=>[role.id,valid(fontsForRole(role.id),value?.roles?.[role.id])?value.roles[role.id]:defaults.roles[role.id]]));const matching=pairings.find(p=>roles.every(r=>p.roles[r.id]===selectedRoles[r.id]));return {palette:valid(palettes,value?.palette)?value.palette:defaults.palette,pairing:matching?.id||'custom',roles:selectedRoles};}
function read(){try{return sanitise(JSON.parse(localStorage.getItem(key))||defaults);}catch{return sanitise(defaults);}}
let state=read();
function apply(){
  root.dataset.palette=state.palette;
  root.dataset.typography=state.pairing;
  for(const role of roles){const font=fonts.find(f=>f.id===state.roles[role.id]);root.style.setProperty(`--font-${role.id}`,font.stack);root.style.setProperty(`--font-weight-${role.id}`,font.headingWeight);}
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
