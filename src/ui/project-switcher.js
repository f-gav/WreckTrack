// Optional project switcher. WreckLib is intentionally not listed until launch.
(() => {
  const brand = document.getElementById('brand-home');
  if (!brand) return;
  const base = new URL('.', document.baseURI);
  const wrapper = document.createElement('div');
  wrapper.className = 'project-switcher';
  brand.parentNode.insertBefore(wrapper, brand);
  wrapper.appendChild(brand);
  brand.setAttribute('aria-label', 'Переключить приложение');
  brand.setAttribute('aria-haspopup', 'menu');
  brand.setAttribute('aria-expanded', 'false');
  const menu = document.createElement('div');
  menu.className = 'project-switcher-menu';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Приложения Wreck');
  menu.hidden = true;
  const items = [
    ['WreckTrack', 'Основное приложение', base.href, 'track'],
    ['WreckArchive', 'Справочник D&D 2024', new URL('archive/', base).href, 'archive']
  ];
  for (const [name, subtitle, href, kind] of items) {
    const link = document.createElement('a');
    link.className = 'project-switcher-item';
    link.href = href;
    link.setAttribute('role', 'menuitem');
    link.dataset.project = kind;
    const title = document.createElement('strong');
    title.textContent = name;
    const desc = document.createElement('span');
    desc.textContent = subtitle;
    link.append(title, desc);
    menu.appendChild(link);
  }
  wrapper.appendChild(menu);
  const close = () => { menu.hidden = true; brand.setAttribute('aria-expanded', 'false'); };
  brand.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const opening = menu.hidden;
    close();
    if (opening) { menu.hidden = false; brand.setAttribute('aria-expanded', 'true'); }
  }, true);
  document.addEventListener('click', event => { if (!wrapper.contains(event.target)) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { close(); brand.focus(); }
    if (event.key === 'ArrowDown' && document.activeElement === brand) {
      event.preventDefault(); menu.hidden = false; brand.setAttribute('aria-expanded', 'true');
      menu.querySelector('a')?.focus();
    }
  });
})();
