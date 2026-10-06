import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    if(sessionStorage.getItem('__wrecktrack_combat_conditions_ready')==='1')return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('__wrecktrack_combat_conditions_ready','1');
    localStorage.setItem('gm-archive-v2',JSON.stringify({
      schemaVersion:1,
      tags:[],
      bestiary:[{id:'creature-1',name:'Тестовый герой',description:'',hp:'20',ac:'15',characteristics:'',abilities:'',notes:'',tagIds:[]}],
      rooms:[{id:'room-1',name:'Арена',journal:'',entries:[{id:'entry-1',creatureId:'creature-1'}],initiatives:{'entry-1':12},combatNotes:{},currentHp:{},bonusHp:{},conditions:{},combat:{active:false,round:1,turnCreatureId:null}}],
      library:{syncTags:false,tags:[],conditions:[{id:'condition-burning',name:'Горение',description:'Проверочное состояние',details:'Получает периодический урон.',tagIds:[],builtin:false},{id:'condition-frightened',name:'Испуганный',description:'Проверочное состояние',details:'Боится источника страха.',tagIds:[],builtin:false},{id:'condition-stunned',name:'Ошеломлённый',description:'Проверочное состояние',details:'Не может нормально действовать.',tagIds:[],builtin:false}],conditionPreset:null,conditionPresetSystemVersion:3,artifacts:[]}
    }));
  });
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
});

test('room creatures can receive Library conditions and undo their removal in combat',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.locator('[data-open-room="room-1"]').first().click();

  await page.getByRole('button',{name:'Изменить состояния'}).click();
  await expect(page.locator('#combat-condition-dialog')).toBeVisible();
  await page.locator('#combat-condition-search').fill('горение');
  await page.locator('#combat-condition-checks input[value="condition-burning"]').check();
  await page.locator('#combat-condition-save').click();

  await expect(page.locator('.combat-condition-name')).toHaveText('Горение');
  await page.locator('.combat-condition-name').click();
  await expect(page.locator('#library-detail-dialog')).toContainText('Получает периодический урон.');
  await page.locator('#library-detail-dialog [data-close="library-detail-dialog"]').first().click();

  await page.getByRole('button',{name:'Начать бой'}).click();
  await page.getByRole('button',{name:'Снять состояние: Горение'}).click();
  await expect(page.locator('.combat-condition-name')).toHaveCount(0);

  await page.keyboard.press('Control+Z');
  await expect(page.locator('.combat-condition-name')).toHaveText('Горение');
  await expect(page.locator('#save-status')).toHaveAttribute('data-state','saved',{timeout:3000});

  await page.reload();
  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.locator('[data-open-room="room-1"]').first().click();
  await expect(page.locator('.combat-condition-name')).toHaveText('Горение');
});


test('conditions use available card width without horizontal scrolling and room can use compact add control',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.locator('[data-open-room="room-1"]').first().click();

  await page.getByRole('button',{name:'Изменить состояния'}).click();
  for(const input of await page.locator('#combat-condition-checks input').all())await input.check();
  await page.locator('#combat-condition-save').click();

  const chips=page.locator('.combat-condition-chip');
  await expect(chips).toHaveCount(3);
  const chipBoxes=await chips.evaluateAll(nodes=>nodes.map(node=>{const box=node.getBoundingClientRect();return{x:box.x,y:box.y,width:box.width,height:box.height}}));
  expect(Math.max(...chipBoxes.map(box=>box.y))-Math.min(...chipBoxes.map(box=>box.y))).toBeLessThanOrEqual(2);
  for(let i=1;i<chipBoxes.length;i++)expect(chipBoxes[i].x).toBeGreaterThan(chipBoxes[i-1].x);

  const viewport=page.viewportSize();
  if(viewport&&viewport.width>900){
    const stripBox=await page.locator('.combat-condition-strip').boundingBox();
    const creatureBox=await page.locator('.initiative-creature').boundingBox();
    const noteBox=await page.locator('.battle-note-shell').boundingBox();
    expect(stripBox).toBeTruthy();
    expect(creatureBox).toBeTruthy();
    expect(noteBox).toBeTruthy();
    expect(Math.abs(stripBox.x-creatureBox.x)).toBeLessThanOrEqual(2);
    expect(stripBox.y).toBeGreaterThanOrEqual(creatureBox.y+creatureBox.height-2);
    expect(stripBox.x+stripBox.width).toBeGreaterThan(noteBox.x+noteBox.width*0.6);
    const stripOverflow=await page.locator('.combat-condition-strip').evaluate(node=>({
      scrollWidth:node.scrollWidth,
      clientWidth:node.clientWidth,
      overflowX:getComputedStyle(node).overflowX,
      flexWrap:getComputedStyle(node).flexWrap
    }));
    expect(stripOverflow.flexWrap).toBe('wrap');
    expect(stripOverflow.overflowX).not.toBe('auto');
    expect(stripOverflow.scrollWidth).toBeLessThanOrEqual(stripOverflow.clientWidth+1);
  }

  await page.getByRole('button',{name:'Настройки комнаты'}).click();
  await expect(page.getByText('Уменьшенный значок добавления состояний',{exact:true})).toBeVisible();
  const compactToggle=page.locator('#room-compact-condition-add');
  await expect(compactToggle).not.toBeChecked();
  await page.locator('label[for="room-compact-condition-add"]').click();
  await expect(compactToggle).toBeChecked();
  await page.locator('#room-form').getByRole('button',{name:'Сохранить'}).click();

  const compactAdd=page.locator('.combat-condition-add-compact');
  await expect(compactAdd).toBeVisible();
  await expect(page.locator('.combat-condition-strip > .combat-condition-add:not(.combat-condition-add-compact)')).toHaveCount(0);
  await expect(chips).toHaveCount(3);
  const nameBox=await page.locator('.initiative-name').boundingBox();
  const addBox=await compactAdd.boundingBox();
  expect(nameBox).toBeTruthy();
  expect(addBox).toBeTruthy();
  expect(addBox.x).toBeGreaterThanOrEqual(nameBox.x+nameBox.width-2);
  expect(Math.abs(addBox.width-addBox.height)).toBeLessThanOrEqual(1);

  await page.reload();
  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.locator('[data-open-room="room-1"]').first().click();
  await expect(page.locator('.combat-condition-add-compact')).toBeVisible();
  await expect(page.locator('.combat-condition-chip')).toHaveCount(3);
});
