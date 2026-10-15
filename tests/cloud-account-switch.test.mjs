import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/cloud-sync.js',import.meta.url),'utf8');
const start=source.indexOf('async function performCloudSave(');
const end=source.indexOf('async function saveCloudNow()',start);
assert.ok(start>=0&&end>start,'cloud writer must be available');
const writer=source.slice(start,end);
let resolveWrite;
const pendingWrite=new Promise(resolve=>resolveWrite=resolve);
let baseUpdates=0, renders=0;
const ctx={
  cloudSyncToken:10,cloudUserId:'first',cloudBaseState:{rooms:[],bestiary:[]},
  cloudBaseSettings:{},cloudVersion:'2026-10-15T01:00:00Z',
  localMutationVersion:1,cloudSaveQueued:false,
  cloneJson:v=>JSON.parse(JSON.stringify(v)),
  writeCloudSnapshot:()=>pendingWrite,
  setCloudBase:()=>{baseUpdates++},
  render:()=>{renders++},scheduleLocalSave:()=>{},
  normalize:v=>v,applyCloudSettings:()=>{},
  mergeConcurrentData:()=>{throw Error('must not merge after account switch')},
  cloudSettings:()=>({}),fetchCloudArchive:()=>{throw Error('must not fetch after account switch')}
};
vm.createContext(ctx);
vm.runInContext(writer+'\nthis.performCloudSave=performCloudSave;',ctx);
const oldWrite=ctx.performCloudSave('first',{rooms:[],bestiary:[]},{},1,10);
ctx.cloudSyncToken=11;ctx.cloudUserId='second';
resolveWrite({conflict:false,error:null,data:{updated_at:'2026-10-15T01:01:00Z'}});
const result=await oldWrite;
assert.equal(result.stale,true,'old account completion must be marked stale');
assert.equal(baseUpdates,0,'old response cannot update active account base');
assert.equal(renders,0,'old response cannot replace active account UI');
assert.equal(ctx.cloudUserId,'second');

let wrote=0;
const laterCtx={
  ...ctx,cloudSyncToken:12,cloudUserId:'second',
  writeCloudSnapshot:async()=>{wrote++;return {conflict:false,error:null,data:{updated_at:'v2'}}},
  setCloudBase:()=>{baseUpdates++}
};
vm.createContext(laterCtx);
vm.runInContext(writer+'\nthis.performCloudSave=performCloudSave;',laterCtx);
assert.equal((await laterCtx.performCloudSave('second',{rooms:[],bestiary:[]},{},1,12)).ok,true,'new user saves normally');
assert.equal(wrote,1);
assert.equal(baseUpdates,1);
console.log('Cloud in-flight account isolation tests passed');
