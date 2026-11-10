(() => {
 const root=document.querySelector('.youth-motion');if(!root)return;
 const art=root.querySelector('.ym-art'),stage=root.querySelector('.ym-stage'),slider=root.querySelector('#ym-progress'),output=root.querySelector('output'),status=root.querySelector('.ym-status'),replay=root.querySelector('[data-ym-replay]'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const pick=id=>art.querySelector('#ym-'+id);let animations=[],duration=1,mode='arrival',frame=0,scrollFrame=0,still=false;
 const add=(target,frames,start,time,easing='cubic-bezier(.22,1,.36,1)')=>{const a=target.animate(frames,{duration:time,delay:start,easing,fill:'both'});a.pause();animations.push(a);duration=Math.max(duration,start+time);};
 const enter=(id,from,start,time=850)=>add(pick(id),[{opacity:0,transform:from},{opacity:1,transform:'translate(0,0) rotate(0deg) scale(1)'}],start,time);
 const seek=p=>{p=Math.max(0,Math.min(1,p));animations.forEach(a=>a.currentTime=p*duration);slider.value=String(Math.round(p*100));output.value=Math.round(p*100)+'%';};
 const stop=()=>{cancelAnimationFrame(frame);frame=0;};
 const build=()=>{
  stop();animations.forEach(a=>a.cancel());animations=[];duration=1;
  if(reduced.matches){slider.value='100';output.value='100%';return;}
  if(mode==='arrival'){
   enter('warm-backdrop','scale(.94)',0,1000);enter('garden','translateY(28px)',100);
   enter('left-person','translateY(34px)',260);enter('young-person','translateY(34px)',420);
   enter('speech-bubbles','translateY(22px)',700);enter('floating-pieces','scale(.9)',1000);
  }else if(mode==='conversation'){
   enter('warm-backdrop','scale(.98)',0);enter('garden','translateY(16px)',0);
   enter('left-person','translateX(-70px)',180);enter('young-person','translateX(70px)',620);
   enter('speech-bubbles','translateY(24px) scale(.86)',1150,950);
   ['left','middle','right'].forEach((id,i)=>enter('piece-'+id,'scale(.5) rotate(-12deg)',1750+i*180,600));
  }else if(mode==='pieces'){
   ['warm-backdrop','garden','left-person','young-person','speech-bubbles'].forEach(id=>enter(id,'translateY(8px)',0,650));
   [['left','translate(-100px,-100px) rotate(-35deg)'],['middle','translate(0,-120px) rotate(30deg)'],['right','translate(100px,-80px) rotate(40deg)']].forEach(([id,from],i)=>enter('piece-'+id,from,700+i*430,1000));
  }else if(mode==='depth'){
   enter('warm-backdrop','translateY(16px) scale(.98)',0,2000);
   enter('speech-bubbles','translateY(-55px)',100,1900);enter('garden','translateY(70px)',100,1900);
   enter('left-person','translate(-22px,40px)',180,1850);enter('young-person','translate(22px,40px)',180,1850);
   enter('floating-pieces','translateY(-90px) rotate(-5deg)',300,1800);
  }else{
   const paths=[...pick('scene').querySelectorAll('path')];
   paths.forEach((path,i)=>{
    path.setAttribute('pathLength','1');
    add(path,{stroke:['#281A2C','#281A2C'],strokeWidth:['2px','2px'],strokeDasharray:['1','1'],strokeDashoffset:['1','0']},i*12,1000,'ease-in-out');
    add(path,{fillOpacity:[0,1]},1700,850,'ease-in-out');
    add(path,{strokeOpacity:[1,0]},2300,400);
   });
   enter('floating-pieces','scale(.92)',1900,700);
  }
 };
 const scrollProgress=()=>{const r=stage.getBoundingClientRect();return (innerHeight*.9-r.top)/Math.max(180,Math.min(r.height,innerHeight*.65));};
 const fromScroll=()=>{scrollFrame=0;if(!frame&&!still&&!reduced.matches)seek(scrollProgress());};
 const queueScroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(fromScroll);};
 const play=()=>{if(reduced.matches)return;still=false;stop();seek(0);const start=performance.now();const tick=now=>{seek((now-start)/duration);if(now-start<duration)frame=requestAnimationFrame(tick);else{frame=0;status.textContent='Finished. Scroll to scrub the animation, or replay it.';}};frame=requestAnimationFrame(tick);status.textContent='Playing '+root.querySelector('[aria-pressed=true] strong').textContent+'.';};
 root.querySelector('.ym-controls').hidden=false;
 root.querySelectorAll('[data-ym-choice]').forEach(button=>button.addEventListener('click',()=>{
  mode=button.dataset.ymChoice;still=false;root.querySelectorAll('[data-ym-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));build();
  if(reduced.matches){status.textContent=button.querySelector('strong').textContent+' selected. Reduced motion is on; finished artwork is shown.';return;}
  stage.scrollIntoView({block:'center',behavior:'instant'});play();
 }));
 replay.addEventListener('click',play);
 root.querySelector('[data-ym-still]').addEventListener('click',()=>{stop();still=true;seek(1);status.textContent='Finished artwork. Choose a variation or Replay to animate again.';});
 slider.addEventListener('input',()=>{stop();still=true;seek(Number(slider.value)/100);});
 window.addEventListener('scroll',queueScroll,{passive:true});window.addEventListener('resize',queueScroll,{passive:true});
 const sync=()=>{replay.disabled=reduced.matches;slider.disabled=reduced.matches;build();if(reduced.matches)status.textContent='Reduced motion is on. Finished artwork is shown.';else{still=false;fromScroll();}};
 reduced.addEventListener('change',sync);sync();
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();seek(1);still=true;}});
})();
