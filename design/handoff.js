import { classify, extract, renderers, url } from './renderers';
import { palettes, semanticTokens } from './theme-data.mjs';
import { validLayout, layoutInfo, renderLayout, categoryFor } from './layout-catalog';
import { draft } from './draft';

export const componentSelector='body > .site-header,main > section,body > .site-footer,.error-card,body > .site-utility-menu';
export const atomSelector='[data-card-unit],.ds-button,.ds-preserved-form,.ds-preserved-form .field';
export const atomType=el=>el.matches('.ds-button')?'button':el.matches('.field')?'field':el.matches('form')?'form':'card';
const paths=['','about/','services/','services/in-house-workshops/','services/resilience-one-on-one/','services/workshops-for-support-professionals/','resources/','contact/','illustrations/','404.html'];
const valid=v=>Number.isInteger(v)&&v>=0&&v<=50;
const label=el=>(el.querySelector('h1,h2,h3,label,summary')?.textContent||el.getAttribute('aria-label')||el.textContent||'').replace(/\s+/g,' ').trim().slice(0,160);

// Read-only snapshot: no form values, typography, navigation or storage mutations.
export async function createHandoff({saved,components,atoms,route,names,atomNames,appearance,mode}){
  const choices={...saved};
  components.forEach(c=>choices[c.key]=c.value);
  atoms.forEach(a=>choices[a.key]=a.value);
  [...components,...atoms].forEach(entry=>{const key=`colour:${entry.key}`;if(entry.el.dataset.componentPalette)choices[key]=entry.el.dataset.componentPalette;else delete choices[key];});
  const colourChoice=(key,inherited)=>{const own=palettes.find(p=>p.id===choices[`colour:${key}`]);const resolved=own||palettes.find(p=>p.id===inherited);return {source:own?'override':'inherit',id:resolved.id,name:resolved.name};};
  const palette=window.HoeaAppearance.palettes.find(p=>p.id===appearance.palette);
  const documents=await Promise.all(paths.map(async path=>{
    const response=await fetch(url(path),{cache:'no-cache',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error(`Could not read ${path||'home'} (${response.status}). Please try again.`);
    const doc=new DOMParser().parseFromString(await response.text(),'text/html');
    if(!doc.querySelector('script[src*="assets/design-studio.js"]'))throw new Error(`The ${path||'home'} page could not be verified. Please try again.`);
    // site.js inserts this after all source sections; retain the same stable index.
    if(doc.querySelector('[data-theme-toggle]')&&!doc.querySelector('body > .site-utility-menu')){
      const utility=doc.createElement('div');utility.className='site-utility-menu';doc.body.append(utility);
    }
    return {path,doc};
  }));
  const shared={},effectiveChoices={},effectiveColourOverrides={},pages=[];
  let detailCount=0;
  for(const {path,doc} of documents){
    const routeKey=path||'home';
    const page={path:path||'/',title:doc.title,components:[]};
    [...doc.querySelectorAll(componentSelector)].forEach((original,index)=>{
      const type=classify(original);if(!renderers[type])return;
      const isShared=type==='navbar'||type==='footer',key=isShared?type:`${routeKey}:${index}:${type}`;
      if(isShared&&shared[key])return;
      const live=components.find(c=>c.key===key);
      const variant=validLayout(type,choices[key])?choices[key]:1;
      const selectedLayout=layoutInfo(type,variant);
      const selection={key,type,category:categoryFor(type).label,label:live?.data.title||label(original)||type,sourceElementId:original.id||null,design:{id:variant,name:selectedLayout.name,purpose:selectedLayout.group},selectionSource:live?'current-page':validLayout(type,saved[key])?'saved':'default',details:[]};
      selection.colour=colourChoice(key,palette.id);
      if(selection.colour.source==='override')effectiveColourOverrides[key]=selection.colour.id;
      effectiveChoices[key]=variant;
      let surface=original;
      if(variant){
        surface=doc.createElement('div');
        const data=extract(original,type);
        surface.innerHTML=renderLayout(data,variant);
        const form=original.querySelector('[data-contact-form]')?.cloneNode(true);
        if(form){form.classList.add('ds-preserved-form');surface.querySelector('[data-form-slot]')?.append(form);}
      }
      const colourParents=new Map([[surface,selection.colour.id]]);
      [...surface.querySelectorAll(atomSelector)].forEach((el,i)=>{
        const kind=atomType(el),atomKey=`${key}:v${variant}:${kind}:${i}`,value=choices[atomKey];
        let parent=el.parentElement;while(parent&&!colourParents.has(parent))parent=parent.parentElement;
        const colour=colourChoice(atomKey,colourParents.get(parent)||selection.colour.id);colourParents.set(el,colour.id);
        if((!valid(value)||value===0)&&colour.source!=='override')return;
        const selected=valid(value)?value:0;
        selection.details.push({key:atomKey,type:kind,index:i,label:label(el)||kind,design:{id:selected,name:atomNames[kind]?.[selected]||names[selected]},colour});
        if(colour.source==='override')effectiveColourOverrides[atomKey]=colour.id;
        effectiveChoices[atomKey]=selected;detailCount++;
      });
      if(isShared)shared[key]=selection;else page.components.push(selection);
    });
    pages.push(page);
  }
  return {
    format:'hoea-to-waka/client-design-handoff',schemaVersion:3,studioVersion:3,
    draft:{id:draft.id,name:draft.name,baselineExportedAt:draft.sourceExportedAt},
    exportedAt:new Date().toISOString(),site:url(''),exportedFrom:route,
    purpose:'Use these selections to build a client-ready version of the existing site. Remove the design picker, stepping arrows, appearance controls and export controls from that client version. Keep typography unchanged.',
    colour:{id:palette.id,name:palette.name,mode,families:[...palette.colours],tokens:semanticTokens(palette,mode==='dark')},
    motionEnabled:saved.motion!==false,
    selectionRules:{shared:'Navigation and footer apply across every page.',defaults:'All top-level components are listed. Unmodified components use their category’s first existing layout (1). Unlisted nested elements use their section default (0).',nested:'Nested keys include the selected parent layout and the zero-based index in atomSelector. Choices for inactive parent layouts are excluded.',reference:'Resolve stable type and ID pairs using design/layout-catalog.js and design/purpose-renderers.js. Earlier IDs 0–50 remain compatible. Purpose layouts 101–200 only apply to their declared category.'},
    summary:{pages:pages.length,components:Object.keys(shared).length+pages.reduce((n,p)=>n+p.components.length,0),nestedOverrides:detailCount},
    sharedComponents:Object.values(shared),pages,effectiveChoices,effectiveColourOverrides,
    colourRules:'The site palette is the default. effectiveColourOverrides pins individual components or nested elements to another palette. Unpinned children inherit their nearest parent palette; all palettes follow the site light/dark mode. Colour-only nested choices are included even when their design is Section default (0).',
  };
}

export function downloadHandoff(data){
  const objectURL=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=objectURL;anchor.download=`hoea-client-design-${data.exportedAt.slice(0,10)}.json`;
  anchor.click();setTimeout(()=>URL.revokeObjectURL(objectURL),1000);
}
