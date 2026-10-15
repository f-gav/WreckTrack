import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const src=fs.readFileSync(new URL('../src/features/detail.js',import.meta.url),'utf8');
const start=src.indexOf('function updateRoomArtifactControl(');
const end=src.indexOf('\n    function openCreatureDetail(',start);
assert.ok(start>=0&&end>start,'artifact room control updater exists');
const roomA={id:'a',artifactStates:{}};
const roomB={id:'b',artifactStates:{}};
const creature={id:'c',artifactIds:['amulet']};
let active={room:roomA,entry:{id:'entry-a',creatureId:'c'}};
let saves=0;
const fn=vm.runInNewContext(`(${src.slice(start,end).trim()})`,{
  detailRoomArtifactContext:()=>active,
  entryCreature:entry=>entry.creatureId==='c'?creature:null,
  libraryItemById:(type,id)=>type==='artifacts'&&id==='amulet'?{id}:null,
  save:()=>saves++
});
assert.equal(fn('missing','resource:0:0',true),false,'unknown artifacts must not generate state');
assert.equal(fn('amulet','resource:0:0',true),true,'assigned artifact can change');
assert.equal(roomA.artifactStates['entry-a'].amulet.controls['resource:0:0'],true);
assert.deepEqual(roomB.artifactStates,{},'changes in first room cannot affect the second');
active={room:roomB,entry:{id:'entry-b',creatureId:'c'}};
assert.equal(fn('amulet','resource:0:0',false),true);
assert.equal(roomB.artifactStates['entry-b'].amulet.controls['resource:0:0'],false);
assert.equal(roomA.artifactStates['entry-a'].amulet.controls['resource:0:0'],true,'room A must retain its charge');
creature.artifactIds=[];
assert.equal(fn('amulet','resource:0:1',true),false,'removed artifact cannot gain stale charge state');
assert.equal(roomB.artifactStates['entry-b'].amulet.controls['resource:0:1'],undefined);
assert.equal(saves,2,'invalid operations do not trigger persistence');
console.log('Artifact control ownership and room isolation tests passed');
