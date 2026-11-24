(() => {
  const object = document.querySelector('.home-resources #river-within object');
  const picker = document.querySelector('[data-river-motion-picker]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const main = 'M224 721 C304 719 306 787 355 811 C422 849 656 851 659 918 C663 977 491 968 382 1012 C306 1046 325 1080 399 1108 C471 1134 594 1165 626 1220';
  const side = 'M223 722 C308 725 307 795 355 817 C428 854 633 859 636 918 C639 965 481 961 363 1004 C269 1044 301 1088 381 1118 C460 1148 558 1176 587 1222';
  const pale = '#b9e1f4';
  const foam = '#eff9ff';
  const blue = '#6bafdb';

  // Each dash travels exactly one repeat, so the loop has no visible seam.
  function current(path, colour, width, dash, gap, seconds, opacity) {
    return `<path d="${path}" fill="none" stroke="${colour}" stroke-width="${width}" opacity="${opacity}"
      stroke-linecap="round" stroke-dasharray="${dash} ${gap}">
      <animate attributeName="stroke-dashoffset" from="0" to="-${dash + gap}" dur="${seconds}s" repeatCount="indefinite"/>
    </path>`;
  }

  // Stagger marks along the bend; both ends of the route lie outside the visible water.
  function drift(path, mark, count, seconds) {
    return Array.from({length:count}, (_, i) =>
      `<g>${mark}<animateMotion path="${path}" rotate="auto" dur="${seconds}s"
        begin="-${(i + .25) * seconds / count}s" repeatCount="indefinite"/></g>`
    ).join('');
  }

  const variations = [
    ['Silver current', () => current(main, pale, 3, 57, 99, 3.5, .8)],
    ['Foam trails', () => drift(main, '<g fill="#e9f7ff"><circle r="3"/><circle cx="-9" cy="-2" r="2"/><circle cx="-15" cy="2" r="1.2"/></g>', 8, 19)],
    ['Ripple pairs', () => drift(main, '<path d="M0 -9Q7 0 0 9 M-6 -6Q-1 0 -6 6" fill="none" stroke="#a9d7ef" stroke-width="2.4" stroke-linecap="round"/>', 6, 18)],
    ['Blue ribbons', () => current(side, blue, 14, 130, 140, 6, .45) + current(main, pale, 5, 90, 160, 5, .55)],
    ['Twin streams', () => current(main, foam, 2.6, 36, 90, 3.6, .75) + current(side, pale, 2.2, 54, 98, 4.8, .78)],
    ['Sun glints', () => drift(main, '<path d="M-9 0Q-2 -1 0 -5Q1 -1 8 0Q1 1 0 5Q-1 1 -9 0Z" fill="#f2fbff"><animate attributeName="opacity" values=".25;.95;.25" dur="3.4s" repeatCount="indefinite"/></path>', 6, 24)],
    ['Small eddies', () => drift(side, '<path d="M-6 -2C-2 -7 7 -6 7 0C7 6 -4 7 -5 2C-6 -1 -1 -3 2 -1" fill="none" stroke="#b9deef" stroke-width="2" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="5s" repeatCount="indefinite"/></path>', 6, 23)],
    ['Rain rings', () => drift(main, '<g fill="none" stroke="#dcf4ff" stroke-width="1.8"><ellipse rx="5" ry="3"/><ellipse rx="10" ry="6"/><animateTransform attributeName="transform" type="scale" values=".4;1.4" dur="3.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.9;0" dur="3.5s" repeatCount="indefinite"/></g>', 7, 26)],
    ['Quick riffles', () => drift(main, '<path d="m-9 4 6 -8 m0 10 8 -13 m-1 10 4 -7" fill="none" stroke="#c4e9fa" stroke-width="2.4" stroke-linecap="round"/>', 9, 14)],
    ['Slow swell', () => current(main, blue, 36, 210, 290, 11, .25) + current(side, pale, 7, 150, 350, 11, .45)]
  ];

  let svg, layer, index = 0, visible = false;
  function syncPlayback() {
    if (!svg) return;
    if (visible && !document.hidden && !reduced.matches) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }
  function show() {
    svg.pauseAnimations();
    svg.setCurrentTime(0);
    const [name, draw] = variations[index];
    layer.innerHTML = draw();
    picker.querySelector('strong').textContent = name;
    picker.querySelector('[data-count]').textContent = String(index + 1).padStart(2, '0') + ' / ' + variations.length;
    picker.hidden = false;
    syncPlayback();
  }
  function setup() {
    const root = object.contentDocument?.documentElement;
    const channel = root?.querySelector('g[clip-path="url(#channel)"]');
    if (!channel || svg === root) return;
    svg = root;
    layer = svg.ownerDocument.createElementNS(svg.namespaceURI, 'g');
    channel.append(layer);
    show();
  }
  picker.addEventListener('click', event => {
    const button = event.target.closest('[data-step]');
    if (!button) return;
    index = (index + Number(button.dataset.step) + variations.length) % variations.length;
    show();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio > 0;
    syncPlayback();
  }, {threshold:[0, .001]}).observe(object);
  document.addEventListener('visibilitychange', syncPlayback);
  reduced.addEventListener('change', syncPlayback);
  object.addEventListener('load', setup);
  setup();
})();
