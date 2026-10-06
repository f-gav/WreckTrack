import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{if(sessionStorage.getItem('__wrecktrack_e2e_ready')==='1')return;localStorage.clear();sessionStorage.clear();sessionStorage.setItem('__wrecktrack_e2e_ready','1')});
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
});

test('Library ships standard conditions and supports CRUD, search, tags and artifacts',async({page})=>{
  await page.goto('/');
  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  const navLabels=await page.locator('.topnav-button').allTextContents();
  expect(navLabels).toEqual(['Бестиарий','Комнаты','Библиотека','Токенатор']);

  await page.getByRole('button',{name:'Библиотека'}).first().click();
  await expect(page.locator('main h1')).toHaveText('Библиотека');
  await expect(page.getByRole('button',{name:/Состояния/})).toBeVisible();
  await expect(page.getByRole('button',{name:/Артефакты/})).toBeVisible();

  await page.getByRole('button',{name:/Состояния/}).click();
  await expect(page.locator('main h1')).toHaveText('Состояния');
  await expect(page.locator('.library-card')).toHaveCount(0);
  await expect(page.getByText('Предустановить',{exact:true})).toBeVisible();
  await page.getByText('Предустановить',{exact:true}).click();
  await page.getByRole('button',{name:'Предустановить состояния 5е24'}).click();
  await expect(page.locator('.library-card')).toHaveCount(15);
  await expect(page.locator('.library-card').first()).toContainText('Состояние 01');
  await expect(page.locator('.library-card').first()).toContainText('Состояние 5е24');
  await expect(page.getByText('Ослеплённый (5е24)',{exact:true})).toBeVisible();
  await expect(page.getByText('Бессознательный (5е24)',{exact:true})).toBeVisible();
  await page.locator('.library-card').filter({hasText:'Ослеплённый (5е24)'}).click();
  await expect(page.locator('#library-detail-dialog')).toBeVisible();
  await expect(page.locator('#library-detail-dialog')).toContainText('Ослеплённый (5е24)');
  await expect(page.locator('#library-detail-dialog')).toContainText('Не можете видеть. Вы не можете видеть и автоматически проваливаете проверки характеристик, требующие зрения.');
  await page.locator('#library-detail-dialog [data-close="library-detail-dialog"]').first().click();
  await expect(page.locator('main').getByText('JSON',{exact:false})).toHaveCount(0);

  await page.locator('#library-search').fill('невидимый');
  await expect(page.locator('.library-card')).toHaveCount(1);
  await expect(page.locator('.library-card')).toContainText('Невидимый (5е24)');
  await page.locator('#library-search').fill('');

  await page.locator('#new-library-item').click();
  await page.locator('#library-item-name').fill('Горение');
  await page.locator('#library-item-description').fill('Пользовательское состояние');
  await page.locator('#library-item-details').fill('Получает периодический урон.');
  await page.locator('#library-item-form').getByRole('button',{name:'Сохранить'}).click();
  await expect(page.getByText('Горение',{exact:true})).toBeVisible();
  await expect(page.locator('.library-card').filter({hasText:'Горение'})).toContainText('Состояние 16');

  page.once('dialog',dialog=>dialog.accept());
  await page.getByText('Предустановить',{exact:true}).click();
  await page.getByRole('button',{name:'Предустановить состояния 5е14'}).click();
  await expect(page.locator('.library-card')).toHaveCount(16);
  await expect(page.getByText('Сбитый с ног / Лежащий ничком (5е14)',{exact:true})).toBeVisible();
  await expect(page.locator('.library-card').first()).toContainText('Состояние 5е14');
  await expect(page.getByText('Горение',{exact:true})).toBeVisible();
  await expect(page.getByText('Опрокинутый (5е24)',{exact:true})).toHaveCount(0);
  await page.locator('#library-search').fill('оглохший');
  await expect(page.locator('.library-card')).toHaveCount(1);
  await expect(page.getByText('Оглохший (5е14)',{exact:true})).toBeVisible();
  await page.locator('.library-card').click();
  await expect(page.locator('#library-detail-dialog')).toContainText('Оглохшее существо ничего не слышит и автоматически проваливает все проверки характеристик, связанные со слухом.');
  await page.locator('#library-detail-dialog [data-close="library-detail-dialog"]').first().click();
  await page.locator('#library-search').fill('');

  await page.locator('#manage-library-tags').click();
  await page.locator('#add-tag').click();
  const tagRow=page.locator('#tag-editor-list .tag-editor-row').last();
  await tagRow.locator('[data-tag-name]').fill('Контроль');
  await page.locator('#tags-form').getByRole('button',{name:'Сохранить теги'}).click();

  const burning=page.locator('.library-card').filter({hasText:'Горение'});
  await burning.locator('[data-edit-library-item]').click();
  await page.locator('#library-item-tag-select summary').click();
  await page.locator('#library-item-tag-checks input').last().check();
  await page.locator('#library-item-form').getByRole('button',{name:'Сохранить'}).click();
  await page.locator('#library-tag-select summary').click();
  await page.locator('#library-tag-options [data-library-tag]').last().check();
  await expect(page.locator('.library-card')).toHaveCount(1);
  await expect(page.locator('.library-card')).toContainText('Горение');

  await page.getByRole('button',{name:'Библиотека'}).first().click();
  await page.getByRole('button',{name:/Артефакты/}).click();
  await expect(page.locator('.library-card')).toHaveCount(0);
  await page.locator('#new-library-item').click();
  await page.locator('#library-item-name').fill('Сфера Рассвета');
  await page.locator('#library-item-description').fill('Редкая реликвия');
  await page.locator('#library-item-form').getByRole('button',{name:'Сохранить'}).click();
  await expect(page.locator('.library-card')).toHaveCount(1);
  await expect(page.locator('.library-card')).toContainText('Артефакт 01');
  await expect(page.locator('.library-card')).toContainText('Сфера Рассвета');
  await expect(page.locator('#save-status')).toHaveAttribute('data-state','saved',{timeout:3000});

  await page.reload();
  await page.getByRole('button',{name:'Библиотека'}).first().click();
  await page.getByRole('button',{name:/Артефакты/}).click();
  await expect(page.getByText('Сфера Рассвета',{exact:true})).toBeVisible();
});

test('Library tag synchronization merges Library tags into Bestiary tags',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Библиотека'}).first().click();
  await page.getByRole('button',{name:/Состояния/}).click();
  await page.locator('#manage-library-tags').click();
  await page.locator('#add-tag').click();
  await page.locator('#tag-editor-list .tag-editor-row').last().locator('[data-tag-name]').fill('Общий тег');
  await page.locator('#tags-form').getByRole('button',{name:'Сохранить теги'}).click();

  await page.locator('.topbar-settings-button').click();
  await page.locator('[data-settings-section="library"]').click();
  const toggle=page.locator('#library-sync-tags');
  await expect(toggle).not.toBeChecked();
  await page.locator('label[for="library-sync-tags"]').click();
  await expect(toggle).toBeChecked();

  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('#manage-tags').click();
  await expect(page.locator('#tag-editor-list [data-tag-name]').last()).toHaveValue('Общий тег');
});
