import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    if(sessionStorage.getItem('__wrecktrack_artifact_e2e_ready')==='1')return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('__wrecktrack_artifact_e2e_ready','1');
  });
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
});

test('artifacts can be assigned to creatures and appear above inventory on page two',async({page})=>{
  await page.goto('/');

  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('#grid-new-creature').click();
  await page.locator('#creature-name').fill('Дон Кихот');
  await page.locator('#creature-description').fill('Честный авантюрист');
  await page.locator('#creature-hp').fill('40');
  await page.locator('#creature-ac').fill('15');
  await page.locator('#creature-characteristics').fill('С:0 | Л:3 | Т:2');
  await page.locator('#creature-abilities').fill('## Способности\n**Праведное восстановление.**');
  await page.locator('#creature-inventory').fill('## Снаряжение\n- Верёвка\n- [ ] Факел');
  await page.locator('#creature-form').getByRole('button',{name:'Сохранить'}).click();
  await expect(page.getByText('Дон Кихот',{exact:true}).first()).toBeVisible();

  await page.getByRole('button',{name:'Библиотека'}).first().click();
  await page.getByRole('button',{name:/Артефакты/}).click();
  await page.locator('#grid-new-library-item').click();
  await page.locator('#library-item-name').fill('Копьё Рассвета');
  await page.locator('#library-item-description').fill('Редкий артефакт');
  await page.locator('#library-item-details').fill('## Солнечный выпад\nНаносит дополнительный урон светом.\n\n**Сияние.** Освещает область вокруг владельца.');
  await page.locator('#library-item-form').getByRole('button',{name:'Сохранить'}).click();

  const artifactCard=page.locator('.library-card').filter({hasText:'Копьё Рассвета'});
  await artifactCard.getByRole('button',{name:/Добавить Копьё Рассвета существу/}).click();
  await expect(page.locator('#artifact-assignment-dialog')).toBeVisible();
  await page.locator('#artifact-assignment-checks').getByText('Дон Кихот',{exact:true}).click();
  await page.locator('#artifact-assignment-save').click();

  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('.bestiary-card').filter({hasText:'Дон Кихот'}).click();
  await expect(page.locator('#detail-dialog')).toBeVisible();
  await expect(page.locator('.detail-top h3')).toHaveText('Дон Кихот');
  await expect(page.locator('.detail-description')).toHaveText('Честный авантюрист');
  await expect(page.locator('.detail-stat')).toHaveCount(2);
  await expect(page.getByText('Копьё Рассвета',{exact:true})).toHaveCount(0);

  await page.locator('[data-detail-page="2"]').click();
  await expect(page.locator('.detail-card')).toHaveClass(/detail-page-two/);
  await expect(page.locator('.detail-top h3')).toHaveText('Дон Кихот');
  await expect(page.locator('.detail-description')).toHaveText('Честный авантюрист');
  await expect(page.locator('.detail-stat')).toHaveCount(0);
  await expect(page.locator('.detail-artifact')).toHaveCount(1);
  await expect(page.locator('.detail-artifact summary')).toContainText('Копьё Рассвета');
  await expect(page.locator('.detail-inventory-markdown')).toContainText('Верёвка');
  await expect(page.locator('.detail-artifact-body')).not.toBeVisible();

  await page.locator('.detail-artifact summary').click();
  await expect(page.locator('.detail-artifact-body')).toBeVisible();
  await expect(page.locator('.detail-artifact-body')).toContainText('Солнечный выпад');
  await expect(page.locator('.detail-artifact-body')).toContainText('Освещает область вокруг владельца.');

  await page.locator('#detail-dialog [data-close="detail-dialog"]').click();
  await page.reload();
  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('.bestiary-card').filter({hasText:'Дон Кихот'}).click();
  await page.locator('[data-detail-page="2"]').click();
  await expect(page.locator('.detail-artifact summary')).toContainText('Копьё Рассвета');
  await expect(page.locator('.detail-inventory-markdown')).toContainText('Верёвка');
});

test('artifact assignment can target a room NPC',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.locator('#new-room').click();
  await page.locator('#room-name').fill('Таверна');
  await page.locator('#room-form').getByRole('button',{name:'Сохранить'}).click();
  await page.getByText('Таверна',{exact:true}).click();
  await page.locator('#create-npc').click();
  await page.locator('#creature-name').fill('Хозяин таверны');
  await page.locator('#creature-inventory').fill('Ключи от кладовой');
  await page.locator('#creature-form').getByRole('button',{name:'Сохранить'}).click();

  await page.getByRole('button',{name:'Библиотека'}).first().click();
  await page.getByRole('button',{name:/Артефакты/}).click();
  await page.locator('#grid-new-library-item').click();
  await page.locator('#library-item-name').fill('Старый медальон');
  await page.locator('#library-item-details').fill('**Память.** Хранит чужое воспоминание.');
  await page.locator('#library-item-form').getByRole('button',{name:'Сохранить'}).click();
  await page.locator('.library-card').filter({hasText:'Старый медальон'}).getByRole('button',{name:/Добавить Старый медальон существу/}).click();
  await expect(page.locator('#artifact-assignment-checks')).toContainText('Хозяин таверны');
  await expect(page.locator('#artifact-assignment-checks')).toContainText('Таверна');
  await page.locator('#artifact-assignment-checks').getByText('Хозяин таверны',{exact:true}).click();
  await page.locator('#artifact-assignment-save').click();

  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.locator('.room-card').filter({hasText:'Таверна'}).first().click();
  await page.getByText('Хозяин таверны',{exact:true}).first().click();
  await page.locator('[data-detail-page="2"]').click();
  await expect(page.locator('.detail-artifact summary')).toContainText('Старый медальон');
  await expect(page.locator('.detail-inventory-markdown')).toContainText('Ключи от кладовой');
});
