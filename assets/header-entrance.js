(() => {
 function setup() {
  const header = document.querySelector('[data-header-entrance]');
  if (!header || !header.querySelector('.site-menu-toggle')) return false;
  if (header.dataset.entranceBound) return true;
  header.dataset.entranceBound = 'true';
  header.dataset.entranceStyle = 'Elastic tilt';
  const root = document.documentElement;
  const shell = header.querySelector('.site-header-shell');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const desktop = matchMedia('(min-width:1100px)');
  const presets = [{name:'Elastic tilt',y:30,x:0,scale:.98,zeta:.58,hz:3.2,duration:940,stagger:60,rotate:7}];
  const selected=0;
  const scrollKey = 'hoea-header-scroll:' + location.pathname;
  let running = [], generation = 0, startFrame = 0, settled = false;
  let pageShown = document.readyState === 'complete';
  let navigation = performance.getEntriesByType('navigation')[0]?.type;
  let restoredY = 0, restoredPill = false;
  try { if (navigation === 'reload' || navigation === 'back_forward') {restoredY=Number(sessionStorage.getItem(scrollKey))||0;restoredPill=restoredY>48||(restoredY>24&&sessionStorage.getItem(scrollKey+':pill')==='true');} } catch {}

  // Place directly into the restored shape before anything becomes visible.
  header.dataset.entrancePlacing = 'true';
  function place(restoring = false) {
    const threshold=header.classList.contains('is-scrolled')?24:48;
    header.classList.toggle('is-scrolled', desktop.matches && (scrollY > threshold || (restoring && restoredPill)));
  }
  place(true);
  function finish(reason = 'complete') {
    if (!running.length && !startFrame && !root.classList.contains('header-entrance-pending')) return;
    generation++;
    cancelAnimationFrame(startFrame);
    startFrame = 0;
    running.forEach(animation => animation.cancel());
    running = [];
    root.classList.remove('header-entrance-pending');
    header.dataset.entranceState = 'idle';
    header.dataset.entranceStop = reason;
    if (reason !== 'restart') document.dispatchEvent(new CustomEvent('header-entrance-finished', {detail:{reason}}));

  }
  function settlePlacement() {
    const deadline = performance.now() + 600;
    const settle = () => {
      // Long documents can restore scroll after pageshow. Keep the saved pill until then.
      if (restoredPill && scrollY < 24 && performance.now() < deadline) {requestAnimationFrame(settle);return;}
      place(false);
      delete header.dataset.entrancePlacing;
      settled = true;
    };
    requestAnimationFrame(() => requestAnimationFrame(settle));
  }
  addEventListener('pageshow', event => {
    pageShown = true;
    if (event.persisted) finish('history');
    settlePlacement();
  });
  if (pageShown) settlePlacement();
  addEventListener('pagehide', () => {
    try { sessionStorage.setItem(scrollKey,String(scrollY));sessionStorage.setItem(scrollKey+':pill',String(header.classList.contains('is-scrolled'))); } catch {}
    finish('pagehide');
  });

  // Analytic under-damped springs, sampled once. There is no idle animation loop.
  function spring(time, preset) {
    const omega = 2 * Math.PI * preset.hz;
    const damped = omega * Math.sqrt(1 - preset.zeta * preset.zeta);
    return 1 - Math.exp(-preset.zeta * omega * time) * (Math.cos(damped * time) + preset.zeta * omega / damped * Math.sin(damped * time));
  }
  function targets() {
    return [header.querySelector('.site-brand'),...header.querySelectorAll('.site-nav > .site-nav-link,.site-nav > .site-nav-dropdown'),header.querySelector('.site-header-cta'),header.querySelector('.site-menu-toggle')]
      .filter(element => element && element.getClientRects().length && getComputedStyle(element).display !== 'none');
  }
  function frames(bounds,preset,index,compact,travel=1) {
    const distance = compact ? .65 : desktop.matches ? 1 : .75;
    const direction = index % 2 ? -1 : 1;
    const gather = Math.max(-48,Math.min(48,(innerWidth / 2 - bounds.left - bounds.width / 2) * .14));
    const x = preset.magnetic ? gather : preset.x * (preset.arc ? direction : 1);
    return Array.from({length:61},(_,i) => {
      const offset = i / 60;
      const q = i === 60 ? 1 : spring(offset * preset.duration / 1000,preset);
      const remaining = 1 - q;
      const arc = Math.sin(Math.PI * q) * (preset.arc || 0) * direction;
      const scale = 1 + (preset.scale - 1) * remaining;
      const squash = preset.squash ? Math.max(0,q - 1) * .2 : 0;
      const transform = `perspective(700px) translate3d(${(x*remaining+arc)*distance*travel}px,${-preset.y*remaining*distance}px,0) rotateX(${(preset.hinge||0)*remaining}deg) rotate(${(preset.rotate||0)*remaining*direction}deg) scale(${scale+squash},${scale-squash})`;
      const frame = {offset,transform,opacity:Math.min(1,offset/.24)};
      if (preset.hinge) frame.transformOrigin = '50% 0%';
      if (preset.blur) frame.filter = `blur(${preset.blur * Math.max(0,remaining)}px)`;
      return frame;
    });
  }
  function play(reason = 'replay') {
    const initial = reason === 'load';
    if (initial && !root.classList.contains('header-entrance-pending')) {finish('late-load');return;}
    finish('restart');
    if (reduced.matches || header.classList.contains('is-open')) {return;}
    if (settled) place(false);
    const preset = presets[selected], compact = header.classList.contains('is-scrolled');
    const current = ++generation;
    header.dataset.entranceState = 'playing';
    header.dataset.entranceVariant = String(selected + 1);
    header.dataset.entranceStyle = preset.name;
    header.dataset.entranceShape = compact ? 'pill' : 'full';
    header.dataset.entranceReason = reason;
    const items = targets();
    // Read every target before starting any animation. Reading the next target
    // after animating the previous one forced repeated style/layout flushes.
    const geometry = new Map(items.map(element=>[element,element.getBoundingClientRect()]));
    const bounds = new Map(items.map(element => {
      let box=geometry.get(element);
      if (element.matches('.site-nav-link,.site-nav-dropdown')) {
        const range=document.createRange();range.selectNodeContents(element.querySelector('.site-nav-parent-link')||element);box=range.getBoundingClientRect();
      }
      return [element,box];
    }));
    const spatial = [...items].sort((a,b)=>bounds.get(a).left-bounds.get(b).left);
    const travel = new Map(spatial.map((element,i)=>{
      const box=bounds.get(element),left=i?box.left-bounds.get(spatial[i-1]).right:box.left-8,right=i<spatial.length-1?bounds.get(spatial[i+1]).left-box.right:innerWidth-box.right-8;
      const budget=Math.max(0,(Math.min(left,right)-4)/2);
      const amplitude=(preset.magnetic?48:Math.abs(preset.x))+(preset.arc||0);
      return [element,amplitude?Math.min(1,budget/amplitude):1];
    }));
    const carrier = shell.animate([
      {transform:`translate3d(0,${compact?-4:-8}px,0) scale(.995)`},
      {transform:'translate3d(0,0,0) scale(1)'}
    ],{duration:520,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
    carrier.id = 'header-entrance-shell';
    running = [carrier,...items.map((element,index) => {
      const animation = element.animate(frames(geometry.get(element),preset,index,compact,travel.get(element)),{duration:preset.duration,delay:35+index*preset.stagger,easing:'linear',fill:'both'});
      animation.id = 'header-entrance-item-' + index;
      return animation;
    })];
    Promise.allSettled(running.map(animation => animation.finished)).then(() => {
      if (current === generation) {finish();}
    });

  }
  // Interaction wins immediately: no invisible links, moving hit targets or stale menu origins.
  header.addEventListener('pointerdown', () => {finish('pointer');}, {capture:true});
  header.addEventListener('click', () => {finish('click');}, {capture:true});
  header.addEventListener('focusin', () => finish('focus'));
  addEventListener('scroll', () => {if (settled && running.length) finish('scroll');}, {passive:true});
  addEventListener('resize', () => {finish('resize');place(false);}, {passive:true});
  reduced.addEventListener('change', () => {if (reduced.matches) finish('reduced-motion');});
  document.addEventListener('visibilitychange', () => {if (document.hidden) finish('hidden');});


  function start() {
    place(!pageShown);
    startFrame = requestAnimationFrame(() => play('load'));
  }
  const ready = () => {
    place(!pageShown);
    if (!restoredPill) settlePlacement();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
  start();
  return true;
 }
 if (!setup()) {
   const observer = new MutationObserver(() => {if (setup()) observer.disconnect();});
   observer.observe(document.documentElement,{childList:true,subtree:true});
   document.addEventListener('DOMContentLoaded', () => observer.disconnect(), {once:true});
 }
})();
