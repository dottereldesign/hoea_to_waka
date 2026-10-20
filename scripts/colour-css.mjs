const hex=channels=>'#'+channels.map(c=>Math.max(0,Math.min(255,Math.round(c))).toString(16).padStart(2,'0')).join('');
export function normaliseColour(value){
  if(value[0]==='#'){let h=value.slice(1).toLowerCase();if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');return {colour:'#'+h.slice(0,6),alpha:h.length===8?parseInt(h.slice(6),16)/255:1};}
  if(value==='white')return {colour:'#ffffff',alpha:1};if(value==='black')return {colour:'#000000',alpha:1};
  const n=value.match(/[\d.]+/g)?.map(Number);return n?.length>=3?{colour:hex(n.slice(0,3)),alpha:n[3]??1}:null;
}
export const colourVariable = value => `--paint-${normaliseColour(value).colour.slice(1)}`;
export function colourReference(value){const c=normaliseColour(value);const base=`var(--paint-${c.colour.slice(1)}, ${c.colour})`;return c.alpha===1?base:`color-mix(in srgb, ${base} ${+(c.alpha*100).toFixed(3)}%, transparent)`;}
