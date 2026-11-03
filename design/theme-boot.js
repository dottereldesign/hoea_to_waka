// Inline before styles finish loading; interactive setup is deferred.
import {applyBrandColours} from './brand-colours';
const root=document.documentElement;
const roles=['display','heading','body','eyebrow','ui','small'].map(id=>({id}));
// Establish reduced-motion layout before the body is parsed, including when
// the deferred interaction bundle is delayed or unavailable.
root.classList.toggle('ds-motion-paused',matchMedia('(prefers-reduced-motion:reduce)').matches);
function apply(){
  root.dataset.palette='hoea';
  root.dataset.typography='inter';
  // Typography is fixed site-wide, including browsers with older saved font choices.
  for(const role of roles){root.style.setProperty(`--font-${role.id}`,'"Inter", Arial, sans-serif');root.style.setProperty(`--font-weight-${role.id}`,role.id==='eyebrow'?400:['display','heading'].includes(role.id)?600:500);}
  applyBrandColours();
}

apply();
