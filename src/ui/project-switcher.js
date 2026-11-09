// One project switcher for the WreckTrack header and WreckArchive child site.
// Only released apps are listed; WreckLib remains hidden.
(() => {
  const archive = document.body.classList.contains('wreckarchive-app');
  const brand = document.getElementById(archive ? 'project-switch' : 'brand-home');
  if (!brand) return;
  const base = new URL(archive ? '../' : './', document.baseURI);
  const wrapper = document.createElement('div');
  wrapper.className = 'project-switcher';
  brand.parentNode.insertBefore(wrapper, brand);
  wrapper.appendChild(brand);
  brand.setAttribute('aria-label', 'Переключить приложение');
  brand.setAttribute('aria-haspopup', 'menu');
  brand.setAttribute('aria-expanded', 'false');
  const menu = document.createElement('div');
  menu.id = 'wreck-project-menu';
  menu.className = 'project-switcher-menu';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Приложения Wreck');
  menu.setAttribute('popover', 'manual');
  menu.hidden = true;
  brand.setAttribute('aria-controls', menu.id);
  const items = [
    ['WreckTrack', 'Основное приложение', base.href, 'track'],
    ['WreckArchive', 'Справочник D&D 2024', new URL('archive/', base).href, 'archive']
  ];
  for (const [name, description, href, kind] of items) {
    const link = document.createElement('a');
    link.className = 'project-switcher-item';
    link.href = href;
    link.dataset.project = kind;
    link.setAttribute('role', 'menuitem');
    if ((archive && kind === 'archive') || (!archive && kind === 'track')) link.setAttribute('aria-current', 'page');
    const title = document.createElement('strong');
    title.textContent = name;
    const detail = document.createElement('span');
    detail.textContent = description;
    link.append(title, detail);
    menu.appendChild(link);
  }
  // Portal the menu outside the sticky header to avoid clipping on phones.
  document.body.appendChild(menu);
  const place = () => {
    const rect = brand.getBoundingClientRect();
    const width = Math.min(260, Math.max(200, window.innerWidth - 24));
    menu.style.width = width + 'px';
    menu.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)) + 'px';
    menu.style.top = Math.min(rect.bottom + 8, window.innerHeight - 12) + 'px';
  };
  const opened = () => !menu.hidden;
  const close = () => {
    if (menu.matches(':popover-open')) menu.hidePopover();
    menu.hidden = true;
    brand.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    menu.hidden = false;
    if (typeof menu.showPopover === 'function') menu.showPopover();
    place();
    brand.setAttribute('aria-expanded', 'true');
  };
  brand.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const shouldOpen = !opened();
    close();
    if (shouldOpen) open();
  }, true);
  document.addEventListener('click', event => {
    if (!wrapper.contains(event.target) && !menu.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && opened()) { close(); brand.focus(); }
    if (event.key === 'ArrowDown' && document.activeElement === brand) {
      event.preventDefault();
      open();
      menu.querySelector('a')?.focus();
    }
  });
  window.addEventListener('resize', () => { if (opened()) place(); });
  window.addEventListener('scroll', () => { if (opened()) place(); }, true);
})();
