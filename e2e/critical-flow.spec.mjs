import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    localStorage.clear();
    indexedDB.deleteDatabase('initiative-cloud-sync-v1');
  });
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
});

test('critical local combat flow survives reload',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#save-status')).toHaveAttribute('data-state','saved');

  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('#grid-new-creature').click();
  await page.locator('#creature-name').fill('E2E Goblin');
  await page.locator('#creature-hp').fill('20');
  await page.locator('#creature-ac').fill('13');
  await page.locator('#creature-form').getByRole('button',{name:'Сохранить'}).click();
  await expect(page.getByText('E2E Goblin',{exact:true}).first()).toBeVisible();

  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.locator('#new-room').click();
  await page.locator('#room-name').fill('E2E Room');
  await page.locator('#room-form').getByRole('button',{name:'Сохранить'}).click();
  await page.getByText('E2E Room',{exact:true}).click();

  await page.locator('#add-from-bestiary').click();
  await page.getByRole('button',{name:/Добавить ещё одну копию E2E Goblin/}).click();
  await page.locator('#membership-submit').click();

  await page.locator('[data-initiative]').fill('18');
  await page.locator('[data-initiative]').dispatchEvent('change');
  await page.locator('#start-combat').click();
  await expect(page.locator('.initiative-row.is-turn')).toContainText('E2E Goblin');

  await page.locator('[data-current-hp]').click();
  await page.locator('[data-hp-amount]').fill('5');
  await page.locator('[data-hp-change="damage"]').click();
  await expect(page.locator('[data-current-hp]')).toHaveValue('15');

  await expect(page.locator('#save-status')).toHaveAttribute('data-state','saving');
  await expect(page.locator('#save-status')).toHaveAttribute('data-state','saved',{timeout:3000});

  await page.reload();
  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.getByText('E2E Room',{exact:true}).click();
  await expect(page.locator('[data-current-hp]')).toHaveValue('15');
  await expect(page.locator('.initiative-row.is-turn')).toContainText('E2E Goblin');
  await expect(page.locator('.round-step.current')).toHaveText('1');
  await expect(page.locator('#save-status')).toHaveAttribute('data-state','saved');
});
