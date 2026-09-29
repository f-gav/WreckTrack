import assert from 'node:assert/strict';
import {loadAppSource} from './_app-source.mjs';
import fs from 'node:fs';

const html=loadAppSource();

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

// Former Appearance section is now Settings throughout app identifiers and visible text.
assert.match(html,/data-go="settings"/);
assert.match(html,/view\.name==='settings'/);
assert.match(html,/function renderSettings\(/);
assert.match(html,/class="topbar-settings-button"/);
const homeStart=html.indexOf('function renderHome');
const homeEnd=html.indexOf('\n',homeStart);
assert.ok(homeStart>=0&&homeEnd>homeStart);
assert.doesNotMatch(html.slice(homeStart,homeEnd),/data-go="settings"/);
assert.match(html,/settings-grid/);
assert.match(html,/settings-section-title/);
assert.doesNotMatch(html,/data-go="appearance"/);
assert.doesNotMatch(html,/view\.name==='appearance'/);
assert.doesNotMatch(html,/renderAppearance/);
assert.doesNotMatch(html,/appearance-(?:portal|grid|section-title)/);
assert.doesNotMatch(html,/[Оо]формлени[еяю]/);

// The native CSS property "appearance" must remain untouched.
assert.match(html,/-moz-appearance:textfield/);
assert.match(html,/-webkit-appearance:none/);

// Backup filename hint was removed from the settings UI.
assert.doesNotMatch(html,/Имя файла:/);
assert.doesNotMatch(html,/backup-file-pattern/);

// Journal must protect unsaved edits and support Ctrl/Cmd+S.
assert.match(html,/Есть несохранённые изменения\. Закрыть без сохранения\?/);
assert.match(html,/journalHasUnsavedChanges/);
assert.match(html,/requestCloseJournal/);
assert.match(html,/addEventListener\('cancel'/);
assert.match(html,/e\.key\.toLowerCase\(\)==='s'/);
assert.match(html,/requestSubmit\(\)/);
assert.match(html,/d\.id==='journal-dialog'/);
assert.match(html,/target\.dataset\.close==='journal-dialog'/);

console.log('settings rename and journal safety smoke tests passed');
