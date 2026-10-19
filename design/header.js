export function setupSiteHeader() {
  const header = document.querySelector('[data-morph-header]');
  if (!header || header.dataset.headerBound) return;
  header.dataset.headerBound = 'true';
  const toggle = header.querySelector('[data-menu-toggle]');
  const dialog = header.querySelector('.site-menu-panel');
  const close = header.querySelector('.site-menu-close');
  const desktop = matchMedia('(min-width:1100px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let frame = 0, closing = 0;

  function syncScroll() {
    frame = 0;
    // Hysteresis prevents flickering when scrolling near the changeover point.
    const compact = header.classList.contains('is-scrolled');
    header.classList.toggle('is-scrolled', desktop.matches && scrollY > (compact ? 24 : 48));
  }
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(syncScroll); };
  syncScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('pageshow', syncScroll);
  desktop.addEventListener('change', syncScroll);

  function finishClose() {
    clearTimeout(closing);
    closing = 0;
    dialog.close();
    dialog.classList.remove('is-closing');
    header.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.focus({ preventScroll:true });
  }
  function closeMenu() {
    if (!dialog.open || closing) return;
    if (reduced.matches) { finishClose(); return; }
    dialog.classList.add('is-closing');
    closing = setTimeout(finishClose, 320);
  }
  function openMenu() {
    if (dialog.open) { closeMenu(); return; }
    dialog.showModal();
    header.classList.add('is-open');
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    close.focus({ preventScroll:true });
  }
  toggle.addEventListener('click', openMenu);
  close.addEventListener('click', closeMenu);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) closeMenu();
    if (event.target.closest('a[href]')) finishClose();
  });
  dialog.addEventListener('close', () => {
    header.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  });
  // Native modal dialogs keep keyboard focus inside and make the page inert.
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll('a[href],button')];
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
