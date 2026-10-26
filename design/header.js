export function setupSiteHeader() {
  const header = document.querySelector('[data-morph-header]');
  if (!header || header.dataset.headerBound) return;
  header.dataset.headerBound = 'true';
  const toggle = header.querySelector('[data-menu-toggle]');
  const dialog = header.querySelector('.site-menu-panel');
  const close = header.querySelector('.site-menu-close');
  const desktop = matchMedia('(min-width:1100px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const bar=header.querySelector('.site-header-bar'),brand=header.querySelector('.site-brand');
  const glass=document.createElement('span');glass.className='site-header-glass';glass.setAttribute('aria-hidden','true');bar.prepend(glass);
  const symbol=document.createElement('span');symbol.className='site-brand-symbol';symbol.setAttribute('aria-hidden','true');brand.prepend(symbol);
  header.classList.add('header-compositor');
  let morphs=[],morphGeneration=0,placed=false;
  const morphTargets=()=>[glass,symbol,brand.querySelector('.site-brand-name'),brand.querySelector('.site-brand-line'),header.querySelector('.site-nav'),header.querySelector('.site-header-cta'),toggle].filter(node=>node?.getClientRects().length&&getComputedStyle(node).display!=='none');
  function stopMorph(){morphGeneration++;morphs.forEach(animation=>animation.cancel());morphs=[];header.dataset.headerMorph='idle';}
  function compactHeader(next){
    if(header.classList.contains('is-scrolled')===next){placed=true;return;}
    const targets=morphTargets();
    const first=new Map(targets.map(node=>[node,node.getBoundingClientRect()]));
    stopMorph();header.classList.toggle('is-scrolled',next);
    if(!placed||reduced.matches||!desktop.matches){placed=true;return;}
    const last=new Map(targets.map(node=>[node,node.getBoundingClientRect()]));
    const token=++morphGeneration;header.dataset.headerMorph='moving';
    morphs=targets.map(node=>{
      const a=first.get(node),b=last.get(node),dx=a.x+a.width/2-b.x-b.width/2,dy=a.y+a.height/2-b.y-b.height/2;
      if(!a.width||!a.height||!b.width||!b.height)return null;
      const sx=a.width/b.width,sy=node===symbol?sx:a.height/b.height;
      return node.animate([{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`},{transform:'translate(0px,0px) scale(1,1)'}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
    }).filter(Boolean);
    Promise.allSettled(morphs.map(animation=>animation.finished)).then(()=>{if(token===morphGeneration)stopMorph();});
    placed=true;
  }
  let frame = 0, closing = 0, opening = 0, anchorFrame = 0, anchorUntil = 0;
  let menuOpen = false, lastAnchor = '';
  const content = dialog.querySelector('.site-menu-content');
  // A top-layer popover avoids native :modal's document-wide inert restyle.
  // Keep equivalent modal focus, pointer and accessibility isolation explicitly.
  const layered = typeof dialog.showPopover === 'function';
  const scrim = layered ? document.createElement('div') : null;
  if (scrim) {
    scrim.className = 'site-menu-scrim';
    scrim.setAttribute('popover','manual');
    scrim.setAttribute('aria-hidden','true');
    scrim.dataset.open = 'false';
    document.body.append(scrim);
    scrim.addEventListener('click',closeMenu);
  }
  if (layered) dialog.setAttribute('popover', 'manual');
  dialog.setAttribute('aria-modal', 'true');
  document.body.append(dialog);
  let backgroundBlocked = false, scrollLock, hiddenSiblings = [], pausedAnimations = [], backgroundTabs = [];
  function blockBackground(blocked) {
    if (backgroundBlocked === blocked) return;
    backgroundBlocked = blocked;
    if (blocked) {
      // Snapshot/pause before changing page attributes; avoid a second whole-page flush.
      pausedAnimations = document.getAnimations().filter(animation => {
        const target=animation.effect?.target;
        return animation.playState==='running'&&target instanceof Element&&!target.closest('.site-menu-panel,.site-menu-scrim,[data-morph-header]');
      }).map(animation=>{const time=animation.currentTime;animation.pause();if(time!==null)animation.currentTime=time;return[animation,time];});
      scrollLock = {value:document.body.style.getPropertyValue('overflow'), priority:document.body.style.getPropertyPriority('overflow')};
      document.body.style.setProperty('overflow', 'hidden');
      hiddenSiblings = [...document.body.children].filter(node => node !== dialog && node !== scrim && !node.matches('script,style,link')).map(node => [node,node.getAttribute('aria-hidden')]);
      hiddenSiblings.forEach(([node]) => node.setAttribute('aria-hidden','true'));
      backgroundTabs = [...document.body.querySelectorAll('a[href],button,input,select,textarea,summary,iframe,[tabindex],[contenteditable="true"]')]
        .filter(node => !dialog.contains(node) && !node.disabled && (node.tabIndex >= 0 || node.isContentEditable))
        .map(node => [node,node.getAttribute('tabindex')]);
      backgroundTabs.forEach(([node]) => node.setAttribute('tabindex','-1'));
      document.dispatchEvent(new CustomEvent('hoea:site-menu',{detail:{open:true}}));
    } else {
      if (scrollLock?.value) document.body.style.setProperty('overflow',scrollLock.value,scrollLock.priority);
      else document.body.style.removeProperty('overflow');
      scrollLock = undefined;
      hiddenSiblings.forEach(([node,value]) => {
        if (node.getAttribute('aria-hidden') !== 'true') return;
        if (value === null) node.removeAttribute('aria-hidden'); else node.setAttribute('aria-hidden',value);
      });
      hiddenSiblings = [];
      backgroundTabs.forEach(([node,value]) => {
        if (node.getAttribute('tabindex') !== '-1') return;
        if (value === null) node.removeAttribute('tabindex'); else node.setAttribute('tabindex',value);
      });
      backgroundTabs = [];
      if (!reduced.matches) pausedAnimations.forEach(([animation,time]) => {
        if (animation.playState === 'paused' && animation.currentTime === time && animation.effect?.target?.isConnected) animation.play();
      });
      pausedAnimations = [];
      document.dispatchEvent(new CustomEvent('hoea:site-menu',{detail:{open:false}}));
    }
  }
  dialog.querySelectorAll('.site-menu-links a').forEach((link, index) => link.style.setProperty('--menu-item-index', index + 1));

  function syncScroll() {
    frame = 0;
    // Hysteresis prevents flickering when scrolling near the changeover point.
    const compact = header.classList.contains('is-scrolled');
    compactHeader(desktop.matches && scrollY > (compact ? 24 : 48));
    if (dialog.open) trackAnchor();
  }
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(syncScroll); };
  syncScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('pageshow', syncScroll);
  desktop.addEventListener('change', syncScroll);
  addEventListener('resize',stopMorph,{passive:true});
  reduced.addEventListener('change',()=>{if(reduced.matches)stopMorph();});

  function placeMenu(bounds = toggle.getBoundingClientRect()) {
    lastAnchor=[bounds.x,bounds.y,bounds.width,bounds.height,innerWidth,innerHeight].join(',');
    const viewport = document.documentElement.clientWidth;
    const width = Math.min(440, viewport - 32);
    const left = Math.max(16, Math.min(bounds.right + 20 - width, viewport - width - 16));
    const top = Math.max(8, bounds.top - 12);
    const height = Math.min(960, innerHeight - top - 16);
    Object.assign(dialog.style, {left:`${left}px`, top:`${top}px`, width:`${width}px`, height:`${height}px`});
    const values = {left:bounds.left-left, top:bounds.top-top, right:width-(bounds.right-left), bottom:height-(bounds.bottom-top)};
    for (const [key,value] of Object.entries(values)) dialog.style.setProperty(`--menu-origin-${key}`, `${Math.max(0,value)}px`);
    dialog.style.setProperty('--menu-origin-radius', `${bounds.height / 2}px`);
    dialog.style.setProperty('--menu-toggle-width', `${bounds.width}px`);
    dialog.style.setProperty('--menu-toggle-height', `${bounds.height}px`);
  }
  function trackAnchor() {
    anchorUntil = performance.now() + 700;
    if (anchorFrame) return;
    const tick = time => {
      anchorFrame = 0;
      if (!dialog.open) return;
      const bounds = toggle.getBoundingClientRect();
      const key = [bounds.x,bounds.y,bounds.width,bounds.height,innerWidth,innerHeight].join(',');
      if (key !== lastAnchor) {lastAnchor = key;placeMenu(bounds);}
      if (time < anchorUntil) anchorFrame = requestAnimationFrame(tick);
    };
    anchorFrame = requestAnimationFrame(tick);
  }
  function resetMenu() {
    clearTimeout(closing);
    cancelAnimationFrame(opening);
    cancelAnimationFrame(anchorFrame);
    closing = opening = anchorFrame = 0;
    menuOpen = false;
    dialog.classList.remove('is-closing');
    delete dialog.dataset.placing;
    paintOpen(false);
    header.classList.remove('is-open');
    blockBackground(false);
    content.inert = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  }
  function finishClose() {
    if (layered && dialog.matches(':popover-open')) dialog.hidePopover();
    if (dialog.open) dialog.close();
    if (scrim?.matches(':popover-open')) scrim.hidePopover();
    resetMenu();
    toggle.focus({preventScroll:true});
  }
  function closeMenu() {
    if (!dialog.open || !menuOpen) return;
    menuOpen = false;
    cancelAnimationFrame(opening);
    paintOpen(false);
    dialog.classList.add('is-closing');
    content.inert = true;
    if(header.dataset.headerMorph==='moving'||header.dataset.entranceState==='playing')trackAnchor();
    if (reduced.matches) finishClose();
    else closing = setTimeout(finishClose, 660);
  }
  function openMenu() {
    if (menuOpen) {closeMenu();return;}
    clearTimeout(closing);
    closing = 0;
    menuOpen = true;
    if (!dialog.open) {
      const bounds = toggle.getBoundingClientRect(), appearance = getComputedStyle(toggle);
      const originBackground=appearance.backgroundColor,originInk=appearance.color;
      // Pause and isolate the page before committing the opening geometry. This
      // shares its style/layout flush with placement instead of forcing another
      // document pass after focusing the close control.
      blockBackground(true);
      content.inert = false;
      dialog.classList.remove('is-closing');
      dialog.style.setProperty('--menu-origin-bg', originBackground === 'rgba(0, 0, 0, 0)' ? '#fff' : originBackground);
      dialog.style.setProperty('--menu-origin-ink', originInk);
      dialog.dataset.placing = 'true';
      paintOpen(false);
      header.classList.add('is-open');
      if (layered) {scrim.showPopover();dialog.showPopover();dialog.setAttribute('open','');}
      else dialog.showModal();
      content.scrollTop = 0;
      placeMenu(bounds);
      close.focus({preventScroll:true});
      // Commit the measured button circle before enabling the first transition.
      getComputedStyle(dialog).clipPath;
      delete dialog.dataset.placing;
      if (reduced.matches) paintOpen(true);
      else opening = requestAnimationFrame(() => {if (menuOpen) paintOpen(true);});
    } else {content.inert=false;dialog.classList.remove('is-closing');paintOpen(true);}
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    if(document.activeElement!==close)close.focus({preventScroll:true});
    blockBackground(true);
    if(header.dataset.headerMorph==='moving'||header.dataset.entranceState==='playing')trackAnchor();
  }
  toggle.addEventListener('click', openMenu);
  close.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
  dialog.addEventListener('cancel', event => {event.preventDefault();closeMenu();});
  dialog.addEventListener('transitionend', event => {
    if (event.target === dialog && event.propertyName === 'clip-path' && !menuOpen && dialog.open) finishClose();
  });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) closeMenu();
    if (event.target.closest('a[href]')) finishClose();
  });
  dialog.addEventListener('close', () => {if (!dialog.open) resetMenu();});
  dialog.addEventListener('toggle', event => {if (event.newState === 'closed' && dialog.open) finishClose();});
  document.addEventListener('focusin', event => {if (dialog.open && !dialog.contains(event.target)) close.focus({preventScroll:true});});
  addEventListener('pagehide', () => {if (dialog.open) finishClose();});
  addEventListener('resize', () => {if (dialog.open) trackAnchor();}, {passive:true});
  reduced.addEventListener('change', () => {
    if (!reduced.matches || !dialog.open) return;
    if (!menuOpen) finishClose();
    else {paintOpen(true);placeMenu();}
  });
  function paintOpen(value) {
    dialog.dataset.open = String(value);
    if (scrim) scrim.dataset.open = String(value);
  }

  // Keep keyboard focus within the visible modal, including its closing morph.
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {event.preventDefault();event.stopPropagation();closeMenu();return;}
    if (event.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll('a[href],button')].filter(item => !item.closest('[inert]') && !item.disabled);
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  header.querySelectorAll('.site-nav-dropdown').forEach(dropdown => {
    const parent = dropdown.querySelector('.site-nav-parent-link');
    parent.setAttribute('aria-expanded', 'false');
    parent.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') { event.preventDefault(); dropdown.classList.remove('is-subnav-dismissed'); dropdown.querySelector('.site-subnav a')?.focus(); }
    });
    dropdown.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); parent.focus(); dropdown.classList.add('is-subnav-dismissed'); parent.setAttribute('aria-expanded', 'false'); }
    });
    dropdown.addEventListener('focusout', () => requestAnimationFrame(() => {
      if (!dropdown.contains(document.activeElement)) { dropdown.classList.remove('is-subnav-dismissed'); parent.setAttribute('aria-expanded', String(dropdown.matches(':hover'))); }
    }));
    dropdown.addEventListener('focusin', () => parent.setAttribute('aria-expanded', 'true'));
    dropdown.addEventListener('pointerenter', () => { dropdown.classList.remove('is-subnav-dismissed'); parent.setAttribute('aria-expanded', 'true'); });
    dropdown.addEventListener('pointerleave', () => { if (!dropdown.contains(document.activeElement)) parent.setAttribute('aria-expanded', 'false'); });
  });
}
