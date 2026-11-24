(() => {
  const object = document.querySelector('.home-resources #river-within object');
  const picker = document.querySelector('[data-river-motion-picker]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const main = 'M224 721 C304 719 306 787 355 811 C422 849 656 851 659 918 C663 977 491 968 382 1012 C306 1046 325 1080 399 1108 C471 1134 594 1165 626 1220';
  const side = 'M223 722 C308 725 307 795 355 817 C428 854 633 859 636 918 C639 965 481 961 363 1004 C269 1044 301 1088 381 1118 C460 1148 558 1176 587 1222';
  const pale = '#b9e1f4';
  const deep = '#123f70';
  const blue = '#6bafdb';

  // Each dash travels exactly one repeat, so the loop has no visible seam.
  function current(path, colour, width, dash, gap, seconds, opacity, phase = 0) {
    return `<path d="${path}" fill="none" stroke="${colour}" stroke-width="${width}" opacity="${opacity}"
      stroke-linecap="round" stroke-dasharray="${dash} ${gap}">
      <animate attributeName="stroke-dashoffset" from="${phase}" to="${phase - dash - gap}" dur="${seconds}s" repeatCount="indefinite"/>
    </path>`;
  }

  const variations = [
    ['Slow swell', () => current(main, blue, 36, 210, 290, 11, .25)
      + current(side, pale, 7, 150, 350, 11, .45)],
    ['Long swell', () => current(main, blue, 48, 440, 260, 22, .32)],
    ['Double crest', () => current(main, blue, 34, 100, 330, 13, .38)
      + current(main, blue, 26, 60, 370, 13, .3, -145)],
    ['Undertow', () => current(main, deep, 50, 250, 280, 17, .55)
      + current(side, blue, 18, 190, 340, 17, .38, -180)],
    ['Bank to bank', () => current(side, pale, 22, 180, 300, 15, .34)
      + current(main, blue, 32, 180, 300, 15, .48, -240)],
    ['Soft shoulders', () => current(main, blue, 58, 250, 320, 19, .16)
      + current(main, blue, 35, 225, 345, 19, .24, -12)
      + current(main, pale, 14, 185, 385, 19, .18, -32)],
    ['Glass tide', () => current(side, pale, 20, 310, 430, 25, .29)],
    ['Following swell', () => current(main, blue, 44, 220, 420, 17, .38)
      + current(main, pale, 16, 60, 580, 17, .28, -280)],
    ['Cross current', () => current(main, blue, 36, 175, 245, 11, .35)
      + current(side, pale, 21, 280, 340, 24, .23)],
    ['Deep roll', () => current(main, deep, 66, 300, 380, 20, .48)
      + current(main, blue, 48, 300, 380, 20, .34, -340)]
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
