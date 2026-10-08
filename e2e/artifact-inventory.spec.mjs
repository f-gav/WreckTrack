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

  await page.locator('.bestiary-card').filter({hasText:'Дон Кихот'}).click();
  await page.locator('[data-detail-page="2"]').click();
  await expect(page.locator('.detail-artifacts-block')).toHaveCount(0);
  await expect(page.locator('.detail-toc-link')).toHaveCount(1);
  await expect(page.locator('.detail-toc-link')).toContainText('Инвентарь');
  await expect(page.locator('.detail-toc-mark')).toHaveText('H1');
  await expect(page.locator('.detail-toc .detail-page-nav')).toBeVisible();
  await page.evaluate(()=>{document.documentElement.dataset.font='old-town'});
  await expect(page.locator('.detail-page-button').first()).toHaveCSS('font-family',/Old Town/);
  await page.locator('#detail-dialog [data-close="detail-dialog"]').click();
  await page.evaluate(()=>{delete document.documentElement.dataset.font});

  await page.getByRole('button',{name:'Библиотека'}).first().click();
  await page.getByRole('button',{name:/Артефакты/}).click();
  await page.locator('#grid-new-library-item').click();
  await page.locator('#library-item-name').fill('Копьё Рассвета');
  await page.locator('#library-item-description').fill('Редкий артефакт');
  await page.locator('#library-item-details').fill('## Солнечный выпад\nНаносит дополнительный урон светом.\n\n**Сияние.** Освещает область вокруг владельца.');
  await page.locator('#library-item-form').getByRole('button',{name:'Сохранить'}).click();

  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('.bestiary-card').filter({hasText:'Дон Кихот'}).click();
  await page.locator('[data-detail-page="2"]').click();
  await page.getByRole('button',{name:'Управлять артефактами'}).click();
  await expect(page.locator('#creature-artifact-dialog')).toBeVisible();
  await expect(page.locator('#creature-artifact-checks')).toContainText('Копьё Рассвета');
  await page.locator('#creature-artifact-checks').getByText('Копьё Рассвета',{exact:true}).click();
  await page.locator('#creature-artifact-save').click();
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
  await expect(page.locator('.detail-toc-link')).toHaveCount(2);
  await expect(page.locator('.detail-toc-link').nth(0)).toContainText('Копьё Рассвета');
  await expect(page.locator('.detail-toc-link').nth(1)).toContainText('Инвентарь');
  await expect(page.locator('.detail-toc-mark')).toHaveText(['H1','H1']);
  await expect(page.locator('#detail-dialog .detail-toc')).not.toContainText('Способности');
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

  await page.getByRole('button',{name:'Управлять артефактами'}).click();
  await page.locator('#creature-artifact-checks input[type="checkbox"]').uncheck();
  await page.locator('#creature-artifact-save').click();
  await expect(page.locator('.detail-artifacts-block')).toHaveCount(0);
  await expect(page.locator('.detail-toc-link')).toHaveCount(1);
  await expect(page.locator('.detail-toc-link')).toContainText('Инвентарь');
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
  await page.locator('#library-item-details').fill('**Память.** Хранит чужое воспоминание.\n- [ ] Открыть воспоминание\nЗаряды [x] [ ]');
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
  await page.locator('.detail-artifact summary').click();
  const task=page.locator('.detail-artifact-body [data-artifact-task]');
  const resources=page.locator('.detail-artifact-body [data-artifact-resource]');
  await expect(task).not.toBeChecked();
  await expect(resources).toHaveCount(2);
  await expect(resources.nth(0)).toHaveAttribute('aria-pressed','true');
  await expect(resources.nth(1)).toHaveAttribute('aria-pressed','false');
  await task.check();
  await resources.nth(1).click();
  await expect(task).toBeChecked();
  await expect(resources.nth(1)).toHaveAttribute('aria-pressed','true');
  await page.waitForTimeout(450);

  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('gm-archive-v2')));
  const storedRoom=stored.rooms.find(room=>room.name==='Таверна');
  const storedArtifact=stored.library.artifacts.find(item=>item.name==='Старый медальон');
  const storedEntry=storedRoom.entries.find(entry=>entry.npc?.name==='Хозяин таверны');
  const controls=storedRoom.artifactStates[storedEntry.id][storedArtifact.id].controls;
  expect(controls['task:1']).toBe(true);
  expect(Object.entries(controls).some(([key,value])=>key.startsWith('resource:2:')&&value===true)).toBe(true);
  expect(storedArtifact.details).toContain('- [ ] Открыть воспоминание');
  expect(storedArtifact.details).toContain('Заряды [x] [ ]');

  await page.reload();
  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.locator('.room-card').filter({hasText:'Таверна'}).first().click();
  await page.getByText('Хозяин таверны',{exact:true}).first().click();
  await page.locator('[data-detail-page="2"]').click();
  await page.locator('.detail-artifact summary').click();
  await expect(page.locator('.detail-artifact-body [data-artifact-task]')).toBeChecked();
  await expect(page.locator('.detail-artifact-body [data-artifact-resource]').nth(1)).toHaveAttribute('aria-pressed','true');

  await page.getByRole('button',{name:'Управлять артефактами'}).click();
  await page.locator('#creature-artifact-checks input[type="checkbox"]').uncheck();
  await page.locator('#creature-artifact-save').click();
  await expect(page.locator('.detail-artifacts-block')).toHaveCount(0);
  await page.waitForTimeout(350);
  const afterRemove=await page.evaluate(()=>JSON.parse(localStorage.getItem('gm-archive-v2')));
  const removedRoom=afterRemove.rooms.find(room=>room.name==='Таверна');
  const removedEntry=removedRoom.entries.find(entry=>entry.npc?.name==='Хозяин таверны');
  expect(removedEntry.npc.artifactIds).toEqual([]);
  expect(removedRoom.artifactStates?.[removedEntry.id]).toBeUndefined();
});
