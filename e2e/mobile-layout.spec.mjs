import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.clear());
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
});

async function expectNoHorizontalOverflow(page){
  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test('mobile shell and core sections fit the viewport',async({page})=>{
  await page.goto('/');
  await expectNoHorizontalOverflow(page);
  await expect(page.locator('#save-status')).toBeVisible();

  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await expectNoHorizontalOverflow(page);
  await page.locator('#grid-new-creature').click();
  await expect(page.locator('#creature-dialog')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.locator('#creature-dialog [data-close="creature-dialog"]').click();

  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await expectNoHorizontalOverflow(page);
  await page.locator('#new-room').click();
  await page.locator('#room-name').fill('Mobile Room');
  await page.locator('#room-form').getByRole('button',{name:'Сохранить'}).click();
  await page.getByText('Mobile Room',{exact:true}).click();
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button',{name:'Токенатор'}).first().click();
  await expect(page.locator('#tokenator-canvas')).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button',{name:'Настройки'}).click();
  await expect(page.locator('.settings-nav')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('mobile room remains usable with long content',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('gm-archive-v2',JSON.stringify({
      schemaVersion:1,
      tags:[],
      bestiary:[{id:'long-creature',name:'Очень длинное имя существа для проверки мобильной вёрстки без выхода за границы экрана',description:'',hp:'120',ac:'18',characteristics:'СИЛ 18 | ЛОВ 14 | ТЕЛ 20 | ИНТ 12 | МДР 16 | ХАР 10',abilities:'',notes:'',tagIds:[]}],
      rooms:[{id:'mobile-room',name:'Очень длинное название комнаты для мобильной проверки',journal:'# Заголовок\nТекст',entries:[{id:'entry-1',creatureId:'long-creature'}],initiatives:{'entry-1':'22'},combatNotes:{'entry-1':'Очень длинная боевая заметка, которая должна переноситься и не расширять страницу за пределы экрана.'},currentHp:{'entry-1':'55'},bonusHp:{'entry-1':'7'},combat:{active:true,round:12,turnCreatureId:'entry-1'}}]
    }));
  });
  await page.goto('/');
  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.getByText('Очень длинное название комнаты для мобильной проверки',{exact:true}).click();
  await expect(page.locator('.initiative-row')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  const box=await page.locator('.initiative-row').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x+box.width).toBeLessThanOrEqual((await page.evaluate(()=>innerWidth))+1);
});
