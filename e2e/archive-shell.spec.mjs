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
 await expect(page.locator('#project-menu a')).toHaveCount(2);
 await expect(page.locator('#project-menu')).not.toContainText('WreckLib');
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
 await expect(page.locator('#detail-original')).toHaveText('Death Knight');
 await expect(page.locator('#detail-panel')).toContainText('Ожидает наполнения');
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
 await expect(page.locator('.class-feature')).toHaveCount(22);
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
 await expect(page.locator('#settings-dialog')).toBeVisible();
});
