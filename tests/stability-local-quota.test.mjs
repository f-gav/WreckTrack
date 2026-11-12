import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/storage.js',import.meta.url),'utf8');
const notifications=[];
const saved=new Map();
let fail=false;
const localStorage={
  setItem(key,value){if(fail)throw new Error('QuotaExceededError');saved.set(key,value)},
  getItem(key){return saved.get(key)||null}
};
const context=vm.createContext({
  localStorage,
  setTimeout:()=>1,
  clearTimeout:()=>{},
  updateCloudStatus:()=>{},
  showToast:text=>notifications.push(text),
  normalize:archive=>archive,
  state:{rooms:[],bestiary:Array.from({length:2000},(_,id)=>({id:String(id),name:'Large NPC '+id,notes:'x'.repeat(500)})),tags:[]}
});
vm.runInContext(source,context);
vm.runInContext('scheduleLocalSave()',context);
assert.equal(vm.runInContext('persistLocalState()',context),true,'large local snapshot saved');
assert.ok(saved.get('gm-archive-v2').length>1000000,'large archive exercised');
vm.runInContext('scheduleLocalSave()',context);
fail=true;
assert.equal(vm.runInContext('persistLocalState()',context),false,'quota error surfaced');
assert.equal(vm.runInContext('localSavePending',context),true,'failed save remains pending');
assert.equal(vm.runInContext('localSaveFailed',context),true,'visible error state');
assert.equal(notifications.length,1);
assert.equal(vm.runInContext('persistLocalState()',context),false);
assert.equal(notifications.length,1,'quota error notification not repeated');
fail=false;
assert.equal(vm.runInContext('persistLocalState()',context),true,'retry after recovered storage');
assert.equal(vm.runInContext('localSaveFailed',context),false);
assert.equal(vm.runInContext('localSavePending',context),false);
console.log('Large archive local storage/quota recovery passed');
