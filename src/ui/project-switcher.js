// Optional project switcher. WreckLib is intentionally not listed until launch.
(() => {
  const brand = document.getElementById('brand-home');
  if (!brand) return;
  const base = new URL((location.pathname.match(/^.*?\/WreckTrack\//i) || [])[0] || '/', location.origin);
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
  menu.setAttribute('popover', 'manual');
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
  // Render outside the header so overflow/stacking contexts cannot clip the menu.
  document.body.appendChild(menu);
  const positionMenu = () => {
    const rect = brand.getBoundingClientRect();
    const width = Math.min(260, Math.max(200, window.innerWidth - 24));
    menu.style.width = width + 'px';
    menu.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)) + 'px';
    menu.style.top = Math.min(rect.bottom + 10, window.innerHeight - 12) + 'px';
  };
  const open = () => {
    menu.hidden = false;
    if (typeof menu.showPopover === 'function') menu.showPopover();
    positionMenu();
    brand.setAttribute('aria-expanded', 'true');
  };
  menu.addEventListener('toggle', () => {
    if (!menu.matches(':popover-open') && !menu.hidden) close();
  });
  window.addEventListener('resize', () => { if (!menu.hidden) positionMenu(); });
  window.addEventListener('scroll', () => { if (!menu.hidden) positionMenu(); }, true);
  const close = () => {
    if (menu.matches(':popover-open')) menu.hidePopover();
    menu.hidden = true;
    brand.setAttribute('aria-expanded', 'false');
  };
  brand.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const opening = menu.hidden;
    close();
    if (opening) open();
  }, true);
  document.addEventListener('click', event => { if (!wrapper.contains(event.target) && !menu.contains(event.target)) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { close(); brand.focus(); }
    if (event.key === 'ArrowDown' && document.activeElement === brand) {
      event.preventDefault(); open();
      menu.querySelector('a')?.focus();
    }
  });
})();
