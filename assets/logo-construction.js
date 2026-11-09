(() => {
  const root = document.querySelector('.logo-construction');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const choices = [...root.querySelectorAll('[data-lc-choice]')];
  const panels = [...root.querySelectorAll('[data-lc-panel]')];
  const pause = root.querySelector('[data-lc-pause]');
  const status = root.querySelector('.lc-status');
  let active = panels[0], animations = [], generation = 0, seen = false, pausedByVisibility = false;
  const stop = () => {generation++; animations.forEach(a => a.cancel()); animations = [];};
  const animate = (node, frames, duration, delay=0, easing='cubic-bezier(.4,0,.2,1)') => {
    const animation = node.animate(frames, {duration, delay, easing, fill:'both'});
    animations.push(animation);
    return animation;
  };
  const draw = (selector, duration, start, stagger=0, easing) => active.querySelectorAll(selector).forEach((el,i) => animate(el, {strokeDasharray:['1','1'],strokeDashoffset:['1','0']}, duration, start+i*stagger,easing));
  const fade = (selector, duration, start, stagger=0) => active.querySelectorAll(selector).forEach((el,i) => animate(el,{opacity:[0,1]},duration,start+i*stagger));
  function play() {
    stop();
    pausedByVisibility = false;
    if(reduced.matches) {status.textContent='Still study';pause.disabled=true;pause.textContent='Pause';return;}
    const kind=active.dataset.lcPanel;
    pause.disabled=false;pause.textContent='Pause';status.textContent='Drawing';
    if(kind==='compass') {
      draw('.lc-circle.lc-draw',1400,0,230,'linear');
      draw('.lc-outline',2100,650,110);
      fade('.lc-detail',700,1500,40);
      active.querySelectorAll('.lc-compass').forEach((el,i)=>{
        const angle=Number(el.dataset.angle);
        animate(el,[{opacity:0,transform:`rotate(${angle}deg)`},{opacity:.7,offset:.08},{opacity:.7,offset:.88},{opacity:0,transform:`rotate(${angle+360}deg)`}],1400,i*230,'linear');
      });
      draw('.lc-fit',1000,950,180);
    } else if(kind==='atlas') {
      draw('.lc-circle.lc-draw',1200,0,320);
      draw('.lc-fit',850,300,320);
      draw('.lc-outline',1600,1200,65);
      fade('.lc-detail',650,900,90);
      fade('.lc-ink',1100,2700);
    } else if(kind==='ratio') {
      active.querySelectorAll('.lc-ratio-ring').forEach((el,i)=>animate(el,[{transform:'scale(.02)',opacity:0},{transform:'scale(1)',opacity:1}],1400,i*300));
      draw('.lc-draw:not(.lc-outline)',1200,900,120);
      draw('.lc-outline',1900,400,85);
      fade('.lc-detail',900,1900);
      fade('.lc-ink',1300,2400);
    } else if(kind==='blueprint') {
      draw('.lc-circle.lc-draw',1700,0,100);
      draw('.lc-fit',1200,900,100);
      fade('.lc-detail',1100,250,55);
      draw('.lc-outline',1800,650,85);
      animate(active.querySelector('.lc-reveal'),{height:['0px','570px']},2700,600,'linear');
      animate(active.querySelector('.lc-scanline'),[{opacity:0,transform:'translateY(0)'},{opacity:.8,offset:.07},{opacity:.8,offset:.93},{opacity:0,transform:'translateY(570px)'}],2700,600,'linear');
    } else if(kind==='bezier') {
      active.querySelectorAll('.lc-handles').forEach((el,i)=>{
        el.style.transformBox='fill-box';el.style.transformOrigin='center';
        animate(el,[{transform:'scale(.05)',opacity:0},{transform:'scale(1)',opacity:1}],1000,i*220);
      });
      draw('.lc-outline',1900,700,110);
      draw('.lc-circle.lc-draw',1500,1600,220);
      draw('.lc-fit',1000,1600,220);
      fade('.lc-detail',700,1700,80);
      fade('.lc-ink',1000,3100);
    } else {
      draw('.lc-circle',1400,0,170);draw('.lc-axis',950,0);
      draw('.lc-outline',1600,80,170);draw('.lc-hatch',2000,450,170);
      fade('.lc-ink',650,3150);
    }
    const version=generation;
    Promise.all(animations.map(a=>a.finished)).then(()=>{
      if(version!==generation)return;
      status.textContent='Study complete';pause.disabled=true;pause.textContent='Pause';
    }).catch(()=>{});
  }
  choices.forEach(button=>button.addEventListener('click',()=>{
    active=panels.find(panel=>panel.dataset.lcPanel===button.dataset.lcChoice);
    panels.forEach(panel=>panel.hidden=panel!==active);
    choices.forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button)));
    seen=true;play();
  }));
  root.querySelector('[data-lc-replay]').addEventListener('click',play);
  pause.addEventListener('click',()=>{
    const playing=animations.some(a=>a.playState==='running');
    animations.forEach(a=>playing?a.pause():a.play());
    pause.textContent=playing?'Resume':'Pause';status.textContent=playing?'Paused':'Drawing';
  });
  root.querySelector('[data-lc-guides]').addEventListener('change',e=>root.dataset.guides=String(e.target.checked));
  root.querySelector('.lc-choices').hidden=false;root.querySelector('.lc-toolbar').hidden=false;
  const visibility=visible=>{
    if(!visible&&animations.some(a=>a.playState==='running')){animations.forEach(a=>a.pause());pausedByVisibility=true;}
    else if(visible&&pausedByVisibility){animations.forEach(a=>a.play());pausedByVisibility=false;}
  };
  const observer=new IntersectionObserver(entries=>{
    const visible=entries[0].isIntersecting;
    if(visible&&!seen){seen=true;play();}
    else visibility(visible&&!document.hidden);
  },{threshold:.08});
  observer.observe(root.querySelector('.lc-workspace'));
  document.addEventListener('visibilitychange',()=>visibility(!document.hidden&&root.getBoundingClientRect().bottom>0&&root.getBoundingClientRect().top<innerHeight));
  reduced.addEventListener('change',play);
  addEventListener('pagehide',stop);
  addEventListener('pageshow',e=>{if(e.persisted)play();});
})();
