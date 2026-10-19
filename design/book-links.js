// Carry verified retailer links into the saved bookshelf layout.
export function setupBookLinks(section, books) {
  section.querySelectorAll('article').forEach(article => {
    const title = article.querySelector('h2,h3')?.textContent.trim();
    const book = books.find(item => item.title === title);
    if (!book?.amazonHref || article.querySelector('.book-amazon-button')) return;
    const enquiry = article.querySelector('a[href]');
    if (!enquiry) return;
    const actions = document.createElement('div');
    actions.className = 'book-purchase-actions';
    enquiry.before(actions);
    actions.append(enquiry);
    const amazon = document.createElement('a');
    amazon.className = 'book-amazon-button';
    amazon.href = book.amazonHref;
    amazon.target = '_blank';
    amazon.rel = 'noopener noreferrer';
    amazon.setAttribute('aria-label', 'View ' + title + ' on Amazon (opens in a new tab)');
    amazon.innerHTML = '<span class="book-amazon-mark" aria-hidden="true"></span><span>View on Amazon</span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10M7 17 17 7"/></svg>';
    actions.append(amazon);
  });
}
