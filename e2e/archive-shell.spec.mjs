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
