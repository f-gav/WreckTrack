import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/cloud-sync.js',import.meta.url),'utf8');
const fragment=(start,end)=>{
  const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,`missing function between ${start} and ${end}`);
  return source.slice(a,b);
};
const retrySource=fragment('function clearCloudRetry(){','function scheduleCloudSave(){');
const saveSource=fragment('async function saveCloudNow(){','async function connectCloudSession(session){');
const timers=[];
const context={
  authSession:{user:{id:'user-1'}},cloudUserId:'user-1',cloudReady:true,
  cloudSaving:false,cloudSaveQueued:false,cloudSavePromise:null,cloudSyncToken:1,
  cloudSyncState:'synced',cloudPendingChanges:false,networkOnline:true,
  cloudRetryTimer:null,cloudRetryAttempt:0,cloudSaveTimer:null,
  state:{rooms:[],bestiary:[]},localMutationVersion:5,
  clearTimeout:()=>{},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length},
  persistLocalState:()=>true,cloudSettings:()=>({}),cloneJson:v=>JSON.parse(JSON.stringify(v)),
  performCloudSave:async()=>{throw new Error('Connection lost')},
  updateCloudStatus:()=>{},showToast:()=>{},markSyncedUser:()=>{},
  retryCloudSync:()=>{},render:()=>{},scheduleLocalSave:()=>{},scheduleCloudSave:()=>{},
  applyCloudSettings:()=>{},setCloudBase:()=>{},cloudBaseState:null,cloudBaseSettings:null,cloudVersion:null
};
vm.createContext(context);
vm.runInContext(retrySource+'\n'+saveSource,context);
assert.equal(await context.saveCloudNow(),false,'network exceptions should produce a failed result');
assert.equal(context.cloudSaving,false,'a rejected promise must release the saving lock');
assert.equal(context.cloudSavePromise,null,'a rejected promise must release the pending promise');
assert.equal(context.cloudPendingChanges,true,'unsynced edits must remain marked as pending');
assert.equal(context.cloudSyncState,'error');
assert.equal(timers.length,1,'failure schedules a retry');
assert.equal(timers[0].delay,2000,'first retry starts after two seconds');
assert.equal(context.cloudRetryAttempt,1);
context.scheduleCloudRetry('user-1');
assert.equal(timers.length,1,'concurrent failures must not queue duplicate retries');
context.clearCloudRetry();
context.scheduleCloudRetry('user-1');
assert.equal(timers[1].delay,2000,'successful recovery resets retry backoff');
context.cloudUserId='other-user';
context.clearCloudRetry();
context.scheduleCloudRetry('user-1');
assert.equal(timers.length,2,'the previous account cannot receive retries');

console.log('Cloud retry and rejected promise recovery tests passed');
