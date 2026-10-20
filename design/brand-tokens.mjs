export const brandStorageKey = 'hoea-brand-colours-v1';
export const families = [
  { id:'ocean', name:'Ocean', base:800, role:'Primary · Brand recognition, hero and navigation', values:['#F0F4F8','#E9EEF4','#C8D5E0','#A9C5CE','#829FB2','#607F9D','#3F5B78','#243A53','#1A2B3D'] },
  { id:'forest', name:'Forest', base:800, role:'Secondary · Grounding, cards and feature sections', values:['#F1F5F0','#E8EEE9','#CBDBCD','#ABC4AE','#87A78C','#6B916F','#4C7054','#344A3A','#24362A'] },
  { id:'aubergine', name:'Aubergine', base:800, role:'Secondary · Depth, storytelling and editorial sections', values:['#FAF7FB','#F1EAF2','#E2D5E5','#C8B4CE','#A18AA9','#806788','#58415F','#281A2C','#201423'] },
  { id:'lavender', name:'Lavender', base:500, role:'Supporting · Light panels and highlights', values:['#FCFAFC','#F7F2F8','#F0E9F2','#E6DBE9','#D8CBDD','#B9A9C0','#98859F','#74647D','#514459'] },
];
const colour = (id,name,hex,role) => ({id,name,hex,role});
export const neutrals = [
  colour('paper','Paper','#FFFFFF','Default page surface, cards and overlays'),
  colour('warm-white','Warm White','#F8F8F6','Soft neutral accents and secondary surfaces'),
  colour('ivory','Ivory','#F5F3EE','Warm content sections'),
  colour('cool-mist','Cool Mist','#EDF1F3','Secondary surfaces'),
  colour('stone','Stone','#E3E1DD','Dividers and borders'),
  colour('slate','Slate','#6B7178','Supporting labels'),
  colour('ink','Ink','#202329','High-contrast text'),
  colour('ocean-900','Ocean Night','#1A2B3D','Deep footer and dark UI'),
  colour('aubergine-900','Plum Night','#201423','Alternate dark UI'),
];
export const accents = [
  colour('ocean-400','Coastal Mist','#A9C5CE','Wave imagery and infographic fills'),
  colour('dusty-rose','Dusty Rose','#C88F99','Human warmth and small editorial highlights'),
  colour('sandstone','Sandstone','#D6BA83','Small warm details and diagrams'),
  colour('soft-sage','Soft Sage','#B8C9B5','Land imagery and calm surfaces'),
];
export const semantics = [
  colour('success','Success','#347A56','Positive outcomes · pair with Forest 200'),
  colour('warning','Warning','#A86823','Caution · use a dedicated pale surface'),
  colour('error','Error','#B74855','Errors · use a dedicated pale surface'),
  colour('ocean-800','Information','#243A53','Information · pair with Ocean 200'),
  colour('ocean-600','Focus ring','#607F9D','Visible keyboard focus'),
];
export const scales = families.flatMap(f=>f.values.map((hex,i)=>colour(`${f.id}-${(i+1)*100}`,`${f.name} ${(i+1)*100}`,hex,`${(i+1)*100} tonal level`)));
export const colours = [...new Map([...scales,...neutrals,...accents,...semantics].map(c=>[c.id,c])).values()];
export const defaults = Object.fromEntries(colours.map(c=>[c.id,c.hex]));
export const primary = families.map(f=>colour(`${f.id}-${f.base}`,f.name,f.values[f.base/100-1],f.role));
export const variable = id => `--brand-${id}`;
export const ref = id => `var(${variable(id)})`;
export const roleAliases = {
  'brand-primary':'ocean-800','brand-secondary':'forest-800','brand-accent':'aubergine-800','brand-lavender':'lavender-500',
  'surface-page':'paper','surface-card':'paper','surface-blue':'ocean-200','surface-green':'forest-200','surface-lavender':'aubergine-200',
  'text-primary':'ink','text-muted':'slate','text-inverse':'paper','border-default':'stone',
};
export const validHex = value => /^#[0-9a-f]{6}$/i.test(value);
export function sanitiseOverrides(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id,hex])=>Object.prototype.hasOwnProperty.call(defaults,id) && typeof hex==='string' && validHex(hex)).map(([id,hex])=>[id,hex.toUpperCase()]));
}
export function luminance(hex) {
  return hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
}
export function contrast(a,b) { const x=luminance(a),y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }

// Map old layout paint to an exact supplied swatch, rather than inventing colours.
const exact = {
  '#142044':'ocean-800','#284cb4':'ocean-800','#104fc8':'ocean-800','#153e35':'forest-800',
  '#f5f8f4':'paper','#1e4b40':'forest-700','#54776a':'forest-600','#d0ded5':'forest-300',
  '#d6e8bd':'forest-300','#526078':'slate','#c7cede':'stone','#6e5473':'aubergine-700',
  '#ffffff':'paper','#f8f9fa':'paper','#f8f8f6':'warm-white','#dce2f0':'stone','#eef1f9':'ocean-200',
};
export function legacyToken(hex) {
  hex=hex.toLowerCase();
  if(exact[hex])return exact[hex];
  const same=colours.find(c=>c.hex.toLowerCase()===hex); if(same)return same.id;
  const [r,g,b]=hex.slice(1).match(/../g).map(v=>parseInt(v,16)),hi=Math.max(r,g,b),lo=Math.min(r,g,b),delta=hi-lo,L=luminance(hex);
  if(delta<22) {
    if(L>.97)return 'paper'; if(L>.90)return 'warm-white'; if(L>.84)return 'ivory'; if(L>.74)return 'cool-mist';
    if(L>.54)return 'stone'; if(L>.13)return 'slate'; return 'ink';
  }
  let hue=(hi===r?((g-b)/delta)%6:hi===g?(b-r)/delta+2:(r-g)/delta+4)*60; hue=(hue+360)%360;
  const family=hue>=75&&hue<170?'forest':hue>=265&&hue<335?'aubergine':hue<45||hue>=335?'aubergine':hue<75?'lavender':'ocean';
  const candidates=scales.filter(c=>c.id.startsWith(family+'-'));
  return candidates.reduce((best,c)=>Math.abs(luminance(c.hex)-L)<Math.abs(luminance(best.hex)-L)?c:best).id;
}
export function semanticRoles(dark=false) {
  const ids=dark?{bg:'ocean-900',surface:'ocean-800',raised:'ocean-700',ink:'paper',muted:'ocean-300',action:'lavender-500','on-action':'aubergine-800',line:'ocean-600',soft:'ocean-800',accent:'forest-700','on-accent':'paper',highlight:'aubergine-700','on-highlight':'paper','component-accent':'aubergine-800','component-counter':'forest-800'}:
    {bg:'paper',surface:'paper',raised:'cool-mist',ink:'ink',muted:'slate',action:'ocean-800','on-action':'paper',line:'stone',soft:'ocean-200',accent:'lavender-500','on-accent':'aubergine-800',highlight:'forest-200','on-highlight':'forest-800','component-accent':'lavender-500','component-counter':'forest-200'};
  Object.assign(ids,{inverse:'ocean-800','on-inverse':'paper','inverse-muted':'ocean-300',focus:'ocean-600',success:'success',error:'error',warning:'warning',information:'ocean-800'});
  return Object.entries(ids).map(([name,id])=>`--t-${name}:${ref(id)}`).join(';');
}
