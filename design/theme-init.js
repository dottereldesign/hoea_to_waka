import { palettes, fonts, roles, pairings, fontsForRole } from './theme-data.mjs';
import { draft, appearanceStorageKey } from './draft';

const key=appearanceStorageKey,root=document.documentElement;
const defaults={palette:draft.colour.id,pairing:pairings[0].id,roles:{...pairings[0].roles}};
const valid=(list,id)=>list.some(item=>item.id===id);
function sanitise(value){const selectedRoles=Object.fromEntries(roles.map(role=>[role.id,valid(fontsForRole(role.id),value?.roles?.[role.id])?value.roles[role.id]:defaults.roles[role.id]]));const matching=pairings.find(p=>roles.every(r=>p.roles[r.id]===selectedRoles[r.id]));return {palette:valid(palettes,value?.palette)?value.palette:defaults.palette,pairing:matching?.id||'custom',roles:selectedRoles};}
function read(){try{return sanitise(JSON.parse(localStorage.getItem(key))||defaults);}catch{return sanitise(defaults);}}
let state=read();
// Preserve this browser's typography, while starting the new draft from the
// submitted palette. The earlier playground's saved appearance is untouched.
try{if(!localStorage.getItem(key)){const previous=JSON.parse(localStorage.getItem('hoea-appearance-v1'));state=sanitise({...defaults,...previous,palette:draft.colour.id});localStorage.setItem(key,JSON.stringify(state));setMode(draft.colour.mode);}}catch{}
function apply(persist=true){
  root.dataset.palette=state.palette;
  root.dataset.typography=state.pairing;
  for(const role of roles){const font=fonts.find(f=>f.id===state.roles[role.id]);root.style.setProperty(`--font-${role.id}`,font.stack);root.style.setProperty(`--font-weight-${role.id}`,font.headingWeight);}
  if(persist)try{localStorage.setItem(key,JSON.stringify(state));}catch{}
  window.dispatchEvent(new CustomEvent('hoea:appearance',{detail:structuredClone(state)}));
}
function setMode(mode){
  if(!['light','dark'].includes(mode))return;
  root.dataset.theme=mode;root.style.colorScheme=mode;
  try{localStorage.setItem('hoea-theme',mode);}catch{}
  document.querySelectorAll('[data-theme-toggle]').forEach(toggle=>{toggle.setAttribute('aria-pressed',String(mode==='dark'));toggle.setAttribute('aria-label',mode==='dark'?'Switch to light theme':'Switch to dark theme');});
}
const syncMode=()=>{
  const dark=root.dataset.theme==='dark';
  document.querySelectorAll('[data-ds-theme]').forEach(toggle=>{toggle.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');toggle.setAttribute('aria-pressed',String(dark));});
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=getComputedStyle(root).getPropertyValue('--t-bg').trim()||palettes.find(p=>p.id===state.palette).colours[4];
  window.dispatchEvent(new CustomEvent('hoea:mode'));
};
window.HoeaAppearance={
  palettes,fonts,roles,pairings,
  getState:()=>structuredClone(state),
  setPalette(id){if(valid(palettes,id)){state.palette=id;apply();syncMode();}},
  setRole(role,id){if(valid(roles,role)&&valid(fontsForRole(role),id)){state.roles[role]=id;state.pairing='custom';apply();}},
  setPairing(id){const pairing=pairings.find(p=>p.id===id);if(pairing){state.pairing=id;state.roles={...pairing.roles};apply();}},
  setMode,
  reset(){state=sanitise(defaults);apply();setMode('light');syncMode();},
};
apply();
new MutationObserver(syncMode).observe(root,{attributes:true,attributeFilter:['data-theme']});
window.addEventListener('storage',event=>{
  if(event.key===key||event.key===null){state=read();apply(false);}
  if(event.key==='hoea-theme'||event.key===null)setMode(event.newValue==='dark'?'dark':'light');
});
document.addEventListener('DOMContentLoaded',syncMode,{once:true});
