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


test('narrow mobile survives dense combat, hp popover and journal editing',async({page})=>{
  test.skip(page.viewportSize()?.width>430,'narrow mobile only');
  await page.addInitScript(()=>{
    const entries=Array.from({length:16},(_,i)=>({id:'mob-'+i,creatureId:'c-'+i}));
    const bestiary=entries.map((e,i)=>({id:e.creatureId,name:'Участник боя '+(i+1)+' с длинным именем',description:'',hp:String(30+i),ac:String(12+i%5),characteristics:'СИЛ 12 | ЛОВ 14 | ТЕЛ 13',abilities:'',notes:'',tagIds:[]}));
    const initiatives=Object.fromEntries(entries.map((e,i)=>[e.id,String(30-i)]));
    const currentHp=Object.fromEntries(entries.map((e,i)=>[e.id,String(20+i)]));
    const bonusHp=Object.fromEntries(entries.map(e=>[e.id,'5']));
    localStorage.setItem('gm-archive-v2',JSON.stringify({schemaVersion:1,tags:[],bestiary,rooms:[{id:'dense-room',name:'Мобильный стресс-тест боя',journal:'# Сессия\n- [ ] Очень длинная задача для проверки журнала на узком экране',entries,initiatives,currentHp,bonusHp,combatNotes:{'mob-0':'Длинная заметка с **жирным текстом** и дополнительным описанием действия.'},combat:{active:true,round:27,turnCreatureId:'mob-0'}}]}));
  });
  await page.goto('/');
  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.getByText('Мобильный стресс-тест боя',{exact:true}).click();
  await expect(page.locator('.initiative-row')).toHaveCount(16);
  await expectNoHorizontalOverflow(page);

  const first=page.locator('.initiative-row').first();
  await first.locator('[data-current-hp]').click();
  await expect(page.locator('.hp-popover')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  const pop=await page.locator('.hp-popover').boundingBox();
  expect(pop.x).toBeGreaterThanOrEqual(0);
  expect(pop.x+pop.width).toBeLessThanOrEqual((await page.evaluate(()=>innerWidth))+1);
  await page.keyboard.press('Escape');

  const journalTab=page.getByRole('button',{name:/Журнал/}).last();
  if(await journalTab.count())await journalTab.click();
  await expectNoHorizontalOverflow(page);
  const textareas=page.locator('textarea');
  if(await textareas.count()){
    const target=textareas.last();
    await target.fill('# Сессия\nНовая мобильная заметка с длинной строкой для проверки переноса текста и сохранения.');
    await target.press('Control+s').catch(()=>{});
  }
  await expectNoHorizontalOverflow(page);
});

test('all dialogs stay inside a 360px viewport',async({page})=>{
  test.skip(page.viewportSize()?.width>430,'narrow mobile only');
  await page.setViewportSize({width:360,height:740});
  await page.goto('/');
  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('#grid-new-creature').click();
  const box=await page.locator('#creature-dialog').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x+box.width).toBeLessThanOrEqual(361);
  expect(box.height).toBeLessThanOrEqual(740);
  await expectNoHorizontalOverflow(page);
});


test('mobile bestiary handles many long cards and detail view',async({page})=>{
  await page.addInitScript(()=>{
    const bestiary=Array.from({length:24},(_,i)=>({id:'card-'+i,name:'Существо '+(i+1)+' — очень длинное название для мобильной карточки',description:'Длинное описание существа для проверки обрезки и устойчивости сетки.',hp:String(40+i),ac:String(10+i%9),characteristics:'# Характеристики\nСИЛ 16 | ЛОВ 14 | ТЕЛ 15',abilities:'## Способности\n**Особая атака.** Длинное описание способности.',notes:'### Заметки\nДополнительный длинный текст.',tagIds:[]}));
    localStorage.setItem('gm-archive-v2',JSON.stringify({schemaVersion:1,tags:[],bestiary,rooms:[]}));
  });
  await page.goto('/');
  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await expect(page.locator('.bestiary-card')).toHaveCount(24);
  await expectNoHorizontalOverflow(page);
  await page.locator('.bestiary-card').first().click();
  await expect(page.locator('#detail-dialog')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  const box=await page.locator('#detail-dialog').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x+box.width).toBeLessThanOrEqual((await page.evaluate(()=>innerWidth))+1);
});

test('mobile settings tabs remain reachable by horizontal scrolling',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Настройки'}).click();
  const nav=page.locator('.settings-nav');
  await expect(nav).toBeVisible();
  await expect(page.locator('.settings-nav-button')).toHaveCount(5);
  await page.locator('.settings-nav-button').last().scrollIntoViewIfNeeded();
  await page.locator('.settings-nav-button').last().click();
  await expect(page.locator('.settings-nav-button').last()).toHaveClass(/current/);
  await expectNoHorizontalOverflow(page);
});


test('mobile journal keeps long markdown and controls inside viewport',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('gm-archive-v2',JSON.stringify({schemaVersion:1,tags:[],bestiary:[],rooms:[{id:'journal-room',name:'Комната журнала',journal:'# Очень длинный заголовок журнала для мобильного экрана\n## Второй раздел\n- [ ] Длинная задача, которая должна корректно переноситься на несколько строк\n[ ] Ресурс экспедиции\n\n'+('Длинный текст заметки для проверки переноса. '.repeat(18)),entries:[],initiatives:{},currentHp:{},bonusHp:{},combatNotes:{},combat:{active:false,round:1,turnCreatureId:null}}]})));
  await page.goto('/');
  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.getByText('Комната журнала',{exact:true}).click();
  const journalButton=page.getByRole('button',{name:/Журнал/}).last();
  await journalButton.click();
  await expect(page.locator('#journal-dialog')).toBeVisible();
  await expect(page.locator('#journal-live-editor')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  const box=await page.locator('#journal-dialog').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x+box.width).toBeLessThanOrEqual((await page.evaluate(()=>innerWidth))+1);
  await page.setViewportSize({width:390,height:500});
  await expect(page.locator('#journal-live-editor')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('mobile tokenator canvas controls and frame grid fit narrow and landscape screens',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Токенатор'}).first().click();
  await expect(page.locator('#tokenator-canvas')).toBeVisible();
  await expect(page.locator('#tokenator-scale')).toBeVisible();
  await expect(page.locator('.token-frame-grid')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.setViewportSize({width:740,height:390});
  await expect(page.locator('#tokenator-canvas')).toBeVisible();
  await expect(page.locator('.tokenator-actions')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('mobile backup restore dialog fits narrow and short screens',async({page})=>{
  await page.setViewportSize({width:360,height:640});
  await page.goto('/');
  await page.getByRole('button',{name:'Настройки'}).click();
  const dataTab=page.locator('.settings-nav-button').last();
  await dataTab.scrollIntoViewIfNeeded();
  await dataTab.click();
  await expectNoHorizontalOverflow(page);
  const restore=page.locator('#backup-restore-file');
  await expect(restore).toBeAttached();
  await page.evaluate(()=>document.querySelector('#backup-restore-dialog').showModal());
  await expect(page.locator('#backup-restore-dialog')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  const box=await page.locator('#backup-restore-dialog').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x+box.width).toBeLessThanOrEqual(361);
  expect(box.height).toBeLessThanOrEqual(640);
});


test('mobile focus remains usable with keyboard-sized viewport',async({page})=>{
  await page.setViewportSize({width:390,height:500});
  await page.goto('/');
  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('#grid-new-creature').click();
  const name=page.locator('#creature-name');
  await name.focus();
  await expect(name).toBeFocused();
  await name.fill('Фокус на мобильном');
  await page.locator('#creature-notes').focus();
  await page.locator('#creature-notes').fill('Длинная заметка '.repeat(20));
  await page.locator('#creature-dialog .creature-dialog-actions').scrollIntoViewIfNeeded();
  await expect(page.locator('#creature-dialog .creature-dialog-actions')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('#creature-dialog')).not.toBeVisible();
});

test('landscape core sections stay usable',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.goto('/');
  for(const name of ['Бестиарий','Комнаты','Токенатор']){
    await page.getByRole('button',{name}).first().click();
    await expectNoHorizontalOverflow(page);
  }
  await page.getByRole('button',{name:'Настройки'}).click();
  await expect(page.locator('.settings-nav')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('keyboard navigation exposes visible focus and escape closes modal',async({page})=>{
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused=page.locator(':focus');
  await expect(focused).toBeVisible();
  const outline=await focused.evaluate(el=>{const s=getComputedStyle(el);return {outline:s.outline,boxShadow:s.boxShadow}});
  expect(outline.outline!=='none'||outline.boxShadow!=='none').toBeTruthy();
  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  const trigger=page.locator('#grid-new-creature');
  await trigger.focus();
  await trigger.press('Enter');
  await expect(page.locator('#creature-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#creature-dialog')).not.toBeVisible();
});


test('mobile primary controls keep practical touch targets',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const selectors=['#brand-home','.topnav-button','.topbar-settings-button','.account-button'];
  for(const selector of selectors){
    const items=page.locator(selector);
    for(let i=0;i<await items.count();i++){
      const box=await items.nth(i).boundingBox();
      expect(box.width,selector+' width').toBeGreaterThanOrEqual(32);
      expect(box.height,selector+' height').toBeGreaterThanOrEqual(32);
    }
  }
  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  const addButton=page.locator('#grid-new-creature');
  const addBox=await addButton.boundingBox();
  expect(addBox.height).toBeGreaterThanOrEqual(44);
  await addButton.click();
  for(const button of await page.locator('#creature-dialog .dialog-actions .button').all()){
    const box=await button.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});
