export function setupSiteHeader() {
  const header = document.querySelector('[data-morph-header]');
  if (!header || header.dataset.headerBound) return;
  header.dataset.headerBound = 'true';
  const toggle = header.querySelector('[data-menu-toggle]');
  const dialog = header.querySelector('.site-menu-panel');
  const close = header.querySelector('.site-menu-close');
  const desktop = matchMedia('(min-width:1100px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let frame = 0, closing = 0, opening = 0, anchorFrame = 0, anchorUntil = 0;
  let menuOpen = false, lastAnchor = '';
  const content = dialog.querySelector('.site-menu-content');
  dialog.querySelectorAll('.site-menu-links a').forEach((link, index) => link.style.setProperty('--menu-item-index', index + 1));

  function syncScroll() {
    frame = 0;
    // Hysteresis prevents flickering when scrolling near the changeover point.
    const compact = header.classList.contains('is-scrolled');
    header.classList.toggle('is-scrolled', desktop.matches && scrollY > (compact ? 24 : 48));
    if (dialog.open) trackAnchor();
  }
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(syncScroll); };
  syncScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('pageshow', syncScroll);
  desktop.addEventListener('change', syncScroll);

  function placeMenu(bounds = toggle.getBoundingClientRect()) {
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
    dialog.dataset.open = 'false';
    header.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    content.inert = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  }
  function finishClose() {
    if (dialog.open) dialog.close();
    resetMenu();
    toggle.focus({preventScroll:true});
  }
  function closeMenu() {
    if (!dialog.open || !menuOpen) return;
    menuOpen = false;
    cancelAnimationFrame(opening);
    dialog.dataset.open = 'false';
    dialog.classList.add('is-closing');
    content.inert = true;
    trackAnchor();
    if (reduced.matches) finishClose();
    else closing = setTimeout(finishClose, 660);
  }
  function openMenu() {
    if (menuOpen) {closeMenu();return;}
    clearTimeout(closing);
    closing = 0;
    menuOpen = true;
    content.inert = false;
    dialog.classList.remove('is-closing');
    if (!dialog.open) {
      const bounds = toggle.getBoundingClientRect(), appearance = getComputedStyle(toggle);
      dialog.style.setProperty('--menu-origin-bg', appearance.backgroundColor === 'rgba(0, 0, 0, 0)' ? '#fff' : appearance.backgroundColor);
      dialog.style.setProperty('--menu-origin-ink', appearance.color);
      dialog.dataset.placing = 'true';
      dialog.dataset.open = 'false';
      header.classList.add('is-open');
      document.body.classList.add('menu-open');
      dialog.showModal();
      content.scrollTop = 0;
      placeMenu(bounds);
      // Commit the measured button circle before enabling the first transition.
      getComputedStyle(dialog).clipPath;
      delete dialog.dataset.placing;
      getComputedStyle(dialog).clipPath;
      if (reduced.matches) dialog.dataset.open = 'true';
      else opening = requestAnimationFrame(() => {if (menuOpen) dialog.dataset.open = 'true';});
    } else dialog.dataset.open = 'true';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    close.focus({preventScroll:true});
    trackAnchor();
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
  addEventListener('resize', () => {if (dialog.open) trackAnchor();}, {passive:true});
  reduced.addEventListener('change', () => {
    if (!reduced.matches || !dialog.open) return;
    if (!menuOpen) finishClose();
    else {dialog.dataset.open = 'true';placeMenu();}
  });

  // Native modal dialogs keep keyboard focus inside and make the page inert.
  dialog.addEventListener('keydown', event => {
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
