import React from 'react';
import { createRoot } from 'react-dom/client';
import { animate, stagger } from 'motion';
import { TextEffect, AnimatedBackground } from './motion-primitives';
import { renderers, extract, classify, icon, esc, url } from './renderers';
import { directions, direction, MAX_VARIANT, colourStyle, entryMotion } from './directions';
import { renderExtended } from './extended-renderers';

const names = ['Original','Editorial','Open water','Blueprint','Field notes','Constellation',...directions.map(d=>d.name)];
const descriptions = ['Your original layout with the shared colour and type settings.','Generous type, fine rules and asymmetric compositions.','Immersive imagery, inverse surfaces and cinematic transitions.','Confident grids, strong hierarchy and graphic geometry.','Tactile notes, overlapping photography and human warmth.','Orbital compositions, inverse surfaces and spring interactions.',...directions.map(d=>d.description)];
const motions = ['Original animation','Staggered rise','Soft-focus dissolve','Horizontal reveal','Gentle paper tilt','Spring and scale',...directions.map(d=>d.motion)];
const storageKey='hoea-design-studio-v1';
let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch{}
let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = saved.motion === false;
document.documentElement.classList.toggle('ds-motion-paused', paused || reduced);
const persist = () => {try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{}};
const params = new URLSearchParams(location.search);
const forced = params.has('design') ? Math.min(MAX_VARIANT,Math.max(0,Math.trunc(Number(params.get('design'))||0))) : null;
const originals = new Map();
const originalThemeToggle=document.querySelector('[data-theme-toggle]');
const components = [];
const route = location.pathname.replace(new URL(url('')).pathname,'').replace(/index.html$/,'') || 'home';
const toast=document.createElement('div');toast.className='ds-toast';toast.setAttribute('role','status');document.body.append(toast);
let toastTimer;
function announce(s){toast.textContent=s;toast.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),2500);}

// The preserved DOM nodes keep their event listeners, form values, and native state.
const nodes=[...document.querySelectorAll('body > .site-header,main > section,body > .site-footer,.error-card,body > .site-utility-menu')];
nodes.forEach((el,index)=>{
  const type=classify(el); if(!renderers[type])return;
  const key=(type==='navbar'||type==='footer')?type:`${route}:${index}:${type}`;
  const marker=document.createComment(`Design component: ${key}`);el.before(marker);
  const id=el.id;
  const form=el.querySelector('[data-contact-form]');
  let formMarker;if(form){formMarker=document.createComment('Preserved enquiry form');form.before(formMarker);}
  const shield=el.querySelector('[data-shielded-site]');let shieldMarker;if(shield){shieldMarker=document.createComment('Preserved shielded link');shield.before(shieldMarker);}
  const comp={key,type,original:el,el,marker,id,data:extract(el,type),form,formMarker,shield,shieldMarker,roots:[],cleanup:[],value:0};
  originals.set(key,el);components.push(comp);
});

function cleanup(c){c.roots.forEach(r=>r.unmount());c.roots=[];c.cleanup.forEach(f=>f());c.cleanup=[];}
function render(c,value,{quiet=false,initial=false}={}){
  const previous=c.el.getBoundingClientRect();
  // Clear transient atom presentation before relocating the preserved form.
  atomEntries.filter(a=>a.parent===c).forEach(a=>applyAtom(a,0,false));
  cleanup(c);
  if(c.form)c.formMarker.after(c.form);
  if(c.shield)c.shieldMarker.after(c.shield);
  if(c.original.matches('.site-header.is-open')) c.original.querySelector('[data-menu-toggle]')?.click();
  c.el.remove();c.value=value;
  if(value===0){c.el=c.original;c.marker.after(c.el);}else{
    const node=document.createElement(c.type==='navbar'?'header':c.type==='footer'?'footer':['error','utility'].includes(c.type)?'div':'section');
    node.className=`ds-component ds-v${value} ds-type-${c.type}${value>5?' ds-expanded':''}`;
    if(value>5){const d=direction(value);node.dataset.collection=d.collection;node.dataset.layout=d.slug;node.style.cssText=colourStyle(d);}
    node.dataset.design=value;node.dataset.component=c.key;
    if(c.id)node.id=c.id;
    node.innerHTML=value>5?renderExtended(c.data,value):renderers[c.type][value-1](c.data);
    if(c.form){node.querySelector('[data-form-slot]')?.append(c.form);c.form.classList.add('ds-preserved-form');}
    if(c.shield)node.querySelector('[data-shielded-slot]')?.append(c.shield);
    c.el=node;c.marker.after(node);
    wire(node,c,initial);
  }
  if(value===0){c.form?.classList.remove('ds-preserved-form');if(originalThemeToggle){const dark=document.documentElement.dataset.theme==='dark';originalThemeToggle.setAttribute('aria-pressed',String(dark));originalThemeToggle.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');}}
  document.body.classList.toggle('ds-new-nav',components.find(x=>x.type==='navbar')?.value>0);
  document.body.classList.toggle('ds-original-nav',components.find(x=>x.type==='navbar')?.value===0);
  if(!initial){saved[c.key]=value;persist(); if(previous.bottom<0) window.scrollBy(0,c.el.getBoundingClientRect().height-previous.height);}
  registerAtoms(c);
  requestPosition();
  if(!quiet)announce(`${titles[c.type]||c.type}: ${names[value]}`);
}
function wire(el,c,initial){
  const isNav = c.type==='navbar';
  if(c.type==='hero')el.querySelectorAll('img').forEach(img=>{img.loading='eager';img.fetchPriority=img.classList.contains('ds-landscape')?'high':'auto';});
  if(!paused&&!reduced&&(!isNav||!initial||document.body.classList.contains('page-home'))){
    el.querySelectorAll('[data-text-motion]').forEach(h=>{const root=createRoot(h);root.render(<TextEffect variant={c.value}>{h.textContent}</TextEffect>);c.roots.push(root);});
    const extended=entryMotion(c.value);
    const frames=extended?Object.fromEntries(Object.entries(extended.from).map(([key,value])=>[key,[value,extended.to[key]]])):[{}, {opacity:[0,1],y:[20,0]}, {opacity:[0,1],filter:['blur(7px)','blur(0px)']}, {opacity:[0,1],x:[-24,0]}, {opacity:[0,1],rotate:[1.5,0],y:[12,0]}, {opacity:[0,1],scale:[.96,1]}][c.value];
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const animation=animate(e.target,frames,{duration:extended?.duration||.65,delay:0,ease:[.22,1,.36,1]});c.cleanup.push(()=>animation.stop());observer.unobserve(e.target);}}),{threshold:.06});
    el.querySelectorAll('[data-card-unit],.ds-prose,.ds-facts,.ds-actions,.ex-visual').forEach(n=>observer.observe(n));c.cleanup.push(()=>observer.disconnect());
  }
  el.querySelector('[data-ds-menu]')?.addEventListener('click',e=>{const b=e.currentTarget;const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));b.setAttribute('aria-label',open?'Close navigation':'Open navigation');el.classList.toggle('ds-menu-open',open);});
  el.querySelector('[data-ds-theme]')?.addEventListener('click',()=>originalThemeToggle?.click());
  el.querySelector('[data-quick-toggle]')?.addEventListener('click',e=>{const b=e.currentTarget,p=el.querySelector('.ds-quick-panel');p.hidden=!p.hidden;b.setAttribute('aria-expanded',String(!p.hidden));b.setAttribute('aria-label',p.hidden?'Open quick contact':'Close quick contact');requestPosition();});
  el.querySelectorAll('[data-tabs]').forEach(t=>{
    const buttons=[...t.querySelectorAll('[role=tab]')], panels=[...t.querySelectorAll('[role=tabpanel]')];
    const activate=i=>{buttons.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1;panels[j].hidden=i!==j;});requestPosition();};
    buttons.forEach((b,i)=>{b.addEventListener('click',()=>activate(i));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%buttons.length;if(e.key==='ArrowLeft')n=(i+buttons.length-1)%buttons.length;if(e.key==='Home')n=0;if(e.key==='End')n=buttons.length-1;if(n!==undefined){e.preventDefault();activate(n);buttons[n].focus();}});});
  });
  el.querySelectorAll('[data-carousel]').forEach(car=>{let i=0;const slides=[...car.querySelectorAll('figure')];const move=dir=>{i=(i+dir+slides.length)%slides.length;slides.forEach((s,j)=>s.hidden=j!==i);car.querySelector('[aria-live]').textContent=`${i+1} / ${slides.length}`;requestPosition();};car.querySelector('[data-next]').addEventListener('click',()=>move(1));car.querySelector('[data-prev]').addEventListener('click',()=>move(-1));});
  el.querySelectorAll('[data-map-word]').forEach(b=>b.addEventListener('click',()=>{el.querySelectorAll('[data-map-word]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));el.querySelector('[data-map-caption]').textContent={Notice:'Notice the currents around you.',Connect:'Connect with the values that matter to you.',Choose:'Choose one useful step you can take today.'}[b.dataset.mapWord];el.querySelector('.ds-orbit').dataset.step=b.dataset.mapWord;}));
  el.querySelector('[data-media-brief]')?.addEventListener('click',openMedia);
  el.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',requestPosition));
}

const titles={navbar:'Navigation',hero:'Homepage hero',header:'Page header',statement:'Brand statement',services:'Services',features:'Features',uses:'Applications',cta:'Call to action',testimonials:'Testimonials',story:'Story & content',process:'Steps & timeline',faq:'Frequently asked questions',contact:'Contact',resources:'Books & resources',videos:'Video & waiata',gallery:'Illustration gallery',footer:'Footer',error:'404 page'};
const layoutNames={navbar:['Editorial masthead','Floating island','Two-tier grid','Journal masthead','Navigation dock'],hero:['Editorial landscape','Cinematic horizon','Cobalt atlas','Layered field journal','Interactive constellation'],services:['Editorial cards','Immersive panels','Service index','Field cards','Tabbed explorer'],features:['Editorial columns','Asymmetric bento','Numbered manifesto','Pinned notes','Connected pathway'],faq:['Split accordion','Card accordion','Question index','Open journal','Focused accordion'],contact:['Split enquiry','Image-led enquiry','Contact directory','A letter to Anna','Focused enquiry'],footer:['Editorial sign-off','Ocean horizon','Oversized wordmark','Journal colophon','Compass closing']};

// Native top-layer controls escape header transforms, overflow clipping and stacking contexts.
const overlay=document.createElement('div');overlay.className='ds-overlay';overlay.setAttribute('popover','manual');document.body.append(overlay);if(overlay.showPopover)overlay.showPopover();
const panel=document.createElement('dialog');panel.className='ds-picker';panel.setAttribute('aria-label','Component design options');document.body.append(panel);
const panelRoot=createRoot(panel);
let active=null,lastTrigger=null;
const atomEntries=[];
function addBadge(target,onClick,label,small=false){const b=document.createElement('button');b.className=`ds-badge${small?' ds-badge-small':''}`;b.innerHTML=icon(small?'SlidersHorizontal':'Layers',small?12:15);b.type='button';b.setAttribute('aria-label',label);b.title=label;b.setAttribute('aria-haspopup','dialog');b.addEventListener('click',()=>{lastTrigger=b;onClick();});overlay.append(b);return b;}
components.forEach(c=>{c.badge=addBadge(c.el,()=>openPicker(c),`Change ${titles[c.type]||'Quick contact'} design`);});
function registerAtoms(c){
  for(let i=atomEntries.length-1;i>=0;i--)if(atomEntries[i].parent===c){atomEntries[i].badge.remove();atomEntries.splice(i,1);}
  const candidates=[...c.el.querySelectorAll('[data-card-unit],.ds-button,.ds-preserved-form,.ds-preserved-form .field')];
  candidates.forEach((el,i)=>{const type=el.matches('.ds-button')?'button':el.matches('.field')?'field':el.matches('form')?'form':'card';const key=`${c.key}:v${c.value}:${type}:${i}`;const entry={key,el,parent:c,type,atom:true,value:Number(saved[key])||0};entry.badge=addBadge(el,()=>openPicker(entry),`Change ${type} design`,true);atomEntries.push(entry);applyAtom(entry,entry.value,false);});
}
function applyAtom(a,v,save=true){
  a.stopMotion?.();a.stopMotion=null;
  a.value=v;a.el.dataset.atomVariant=v;
  delete a.el.dataset.atomExtended;delete a.el.dataset.atomMode;
  ['--atom-bg','--atom-ink','--atom-line'].forEach(k=>a.el.style.removeProperty(k));
  if(v>5){const d=direction(v);a.el.dataset.atomExtended=d.slug;a.el.dataset.atomMode=d.mode;a.el.style.setProperty('--atom-bg',d.bg);a.el.style.setProperty('--atom-ink',d.ink);a.el.style.setProperty('--atom-line',d.line);}
  if(save){saved[a.key]=v;persist();if(!paused&&!reduced){
    const motion=entryMotion(v);
    const frames=motion?Object.fromEntries(Object.entries(motion.from).map(([k,value])=>[k,[value,motion.to[k]]])):[{opacity:[.5,1]},{opacity:[0,1],y:[7,0]},{scale:[.94,1]},{opacity:[0,1],x:[-15,0]},{rotate:[-3,0],opacity:[.5,1]},{clipPath:['inset(0 100% 0 0)','inset(0 0% 0 0)']}][v];
    const originalStyles=['opacity','transform','filter','clip-path'].map(key=>[key,a.el.style.getPropertyValue(key),a.el.style.getPropertyPriority(key)]);
    const aMotion=animate(a.el,frames,{duration:motion?.duration||.4});let stopped=false;
    a.stopMotion=()=>{if(stopped)return;stopped=true;aMotion.stop();originalStyles.forEach(([key,value,priority])=>{if(value)a.el.style.setProperty(key,value,priority);else a.el.style.removeProperty(key);});};
    a.parent.cleanup.push(a.stopMotion);
  }}
  requestPosition();
}
const atomNames={button:['Section default','Underline & arrow','Split action','Outlined capsule','Offset stamp','Icon reveal'],card:['Section default','Editorial rule','Raised panel','Offset outline','Notebook edge','Spotlight frame'],form:['Section default','Quiet sheet','Framed form','Two-tone panel','Letter paper','Focused surface'],field:['Section default','Bottom rule','Filled field','Side accent','Paper outline','Soft inset']};
function Library({entry,value,onChoose}){
  const [query,setQuery]=React.useState(''),[collection,setCollection]=React.useState('All'),[favourites,setFavourites]=React.useState(Array.isArray(saved.favourites)?saved.favourites:[]);
  const groups=['All','Favourites','Existing',...new Set(directions.map(d=>d.collection))];
  const visible=names.map((name,id)=>({id,name,group:direction(id)?.collection||'Existing'})).filter(d=>(collection==='All'||(collection==='Favourites'?favourites.includes(d.id):collection===d.group))&&`${d.name} ${d.group} ${descriptions[d.id]} ${motions[d.id]}`.toLowerCase().includes(query.trim().toLowerCase()));
  const favourite=id=>{const next=favourites.includes(id)?favourites.filter(n=>n!==id):[...favourites,id];setFavourites(next);saved.favourites=next;persist();};
  return <><div className="ds-library-tools"><input className="ds-library-search" type="search" aria-label="Search designs" placeholder="Search 50 designs + Original…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="ds-library-filters" role="group" aria-label="Design collections">{groups.map(g=><button key={g} aria-pressed={collection===g} onClick={()=>setCollection(g)}>{g}</button>)}</div><p className="ds-library-count" role="status">{visible.length} options · {value!==undefined?`Selected: ${names[value]}`:'Choose a direction for this page'}</p></div><div className="ds-choices">{visible.map(({id:i,name,group})=>{
    const d=direction(i),style=d?{'--ds-bg':d.bg,'--ds-ink':d.ink,'--ds-accent':d.accent,'--ds-line':d.line}:undefined;
    const label=entry?.atom?(atomNames[entry.type]?.[i]||name):name;
    return <div className="ds-library-tile" key={i}><button className={`ds-choice ds-choice-${i}`} title={`${label} — ${descriptions[i]} Motion: ${motions[i]}`} aria-pressed={value===i} onClick={()=>onChoose(i)}><AnimatedBackground active={value===i}>{d?<span className="ds-layout-preview" style={style} data-mode={d.mode} aria-hidden="true"><i/><i/><i/></span>:<span className={`ds-mini ds-mini-${i}`} aria-hidden="true"><i/><i/><i/><i/></span>}<strong>{label}</strong><small>{i===0?'Your existing design':`${group} · ${motions[i]}`}</small></AnimatedBackground></button><button className="ds-favourite" title={`${favourites.includes(i)?'Remove':'Save'} ${name} ${favourites.includes(i)?'from':'to'} favourites`} aria-label={`Favourite ${name}`} aria-pressed={favourites.includes(i)} onClick={()=>favourite(i)}>{favourites.includes(i)?'★':'☆'}</button></div>;
  })}</div>{visible.length===0&&<p className="ds-library-empty">No matches. Try another name or collection.</p>}</>;
}
function Picker({entry}){
  const [value,setValue]=React.useState(entry.value);
  const title=entry.atom?entry.type:titles[entry.type]||'Quick contact';
  return <><div className="ds-picker-head"><div><small>COMPONENT STUDIO · 51 OPTIONS</small><h2>{title}</h2></div><button aria-label="Close design options" onClick={()=>panel.close()} dangerouslySetInnerHTML={{__html:icon('X')}}/></div><p className="ds-picker-help">Only this component changes. Hover a design for its layout and motion notes; star your favourites.</p><Library entry={entry} value={value} onChoose={i=>{entry.atom?applyAtom(entry,i):render(entry,i);setValue(i);}}/><div className="ds-picker-bottom"><span>Saved in this browser</span><button onClick={()=>{entry.atom?applyAtom(entry,0):render(entry,0);setValue(0);}}>↶ Restore original</button></div></>;
}
function openPicker(entry){active=entry;panelRoot.render(<Picker key={`${entry.key}-${Date.now()}`} entry={entry}/>);if(!panel.open)panel.showModal();positionPanel();}
function positionPanel(){const r=lastTrigger?.getBoundingClientRect();if(!r)return;const width=Math.min(600,innerWidth-24);panel.style.width=`${width}px`;panel.style.left=`${Math.max(12,Math.min(innerWidth-width-12,r.right-width))}px`;panel.style.top='12px';}
panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close();}});
panel.addEventListener('close',()=>{lastTrigger?.focus({preventScroll:true});active=null;});

let positionQueued=false;
function requestPosition(){if(positionQueued)return;positionQueued=true;requestAnimationFrame(()=>{positionQueued=false;positionBadges();});}
function positionBadges(){
  const used=[];
  for(const entry of [...components,...atomEntries]){
    const el=entry.el,r=el.getBoundingClientRect(),b=entry.badge;
    const hidden=!el.isConnected||r.width===0||r.height===0||r.bottom<0||r.top>innerHeight||el.closest('[hidden]')||(!saved.details&&entry.atom);
    b.hidden=!!hidden;if(hidden)continue;
    let x=Math.min(innerWidth-38,r.right-(entry.atom?28:42));let y=Math.max(4,r.top+(entry.atom?5:10));
    if(entry.type==='navbar') {x=innerWidth-38;y=4;}
    if(entry.type==='utility'){x=r.right-24;y=r.top-27;}
    if(entry.atom&&entry.type==='button'){x=r.right-14;y=r.top-12;}
    for(const p of used)if(Math.abs(x-p.x)<27&&Math.abs(y-p.y)<27)y=p.y+30;
    used.push({x,y});b.style.transform=`translate(${Math.max(4,x)}px,${y}px)`;
    b.dataset.value=entry.value;
  }
}
window.addEventListener('scroll',requestPosition,{passive:true});window.addEventListener('resize',()=>{requestPosition();if(panel.open)positionPanel();});
const resize=new ResizeObserver(requestPosition);resize.observe(document.body);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.ds-menu-open').forEach(n=>{n.classList.remove('ds-menu-open');const b=n.querySelector('[data-ds-menu]');b?.setAttribute('aria-expanded','false');b?.setAttribute('aria-label','Open navigation');});document.querySelectorAll('.ds-quick-panel:not([hidden])').forEach(p=>p.parentElement.querySelector('[data-quick-toggle]')?.click());document.querySelectorAll('.ds-nav-service details[open]').forEach(d=>d.open=false);}});

const dock=document.createElement('div');dock.className='ds-studio-dock';dock.innerHTML=`<button data-studio-home title="Design studio" aria-label="Open design studio">${icon('SlidersHorizontal',16)}<span>Design studio</span><b>50 + original</b></button>`;overlay.append(dock);
dock.querySelector('button').addEventListener('click',openStudio);
function openStudio(){
  lastTrigger=dock.querySelector('button');
  panelRoot.render(<><div className="ds-picker-head"><div><small>HOEA TŌ WAKA</small><h2>Your design studio</h2></div><button aria-label="Close studio" onClick={()=>panel.close()}>×</button></div><p className="ds-picker-help">Mix directions using each section’s corner control, or try a complete direction below. Colours and fonts are shared across every direction.</p><button className="ds-foundations-link" onClick={()=>{panel.close();window.dispatchEvent(new CustomEvent('hoea:open-appearance'));}}>◐ Colours & typography — site-wide ↗</button><Library key="global-library" onChoose={i=>{components.forEach(c=>render(c,i,{quiet:true}));announce(`${names[i]} applied to this page`);panel.close();}}/><label className="ds-setting"><input type="checkbox" defaultChecked={saved.details!==false} onChange={e=>{saved.details=e.target.checked;persist();requestPosition();}}/> Show card, button & field controls</label><label className="ds-setting"><input type="checkbox" defaultChecked={!paused&&!reduced} disabled={reduced} onChange={e=>{paused=!e.target.checked;saved.motion=!paused;persist();document.documentElement.classList.toggle('ds-motion-paused',paused||reduced);components.filter(c=>c.value).forEach(c=>render(c,c.value,{quiet:true}));}}/> Motion {reduced?'(reduced by system preference)':''}</label><div className="ds-studio-actions"><button onClick={()=>{const blob=new Blob([JSON.stringify({layouts:saved,appearance:window.HoeaAppearance?.getState(),mode:document.documentElement.dataset.theme},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='hoea-design-choices.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}}>Export choices</button><button onClick={()=>{Object.keys(saved).forEach(k=>{if(k!=='motion'&&k!=='details'&&k!=='favourites')delete saved[k];});persist();components.forEach(c=>render(c,0,{quiet:true}));panel.close();announce('All original designs restored');}}>Reset originals</button></div><a className="ds-brief-link" href="${url('DESIGN-STUDIO.md')}" target="_blank">Design research & asset brief ↗</a></>);
  if(!panel.open)panel.showModal();panel.style.width=`${Math.min(600,innerWidth-24)}px`;panel.style.left='12px';panel.style.top='12px';
}
function openMedia(){
  lastTrigger=document.querySelector('[data-media-brief]');
  panelRoot.render(<><div className="ds-picker-head"><div><small>OPTIONAL FILM CONCEPT</small><h2>The current & the course</h2></div><button aria-label="Close film brief" onClick={()=>panel.close()}>×</button></div><p>A 10–15 second silent loop: morning light travels across coastal water, followed by a slow aerial pullback. Leave the left half calm for typography.</p><p>For a layered animation, commission a separate transparent WebM of flowing water ribbons. Keep the still image as a fallback and respect reduced motion.</p><p className="ds-picker-help">The current landscape is an AI-generated concept image. This control opens a brief, not a finished video.</p><a className="ds-brief-link" href="https://www.awwwards.com/websites/storytelling/" target="_blank" rel="noopener">Explore storytelling references ↗</a></>);if(!panel.open)panel.showModal();positionPanel();
}
if(saved.details===undefined)saved.details=true;
components.forEach(c=>render(c,forced??(Number.isInteger(saved[c.key])&&saved[c.key]>=0&&saved[c.key]<=MAX_VARIANT?saved[c.key]:1),{quiet:true,initial:true}));
requestPosition();
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduced=e.matches;document.documentElement.classList.toggle('ds-motion-paused',paused||reduced);components.filter(c=>c.value).forEach(c=>render(c,c.value,{quiet:true,initial:true}));});
window.HoeaDesignStudio={components,choose:(key,v)=>{const c=components.find(c=>c.key===key);if(c&&Number.isInteger(v)&&v>=0&&v<=MAX_VARIANT)render(c,v);},all:v=>{if(Number.isInteger(v)&&v>=0&&v<=MAX_VARIANT)components.forEach(c=>render(c,v,{quiet:true}));},directions:names.map((name,id)=>({id,name,collection:direction(id)?.collection||'Existing'})),version:2};
