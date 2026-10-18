import { colours, ref, variable, legacyToken, semanticRoles, luminance, roleAliases } from '../design/brand-tokens.mjs';

export function brandCSS(paints) {
  const defaults=colours.map(c=>`${variable(c.id)}:${c.hex}`).join(';');
  const aliases=[...paints].map(hex=>`--paint-${hex.slice(1)}:${ref(legacyToken(hex))}`);
  const levels=[.975,.93,.86,.76,.64,.50,.36,.24,.15,.08,.035,.009];
  ['ocean','aubergine','lavender','forest','neutral'].forEach((family,index)=>levels.forEach((level,i)=>{
    const options=family==='neutral'?colours.filter(c=>['paper','warm-white','ivory','cool-mist','stone','slate','ink'].includes(c.id)):colours.filter(c=>c.id.startsWith(family+'-'));
    const nearest=options.reduce((a,b)=>Math.abs(luminance(a.hex)-level)<Math.abs(luminance(b.hex)-level)?a:b);
    aliases.push(`--ramp-${index}-${i+1}:${ref(nearest.id)}`);
  }));
  return `:root{${defaults};${Object.entries(roleAliases).map(([key,id])=>`--${key}:${ref(id)}`).join(';')}}
:root,html[data-palette],html[data-palette] [data-component-palette]{${aliases.join(';')};${semanticRoles(false)}}
html[data-palette][data-theme="dark"],html[data-palette][data-theme="dark"] [data-component-palette]{${semanticRoles(true)}}
`;
}
