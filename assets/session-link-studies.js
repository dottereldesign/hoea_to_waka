(()=>{
 const study=document.querySelector('.session-link-study');if(!study)return;
 const names=['Fine underline','Arrow disc','Open circle','Leading arrow','Editorial rule','Soft highlight','Quiet brackets','Double rule','Accent dot','Outlined capsule'];
 const buttons=[...study.querySelectorAll('[data-link-choice]')];
 study.addEventListener('click',event=>{
  const button=event.target.closest('[data-link-choice]');if(!button)return;
  const choice=button.dataset.linkChoice;study.dataset.linkStyle=choice;
  buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  study.querySelector('.session-link-caption').textContent=choice+' · '+names[Number(choice)-1];
 });
})();
