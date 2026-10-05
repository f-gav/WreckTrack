import {test,expect} from '@playwright/test';

test('WreckTrack branding and topbar order are current',async({page})=>{
  await page.goto('/');
  await expect(page).toHaveTitle('WreckTrack - D&D Tracker');
  await expect(page.locator('.eyebrow').first()).toHaveText('ПЛАТФОРМА ДЛЯ МАСТЕРА');
  await expect(page.locator('main h1').first()).toHaveText('WreckTrack');
  await expect(page.locator('.lead').first()).toHaveText('Всеобщий трекер для DnD. Бестиарий, библиотека, комнаты и токенатор. Всё к вашим услугам!');

  const order=await page.locator('.topbar').evaluate(header=>[
    header.querySelector('#save-status'),
    header.querySelector('.topbar-settings-button'),
    header.querySelector('#account-button')
  ].map(node=>Array.from(header.children).indexOf(node)));
  expect(order[0]).toBeLessThan(order[1]);
  expect(order[1]).toBeLessThan(order[2]);
});
