import React from 'react';
import { createRoot } from 'react-dom/client';
import { animate } from 'motion';
import { TextEffect } from './motion-primitives';
import { renderers, extract, classify, url } from './renderers';
import { direction, MAX_VARIANT, colourStyle, entryMotion } from './directions';
import { validLayout, renderLayout } from './layout-catalog';
import { draftStorageKey, draftChoices } from './draft';
import { setupStatementIcons } from './statement-icons';
import { setupModelTimeline } from './model-timeline';

// Retain this browser's existing presentation, with the published draft as fallback.
// The public site has no layout, colour or typography editing interface.
let saved=draftChoices();
try { const stored=JSON.parse(localStorage.getItem(draftStorageKey)); if(stored && typeof stored==='object' && !Array.isArray(stored)) saved=stored; } catch {}
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const paused=saved.motion===false;
document.documentElement.classList.toggle('ds-motion-paused',paused||reduced);
const componentSelector='body > .site-header,main > section,body > .site-footer,.error-card,body > .site-utility-menu';
const atomSelector='[data-card-unit],.ds-button,.ds-preserved-form,.ds-preserved-form .field';
const atomType=el=>el.matches('.ds-button')?'button':el.matches('.field')?'field':el.matches('form')?'form':'card';
const atomEntries=[];
function clearColour(el){delete el.dataset.componentPalette;delete el.dataset.colourContext;delete el.dataset.colourInverse;}
function applyColour(entry){
  const id=saved['colour:'+entry.key];
  if(!id){clearColour(entry.el);return;}
  const section=entry.parent||entry;
  entry.el.dataset.componentPalette=id;
  entry.el.dataset.colourContext=section.type;
  entry.el.dataset.colourInverse=String([2,5].includes(section.value)||section.el.dataset.collection==='Nocturnal');
}
const originalThemeToggle=document.querySelector('[data-theme-toggle]');
const components = [];
// Keep header copy clear of whichever navbar is currently selected.
const navSize = new ResizeObserver(entries=>{
  const nav=entries[0]?.target;
  if(nav)document.body.style.setProperty('--ds-nav-clearance',`${nav.getBoundingClientRect().height+32}px`);
});
const route = document.querySelector('.error-card')?'404.html':location.pathname.replace(new URL(url('')).pathname,'').replace(/index.html$/,'') || 'home';
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
  components.push(comp);
});

function cleanup(c){c.roots.forEach(r=>r.unmount());c.roots=[];c.cleanup.forEach(f=>f());c.cleanup=[];}
function render(c,value,{initial=false}={}){
  if(!validLayout(c.type,value))return;
  // Clear transient atom presentation before relocating the preserved form.
  atomEntries.filter(a=>a.parent===c).forEach(a=>{applyAtom(a,0);clearColour(a.el);});
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
    if(c.key==='home:2:statement')node.dataset.homeStatement='';
    node.innerHTML=renderLayout(c.data,value);
    if(c.form){node.querySelector('[data-form-slot]')?.append(c.form);c.form.classList.add('ds-preserved-form');}
    if(c.shield)node.querySelector('[data-shielded-slot]')?.append(c.shield);
    c.el=node;c.marker.after(node);
  }
  if(value===0){c.form?.classList.remove('ds-preserved-form');if(originalThemeToggle){const dark=document.documentElement.dataset.theme==='dark';originalThemeToggle.setAttribute('aria-pressed',String(dark));originalThemeToggle.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');}}
  if(c.key==='home:2:statement')c.cleanup.push(setupStatementIcons(c.el,paused));
  if(c.key==='home:4:features')c.cleanup.push(setupModelTimeline(c.el,paused));
  if(value!==0)wire(c.el,c,initial);
  document.body.classList.toggle('ds-new-nav',components.find(x=>x.type==='navbar')?.value>0);
  document.body.classList.toggle('ds-original-nav',components.find(x=>x.type==='navbar')?.value===0);
  if(c.type==='navbar'){navSize.disconnect();navSize.observe(c.el);}
  registerAtoms(c);
  applyColour(c);

}
function wire(el,c,initial){
  const isNav = c.type==='navbar';
  if(c.type==='hero')el.querySelectorAll('img').forEach(img=>{img.loading='eager';img.fetchPriority=img.classList.contains('ds-landscape')?'high':'auto';});
  if(!paused&&!reduced&&(!isNav||!initial||document.body.classList.contains('page-home'))){
    el.querySelectorAll('[data-text-motion]').forEach(h=>{const root=createRoot(h);root.render(<TextEffect variant={c.value}>{h.textContent}</TextEffect>);c.roots.push(root);});
    const extended=entryMotion(c.value);
    const frames=extended?Object.fromEntries(Object.entries(extended.from).map(([key,value])=>[key,[value,extended.to[key]]])):[{}, {opacity:[0,1],y:[20,0]}, {opacity:[0,1],filter:['blur(7px)','blur(0px)']}, {opacity:[0,1],x:[-24,0]}, {opacity:[0,1],rotate:[1.5,0],y:[12,0]}, {opacity:[0,1],scale:[.96,1]}][c.value]||{opacity:[0,1],y:[14,0]};
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const animation=animate(e.target,frames,{duration:extended?.duration||.65,delay:0,ease:[.22,1,.36,1]});c.cleanup.push(()=>animation.stop());observer.unobserve(e.target);}}),{threshold:.06});
    el.querySelectorAll('[data-card-unit],.ds-prose,.ds-facts,.ds-actions,.ex-visual').forEach(n=>{if(!n.closest('.model-timeline'))observer.observe(n);});c.cleanup.push(()=>observer.disconnect());
  }
  el.querySelector('[data-ds-menu]')?.addEventListener('click',e=>{const b=e.currentTarget;const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));b.setAttribute('aria-label',open?'Close navigation':'Open navigation');el.classList.toggle('ds-menu-open',open);});
  el.querySelector('[data-ds-theme]')?.addEventListener('click',()=>originalThemeToggle?.click());
  el.querySelector('[data-quick-toggle]')?.addEventListener('click',e=>{const b=e.currentTarget,p=el.querySelector('.ds-quick-panel');p.hidden=!p.hidden;b.setAttribute('aria-expanded',String(!p.hidden));b.setAttribute('aria-label',p.hidden?'Open quick contact':'Close quick contact');});
  el.querySelectorAll('[data-tabs]').forEach(t=>{
    const buttons=[...t.querySelectorAll('[role=tab]')], panels=[...t.querySelectorAll('[role=tabpanel]')];
    const activate=i=>{buttons.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1;panels[j].hidden=i!==j;});};
    buttons.forEach((b,i)=>{b.addEventListener('click',()=>activate(i));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%buttons.length;if(e.key==='ArrowLeft')n=(i+buttons.length-1)%buttons.length;if(e.key==='Home')n=0;if(e.key==='End')n=buttons.length-1;if(n!==undefined){e.preventDefault();activate(n);buttons[n].focus();}});});
  });
  el.querySelectorAll('[data-carousel]').forEach(car=>{let i=0;const slides=[...car.querySelectorAll('figure')];const move=dir=>{i=(i+dir+slides.length)%slides.length;slides.forEach((s,j)=>s.hidden=j!==i);car.querySelector('[aria-live]').textContent=`${i+1} / ${slides.length}`;};car.querySelector('[data-next]').addEventListener('click',()=>move(1));car.querySelector('[data-prev]').addEventListener('click',()=>move(-1));});
  el.querySelectorAll('[data-map-word]').forEach(b=>b.addEventListener('click',()=>{el.querySelectorAll('[data-map-word]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));el.querySelector('[data-map-caption]').textContent={Notice:'Notice the currents around you.',Connect:'Connect with the values that matter to you.',Choose:'Choose one useful step you can take today.'}[b.dataset.mapWord];el.querySelector('.ds-orbit').dataset.step=b.dataset.mapWord;}));
}


function registerAtoms(c){
  for(let i=atomEntries.length-1;i>=0;i--)if(atomEntries[i].parent===c)atomEntries.splice(i,1);
  [...c.el.querySelectorAll(atomSelector)].forEach((el,i)=>{
    const type=atomType(el),key=`${c.key}:v${c.value}:${type}:${i}`;
    const entry={key,el,parent:c,type};
    atomEntries.push(entry);
    applyAtom(entry,Number.isInteger(saved[key])&&saved[key]>=0&&saved[key]<=MAX_VARIANT?saved[key]:0);
  });
}
function applyAtom(a,v){
  a.value=v;a.el.dataset.atomVariant=v;
  delete a.el.dataset.atomExtended;delete a.el.dataset.atomMode;
  ['--atom-bg','--atom-ink','--atom-line'].forEach(k=>a.el.style.removeProperty(k));
  if(v>5){const d=direction(v);a.el.dataset.atomExtended=d.slug;a.el.dataset.atomMode=d.mode;a.el.style.setProperty('--atom-bg',d.bg);a.el.style.setProperty('--atom-ink',d.ink);a.el.style.setProperty('--atom-line',d.line);}
  applyColour(a);
}
components.forEach(c=>render(c,validLayout(c.type,saved[c.key])?saved[c.key]:1,{initial:true}));
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{
  reduced=e.matches;document.documentElement.classList.toggle('ds-motion-paused',paused||reduced);
  components.filter(c=>c.value).forEach(c=>render(c,c.value,{initial:true}));
});
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  document.querySelectorAll('.ds-menu-open [data-ds-menu],.ds-quick-panel:not([hidden])').forEach(el=>{
    if(el.matches('[data-ds-menu]'))el.click();else el.closest('.ds-component')?.querySelector('[data-quick-toggle]')?.click();
  });
});
