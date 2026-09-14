import React from 'react';
import { createRoot } from 'react-dom/client';
import { animate } from 'motion';
import { TextEffect } from './motion-primitives';
import { renderers, extract, classify, icon, esc, url } from './renderers';
import { directions, direction, MAX_VARIANT, colourStyle, entryMotion } from './directions';
import { componentSelector, atomSelector, atomType, createHandoff, downloadHandoff } from './handoff';
import { ComponentColours, colourKey, validPalette, applyColour, clearColour } from './component-colours';
import { validLayout, layoutInfo, recommendedLayouts, stepLayout, renderLayout, categories, purposeLayouts } from './layout-catalog';
import { CategoryLibrary, CategoryDirectory } from './catalog-picker';
import { draft, draftStorageKey, draftChoices } from './draft';

const names = ['Original','Editorial','Open water','Blueprint','Field notes','Constellation',...directions.map(d=>d.name)];
document.title=document.title.replace(/ — Draft 1$/,'')+' — Draft 1';
const storageKey=draftStorageKey;
let saved=draftChoices();try{const stored=localStorage.getItem(storageKey);if(stored)saved=JSON.parse(stored);else localStorage.setItem(storageKey,JSON.stringify(saved));}catch{}
if(!saved||typeof saved!=='object'||Array.isArray(saved))saved=draftChoices();
let persistedSnapshot=JSON.parse(JSON.stringify(saved));
let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = saved.motion === false;
document.documentElement.classList.toggle('ds-motion-paused', paused || reduced);
const persist = () => {try{
  let merged=JSON.parse(localStorage.getItem(storageKey)||'{}');if(!merged||typeof merged!=='object'||Array.isArray(merged))merged={};
  for(const key of new Set([...Object.keys(persistedSnapshot),...Object.keys(saved)])){
    if(JSON.stringify(saved[key])!==JSON.stringify(persistedSnapshot[key])){if(key in saved)merged[key]=saved[key];else delete merged[key];}
  }
  localStorage.setItem(storageKey,JSON.stringify(merged));saved=merged;persistedSnapshot=JSON.parse(JSON.stringify(saved));
}catch{}};
const params = new URLSearchParams(location.search);
const forced = params.has('design') ? Math.max(0,Math.trunc(Number(params.get('design'))||0)) : null;
const originals = new Map();
const originalThemeToggle=document.querySelector('[data-theme-toggle]');
const components = [];
// Keep header copy clear of whichever navbar is currently selected.
const navSize = new ResizeObserver(entries=>{
  const nav=entries[0]?.target;
  if(nav)document.body.style.setProperty('--ds-nav-clearance',`${nav.getBoundingClientRect().height+32}px`);
});
const route = document.querySelector('.error-card')?'404.html':location.pathname.replace(new URL(url('')).pathname,'').replace(/index.html$/,'') || 'home';
const toast=document.createElement('div');toast.className='ds-toast';toast.setAttribute('role','status');document.body.append(toast);
let toastTimer;
function announce(s){toast.textContent=s;toast.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),2500);}

// The preserved DOM nodes keep their event listeners, form values, and native state.
const nodes=[...document.querySelectorAll(componentSelector)];
nodes.forEach((el,index)=>{
  const type=classify(el); if(!renderers[type])return;
  const key=(type==='navbar'||type==='footer')?type:`${route}:${el.dataset.designIndex??index}:${type}`;
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
  if(!validLayout(c.type,value))return;
  const previous=c.el.getBoundingClientRect();
  // Clear transient atom presentation before relocating the preserved form.
  atomEntries.filter(a=>a.parent===c).forEach(a=>{applyAtom(a,0,false);clearColour(a.el);});
  cleanup(c);
  if(c.form)c.formMarker.after(c.form);
  if(c.shield)c.shieldMarker.after(c.shield);
  if(c.original.matches('.site-header.is-open')) c.original.querySelector('[data-menu-toggle]')?.click();
  c.el.remove();c.value=value;
  if(value===0){c.el=c.original;c.marker.after(c.el);}else{
    const node=document.createElement(c.type==='navbar'?'header':c.type==='footer'?'footer':['error','utility'].includes(c.type)?'div':'section');
    node.className=`ds-component ds-v${value} ds-type-${c.type}${value>50?' ds-purpose':value>5?' ds-expanded':''}`;
    if(value>50)node.dataset.purposeLayout=value;
    else if(value>5){const d=direction(value);node.dataset.collection=d.collection;node.dataset.layout=d.slug;node.style.cssText=colourStyle(d);}
    node.dataset.design=value;node.dataset.component=c.key;
    if(c.id)node.id=c.id;
    node.innerHTML=renderLayout(c.data,value);
    if(c.form){node.querySelector('[data-form-slot]')?.append(c.form);c.form.classList.add('ds-preserved-form');}
    if(c.shield)node.querySelector('[data-shielded-slot]')?.append(c.shield);
    c.el=node;c.marker.after(node);
    wire(node,c,initial);
  }
  if(value===0){c.form?.classList.remove('ds-preserved-form');if(originalThemeToggle){const dark=document.documentElement.dataset.theme==='dark';originalThemeToggle.setAttribute('aria-pressed',String(dark));originalThemeToggle.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');}}
  document.body.classList.toggle('ds-new-nav',components.find(x=>x.type==='navbar')?.value>0);
  document.body.classList.toggle('ds-original-nav',components.find(x=>x.type==='navbar')?.value===0);
  if(c.type==='navbar'){navSize.disconnect();navSize.observe(c.el);}
  if(!initial){saved[c.key]=value;persist(); if(previous.bottom<0) window.scrollBy(0,c.el.getBoundingClientRect().height-previous.height);}
  registerAtoms(c);
  applyColour(c,saved);
  if(c.type==='footer')mountHandoff(c.el);
  requestPosition();
  if(!quiet)announce(`${titles[c.type]||c.type}: ${layoutInfo(c.type,value).name}`);
}
function wire(el,c,initial){
  const isNav = c.type==='navbar';
  if(c.type==='hero')el.querySelectorAll('img').forEach(img=>{img.loading='eager';img.fetchPriority=img.classList.contains('ds-landscape')?'high':'auto';});
  if(!paused&&!reduced&&(!isNav||!initial||document.body.classList.contains('page-home'))){
    el.querySelectorAll('[data-text-motion]').forEach(h=>{const root=createRoot(h);root.render(<TextEffect variant={c.value}>{h.textContent}</TextEffect>);c.roots.push(root);});
    const extended=entryMotion(c.value);
    const frames=extended?Object.fromEntries(Object.entries(extended.from).map(([key,value])=>[key,[value,extended.to[key]]])):[{}, {opacity:[0,1],y:[20,0]}, {opacity:[0,1],filter:['blur(7px)','blur(0px)']}, {opacity:[0,1],x:[-24,0]}, {opacity:[0,1],rotate:[1.5,0],y:[12,0]}, {opacity:[0,1],scale:[.96,1]}][c.value]||{opacity:[0,1],y:[14,0]};
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

// Native top-layer controls escape header transforms, overflow clipping and stacking contexts.
const overlay=document.createElement('div');overlay.className='ds-overlay';overlay.setAttribute('popover','manual');document.body.append(overlay);if(overlay.showPopover)overlay.showPopover();
const panel=document.createElement('dialog');panel.className='ds-picker';panel.setAttribute('aria-label','Component design options');document.body.append(panel);
const panelRoot=createRoot(panel);
let active=null,lastTrigger=null;
// A browsing session owns one viewport anchor. Layout-driven scroll anchoring,
// animation and new content must not move the controls out from under the user.
let pinnedControl=null;
function pinControls(entry){
  if(entry.atom||entry.controls.hidden)return;
  if(pinnedControl?.entry===entry)return;
  const r=entry.controls.getBoundingClientRect();
  pinnedControl={entry,x:r.x,y:r.y};
}
function releaseControls(){if(pinnedControl){pinnedControl=null;requestPosition();}}
const atomEntries=[];
function addBadge(entry,label,small=false){
  const group=document.createElement('div');group.className=`ds-switcher${small?' ds-switcher-small':''}`;group.setAttribute('role','group');group.setAttribute('aria-label',`${entry.atom?entry.type:titles[entry.type]||'Quick contact'} design controls`);group.dataset.componentKey=entry.key;
  group.addEventListener('pointerdown',()=>pinControls(entry));
  const b=document.createElement('button');b.className=`ds-badge${small?' ds-badge-small':''}`;b.innerHTML=icon(small?'SlidersHorizontal':'Layers',small?12:15);b.type='button';b.setAttribute('aria-label',label);b.setAttribute('aria-haspopup','dialog');b.addEventListener('click',()=>{lastTrigger=b;openPicker(entry);});
  const stepButton=delta=>{const button=document.createElement('button');button.type='button';button.className='ds-step';button.dataset.step=delta;button.innerHTML=icon(delta<0?'ChevronLeft':'ChevronRight',16);button.setAttribute('aria-label',`${delta<0?'Previous':'Next'} ${entry.atom?entry.type:titles[entry.type]||'Quick contact'} design`);button.addEventListener('click',()=>{pinControls(entry);const next=stepLayout(entry,delta);if(entry.atom){applyAtom(entry,next);announce(`${entry.type}: ${layoutInfo(entry.type,next,true).name}`);}else render(entry,next);button.focus({preventScroll:true});});return button;};
  group.append(stepButton(-1),b,stepButton(1));overlay.append(group);entry.controls=group;return b;
}
components.forEach(c=>{c.badge=addBadge(c,`Change ${titles[c.type]||'Quick contact'} design`);});
function registerAtoms(c){
  for(let i=atomEntries.length-1;i>=0;i--)if(atomEntries[i].parent===c){atomEntries[i].controls.remove();atomEntries.splice(i,1);}
  const candidates=[...c.el.querySelectorAll(atomSelector)];
  candidates.forEach((el,i)=>{const type=atomType(el);const key=`${c.key}:v${c.value}:${type}:${i}`;const entry={key,el,parent:c,type,atom:true,value:Number.isInteger(saved[key])&&saved[key]>=0&&saved[key]<=MAX_VARIANT?saved[key]:0};entry.badge=addBadge(entry,`Change ${type} design`,true);atomEntries.push(entry);applyAtom(entry,entry.value,false);});
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
  applyColour(a,saved);
  requestPosition();
}
const atomNames={button:['Section default','Underline & arrow','Split action','Outlined capsule','Offset stamp','Icon reveal'],card:['Section default','Editorial rule','Raised panel','Offset outline','Notebook edge','Spotlight frame'],form:['Section default','Quiet sheet','Framed form','Two-tone panel','Letter paper','Focused surface'],field:['Section default','Bottom rule','Filled field','Side accent','Paper outline','Soft inset']};
function Library({entry,value,onChoose}){
  const [favourites,setFavourites]=React.useState(Array.isArray(saved.favourites)?saved.favourites:[]);
  const favourite=id=>{const next=favourites.includes(id)?favourites.filter(n=>n!==id):[...favourites,id];setFavourites(next);saved.favourites=next;persist();};
  return <CategoryLibrary entry={entry} value={value} onChoose={onChoose} favourites={favourites} onFavourite={favourite}/>;
}
function Picker({entry}){
  const [value,setValue]=React.useState(entry.value);
  const [colour,setColour]=React.useState(validPalette(saved[colourKey(entry.key)])?saved[colourKey(entry.key)]:'');
  const title=entry.atom?entry.type:titles[entry.type]||'Quick contact';
  return <><div className="ds-picker-head"><div><small>COMPONENT STUDIO · CHOOSE BY PURPOSE</small><h2>{title}</h2></div><button aria-label="Close design options" onClick={()=>panel.close()} dangerouslySetInnerHTML={{__html:icon('X')}}/></div><ComponentColours entry={entry} value={colour} onChange={id=>{const key=colourKey(entry.key);if(id)saved[key]=id;else delete saved[key];persist();applyColour(entry,saved);setColour(id);announce(id?'Component colour scheme updated':'Inherited colours restored');}}/><p className="ds-picker-help">Browse layouts made for this component’s purpose. Colours are independent; star any layouts you want to revisit.</p><Library entry={entry} value={value} onChoose={i=>{entry.atom?applyAtom(entry,i):render(entry,i);setValue(i);}}/><div className="ds-picker-bottom"><span>Saved in this browser</span><button onClick={()=>{entry.atom?applyAtom(entry,0):render(entry,0);setValue(0);}}>↶ Restore original</button></div></>;
}
function openPicker(entry){pinControls(entry);active=entry;panelRoot.render(<Picker key={`${entry.key}-${Date.now()}`} entry={entry}/>);if(!panel.open)panel.showModal();positionPanel();}
function positionPanel(){const r=lastTrigger?.getBoundingClientRect();if(!r)return;const width=Math.min(600,innerWidth-24);panel.style.width=`${width}px`;panel.style.left=`${Math.max(12,Math.min(innerWidth-width-12,r.right-width))}px`;panel.style.top='12px';}
panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close();}});
panel.addEventListener('close',()=>{lastTrigger?.focus({preventScroll:true});active=null;});

let positionQueued=false;
function requestPosition(){if(positionQueued)return;positionQueued=true;requestAnimationFrame(()=>{positionQueued=false;positionBadges();});}
function positionBadges(){
  const used=[];
  const overlaps=(a,b)=>a.x<b.x+b.width+3&&a.x+a.width+3>b.x&&a.y<b.y+b.height+3&&a.y+a.height+3>b.y;
  // Tooling must never intercept navigation, enquiry controls or the export action.
  const reserved=[...document.querySelectorAll('body a,body button,body input,body select,body textarea,body summary')].filter(el=>!el.closest('.ds-overlay,.ds-picker,.ap-dialog')&&getComputedStyle(el).visibility==='visible').map(el=>el.getBoundingClientRect()).filter(r=>r.width&&r.height&&r.bottom>0&&r.top<innerHeight);
  const dockRect=dock.getBoundingClientRect();if(dockRect.width)reserved.push(dockRect);
  for(const entry of [...(pinnedControl?[pinnedControl.entry]:[]),...components.filter(c=>c!==pinnedControl?.entry),...atomEntries]){
    const el=entry.el,r=el.getBoundingClientRect(),b=entry.controls;
    const pinned=pinnedControl?.entry===entry;
    const hidden=!el.isConnected||(!pinned&&(r.width===0||r.height===0||r.bottom<0||r.top>innerHeight||el.closest('[hidden]')||(!saved.details&&entry.atom)));
    b.hidden=!!hidden;if(hidden)continue;
    const width=b.offsetWidth,height=b.offsetHeight;
    let x=Math.max(4,Math.min(innerWidth-width-6,r.right-width-10));let y=Math.max(4,r.top+(entry.atom?5:10));
    if(entry.type==='navbar') {x=innerWidth-width-6;y=Math.max(4,r.bottom+10);}
    if(entry.type==='header'&&r.top<1){const nav=components.find(c=>c.type==='navbar');if(nav)y=Math.max(y,nav.el.getBoundingClientRect().bottom+10);}
    if(entry.type==='utility'){y=Math.max(4,r.top-height-6);}
    if(entry.atom&&entry.type==='button'){y=Math.max(4,r.top-height-3);}
    const xs=[x,r.right+6,r.left-width-6,Math.max(4,r.left+6)];
    if(entry.type==='navbar')xs.push(Math.max(4,innerWidth-width-140));
    const ys=[y];for(let offset=1;offset<=4;offset++){ys.push(y-offset*(height+6),y+offset*(height+6));}
    const candidates=ys.flatMap(y=>xs.map(x=>({x,y,width,height})));
    const place=pinned?{x:Math.max(4,Math.min(innerWidth-width-4,pinnedControl.x)),y:Math.max(4,Math.min(innerHeight-height-4,pinnedControl.y)),width,height}:candidates.find(p=>p.x>=4&&p.x+p.width<=innerWidth-4&&p.y>=4&&p.y+p.height<=innerHeight-4&&!reserved.some(q=>overlaps(p,q))&&!used.some(q=>overlaps(p,q)));
    if(!place){b.hidden=true;continue;}
    used.push(place);b.style.transform=`translate(${place.x}px,${place.y}px)`;
    entry.badge.dataset.value=entry.value;
    const designName=layoutInfo(entry.type,entry.value,entry.atom).name;
    entry.badge.title=`${designName} — open ${entry.type} layouts`;
    b.querySelectorAll('[data-step]').forEach(button=>{const next=stepLayout(entry,Number(button.dataset.step));button.title=`${Number(button.dataset.step)<0?'Previous':'Next'}: ${layoutInfo(entry.type,next,entry.atom).name}`;});
  }
}
// Release only for intentional navigation, never for scroll events caused by
// replacing a tall footer with a short one. Keep the anchor while using its menu.
document.addEventListener('pointerdown',e=>{if(pinnedControl&&!pinnedControl.entry.controls.contains(e.target)&&!panel.contains(e.target))releaseControls();},true);
window.addEventListener('wheel',()=>{if(!panel.open)releaseControls();},{passive:true});
window.addEventListener('touchmove',()=>{if(!panel.open)releaseControls();},{passive:true});
document.addEventListener('keydown',e=>{if(!panel.open&&['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(e.key)&&!e.target.closest('input,textarea,select,button'))releaseControls();});
window.addEventListener('scroll',requestPosition,{passive:true});window.addEventListener('resize',()=>{requestPosition();if(panel.open)positionPanel();});
const resize=new ResizeObserver(requestPosition);resize.observe(document.body);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.ds-menu-open').forEach(n=>{n.classList.remove('ds-menu-open');const b=n.querySelector('[data-ds-menu]');b?.setAttribute('aria-expanded','false');b?.setAttribute('aria-label','Open navigation');});document.querySelectorAll('.ds-quick-panel:not([hidden])').forEach(p=>p.parentElement.querySelector('[data-quick-toggle]')?.click());document.querySelectorAll('.ds-nav-service details[open]').forEach(d=>d.open=false);}});

const dock=document.createElement('div');dock.className='ds-studio-dock';dock.innerHTML=`<button data-studio-home title="Design studio" aria-label="Open design studio">${icon('SlidersHorizontal',16)}<span>Design studio</span><b>Draft 1</b></button>`;overlay.append(dock);
dock.querySelector('button').addEventListener('click',openStudio);
function openStudio(){
  lastTrigger=dock.querySelector('button');
  panelRoot.render(<><div className="ds-picker-head"><div><small>HOEA TŌ WAKA</small><h2>Draft 1 · design studio</h2></div><button aria-label="Close studio" onClick={()=>panel.close()}>×</button></div><p className="ds-picker-help">Browse components by purpose. Fonts are shared; colours inherit the site theme unless you set a component palette.</p><button className="ds-foundations-link" onClick={()=>{panel.close();window.dispatchEvent(new CustomEvent('hoea:open-appearance'));}}>◐ Colours & typography — site-wide ↗</button><CategoryDirectory components={components} onOpen={openPicker}/><label className="ds-setting"><input type="checkbox" defaultChecked={saved.details!==false} onChange={e=>{saved.details=e.target.checked;persist();requestPosition();}}/> Show card, button & field controls</label><label className="ds-setting"><input type="checkbox" defaultChecked={!paused&&!reduced} disabled={reduced} onChange={e=>{paused=!e.target.checked;saved.motion=!paused;persist();document.documentElement.classList.toggle('ds-motion-paused',paused||reduced);components.filter(c=>c.value).forEach(c=>render(c,c.value,{quiet:true}));}}/> Motion {reduced?'(reduced by system preference)':''}</label><div className="ds-studio-actions"><button onClick={restoreDraft}>Restore Draft 1</button><button onClick={exportSelection}>Export choices</button><button onClick={()=>{Object.keys(saved).forEach(k=>{if(k!=='motion'&&k!=='details'&&k!=='favourites')delete saved[k];});persist();components.forEach(c=>render(c,0,{quiet:true}));panel.close();announce('All original designs restored');}}>Reset originals</button></div><a className="ds-brief-link" href={url('DESIGN-STUDIO.md')} target="_blank">Design research & asset brief ↗</a></>);
  if(!panel.open)panel.showModal();panel.style.width=`${Math.min(600,innerWidth-24)}px`;panel.style.left='12px';panel.style.top='12px';
}
function restoreDraft(){
  releaseControls();saved=draftChoices();try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{}persistedSnapshot=JSON.parse(JSON.stringify(saved));paused=saved.motion===false;
  document.documentElement.classList.toggle('ds-motion-paused',paused||reduced);
  window.HoeaAppearance.setPalette(draft.colour.id);window.HoeaAppearance.setMode(draft.colour.mode);
  components.forEach(c=>render(c,saved[c.key]??1,{quiet:true,initial:true}));
  if(panel.open)panel.close();announce('Draft 1 layouts and colours restored. Your typography is unchanged.');
}
let exporting=false;
function mountHandoff(footer){
  if(footer.querySelector('[data-design-handoff]'))return;
  const handoff=document.createElement('div');handoff.className='ds-handoff';handoff.dataset.designHandoff='';
  handoff.innerHTML=`<div><strong>Draft 1 · keep exploring</strong><p>Your selected designs are saved as Draft 1. Keep editing, or export your latest choices. Share it with your designer for the client-ready version.</p><a class="ds-prompts-link" href="${url('prompts/')}">Prompts ${icon('ArrowUpRight',16)}</a></div><button type="button" class="ds-handoff-button">${icon('Download',18)}<span>Export my design choices</span></button><button type="button" class="ds-draft-restore">Restore Draft 1</button>`;
  const button=handoff.querySelector('button');button.disabled=exporting;button.addEventListener('click',exportSelection);handoff.querySelector('.ds-draft-restore').addEventListener('click',restoreDraft);footer.append(handoff);
}
async function exportSelection(){
  if(exporting)return;exporting=true;
  const busy=value=>document.querySelectorAll('.ds-handoff-button').forEach(b=>{b.disabled=value;b.setAttribute('aria-busy',String(value));b.querySelector('span').textContent=value?'Preparing your file…':'Export my design choices';});
  busy(true);announce('Gathering your choices from all pages…');
  try{
    let latest=saved;try{const stored=JSON.parse(localStorage.getItem(storageKey)||'{}');if(stored&&typeof stored==='object'&&!Array.isArray(stored))latest={...saved,...stored};}catch{}
    const data=await createHandoff({saved:{...latest},components:[...components],atoms:[...atomEntries],route,names,atomNames,appearance:window.HoeaAppearance.getState(),mode:document.documentElement.dataset.theme==='dark'?'dark':'light'});
    downloadHandoff(data);announce(`Exported ${data.summary.components} components and ${data.summary.nestedOverrides} detailed choices. Share the JSON file when you’re ready.`);
    return data;
  }catch(error){announce(error.message||'Export could not finish. Please try again.');return null;}
  finally{exporting=false;busy(false);}
}
function openMedia(){
  lastTrigger=document.querySelector('[data-media-brief]');
  panelRoot.render(<><div className="ds-picker-head"><div><small>OPTIONAL FILM CONCEPT</small><h2>The current & the course</h2></div><button aria-label="Close film brief" onClick={()=>panel.close()}>×</button></div><p>A 10–15 second silent loop: morning light travels across coastal water, followed by a slow aerial pullback. Leave the left half calm for typography.</p><p>For a layered animation, commission a separate transparent WebM of flowing water ribbons. Keep the still image as a fallback and respect reduced motion.</p><p className="ds-picker-help">The image area is a simple placeholder. Explore the Prompts page for complete still-image ideas.</p><a className="ds-brief-link" href="https://www.awwwards.com/websites/storytelling/" target="_blank" rel="noopener">Explore storytelling references ↗</a></>);if(!panel.open)panel.showModal();positionPanel();
}
if(saved.details===undefined)saved.details=true;
components.forEach(c=>render(c,validLayout(c.type,forced)?forced:(validLayout(c.type,saved[c.key])?saved[c.key]:1),{quiet:true,initial:true}));
requestPosition();
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduced=e.matches;document.documentElement.classList.toggle('ds-motion-paused',paused||reduced);components.filter(c=>c.value).forEach(c=>render(c,c.value,{quiet:true,initial:true}));});
window.HoeaDesignStudio={draft,storageKey,restoreDraft,components,export:exportSelection,choose:(key,v)=>{const c=components.find(c=>c.key===key);if(c&&validLayout(c.type,v))render(c,v);},all:v=>{if(Number.isInteger(v)&&v>=0&&v<=MAX_VARIANT)components.forEach(c=>render(c,v,{quiet:true}));},directions:names.map((name,id)=>({id,name,collection:direction(id)?.collection||'Existing'})),categories,purposeLayouts,options:key=>{const entry=components.find(c=>c.key===key)||atomEntries.find(a=>a.key===key);return entry?recommendedLayouts(entry):[];},version:3};
