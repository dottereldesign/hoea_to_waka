import React from 'react';
import { palettes } from './theme-data.mjs';

export const colourKey=key=>`colour:${key}`;
export const validPalette=id=>palettes.some(p=>p.id===id);
export function clearColour(el){delete el.dataset.componentPalette;delete el.dataset.colourContext;delete el.dataset.colourInverse;}
export function applyColour(entry,saved){
  const id=saved[colourKey(entry.key)];
  if(!validPalette(id)){clearColour(entry.el);return;}
  const section=entry.parent||entry;
  entry.el.dataset.componentPalette=id;
  entry.el.dataset.colourContext=section.type;
  entry.el.dataset.colourInverse=String([2,5].includes(section.value)||section.el.dataset.collection==='Nocturnal');
}
export function ComponentColours({entry,value,onChange}){
  const inherited=entry.atom?'Use parent colours':'Use site theme';
  return <details className="ds-component-colours" open><summary>Colour scheme <span>{palettes.find(p=>p.id===value)?.name||inherited}</span></summary><p>{entry.atom?'Override just this element, or inherit from its surrounding component.':'Give this component its own palette. Other components keep their colours.'} Layout and colour choices are independent.</p><div className="ds-component-palettes" role="group" aria-label="Component colour scheme"><button type="button" aria-pressed={!value} onClick={()=>onChange('')} className="ds-colour-inherit"><span aria-hidden="true">↳</span>{inherited}</button>{palettes.map(p=><button type="button" key={p.id} aria-pressed={value===p.id} onClick={()=>onChange(p.id)}><span className="ds-colour-swatches" aria-hidden="true">{p.colours.map(c=><i key={c} style={{background:c}}/>)}</span><span>{p.name}</span></button>)}</div></details>;
}
