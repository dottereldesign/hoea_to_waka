(() => {
 function setup() {
  const header = document.querySelector('[data-header-entrance]');
  if (!header || !header.querySelector('.site-menu-toggle')) return false;
  if (header.dataset.entranceBound) return true;
  header.dataset.entranceBound = 'true';
  const root = document.documentElement;
  const shell = header.querySelector('.site-header-shell');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const desktop = matchMedia('(min-width:1100px)');
  const presets = [
    {name:'Feather cascade',y:26,x:0,scale:.99,zeta:.86,hz:3.2,duration:760,stagger:48},
    {name:'Cushion drop',y:48,x:0,scale:.94,zeta:.62,hz:2.8,duration:920,stagger:62,squash:true},
    {name:'Silk glide',y:14,x:-24,scale:1,zeta:.98,hz:2.5,duration:850,stagger:46},
    {name:'Soft spring',y:32,x:0,scale:.9,zeta:.48,hz:3,duration:1000,stagger:65},
    {name:'Hinge unfold',y:20,x:0,scale:.97,zeta:.8,hz:3.1,duration:850,stagger:56,hinge:48},
    {name:'Ribbon wave',y:18,x:22,scale:1,zeta:.8,hz:3,duration:840,stagger:58,rotate:3,arc:12},
    {name:'Focus float',y:18,x:0,scale:1.025,zeta:.9,hz:3,duration:820,stagger:54,blur:5},
    {name:'Elastic tilt',y:30,x:0,scale:.98,zeta:.58,hz:3.2,duration:940,stagger:60,rotate:7},
    {name:'Arc settle',y:22,x:34,scale:.96,zeta:.8,hz:3,duration:900,stagger:58,rotate:2,arc:26},
    {name:'Magnetic gather',y:12,x:0,scale:.86,zeta:.7,hz:3,duration:940,stagger:58,magnetic:true}
  ];
  const storageKey = 'hoea-header-motion-style';
  const scrollKey = 'hoea-header-scroll:' + location.pathname;
  let selected = 0;
  try { const saved = Number(sessionStorage.getItem(storageKey)); if (Number.isInteger(saved) && saved>=0 && saved<presets.length) selected=saved; } catch {}
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
    getComputedStyle(shell).maxWidth;
  }
  place(true);
  function finish(reason = 'complete') {
    generation++;
    cancelAnimationFrame(startFrame);
    running.forEach(animation => animation.cancel());
    running = [];
    root.classList.remove('header-entrance-pending');
    header.dataset.entranceState = 'idle';
    header.dataset.entranceStop = reason;
    updateStatus();
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
  function frames(element,preset,index,compact,travel=1) {
    const distance = compact ? .65 : desktop.matches ? 1 : .75;
    const direction = index % 2 ? -1 : 1;
    const bounds = element.getBoundingClientRect();
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
    if (reduced.matches || header.classList.contains('is-open')) {updateStatus();return;}
    if (settled) place(false);
    const preset = presets[selected], compact = header.classList.contains('is-scrolled');
    const current = ++generation;
    header.dataset.entranceState = 'playing';
    header.dataset.entranceVariant = String(selected + 1);
    header.dataset.entranceShape = compact ? 'pill' : 'full';
    header.dataset.entranceReason = reason;
    const items = targets();
    const bounds = new Map(items.map(element => {
      let box=element.getBoundingClientRect();
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
      const animation = element.animate(frames(element,preset,index,compact,travel.get(element)),{duration:preset.duration,delay:35+index*preset.stagger,easing:'linear',fill:'both'});
      animation.id = 'header-entrance-item-' + index;
      return animation;
    })];
    Promise.allSettled(running.map(animation => animation.finished)).then(() => {
      if (current === generation) {finish();updateStatus();}
    });
    updateStatus();
  }
  // Interaction wins immediately: no invisible links, moving hit targets or stale menu origins.
  header.addEventListener('pointerdown', () => {finish('pointer');panel?.hidePopover?.();}, {capture:true});
  header.addEventListener('click', () => {finish('click');panel?.hidePopover?.();}, {capture:true});
  header.addEventListener('focusin', () => finish('focus'));
  addEventListener('scroll', () => {if (settled && running.length) finish('scroll');}, {passive:true});
  addEventListener('resize', () => {finish('resize');place(false);}, {passive:true});
  reduced.addEventListener('change', () => {if (reduced.matches) finish('reduced-motion');updateStatus();});
  document.addEventListener('visibilitychange', () => {if (document.hidden) finish('hidden');});

  const lab = document.createElement('div');
  lab.className = 'header-motion-lab';
  lab.innerHTML = `<button type="button" class="header-motion-lab__toggle" popovertarget="header-motion-panel" aria-label="Choose a header entrance animation">Header motion <b></b></button><section popover="auto" id="header-motion-panel" class="header-motion-lab__panel" aria-labelledby="header-motion-title"><div class="header-motion-lab__head"><h2 id="header-motion-title">Header motion</h2><button type="button" class="header-motion-lab__close" popovertarget="header-motion-panel" popovertargetaction="hide" aria-label="Close header motion previews">×</button></div><p class="header-motion-lab__intro">Ten entrances. Choose a style to replay it in the header’s current shape.</p><div class="header-motion-lab__choices" role="group" aria-label="Header animation style">${presets.map((preset,index)=>`<button type="button" class="header-motion-lab__choice" data-header-motion-choice="${index}" aria-pressed="false"><b>${String(index+1).padStart(2,'0')}</b>${preset.name}</button>`).join('')}</div><div class="header-motion-lab__footer"><button type="button" class="header-motion-lab__replay" aria-label="Replay selected header animation">Replay ↻</button><div class="header-motion-lab__status" role="status" aria-live="polite"></div></div></section>`;
  document.body.append(lab);
  const panel = lab.querySelector('[popover]');
  const replay = lab.querySelector('.header-motion-lab__replay');
  function updateStatus() {
    lab.querySelector('.header-motion-lab__toggle b').textContent = String(selected+1).padStart(2,'0');
    lab.querySelectorAll('[data-header-motion-choice]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.headerMotionChoice) === selected)));
    replay.disabled = reduced.matches;
    lab.querySelector('[role=status]').textContent = reduced.matches ? 'Reduced motion: header stays still.' : `${presets[selected].name}${running.length?' · playing':''}`;
  }
  lab.addEventListener('click', event => {
    const choice = event.target.closest('[data-header-motion-choice]');
    if (choice) {
      selected = Number(choice.dataset.headerMotionChoice);
      try {sessionStorage.setItem(storageKey,String(selected));} catch {}
      play();
    } else if (event.target.closest('.header-motion-lab__replay')) play();
  });
  updateStatus();
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
