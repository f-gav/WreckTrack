import assert from 'node:assert/strict';
import fs from 'node:fs';

const parts=JSON.parse(fs.readFileSync(new URL('../src/app-parts.json',import.meta.url),'utf8'));
assert.deepEqual(parts,['ui/core.js','ui/markdown.js','state.js','storage.js','cloud-sync.js','features/tokenator.js','app.js']);
assert.equal(new Set(parts).size,parts.length,'app source parts must be unique');

const sources=Object.fromEntries(parts.map(file=>[file,fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8')]));
const bundle=parts.map(file=>sources[file]).join('\n');

assert.doesNotThrow(()=>new Function(bundle),'concatenated app source must remain syntactically valid');

for(const symbol of ['const makeId=','const el=','function escapeHtml(','function plural(','function showToast(']){
  assert.ok(sources['ui/core.js'].includes(symbol),symbol+' missing from ui/core.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}

for(const symbol of ['function inlineMarkdown(','function markdownResourceTokens(','function renderStaticResourceLine(','function renderMarkdown(','function renderCompactMarkdown(','function markdownPreview(']){
  assert.ok(sources['ui/markdown.js'].includes(symbol),symbol+' missing from ui/markdown.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}

assert.ok(bundle.indexOf('function escapeHtml(')<bundle.indexOf('function inlineMarkdown('),'core helpers must precede Markdown helpers');
assert.ok(bundle.indexOf('function inlineMarkdown(')<bundle.indexOf('const CURRENT_SCHEMA_VERSION=1'),'Markdown helpers must precede state schema');
assert.ok(bundle.indexOf('const CURRENT_SCHEMA_VERSION=1')<bundle.indexOf("const KEY='gm-archive-v2'"),'state schema must precede storage');
assert.ok(bundle.indexOf("const KEY='gm-archive-v2'")<bundle.indexOf("const SYNCED_USER_KEY='initiative-cloud-user-v1'"),'storage must precede cloud sync');
assert.ok(bundle.indexOf("const SYNCED_USER_KEY='initiative-cloud-user-v1'")<bundle.indexOf('const TOKEN_FRAMES='),'cloud sync must precede Tokenator feature');
assert.ok(bundle.indexOf('const TOKEN_FRAMES=')<bundle.indexOf("const CHARACTERISTICS_TEMPLATE='"),'Tokenator feature must precede application bootstrap');

for(const symbol of ['const CURRENT_SCHEMA_VERSION=1','function archiveSchemaVersion(','function migrateArchive(','function normalize(data)']){
  assert.ok(sources['state.js'].includes(symbol),symbol+' missing from state.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}

for(const symbol of ["const KEY='gm-archive-v2'","function loadState(","function persistLocalState(","function scheduleLocalSave(","function markLocalMutation(","function save(message)"]){
  assert.ok(sources['storage.js'].includes(symbol),symbol+' missing from storage.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}


for(const symbol of ["const SUPABASE_URL=","let authSession=","function mergeSyncValue(","function mergeConcurrentData(","function openCloudBaseDb(","async function saveCloudNow(","async function connectCloudSession(","function initializeAuth("]){
  assert.ok(sources['cloud-sync.js'].includes(symbol),symbol+' missing from cloud-sync.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}

for(const symbol of ['const TOKEN_FRAMES=','let tokenatorFrame=','function renderTokenator(','function loadTokenatorImage(','function downloadToken(']){
  assert.ok(sources['features/tokenator.js'].includes(symbol),symbol+' missing from features/tokenator.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}

console.log('source module extraction tests passed');
