(() => {
  const section=document.querySelector('#home-faq');
  if (!section) return;
  const picker=section.querySelector('[data-faq-style-picker]');
  const buttons=[...picker.querySelectorAll('[data-faq-choice]')];
  const name=picker.querySelector('[data-faq-style-name]');
  const description=picker.querySelector('[data-faq-style-description]');
  function choose(button) {
    section.dataset.faqStyle=button.dataset.faqChoice;
    buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    name.textContent=button.getAttribute('aria-label');
    description.textContent=button.dataset.description;
  }
  buttons.forEach(button=>button.addEventListener('click',()=>choose(button)));
  choose(buttons.find(button=>button.dataset.faqChoice===section.dataset.faqStyle)||buttons[0]);
  picker.hidden=false;
})();
