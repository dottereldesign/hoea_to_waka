(() => {
  const picker=document.querySelector('[data-background-style-picker]');
  const section=picker?.closest('[data-background-study]');
  if (!section) return;
  const buttons=[...picker.querySelectorAll('[data-background-choice]')];
  const name=picker.querySelector('[data-background-style-name]');
  const description=picker.querySelector('[data-background-style-description]');
  function choose(button) {
    section.dataset.backgroundStyle=button.dataset.backgroundChoice;
    buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    name.textContent=button.getAttribute('aria-label');
    description.textContent=button.dataset.description;
  }
  buttons.forEach(button=>button.addEventListener('click',()=>choose(button)));
  choose(buttons.find(button=>button.dataset.backgroundChoice===section.dataset.backgroundStyle)||buttons[0]);
  picker.hidden=false;
})();
