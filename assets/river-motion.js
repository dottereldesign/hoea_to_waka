(() => {
  const object = document.querySelector('.home-resources #river-within object');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const main = 'M224 721 C304 719 306 787 355 811 C422 849 656 851 659 918 C663 977 491 968 382 1012 C306 1046 325 1080 399 1108 C471 1134 594 1165 626 1220';
  let svg, visible = false;
  function syncPlayback() {
    if (!svg) return;
    if (visible && !document.hidden && !reduced.matches) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }
  function setup() {
    const root = object.contentDocument?.documentElement;
    const channel = root?.querySelector('g[clip-path="url(#channel)"]');
    if (!channel || svg === root) return;
    svg = root;
    svg.pauseAnimations();
    svg.setCurrentTime(0);
    channel.insertAdjacentHTML('beforeend',
      `<path d="${main}" fill="none" stroke="#6bafdb" stroke-width="48" opacity=".32"
             stroke-linecap="round" stroke-dasharray="440 260">
         <animate attributeName="stroke-dashoffset" from="0" to="-700" dur="22s" repeatCount="indefinite"/>
       </path>`);
    syncPlayback();
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio > 0;
    syncPlayback();
  }, {threshold:[0, .001]}).observe(object);
  document.addEventListener('visibilitychange', syncPlayback);
  reduced.addEventListener('change', syncPlayback);
  object.addEventListener('load', setup);
  setup();
})();
