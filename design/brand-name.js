// Keep the brand name in Marist while surrounding copy retains its own typeface.
export function setupBrandNames(container = document.body) {
  if (!container) return;
  container.querySelectorAll('h1,h2,h3').forEach(heading => {
    if (/^Hoea\s+tō\s+Waka$/i.test(heading.textContent.trim())) heading.classList.add('brand-name-text');
  });
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement.closest('script,style,svg,code,pre,textarea,option,.brand-name-text,[data-text-motion]') && /Hoea\s+tō\s+Waka/i.test(node.data)) nodes.push(node);
  }
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    let end = 0;
    for (const match of node.data.matchAll(/Hoea\s+tō\s+Waka/gi)) {
      fragment.append(node.data.slice(end, match.index));
      const name = document.createElement('span');
      name.className = 'brand-name-text';
      name.textContent = match[0];
      fragment.append(name);
      end = match.index + match[0].length;
    }
    fragment.append(node.data.slice(end));
    node.replaceWith(fragment);
  });
}
