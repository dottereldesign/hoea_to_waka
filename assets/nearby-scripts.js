// The original script elements are inert until the associated artwork is nearby.
for (const source of document.querySelectorAll('script[data-near]')) {
  const target = document.querySelector(source.dataset.near);
  if (!target) continue;
  function load() {
    if (!source.isConnected) return;
    observer.disconnect();
    target.removeEventListener('focusin', load);
    target.removeEventListener('pointerenter', load);
    const script = document.createElement('script');
    script.src = source.src;
    source.replaceWith(script);
  }
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) load();
  }, {rootMargin:'1000px 0px'});
  target.addEventListener('focusin', load);
  target.addEventListener('pointerenter', load);
  observer.observe(target);
}
