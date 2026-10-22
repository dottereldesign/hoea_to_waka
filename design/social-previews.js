export function setupSocialPreviews() {
  document.querySelectorAll('[data-social-gallery]').forEach(gallery => {
    const controls = gallery.querySelector('.social-gallery-controls');
    const tabs = [...gallery.querySelectorAll('[data-social-choice]')];
    const slides = [...gallery.querySelectorAll('.social-slide')];
    const viewport = gallery.querySelector('.social-slider-viewport');
    const track = gallery.querySelector('.social-slider-track');
    const previous = gallery.querySelector('[data-social-prev]');
    const next = gallery.querySelector('[data-social-next]');
    const names = ['linkedin', 'facebook', 'instagram', 'x'];
    let index = 0, drag;
    gallery.classList.add('social-is-ready');
    controls.hidden = false;
    const resize = () => { viewport.style.height = slides[index].offsetHeight + 'px'; };
    const select = (value, focus = false) => {
      index = Math.max(0, Math.min(slides.length - 1, value));
      track.style.transform = `translateX(-${index * 100}%)`;
      tabs.forEach((tab, n) => {
        tab.setAttribute('aria-selected', String(n === index));
        tab.tabIndex = n === index ? 0 : -1;
        slides[n].inert = n !== index;
        slides[n].setAttribute('aria-hidden', String(n !== index));
      });
      gallery.querySelectorAll('[data-social-download]').forEach(group => { group.hidden = group.dataset.socialDownload !== names[index]; });
      previous.disabled = index === 0;
      next.disabled = index === slides.length - 1;
      gallery.querySelector('[data-social-counter]').textContent = `0${index + 1} / 04`;
      if (focus) tabs[index].focus();
      resize();
    };
    tabs.forEach((tab, n) => tab.addEventListener('click', () => select(n)));
    controls.querySelector('[role="tablist"]').addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % slides.length;
      if (event.key === 'ArrowLeft') target = (index + slides.length - 1) % slides.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = slides.length - 1;
      if (target !== undefined) { event.preventDefault(); select(target, true); }
    });
    previous.addEventListener('click', () => select(index - 1));
    next.addEventListener('click', () => select(index + 1));
    viewport.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
    });
    viewport.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.horizontal && Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      if (!drag.horizontal && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      if (!drag.horizontal) { drag.horizontal = true; viewport.setPointerCapture(event.pointerId); track.classList.add('is-dragging'); }
      const resisted = index === 0 && dx > 0 || index === slides.length - 1 && dx < 0;
      track.style.transform = `translateX(calc(-${index * 100}% + ${dx * (resisted ? .18 : 1)}px))`;
    });
    const finish = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const target = event.type !== 'pointercancel' && drag.horizontal && Math.abs(dx) > Math.min(90, viewport.clientWidth * .16) ? index + (dx < 0 ? 1 : -1) : index;
      drag = null;
      track.classList.remove('is-dragging');
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      select(target);
    };
    viewport.addEventListener('pointerup', finish);
    viewport.addEventListener('pointercancel', finish);
    const observer = new ResizeObserver(resize);
    slides.forEach(slide => observer.observe(slide));
    select(0);
  });
}
