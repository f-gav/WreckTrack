import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/cloud-sync.js',import.meta.url),'utf8');
const start=source.indexOf('function cloneJson(');
const end=source.indexOf('function openCloudBaseDb(',start);
assert.ok(start>=0&&end>start,'cloud three-way merge helpers must exist');
const context={normalize:value=>value};
vm.createContext(context);
vm.runInContext(source.slice(start,end)+'\nthis.merge=mergeConcurrentData;',context);
const merge=(base,local,remote)=>context.merge(base,local,remote);
const item=(id,name)=>({id,name,notes:''});
const empty={rooms:[],bestiary:[],tags:[],library:{artifacts:[],conditions:[],tags:[]}};
const base={...empty,bestiary:[item('a','Alpha'),item('b','Beta')],rooms:[{id:'r',name:'Room',entries:[{id:'e',creatureId:'a'}]}],library:{...empty.library,artifacts:[item('art','Amulet')]}};

// Independent edits from desktop and phone must merge.
const desktop={...base,bestiary:[{...base.bestiary[0],notes:'Desktop'},base.bestiary[1]]};
const phone={...base,bestiary:[base.bestiary[0],{...base.bestiary[1],notes:'Phone'}]};
let merged=merge(base,desktop,phone);
assert.equal(merged.state.bestiary[0].notes,'Desktop');
assert.equal(merged.state.bestiary[1].notes,'Phone');
assert.equal(merged.conflicts,0);

// Concurrent deletion must win over a stale edit, regardless of device.
const deletion={...base,bestiary:[base.bestiary[1]]};
const staleEdit={...base,bestiary:[{...base.bestiary[0],notes:'Changed on phone'},base.bestiary[1]]};
for(const [local,remote] of [[deletion,staleEdit],[staleEdit,deletion]]){
  merged=merge(base,local,remote);
  assert.deepEqual(Array.from(merged.state.bestiary,x=>x.id),['b'],'deleted creature must not reappear');
  assert.ok(merged.conflicts>=1,'concurrent edit versus deletion must be counted as conflict');
}

// Deletions of nested participants, rooms and artifacts obey the same rule.
const deletedRoom={...base,rooms:[]};
const changedRoom={...base,rooms:[{...base.rooms[0],name:'Renamed'}]};
merged=merge(base,deletedRoom,changedRoom);
assert.equal(merged.state.rooms.length,0);
const deletedEntry={...base,rooms:[{...base.rooms[0],entries:[]}]};
const changedEntry={...base,rooms:[{...base.rooms[0],entries:[{id:'e',creatureId:'a',hp:4}]}]};
merged=merge(base,changedEntry,deletedEntry);
assert.equal(merged.state.rooms[0].entries.length,0);
const deletedArtifact={...base,library:{...base.library,artifacts:[]}};
const changedArtifact={...base,library:{...base.library,artifacts:[{...base.library.artifacts[0],notes:'Improved'}]}};
merged=merge(base,deletedArtifact,changedArtifact);
assert.equal(merged.state.library.artifacts.length,0);

// Additions made independently still appear on both devices.
merged=merge(empty,{...empty,bestiary:[item('a','Alpha')]},{...empty,bestiary:[item('b','Beta')]});
assert.deepEqual(new Set(merged.state.bestiary.map(x=>x.id)),new Set(['a','b']));
assert.equal(merged.conflicts,0);

// Deleting one item while adding another preserves both intentions.
merged=merge(base,{...base,bestiary:[base.bestiary[1]]},{...base,bestiary:[...base.bestiary,item('c','Gamma')]});
assert.deepEqual(new Set(merged.state.bestiary.map(x=>x.id)),new Set(['b','c']));

console.log('Cloud concurrent deletion and independent edits regression tests passed');
