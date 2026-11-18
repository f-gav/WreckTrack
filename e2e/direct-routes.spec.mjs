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
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('main h1')).toHaveText('WreckTrack');
  await expect(page.locator('.project-switcher-menu')).toHaveCount(0);
});

test('clicking the logo or title returns to WreckTrack home from every section',async({page})=>{
  for(const path of ['/bestiary/','/rooms/','/library/','/tokenator/','/settings/']){
    await page.goto(path);
    const brand=page.locator('#brand-home');
    await expect(brand.locator('.brand-mark img')).toBeVisible();
    await expect(brand.locator('.brand-name')).toHaveText('WreckTrack');
    await brand.locator('.brand-mark').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('main h1')).toHaveText('WreckTrack');

    await page.goto(path);
    await brand.locator('.brand-name').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('main h1')).toHaveText('WreckTrack');
  }
  await expect(page.locator('#wreck-project-menu')).toHaveCount(0);
  await expect(page.locator('.project-switcher')).toHaveCount(0);
  await expect(page.locator('a[href*="/archive/"]')).toHaveCount(0);
});
