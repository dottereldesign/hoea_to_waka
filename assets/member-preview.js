(() => {
  const styles = ['Fine underline', 'Twin outlines', 'Lilac invitation', 'Split capsule', 'Ink invitation', 'Stitched edge', 'Price tag', 'Icon pair', 'Stacked access', 'Sage pass'];
  const symbol = path => '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  const person = symbol('<circle cx="12" cy="7" r="3.5"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>');
  const pass = symbol('<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 10h4m-4 4h8"/>');
  const group = document.createElement('div');
  group.className = 'member-actions';
  group.innerHTML = '<button type="button" aria-disabled="true">' + person + 'Login</button><button type="button" aria-disabled="true">' + pass + 'Become a member<span class="member-price">$20 lifetime</span></button>';
  document.querySelector('.site-header-actions')?.prepend(group);
  document.querySelector('.site-menu-utilities')?.prepend(group.cloneNode(true));
  document.querySelector('.footer-explore-column')?.append(group.cloneNode(true));

  const picker = document.createElement('aside');
  picker.className = 'member-picker';
  picker.setAttribute('aria-label','Membership style preview');
  picker.innerHTML = '<small>Membership style</small><div><button type="button" aria-label="Previous membership style">←</button><span aria-live="polite"></span><button type="button" aria-label="Next membership style">→</button></div>';
  // Keep the floating preview beside the homepage design studies.
  if (document.querySelector('.home-hero')) document.body.append(picker);
  let index = 0;
  try { index = Number(localStorage.getItem('membershipStyle')); } catch {}
  if (!Number.isInteger(index) || index < 0 || index >= styles.length) index = 0;
  function render() {
    document.documentElement.dataset.memberStyle = index + 1;
    picker.querySelector('span').textContent = String(index + 1).padStart(2,'0') + ' · ' + styles[index];
  }
  picker.querySelectorAll('button').forEach((button, i) => {
    button.onclick = () => {
      index = (index + (i ? 1 : -1) + styles.length) % styles.length;
      render();
      try { localStorage.setItem('membershipStyle',index); } catch {}
    };
  });
  render();
})();
