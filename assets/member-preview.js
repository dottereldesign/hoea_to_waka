(() => {
  const symbol = path => '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  const person = symbol('<circle cx="12" cy="7" r="3.5"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>');
  const group = document.createElement('div');
  group.className = 'member-actions';
  group.innerHTML = '<button type="button" aria-disabled="true" title="Membership access is coming soon">' + person + '<span class="member-label">Login</span></button><button type="button" aria-disabled="true" title="Membership access is coming soon"><span class="member-label">Become a member</span><span class="member-price">$20 lifetime</span></button>';
  document.querySelector('.site-header-actions')?.prepend(group);
  document.querySelector('.site-menu-utilities')?.prepend(group.cloneNode(true));
  const heading = document.createElement('h2');
  heading.textContent = 'Membership';
  document.querySelector('.footer-more-column')?.prepend(heading, group.cloneNode(true));
})();
