// Inline before styles finish loading; interactive setup is deferred.
// BRAND_STORAGE_KEY and BRAND_COLOUR_IDS are generated from brand-tokens.mjs.
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
  // The build supplies just the valid IDs. Descriptions and editor UI are
  // unnecessary on the pre-paint path. The stylesheet supplies defaults.
  let saved;
  try { saved = JSON.parse(localStorage.getItem(BRAND_STORAGE_KEY))?.colours; } catch {}
  let preview = false;
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    for (const id of BRAND_COLOUR_IDS) {
      const value = saved[id];
      if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) {
        root.style.setProperty(`--brand-${id}`, value.toUpperCase());
        preview = true;
      }
    }
  }
  root.dataset.brandPreview = String(preview);
}

apply();
