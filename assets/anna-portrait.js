(()=>{
 const root=document.querySelector('.anna-portrait-studio');if(!root)return;
 const image=root.querySelector('img'),card=root.querySelector('.anna-portrait-card');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let selected='1',signatureAnimations=[],portraitAnimation=null,started=false;
 const names=['Cream · gentle rise','Coral · soft zoom','Light olive · side glide','Ocean teal · settling tilt','Paper · quiet fade'];
 const reveals=[
  [{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],
  [{opacity:0,transform:'scale(1.045)'},{opacity:1,transform:'scale(1)'}],
  [{opacity:0,transform:'translateX(-22px)'},{opacity:1,transform:'translateX(0)'}],
  [{opacity:0,transform:'translateY(12px) rotate(-2deg)'},{opacity:1,transform:'translateY(0) rotate(0deg)'}],
  [{opacity:0},{opacity:1}]
 ];
 function draw(){
  root.dataset.signatureReady="true";
  signatureAnimations.forEach(a=>a.cancel());signatureAnimations=[];
  const paths=[...root.querySelector('[data-signature="'+selected+'"]').querySelectorAll('path')];
  if(reduced.matches)return;
  const lengths=paths.map(p=>p.getTotalLength()),total=lengths.reduce((a,b)=>a+b,0);let delay=160;
  paths.forEach((path,i)=>{const duration=1800*lengths[i]/total;
   const a=path.animate([{strokeDasharray:'1',strokeDashoffset:'1'},{strokeDasharray:'1',strokeDashoffset:'0'}],{duration,delay,easing:'linear',fill:'both'});
   signatureAnimations.push(a);a.finished.then(()=>a.cancel()).catch(()=>{});delay+=duration+60;
  });
 }
 function reveal(value){portraitAnimation?.cancel();if(reduced.matches)return;
  portraitAnimation=image.animate(reveals[Number(value)-1],{duration:850,easing:'cubic-bezier(.22,1,.36,1)'});
 }
 root.querySelectorAll('[data-signature-choice]').forEach(button=>button.addEventListener('click',()=>{
  started=true;selected=button.dataset.signatureChoice;
  root.querySelectorAll('[data-signature]').forEach(el=>el.hidden=el.dataset.signature!==selected);
  root.querySelectorAll('[data-signature-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));draw();
 }));
 root.querySelectorAll('[data-portrait-choice]').forEach(button=>button.addEventListener('click',()=>{
  started=true;if(!root.dataset.signatureReady)draw();const value=button.dataset.portraitChoice;card.dataset.portraitColour=value;
  root.querySelectorAll('[data-portrait-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
  root.querySelector('output').textContent=names[Number(value)-1];reveal(value);
 }));
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();image.decode().catch(()=>{}).then(()=>{if(!started){started=true;reveal('1');draw();}});}},{threshold:.25});observer.observe(card);
 reduced.addEventListener('change',()=>{if(reduced.matches){signatureAnimations.forEach(a=>a.cancel());portraitAnimation?.cancel();}});
})();
