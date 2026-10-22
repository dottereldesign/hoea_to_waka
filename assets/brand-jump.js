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
  const setOpen = (open, restoreFocus = false) => {
    jump.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} table of contents`);
    panel.inert = !open;
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
