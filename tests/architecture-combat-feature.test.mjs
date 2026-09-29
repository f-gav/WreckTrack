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
  'renderInitiativeRow','startCombat',
  'nextCombatTurn','endCombat','renderBattleNotePreview','changeRoomHp'
]){
  const declaration=new RegExp('function\\s+'+name+'\\s*\\(','g');
  assert.match(combat,declaration,name+' should live in combat.js');
  assert.doesNotMatch(app,declaration,name+' should not remain in app.js');
  assert.equal([...bundle.matchAll(declaration)].length,1,name+' should have one declaration');
}
assert.doesNotMatch(combat,/renderRoomBase|renderRoomWithOutsideCombat|renderRoom=function\(/,'room renderer must have one implementation');
assert.match(combat,/changeRoomHp=function\(/,'bonus HP wrapper must remain in this extraction');
assert.doesNotThrow(()=>new Function(bundle));

const logicNames=['orderedRoomCreatures','isOutsideCombat','combatRoomCreatures','ensureCombatTurn','startCombat','nextCombatTurn','endCombat'];
const logic=combat.split('\n').filter(line=>logicNames.some(name=>line.trimStart().startsWith('function '+name+'('))).join('\n');
const room={entries:[{id:'a'},{id:'b'},{id:'c'}],initiatives:{a:12,b:12,c:0},combat:{active:false,round:1,turnCreatureId:null}};
let saves=0,renders=0;
const context={
  entryCreature:entry=>({name:entry.id}),roomById:()=>room,view:{roomId:'room'},
  save:()=>{saves++},render:()=>{renders++},showToast:()=>{},combatTrackingEnabled:false
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

console.log('Combat feature architecture and turn order tests passed');
