// Click disclosures use the same clipped button-to-panel surface as Share and Contents.
export function setupBrandInfo() {
  if (!('showPopover' in HTMLElement.prototype)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active;
  const entries = [...document.querySelectorAll('[data-brand-info]')].map(trigger => {
    const panel = document.getElementById(trigger.dataset.brandInfo);
    const header = panel.querySelector('.brand-info-header');
    const closer = panel.querySelector('.brand-info-close');
    const content = panel.querySelector('.brand-info-content');
    content.id = `${panel.id}-text`;
    panel.setAttribute('aria-describedby', content.id);
    let open = false, hiding, opening;
    panel.setAttribute('popover', 'manual');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', panel.querySelector('h4').id);
    panel.inert = true;
    header.hidden = false;
    trigger.hidden = false;
    const shown = () => panel.matches(':popover-open');
    const place = () => {
      if (!shown()) return;
      const bounds = trigger.getBoundingClientRect();
      const width = Math.min(320, document.documentElement.clientWidth - 32);
      panel.style.width = `${width}px`;
      const height = panel.getBoundingClientRect().height;
      content.tabIndex = content.scrollHeight > content.clientHeight ? 0 : -1;
      const left = Math.max(16, Math.min(bounds.left - 20, document.documentElement.clientWidth - width - 16));
      const top = Math.max(16, Math.min(bounds.top - 18, innerHeight - height - 16));
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      const values = {left: bounds.left - left, top: bounds.top - top, right: width - bounds.width - (bounds.left - left), bottom: height - bounds.height - (bounds.top - top)};
      for (const [key, value] of Object.entries(values)) panel.style.setProperty(`--info-${key}`, `${Math.max(0, value)}px`);
    };
    const hide = () => { if (!open && shown()) panel.hidePopover(); };
    const close = (restore = false) => {
      if (!open) return;
      open = false;
      if (active === entry) active = null;
      cancelAnimationFrame(opening);
      panel.dataset.open = 'false';
      panel.inert = true;
      trigger.setAttribute('aria-expanded', 'false');
      clearTimeout(hiding);
      if (reduced.matches) hide(); else hiding = setTimeout(hide, 660);
      if (restore) trigger.focus({preventScroll: true});
    };
    const show = () => {
      if (active && active !== entry) active.close();
      active = entry;
      clearTimeout(hiding);
      open = true;
      panel.inert = false;
      trigger.setAttribute('aria-expanded', 'true');
      if (!shown()) {
        panel.dataset.placing = 'true';
        panel.dataset.open = 'false';
        panel.showPopover();
        panel.querySelector('.brand-info-content').scrollTop = 0;
        place();
        // Commit the initial circle once; subsequent frames interpolate its edges.
        getComputedStyle(panel).clipPath;
        delete panel.dataset.placing;
        getComputedStyle(panel).clipPath;
        if (reduced.matches) panel.dataset.open = 'true';
        else opening = requestAnimationFrame(() => {if (open) panel.dataset.open = 'true';});
      } else { place(); panel.dataset.open = 'true'; }
      closer.focus({preventScroll: true});
    };
    const entry = {trigger, panel, close, place};
    trigger.addEventListener('click', () => open ? close(true) : show());
    closer.addEventListener('click', () => close(true));
    panel.addEventListener('transitionend', event => {if (event.target === panel && event.propertyName === 'clip-path') hide();});
    panel.addEventListener('focusout', event => {
      if (open && event.relatedTarget && !panel.contains(event.relatedTarget)) close();
    });
    return entry;
  });
  if (!entries.length) return;
  document.addEventListener('pointerdown', event => {
    if (active && !active.panel.contains(event.target) && !active.trigger.contains(event.target)) active.close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active) {event.preventDefault(); active.close(true);}
  });
  let positioning;
  const onViewport = () => {
    if (!active || positioning) return;
    positioning = requestAnimationFrame(() => {
      positioning = 0;
      if (!active) return;
      const bounds = active.trigger.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > innerHeight) active.close();
      else active.place();
    });
  };
  addEventListener('resize', onViewport, {passive: true});
  addEventListener('scroll', onViewport, {passive: true});
  reduced.addEventListener('change', () => {
    for (const entry of entries) {
      if (entry !== active && entry.panel.matches(':popover-open')) entry.panel.hidePopover();
    }
  });
}
