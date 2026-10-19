import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.clear());
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
});

test('WreckSnake renders and plays using the account mini-game dialog',async({page})=>{
  await page.goto('/');
  // The game itself works locally; the public leaderboard requires a real Google session.
  await page.evaluate(()=>snakeOpen());
  await expect(page.locator('#snake-dialog')).toBeVisible();
  await expect(page.locator('#snake-score')).toHaveText('0');
  await expect(page.locator('#snake-canvas')).toBeVisible();
  await expect(page.locator('#snake-colors')).toHaveCount(0);
  await expect(page.locator('#snake-dialog .snake-layout')).toHaveCSS('display','grid');
  const left=await page.locator('#snake-canvas').boundingBox();
  const right=await page.locator('.snake-leaders').boundingBox();
  if(page.viewportSize().width>760){expect(right.x).toBeGreaterThan(left.x+left.width)}else{expect(right.y).toBeGreaterThan(left.y+left.height)}
  await page.locator('#snake-start').click();
  await expect(page.locator('#snake-start')).toHaveText('Пауза');
  await page.keyboard.press('Space');
  await expect(page.locator('#snake-start')).toHaveText('Продолжить');
  await page.locator('#snake-restart').click();
  await expect(page.locator('#snake-start')).toHaveText('Пауза');
  await page.locator('#snake-close').click();
  await expect(page.locator('#snake-dialog')).not.toBeVisible();
});

test('account archive exposes the Mini-games entry when signed in',async({page})=>{
  await page.goto('/');
  await page.evaluate(()=>{
    authSession={user:{id:'test-player',email:'test@example.invalid'}};
    renderAuthDialog();
  });
  await page.locator('#auth-dialog').evaluate(el=>el.showModal());
  await expect(page.locator('#open-snake')).toBeVisible();
  await page.locator('#open-snake').click();
  await expect(page.locator('#snake-dialog')).toBeVisible();
});
