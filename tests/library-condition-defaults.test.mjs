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
vm.runInContext(source+'\nthis.normalize=normalize;this.standardConditions=DND_STANDARD_CONDITIONS;this.conditionVersion=DND_CONDITIONS_VERSION;',context);

const {normalize,standardConditions,conditionVersion}=context;
assert.equal(conditionVersion,2);
assert.equal(standardConditions.length,15);

{
  const fresh=normalize({schemaVersion:1,rooms:[],bestiary:[],tags:[]});
  assert.equal(fresh.library.conditionsVersion,conditionVersion);
  assert.equal(fresh.library.conditions.length,15);
  assert.ok(fresh.library.conditions.some(item=>item.name==='Опрокинутый'));
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
      conditions:[
        {
          id:'dnd-condition-prone',
          name:'Сбитый с ног',
          description:'Старое описание',
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

  assert.equal(legacy.library.conditionsVersion,conditionVersion);
  assert.equal(legacy.library.conditions.length,16,'all 15 defaults plus custom conditions should survive migration');
  const prone=legacy.library.conditions.find(item=>item.id==='dnd-condition-prone');
  assert.equal(prone.name,'Опрокинутый');
  assert.deepEqual(Array.from(prone.tagIds),['tag-prone'],'existing tags on a built-in condition should survive refresh');
  assert.match(prone.details,/половине Скорости/);
  assert.ok(legacy.library.conditions.some(item=>item.id==='custom-burning'),'custom conditions must survive the default refresh');

  prone.description='Моя пользовательская формулировка';
  const normalizedAgain=normalize(legacy);
  assert.equal(
    normalizedAgain.library.conditions.find(item=>item.id==='dnd-condition-prone').description,
    'Моя пользовательская формулировка',
    'built-in conditions should remain editable after the one-time defaults migration'
  );
}

console.log('Library condition default migration tests passed');
