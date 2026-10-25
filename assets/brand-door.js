(() => {
  const section = document.querySelector('#brand-door-study,[data-moon-door]');
  if (!section) return;
  const standalone = section.hasAttribute('data-moon-door');
  const svg = section.querySelector('svg');
  const scene = svg.querySelector('[data-door-scene]');
  const panel = svg.querySelector('[data-door-panel]');
  const edge = svg.querySelector('[data-door-edge]');
  const plate = svg.querySelector('[data-door-plate]');
  const collar = svg.querySelector('[data-door-collar]');
  const lever = svg.querySelector('[data-door-lever]');
  const latch = svg.querySelector('[data-door-latch]');
  const stars = svg.querySelector('[data-door-stars]');
  const portal = stars.parentElement;
  const portalClip = svg.querySelector('#door-portal-clip');
  const floor = scene.querySelector('path');
  const controls = section.querySelector('.brand-door-study__controls');
  const pause = section.querySelector('[data-door-pause]');
  const choices = [...section.querySelectorAll('[data-door-variant]')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const originalDescription = svg.querySelector('desc').textContent;
  const variants = {
    reference: {name: '01 · Reference', flip: false, angle: 54.7, paper: '#ffffff', ink: '#303033', floor: '#4b4c4f', sky: '#000000', haze: '#7472a6'},
    mirror: {name: '02 · Mirror', flip: true, angle: 45, paper: '#ffffff', ink: '#303033', floor: '#4b4c4f', sky: '#000000', haze: '#7472a6'},
    ocean: {name: '03 · Ocean', flip: false, angle: 54.7, paper: '#f8fbfa', ink: '#243a53', floor: '#8b9d9f', sky: '#071f2d', haze: '#518d88'},
    midnight: {name: '04 · Midnight', flip: true, angle: 45, paper: '#000000', ink: '#38383c', floor: '#38383c', sky: '#000000', haze: '#7472a6'},
    arch: {name: '05 · Moon arch', shape:'arch', tide:true, flip:false, angle:67, paper:'#ffffff', ink:'#243a53', floor:'#8c9da9', sky:'#061628', haze:'#0D4687'},
    round: {name: '06 · Round portal', shape:'round', tide:true, flip:false, angle:66, paper:'#ffffff', ink:'#243a53', floor:'#8c9da9', sky:'#061628', haze:'#0D4687'},
    oval: {name: '07 · Oval tide', shape:'oval', tide:true, flip:false, angle:68, paper:'#ffffff', ink:'#243a53', floor:'#8c9da9', sky:'#061628', haze:'#0D4687'},
    facet: {name: '08 · Coastal facet', shape:'facet', tide:true, flip:false, angle:64, paper:'#ffffff', ink:'#243a53', floor:'#8c9da9', sky:'#061628', haze:'#0D4687'}
  };
  let current = standalone ? variants.arch : variants.reference;
  let frame, lastTime, elapsed = 0, inView = false, stopped = false, menuBlocked = false;
  const ns = 'http://www.w3.org/2000/svg';
  const tide = svg.querySelector('[data-door-tide]') || document.createElementNS(ns,'g');
  tide.setAttribute('data-door-tide','');
  tide.setAttribute('display','none');
  tide.innerHTML = '<g data-tide-stars></g><g data-door-moon><circle r="33" fill="url(#door-moon-halo)"/><circle r="18" fill="#f2f1dc" mask="url(#door-moon-mask)"/></g><path data-sea-back fill="#0D4687" opacity=".7"/><path data-sea-front fill="#0D4687"/><path data-sea-foam fill="none" stroke="#aacbe7" stroke-width="1.1" opacity=".6"/><path data-sea-reflection fill="none" stroke="#e6ecd9" stroke-width="1.2" stroke-linecap="round" opacity=".3"/>';
  if (!svg.querySelector('#door-moon-mask')) svg.querySelector('defs').insertAdjacentHTML('beforeend','<radialGradient id="door-moon-halo"><stop stop-color="#e1e8dc" stop-opacity=".13"/><stop offset="1" stop-color="#e1e8dc" stop-opacity="0"/></radialGradient><mask id="door-moon-mask" maskUnits="userSpaceOnUse" x="-35" y="-35" width="70" height="70"><circle r="18" fill="white"/><circle cx="8" cy="-5" r="17" fill="black"/></mask>');
  portal.append(tide);
  const tideStars = tide.querySelector('[data-tide-stars]');
  const moon = tide.querySelector('[data-door-moon]');
  const seaBack = tide.querySelector('[data-sea-back]');
  const seaFront = tide.querySelector('[data-sea-front]');
  const seaFoam = tide.querySelector('[data-sea-foam]');
  const reflection = tide.querySelector('[data-sea-reflection]');
  let doorTime = 0, doorTarget = 0, scrollFrame = 0;
  let profile;
  const shapeProfile = shape => {
    const box = shape === 'round' ? {left:182,top:241,width:360,height:360} : {left:239,top:105,width:245,height:496};
    const {width:w,height:h}=box;
    let outline=[],right=[];
    if(shape==='round'||shape==='oval'){
      for(let i=0;i<96;i++){const a=-Math.PI/2+i*Math.PI/48;outline.push([w/2+w/2*Math.cos(a),box.top+h/2+h/2*Math.sin(a)]);}
      right=outline.slice(0,49);
    }else if(shape==='arch'){
      const radius=w/2,spring=box.top+radius;
      outline.push([0,601],[0,spring]);
      for(let i=1;i<=48;i++){const a=Math.PI+i*Math.PI/48;outline.push([radius+radius*Math.cos(a),spring+radius*Math.sin(a)]);}
      outline.push([w,601]);right=outline.slice(25);
    }else{
      const cut=31;
      outline=[[cut,box.top],[w-cut,box.top],[w,box.top+cut],[w,601-cut],[w-cut,601],[cut,601],[0,601-cut],[0,box.top+cut]];
      right=outline.slice(1,5);
    }
    const rightAt = y => shape==='round'||shape==='oval' ? w/2+w/2*Math.sqrt(Math.max(0,1-((y-(box.top+h/2))/(h/2))**2)) : w;
    return {...box,outline,right,rightAt};
  };
  const outlinePath = points => 'M'+points.map(point=>point.map(value=>value.toFixed(3)).join(' ')).join('L')+'Z';
  const configurePortal = () => {
    profile=current.tide?shapeProfile(current.shape):undefined;
    const shapeName={arch:'arched',round:'circular',oval:'oval',facet:'faceted'}[current.shape];
    svg.querySelector('title').textContent=current.tide?`Moonlit ocean — ${shapeName} door`:'A door to possibility';
    svg.querySelector('desc').textContent=current.tide?`A white ${shapeName} door with a lever handle opens onto moving ocean waves, a crescent moon and a starry night sky.`:originalDescription;
    tide.setAttribute('display',current.tide?'inline':'none');
    stars.style.display=current.tide?'none':'';
    const b=profile||{left:239,top:105,width:245,height:496};
    portal.querySelectorAll(':scope > rect').forEach(rect=>{
      rect.setAttribute('x',b.left);rect.setAttribute('y',b.top);rect.setAttribute('width',b.width);rect.setAttribute('height',b.height);
    });
    const haze=portal.querySelector('ellipse');
    haze.setAttribute('cx',b.left+b.width*218/245);haze.setAttribute('cy',b.top+b.height*239/496);
    haze.setAttribute('rx',b.width*90/245);haze.setAttribute('ry',b.height*260/496);
    portalClip.innerHTML=profile?`<path d="${outlinePath(profile.outline.map(([u,y])=>[b.left+u,y]))}"/>`:'<rect x="239" y="105" width="245" height="496"/>';
    floor.setAttribute('d',profile?`M0 601Q${b.left/2} 600 ${b.left-9} 601M${b.left+b.width} 601Q${(b.left+b.width+720)/2} 600 720 601`:'M0 601Q104 600 230 601M484 601Q608 600 720 601');
    if(!profile)return;
    moon.setAttribute('transform',`translate(${b.left+b.width*.825} ${b.top+b.height*.275})`);
    let sky='';let starSeed=91823;
    const sample=()=>{starSeed=(Math.imul(starSeed,1664525)+1013904223)>>>0;return starSeed/4294967296;};
    for(let i=0;i<75;i++)sky+=`<circle cx="${b.left+sample()*b.width}" cy="${b.top+sample()*b.height*.58}" r="${.35+sample()*1.05}" fill="#dce9fb" opacity="${.25+sample()*.5}"/>`;
    tideStars.innerHTML=sky;
  };
  const wavePath = (y,time,amplitude) => {
    const points=[],start=profile.left-4,end=profile.left+profile.width+4;
    for(let x=start;x<=end+8;x+=8)points.push(`${x.toFixed(3)} ${(y+amplitude*Math.sin((x-start)/39-time*.7)+amplitude*.35*Math.sin(x/23+time*.45)).toFixed(3)}`);
    return {line:'M'+points.join('L'),end:end+8,start};
  };
  const drawTide = seconds => {
    if(!profile)return;
    const baseline=profile.top+profile.height*.59+3*Math.sin(seconds*.55);
    const back=wavePath(baseline-11,seconds*.8,6),front=wavePath(baseline+11,seconds+1.4,5);
    seaBack.setAttribute('d',`${back.line}L${back.end} 607H${back.start}Z`);
    seaFront.setAttribute('d',`${front.line}L${front.end} 607H${front.start}Z`);
    seaFoam.setAttribute('d',wavePath(baseline+12,seconds+1.4,5).line);
    const center=profile.left+profile.width*.825;
    let glints='';
    for(let i=0;i<5;i++){const y=baseline+24+i*14,x=center+3*Math.sin(seconds*.6+i),half=3+i*1.7;glints+=`M${(x-half).toFixed(3)} ${y.toFixed(3)}q${half.toFixed(3)} ${(Math.sin(seconds*.8+i)*1.8).toFixed(3)} ${(half*2).toFixed(3)} 0`;}
    reflection.setAttribute('d',glints);
    tideStars.setAttribute('opacity',(.84+.12*Math.sin(seconds*.6)).toFixed(3));
  };
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
      const left=profile?profile.left:239,vanish=profile?profile.top+profile.height*260/496:365;
      return [left + u * cosine * scale, vanish + (y - vanish) * scale];
    };
    const p = (u,y) => project(u,y).map(fmt).join(' ');
    const freeTop = project(245,105), freeBottom = project(245,601);
    // Fixed hinge, perspective-scaled free edge; the return has actual thickness.
    panel.setAttribute('d', profile?outlinePath(profile.outline.map(([u,y])=>project(u,y))):`M${p(0,105)}Q${p(123,104.6)} ${p(245,105)}L${p(245,601)}Q${p(122,601.4)} ${p(0,601)}Z`);
    const thickness = 17 * sine * (profile?profile.height/496:1);
    if(profile){
      const front=profile.right.map(([u,y])=>project(u,y));
      const back=front.map(([x,y])=>[x+thickness,y+(profile.top+profile.height*.524-y)*.015*sine]);
      edge.setAttribute('d',outlinePath([...front,...back.reverse()]));
    }else edge.setAttribute('d', `M${freeTop.map(fmt).join(' ')}l${fmt(thickness)} ${fmt(4*sine)}L${fmt(freeBottom[0]+thickness)} ${fmt(freeBottom[1]-3*sine)}L${freeBottom.map(fmt).join(' ')}Z`);
    edge.setAttribute('opacity', sine > .005 ? '1' : '0');
    const hu=profile?profile.width*195/245:195,hy=profile?profile.top+profile.height*259/496:364;
    const face=(u,y)=>profile?p(profile.width*u/245,profile.top+profile.height*(y-105)/496):p(u,y);
    plate.setAttribute('d', `M${face(187,350)}L${face(208,350.3)}L${face(208,394)}L${face(187,393.5)}Z`);
    const root = project(hu,hy), scale = 1 / (1 - hu*sine/1375);
    collar.setAttribute('cx', fmt(root[0])); collar.setAttribute('cy', fmt(root[1]));
    collar.setAttribute('rx', fmt(4.5 * Math.max(.5,cosine)*scale)); collar.setAttribute('ry', fmt(5*scale));
    // The lever projects out from its backplate, rather than being pasted flat.
    const handleScale=profile?Math.min(1.2,profile.width/245):1;
    const end = root[0] - 7*sine, tip = end - 32*(.76+.24*cosine)*handleScale, cy = root[1], half = 4.6*scale;
    lever.setAttribute('d', `M${fmt(tip+4)} ${fmt(cy-half)}Q${fmt(tip-1)} ${fmt(cy-half)} ${fmt(tip-1)} ${fmt(cy)}Q${fmt(tip-1)} ${fmt(cy+half)} ${fmt(tip+4)} ${fmt(cy+half)}L${fmt(end)} ${fmt(cy+half)}Q${fmt(end+4)} ${fmt(cy+half)} ${fmt(end+4)} ${fmt(cy)}Q${fmt(end+4)} ${fmt(cy-half)} ${fmt(end)} ${fmt(cy-half)}Z`);
    const lx = freeTop[0] + thickness * .38;
    if(profile){
      const y1=profile.top+profile.height*250/496,y2=profile.top+profile.height*281/496;
      const a=project(profile.rightAt(y1),y1),b=project(profile.rightAt(y2),y2),offset=thickness*.38,width=thickness*.23;
      latch.setAttribute('d',outlinePath([[a[0]+offset,a[1]],[a[0]+offset+width,a[1]],[b[0]+offset+width,b[1]],[b[0]+offset,b[1]]]));
    }else latch.setAttribute('d', `M${fmt(lx)} 355h${fmt(Math.max(.1,4*sine))}v31h-${fmt(Math.max(.1,4*sine))}Z`);
    latch.setAttribute('opacity', sine > .1 ? '1' : '0');
    stars.setAttribute('transform', `translate(0 ${fmt(-1.5*Math.sin(seconds*Math.PI/3))})`);
    bright.forEach((star,i) => star.setAttribute('opacity', fmt(.8+.2*Math.sin(seconds*.8+i))));
    drawTide(seconds);
    svg.dataset.angle = fmt(degrees);
    svg.dataset.phase = fmt(seconds);
  };
  const cancel = () => {cancelAnimationFrame(frame); frame = undefined; lastTime = undefined;};
  const tick = time => {
    const delta = lastTime === undefined ? 0 : Math.min(time - lastTime, 100);
    elapsed += delta;
    lastTime = time;
    const seconds = standalone ? elapsed/1000 : elapsed % (current.tide?8000:6000) / 1000;
    if (standalone) {
      // Scroll only triggers a complete timed reveal or its reverse.
      doorTime = doorTarget ? Math.min(1400,doorTime+delta) : Math.max(0,doorTime-delta);
    }
    const motionSeconds=standalone?doorTime/1000:current.tide?(seconds<=1.4?seconds:seconds<6?1.4+(seconds-1.4)*2.6/4.6:seconds-2):seconds;
    draw(angleAt(motionSeconds), seconds);
    if (standalone) section.dataset.doorState=doorTime===1400?'open':doorTime===0?'closed':doorTarget?'opening':'closing';
    if (!standalone || inView || doorTime!==doorTarget*1400) frame = requestAnimationFrame(tick);
    else cancel();
  };
  const sync = () => {
    cancel();
    if (pause) {
      pause.textContent = stopped ? 'Play' : 'Pause';
      pause.setAttribute('aria-pressed', String(stopped));
      pause.hidden = preference.matches;
    }
    const replay=section.querySelector('[data-door-replay]');
    if (replay) replay.hidden = preference.matches;
    if (preference.matches) {draw(current.angle, 1.4);if(standalone){doorTime=1400;section.dataset.doorState='open';}}
    else if ((inView || standalone&&doorTime!==doorTarget*1400) && !document.hidden && !stopped && !menuBlocked) frame = requestAnimationFrame(tick);
  };
  choices.forEach(button => button.addEventListener('click', () => {
    current = variants[button.dataset.doorVariant]; elapsed = current.tide&&(preference.matches||stopped)?1400:0;
    configurePortal();
    choices.forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
    scene.setAttribute('transform', current.flip ? 'translate(720 0) scale(-1 1)' : '');
    svg.style.setProperty('--door-paper', current.paper); svg.style.setProperty('--door-ink', current.ink);
    svg.style.setProperty('--door-floor', current.floor); svg.style.setProperty('--door-sky', current.sky); svg.style.setProperty('--door-haze', current.haze);
    section.querySelector('output').textContent = current.name;
    draw(preference.matches || stopped ? current.angle : 0, 0); sync();
  }));
  pause?.addEventListener('click', () => {stopped = !stopped; sync();});
  section.querySelector('[data-door-replay]')?.addEventListener('click', () => {elapsed = 0; stopped = false; draw(0,0); sync();});
  function measureScroll() {
    scrollFrame=0;
    const box=svg.getBoundingClientRect();
    const overlap=Math.max(0,Math.min(box.bottom,innerHeight)-Math.max(box.top,0));
    inView=overlap/box.height>=.18;
    // A small trigger gap prevents repeated toggles around the entry boundary.
    if (box.top<=innerHeight*.82) doorTarget=1;
    else if (box.top>=innerHeight*.88) doorTarget=0;
    if (preference.matches) {sync();return;}
    if (!frame) sync();
  }
  const requestScroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(measureScroll);};
  const observer = new IntersectionObserver(entries => {if(standalone)measureScroll();else{inView=entries[0].isIntersecting;sync();}}, {threshold:standalone?[0,.18]:.1});
  observer.observe(svg);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('hoea:site-menu', event => {menuBlocked=event.detail.open;sync();});
  preference.addEventListener('change', standalone?measureScroll:sync);
  if (standalone) {addEventListener('scroll',requestScroll,{passive:true});addEventListener('resize',requestScroll,{passive:true});}
  addEventListener('pagehide', cancel);
  addEventListener('pageshow', sync);
  if (standalone) {configurePortal();section.dataset.doorState='closed';}
  if (controls) controls.hidden = false;
  if (pause) pause.hidden = preference.matches;
  draw(preference.matches ? current.angle : 0, 0); sync();
})();
