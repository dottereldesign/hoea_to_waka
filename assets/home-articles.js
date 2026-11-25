(() => {
  const section = document.querySelector('#home-articles');
  const picker = section.querySelector('.journal-picker');
  const select = picker.querySelector('select');

  function applyDesign() {
    section.dataset.byline = select.value;
  }

  select.addEventListener('change', applyDesign);
  picker.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      const count = select.options.length;
      select.selectedIndex = (select.selectedIndex + Number(button.dataset.step) + count) % count;
      applyDesign();
    });
  });
  applyDesign();
  picker.hidden = false;
})();
