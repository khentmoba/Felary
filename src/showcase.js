export function nextTabIndex(index, key, count) {
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'ArrowRight' || key === 'ArrowDown') return (index + 1) % count;
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (index - 1 + count) % count;
  return index;
}

export function initShowcase(root) {
  const rail = root.querySelector('.app-rail');
  const tabs = [...rail.querySelectorAll('[data-panel]')];
  const panels = tabs.map(tab => root.querySelector('#' + tab.dataset.panel));
  if (!tabs.length || panels.some(panel => !panel)) return;
  const layout = matchMedia('(max-width: 760px)');
  const setOrientation = () => rail.setAttribute('aria-orientation', layout.matches ? 'horizontal' : 'vertical');
  rail.setAttribute('role', 'tablist');
  setOrientation();
  layout.addEventListener('change', setOrientation);
  const select = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  };
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(index);
    });
    tab.addEventListener('keydown', event => {
      if (!['Home','End','ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(event.key)) return;
      event.preventDefault();
      select(nextTabIndex(index, event.key, tabs.length), true);
    });
  });
  select(0);
  root.dataset.enhanced = '';
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('.spotlight').forEach(initShowcase);
  document.querySelectorAll('.spotlight-media img, .story-image img').forEach(img => {
    const fallback = () => {
      const message = document.createElement('p');
      message.className = 'image-error';
      message.textContent = 'Preview unavailable. Read the introduction below or explore the app on GitHub.';
      img.replaceWith(message);
    };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && !img.naturalWidth) fallback();
  });
}
