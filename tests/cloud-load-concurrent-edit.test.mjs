import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/cloud-sync.js',import.meta.url),'utf8');
const start=source.indexOf('async function connectCloudSession(session)');
const end=source.indexOf('function disconnectCloudSession()',start);
assert.ok(start>=0&&end>start);
let finishRequest;
const pending=new Promise(resolve=>{finishRequest=resolve});
const initial={rooms:[],bestiary:[],tags:[]};
const finalLocal={rooms:[],bestiary:[{id:'new',name:'Edited during load'}],tags:[]};
const remote={rooms:[],bestiary:[],tags:[]};
let savedState;
const ctx={
  state:initial,cloudUserId:null,cloudReady:false,cloudSyncState:'local',cloudSyncToken:0,
  cloudPendingChanges:false,networkOnline:true,localMutationVersion:0,
  syncedUserId:()=>'',cloneJson:x=>JSON.parse(JSON.stringify(x)),
  cloudSettings:()=>({font:'georgia'}),
  fetchCloudArchive:()=>pending,loadCloudBase:async()=>null,
  updateCloudStatus:()=>{},showToast:()=>{},
  archiveSchemaVersion:()=>1,CURRENT_SCHEMA_VERSION:1,
  CONDITION_PRESET_SYSTEM_VERSION:1,normalize:x=>x,
  setCloudBase:()=>{},mergeConcurrentData:(_base,local,cloud)=>{savedState=local;return{state:{...cloud,bestiary:local.bestiary},settings:{},conflicts:0}},
  archiveHasContent:archive=>archive.bestiary.length>0,
  applyCloudSettings:()=>{},scheduleLocalSave:()=>{},persistLocalState:()=>{},
  sameJson:(a,b)=>JSON.stringify(a)===JSON.stringify(b),
  saveCloudNow:async()=>true,markSyncedUser:()=>{},render:()=>{}
};
vm.createContext(ctx);
vm.runInContext(source.slice(start,end)+'\nthis.connectCloudSession=connectCloudSession;',ctx);
const connecting=ctx.connectCloudSession({user:{id:'u1'}});
ctx.state=finalLocal;
finishRequest({data:{data:remote,settings:{},updated_at:'2026-10-15T00:00:00Z'},error:null});
await connecting;
assert.deepEqual(savedState,finalLocal,'merge must see edits made while remote archive was loading');
assert.deepEqual(ctx.state.bestiary,finalLocal.bestiary,'changes typed during fetch must survive cloud initialization');
console.log('Cloud load concurrent local edit preservation test passed');
