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
      library:{syncTags:false,tags:[],conditions:[{id:'condition-burning',name:'Горение',description:'Проверочное состояние',details:'Получает периодический урон.',tagIds:[],builtin:false}],conditionPreset:null,conditionPresetSystemVersion:3,artifacts:[]}
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
