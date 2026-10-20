import { animate } from 'motion';

// The words and SVG artwork are already in the HTML. Only animate their reveal.
export function setupStatementIcons(section) {
 const heading=section.querySelector('.statement-icon-copy');if(!heading)return()=>{};
 const icons=[...heading.querySelectorAll('.statement-icon')],preference=matchMedia('(prefers-reduced-motion: reduce)');
 const animations=[];let started=false;
 const finish=()=>{started=true;observer.disconnect();animations.forEach(animation=>animation.stop());icons.forEach(icon=>icon.style.setProperty('--icon-reveal','1'));section.dataset.statementRevealed='true';};
 const reveal=()=>{if(started)return;started=true;observer.disconnect();section.dataset.statementRevealed='true';icons.forEach((icon,i)=>animations.push(animate(0,1,{type:'spring',stiffness:180,damping:18,mass:.8,delay:i*.065,onUpdate:value=>icon.style.setProperty('--icon-reveal',value.toFixed(4)),onComplete:()=>icon.style.setProperty('--icon-reveal','1')})));};
 const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))reveal();},{rootMargin:'0px 0px -35% 0px'});
 section.classList.add('statement-icons-ready');if(preference.matches)finish();else observer.observe(heading);
 const onChange=()=>{if(preference.matches)finish();};preference.addEventListener('change',onChange);
 return()=>{observer.disconnect();animations.forEach(animation=>animation.stop());preference.removeEventListener('change',onChange);};
}
