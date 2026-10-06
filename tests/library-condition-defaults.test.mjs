import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/state.js',import.meta.url),'utf8');
let seq=0;
const context={
  makeId:()=>`generated-${++seq}`,
  validTagColor:value=>value||'#d6a85f'
};
vm.createContext(context);
vm.runInContext(source+'\nthis.normalize=normalize;this.presets=DND_CONDITION_PRESETS;this.presetSystemVersion=CONDITION_PRESET_SYSTEM_VERSION;',context);

const {normalize,presets,presetSystemVersion}=context;
assert.equal(presetSystemVersion,2);
assert.equal(presets['5e14'].length,15);
assert.equal(presets['5e24'].length,15);
assert.equal(presets['5e14'].find(item=>item.id==='dnd-condition-deafened').name,'Оглохший (5е14)');
assert.equal(
  presets['5e14'].find(item=>item.id==='dnd-condition-deafened').details,
  '- Оглохшее существо ничего не слышит и автоматически проваливает все проверки характеристик, связанные со слухом.'
);

{
  const fresh=normalize({schemaVersion:1,rooms:[],bestiary:[],tags:[]});
  assert.equal(fresh.library.conditionPresetSystemVersion,presetSystemVersion);
  assert.equal(fresh.library.conditionPreset,null);
  assert.equal(fresh.library.conditions.length,0,'new archives should not receive a preset automatically');
}

{
  const legacy=normalize({
    schemaVersion:1,
    rooms:[],
    bestiary:[],
    tags:[],
    library:{
      syncTags:false,
      tags:[],
      artifacts:[],
      conditionsVersion:2,
      conditions:[
        {
          id:'dnd-condition-prone',
          name:'Опрокинутый',
          description:'Старая автоматически добавленная версия',
          details:'Старые правила',
          tagIds:['tag-prone'],
          builtin:true
        },
        {
          id:'custom-burning',
          name:'Горение',
          description:'Пользовательское состояние',
          details:'Остаётся без изменений',
          tagIds:[],
          builtin:false
        }
      ]
    }
  });

  assert.equal(legacy.library.conditionPresetSystemVersion,presetSystemVersion);
  assert.equal(legacy.library.conditionPreset,null);
  assert.equal(legacy.library.conditions.length,1,'old forced built-ins should be cleaned when no preset was chosen');
  assert.equal(legacy.library.conditions[0].id,'custom-burning','custom conditions must survive cleanup');
  assert.equal('conditionsVersion' in legacy.library,false,'obsolete forced-default version should be removed');
}

{
  const upgraded=normalize({
    schemaVersion:1,
    rooms:[],
    bestiary:[],
    tags:[],
    library:{
      syncTags:false,
      tags:[],
      artifacts:[],
      conditionPresetSystemVersion:1,
      conditionPreset:'5e14',
      conditions:[
        {
          id:'dnd-condition-deafened',
          name:'Оглохший',
          description:'Старая черновая формулировка',
          details:'Старые правила',
          tagIds:['tag-visible'],
          builtin:true,
          preset:'5e14'
        },
        {
          id:'custom-burning',
          name:'Горение',
          description:'Пользовательское состояние',
          details:'Остаётся без изменений',
          tagIds:[],
          builtin:false
        }
      ]
    }
  });

  assert.equal(upgraded.library.conditionPreset,'5e14');
  assert.equal(upgraded.library.conditionPresetSystemVersion,presetSystemVersion);
  assert.equal(upgraded.library.conditions.length,16,'chosen preset should refresh to all 15 exact entries and preserve custom conditions');
  const deafened=upgraded.library.conditions.find(item=>item.id==='dnd-condition-deafened');
  assert.equal(deafened.name,'Оглохший (5е14)');
  assert.equal(
    deafened.details,
    '- Оглохшее существо ничего не слышит и автоматически проваливает все проверки характеристик, связанные со слухом.'
  );
  assert.deepEqual(Array.from(deafened.tagIds),['tag-visible'],'matching tag assignments should survive preset refresh');
  assert.ok(upgraded.library.conditions.some(item=>item.id==='custom-burning'),'custom conditions must survive preset refresh');
}

console.log('Library condition preset migration tests passed');
