const bookshelf = document.querySelector('#resource-books');
if (bookshelf) {
  const enquiry = bookshelf.querySelector('.books-enquiry');
  const heading = bookshelf.querySelector('.ds-section-heading');
  const catalogue = bookshelf.querySelector('.ds-book-catalogue');

  function arrangeBookLinks() {
    const layout = bookshelf.dataset.bookActions;
    for (const book of catalogue.querySelectorAll('article')) {
      const link = book.querySelector('.book-shop-link');
      if (['02','06','08'].includes(layout)) book.querySelector('.book-cover').append(link);
      else if (layout === '03') book.querySelector('.book-byline').after(link);
      else if (layout === '10') book.querySelector('h3').after(link);
      else book.querySelector('.ds-lead').after(link);
    }
    if (['03','06','09'].includes(layout)) heading.append(enquiry);
    else catalogue.after(enquiry);
  }
  arrangeBookLinks();
  new MutationObserver(arrangeBookLinks).observe(bookshelf, {attributes:true, attributeFilter:['data-book-actions']});
}
