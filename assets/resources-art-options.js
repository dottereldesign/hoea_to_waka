(()=>{
 const section=document.querySelector('.home-resources');
 const artwork=section?.querySelector('.resource-artwork');if(!artwork)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 // One shared playhead preserves the line / first stroke / second stroke order
 // in both directions, including a direction change halfway through drawing.
 const duration=3750;
 let time=0,target=0,frame=0,last=0,animations=[];
 const paint=()=>animations.forEach(a=>{a.pause();a.currentTime=time});
 const tick=now=>{
  const elapsed=last?Math.min(now-last,64):0;last=now;
  time=target>time?Math.min(target,time+elapsed):Math.max(target,time-elapsed);
  paint();
  if(time!==target)frame=requestAnimationFrame(tick);else{frame=0;last=0;}
 };
 const check=()=>{
  if(reduced.matches)return;
  target=section.getBoundingClientRect().top<innerHeight*.75?duration:0;
  if(time!==target&&!frame)frame=requestAnimationFrame(tick);
 };
 const setup=()=>{
  cancelAnimationFrame(frame);frame=0;last=0;
  animations=artwork.getAnimations({subtree:true});
  time=reduced.matches?duration:0;paint();check();
 };
 window.addEventListener('scroll',check,{passive:true});
 window.addEventListener('resize',check,{passive:true});
 reduced.addEventListener('change',setup);
 setup();
})();
