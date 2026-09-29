import assert from 'node:assert/strict';
import fs from 'node:fs';

const parts=JSON.parse(fs.readFileSync(new URL('../src/app-parts.json',import.meta.url),'utf8'));
for(const required of ['ui/core.js','ui/markdown.js','ui/markdown-editing.js','state.js','storage.js','cloud-sync.js','features/settings.js','features/tokenator.js','features/tokenator-events.js','features/bestiary.js','features/detail.js','features/data.js','app.js'])assert.ok(parts.includes(required),'missing source part: '+required);
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

for(const symbol of ['function wrapMarkdown(','function addMarkdownToolbars(','function prefixMarkdownLines(','function toggleMarkdownTask(','function insertMarkdownResource(']){
  assert.ok(sources['ui/markdown-editing.js'].includes(symbol),symbol+' missing from ui/markdown-editing.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}

assert.ok(bundle.indexOf('function escapeHtml(')<bundle.indexOf('function inlineMarkdown('),'core helpers must precede Markdown helpers');
assert.ok(bundle.indexOf('function inlineMarkdown(')<bundle.indexOf('function wrapMarkdown('),'Markdown rendering must precede Markdown editing helpers');
assert.ok(bundle.indexOf('function wrapMarkdown(')<bundle.indexOf('const CURRENT_SCHEMA_VERSION=1'),'Markdown editing helpers must precede state schema');
assert.ok(bundle.indexOf('const CURRENT_SCHEMA_VERSION=1')<bundle.indexOf("const KEY='gm-archive-v2'"),'state schema must precede storage');
assert.ok(bundle.indexOf("const KEY='gm-archive-v2'")<bundle.indexOf("const SYNCED_USER_KEY='initiative-cloud-user-v1'"),'storage must precede cloud sync');
assert.ok(bundle.indexOf("const SYNCED_USER_KEY='initiative-cloud-user-v1'")<bundle.indexOf('const ACCENT_KEY='),'cloud sync must precede Settings feature');
assert.ok(bundle.indexOf('const ACCENT_KEY=')<bundle.indexOf('const TOKEN_FRAMES='),'Settings feature must precede Tokenator feature');
assert.ok(bundle.indexOf('const TOKEN_FRAMES=')<bundle.indexOf('function validTagColor('),'Tokenator feature must precede Bestiary feature');
assert.ok(bundle.indexOf('function validTagColor(')<bundle.indexOf("const CHARACTERISTICS_TEMPLATE='"),'Bestiary feature must precede application bootstrap');

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

for(const symbol of ['const ACCENT_KEY=','function applyAccent(','function applyInterfaceDensity(','let settingsSection=','function renderSettings(']){
  assert.ok(sources['features/settings.js'].includes(symbol),symbol+' missing from features/settings.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}

for(const symbol of ['function validTagColor(','function renderTagFlags(','function creatureMatchesBestiaryQuery(','function renderBestiaryCards(','function renderBestiary(']){
  assert.ok(sources['features/bestiary.js'].includes(symbol),symbol+' missing from features/bestiary.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}

for(const symbol of ['const TOKEN_FRAMES=','let tokenatorFrame=','function renderTokenator(','function loadTokenatorImage(','function downloadToken(']){
  assert.ok(sources['features/tokenator.js'].includes(symbol),symbol+' missing from features/tokenator.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}

for(const symbol of ['function fullBackupSettings(','function createFullBackup(','function parseFullBackupPayload(','function restoreFullBackup(']){
  assert.ok(sources['features/data.js'].includes(symbol),symbol+' missing from features/data.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}
assert.ok(parts.indexOf('features/combat.js')<parts.indexOf('features/data.js'),'Data feature must follow Combat');
assert.ok(parts.indexOf('features/data.js')<parts.indexOf('app.js'),'Data feature must precede application bootstrap');

for(const symbol of ['function renderDetailMarkdown(','function openCreatureDetail(','function updateDetailMarkdownControl(']){
  assert.ok(sources['features/detail.js'].includes(symbol),symbol+' missing from features/detail.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}
assert.ok(parts.indexOf('features/combat.js')<parts.indexOf('features/detail.js'),'Detail feature must follow Combat');
assert.ok(parts.indexOf('features/detail.js')<parts.indexOf('app.js'),'Detail feature must precede application bootstrap');

assert.ok(parts.indexOf('features/tokenator.js')<parts.indexOf('features/tokenator-events.js'),'Tokenator event definitions must follow Tokenator core');
assert.ok(parts.indexOf('features/tokenator-events.js')<parts.indexOf('app.js'),'Tokenator event definitions must precede bootstrap');
assert.ok(sources['features/tokenator-events.js'].includes('function registerTokenatorEvents(){'));
assert.ok(sources['app.js'].includes('registerTokenatorEvents();'));
assert.ok(!sources['app.js'].includes("const frame=e.target.closest('[data-token-frame]')"));

console.log('source module extraction tests passed');
