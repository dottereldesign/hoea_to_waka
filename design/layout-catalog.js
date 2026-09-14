import { directions } from './directions';
import { categories, categoryFor, existingRecommendations, existingEntry } from './catalog-existing.mjs';
import { purposeLayouts, renderPurpose } from './purpose-renderers';
import { renderers } from './renderers';
import { renderExtended } from './extended-renderers';

export { categories, categoryFor, purposeLayouts };
const legacyNames=['Original','Editorial','Open water','Blueprint','Field notes','Constellation',...directions.map(d=>d.name)];
const atomNames={button:['Section default','Underline & arrow','Split action','Outlined capsule','Offset stamp','Icon reveal'],card:['Section default','Editorial rule','Raised panel','Offset outline','Notebook edge','Spotlight frame'],form:['Section default','Quiet sheet','Framed form','Two-tone panel','Letter paper','Focused surface'],field:['Section default','Bottom rule','Filled field','Side accent','Paper outline','Soft inset']};
export const validLayout=(type,id,atom=false)=>Number.isInteger(id)&&((id>=0&&id<=50)||(!atom&&purposeLayouts.some(p=>p.id===id&&p.type===type)));
export function layoutInfo(type,id,atom=false){
  if(id===0)return {id,type,name:atom?'Section default':'Original',group:'Original',description:atom?'Inherit the surrounding layout.':'Your original composition, with your current colours and typography.'};
  if(atom)return {id,type,name:atomNames[type]?.[id]||`${legacyNames[id]} ${type}`,group:id<=5?'Essentials':'Detailed treatments',description:`An individual ${type} treatment. Content and surrounding components stay in place.`};
  return purposeLayouts.find(p=>p.type===type&&p.id===id)||existingEntry(type,id)||{id,type,name:legacyNames[id],group:'Earlier explorations',description:'An earlier composition, preserved for your saved choices.'};
}
export function recommendedLayouts(entry){
  const {type,atom}=entry;
  const fresh=atom?[]:purposeLayouts.filter(p=>p.type===type);
  const recommended=atom?Array.from({length:25},(_,i)=>layoutInfo(type,i+1,true)):fresh.length?fresh:existingRecommendations[type]||Array.from({length:5},(_,i)=>layoutInfo(type,i+1));
  return [layoutInfo(type,0,atom),...recommended];
}
export function earlierLayouts(entry){const ids=new Set(recommendedLayouts(entry).map(p=>p.id));return Array.from({length:50},(_,i)=>i+1).filter(id=>!ids.has(id)).map(id=>layoutInfo(entry.type,id,entry.atom));}
export function stepLayout(entry,delta){const options=recommendedLayouts(entry),index=options.findIndex(p=>p.id===entry.value);return options[index<0?(delta>0?1:options.length-1):(index+delta+options.length)%options.length].id;}
export function renderLayout(data,id){return id>50?renderPurpose(data,id):id>5?renderExtended(data,id):renderers[data.type][id-1](data);}
