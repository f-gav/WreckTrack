import assert from 'node:assert/strict';
import {loadAppSource} from './_app-source.mjs';
import fs from 'node:fs';
import vm from 'node:vm';

const html=loadAppSource();

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

// Resource tracker syntax and rendering.
assert.match(html,/function journalResourceTokens\(line\)/);
assert.match(html,/function toggleJournalResource\(index,start\)/);
assert.match(html,/journal-resource-pip/);
assert.match(html,/token\.filled\?'◆':'◇'/);
assert.match(html,/task=journalTaskMatch\(line\),resource=!task\?journalResourceLineHtml/);
assert.match(html,/\[data-journal-fold\],\[data-journal-checkbox\],\[data-journal-resource\]/);

const parserStart=html.indexOf('function journalResourceTokens');
const parserEnd=html.indexOf('function persistJournalQuickChange',parserStart);
assert.ok(parserStart>=0&&parserEnd>parserStart,'journalResourceTokens not found');
const context={};
vm.createContext(context);
vm.runInContext(html.slice(parserStart,parserEnd)+'\nthis.journalResourceTokens=journalResourceTokens;',context);

assert.deepEqual(
  JSON.parse(JSON.stringify(context.journalResourceTokens('Ячейки: [x][ ][X]'))),
  [
    {start:8,end:11,filled:true},
    {start:11,end:14,filled:false},
    {start:14,end:17,filled:true}
  ]
);
assert.equal(context.journalResourceTokens('Вдохновение: [ ]').length,1);

// Settings are split into the requested sections.
assert.match(html,/tabs=\[\['interface','Интерфейс'\],\['bestiary','Бестиарий'\],\['library','Библиотека'\],\['rooms','Комнаты'\],\['journal','Журнал'\],\['data','Данные'\]\]/);
assert.match(html,/data-settings-section=/);
assert.match(html,/settingsSection=section\.dataset\.settingsSection;renderSettings\(\)/);
assert.doesNotMatch(html,/const renderSettingsBase=renderSettings/);
assert.match(html,/class="topbar-settings-button"[^>]*data-go="settings"/);
const homeStart=html.indexOf('function renderHome');
const homeEnd=html.indexOf('\n',homeStart);
assert.ok(homeStart>=0&&homeEnd>homeStart);
assert.doesNotMatch(html.slice(homeStart,homeEnd),/data-go="settings"/);

// Existing setting controls are preserved in their new sections.
for(const id of [
  'bestiary-advanced-search',
  'bold-as-section',
  'library-sync-tags',
  'combat-tracking',
  'bonus-hp-enabled',
  'journal-enabled',
  'journal-search-enabled',
  'journal-sections-enabled',
  'journal-bold-sections',
  'create-full-backup',
  'restore-full-backup'
]){
  assert.match(html,new RegExp('id="'+id+'"'));
}

console.log('Journal resource trackers and Settings sections tests passed');
