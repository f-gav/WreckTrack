import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Execute the production merge functions, not a duplicate implementation.
const source=fs.readFileSync(new URL('../src/cloud-sync.js',import.meta.url),'utf8');
const start=source.indexOf('    function cloneJson(');
const end=source.indexOf('    function openCloudBaseDb(',start);
assert.ok(start>=0&&end>start,'cloud merge function boundaries');
const context=vm.createContext({normalize:value=>value});
vm.runInContext(source.slice(start,end),context);
const merge=(base,local,remote)=>vm.runInContext(
  'mergeConcurrentData('+JSON.stringify(base)+','+JSON.stringify(local)+','+JSON.stringify(remote)+')',context
);
const archive=creatures=>({rooms:[],bestiary:creatures,tags:[]});
const creature=(id,notes='')=>({id,name:'NPC '+id,notes});
const base=archive([creature('a','baseline'),creature('b')]);
const local=archive([creature('a','local'),creature('b'),creature('c')]);
const remote=archive([creature('a','remote'),creature('b','remote edit'),creature('d')]);
const result=merge(base,local,remote);
const entries=JSON.parse(JSON.stringify(result.state.bestiary));
assert.equal(entries.find(x=>x.id==='a').notes,'local','conflicting field uses documented local preference');
assert.equal(entries.find(x=>x.id==='b').notes,'remote edit','independent remote edit kept');
assert.ok(entries.some(x=>x.id==='c')&&entries.some(x=>x.id==='d'),'new records kept from both devices');
assert.equal(result.conflicts,1,'same-field conflict counted');

const deletion=merge(base,archive([creature('b')]),archive([creature('a','remote edited'),creature('b')]));
assert.ok(!deletion.state.bestiary.some(x=>x.id==='a'),'concurrent deletion must not resurrect');
assert.equal(deletion.conflicts,1);

// High-volume deterministic stress of the archive merge.
const many=Array.from({length:3000},(_,i)=>creature(String(i),'x'.repeat(400)));
const bigBase=archive(many);
const bigLocal=archive([...many,creature('new-local')]);
const bigRemote=archive([...many,creature('new-remote')]);
const big=merge(bigBase,bigLocal,bigRemote);
assert.equal(big.state.bestiary.length,3002);
assert.equal(new Set(big.state.bestiary.map(x=>x.id)).size,3002);
assert.equal(big.conflicts,0);
console.log('Cloud merge conflict and large archive regression passed');
