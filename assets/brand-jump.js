(() => {
  const source = document.querySelector('.brand-guidelines #contents nav');
  if (!source) return;
  const jump = document.createElement('div');
  jump.className = 'brand-jump';
  jump.dataset.open = 'false';
  jump.innerHTML = `<nav class="brand-jump__panel" id="brand-jump-panel" aria-labelledby="brand-jump-heading" inert><div class="brand-jump__heading" id="brand-jump-heading">Jump to a chapter</div><div class="brand-jump__links"></div></nav><button type="button" class="brand-jump__toggle" title="Table of contents" aria-label="Open table of contents" aria-controls="brand-jump-panel" aria-expanded="false"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></button>`;
  const panel = jump.querySelector('nav');
  const toggle = jump.querySelector('button');
  const links = jump.querySelector('.brand-jump__links');
  source.querySelectorAll('a').forEach((original, index) => {
    const link = document.createElement('a');
    link.className = 'brand-jump__link';
    link.href = original.getAttribute('href');
    link.style.setProperty('--jump-index', index + 1);
    for (const part of ['number', 'title']) {
      const span = document.createElement('span');
      span.className = `brand-jump__${part}`;
      span.textContent = original.querySelector(`.brand-guide-contents__${part}`).textContent;
      link.append(span);
    }
    links.append(link);
  });
  document.body.append(jump);
  const top = document.createElement('button');
  top.type = 'button';
  top.className = 'brand-jump__top';
  top.title = 'Back to top';
  top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>';
  jump.append(top);
  const syncTop = () => {
    const visible = scrollY > Math.max(400, innerHeight * .6) && jump.dataset.open !== 'true';
    top.dataset.visible = String(visible);
    top.inert = !visible;
    top.setAttribute('aria-hidden', String(!visible));
  };
  let topFrame;
  const requestTop = () => {
    if (topFrame) return;
    topFrame = requestAnimationFrame(() => {topFrame = null;syncTop();});
  };
  addEventListener('scroll', requestTop, {passive:true});
  addEventListener('resize', requestTop, {passive:true});
  syncTop();
  top.addEventListener('click', () => {
    const heading = document.querySelector('.site-preview-guide-cover-title');
    if (heading) {
      const temporary = !heading.hasAttribute('tabindex');
      if (temporary) heading.tabIndex = -1;
      heading.focus({preventScroll:true});
      if (temporary) heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), {once:true});
    }
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    scrollTo({top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  const setOpen = (open, restoreFocus = false) => {
    jump.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} table of contents`);
    panel.inert = !open;
    syncTop();
    if (restoreFocus) toggle.focus({preventScroll: true});
  };
  toggle.addEventListener('click', () => setOpen(jump.dataset.open !== 'true'));
  document.addEventListener('pointerdown', event => {
    if (!jump.contains(event.target)) setOpen(false, panel.contains(document.activeElement));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && jump.dataset.open === 'true') {
      event.preventDefault();
      setOpen(false, true);
    }
    if (event.key === 'Tab' && !event.shiftKey && document.activeElement === links.lastElementChild) {
      event.preventDefault();
      setOpen(false, true);
      return;
    }
    if (event.key === 'Tab' && !event.shiftKey && document.activeElement === toggle && jump.dataset.open === 'true') {
      event.preventDefault();
      links.firstElementChild.focus({preventScroll: true});
    }
  });
  jump.addEventListener('focusout', event => {
    if (!jump.contains(event.relatedTarget)) setOpen(false);
  });
  links.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    setOpen(false);
    history.pushState(null, '', link.getAttribute('href'));
    target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
    const temporary = !target.hasAttribute('tabindex');
    if (temporary) target.tabIndex = -1;
    target.focus({preventScroll:true});
    if (temporary) target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once:true});
  });
})();
