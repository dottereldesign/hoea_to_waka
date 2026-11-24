(() => {
  const hero = document.querySelector('.home-hero');
  const discs = [...hero.querySelectorAll('.hero-sun i')];
  const picker = document.querySelector('.sun-picker');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  // Frames are shared by the rings. Each preset sets its own travel, timing and order.
  const presets = [
    {name:'Soft pulse', duration:1400, stagger:100, inward:false, frames:[[0,.80,0],[.65,1.025,1],[1,1,1]]},
    {name:'First light', duration:1900, stagger:170, inward:false, frames:[[0,.96,0],[1,1,1]]},
    {name:'Ripple out', duration:1500, stagger:220, inward:false, frames:[[0,.50,0],[.72,1.04,1],[1,1,1]]},
    {name:'Quiet halo', duration:2200, stagger:0, inward:true, frames:[[0,1.12,0],[1,1,1]]},
    {name:'Daybreak', duration:1700, stagger:85, inward:true, frames:[[0,.96,0,22],[1,1,1,0]]},
    {name:'Amber echo', duration:1900, stagger:130, inward:false, frames:[[0,.82,0],[.36,1.045,1],[.58,.99,1],[.79,1.025,1],[1,1,1]]},
    {name:'Gather in', duration:1450, stagger:180, inward:true, frames:[[0,1.18,0],[.75,.98,1],[1,1,1]]},
    {name:'Golden hour', duration:2600, stagger:190, inward:true, frames:[[0,1,0],[1,1,1]]},
    {name:'Horizon lift', duration:1600, stagger:140, inward:false, frames:[[0,.91,0,12,.68],[.75,1,1,0,1.02],[1,1,1,0,1]]},
    {name:'Long breath', duration:3000, stagger:0, inward:false, frames:[[0,.88,0],[.55,1.065,1],[1,1,1]]}
  ];
  let index = 0;
  let animations = [];
  function stop() {
    animations.forEach(animation => animation.cancel());
    animations = [];
  }
  function play() {
    stop();
    if (reduced.matches) return;
    const {frames,duration,stagger,inward} = presets[index];
    const keyframes = frames.map(([offset,scale,opacity,y=0,aspect=1]) => ({
      offset, opacity, transform:`translateY(${y}%) scale(${scale}, ${scale * aspect})`,
      easing:'cubic-bezier(.25,.65,.35,1)'
    }));
    animations = discs.map((disc,i) => disc.animate(keyframes,{
      duration, delay:stagger * (inward ? i : discs.length - 1 - i), fill:'backwards'
    }));
  }
  picker.addEventListener('click',event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-step')) {
      index = (index + Number(button.dataset.step) + presets.length) % presets.length;
      picker.querySelector('strong').textContent = presets[index].name;
      picker.querySelector('[data-count]').textContent = String(index+1).padStart(2,'0') + ' / ' + presets.length;
    }
    play();
  });
  reduced.addEventListener('change',play);
  new IntersectionObserver(([entry]) => {
    picker.hidden = !entry.isIntersecting;
    if (!entry.isIntersecting) stop();
  }).observe(hero);
  play();
})();
