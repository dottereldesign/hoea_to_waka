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
        <g class="river-kayak__float">
          <path class="river-kayak__hull" d="M0 28C-4 23-8 12-8-2C-8-14-4-24 0-29C4-24 8-14 8-2C8 12 4 23 0 28Z"/>
          <path class="river-kayak__seam" d="M0 24V13M0-15V-25M-5 15 5 20M5 15-4 20M-5-17 5-21M5-17-4-21"/>
          <ellipse class="river-kayak__cockpit" cx="0" cy="-1" rx="4.8" ry="9"/>
          <path class="river-kayak__person" d="M-3-4Q0-7 3-4L2 3H-2Z"/><circle class="river-kayak__head" cx="0" cy="5" r="2.5"/>
          <g class="river-paddle"><path d="M-19-9 19 9"/><path class="river-paddle__blade" d="M-22-12Q-27-10-21-6L-16-5-16-8ZM22 12Q27 10 21 6L16 5 16 8Z"/></g>
        </g>
      </g>`;
    pin.prepend(svg);
    const ocean=document.createElementNS(ns,'svg');
    ocean.classList.add('anna-ocean-cut');ocean.setAttribute('aria-hidden','true');
    ocean.innerHTML='<defs><clipPath id="anna-ocean-crack"><path/></clipPath><linearGradient id="anna-ocean-shade" x2="0" y2="1"><stop stop-color="#071f30" stop-opacity=".62"/><stop offset=".28" stop-color="#071f30" stop-opacity=".15"/><stop offset="1" stop-color="#071f30" stop-opacity=".3"/></linearGradient></defs><g clip-path="url(#anna-ocean-crack)"><image href="../assets/anna-ocean-passage.webp" preserveAspectRatio="xMidYMid slice"/><rect fill="url(#anna-ocean-shade)"/></g>';
    root.prepend(ocean);
    const boat=svg.querySelector('.river-kayak'),paddle=svg.querySelector('.river-paddle');
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
      const centre=mobile?40:width/2,amplitude=mobile?10:38,period=Math.max(600,height/2.35);
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
      ocean.querySelector('image').setAttribute('width',rw);ocean.querySelector('image').setAttribute('height',rh);
      ocean.querySelector('rect').setAttribute('width',rw);ocean.querySelector('rect').setAttribute('height',rh);
      const banks=[[],[]];
      for(let y=0;y<=height;y+=10){
        const taper=Math.max(0,1-y/(mobile?110:340)),half=((mobile?23:38)+taper*(mobile?rw*.2:rw*.28))*Math.min(1,(height-y)/170+.025);
        for(let side=0;side<2;side++){
          const sign=side?1:-1;
          const rough=(Math.sin(y*.071+side*7)*5+Math.sin(y*.193+side*3)*3+Math.sin(y*.047)*7)*(mobile?.55:1);
          banks[side].push([ox+xAt(y)+sign*(half+rough),oy+y]);
        }
      }
      const shoulder=oy-180;
      const cutLeft=[[0,0],[0,shoulder+55],[rw*.08,shoulder+62],[rw*.12,shoulder+21],[rw*.16,shoulder+32],[rw*.19,shoulder-5],[rw*.23,shoulder+53],[rw*.27,shoulder+69],[rw*.3,shoulder+43],[rw*.34,shoulder+101],...banks[0]];
      const cutRight=[...banks[1].reverse(),[rw*.74,shoulder+77],[rw*.77,shoulder+38],[rw*.81,shoulder+52],[rw*.85,shoulder+6],[rw*.89,shoulder+25],[rw*.93,shoulder+17],[rw,shoulder+49],[rw,0]];
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
        items[i].style.setProperty('--river-node-x',`${f(p.x-(mobile?40:width/2))}px`);
        return {distance:p.s,y:p.y,globalY:globalTop+p.y};
      });
      if(armedAt===null)armedAt=scrollY;
      const release=Math.max(globalTop+28-innerHeight*.34,armedAt+48);
      // Landings own a span of scrolling. Elapsed time only smooths tracking;
      // it never advances the boat beyond a stop by itself.
      stops.forEach((stop,i)=>{
        const arrival=stop.globalY-innerHeight*.46;
        stop.arrival=i?Math.max(arrival,stops[i-1].departure+100):Math.max(arrival,release+130);
        stop.departure=stop.arrival+Math.min(mobile?88:110,(bounds[i].height+56)*.26);
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
      [distance,velocity]=critical(distance,velocity,target,15,dt);
      const max=(mobile?950:1200)*dt;
      if(Math.abs(distance-previous)>max){distance=previous+Math.sign(distance-previous)*max;velocity=Math.sign(velocity)*(mobile?950:1200);}
      distance=clamp(distance,0,length);
      if(Math.abs(distance-target)<.015&&Math.abs(velocity)<.1){distance=target;velocity=0;}
      const tangent=-Math.atan(pointAt(distance).slope)*180/Math.PI;
      [angle,angularVelocity]=critical(angle,angularVelocity,tangent,17,dt);
      if(Math.abs(angle-tangent)<.005&&Math.abs(angularVelocity)<.02){angle=tangent;angularVelocity=0;}
      arrivals();
      return Math.abs(distance-target)>.01||Math.abs(velocity)>.1||Math.abs(angle-tangent)>.005;
    }
    function paint(){
      if(!samples.length)return;
      const p=pointAt(distance),speed=clamp(Math.abs(velocity)/200),rock=Math.sin(distance*.055)*.7*speed;
      boat.setAttribute('transform',`translate(${f(p.x)} ${f(p.y)}) rotate(${f(angle+rock)}) scale(${mobile?.8:1})`);
      paddle.setAttribute('transform',`rotate(${f(Math.sin(distance*.085)*12*speed)})`);
      svg.style.setProperty('--river-speed',f(speed));svg.classList.toggle('river-is-moving',speed>.015);
      svg.dataset.distance=String(f(distance));svg.dataset.target=String(f(target));svg.dataset.angle=String(f(angle));
    }
    return {build,setScroll,step,paint,reached:i=>reached[i],reset(){armedAt=null;distance=target=launch;velocity=angle=angularVelocity=0;reached.fill(false);items.forEach(item=>item.classList.remove('river-node-hit'));},pause(){svg.classList.remove('river-is-active','river-is-moving');}};
  };
})();
