(() => {
  const root=document.querySelector('#anna-story');
  if(!root)return;
  const stage=root.querySelector('.anna-stage'),pin=root.querySelector('.anna-pin'),list=root.querySelector('.anna-list');
  const items=[...list.children],buttons=[...root.querySelectorAll('[data-anna-study]')];
  const route=root.querySelector('.anna-route'),ink=route.querySelector('.anna-route__ink');
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const studies={
    thread:['01 · Drawn thread','Follow a sketched river through Anna’s story. Scroll gently: each landing gives the next chapter a little room.'],
    thread2:['01 pt 2 \u00b7 Ocean passage','An ocean passage cut through white paper. Follow the waka down Anna\u2019s story.'],
    stack:['02 · Paper chapters','One paper chapter makes room for the next. Scroll gently through the stack.'],
    worlds:['03 · Small worlds','Little scenes draw themselves into place, each grounded on the page.'],
    horizon:['04 · The horizon','A wide view of the story. Scroll down to travel along it, or use the chapter arrows.'],
    constellation:['05 · Constellation','Experience, roots and purpose connect into a quiet night chart.']
  };
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const spring=(x=0)=>({x,v:0,t:x});
  const states=items.map(item=>({item,reveal:spring(),node:spring(),cover:spring(),
    strokes:[...item.querySelectorAll('[data-draw]')],leaves:[...item.querySelectorAll('[data-leaf]')],
    chairs:[...item.querySelectorAll('[data-chair]')],books:[...item.querySelectorAll('[data-book]')],beam:item.querySelector('[data-beam]')}));
  const progress=spring(),pan=spring();
  let variant=root.dataset.timelineVariant,frame=0,measureFrame=0,lastTime,blocked=false,horizon=false,chapter=0,paintCount=0,needsRoute=false,river;
  const f=n=>Number(n.toFixed(4));
  states.forEach(state=>state.strokes.forEach(path=>{path.setAttribute('pathLength','1');path.style.strokeDasharray='1';}));
  ink.style.strokeDasharray='1';
  // Stable, quiet stars. There is no ambient animation loop.
  let seed=813;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const stars=Array.from({length:38},()=>({x:random(),y:random(),r:.5+random()*.8}));
  function integrate(value,dt,k=95,d=14){
    const steps=Math.max(1,Math.ceil(dt/(1/120))),step=dt/steps;
    for(let i=0;i<steps;i++){value.v+=(k*(value.t-value.x)-d*value.v)*step;value.x+=value.v*step;}
    if(Math.abs(value.x-value.t)<.001&&Math.abs(value.v)<.006){value.x=value.t;value.v=0;return false;}
    return true;
  }
  const snap=(value,target)=>{value.x=value.t=target;value.v=0;};
  function drawWorld(state){
    const p=state.reveal.x,q=clamp(p);
    state.strokes.forEach((path,i)=>{const delay=Math.min(.45,i*.022);path.style.strokeDashoffset=f(1-clamp((q-delay)/(1-delay)));});
    state.leaves.forEach((leaf,i)=>{const x=leaf.dataset.x,y=leaf.dataset.y,angle=+leaf.dataset.angle+(1-p)*(i%2?65:-65),size=+leaf.dataset.size*clamp(p,0,1.08);leaf.setAttribute('transform',`translate(${x} ${y}) rotate(${f(angle)}) scale(${f(size)})`);});
    state.chairs.forEach(chair=>{const side=chair.dataset.chair==='left'?-1:1;chair.setAttribute('transform',`translate(${f(side*42*(1-p))} 0)`);});
    state.books.forEach(book=>book.setAttribute('transform',`translate(260 347) scale(${f(clamp(p,.001,1.08))} 1) translate(-260 -347)`));
    if(state.beam){state.beam.setAttribute('opacity',f(q));state.beam.setAttribute('transform',`translate(272 165) scale(${f(q)} 1) translate(-272 -165)`);}
  }
  function paint(){
    states.forEach(state=>{
      state.item.style.setProperty('--tl-p',f(state.reveal.x));
      state.item.style.setProperty('--tl-node',f(.72+.28*state.node.x));
      state.item.style.setProperty('--tl-cover',f(state.cover.x));
      if(['worlds','thread2'].includes(variant))drawWorld(state);
    });
    ink.style.strokeDashoffset=f(1-clamp(progress.x));
    list.style.transform=horizon?`translate3d(${f(pan.x)}px,0,0)`:'';
    if(['thread','thread2'].includes(variant))river?.paint();
    root.dataset.timelineFrame=String(++paintCount);
  }
  function tick(time){
    frame=0;if(blocked||document.hidden)return;
    const dt=lastTime===undefined?1/60:Math.min((time-lastTime)/1000,.04);lastTime=time;
    let running=false;
    if(['thread','thread2'].includes(variant)&&river){
      running=river.step(dt)||running;
      states.forEach((state,i)=>{state.reveal.t=state.node.t=Number(river.reached(i));});
    }
    states.forEach(state=>{running=(variant==='thread2'?integrate(state.reveal,dt,400,40):integrate(state.reveal,dt))||running;running=integrate(state.node,dt,200,14)||running;running=integrate(state.cover,dt,90,18)||running;});
    running=integrate(progress,dt,80,17)||running;running=integrate(pan,dt,65,16)||running;
    paint();root.dataset.timelineState=running?'running':'settled';
    if(running)frame=requestAnimationFrame(tick);else lastTime=undefined;
  }
  function run(){if(!frame&&!blocked&&!document.hidden){lastTime=undefined;frame=requestAnimationFrame(tick);}}
  function buildRoute(bounds){
    if(['thread','thread2'].includes(variant)&&river){river.build(bounds,pin.getBoundingClientRect());return;}
    if(!['thread','thread2','constellation'].includes(variant))return;
    const box=pin.getBoundingClientRect();if(!box.width||!box.height)return;
    route.setAttribute('viewBox',`0 0 ${f(box.width)} ${f(box.height)}`);
    const points=items.map(item=>{const b=item.querySelector('.anna-node').getBoundingClientRect();return[b.left+b.width/2-box.left,b.top+b.height/2-box.top];});
    let d=`M${f(points[0][0])} ${f(Math.max(0,points[0][1]-52))}`;
    d+=`L${points[0].map(f).join(' ')}`;
    for(let i=1;i<points.length;i++){
      const [x,y]=points[i-1],[nx,ny]=points[i];
      if(['thread','thread2'].includes(variant)){const bend=innerWidth>760?70:12,mid=(y+ny)/2;d+=`C${f(x+bend)} ${f(mid)} ${f(nx-bend)} ${f(mid)} ${f(nx)} ${f(ny)}`;}
      else{const mid=(x+nx)/2;d+=`C${f(mid)} ${f(y)} ${f(mid)} ${f(ny)} ${f(nx)} ${f(ny)}`;}
    }
    const end=points.at(-1);d+=`L${f(end[0])} ${f(Math.min(box.height,end[1]+52))}`;
    route.querySelectorAll('path').forEach(path=>path.setAttribute('d',d));
    route.querySelector('.anna-stars').innerHTML=stars.map(star=>`<circle cx="${f(star.x*box.width)}" cy="${f(star.y*box.height)}" r="${star.r}"/>`).join('');
  }
  function configure(){
    if(['thread','thread2'].includes(variant)&&!river)river=window.createAnnaRiver?.(root,items);
    if(!['thread','thread2'].includes(variant))river?.pause();
    horizon=variant==='horizon'&&innerWidth>900&&innerHeight>700&&!preference.matches;
    root.classList.toggle('is-horizon-scroll',horizon);
    root.dataset.motionReduced=String(preference.matches);
    if(variant==='horizon'&&!horizon)list.tabIndex=0;else list.removeAttribute('tabindex');
    if(!horizon)list.style.transform='';
  }
  function controls(index){
    chapter=clamp(index,0,items.length-1);
    root.querySelector('[data-anna-chapter]').textContent=`0${chapter+1} / 05`;
    root.querySelector('[data-anna-prev]').disabled=chapter===0;
    root.querySelector('[data-anna-next]').disabled=chapter===items.length-1;
  }
  function measure(rebuild=false){
    measureFrame=0;
    if(blocked||document.hidden)return;
    const box=stage.getBoundingClientRect(),visible=box.bottom>0&&box.top<innerHeight;
    const bounds=items.map(item=>item.getBoundingClientRect());
    if(rebuild)buildRoute(bounds);
    if(['thread','thread2'].includes(variant)&&river)river.setScroll(scrollY,visible,preference.matches);
    let reached=0;
    states.forEach((state,i)=>{
      const target=preference.matches||variant==='horizon'?1:['thread','thread2'].includes(variant)&&river?Number(river.reached(i)):Number(bounds[i].top<innerHeight*.91);
      state.reveal.t=target;state.node.t=target;
      const next=bounds[i+1];state.cover.t=variant==='stack'&&innerWidth>760&&next?clamp((124+i*12+250-next.top)/250):0;
      if(target)reached=(i+1)/items.length;
      if(preference.matches||!visible){snap(state.reveal,target);snap(state.node,target);snap(state.cover,state.cover.t);}
    });
    progress.t=reached;
    if(horizon){
      const p=clamp((124-box.top)/Math.max(1,box.height-pin.offsetHeight));
      const first=items[0],last=items.at(-1),start=(pin.clientWidth-first.offsetWidth)/2-32;
      pan.t=start-p*(last.offsetLeft-first.offsetLeft);controls(Math.round(p*4));
    }else if(variant==='horizon'){
      const step=items[1].offsetLeft-items[0].offsetLeft;controls(Math.round(list.scrollLeft/step));snap(pan,0);
    }else snap(pan,0);
    if(preference.matches||!visible){snap(progress,reached);snap(pan,pan.t);paint();root.dataset.timelineState='settled';return;}
    run();
  }
  function queue(rebuild=false){
    needsRoute=needsRoute||rebuild;
    if(blocked||document.hidden)return;
    if(measureFrame)cancelAnimationFrame(measureFrame);
    measureFrame=requestAnimationFrame(()=>{const rebuildRoute=needsRoute;needsRoute=false;measure(rebuildRoute);});
  }
  function choose(id,scroll=false){
    if(!studies[id])return;
    cancelAnimationFrame(frame);frame=0;lastTime=undefined;
    variant=id;root.dataset.timelineVariant=id;
    if(['thread','thread2'].includes(id))river?.reset();
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.annaStudy===id)));
    const [name,description]=studies[id];if(root.querySelector('[data-anna-study-name]'))root.querySelector('[data-anna-study-name]').textContent=name;if(root.querySelector('[data-anna-study-description]'))root.querySelector('[data-anna-study-description]').textContent=description;
    states.forEach(state=>{snap(state.reveal,preference.matches?1:0);snap(state.node,preference.matches?1:0);snap(state.cover,0);});snap(progress,0);snap(pan,0);
    // Initial markup already starts at zero. Reset only when switching studies;
    // a redundant initial scroll write forced layout after all SVG updates.
    if(scroll)list.scrollLeft=0;
    configure();paint();
    if(scroll){const target=root.querySelector('.anna-studies');window.scrollTo({top:target.getBoundingClientRect().top+scrollY-128,behavior:'instant'});buttons.find(button=>button.dataset.annaStudy===id)?.focus({preventScroll:true});}
    queue(true);
  }
  buttons.forEach(button=>button.addEventListener('click',()=>choose(button.dataset.annaStudy,true)));
  root.querySelector('[data-anna-next-study]')?.addEventListener('click',()=>{const ids=Object.keys(studies);choose(ids[(ids.indexOf(variant)+1)%ids.length],true);});
  function go(direction){
    const index=clamp(chapter+direction,0,4);
    if(horizon){const box=stage.getBoundingClientRect();window.scrollTo({top:box.top+scrollY-124+index/4*(box.height-pin.offsetHeight),behavior:'smooth'});}
    else list.scrollTo({left:items[index].offsetLeft-items[0].offsetLeft,behavior:preference.matches?'instant':'smooth'});
  }
  root.querySelector('[data-anna-prev]')?.addEventListener('click',()=>go(-1));
  root.querySelector('[data-anna-next]')?.addEventListener('click',()=>go(1));
  list.addEventListener('scroll',()=>queue(),{passive:true});
  addEventListener('scroll',()=>queue(),{passive:true});
  addEventListener('resize',()=>{configure();queue(true);},{passive:true});
  const suspend=()=>{cancelAnimationFrame(frame);cancelAnimationFrame(measureFrame);frame=measureFrame=0;lastTime=undefined;river?.pause();root.dataset.timelineState='suspended';};
  document.addEventListener('hoea:site-menu',event=>{blocked=event.detail.open;if(blocked)suspend();else queue(true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else queue(true);});
  preference.addEventListener('change',()=>{configure();queue(true);});
  addEventListener('pagehide',suspend);addEventListener('pageshow',()=>queue(true));
  let oldWidth=0,oldHeight=0;
  new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;if(Math.abs(width-oldWidth)>.5||Math.abs(height-oldHeight)>.5){oldWidth=width;oldHeight=height;queue(true);}}).observe(stage);
  document.fonts.ready.then(()=>queue(true));
  buttons.forEach(button=>button.disabled=false);

  root.classList.add('is-enhanced');choose(variant);
})();
