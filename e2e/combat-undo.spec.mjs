import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    localStorage.clear();
    localStorage.setItem('initiative-bonus-hp-v1','true');
    localStorage.setItem('gm-archive-v2',JSON.stringify({
      schemaVersion:1,
      tags:[],
      bestiary:[
        {id:'undo-a',name:'Undo Alpha',description:'',hp:'20',ac:'13',characteristics:'',abilities:'',notes:'',tagIds:[]},
        {id:'undo-b',name:'Undo Beta',description:'',hp:'18',ac:'12',characteristics:'',abilities:'',notes:'',tagIds:[]}
      ],
      rooms:[{
        id:'undo-room',
        name:'Undo Room',
        entries:[{id:'entry-a',creatureId:'undo-a'},{id:'entry-b',creatureId:'undo-b'}],
        initiatives:{'entry-a':20,'entry-b':10},
        currentHp:{},
        bonusHp:{},
        combatNotes:{},
        combat:{active:true,round:1,turnCreatureId:'entry-a'}
      }]
    }));
  });
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
});

async function openUndoRoom(page){
  await page.goto('/');
  await page.getByRole('button',{name:'Комнаты'}).first().click();
  await page.getByText('Undo Room',{exact:true}).click();
  await expect(page.locator('#undo-combat')).toBeVisible();
}

async function damageAlpha(page,amount){
  const row=page.locator('.initiative-row').filter({hasText:'Undo Alpha'});
  await row.locator('[data-current-hp]').click();
  await row.locator('[data-hp-amount]').fill(String(amount));
  await row.locator('[data-hp-change="damage"]').click();
}

test('combat undo button reverses HP, bonus HP and turn changes',async({page})=>{
  await openUndoRoom(page);
  const undo=page.locator('#undo-combat');
  await expect(undo).toBeDisabled();

  await damageAlpha(page,5);
  await expect(page.locator('.initiative-row').filter({hasText:'Undo Alpha'}).locator('[data-current-hp]')).toHaveValue('15');
  await expect(undo).toBeEnabled();
  await undo.click();
  await expect(page.locator('.initiative-row').filter({hasText:'Undo Alpha'}).locator('[data-current-hp]')).toHaveValue('20');
  await expect(page.locator('#undo-combat')).toBeDisabled();

  const alpha=page.locator('.initiative-row').filter({hasText:'Undo Alpha'});
  await alpha.locator('[data-current-hp]').click();
  await alpha.locator('[data-hp-amount]').fill('6');
  await alpha.locator('[data-hp-change="bonus"]').click();
  await expect(alpha.locator('[data-bonus-hp]')).toHaveValue('6');
  await page.locator('#undo-combat').click();
  await expect(page.locator('.initiative-row').filter({hasText:'Undo Alpha'}).locator('[data-bonus-hp]')).toHaveValue('');

  await page.locator('#next-turn').click();
  await expect(page.locator('.initiative-row.is-turn')).toContainText('Undo Beta');
  await page.locator('#undo-combat').click();
  await expect(page.locator('.initiative-row.is-turn')).toContainText('Undo Alpha');

  await page.locator('#next-turn').click();
  await page.locator('#next-turn').click();
  await expect(page.locator('.round-step.current')).toHaveText('2');
  await page.locator('#undo-combat').click();
  await expect(page.locator('.round-step.current')).toHaveText('1');
  await expect(page.locator('.initiative-row.is-turn')).toContainText('Undo Beta');
});

test('Ctrl+Z and Ctrl+Я both undo the latest combat action',async({page})=>{
  await openUndoRoom(page);

  await damageAlpha(page,4);
  await expect(page.locator('.initiative-row').filter({hasText:'Undo Alpha'}).locator('[data-current-hp]')).toHaveValue('16');
  await page.keyboard.press('Control+z');
  await expect(page.locator('.initiative-row').filter({hasText:'Undo Alpha'}).locator('[data-current-hp]')).toHaveValue('20');

  await damageAlpha(page,3);
  await expect(page.locator('.initiative-row').filter({hasText:'Undo Alpha'}).locator('[data-current-hp]')).toHaveValue('17');
  await page.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'я',code:'KeyZ',ctrlKey:true,bubbles:true})));
  await expect(page.locator('.initiative-row').filter({hasText:'Undo Alpha'}).locator('[data-current-hp]')).toHaveValue('20');
});
