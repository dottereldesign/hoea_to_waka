export function setupTopicMarquee(section) {
 if(!section)return()=>{};
 const button=section.querySelector('.kinetic-topics__pause');if(!button)return()=>{};
 let paused=false;
 const sync=()=>{section.classList.toggle('is-paused',paused);button.textContent=paused?'Resume animation':'Pause animation';button.setAttribute('aria-pressed',String(paused));};
 const toggle=()=>{paused=!paused;sync();};button.addEventListener('click',toggle);
 const measure=()=>section.querySelectorAll('.kinetic-topics__track').forEach((track,index)=>{const width=track.firstElementChild.getBoundingClientRect().width;track.style.setProperty('--marquee-duration',(width/[38,44,40][index])+'s');});
 const resize=new ResizeObserver(measure);resize.observe(section);measure();document.fonts.ready.then(measure);
 const observer=new IntersectionObserver(entries=>section.classList.toggle('is-offscreen',!entries.some(entry=>entry.isIntersecting)),{rootMargin:'150px 0px'});observer.observe(section);
 return()=>{resize.disconnect();observer.disconnect();button.removeEventListener('click',toggle);};
}
