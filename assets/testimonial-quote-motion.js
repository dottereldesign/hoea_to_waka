/* One timed leap per visit to the testimonial section, independent of scrolling. */
(() => {
 const carousel=document.querySelector('[data-testimonial-autoplay]');
 if(!carousel)return;
 const section=carousel.closest('section'),marks=[...carousel.querySelectorAll('.testimonial-quote-mark')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let armed=true,animation=null;
 function reset(){animation?.cancel();animation=null;armed=true;marks.forEach(mark=>{mark.style.opacity=reduced.matches?'1':'0';});}
 function play(){
  if(!armed)return;
  armed=false;marks.forEach(mark=>{mark.style.opacity='1';});
  if(reduced.matches)return;
  const mark=carousel.querySelector('figure:not([hidden]) .testimonial-quote-mark');
  if(!mark)return;
  const distance=Math.min(90,innerWidth*.13);
  const pose=(x,y,r,sx=1,sy=1)=>`translateY(-91.6667%) translate(${x}px,${y}px) rotate(${r}deg) scale(${sx},${sy})`;
  mark.style.transformOrigin='50% 90%';
  animation=mark.animate([
   {offset:0,transform:pose(-distance,24,-10),opacity:0,easing:'cubic-bezier(.2,.6,.4,1)'},
   {offset:.16,transform:pose(-distance*.8,-20,-8),opacity:1,easing:'ease-out'},
   {offset:.4,transform:pose(-distance*.4,-48,-3),opacity:1,easing:'cubic-bezier(.55,0,.8,.4)'},
   {offset:.68,transform:pose(0,2,9,1.025,.975),opacity:1,easing:'ease-out'},
   {offset:.83,transform:pose(1,-4,-3),opacity:1,easing:'ease-in-out'},
   {offset:1,transform:pose(0,0,0),opacity:1}
  ],{duration:1150,fill:'none'});
 }
 reset();
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)reset();}).observe(section);
 new IntersectionObserver(entries=>{if(entries[0].isIntersecting)play();},{rootMargin:'0px 0px -15% 0px',threshold:.12}).observe(carousel);
 reduced.addEventListener('change',()=>{animation?.cancel();marks.forEach(mark=>{mark.style.opacity='1';});});
})();
