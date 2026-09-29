import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

assert.match(html,/networkOnline=navigator\.onLine!==false/);
assert.match(html,/cloudPendingChanges=false/);
assert.match(html,/Офлайн — изменения сохранены на устройстве/);
assert.match(html,/id="auth-sync-retry"/);
assert.match(html,/retry\.hidden=effectiveState!==['"]error['"]/);

assert.match(html,/window\.addEventListener\('offline'/);
assert.match(html,/window\.addEventListener\('online'/);
assert.match(html,/Соединение восстановлено — синхронизируем данные/);
assert.match(html,/retryCloudSync\(\)/);

assert.match(html,/if\(!networkOnline\)\{cloudPendingChanges=true;cloudSyncState='offline';updateCloudStatus\(\);return false\}/);
assert.match(html,/cloudSyncState=networkOnline\?'error':'offline'/);
assert.match(html,/wasSynced\|\|archiveHasContent\(localState\)\|\|cloudPendingChanges/);

assert.match(html,/target\.id==='auth-sync-retry'/);
assert.match(html,/retry\.hidden=effectiveState!=='error'/);

console.log('offline cloud sync smoke tests passed');
