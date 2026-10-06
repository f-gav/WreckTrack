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
assert.equal(presetSystemVersion,1);
assert.equal(presets['5e14'].length,15);
assert.equal(presets['5e24'].length,15);

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
          description:'Старая предустановленная версия',
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
  assert.equal(legacy.library.conditions.length,1,'legacy built-in defaults should be cleaned during migration');
  assert.equal(legacy.library.conditions[0].id,'custom-burning','custom conditions must survive cleanup');
  assert.equal('conditionsVersion' in legacy.library,false,'obsolete forced-default version should be removed');
}

{
  const installed=normalize({
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
        {...presets['5e14'][0],tagIds:['tag-visible']}
      ]
    }
  });
  assert.equal(installed.library.conditionPreset,'5e14');
  assert.equal(installed.library.conditions.length,1);
  assert.deepEqual(Array.from(installed.library.conditions[0].tagIds),['tag-visible'],'installed preset entries should persist normally');
}

console.log('Library condition preset migration tests passed');
