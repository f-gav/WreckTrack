import assert from 'node:assert/strict';
import fs from 'node:fs';

const parts=JSON.parse(fs.readFileSync(new URL('../src/app-parts.json',import.meta.url),'utf8'));
const journal=fs.readFileSync(new URL('../src/features/journal.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const bundle=parts.map(file=>fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).join('\n');

assert.ok(parts.indexOf('features/settings.js')<parts.indexOf('features/journal.js'));
assert.ok(parts.indexOf('features/journal.js')<parts.indexOf('app.js'));
for(const name of [
  'journalInlineTokens','journalInlinePreviewHtml','journalFoldRange',
  'toggleJournalTask','toggleJournalResource','renderJournalEditor',
  'updateJournalToc','updateJournalSearch','createJournalDialog','openJournal'
]){
  const declaration=new RegExp('function\\s+'+name+'\\s*\\(','g');
  assert.match(journal,declaration,name+' should live in the Journal feature');
  assert.doesNotMatch(app,declaration,name+' should not remain in app.js');
  assert.equal([...bundle.matchAll(declaration)].length,1,name+' should have one definition');
}
assert.match(journal,/let journalLines=\[''\]/);
assert.match(app,/createJournalDialog\(\);/);
assert.match(app,/document\.addEventListener\('click',e=>\{if\(e\.target\.closest\('#open-journal'\)\)openJournal\(\)\}\)/);
assert.ok(bundle.indexOf('function openJournal(')<bundle.indexOf('createJournalDialog();'));
assert.doesNotThrow(()=>new Function(bundle));

console.log('Journal feature architecture extraction tests passed');
