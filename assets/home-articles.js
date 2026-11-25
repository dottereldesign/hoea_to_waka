(() => {
  const section = document.querySelector('#home-articles');
  const picker = section.querySelector('.journal-picker');
  const select = picker.querySelector('select');
  const layouts = {
    shelf: 'Bookshelf', lead: 'Lead story', index: 'Reading list', steps: 'Stepped gallery',
    wide: 'Weekend edition', strip: 'Filmstrip', mosaic: 'Photo mosaic', side: 'Side notes',
    album: 'Photo album', fold: 'Centrefold'
  };
  const finishes = {
    paper: 'Fine rule', tint: 'Colour blocks', frame: 'Print mounts',
    caption: 'Caption slips', night: 'After dark'
  };
  const designs = [];
  for (const [layout, title] of Object.entries(layouts)) {
    const group = document.createElement('optgroup');
    group.label = title;
    for (const [finish, label] of Object.entries(finishes)) {
      designs.push({ layout, finish });
      const number = String(designs.length).padStart(2, '0');
      group.append(new Option(number + ' · ' + title + ' / ' + label, designs.length - 1));
    }
    select.append(group);
  }
  function show(index) {
    const { layout, finish } = designs[index];
    section.dataset.layout = layout;
    section.dataset.finish = finish;
    select.selectedIndex = index;
  }
  select.addEventListener('change', () => show(select.selectedIndex));
  picker.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      show((select.selectedIndex + Number(button.dataset.step) + designs.length) % designs.length);
    });
  });
  picker.hidden = false;
})();
