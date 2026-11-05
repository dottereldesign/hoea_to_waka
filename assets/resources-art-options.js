(()=>{
 const section=document.querySelector('.home-resources');if(!section)return;
 const buttons=[...section.querySelectorAll('[data-resource-choice]')];
 const desktop=matchMedia('(min-width:1000px)');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let visible=false,replay=0;
 const draw=()=>{
  if(!desktop.matches||reduced.matches)return;
  const url=new URL('assets/resources-pencil-animated.svg',document.baseURI);
  url.searchParams.set('draw',String(++replay));
  section.style.setProperty('--resource-art-url',`url("${url.href}")`);
 };
 const choose=value=>{section.dataset.resourceArt=value;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.resourceChoice===value)))};
 try{const saved=localStorage.getItem('hoea-resource-art');if(/^[1-5]$/.test(saved))choose(saved)}catch{}
 buttons.forEach(b=>b.addEventListener('click',()=>{choose(b.dataset.resourceChoice);if(visible)draw();try{localStorage.setItem('hoea-resource-art',b.dataset.resourceChoice)}catch{}}));
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&desktop.matches&&!visible){visible=true;draw();}},{threshold:.25});observer.observe(section);
 desktop.addEventListener('change',()=>{if(desktop.matches&&visible)draw()});
 reduced.addEventListener('change',()=>{if(reduced.matches)section.style.removeProperty('--resource-art-url');else if(visible)draw()});
})();
