import { brandStorageKey, colours, defaults, variable, sanitiseOverrides, contrast, roleAliases, ref } from './brand-tokens.mjs';

let overrides = {};
function read() {
  try { return sanitiseOverrides(JSON.parse(localStorage.getItem(brandStorageKey))?.colours); }
  catch { return {}; }
}
function apply() {
  const root=document.documentElement;
  for(const colour of colours) {
    if(overrides[colour.id])root.style.setProperty(variable(colour.id),overrides[colour.id]);
    else root.style.removeProperty(variable(colour.id));
  }
  root.dataset.brandPreview=String(Object.keys(overrides).length>0);
  window.dispatchEvent(new CustomEvent('hoea:brand-colours'));
}
function save() {
  try {
    if(Object.keys(overrides).length)localStorage.setItem(brandStorageKey,JSON.stringify({version:1,colours:overrides}));
    else localStorage.removeItem(brandStorageKey);
    return true;
  } catch { return false; }
}
const current=id=>overrides[id]||defaults[id];
export function applyBrandColours() { overrides=read(); apply(); }

export function setupBrandEditor() {
  const editor=document.querySelector('[data-brand-editor]');
  if(!editor)return;
  const status=editor.querySelector('[data-brand-status]');
  function sync() {
    editor.querySelectorAll('[data-colour-picker],[data-colour-hex]').forEach(input=>{
      if(document.activeElement!==input){input.value=current(input.dataset.colourPicker||input.dataset.colourHex);input.removeAttribute('aria-invalid');}
    });
    document.querySelectorAll('[data-colour-current]').forEach(el=>el.textContent=current(el.dataset.colourCurrent));
    editor.querySelectorAll('[data-colour-reset]').forEach(button=>button.disabled=!overrides[button.dataset.colourReset]);
    editor.querySelectorAll('[data-contrast-pair]').forEach(row=>{
      const [fg,bg]=row.dataset.contrastPair.split(' '),ratio=contrast(current(fg),current(bg));
      row.querySelector('[data-contrast-ratio]').textContent=ratio.toFixed(2)+':1';
      const result=row.querySelector('[data-contrast-result]');
      result.textContent=ratio>=4.5?'Pass':'Needs attention';
      result.dataset.pass=String(ratio>=4.5);
    });
    const count=Object.keys(overrides).length;
    status.textContent=count?`${count} colour${count===1?'':'s'} changed · preview saved in this browser.`:'Original palette · no preview changes.';
  }
  function update(id,value) {
    const valid=sanitiseOverrides({[id]:value});
    if(!valid[id])return false;
    if(valid[id]===defaults[id])delete overrides[id];else overrides[id]=valid[id];
    const saved=save();apply();sync();
    if(!saved)status.textContent='Preview updated for this page. Browser storage is unavailable.';
    return true;
  }
  editor.querySelectorAll('[data-colour-picker]').forEach(input=>input.addEventListener('input',()=>update(input.dataset.colourPicker,input.value)));
  editor.querySelectorAll('[data-colour-hex]').forEach(input=>{
    input.addEventListener('input',()=>{
      if(update(input.dataset.colourHex,input.value.trim()))input.removeAttribute('aria-invalid');
    });
    input.addEventListener('change',()=>{
      if(!update(input.dataset.colourHex,input.value.trim())) {
        input.setAttribute('aria-invalid','true');
        status.textContent='Enter # followed by six letters or numbers for the colour, for example #243A53.';
      }
    });
  });
  editor.querySelectorAll('[data-colour-reset]').forEach(button=>button.addEventListener('click',()=>{
    delete overrides[button.dataset.colourReset];save();apply();sync();
  }));
  editor.querySelector('[data-brand-reset]').addEventListener('click',()=>{overrides={};save();apply();sync();});
  editor.querySelector('[data-brand-copy]').addEventListener('click',async()=>{
    const css=':root {\n'+colours.map(c=>`  ${variable(c.id)}: ${current(c.id)};`).join('\n')+'\n\n'+Object.entries(roleAliases).map(([name,id])=>`  --${name}: ${ref(id)};`).join('\n')+'\n}';
    try { await navigator.clipboard.writeText(css); status.textContent='Website colour values copied as CSS.'; }
    catch { status.textContent='Copying is unavailable. Select and copy the colour codes below the tiles instead.'; }
  });
  window.addEventListener('hoea:brand-colours',sync);
  sync();
}

// Preview changes also reach pages already open in another tab.
window.addEventListener('storage',event=>{if(event.key===brandStorageKey||event.key===null){overrides=read();apply();}});
