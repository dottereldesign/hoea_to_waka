import { colourReference, normaliseColour } from '../design/theme-data.mjs';
// Replace declaration colour literals only, never selectors, content strings or URLs.
export function tokeniseCSS(css,colours){
  return css.replace(/([\w-]+\s*:\s*)([^{};]+)(?=[;}])/g,(declaration,property,value)=>{
    if(/^\s*font-family\s*:/.test(property)){
      if(value.includes('var(')||/^(inherit|initial|unset)$/.test(value.trim()))return declaration;
      return property+(value.includes('monospace')?'var(--font-small)':value.includes('serif')&&!value.includes('sans-serif')?'var(--font-heading)':'var(--font-body)');
    }
    if(/^\s*font\s*:/.test(property)){
      // Replace only the family part, preserving the layout's size, weight and line height.
      const family=value.match(/(?:['"]Crimson Text['"]|Manrope|Georgia|Arial|['"]?Times New Roman['"]?)[^;]*$/);
      if(family)return property+value.slice(0,family.index)+(family[0].includes('serif')&&!family[0].includes('sans-serif')?'var(--font-heading)':'var(--font-body)');
      return declaration;
    }
    if(/^(?:\s*(?:content|src|unicode-range))\s*:/.test(property))return declaration;
    return property+value.replace(/url\([^)]*\)|"[^"]*"|'[^']*'|#[\da-fA-F]{3,8}\b|rgba?\([\d\s.,]+\)|(?<![\w-])(?:white|black)(?![\w-])/g,match=>{
      if(match.startsWith('url(')||match.startsWith('"')||match.startsWith("'"))return match;
      const c=normaliseColour(match);if(!c)return match;colours.add(c.colour);return colourReference(match);
    });
  });
}
