import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const parts=JSON.parse(fs.readFileSync(new URL('../src/app-parts.json',import.meta.url),'utf8'));
const combat=fs.readFileSync(new URL('../src/features/combat.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const bundle=parts.map(file=>fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).join('\n');

assert.ok(parts.indexOf('features/combat.js')<parts.indexOf('app.js'));
for(const name of [
  'orderedRoomCreatures','combatRoomCreatures','ensureCombatTurn','renderRoom',
  'renderInitiativeRow','startCombat','canUndoCombat','undoCombatAction',
  'nextCombatTurn','endCombat','renderBattleNotePreview','changeRoomHp'
]){
  const declaration=new RegExp('function\\s+'+name+'\\s*\\(','g');
  assert.match(combat,declaration,name+' should live in combat.js');
  assert.doesNotMatch(app,declaration,name+' should not remain in app.js');
  assert.equal([...bundle.matchAll(declaration)].length,1,name+' should have one declaration');
}
assert.doesNotMatch(combat,/renderRoomBase|renderRoomWithOutsideCombat|renderRoom=function\(/,'room renderer must have one implementation');
assert.doesNotMatch(combat,/changeRoomHpBase|changeRoomHp=function\(/,'HP changes should have one implementation');
assert.doesNotThrow(()=>new Function(bundle));

const logicNames=['orderedRoomCreatures','isOutsideCombat','combatRoomCreatures','ensureCombatTurn','startCombat','nextCombatTurn','endCombat'];
const logic=combat.split('\n').filter(line=>logicNames.some(name=>line.trimStart().startsWith('function '+name+'('))).join('\n');
const room={entries:[{id:'a'},{id:'b'},{id:'c'}],initiatives:{a:12,b:12,c:0},combat:{active:false,round:1,turnCreatureId:null}};
let saves=0,renders=0;
const context={
  entryCreature:entry=>({name:entry.id}),roomById:()=>room,view:{roomId:'room'},
  save:()=>{saves++},render:()=>{renders++},showToast:()=>{},combatTrackingEnabled:false,
  clearCombatUndo:()=>{},recordCombatUndo:()=>{}
};
vm.createContext(context);
vm.runInContext(logic+'\nObject.assign(this,{orderedRoomCreatures,combatRoomCreatures,ensureCombatTurn,startCombat,nextCombatTurn,endCombat});',context);
assert.deepEqual(Array.from(context.orderedRoomCreatures(room),x=>x.entry.id),['a','b','c'],'tied initiative keeps entry order');
assert.deepEqual(Array.from(context.combatRoomCreatures(room),x=>x.entry.id),['a','b'],'nonpositive initiative stays outside combat');
context.startCombat();
assert.equal(room.combat.turnCreatureId,'a');
context.nextCombatTurn();
assert.equal(room.combat.turnCreatureId,'b');
context.nextCombatTurn();
assert.equal(room.combat.turnCreatureId,'a');
assert.equal(room.combat.round,2);
room.entries=room.entries.filter(entry=>entry.id==='c');
assert.equal(context.ensureCombatTurn(room,context.combatRoomCreatures(room)),true);
assert.equal(room.combat.active,false,'combat ends when no participants remain');
assert.ok(saves>=3&&renders>=3);

const hpLogic=combat.split('\n').find(line=>line.trimStart().startsWith('function changeRoomHp('));
const hpRoom={entries:[{id:'a'}],currentHp:{a:'20'},bonusHp:{}};
const hpRow={classList:{toggle:()=>{}},style:{setProperty:()=>{},removeProperty:()=>{}}};
const currentInput={dataset:{currentHp:'a'},value:'20',closest:()=>hpRow};
const bonusInput={dataset:{bonusHp:'a'},value:''};
const amountInput={value:'5'};
const menu={hidden:false,querySelector:()=>amountInput};
const hpMessages=[];
let hpSaves=0;
const hpContext={
  view:{roomId:'room'},bonusHpEnabled:true,
  roomById:()=>hpRoom,roomEntryById:(room,id)=>room.entries.find(entry=>entry.id===id),
  entryCreature:()=>({hp:20}),save:()=>{hpSaves++},showToast:message=>hpMessages.push(message),recordCombatUndo:()=>{},
  document:{querySelectorAll:selector=>selector==='[data-bonus-hp]'?[bonusInput]:[currentInput]},
  applyHealthState:()=>{}
};
vm.createContext(hpContext);
vm.runInContext(hpLogic,hpContext);
hpContext.changeRoomHp('a','damage',menu);
assert.equal(hpRoom.currentHp.a,'15');
assert.equal(currentInput.value,15);
assert.equal(menu.hidden,true);
amountInput.value='10';menu.hidden=false;
hpContext.changeRoomHp('a','heal',menu);
assert.equal(hpRoom.currentHp.a,'20','healing stays capped at maximum HP');
amountInput.value='8';menu.hidden=false;
hpContext.changeRoomHp('a','bonus',menu);
assert.equal(hpRoom.bonusHp.a,'8','enabled bonus HP is stored separately');
assert.equal(hpRoom.currentHp.a,'20');
assert.equal(bonusInput.value,8);
hpContext.bonusHpEnabled=false;
amountInput.value='3';menu.hidden=false;
hpContext.changeRoomHp('a','bonus',menu);
assert.equal(hpRoom.currentHp.a,'23','disabled bonus option keeps the historical HP fallback');
assert.equal(hpRoom.bonusHp.a,'8');
amountInput.value='0';
hpContext.changeRoomHp('a','damage',menu);
assert.equal(hpSaves,4,'invalid amounts do not save');
assert.equal(hpMessages.at(-1),'Введите значение больше нуля');

console.log('Combat feature architecture and turn order tests passed');
