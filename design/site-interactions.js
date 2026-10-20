import { setupHomeFaq } from './home-faq';
import { setupStatementIcons } from './statement-icons';
import { setupModelTimeline } from './model-timeline';
import { setupTopicMarquee } from './topic-marquee';
import { setupCtaOrbit } from './cta-orbit';

// Enhance the published HTML; never replace page sections or select a design.
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const syncMotion = () => document.documentElement.classList.toggle('ds-motion-paused', preference.matches);
syncMotion();preference.addEventListener('change', syncMotion);
document.querySelectorAll('[data-home-statement]').forEach(section => setupStatementIcons(section));
document.querySelectorAll('.model-timeline').forEach(path => setupModelTimeline(path.closest('section')));
setupTopicMarquee(document.querySelector('[data-topic-marquee]'));
document.querySelectorAll('[data-cta-orbit]').forEach(orbit => setupCtaOrbit(orbit.closest('section')));
document.querySelectorAll('[data-carousel]').forEach(carousel => {
 let index=0;const slides=[...carousel.querySelectorAll('figure')];
 const move=direction=>{index=(index+direction+slides.length)%slides.length;slides.forEach((slide,i)=>slide.hidden=i!==index);const status=carousel.querySelector('[aria-live]');if(status)status.textContent=(index+1)+' / '+slides.length;};
 carousel.querySelector('[data-next]')?.addEventListener('click',()=>move(1));
 carousel.querySelector('[data-prev]')?.addEventListener('click',()=>move(-1));
});
document.querySelectorAll('[data-tabs]').forEach(tabs=>{
 const buttons=[...tabs.querySelectorAll('[role=tab]')],panels=[...tabs.querySelectorAll('[role=tabpanel]')];
 const activate=index=>buttons.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});
 buttons.forEach((button,i)=>{button.addEventListener('click',()=>activate(i));button.addEventListener('keydown',event=>{let index;if(event.key==='ArrowRight')index=(i+1)%buttons.length;if(event.key==='ArrowLeft')index=(i+buttons.length-1)%buttons.length;if(event.key==='Home')index=0;if(event.key==='End')index=buttons.length-1;if(index!==undefined){event.preventDefault();activate(index);buttons[index].focus();}});});
});

document.querySelectorAll('#home-faq,#contact-faq').forEach(setupHomeFaq);
