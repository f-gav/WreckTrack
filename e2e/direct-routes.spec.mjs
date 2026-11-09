import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
});

test('top-level sections have direct shareable URLs',async({page})=>{
  const cases=[
    ['/rooms/','Комнаты'],
    ['/bestiary/','Бестиарий'],
    ['/library/','Библиотека'],
    ['/tokenator/','Токенатор'],
    ['/settings/','Настройки']
  ];
  for(const [path,title] of cases){
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(path.replaceAll('/','\\/')+'$'));
    await expect(page.locator('main h1').first()).toHaveText(title);
  }
});

test('section navigation updates URL and direct route survives reload',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await expect(page).toHaveURL(/\/rooms\/$/);
  await expect(page.locator('main h1')).toHaveText('Комнаты');

  await page.reload();
  await expect(page).toHaveURL(/\/rooms\/$/);
  await expect(page.locator('main h1')).toHaveText('Комнаты');

  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await expect(page).toHaveURL(/\/bestiary\/$/);

  await page.getByRole('button',{name:'Библиотека'}).first().click();
  await expect(page).toHaveURL(/\/library\/$/);

  await page.getByRole('button',{name:'Токенатор'}).first().click();
  await expect(page).toHaveURL(/\/tokenator\/$/);

  await page.getByRole('button',{name:'Настройки'}).click();
  await expect(page).toHaveURL(/\/settings\/$/);
  await expect(page.locator('main h1')).toHaveText('Настройки');

  await page.locator('#brand-home').click();
  const menu=page.getByRole('menu',{name:'Приложения Wreck'});
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem')).toHaveCount(2);
  await expect(menu.getByText('WreckLib')).toHaveCount(0);
  await menu.getByRole('menuitem',{name:/WreckTrack/}).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('main h1')).toHaveText('WreckTrack');
});

test('project switcher opens the independent WreckArchive shell and returns to WreckTrack',async({page})=>{
  await page.goto('/');
  const trigger=page.locator('#brand-home');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded','false');

  await trigger.click();
  await page.getByRole('menu',{name:'Приложения Wreck'})
    .getByRole('menuitem',{name:/WreckArchive/}).click();
  await expect(page).toHaveURL(/\/archive\/$/);
  await expect(page.locator('main h1')).toHaveText('WreckArchive');
  await expect(page.getByText('Скоро')).toHaveCount(9);
  await expect(page.getByRole('menuitem',{name:/WreckLib/})).toHaveCount(0);
  await page.getByRole('button',{name:/WreckArchive/}).click();
  await page.getByRole('menuitem',{name:/WreckTrack/}).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('main h1')).toHaveText('WreckTrack');
});
