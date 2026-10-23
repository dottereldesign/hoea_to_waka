// A clipped flight followed by a damped spring: one pass, no loop or hover-out snap.
const transform = (x,stretch=0) => `translateX(${x}px) scale(${1+stretch},${1-stretch*.5})`;
const duration = 761;
const frames = [
  {offset:0,transform:transform(0),easing:'cubic-bezier(.45,0,.8,.5)'},
  {offset:160/duration,transform:transform(34,.16),easing:'linear'},
  // Both positions are fully outside the disc, so the wrap is never visible.
  {offset:161/duration,transform:transform(-34,.16),easing:'linear'}
];
const damping = .68, frequency = 17, decay = damping*frequency;
const oscillation = frequency*Math.sqrt(1-damping*damping);
const initialVelocity = 280;
const sineWeight = (initialVelocity+decay*-34)/oscillation;
for(let i=1;i<=36;i++){
  const time=i/60;
  const x=Math.exp(-decay*time)*(-34*Math.cos(oscillation*time)+sineWeight*Math.sin(oscillation*time));
  const stretch=.16*Math.exp(-12*time)*Math.cos(15*time);
  frames.push({offset:(161+time*1000)/duration,transform:i===36?transform(0):transform(x,stretch),easing:'linear'});
}
export function setupModelButtons(){
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const hover=matchMedia('(hover: hover)');
  const active=new Set();
  document.querySelectorAll('.model-button').forEach(button=>{
    const arrow=button.querySelector('.model-button__icon > svg');
    if(!arrow)return;
    let animation;
    const play=()=>{
      if(preference.matches||animation||button.matches(':disabled,[aria-disabled="true"]'))return;
      animation=arrow.animate(frames,{duration,easing:'linear'});
      const current=animation;
      active.add(current);
      current.finished.catch(()=>{}).finally(()=>{active.delete(current);if(animation===current)animation=null;});
    };
    button.addEventListener('pointerenter',event=>{if(hover.matches&&event.pointerType!=='touch')play();});
    button.addEventListener('focus',()=>{if(button.matches(':focus-visible'))play();});
    // Let a started flight settle even if the pointer leaves. Re-entry never interrupts it.
  });
  preference.addEventListener('change',()=>{
    if(preference.matches){active.forEach(animation=>animation.cancel());active.clear();}
  });
}
