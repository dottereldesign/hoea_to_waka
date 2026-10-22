// Copy the authored statement so the control always follows future copy edits.
export function setupStatementCopy() {
  document.querySelectorAll('[data-copy-statement]').forEach(button => {
    const statement = document.getElementById(button.dataset.copyStatement);
    if (!statement) return;
    const label = button.querySelector('[data-copy-label]');
    const status = button.parentElement.querySelector('[role="status"]');
    const heading = button.parentElement.querySelector('h3').textContent.trim();
    let resetTimer, copying = false;
    button.hidden = false;
    button.addEventListener('click', async () => {
      if (copying) return;
      copying = true;
      clearTimeout(resetTimer);
      button.setAttribute('aria-busy', 'true');
      status.textContent = '';
      try {
        await navigator.clipboard.writeText(statement.textContent.trim());
        label.textContent = 'Copied';
        status.textContent = `${heading} statement copied to clipboard.`;
        resetTimer = setTimeout(() => {label.textContent = 'Copy';status.textContent = '';}, 2000);
      } catch {
        label.textContent = 'Try again';
        status.textContent = 'Copy unavailable. Select the statement and copy it manually.';
      } finally {
        copying = false;
        button.removeAttribute('aria-busy');
      }
    });
  });
}
