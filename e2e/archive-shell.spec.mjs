import {test,expect} from '@playwright/test';

test('Archive desktop sidebar and empty catalog routes',async({page})=>{
 await page.goto('/archive/');
 await expect(page.locator('#sidebar')).toBeVisible();
 await expect(page.locator('.category-card')).toHaveCount(9);
 if(await page.locator('#mobile-menu').isVisible())await page.locator('#mobile-menu').click();
 await page.locator('[data-page="spells"]').click();
 await expect(page.locator('#page-title')).toHaveText('Заклинания');
 await expect(page.locator('#empty-panel')).toBeVisible();
 await page.locator('.breadcrumb a').click();
 await expect(page.locator('#category-grid')).toBeVisible();
 await page.locator('#project-switch').click();
 await expect(page.locator('.project-switcher-menu a')).toHaveCount(2);
 await expect(page.getByRole('menu',{name:'Приложения Wreck'})).not.toContainText('WreckLib');
});
test('Archive appearance persists and shares WreckTrack storage keys',async({page})=>{
 await page.goto('/archive/');
 await page.locator('#settings-button').click();
 await page.locator('[data-accent="scarlet"]').click();
 await page.locator('[data-font="old-town"]').click();
 await expect(page.locator('html')).toHaveAttribute('data-accent','scarlet');
 await expect(page.locator('html')).toHaveAttribute('data-font','old-town');
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('initiative-accent-v1'))).toBe('scarlet');
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('initiative-display-font-v1'))).toBe('old-town');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-accent','scarlet');
 await expect(page.locator('html')).toHaveAttribute('data-font','old-town');
});
test('Archive mobile navigation opens and closes',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/archive/');
 await page.locator('#mobile-menu').click();
 await expect(page.locator('#sidebar')).toHaveClass(/is-open/);
 await page.locator('[data-page="bestiary"]').click();
 await expect(page.locator('#page-title')).toHaveText('Бестиарий');
 await expect(page.locator('#sidebar')).not.toHaveClass(/is-open/);
});

test('Archive only exposes reference sections and cache-busted assets',async({page})=>{
 await page.goto('/archive/');
 const links=page.locator('#sidebar-nav [data-page]');
 await expect(links).toHaveCount(10);
 await expect(page.locator('#sidebar-nav')).not.toContainText('Новичку');
 await expect(page.locator('#sidebar-nav')).not.toContainText('Статьи');
 await expect(page.locator('#sidebar-nav')).not.toContainText('Инструменты');
 await expect(page.locator('#page-description')).toContainText('World of Warcraft');
 const css=await page.locator('link[rel="stylesheet"]').getAttribute('href');
 const js=await page.locator('script[src]').getAttribute('src');
 expect(css).toMatch(/archive\.[0-9a-f]{12}\.css$/);
 expect(js).toMatch(/archive\.[0-9a-f]{12}\.js$/);
});

test('Warcraft classes catalog opens a DnD-style detail page and returns',async({page})=>{
 await page.goto('/archive/#classes');
 await expect(page.locator('#warcraft-panel')).toBeVisible();
 await expect(page.locator('#warcraft-cards .warcraft-card')).toHaveCount(1);
 await page.locator('.warcraft-card').click();
 await expect(page).toHaveURL(/#classes\/death-knight$/);
 await expect(page.locator('#detail-panel')).toBeVisible();
 await expect(page.locator('#detail-title')).toHaveText('Рыцарь смерти');
 await expect(page.locator('#detail-overview')).toContainText('Рыцарь смерти');
 await expect(page.locator('#detail-original')).toHaveText('Death Knight');
 await expect(page.locator('#class-level-rows tr')).toHaveCount(20);
 await expect(page.locator('#class-facts-list')).toContainText('Сила и Харизма');
 await page.locator('#detail-back').click();
 await expect(page.locator('#warcraft-panel')).toBeVisible();
});
test('Warcraft species empty state and class search work on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/archive/#species');
 await expect(page.locator('#catalog-no-results')).toBeVisible();
 await page.locator('#mobile-menu').click();
 await page.locator('[data-page="classes"]').click();
 await expect(page).toHaveURL(/#classes$/);
 await expect(page.locator('#page-title')).toHaveText('Классы');
 await page.locator('#archive-search').fill('неизвестный');
 await expect(page.locator('.warcraft-card')).toHaveCount(0);
 await page.locator('#archive-search').fill('Death');
 await expect(page.locator('.warcraft-card')).toHaveCount(1);
});

test('Death Knight reference has complete level progression and interactive sections',async({page})=>{
 await page.goto('/archive/#classes/death-knight');
 await expect(page.locator('#detail-panel')).toBeVisible();
 await expect(page.locator('#class-level-rows tr')).toHaveCount(20);
 await expect(page.locator('#class-level-rows tr').first()).toContainText('Лик смерти');
 await expect(page.locator('#class-level-rows tr').last()).toContainText('Всадник Апокалипсиса');
 expect(await page.locator('.class-feature').count()).toBeGreaterThan(18);
 await page.locator('[data-rune="frost"]').click();
 await expect(page.locator('.rune-summary')).toContainText('холодом');
 await page.locator('[data-class-tab="description"]').click();
 await expect(page.locator('#class-reading')).toBeHidden();
 await expect(page.locator('#class-other-tab')).toContainText('Рыцарь смерти');
 await page.locator('[data-class-tab="spells"]').click();
 await expect(page.locator('#class-other-tab')).toContainText('Заклинания Чёрного клинка');
 await page.locator('[data-class-tab="base"]').click();
 await expect(page.locator('#class-reading')).toBeVisible();
});
test('Death Knight reference remains readable on narrow screens',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/archive/#classes/death-knight');
 await expect(page.locator('#class-level-rows tr')).toHaveCount(20);
 await expect(page.locator('.class-table-scroll')).toBeVisible();
 await expect(page.locator('#settings-button')).toBeVisible();
 await page.locator('#settings-button').click();
 await expect(page.locator('#settings-dialog')).toHaveAttribute('open','');
 await expect(page.locator('#settings-dialog')).toBeVisible();
});

test('Archive uses the parent WreckTrack header, favicon and identical app switcher',async({page})=>{
 await page.goto('/');
 const rootIcon=await page.locator('.topbar .brand-mark img').getAttribute('src');
 await expect(page.locator('.topbar .topnav-button')).toHaveCount(4);
 await page.locator('#brand-home').click();
 await expect(page.getByRole('menu',{name:'Приложения Wreck'})).toBeVisible();
 await page.getByRole('menuitem',{name:/WreckArchive/}).click();
 await expect(page).toHaveURL(/\/archive\/$/);
 await expect(page.locator('.topbar .topnav-button')).toHaveCount(0);
 await expect(page.locator('.topbar .brand-name')).toHaveText('WreckArchive');
 const archiveIcon=await page.locator('.topbar .brand-mark img').getAttribute('src');
 const rootPath=await page.evaluate(src=>new URL(src,location.origin+'/').pathname,rootIcon);
 const archivePath=await page.evaluate(src=>new URL(src,document.baseURI).pathname,archiveIcon);
 expect(archivePath).toBe(rootPath);
 await expect(page.locator('.topbar .save-status')).toBeVisible();
 await expect(page.locator('#settings-button.topbar-settings-button')).toBeVisible();
 await expect(page.locator('#account-button.account-button')).toBeVisible();
 await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveAttribute('href',/\.\.\/icon32x32\.png/);
 await page.locator('#project-switch').click();
 const menu=page.getByRole('menu',{name:'Приложения Wreck'});
 await expect(menu.getByRole('menuitem')).toHaveCount(2);
 await expect(menu).not.toContainText('WreckLib');
 await menu.getByRole('menuitem',{name:/WreckTrack/}).click();
 await expect(page).toHaveURL(/\/$/);
});
test('Theme and heading font persist both ways when switching projects',async({page})=>{
 await page.goto('/archive/#classes/death-knight');
 await page.locator('#settings-button').click();
 await page.locator('[data-accent="purple"]').click();
 await page.locator('[data-font="neuzeit"]').click();
 await page.locator('#interface-density').fill('1');
 await expect(page.locator('html')).toHaveAttribute('data-accent','purple');
 await expect(page.locator('html')).toHaveAttribute('data-font','neuzeit');
 await page.locator('#settings-dialog [data-close]').click();
 await page.locator('#project-switch').click();
 await page.getByRole('menuitem',{name:/WreckTrack/}).click();
 await expect(page.locator('html')).toHaveAttribute('data-accent','purple');
 await expect(page.locator('html')).toHaveAttribute('data-font','neuzeit');
 await page.locator('#brand-home').click();
 await page.getByRole('menuitem',{name:/WreckArchive/}).click();
 await expect(page.locator('html')).toHaveAttribute('data-accent','purple');
 await expect(page.locator('html')).toHaveAttribute('data-font','neuzeit');
 await expect(page.locator('html')).toHaveAttribute('data-density','1');
});
test('Account button opens shared-style account dialog from the class page',async({page})=>{
 await page.goto('/archive/#classes/death-knight');
 await page.locator('#account-button').click();
 await expect(page.locator('#auth-dialog')).toHaveAttribute('open','');
 await expect(page.locator('#auth-title')).toHaveText('Вход в аккаунт');
 await expect(page.locator('#auth-google')).toBeVisible();
 await page.locator('#auth-dialog [data-close]').click();
 await expect(page.locator('#auth-dialog')).toBeHidden();
});
test('Archive compact mobile header stays inside viewport',async({page})=>{
 await page.setViewportSize({width:360,height:740});
 await page.goto('/archive/#classes/death-knight');
 await expect(page.locator('#mobile-menu')).toBeVisible();
 await expect(page.locator('#account-button')).toBeVisible();
 await expect(page.locator('#settings-button')).toBeVisible();
 const width=await page.evaluate(()=>document.documentElement.scrollWidth);
 expect(width).toBeLessThanOrEqual(361);
});
