/* A measured, scroll-led river. Geometry is cached; idle frames do no JS work. */
(() => {
  window.createAnnaRiver=(root,items)=>{
    const ns='http://www.w3.org/2000/svg',pin=root.querySelector('.anna-pin');
    const svg=document.createElementNS(ns,'svg');
    svg.classList.add('anna-river');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    svg.innerHTML=`<defs>${[['water','#eaf1ed'],['bank','#526b68']].map(([name,colour])=>`<linearGradient id="anna-river-${name}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${colour}" stop-opacity="0"/><stop offset=".035" stop-color="${colour}"/><stop offset=".965" stop-color="${colour}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></linearGradient>`).join('')}</defs>
      <g class="river-water"></g><g class="river-banks"></g><g class="river-shore"></g><g class="river-currents"></g>
      <g class="river-kayak">
        <g class="river-wake"><path d="M-5-21Q-11-34-17-49M5-21Q11-34 17-49"/><path d="M-4-26Q-7-38-8-53M4-26Q7-38 8-53"/></g>
        <g class="river-kayak__float" id="anna-current-waka">
          <path class="river-kayak__hull" d="M0 28C-4 23-8 12-8-2C-8-14-4-24 0-29C4-24 8-14 8-2C8 12 4 23 0 28Z"/>
          <path class="river-kayak__seam" d="M0 24V13M0-15V-25M-5 15 5 20M5 15-4 20M-5-17 5-21M5-17-4-21"/>
          <ellipse class="river-kayak__cockpit" cx="0" cy="-1" rx="4.8" ry="9"/>
          <path class="river-kayak__person" d="M-3-4Q0-7 3-4L2 3H-2Z"/><circle class="river-kayak__head" cx="0" cy="5" r="2.5"/>
          <g class="river-design-details"></g>
          <g class="river-paddle-splashes" fill="none" stroke="#b8d9e9" stroke-width=".8"><path data-paddle-splash="left" d="M-27-5Q-31 0-27 5M-30-7Q-35 0-30 7"/><path data-paddle-splash="right" d="M27-5Q31 0 27 5M30-7Q35 0 30 7"/></g>
          <g class="river-paddle"><path d="M-20 0H20"/><path class="river-paddle__blade" data-paddle-blade="left" d="M-18-1.2L-23-3Q-29-3-28 0Q-29 3-23 3L-18 1.2Z"/><path class="river-paddle__blade" data-paddle-blade="right" d="M18-1.2L23-3Q29-3 28 0Q29 3 23 3L18 1.2Z"/></g>
        </g>
      </g>`;
    pin.prepend(svg);
    const ocean=document.createElementNS(ns,'svg');
    ocean.classList.add('anna-ocean-cut');ocean.setAttribute('aria-hidden','true');
    ocean.innerHTML='<defs><clipPath id="anna-ocean-crack"><path/></clipPath></defs><rect clip-path="url(#anna-ocean-crack)" fill="#0D4687"/>';
    root.prepend(ocean);
    const boat=svg.querySelector('.river-kayak'),paddle=svg.querySelector('.river-paddle');
    const blades=[...svg.querySelectorAll('[data-paddle-blade]')],splashes=[...svg.querySelectorAll('[data-paddle-splash]')];
    let paddlePhase=0;
    const originalHull=svg.querySelector('.river-kayak__hull').getAttribute('d');
    const designs=[
      {name:'Original',hull:originalHull,fill:'#f6e7c7',edge:'#342a22',blade:'round'},
      {name:'Cedar canoe',hull:'M0 34C-10 22-12-17 0-36C12-17 10 22 0 34Z',fill:'#b67847',edge:'#342a22',blade:'leaf',detail:'M-6-20H6M-8-12H8M-8 13H8M-6 22H6'},
      {name:'Ivory touring',hull:'M0 38C-3 31-7 6-6-10Q-5-29 0-39Q5-29 6-10C7 6 3 31 0 38Z',fill:'#fff9e9',edge:'#273f50',blade:'slim',detail:'M0-34V-15M0 15V32'},
      {name:'Coral explorer',hull:'M0 29Q-12 20-11-3Q-10-22 0-31Q10-22 11-3Q12 20 0 29Z',fill:'#e99b7f',edge:'#4b3032',blade:'square',detail:'M-7-13Q0-18 7-13M-7 16Q0 21 7 16'},
      {name:'Forest canoe',hull:'M0 34Q-11 26-10-12L-6-27L0-35L6-27L10-12Q11 26 0 34Z',fill:'#41685b',edge:'#e7dcc0',blade:'leaf',detail:'M-7-18H7M-8 17H8M0-30V-22M0 24V29'},
      {name:'Golden sprint',hull:'M0 42C-6 25-5-22 0-43C5-22 6 25 0 42Z',fill:'#e9bc57',edge:'#423a29',blade:'slim',detail:'M0-37V-14M0 14V35'},
      {name:'Ocean blue',hull:'M0 33C-12 16-9-21 0-35C9-21 12 16 0 33Z',fill:'#8cc8d5',edge:'#153b55',blade:'square',detail:'M-6-17L0-23L6-17M-6 18L0 24L6 18'},
      {name:'Outrigger',hull:'M0 36C-7 22-7-22 0-37C7-22 7 22 0 36Z',fill:'#e5c18e',edge:'#3e342a',blade:'leaf',detail:'M-5-15H-19M-5 15H-19M-19-29Q-25 0-19 29Q-15 0-19-29Z'},
      {name:'Twin hull',hull:'M-7 34Q-15 0-7-35Q1 0-7 34ZM7 34Q-1 0 7-35Q15 0 7 34Z',fill:'#f0e9d5',edge:'#425668',blade:'square',detail:'M-8-13H8M-8 14H8'},
      {name:'Midnight',hull:'M0 36L-8 19L-9-12L-5-27L0-38L5-27L9-12L8 19Z',fill:'#243a53',edge:'#edd8a7',blade:'slim',detail:'M0-32V-17M-6 20L0 28L6 20'}
    ];
    const control=document.createElement('div');control.className='anna-waka-controls';
    control.innerHTML='<svg class="anna-waka-preview" viewBox="-42 -48 84 96" aria-hidden="true"></svg><div><div class="anna-waka-controls__title">Waka & paddle <span aria-live="polite" data-waka-name></span></div><div class="anna-waka-options" role="group" aria-label="Waka and paddle designs">'+designs.map((d,i)=>`<button type="button" data-waka-design="${i}" aria-label="${String(i+1).padStart(2,'0')}: ${d.name}" aria-pressed="${i===0}" title="${d.name}">${String(i+1).padStart(2,'0')}</button>`).join('')+'</div></div>';
    root.querySelector('.anna-studies').after(control);
    const preview=control.querySelector('.anna-waka-preview');
    function selectDesign(index){
      const design=designs[index];
      svg.dataset.wakaDesign=String(index+1);
      svg.querySelector('.river-kayak__hull').setAttribute('d',design.hull);
      svg.style.setProperty('--waka-fill',design.fill);svg.style.setProperty('--waka-edge',design.edge);
      const detail=svg.querySelector('.river-design-details');
      detail.innerHTML=`<path d="${design.detail||''}" fill="none" stroke="${design.edge}" stroke-width=".9"/>`;
      const bladeShapes={round:'M18-1.2L23-3Q29-3 28 0Q29 3 23 3L18 1.2Z',leaf:'M18-1Q24-7 30 0Q24 7 18 1Z',slim:'M18-1L29-2Q32 0 29 2L18 1Z',square:'M18-1L22-4L29-4L30 4L22 4L18 1Z'};
      blades.forEach((blade,i)=>{blade.setAttribute('d',bladeShapes[design.blade]);blade.dataset.mirror=i?1:-1;});
      control.querySelector('[data-waka-name]').textContent=design.name;
      control.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
      const source=svg.querySelector('.river-kayak__float'),copy=source.cloneNode(true);
      const originals=[source,...source.querySelectorAll('*')],copies=[copy,...copy.querySelectorAll('*')];
      copies.forEach((element,i)=>{
        const style=getComputedStyle(originals[i]);
        for(const property of ['fill','stroke','stroke-width','opacity','stroke-linecap','stroke-linejoin'])element.style.setProperty(property,style.getPropertyValue(property));
        element.removeAttribute('id');
        if(element.hasAttribute('class'))element.setAttribute('class',element.getAttribute('class').replaceAll('river-','preview-'));
        [...element.attributes].filter(attribute=>attribute.name.startsWith('data-')).forEach(attribute=>element.removeAttribute(attribute.name));
      });
      preview.replaceChildren(copy);
      preview.style.setProperty('--waka-fill',design.fill);preview.style.setProperty('--waka-edge',design.edge);
      paint();
    }
    control.querySelectorAll('button').forEach((button,i)=>button.addEventListener('click',()=>selectDesign(i)));
    const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n)),f=n=>Number(n.toFixed(3));
    const smooth=t=>t*t*t*(t*(t*6-15)+10);
    let samples=[],stops=[],length=0,armedAt=null,visible=false,reduced=false,angle=0,angularVelocity=0;
    const launch=72;
    let distance=launch,velocity=0,target=launch,width=0,height=0,mobile=false;
    const reached=items.map(()=>false);
    // Cubic interpolation keeps both pencil banks continuous through every bend.
    const curve=points=>points.map((p,i)=>{
      if(!i)return `M${f(p[0])} ${f(p[1])}`;
      const a=points[i-2]||points[i-1],b=points[i-1],c=p,d=points[i+1]||p;
      return `C${f(b[0]+(c[0]-a[0])/6)} ${f(b[1]+(c[1]-a[1])/6)} ${f(c[0]-(d[0]-b[0])/6)} ${f(c[1]-(d[1]-b[1])/6)} ${f(c[0])} ${f(c[1])}`;
    }).join('');
    function pointAt(value){
      if(!samples.length)return {x:0,y:0,slope:0};
      let lo=0,hi=samples.length-1;
      while(lo<hi){const mid=(lo+hi)>>1;if(samples[mid].s<value)lo=mid+1;else hi=mid;}
      const b=samples[lo],a=samples[Math.max(0,lo-1)],t=clamp((value-a.s)/(b.s-a.s||1));
      return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,slope:a.slope+(b.slope-a.slope)*t};
    }
    function build(bounds,box){
      width=box.width;height=box.height;mobile=innerWidth<=760;
      if(!width||!height)return;
      const centre=mobile?(root.dataset.timelineVariant==='thread2'?(width-56)*.65/1.65+28:40):width/2,amplitude=mobile?(root.dataset.timelineVariant==='thread2'?4:10):38,period=Math.max(600,height/2.35);
      root.style.setProperty('--river-centre',`${centre}px`);
      const xAt=y=>centre+amplitude*Math.sin(y/period*Math.PI*2+.2)+(mobile?2:7)*Math.sin(y/period*Math.PI*4+.7);
      const slopeAt=y=>amplitude*Math.cos(y/period*Math.PI*2+.2)*Math.PI*2/period+(mobile?2:7)*Math.cos(y/period*Math.PI*4+.7)*Math.PI*4/period;
      const halfAt=y=>(mobile?22:31)+Math.sin(y/period*5+.3)*(mobile?1.5:4);
      samples=[];length=0;const left=[],right=[];
      for(let y=28;y<=height-28;y+=8){
        const x=xAt(y),slope=slopeAt(y),previous=samples.at(-1),normal=1/Math.sqrt(1+slope*slope),half=halfAt(y);
        if(previous)length+=Math.hypot(x-previous.x,y-previous.y);
        samples.push({x,y,slope,s:length});
        left.push([x-half*normal,y+half*slope*normal]);right.push([x+half*normal,y-half*slope*normal]);
      }
      svg.setAttribute('viewBox',`0 0 ${f(width)} ${f(height)}`);
      // One continuous silhouette: broad ocean above, fractured shoulders, narrow passage below.
      const rootBox=root.getBoundingClientRect(),ox=box.left-rootBox.left,oy=box.top-rootBox.top,rw=rootBox.width,rh=rootBox.height;
      ocean.setAttribute('viewBox',`0 0 ${rw} ${rh}`);
      ocean.querySelector('rect').setAttribute('width',rw);ocean.querySelector('rect').setAttribute('height',rh);
      const banks=[[],[]];
      for(let y=0;y<=height;y+=10){
        const taper=mobile?0:Math.max(0,1-y/340),half=((mobile?17:38)+taper*(mobile?rw*.14:rw*.16))*Math.min(1,(height-y)/170+.025);
        for(let side=0;side<2;side++){
          const sign=side?1:-1;
          const rough=(Math.sin(y*.071+side*7)*5+Math.sin(y*.193+side*3)*3+Math.sin(y*.047)*7)*(mobile?.3:1);
          banks[side].push([ox+xAt(y)+sign*(half+rough),oy+y]);
        }
      }
      const shoulder=oy-180;
      const cutLeft=[[0,0],[0,shoulder+65],[rw*.04,shoulder+56],[rw*.075,shoulder+29],[rw*.1,shoulder+38],[rw*.14,shoulder+4],[rw*.17,shoulder-9],[rw*.205,shoulder-43],[rw*.23,shoulder-22],[rw*.25,shoulder+35],[rw*.27,shoulder+62],[rw*.29,shoulder+50],[rw*.31,shoulder+91],[rw*.34,shoulder+115],...banks[0]];
      const cutRight=[...banks[1].reverse(),[rw*.7,shoulder+126],[rw*.73,shoulder+104],[rw*.75,shoulder+111],[rw*.78,shoulder+62],[rw*.8,shoulder+49],[rw*.825,shoulder+6],[rw*.85,shoulder+17],[rw*.88,shoulder+34],[rw*.91,shoulder+26],[rw*.95,shoulder+49],[rw,shoulder+63],[rw,0]];
      const outline=[...cutLeft,...cutRight];
      const fractured=[];
      outline.forEach((p,i)=>{const previous=outline[i-1];if(previous&&p[1]>shoulder-10&&previous[1]>shoulder-10&&Math.hypot(p[0]-previous[0],p[1]-previous[1])>45){const steps=Math.ceil(Math.hypot(p[0]-previous[0],p[1]-previous[1])/16);for(let j=1;j<steps;j++){const t=j/steps;fractured.push([previous[0]+(p[0]-previous[0])*t+Math.sin(i*7+j*3)*3,previous[1]+(p[1]-previous[1])*t+Math.sin(i*3+j*7)*4]);}}fractured.push(p);});
      ocean.querySelector('clipPath path').setAttribute('d','M'+fractured.map(p=>p.map(f).join(' ')).join('L')+'Z');

      const ld=curve(left),rd=curve(right),water=ld+'L'+right.at(-1).map(f).join(' ')+curve([...right].reverse()).replace(/^M[^C]+/,'')+'Z';
      svg.querySelector('.river-water').innerHTML=`<path d="${water}"/>`;
      svg.querySelector('.river-banks').innerHTML=`<path d="${ld}"/><path d="${rd}"/><path class="river-pencil" d="${ld}" transform="translate(1.1 -.5)"/><path class="river-pencil" d="${rd}" transform="translate(-.8 .7)"/>`;
      let shore='',currents='',seed=472;
      const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      for(let y=70,i=0;y<height-60;y+=115+random()*55,i++){
        const side=i%2?1:-1,x=xAt(y)+side*(halfAt(y)+(mobile?9:16));
        if(i%3===0){
          shore+=`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(side*18)})"><path d="M0 11Q-1 0 0-10M0 7Q-8 0-8-7M0 6Q7-2 8-8M-1 9Q-5 5-10 5M1 9Q6 3 11 3"/><path class="river-pencil" d="M-2 12Q0 2 2-9"/></g>`;
        }else shore+=`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(random()*60-30)})"><path d="M-4-2Q-5-7 0-7Q6-5 5 1Q3 7-1 5Q-5 4-4-2Z"/><path class="river-pencil" d="M-1-4Q3-3 3 0"/><ellipse cx="${side*7}" cy="8" rx="2" ry="3.2"/></g>`;
        const cy=y+30,cx=xAt(cy)+(i%2?5:-7),s=slopeAt(cy);
        currents+=`<path d="M${f(cx-s*12)} ${f(cy-12)}Q${f(cx+2)} ${f(cy)} ${f(cx+s*15)} ${f(cy+15)}" style="--current-delay:${f(-random()*6)}s"/>`;
      }
      svg.querySelector('.river-shore').innerHTML=shore;svg.querySelector('.river-currents').innerHTML=currents;
      const globalTop=box.top+scrollY;
      stops=bounds.map((b,i)=>{
        const y=b.top+b.height/2-box.top,index=clamp(Math.floor((y-28)/8),0,samples.length-2),a=samples[index],beyond=samples[index+1],t=clamp((y-a.y)/(beyond.y-a.y));
        const p={y,x:a.x+(beyond.x-a.x)*t,s:a.s+(beyond.s-a.s)*t};
        items[i].style.setProperty('--river-node-x',`${f(p.x-centre)}px`);
        return {distance:p.s,y:p.y,globalY:globalTop+p.y};
      });
      if(armedAt===null)armedAt=scrollY;
      const passage=root.dataset.timelineVariant==='thread2';
      const release=passage?globalTop+28-innerHeight*.92:Math.max(globalTop+28-innerHeight*.34,armedAt+48);
      // Landings own a span of scrolling. Elapsed time only smooths tracking;
      // it never advances the boat beyond a stop by itself.
      stops.forEach((stop,i)=>{
        const arrival=stop.globalY-innerHeight*(passage?(mobile?.9:.82):.46);
        stop.arrival=passage?arrival:i?Math.max(arrival,stops[i-1].departure+100):Math.max(arrival,release+130);
        // Arrive in the lower reading area, then hold while the chapter moves toward centre.
        stop.departure=stop.arrival+(passage?Math.min(innerHeight*.18,(bounds[i].height+76)*.42):Math.min(mobile?88:110,(bounds[i].height+56)*.26));
      });
      svg.dataset.stops=JSON.stringify(stops);svg.dataset.release=String(release);
      distance=clamp(distance,0,length);target=clamp(target,0,length);
      setScroll(scrollY,visible,reduced);
    }
    function setScroll(y,isVisible,isReduced){
      visible=isVisible;reduced=isReduced;
      svg.classList.toggle('river-is-active',visible&&!reduced);
      if(!stops.length)return;
      const release=Number(svg.dataset.release);
      target=launch;
      if(y>release){
        let fromScroll=release,fromDistance=launch;
        for(const stop of stops){
          if(y<stop.arrival){target=fromDistance+(stop.distance-fromDistance)*smooth(clamp((y-fromScroll)/(stop.arrival-fromScroll)));break;}
          target=stop.distance;
          if(y<=stop.departure)break;
          fromScroll=stop.departure;fromDistance=stop.distance;
          if(stop===stops.at(-1))target=stop.distance+(Math.max(stop.distance,length-launch)-stop.distance)*smooth(clamp((y-stop.departure)/180));
        }
      }
      if(reduced){distance=stops[0].distance;velocity=0;angle=-Math.atan(pointAt(distance).slope)*180/Math.PI;angularVelocity=0;}
      else if(!visible){distance=target;velocity=0;angle=-Math.atan(pointAt(distance).slope)*180/Math.PI;angularVelocity=0;}
      arrivals();
    }
    function arrivals(){
      stops.forEach((stop,i)=>{
        const next=reduced||distance>=stop.distance-4;
        if(next!==reached[i]){reached[i]=next;items[i].classList.toggle('river-node-hit',next);}
      });
      const docked=stops.findIndex(stop=>Math.abs(distance-stop.distance)<4&&Math.abs(target-stop.distance)<.1);
      svg.dataset.stop=docked<0?'travelling':String(docked+1);
    }
    function critical(value,v,to,omega,dt){const change=value-to,c=v+omega*change,e=Math.exp(-omega*dt);return[to+(change+c*dt)*e,(v-omega*c*dt)*e];}
    function step(dt){
      if(!samples.length||reduced)return false;
      const previous=distance;
      const passage=root.dataset.timelineVariant==='thread2';
      [distance,velocity]=critical(distance,velocity,target,passage?46:15,dt);
      const max=(mobile?950:1200)*dt;
      if(!passage&&Math.abs(distance-previous)>max){distance=previous+Math.sign(distance-previous)*max;velocity=Math.sign(velocity)*(mobile?950:1200);}
      distance=clamp(distance,0,length);
      if(Math.abs(distance-target)<.015&&Math.abs(velocity)<.1){distance=target;velocity=0;}
      // A timed left/right cadence avoids frantic strokes during fast scrolls.
      paddlePhase+=dt*(3.5+1.5*clamp(Math.abs(velocity)/600))*clamp(Math.abs(velocity)/45);
      const tangent=-Math.atan(pointAt(distance).slope)*180/Math.PI;
      [angle,angularVelocity]=critical(angle,angularVelocity,tangent,passage?26:17,dt);
      if(Math.abs(angle-tangent)<.005&&Math.abs(angularVelocity)<.02){angle=tangent;angularVelocity=0;}
      arrivals();
      return Math.abs(distance-target)>.01||Math.abs(velocity)>.1||Math.abs(angle-tangent)>.005;
    }
    function paint(){
      if(!samples.length)return;
      const p=pointAt(distance),speed=clamp(Math.abs(velocity)/200),rock=Math.sin(distance*.055)*.7*speed;
      boat.setAttribute('transform',`translate(${f(p.x)} ${f(p.y)}) rotate(${f(angle+rock)}) scale(${mobile?.8:1})`);
      const sweep=Math.sin(paddlePhase),stroke=Math.cos(paddlePhase);
      paddle.setAttribute('transform',`rotate(${f(-sweep*34)}) scale(${f(.88+.12*Math.abs(stroke))} 1)`);
      // Opposite blade feathers out of the water during each power stroke.
      blades.forEach((blade,i)=>{const immersion=clamp((i?stroke:-stroke)*2+.5);blade.setAttribute('transform',`scale(${blade.dataset.mirror||1} ${f(.38+.62*immersion)})`);});
      splashes.forEach((splash,i)=>{const pull=clamp(i?stroke:-stroke);splash.setAttribute('opacity',f(pull*speed*.65));splash.setAttribute('transform',`translate(0 ${f((i?-1:1)*sweep*14)})`);});
      paddle.dataset.phase=String(f(paddlePhase));
      preview.querySelector('.preview-paddle')?.setAttribute('transform',paddle.getAttribute('transform'));
      preview.querySelectorAll('.preview-paddle__blade').forEach((blade,i)=>blade.setAttribute('transform',blades[i].getAttribute('transform')));

      svg.style.setProperty('--river-speed',f(speed));svg.classList.toggle('river-is-moving',speed>.015);
      svg.dataset.distance=String(f(distance));svg.dataset.target=String(f(target));svg.dataset.angle=String(f(angle));
    }
    selectDesign(1);
    return {build,setScroll,step,paint,reached:i=>reached[i],reset(){armedAt=null;distance=target=launch;velocity=angle=angularVelocity=paddlePhase=0;reached.fill(false);items.forEach(item=>item.classList.remove('river-node-hit'));},pause(){svg.classList.remove('river-is-active','river-is-moving');}};
  };
})();
