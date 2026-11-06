(() => {
 const lab=document.querySelector('.palette-lab');if(!lab)return;
 const study=lab.querySelector('.clean-study'),svg=study.querySelector('svg'),part=lab.querySelector('#clean-part'),colour=lab.querySelector('#clean-colour'),motion=lab.querySelector('#clean-motion'),status=lab.querySelector('#palette-status');let timeout;
 const announce=text=>{clearTimeout(timeout);status.textContent=text;timeout=setTimeout(()=>status.textContent='',3000);};
 lab.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(button.dataset.copy);announce('Copied '+button.dataset.copy);}catch{announce('Hex code: '+button.dataset.copy);}}));
 const pick=()=>{colour.value=svg.style.getPropertyValue('--community-'+part.value)||part.selectedOptions[0].dataset.colour;};
 part.addEventListener('change',pick);colour.addEventListener('input',()=>svg.style.setProperty('--community-'+part.value,colour.value));
 motion.addEventListener('change',()=>study.dataset.motion=String(motion.checked));study.dataset.motion='true';
 lab.querySelector('#clean-reset').addEventListener('click',()=>{svg.removeAttribute('style');part.selectedIndex=0;motion.checked=true;study.dataset.motion='true';pick();announce('Original artwork colours restored.');});
 lab.querySelector('#clean-download').addEventListener('click',event=>{event.preventDefault();const copy=svg.cloneNode(true);copy.setAttribute('xmlns','http://www.w3.org/2000/svg');const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download='hoea-community-clean.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
})();
