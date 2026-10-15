import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const helperSource=fs.readFileSync(new URL('../src/ui/markdown-editing.js',import.meta.url),'utf8');
const eventsSource=fs.readFileSync(new URL('../src/features/journal-events.js',import.meta.url),'utf8');
const journalSource=fs.readFileSync(new URL('../src/features/journal.js',import.meta.url),'utf8');
const start=helperSource.indexOf('function markdownFormattingShortcut(');
const end=helperSource.indexOf('\nfunction wrapMarkdown(',start);
assert.ok(start>=0&&end>start,'shortcut helper is shared by Markdown editors');
const shortcut=vm.runInNewContext(`(${helperSource.slice(start,end).trim()})`);
for(const [code,key,expected] of [['KeyB','b','bold'],['KeyB','и','bold'],['KeyI','i','italic'],['KeyI','ш','italic'],['','и','bold'],['','ш','italic']]){
  assert.equal(shortcut({ctrlKey:true,metaKey:false,altKey:false,shiftKey:false,code,key}),expected,`${code}/${key}`);
}
assert.equal(shortcut({ctrlKey:true,code:'KeyZ',key:'я'}),null,'undo must remain unaffected');
assert.equal(shortcut({ctrlKey:true,altKey:true,code:'KeyB',key:'и'}),null,'AltGr must not trigger formatting');
assert.equal(shortcut({ctrlKey:false,metaKey:false,code:'KeyB',key:'b'}),null,'typing must remain unaffected');
assert.match(eventsSource,/textarea\[data-markdown\],textarea\[data-combat-note\]/,'Markdown and combat note editors should support shortcuts');
assert.match(eventsSource,/markdownFormattingShortcut\(e\)/);
assert.match(journalSource,/markdownFormattingShortcut\(e\)/,'journal inline editor should share shortcut handling');
console.log('Layout-independent Markdown shortcuts tests passed');
