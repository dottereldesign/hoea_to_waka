import { palettes, fonts, roles, pairings } from './theme-data.mjs';

const key='hoea-appearance-v1',root=document.documentElement;
const defaults={palette:palettes[0].id,pairing:pairings[0].id,roles:{...pairings[0].roles}};
const valid=(list,id)=>list.some(item=>item.id===id);
function sanitise(value){return {palette:valid(palettes,value?.palette)?value.palette:defaults.palette,pairing:valid(pairings,value?.pairing)?value.pairing:'custom',roles:Object.fromEntries(roles.map(role=>[role.id,valid(fonts,value?.roles?.[role.id])?value.roles[role.id]:defaults.roles[role.id]]))};}
function read(){try{return sanitise(JSON.parse(localStorage.getItem(key))||defaults);}catch{return sanitise(defaults);}}
let state=read();
function apply(persist=true){
  root.dataset.palette=state.palette;
  root.dataset.typography=state.pairing;
  for(const role of roles){const font=fonts.find(f=>f.id===state.roles[role.id]);root.style.setProperty(`--font-${role.id}`,font.stack);}
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
  setRole(role,id){if(valid(roles,role)&&valid(fonts,id)){state.roles[role]=id;state.pairing='custom';apply();}},
  setPairing(id){const pairing=pairings.find(p=>p.id===id);if(pairing){state.pairing=id;state.roles={...pairing.roles};apply();}},
  setMode,
  reset(){state=sanitise(defaults);apply();setMode('light');syncMode();},
};
apply(false);
new MutationObserver(syncMode).observe(root,{attributes:true,attributeFilter:['data-theme']});
window.addEventListener('storage',event=>{
  if(event.key===key||event.key===null){state=read();apply(false);}
  if(event.key==='hoea-theme'||event.key===null)setMode(event.newValue==='dark'?'dark':'light');
});
document.addEventListener('DOMContentLoaded',syncMode,{once:true});
