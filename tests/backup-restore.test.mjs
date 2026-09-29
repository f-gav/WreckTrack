import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const versionMatch=html.match(/CURRENT_SCHEMA_VERSION=(\d+)/);
assert.ok(versionMatch,'CURRENT_SCHEMA_VERSION not found');
const CURRENT_SCHEMA_VERSION=Number(versionMatch[1]);

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

const nameStart=html.indexOf('function fullBackupFileName');
const statsStart=html.indexOf('function fullBackupStats');
const createStart=html.indexOf('function createFullBackup');
assert.ok(nameStart>=0&&statsStart>nameStart&&createStart>statsStart,'backup helpers not found');

const context={CURRENT_SCHEMA_VERSION};
vm.createContext(context);
vm.runInContext(
  html.slice(nameStart,statsStart)+html.slice(statsStart,createStart)+
  '\nthis.fullBackupFileName=fullBackupFileName;this.fullBackupStats=fullBackupStats;',
  context
);

assert.equal(
  context.fullBackupFileName(new Date('2026-09-29T05:00:00.000Z')),
  'WreckTrack-Data-v1-2026-09-29.json'
);

assert.deepEqual(
  JSON.parse(JSON.stringify(context.fullBackupStats({
    bestiary:[{},{}],
    tags:[{}],
    rooms:[
      {entries:[{creatureId:'creature-1'},{creatureId:null}]},
      {entries:[{npc:{name:'NPC'}}]}
    ]
  }))),
  {rooms:2,bestiary:2,tags:1,npcs:2}
);

assert.match(html,/format:'wrecktrack-data'/);
assert.match(html,/formatVersion:1/);
assert.match(html,/id="backup-restore-dialog"/);
assert.match(html,/restoreFullBackup\('merge'\)/);
assert.match(html,/restoreFullBackup\('replace'\)/);

console.log('backup/restore smoke tests passed');
