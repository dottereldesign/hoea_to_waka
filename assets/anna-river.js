import {mountWakaStudies,paddlePose} from './anna-waka-studies.js';
/* A measured, scroll-led river. Geometry is cached; idle frames do no JS work. */
(() => {
  window.createAnnaRiver=(root,items)=>{
    const ns='http://www.w3.org/2000/svg',pin=root.querySelector('.anna-pin');
    const svg=document.createElementNS(ns,'svg');
    svg.classList.add('anna-river');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    svg.innerHTML=`<defs>${[['water','#eaf1ed'],['bank','#526b68']].map(([name,colour])=>`<linearGradient id="anna-river-${name}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${colour}" stop-opacity="0"/><stop offset=".035" stop-color="${colour}"/><stop offset=".965" stop-color="${colour}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></linearGradient>`).join('')}</defs>
      <g class="river-water"></g><g class="river-banks"></g><g class="river-shore"></g><g class="river-currents"></g>
      <g class="river-kayak" visibility="hidden">
        <g class="river-wake"><path d="M-5-21Q-11-34-17-49M5-21Q11-34 17-49"/><path d="M-4-26Q-7-38-8-53M4-26Q7-38 8-53"/></g>
        <g class="river-kayak__float" id="anna-current-waka">
          <!-- Hand-traced from the supplied canoe reference, rotated to its upright axis. -->
          <g class="river-canoe" transform="scale(.05) rotate(-60.2) translate(-768 -509)" stroke="none">
            <defs>
              <linearGradient id="anna-canoe-rim" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FDAEB5"/><stop offset=".5" stop-color="#fa927f"/><stop offset="1" stop-color="#d96773"/></linearGradient>
              <linearGradient id="anna-canoe-well" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#281A2C"/><stop offset=".48" stop-color="#82394f"/><stop offset="1" stop-color="#d98788"/></linearGradient>
              <linearGradient id="anna-canoe-seat" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FDB069"/><stop offset="1" stop-color="#f58f51"/></linearGradient>
            </defs>
            <path data-canoe-part="hull" fill="url(#anna-canoe-rim)" d="M75 904C61 901 119 847 164 796C299 640 524 491 766 363C1005 238 1194 168 1336 148C1386 140 1424 119 1453 112Q1468 108 1457 126C1414 184 1381 235 1334 289C1216 430 1041 549 811 657C601 756 420 821 250 855C168 870 112 899 75 904Z"/>
            <path data-canoe-part="inside" fill="url(#anna-canoe-well)" d="M164 842C191 760 414 575 680 431C947 285 1219 170 1384 165Q1393 165 1373 202C1317 319 1096 507 805 643C560 757 238 858 164 842Z"/>
            <path fill="#d98788" opacity=".7" d="M321 802C294 774 374 664 541 554C753 415 1074 245 1209 252C1314 247 1268 330 1191 396C1056 511 824 627 618 708C469 768 344 822 321 802Z"/>
            <path data-canoe-part="floor" fill="#FDD8B0" d="M393 796C359 750 413 678 566 580C749 462 1030 320 1160 294C1257 276 1293 333 1214 398C1046 532 661 709 393 796Z"/>
            <path fill="#FDB069" opacity=".22" d="M393 796C509 759 744 662 906 577C1078 487 1213 409 1254 353C1252 380 1236 398 1214 418C1004 573 663 722 393 796Z"/>
            <g data-canoe-part="seats" fill="url(#anna-canoe-seat)">
              <path fill="#82394f" opacity=".32" d="M426 599L480 570L586 742L504 770Z M746 408L806 382L923 588L849 619Z M1051 265L1105 242L1210 414L1141 445Z"/>
              <path d="M430 591L476 565Q486 559 492 570L578 731Q583 743 572 748L522 766Q513 769 507 759L428 607Q423 597 430 591Z"/>
              <path d="M753 400L797 380Q809 375 815 389L914 568Q919 580 908 587L868 608Q856 615 849 601L750 418Q744 406 753 400Z"/>
              <path d="M1061 254L1100 239Q1114 233 1121 248L1199 405Q1205 417 1194 423L1157 443Q1146 448 1139 433L1055 277Q1048 261 1061 254Z"/>
            </g>
            <path data-canoe-part="rim-highlight" fill="#FDAEB5" d="M75 904C212 829 413 809 667 702C1011 556 1268 413 1384 165C1330 351 1137 530 811 679C565 792 385 838 250 862C171 877 107 902 75 904Z" opacity=".5"/>
          </g>
          <g class="river-paddle-splashes" fill="none" stroke="#b8d9e9" stroke-width=".8"><path data-paddle-splash="left" d="M-27-5Q-31 0-27 5M-30-7Q-35 0-30 7"/><path data-paddle-splash="right" d="M27-5Q31 0 27 5M30-7Q35 0 30 7"/></g>
          <g class="river-paddle" style="stroke:#d37d48;stroke-width:.45">
            ${['left','right'].map(side=>`<g data-paddle-blade="${side}"><path d="M11 0H25" stroke="#FDB069" stroke-width="1.4" stroke-linecap="round"/><g data-paddle-face><path d="M23 0C26-1 28-4 32-3.8C37-3.5 37 3.5 32 3.8C28 4 26 1 23 0Z" fill="#FDB069"/><path d="M24 0H35" stroke="#FDD8B0" stroke-width=".5"/></g></g>`).join('')}
          </g>
        </g>
      </g>`;
    pin.prepend(svg);
    const ocean=document.createElementNS(ns,'svg');
    ocean.classList.add('anna-ocean-cut');ocean.setAttribute('aria-hidden','true');
    ocean.innerHTML='<defs><clipPath id="anna-ocean-crack"><path/></clipPath><linearGradient id="anna-sky-base" x2="0" y2="1"><stop stop-color="#386b9e"/><stop offset=".5" stop-color="#22578f"/><stop offset="1" stop-color="#0D4687"/></linearGradient><radialGradient id="anna-sky-cloud" cx=".23" cy="0" r=".8"><stop stop-color="#d3eaf3" stop-opacity=".12"/><stop offset="1" stop-color="#d3eaf3" stop-opacity="0"/></radialGradient></defs><g clip-path="url(#anna-ocean-crack)"><rect fill="#0D4687"/><svg class="anna-sky" width="100%" height="650" preserveAspectRatio="none" viewBox="0 0 100 100"><rect width="100" height="100" fill="url(#anna-sky-base)"/><rect width="100" height="100" fill="url(#anna-sky-cloud)"/></svg></g>';
    root.prepend(ocean);
    const boat=svg.querySelector('.river-kayak'),paddle=svg.querySelector('.river-paddle');
    const blades=[...svg.querySelectorAll('[data-paddle-blade]')],splashes=[...svg.querySelectorAll('[data-paddle-splash]')];
    let paddlePhase=0,paddleActivity=0;
    // The canoe artwork stays editable independently of its two rowing paddles.
    svg.dataset.wakaDesign='reference-canoe';
    blades.forEach((blade,i)=>{blade.dataset.mirror=i?1:-1;});
    const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n)),f=n=>Number(n.toFixed(3));
    const smooth=t=>t*t*t*(t*(t*6-15)+10);
    let samples=[],stops=[],length=0,armedAt=null,visible=false,reduced=false,angle=0,angularVelocity=0,lastBuildKey='';
    const launch=72;
    let distance=launch,velocity=0,target=launch,width=0,height=0,mobile=false;
    const reached=items.map(()=>false);
    mountWakaStudies(root,svg,()=>{paddlePose(blades,splashes,paddlePhase,paddleActivity);});
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
      // Read all geometry before touching SVG/styles. Font readiness, pageshow and
      // ResizeObserver may request the identical river several times at startup.
      const rootBox=root.getBoundingClientRect();
      const buildKey=[root.dataset.timelineVariant,mobile,innerHeight,width,height,rootBox.width,rootBox.height,box.left-rootBox.left,box.top-rootBox.top,box.top+scrollY,...bounds.flatMap(b=>[b.top-box.top,b.height])].join(',');
      if(buildKey===lastBuildKey)return;
      lastBuildKey=buildKey;
      const centre=mobile?40:width/2,amplitude=mobile?(root.dataset.timelineVariant==='thread2'?4:10):38,period=Math.max(600,height/2.35);
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
      const ox=box.left-rootBox.left,oy=box.top-rootBox.top,rw=rootBox.width,rh=rootBox.height;
      ocean.setAttribute('viewBox',`0 0 ${rw} ${rh}`);
      ocean.querySelector('.anna-sky').setAttribute('height',Math.min(650,oy));ocean.querySelector('rect').setAttribute('width',rw);ocean.querySelector('rect').setAttribute('height',rh);
      const banks=[[],[]];
      for(let y=0;y<=height;y+=10){
        const taper=mobile?0:1-smooth(clamp(y/380)),half=((mobile?17:38)+(mobile?2.5:6)*Math.sin(y/155+.4)+taper*(mobile?rw*.14:rw*.16))*Math.min(1,(height-y)/170+.025);
        for(let side=0;side<2;side++){
          const sign=side?1:-1;
          const rough=(Math.sin(y*.071+side*7)*5+Math.sin(y*.193+side*3)*3+Math.sin(y*.047)*7)*(mobile?.3:1)*(1-smooth(clamp(y/340)));
          banks[side].push([ox+xAt(y)+sign*(half+rough),oy+y]);
        }
      }
      const shoulder=oy-180;
      const cutLeft=[[0,0],[0,shoulder+65],[rw*.04,shoulder+56],[rw*.075,shoulder+29],[rw*.1,shoulder+38],[rw*.14,shoulder+4],[rw*.17,shoulder-9],[rw*.205,shoulder-43],[rw*.23,shoulder-22],[rw*.25,shoulder+35],[rw*.27,shoulder+62],[rw*.29,shoulder+50],[rw*.31,shoulder+91],[rw*.34,shoulder+115],...banks[0]];
      const cutRight=[...banks[1].reverse(),[rw*.7,shoulder+126],[rw*.73,shoulder+104],[rw*.75,shoulder+111],[rw*.78,shoulder+62],[rw*.8,shoulder+49],[rw*.825,shoulder+6],[rw*.85,shoulder+17],[rw*.88,shoulder+34],[rw*.91,shoulder+26],[rw*.95,shoulder+49],[rw,shoulder+63],[rw,0]];
      const outline=mobile?[[0,0],[0,shoulder+70],[ox+centre-17,shoulder+120],...banks[0],...banks[1],[rw*.22,shoulder+100],[rw*.28,shoulder+58],[rw*.45,shoulder+24],[rw,shoulder],[rw,0]]:[...cutLeft,...cutRight];
      const fractured=[];
      outline.forEach((p,i)=>{const previous=outline[i-1];if(previous&&p[1]>shoulder-10&&previous[1]>shoulder-10&&Math.hypot(p[0]-previous[0],p[1]-previous[1])>45){const steps=Math.ceil(Math.hypot(p[0]-previous[0],p[1]-previous[1])/16);for(let j=1;j<steps;j++){const t=j/steps;fractured.push([previous[0]+(p[0]-previous[0])*t+Math.sin(i*7+j*3)*3,previous[1]+(p[1]-previous[1])*t+Math.sin(i*3+j*7)*4]);}}fractured.push(p);});
      // Rough paper shoulders gradually hand over to tangent-continuous riverbanks.
      const silhouette=fractured.map((point,i)=>{
        if(!i)return 'M'+point.map(f).join(' ');
        const previous=fractured[i-1],before=fractured[i-2]||previous,after=fractured[i+1]||point;
        const blend=smooth(clamp((Math.min(previous[1],point[1])-oy)/340));
        if(!blend)return 'L'+point.map(f).join(' ');
        return `C${f(previous[0]+(point[0]-before[0])/6*blend)} ${f(previous[1]+(point[1]-before[1])/6*blend)} ${f(point[0]-(after[0]-previous[0])/6*blend)} ${f(point[1]-(after[1]-previous[1])/6*blend)} ${point.map(f).join(' ')}`;
      }).join('')+'Z';
      ocean.querySelector('clipPath path').setAttribute('d',silhouette);


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
      // Publish geometry and the initial waka pose together, before exposing the river.
      paint();
      root.dataset.oceanReady='true';
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
      const rowing=clamp(Math.abs(velocity)/70);
      paddleActivity+=(rowing-paddleActivity)*(1-Math.exp(-dt*7));
      if(paddleActivity<.002&&rowing===0)paddleActivity=0;
      paddlePhase+=dt*3.1*paddleActivity;
      const tangent=-Math.atan(pointAt(distance).slope)*180/Math.PI;
      [angle,angularVelocity]=critical(angle,angularVelocity,tangent,passage?26:17,dt);
      if(Math.abs(angle-tangent)<.005&&Math.abs(angularVelocity)<.02){angle=tangent;angularVelocity=0;}
      arrivals();
      return Math.abs(distance-target)>.01||Math.abs(velocity)>.1||Math.abs(angle-tangent)>.005||paddleActivity>0;
    }
    function paint(){
      if(!samples.length)return;
      const p=pointAt(distance),speed=clamp(Math.abs(velocity)/200),rock=Math.sin(distance*.055)*.7*speed;
      boat.setAttribute('transform',`translate(${f(p.x)} ${f(p.y)}) rotate(${f(angle+rock)}) scale(${mobile?.8:1})`);
      boat.removeAttribute('visibility');
      // A submerged power stroke followed by a feathered, lifted recovery.
      // The stroke rate stays calm; acceleration changes its strength, not its cadence.
      paddlePose(blades,splashes,paddlePhase,reduced?0:paddleActivity);
      paddle.dataset.phase=String(f(paddlePhase));

      svg.style.setProperty('--river-speed',f(speed));svg.classList.toggle('river-is-moving',speed>.015);
      svg.dataset.distance=String(f(distance));svg.dataset.target=String(f(target));svg.dataset.angle=String(f(angle));
    }
    return {build,setScroll,step,paint,reached:i=>reached[i],reset(){lastBuildKey='';armedAt=null;distance=target=launch;velocity=angle=angularVelocity=paddlePhase=paddleActivity=0;reached.fill(false);items.forEach(item=>item.classList.remove('river-node-hit'));},pause(){svg.classList.remove('river-is-active','river-is-moving');}};
  };
})();
