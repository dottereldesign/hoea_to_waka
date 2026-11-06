import * as css from 'css-tree';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const round=n=>Number(n.toFixed(5));
export function fluidValue(px){
 const min=px*.75, slope=(px-min)/1050*100, intercept=min-slope*3.9;
 return `clamp(${round(min/16)}rem, ${round(intercept/16)}rem + ${round(slope)}vw, ${round(px/16)}rem)`;
}
export function fluidSpacing(source){
 const replacements=[];const ast=css.parse(source,{positions:true});
 css.walk(ast,{visit:'Declaration',enter(node){
  if(!/^(?:margin|padding)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?$|^(?:gap|row-gap|column-gap)$/.test(node.property))return;
  // Only standalone positive lengths: leave calc(), offsets, auto, percentages,
  // existing fluid expressions and small precision spacing intact.
  node.value.children?.forEach(part=>{
   if(part.type==='Dimension'&&part.unit==='px'&&Number(part.value)>8){replacements.push({start:part.loc.start.offset,end:part.loc.end.offset,text:fluidValue(Number(part.value))});}
  });
 }});
 for(const r of replacements.reverse())source=source.slice(0,r.start)+r.text+source.slice(r.end);
 return source;
}
if(process.argv.includes('--apply')){
 const files=execFileSync('git',['ls-files','*.css'],{encoding:'utf8'}).trim().split('\n');let count=0;
 for(const file of files){
  const source=readFileSync(file,'utf8');const next=fluidSpacing(source);if(next===source)continue;
  writeFileSync(file,next);count++;
 }
console.log(`Fluid spacing applied to ${count} stylesheets`);
}
