import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const parts=JSON.parse(fs.readFileSync(new URL('../src/app-parts.json',import.meta.url),'utf8'));
const rooms=fs.readFileSync(new URL('../src/features/rooms.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const bundle=parts.map(file=>fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).join('\n');

assert.equal(parts.indexOf('features/rooms.js'),parts.indexOf('app.js')-1);
for(const name of [
  'removeRoomEntry','renderRooms','newRoomEntry','openRoomDialog',
  'editRoomEntry','addNpcToBestiary','openMembership',
  'updateMembershipTagSummary','renderMembershipTagOptions',
  'renderRoomMembershipOptions','openRoomMembership'
]){
  const declaration=new RegExp('function\\s+'+name+'\\s*\\(','g');
  assert.match(rooms,declaration,name+' should live in the Rooms feature');
  assert.doesNotMatch(app,declaration,name+' should not remain in app.js');
  assert.equal([...bundle.matchAll(declaration)].length,1,name+' should have one definition');
}
assert.match(app,/function renderRoomWithOutsideCombat\(/,'combat renderer stays in app.js for the next step');
assert.match(app,/function startCombat\(/,'combat actions stay in app.js for the next step');
assert.doesNotThrow(()=>new Function(bundle));

const entrySource=rooms.split('\n').filter(line=>/function (?:newRoomEntry|removeRoomEntry)\(/.test(line)).join('\n');
let nextId=0;
const context={makeId:()=>String(++nextId),CHARACTERISTICS_TEMPLATE:'template'};
vm.createContext(context);
vm.runInContext(entrySource+'\nthis.newRoomEntry=newRoomEntry;this.removeRoomEntry=removeRoomEntry;',context);
const first=context.newRoomEntry(null),second=context.newRoomEntry(null);
assert.notEqual(first.id,second.id,'room copies need independent entry IDs');
assert.notEqual(first.npc,second.npc,'new NPC entries need independent data');
first.npc.name='First';
assert.equal(second.npc.name,'');
const room={entries:[first,second],initiatives:{[first.id]:12,[second.id]:12},combatNotes:{[first.id]:'A',[second.id]:'B'},currentHp:{[first.id]:4,[second.id]:5},bonusHp:{[first.id]:2,[second.id]:3}};
context.removeRoomEntry(room,first.id);
assert.equal(room.entries.length,1);
assert.equal(room.entries[0].id,second.id);
for(const field of ['initiatives','combatNotes','currentHp','bonusHp']){
  assert.equal(Object.hasOwn(room[field],first.id),false,field+' should lose only the removed entry');
  assert.equal(Object.hasOwn(room[field],second.id),true,field+' should retain the other copy');
}

console.log('Rooms management architecture and entry lifecycle tests passed');
