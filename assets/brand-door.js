(() => {
  const section = document.querySelector('#brand-door-study');
  if (!section) return;
  const svg = section.querySelector('svg');
  const scene = svg.querySelector('[data-door-scene]');
  const panel = svg.querySelector('[data-door-panel]');
  const edge = svg.querySelector('[data-door-edge]');
  const plate = svg.querySelector('[data-door-plate]');
  const collar = svg.querySelector('[data-door-collar]');
  const lever = svg.querySelector('[data-door-lever]');
  const latch = svg.querySelector('[data-door-latch]');
  const stars = svg.querySelector('[data-door-stars]');
  const controls = section.querySelector('.brand-door-study__controls');
  const pause = section.querySelector('[data-door-pause]');
  const choices = [...section.querySelectorAll('[data-door-variant]')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const variants = {
    reference: {name: '01 · Reference', flip: false, angle: 54.7, paper: '#ffffff', ink: '#303033', floor: '#4b4c4f', sky: '#000000', haze: '#7472a6'},
    mirror: {name: '02 · Mirror', flip: true, angle: 45, paper: '#ffffff', ink: '#303033', floor: '#4b4c4f', sky: '#000000', haze: '#7472a6'},
    ocean: {name: '03 · Ocean', flip: false, angle: 54.7, paper: '#f8fbfa', ink: '#243a53', floor: '#8b9d9f', sky: '#071f2d', haze: '#518d88'},
    midnight: {name: '04 · Midnight', flip: true, angle: 45, paper: '#000000', ink: '#38383c', floor: '#38383c', sky: '#000000', haze: '#7472a6'}
  };
  let current = variants.reference;
  let frame, lastTime, elapsed = 0, inView = false, stopped = false;
  const ns = 'http://www.w3.org/2000/svg';
  let seed = 46271;
  const random = () => {seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296;};
  // Build this small texture once. A moving SVG turbulence filter repaints the
  // whole portal; a cached pattern keeps the grain quiet and the door fluid.
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 96;
  const paint = canvas.getContext('2d');
  const pixels = paint.createImageData(96,96);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const value = Math.floor(random()*256);
    pixels.data[i] = pixels.data[i+1] = pixels.data[i+2] = value;
    pixels.data[i+3] = 20;
  }
  paint.putImageData(pixels,0,0);
  svg.querySelector('[data-door-grain]').setAttribute('href',canvas.toDataURL('image/png'));
  // Replace the three static fallback stars with the full procedural field.
  stars.replaceChildren();
  for (let i = 0; i < 84; i++) {
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', 243 + random() * 236);
    dot.setAttribute('cy', 109 + random() * 488);
    dot.setAttribute('r', .3 + random() * .65);
    dot.setAttribute('fill', '#d6dce9');
    dot.setAttribute('opacity', .08 + random() * .18);
    stars.append(dot);
  }
  const bright = [];
  [[464,207,2.1,'#fff4c9'],[451,317,1.7,'#fff4c9'],[445,377,1.5,'#d6e4ff'],[444,523,3.1,'#e2eaff'],[442,541,1.8,'#b9d4ff'],[463,541,.8,'#c7d8ff']].forEach(([x,y,r,color], i) => {
    const group = document.createElementNS(ns, 'g');
    group.innerHTML = `<circle cx="${x}" cy="${y}" r="${r * 3.4}" fill="${color}" opacity=".18" filter="url(#door-star-blur)"/><path d="M${x-r*2} ${y}h${r*4}M${x} ${y-r*2}v${r*4}" fill="none" stroke="${color}" stroke-width=".9" opacity=".3"/><circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
    bright.push(group); stars.append(group);
  });
  // Measured from the six-second reference, with monotone Hermite interpolation.
  const samples = [[0,0],[.2,0],[.4,6],[.6,17],[.8,34],[1,48],[1.2,54],[1.4,55],[4,55],[4.2,54],[4.4,48],[4.6,35],[4.8,19],[5,7],[5.2,0],[6,0]];
  const slope = i => {
    if (i === 0 || i === samples.length - 1) return 0;
    const a = (samples[i][1] - samples[i-1][1]) / (samples[i][0] - samples[i-1][0]);
    const b = (samples[i+1][1] - samples[i][1]) / (samples[i+1][0] - samples[i][0]);
    return a * b <= 0 ? 0 : 2 * a * b / (a + b);
  };
  const angleAt = seconds => {
    const i = Math.max(0, samples.findIndex((point, index) => index < samples.length - 1 && seconds < samples[index + 1][0]));
    const [t0,a] = samples[i], [t1,b] = samples[i+1];
    const span = t1 - t0, u = (seconds - t0) / span;
    return ((2*u**3-3*u**2+1)*a + (u**3-2*u**2+u)*span*slope(i) + (-2*u**3+3*u**2)*b + (u**3-u**2)*span*slope(i+1)) * current.angle / 55;
  };
  const fmt = n => n.toFixed(3);
  const draw = (degrees, seconds) => {
    const angle = degrees * Math.PI / 180, sine = Math.sin(angle), cosine = Math.cos(angle);
    const project = (u, y) => {
      const scale = 1 / (1 - u * sine / 1375);
      return [239 + u * cosine * scale, 365 + (y - 365) * scale];
    };
    const p = (u,y) => project(u,y).map(fmt).join(' ');
    const freeTop = project(245,105), freeBottom = project(245,601);
    // Fixed hinge, perspective-scaled free edge; the return has actual thickness.
    panel.setAttribute('d', `M${p(0,105)}Q${p(123,104.6)} ${p(245,105)}L${p(245,601)}Q${p(122,601.4)} ${p(0,601)}Z`);
    const thickness = 17 * sine;
    edge.setAttribute('d', `M${freeTop.map(fmt).join(' ')}l${fmt(thickness)} ${fmt(4*sine)}L${fmt(freeBottom[0]+thickness)} ${fmt(freeBottom[1]-3*sine)}L${freeBottom.map(fmt).join(' ')}Z`);
    edge.setAttribute('opacity', sine > .005 ? '1' : '0');
    plate.setAttribute('d', `M${p(187,350)}L${p(208,350.3)}L${p(208,394)}L${p(187,393.5)}Z`);
    const root = project(195,364), scale = 1 / (1 - 195*sine/1375);
    collar.setAttribute('cx', fmt(root[0])); collar.setAttribute('cy', fmt(root[1]));
    collar.setAttribute('rx', fmt(4.5 * Math.max(.5,cosine)*scale)); collar.setAttribute('ry', fmt(5*scale));
    // The lever projects out from its backplate, rather than being pasted flat.
    const end = root[0] - 7*sine, tip = end - 32*(.76+.24*cosine), cy = root[1], half = 4.6*scale;
    lever.setAttribute('d', `M${fmt(tip+4)} ${fmt(cy-half)}Q${fmt(tip-1)} ${fmt(cy-half)} ${fmt(tip-1)} ${fmt(cy)}Q${fmt(tip-1)} ${fmt(cy+half)} ${fmt(tip+4)} ${fmt(cy+half)}L${fmt(end)} ${fmt(cy+half)}Q${fmt(end+4)} ${fmt(cy+half)} ${fmt(end+4)} ${fmt(cy)}Q${fmt(end+4)} ${fmt(cy-half)} ${fmt(end)} ${fmt(cy-half)}Z`);
    const lx = freeTop[0] + thickness * .38;
    latch.setAttribute('d', `M${fmt(lx)} 355h${fmt(Math.max(.1,4*sine))}v31h-${fmt(Math.max(.1,4*sine))}Z`);
    latch.setAttribute('opacity', sine > .1 ? '1' : '0');
    stars.setAttribute('transform', `translate(0 ${fmt(-1.5*Math.sin(seconds*Math.PI/3))})`);
    bright.forEach((star,i) => star.setAttribute('opacity', fmt(.8+.2*Math.sin(seconds*.8+i))));
    svg.dataset.angle = fmt(degrees);
    svg.dataset.phase = fmt(seconds);
  };
  const cancel = () => {cancelAnimationFrame(frame); frame = undefined; lastTime = undefined;};
  const tick = time => {
    if (lastTime !== undefined) elapsed += Math.min(time - lastTime, 100);
    lastTime = time;
    const seconds = elapsed % 6000 / 1000;
    draw(angleAt(seconds), seconds);
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    cancel();
    pause.textContent = stopped ? 'Play' : 'Pause';
    pause.setAttribute('aria-pressed', String(stopped));
    pause.hidden = preference.matches;
    section.querySelector('[data-door-replay]').hidden = preference.matches;
    if (preference.matches) draw(current.angle, 1.4);
    else if (inView && !document.hidden && !stopped) frame = requestAnimationFrame(tick);
  };
  choices.forEach(button => button.addEventListener('click', () => {
    current = variants[button.dataset.doorVariant]; elapsed = 0;
    choices.forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
    scene.setAttribute('transform', current.flip ? 'translate(720 0) scale(-1 1)' : '');
    svg.style.setProperty('--door-paper', current.paper); svg.style.setProperty('--door-ink', current.ink);
    svg.style.setProperty('--door-floor', current.floor); svg.style.setProperty('--door-sky', current.sky); svg.style.setProperty('--door-haze', current.haze);
    section.querySelector('output').textContent = current.name;
    draw(preference.matches || stopped ? current.angle : 0, 0); sync();
  }));
  pause.addEventListener('click', () => {stopped = !stopped; sync();});
  section.querySelector('[data-door-replay]').addEventListener('click', () => {elapsed = 0; stopped = false; draw(0,0); sync();});
  const observer = new IntersectionObserver(entries => {inView = entries[0].isIntersecting; sync();}, {threshold:.1});
  observer.observe(svg);
  document.addEventListener('visibilitychange', sync);
  preference.addEventListener('change', sync);
  addEventListener('pagehide', cancel);
  addEventListener('pageshow', sync);
  controls.hidden = false;
  draw(preference.matches ? current.angle : 0, 0); sync();
})();
