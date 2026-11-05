(()=>{
 const section=document.querySelector('.home-resources');if(!section)return;
 const buttons=[...section.querySelectorAll('[data-resource-choice]')];
 const desktop=matchMedia('(min-width:1000px)'), reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let visible=false;
 const draw=()=>{if(!desktop.matches||reduced.matches)return;section.classList.add('is-resource-drawing');section.querySelector('.resource-artwork').getAnimations({subtree:true}).forEach(a=>{a.currentTime=0;a.play()})};
 const choose=value=>{section.dataset.resourceArt=value;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.resourceChoice===value)))};
 choose('3');try{const saved=localStorage.getItem('hoea-resource-art-v2');if(/^[1-5]$/.test(saved))choose(saved)}catch{}
 buttons.forEach(b=>b.addEventListener('click',()=>{choose(b.dataset.resourceChoice);if(visible)draw();try{localStorage.setItem('hoea-resource-art-v2',b.dataset.resourceChoice)}catch{}}));
 const check=()=>{const r=section.getBoundingClientRect();if(desktop.matches&&!visible&&r.top<innerHeight*.85&&r.bottom>0){visible=true;draw()}};
 const observer=new IntersectionObserver(check,{threshold:[0,.15,.25]});observer.observe(section);
 desktop.addEventListener('change',check);
 reduced.addEventListener('change',()=>{if(!reduced.matches&&visible)draw()});
})();
