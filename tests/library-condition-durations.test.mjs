import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/features/library.js',import.meta.url),'utf8');
const start=source.indexOf('function reconcileLibraryConditionDurations(');
const end=source.indexOf('\nfunction deleteLibraryItem(',start);
assert.ok(start>=0&&end>start,'condition-duration reconciliation helper must exist');
const reconcile=vm.runInNewContext(`(${source.slice(start,end).trim()})`);
assert.match(source,/reconcileLibraryConditionDurations\(room\)/,'deleting a condition must reconcile timers');
assert.match(source,/reconcileLibraryConditionDurations\(room,new Map\(/,'changing presets must reconcile timers');

const deleted={conditions:{a:['still-assigned'],b:['still-assigned']},conditionDurations:{a:{deleted:2,'still-assigned':3},b:{deleted:1,'still-assigned':4},removed:{deleted:2}}};
reconcile(deleted);
assert.deepEqual(JSON.parse(JSON.stringify(deleted.conditionDurations)),{a:{'still-assigned':3},b:{'still-assigned':4}},'deleted conditions and removed participant timers must be pruned');

const preset={conditions:{a:['new-version','custom'],b:['custom']},conditionDurations:{a:{'old-version':2,custom:6},b:{'old-version':4,custom:3}}};
reconcile(preset,new Map([['old-version','new-version']]));
assert.deepEqual(JSON.parse(JSON.stringify(preset.conditionDurations)),{a:{'new-version':2,custom:6},b:{custom:3}},'remaining rounds follow remapped preset conditions and preserve custom timers');

console.log('Library condition duration stabilization tests passed');
