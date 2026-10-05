const CURRENT_SCHEMA_VERSION=1;

const DND_STANDARD_CONDITIONS=[
  {id:'dnd-condition-blinded',name:'Ослеплённый',description:'Существо не видит.',details:'Проверки, зависящие от зрения, автоматически проваливаются. Атаки существа совершаются с помехой, а атаки по нему — с преимуществом.',builtin:true},
  {id:'dnd-condition-charmed',name:'Очарованный',description:'Существо находится под влиянием очаровавшего.',details:'Нельзя атаковать или намеренно вредить тому, кто наложил очарование. Очаровавший получает преимущество на социальные проверки против цели.',builtin:true},
  {id:'dnd-condition-deafened',name:'Оглохший',description:'Существо не слышит.',details:'Проверки, которые требуют слуха, автоматически проваливаются.',builtin:true},
  {id:'dnd-condition-exhaustion',name:'Истощение',description:'Накапливаемое состояние от 1 до 6 уровней.',details:'Каждый уровень ухудшает d20-проверки и снижает скорость. На шестом уровне персонаж погибает; продолжительный отдых снимает один уровень.',builtin:true},
  {id:'dnd-condition-frightened',name:'Испуганный',description:'Существо боится определённого источника.',details:'Пока источник страха виден, проверки и атаки выполняются хуже. Существо не может добровольно приблизиться к источнику страха.',builtin:true},
  {id:'dnd-condition-grappled',name:'Схваченный',description:'Перемещение существа ограничено захватом.',details:'Скорость становится 0. Состояние заканчивается при освобождении или если захватчик больше не может удерживать цель.',builtin:true},
  {id:'dnd-condition-incapacitated',name:'Недееспособный',description:'Существо не может нормально действовать.',details:'Существо не может совершать действия, бонусные действия и реакции. Состояние также прерывает концентрацию.',builtin:true},
  {id:'dnd-condition-invisible',name:'Невидимый',description:'Существо нельзя увидеть обычным зрением.',details:'Существо получает преимущества скрытности и атак, пока противник не способен его видеть; атаки по нему затруднены.',builtin:true},
  {id:'dnd-condition-paralyzed',name:'Парализованный',description:'Существо обездвижено и недееспособно.',details:'Скорость равна 0, некоторые спасброски автоматически проваливаются, атаки по цели получают преимущество, а близкие попадания особенно опасны.',builtin:true},
  {id:'dnd-condition-petrified',name:'Окаменевший',description:'Существо превращено в твёрдое неподвижное вещество.',details:'Существо недееспособно, его скорость равна 0, оно получает значительную защиту от урона, но хуже сопротивляется части эффектов.',builtin:true},
  {id:'dnd-condition-poisoned',name:'Отравленный',description:'Яд мешает существу действовать эффективно.',details:'Атаки и проверки характеристик совершаются с помехой.',builtin:true},
  {id:'dnd-condition-prone',name:'Сбитый с ног',description:'Существо лежит на земле.',details:'Перемещение обычно требует ползти или встать. Собственные атаки затруднены; близким противникам проще атаковать лежащую цель.',builtin:true},
  {id:'dnd-condition-restrained',name:'Опутанный',description:'Движения существа сильно ограничены.',details:'Скорость становится 0. Атаки существа затруднены, атаки по нему получают преимущество, а спасброски Ловкости совершаются хуже.',builtin:true},
  {id:'dnd-condition-stunned',name:'Ошеломлённый',description:'Существо временно оглушено и почти не действует.',details:'Существо недееспособно, его скорость равна 0, часть спасбросков автоматически проваливается, а атаки по нему получают преимущество.',builtin:true},
  {id:'dnd-condition-unconscious',name:'Бессознательный',description:'Существо без сознания.',details:'Существо недееспособно, падает, не осознаёт окружение и не может двигаться. Близкие попадания по нему особенно опасны.',builtin:true}
];

function archiveSchemaVersion(data){if(!data||typeof data!=='object'||Array.isArray(data))return 0;const version=Number(data.schemaVersion);return Number.isInteger(version)&&version>=0?version:0}
    function migrateArchive(data){
      if(!data||typeof data!=='object'||Array.isArray(data))data={};
      let version=archiveSchemaVersion(data);
      if(version>CURRENT_SCHEMA_VERSION)throw new Error(`Версия архива ${version} новее поддерживаемой ${CURRENT_SCHEMA_VERSION}`);
      while(version<CURRENT_SCHEMA_VERSION){
        if(version===0){if(!Array.isArray(data.rooms))data.rooms=[];if(!Array.isArray(data.bestiary))data.bestiary=[];if(!Array.isArray(data.tags))data.tags=[];data.schemaVersion=1;version=1;continue}
        throw new Error(`Нет миграции архива v${version} -> v${version+1}`);
      }
      data.schemaVersion=CURRENT_SCHEMA_VERSION;
      return data;
    }
function normalize(data){
  data=migrateArchive(data);
  const normalizeCreature=c=>{if(c.description==null)c.description='';if(c.hp==null)c.hp='';if(c.ac==null)c.ac='';if(c.characteristics==null)c.characteristics='';if(c.abilities==null)c.abilities='';if(c.notes==null)c.notes='';if(!Array.isArray(c.tagIds))c.tagIds=[];return c};
  const normalizeLibraryItem=item=>{if(!item||typeof item!=='object')item={};if(!item.id)item.id=makeId();item.name=String(item.name||'Без названия').slice(0,80);item.description=String(item.description||'').slice(0,240);item.details=String(item.details||'').slice(0,6000);if(!Array.isArray(item.tagIds))item.tagIds=[];item.builtin=Boolean(item.builtin);return item};
  if(!Array.isArray(data.tags))data.tags=[];
  data.tags=data.tags.map(t=>({id:t.id||makeId(),name:String(t.name||'Тег').slice(0,30),color:validTagColor(t.color)}));
  data.bestiary.forEach(normalizeCreature);
  data.rooms.forEach(r=>{if(r.journal==null)r.journal='';if(!r.initiatives||typeof r.initiatives!=='object')r.initiatives={};if(!r.combatNotes||typeof r.combatNotes!=='object')r.combatNotes={};if(!r.currentHp||typeof r.currentHp!=='object')r.currentHp={};if(!r.bonusHp||typeof r.bonusHp!=='object')r.bonusHp={};if(!Array.isArray(r.entries)){const used=new Set;r.entries=(Array.isArray(r.creatureIds)?r.creatureIds:[]).map(creatureId=>{let id=creatureId;if(used.has(id)){id=makeId();if(Object.prototype.hasOwnProperty.call(r.initiatives,creatureId))r.initiatives[id]=r.initiatives[creatureId];if(Object.prototype.hasOwnProperty.call(r.combatNotes,creatureId))r.combatNotes[id]=r.combatNotes[creatureId];if(Object.prototype.hasOwnProperty.call(r.currentHp,creatureId))r.currentHp[id]=r.currentHp[creatureId];if(Object.prototype.hasOwnProperty.call(r.bonusHp,creatureId))r.bonusHp[id]=r.bonusHp[creatureId]}used.add(id);return{id,creatureId}})}r.entries=r.entries.map(entry=>{const normalized={id:entry.id||makeId(),creatureId:entry.creatureId||null};if(!normalized.creatureId)normalized.npc=normalizeCreature(entry.npc&&typeof entry.npc==='object'?entry.npc:{name:'',description:'',hp:'',ac:'',characteristics:'',abilities:'',notes:'',tagIds:[]});return normalized});delete r.creatureIds;if(!r.combat||typeof r.combat!=='object')r.combat={active:false,round:1,turnCreatureId:null};r.combat.active=Boolean(r.combat.active);r.combat.round=Math.max(1,Math.trunc(Number(r.combat.round)||1));if(r.combat.turnCreatureId==null)r.combat.turnCreatureId=null});
  const hadLibrary=Boolean(data.library&&typeof data.library==='object'&&!Array.isArray(data.library));
  if(!hadLibrary)data.library={syncTags:false,tags:[],conditions:DND_STANDARD_CONDITIONS.map(item=>({...item,tagIds:[]})),artifacts:[]};
  if(typeof data.library.syncTags!=='boolean')data.library.syncTags=false;
  if(!Array.isArray(data.library.tags))data.library.tags=[];
  data.library.tags=data.library.tags.map(t=>({id:t.id||makeId(),name:String(t.name||'Тег').slice(0,30),color:validTagColor(t.color)}));
  if(!Array.isArray(data.library.conditions))data.library.conditions=DND_STANDARD_CONDITIONS.map(item=>({...item,tagIds:[]}));
  if(!Array.isArray(data.library.artifacts))data.library.artifacts=[];
  data.library.conditions=data.library.conditions.map(normalizeLibraryItem);
  data.library.artifacts=data.library.artifacts.map(normalizeLibraryItem);
  return data
}
