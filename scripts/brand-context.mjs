import {readFile,writeFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {colours,roleAliases,semanticRoles} from '../design/brand-tokens.mjs';
const guideURL='https://dottereldesign.github.io/hoea_to_waka/about/brand-guidelines/';
const {document}=parseHTML(await readFile('about/brand-guidelines/index.html','utf8'));
const root=document.querySelector('.site-preview');
const text=element=>element.textContent.replace(/\s+/g,' ').trim();
const excluded='#brand-guide-cover,#cover,#contents,#guide-valuation,#presentation,.brand-ai,.brand-preview-tools,.brand-preview-status,.platform-preview,.brand-email-body,.bt-panel,.brand-swatch,.brand-tonal-tile,[role="status"],svg,button,script,style';
const seen=new Set();
const sections=[...root.querySelectorAll('h2,h3,h4,p,li,figcaption,.brand-guide-help,.brand-pack-note,.social-preview-disclaimer')].flatMap(element=>{
 if(element.closest(excluded))return [];
 if(element.parentElement?.closest('p,li,figcaption,.brand-guide-help'))return [];
 const value=text(element);if(!value||seen.has(value))return [];seen.add(value);
 const level=element.tagName.match(/^H([2-4])$/)?.[1];
 return [(level?'#'.repeat(Number(level))+' ':element.tagName==='LI'?'- ':'')+value];
}).join('\n\n');
const assets=[...root.querySelectorAll('a[download],.brand-font-source,.brand-download-quick a')].filter(a=>!a.closest('.brand-ai')).map(a=>({name:text(a),url:new URL(a.getAttribute('href'),guideURL).href}));
const uniqueAssets=[...new Map(assets.map(a=>[a.url,a])).values()];
const typeCSS=await readFile('design/static-pages.css','utf8');
const typeWeights=Object.fromEntries([...typeCSS.matchAll(/--font-weight-(display|heading|body|eyebrow|ui|small):(\d+)/g)].map(m=>[m[1],Number(m[2])]));
const siteCSS=await readFile('site.css','utf8');
const radii=Object.fromEntries([...siteCSS.matchAll(/--radius-(sm|md|lg):\s*(\d+)px/g)].map(m=>[m[1],{$type:'dimension',$value:{value:Number(m[2]),unit:'px'}}]));
const spacingCSS=await readFile('design/section-spacing.css','utf8');
const spaces=[...spacingCSS.matchAll(/--section-space:(\d+)px/g)].map(m=>Number(m[1]));
const theme=dark=>Object.fromEntries([...semanticRoles(dark).matchAll(/--t-([\w-]+):var\(--brand-([\w-]+)\)/g)].map(m=>[m[1],{$type:'color',$value:`{brand.${m[2]}}`}]));
const tokens={
 $description:'Hoea tō Waka published design tokens. DTCG 2025.10 values; browser-only colour previews are excluded. Importer support varies.',
 brand:Object.fromEntries(colours.map(c=>[c.id,{$type:'color',$value:{colorSpace:'srgb',components:c.hex.slice(1).match(/../g).map(v=>Number((parseInt(v,16)/255).toFixed(8))),alpha:1},$description:`${c.name}: ${c.role}. HEX ${c.hex}`} ])),
 semantic:Object.fromEntries(Object.entries(roleAliases).map(([key,id])=>[key,{$type:'color',$value:`{brand.${id}}`} ])),
 theme:{light:theme(false),dark:theme(true)},
 font:{primary:{$type:'fontFamily',$value:['Inter','Arial','sans-serif']},testimonial:{$type:'fontFamily',$value:['ABC Marist','Georgia','serif'],$description:'ABC Marist Book 350 is licensed separately. Use for testimonial quotes; keep headings, attribution and controls in Inter.'},weight:Object.fromEntries(Object.entries(typeWeights).map(([key,value])=>[key,{$type:'fontWeight',$value:value}]))},
 radius:radii,sectionSpacing:Object.fromEntries(['desktop','tablet','mobile'].map((id,i)=>[id,{$type:'dimension',$value:{value:spaces[i],unit:'px'},$description:['Above 1100px','761–1100px','760px and below'][i]}]))
};
const css=':root {\n'+colours.map(c=>`  --brand-${c.id}: ${c.hex};`).join('\n')+'\n'+Object.entries(roleAliases).map(([key,id])=>`  --${key}: var(--brand-${id});`).join('\n')+'\n}\n';
const palette=colours.map(c=>`| ${c.id} | ${c.hex} | ${c.role} |`).join('\n');
const context=`# Hoea tō Waka — full brand context\n\nSource: ${guideURL}\nPublication: ${text(document.querySelector('.site-preview-guide-cover-meta'))}\nScope: published brand guidelines and repository design tokens; browser-only colour previews are excluded.\n\n## Working instructions\n\nUse this as the brand reference for my next request. Preserve the spelling Hoea tō Waka, including the macron in tō. Before creating anything, ask what I want to make if I have not specified a deliverable. Treat mockups and sample content as examples, not live accounts, testimonials, metrics or confirmed events. Do not invent cultural meanings, claims, outcomes, contact details or approvals. Use supplied logo artwork rather than redrawing it.\n\n## Brand essentials\n\nName: Hoea tō Waka\nBrand line: Strength in Aotearoa\nVision: ${text(document.querySelector('#brand-vision-statement'))}\nMission: ${text(document.querySelector('#brand-mission-statement'))}\n\n## Published guide\n\n${sections}\n\n## Design tokens — published colours\n\n| Token | HEX | Purpose |\n| --- | --- | --- |\n${palette}\n\n### CSS variables and semantic aliases\n\n\`\`\`css\n${css}\`\`\`\n\n### Structured design tokens\n\nDTCG 2025.10 JSON follows. Colour components use sRGB values from 0 to 1. Alias values reference the published brand tokens. Importer support varies; use a compatible token importer or map values to Figma variables. This text does not itself create Figma variables.\n\n\`\`\`json\n${JSON.stringify(tokens,null,2)}\n\`\`\`\n\n## Supplied assets and downloads\n\n${uniqueAssets.map(a=>`- [${a.name}](${a.url})`).join('\n')}\n\n- [Black horizontal logo](${new URL('../../assets/brand-downloads/hoea-to-waka-horizontal-black.svg',guideURL)})\n- [White horizontal logo](${new URL('../../assets/brand-downloads/hoea-to-waka-horizontal-white.svg',guideURL)})\n\n## Contact details published in the guide\n\nAnna Brown — Founder and Programme Developer\nanna@hoeatowaka.co.nz\n027 205 9520\nhoeatowaka.co.nz\nŌtautahi Christchurch, Aotearoa New Zealand\n\n## My next request\n\nI will describe what I want to create after this context. Follow the published brand rules, use the linked original assets and check the final result for readability, macrons and accessibility.\n`;
const figma=`# Figma Make / design handoff — Hoea tō Waka\n\nUse the complete brand context below to prepare my next design. Ask for the screen, artifact, size and content if I have not supplied them.\n\n- Use auto layout, reusable components, descriptive layer names and responsive constraints.\n- Map the supplied colour tokens to named variables and semantic roles, with light and dark modes where needed.\n- Use Inter for the brand name, headings, body, buttons and controls. Use ABC Marist Book 350 only for testimonial quotes if the separately licensed font is available; otherwise flag the missing font and use a clearly marked temporary serif fallback.\n- Use the linked supplied SVG logo artwork. Preserve the macron in Hoea tō Waka.\n- Use the supplied section spacing and radius tokens. The main site uses white/Paper with Ink text and actions; supporting colours are available for specific sections.\n- Check phone readability, keyboard focus, colour contrast and reduced motion for interactive concepts.\n- These instructions are for Figma Make or a design handoff. Pasting this text onto an ordinary Figma canvas does not import variables or create a design automatically. Tokens JSON is provided separately for compatible importers.\n\n---\n\n${context}`;
for(const [file,body]of[['brand-context.md',context],['figma-context.md',figma],['brand-tokens.json',JSON.stringify(tokens,null,2)+'\n']])await writeFile('about/brand-guidelines/'+file,body);
console.log(`Brand context: ${context.length} characters, ${colours.length} colours, ${uniqueAssets.length} source asset links`);
