import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.clear());
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
});

test('alternative create mode turns new creature and artifact forms into card-style editors',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#back-home')).toHaveCount(0);
  await page.getByRole('button',{name:'Настройки'}).click();
  const toggle=page.locator('#alternative-create');
  await expect(toggle).not.toBeChecked();
  await page.locator('label[for="alternative-create"]').click();
  await expect(toggle).toBeChecked();

  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('#grid-new-creature').click();
  const creatureForm=page.locator('#creature-form');
  await expect(creatureForm).toHaveClass(/alternative-create-mode/);
  await expect(page.locator('.alternative-create-sidebar')).toBeVisible();
  await expect(page.locator('label[for="creature-hp"]')).toHaveText('ХП');
  await expect(page.locator('#creature-description')).toHaveAttribute('placeholder','Например, Гоблин - Колдун');
  await expect(page.locator('.detail-page-button[data-alt-create-page="1"]')).toHaveClass(/current/);
  const pageNavBox=await page.locator('.alternative-create-page-nav').boundingBox();
  const actionsBox=await page.locator('#creature-form .creature-dialog-actions').boundingBox();
  expect(pageNavBox).toBeTruthy();
  expect(actionsBox).toBeTruthy();
  expect(pageNavBox.y+pageNavBox.height).toBeLessThanOrEqual(actionsBox.y+1);
  const pageNavY=pageNavBox.y;
  await page.locator('#creature-form .creature-dialog-scroll').evaluate(node=>{node.scrollTop=node.scrollHeight});
  await expect.poll(async()=>Math.round((await page.locator('.alternative-create-page-nav').boundingBox()).y)).toBe(Math.round(pageNavY));
  await expect(page.locator('#creature-inventory')).not.toBeVisible();
  await page.locator('#creature-name').fill('Альтернативный герой');
  await page.locator('#creature-description').fill('Проверка карточного редактора');
  await page.locator('#creature-hp').fill('31');
  await page.locator('#creature-ac').fill('16');
  await page.locator('#creature-abilities').fill('## Приём\n**Рывок.** Быстро перемещается.');
  await page.locator('[data-alt-create-page="2"]').click();
  await expect(creatureForm).toHaveAttribute('data-alt-create-page','2');
  await expect(page.locator('#creature-inventory')).toBeVisible();
  await expect(page.locator('#creature-hp')).not.toBeVisible();
  await page.locator('#creature-inventory').fill('- Фонарь\n- Верёвка');
  await creatureForm.getByRole('button',{name:'Сохранить'}).click();
  await expect(page.locator('.bestiary-card').filter({hasText:'Альтернативный герой'})).toBeVisible();

  await page.getByRole('button',{name:'Библиотека'}).first().click();
  await page.getByRole('button',{name:/Артефакты/}).click();
  await page.locator('#grid-new-library-item').click();
  const libraryForm=page.locator('#library-item-form');
  await expect(libraryForm).toHaveClass(/alternative-create-mode/);
  await page.locator('#library-item-name').fill('Камень ветра');
  await page.locator('#library-item-description').fill('Редкий артефакт');
  await page.locator('#library-item-details').fill('## Порыв\nДаёт владельцу ускорение.');
  await libraryForm.getByRole('button',{name:'Сохранить'}).click();
  await expect(page.locator('.library-card').filter({hasText:'Камень ветра'})).toBeVisible();

  await page.getByRole('button',{name:'Библиотека'}).first().click();
  await page.getByRole('button',{name:/Состояния/}).click();
  await page.locator('#grid-new-library-item').click();
  await expect(page.locator('#library-item-form')).not.toHaveClass(/alternative-create-mode/);
});

test('alternative create mode does not replace existing edit forms',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('initiative-alternative-create-v1','true'));
  await page.goto('/');
  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('#grid-new-creature').click();
  await page.locator('#creature-name').fill('Редактируемый');
  await page.locator('#creature-form').getByRole('button',{name:'Сохранить'}).click();
  const card=page.locator('.bestiary-card').filter({hasText:'Редактируемый'});
  await card.click();
  await expect(page.locator('#detail-dialog')).toBeVisible();
  await page.locator('#detail-dialog [data-edit-creature]').click();
  await expect(page.locator('#creature-form')).not.toHaveClass(/alternative-create-mode/);
});
