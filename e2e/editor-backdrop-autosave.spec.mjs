import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.clear());
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
});

async function clickBackdrop(page,dialogId){
  const dialog=page.locator('#'+dialogId);
  const bounds=await dialog.boundingBox();
  expect(bounds).toBeTruthy();
  await page.mouse.click(1,1);
}

test('creature editor saves creation and edits on accidental backdrop click',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('#grid-new-creature').click();
  await page.locator('#creature-name').fill('Страж чернил');
  await page.locator('#creature-abilities').fill('**Тестовая способность**');
  await clickBackdrop(page,'creature-dialog');
  await expect(page.locator('#creature-dialog')).not.toBeVisible();
  const card=page.locator('.bestiary-card').filter({hasText:'Страж чернил'});
  await expect(card).toBeVisible();
  await card.click();
  await page.locator('#detail-dialog [data-edit-creature]').click();
  await page.locator('#creature-abilities').fill('*Изменённая способность*');
  await clickBackdrop(page,'creature-dialog');
  await expect(page.locator('#creature-dialog')).not.toBeVisible();
  await expect.poll(async()=>page.evaluate(()=>{
    const data=JSON.parse(localStorage.getItem('gm-archive-v2'));
    return data?.bestiary?.find(x=>x.name==='Страж чернил')?.abilities;
  })).toBe('*Изменённая способность*');
});

test('artifact editor saves creation and edits on backdrop, while explicit cancel discards',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Библиотека'}).first().click();
  await page.getByRole('button',{name:/Артефакты/}).click();
  await page.locator('#grid-new-library-item').click();
  await page.locator('#library-item-name').fill('Талисман ночи');
  await page.locator('#library-item-details').fill('**Оригинальный эффект**');
  await clickBackdrop(page,'library-item-dialog');
  await expect(page.locator('#library-item-dialog')).not.toBeVisible();
  const card=page.locator('.library-card').filter({hasText:'Талисман ночи'});
  await expect(card).toBeVisible();
  await card.locator('[data-edit-library-item]').click();
  await page.locator('#library-item-details').fill('*Обновлённый эффект*');
  await clickBackdrop(page,'library-item-dialog');
  await expect(page.locator('#library-item-dialog')).not.toBeVisible();
  await card.locator('[data-edit-library-item]').click();
  await expect(page.locator('#library-item-details')).toHaveValue('*Обновлённый эффект*');
  await page.locator('#library-item-details').fill('Не сохранять');
  await page.locator('#library-item-form [data-close="library-item-dialog"]').click();
  await card.locator('[data-edit-library-item]').click();
  await expect(page.locator('#library-item-details')).toHaveValue('*Обновлённый эффект*');
});

test('empty required name does not accidentally dismiss or create an incomplete creature',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('#grid-new-creature').click();
  await page.locator('#creature-notes').fill('Несохранённый текст');
  await clickBackdrop(page,'creature-dialog');
  await expect(page.locator('#creature-dialog')).toBeVisible();
  await expect(page.locator('#creature-notes')).toHaveValue('Несохранённый текст');
});
