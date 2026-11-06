import {readFileSync,writeFileSync} from 'node:fs';
import * as css from 'css-tree';
import {spacingSources,isSpacing} from './spacing-sources.mjs';
const {tokens}=JSON.parse(readFileSync('design/spacing-tokens.json','utf8'));
const definitions=new Map(tokens.map(t=>['--'+t.name,t.value]));
definitions.set('--section-space',readFileSync('design/section-spacing.css','utf8').match(/--section-space:([^;}]+)/)[1]);
const inventory=new Map(),files=spacingSources();
for(const file of files){css.walk(css.parse(readFileSync(file,'utf8')),{visit:'Declaration',enter(node){
 if(!isSpacing(node.property))return;
 for(const atom of node.value.children?.toArray()||[]){const value=css.generate(atom);if(/^(0|auto|inherit|initial|unset|revert)$/.test(value))continue;
 const key=value.match(/^var\((--[^,)]+)\)$/)?.[1];const resolved=definitions.get(key)||value;
 const kind=definitions.has(key)?'Shared spacing':resolved.includes('clamp(')?'Component fluid':/calc\(|var\(|%|vw|vh/.test(resolved)?'Calculated / inherited':'Fixed / alignment';
 const entry=inventory.get(value)||{value,resolved,kind,count:0,uses:[]};entry.count++;
 const use={file,property:node.property,selector:this.rule?.prelude?css.generate(this.rule.prelude):':root'};
 if(entry.uses.length<4&&!entry.uses.some(u=>u.file===file&&u.property===use.property&&u.selector===use.selector))entry.uses.push(use);
 inventory.set(value,entry);
 }
}});}
const rows=[...inventory.values()].sort((a,b)=>a.kind.localeCompare(b.kind)||b.count-a.count);
writeFileSync('assets/spacing-inventory.json',JSON.stringify(rows,null,2)+'\n');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const table=items=>'<div class="spacing-inventory-scroll"><table><thead><tr><th>Value / definition</th><th>Behaviour</th><th>Occurrences</th><th>Used in</th></tr></thead><tbody>'+items.map(r=>`<tr><td><code>${esc(r.value)}</code>${r.value!==r.resolved?'<small>'+esc(r.resolved)+'</small>':''}</td><td>${r.kind}</td><td>${r.count}</td><td>${r.uses.map(u=>`<small>${esc(u.file)} · ${esc(u.property)}<br>${esc(u.selector)}</small>`).join('')}</td></tr>`).join('')+'</tbody></table></div>';
const shared=rows.filter(r=>r.kind==='Shared spacing'),exceptions=rows.filter(r=>r.kind!=='Shared spacing');
const samples=[[8,8,'Inset','Fixed page-edge spacing.'],[9,12,'Small','Labels and compact content groups.'],[12,16,'Compact','Controls and related content.'],[15,20,'Content','Common text and content gaps.'],[18,24,'Group','Related blocks and card padding.'],[24,32,'Card','Larger card and grid spacing.'],[36,48,'Block','Space between larger content groups.'],[60,92,'Section','Above and below standard sections.']];
const content=`<section class="site-preview-section site-preview-spacing" id="spacing">
<div class="site-preview-spacing-head"><p class="site-preview-typeface-eyebrow">Layout rhythm</p><h2>Section Spacing</h2><p>Use a consistent rhythm between related content, cards and whole sections. These are frequently used spacing ranges across the website. Identical fluid formulas share one definition; component-specific exceptions remain separate.</p></div>
<div class="spacing-rhythm-grid">${samples.map(([min,max,name,note])=>`<article><h3>${name}</h3><strong>${min===max?min:min+'–'+max}px</strong><div class="spacing-rhythm-bar" style="--space-example:${max}px" aria-hidden="true"></div><p>${note}</p></article>`).join('')}</div>
<article class="site-preview-spacing-rule"><h3>Standard section spacing</h3><p>Use <code>var(--section-space)</code> above and below standard sections. It grows smoothly from 60px at a 390px viewport to 92px at 1440px, staying within those limits. At 768px it is about 72px; at 1100px it is about 82px.</p><p>Pixel examples assume a 16px root size. The rem limits respect the reader’s font settings.</p><h3>How to apply it</h3><p>Keep related elements close and leave more space between topics. Reuse the existing shared spacing for a component before introducing another size. If two connected blocks sit together, remove spacing on the joining edge.</p><p>Keep the 8px page inset, tiny alignment gaps and negative offsets where needed. Navigation clearance, animation layouts, game controls and logo construction have their own requirements.</p></article>
<details class="spacing-inventory"><summary>Developer spacing reference <span>${rows.length} individual definitions</span></summary><p>Individual values are counted once, rather than counting every combination of top, right, bottom and left padding as a new size. This inventory follows the stylesheets linked by current site pages, maps compiled bundles back to their source, and includes responsive and interaction rules. It does not claim every rule is visible in every state.</p><p>${shared.length} shared definitions preserve existing values exactly. ${exceptions.length} component-specific, calculated or fixed values remain for separate review.</p><a href="../../assets/spacing-inventory.json" download>Download the spacing inventory</a><details><summary>Shared spacing definitions · ${shared.length}</summary>${table(shared)}</details><details><summary>Component-specific and fixed values · ${exceptions.length}</summary>${table(exceptions)}</details></details>
</section>`;
const path='about/brand-guidelines/index.html';let h=readFileSync(path,'utf8');const start=h.indexOf('<section class="site-preview-section site-preview-spacing"'),end=h.indexOf('</section>',start)+10;h=h.slice(0,start)+content+h.slice(end);writeFileSync(path,h);
console.log(`${rows.length} individual definitions: ${shared.length} shared, ${exceptions.length} exceptions; ${files.length} source stylesheets.`);
