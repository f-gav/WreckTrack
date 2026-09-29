import assert from 'node:assert/strict';
import {loadAppSource} from './_app-source.mjs';
import fs from 'node:fs';
import vm from 'node:vm';

const html=loadAppSource();

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

// Task checkboxes.
assert.match(html,/function journalTaskMatch\(line\)/);
assert.match(html,/data-journal-checkbox=/);
assert.match(html,/room\.journal=value;journalSavedValue=value;save\(\)/);
assert.doesNotMatch(html,/<label class="journal-task-line">/);

// Nested heading folding.
assert.match(html,/journalCollapsedHeadings=new Set\(\)/);
assert.match(html,/function journalFoldRange\(index\)/);
assert.match(html,/next&&next\.level<=heading\.level/);
assert.match(html,/function journalHiddenLines\(\)/);
assert.match(html,/function journalRevealLine\(index\)/);
assert.match(html,/data-journal-fold=/);
assert.match(html,/aria-expanded=/);
assert.match(html,/journalCollapsedHeadings\.clear\(\)/);

// Search/ToC editing must reveal hidden ancestors.
assert.match(html,/journalRevealLine\(index\);journalActiveLine=index/);
assert.match(html,/journalRevealLine\(journalSearchMatches\[journalSearchIndex\]\)/);

// Structural edits must keep fold indices coherent.
assert.match(html,/reindexJournalCollapsedHeadings\(journalActiveLine,1,2\)/);
assert.match(html,/reindexJournalCollapsedHeadings\(journalActiveLine-1,2,1\)/);
assert.match(html,/reindexJournalCollapsedHeadings\(journalActiveLine,1,parts\.length\)/);

const helperStart=html.indexOf('function journalHeadingMeta');
const helperEnd=html.indexOf('function journalLineHtml',helperStart);
assert.ok(helperStart>=0&&helperEnd>helperStart,'folding helpers not found');
const helperSource=html.slice(helperStart,helperEnd);

const context={
  journalLines:[
    '# Глава',
    'текст',
    '## Раздел',
    'подраздел',
    '### Детали',
    'деталь',
    '## Следующий',
    'ещё текст',
    '# Другая глава',
    '- [ ] Задача',
    '- [x] Готово'
  ],
  journalCollapsedHeadings:new Set(),
  journalActiveLine:-1
};
vm.createContext(context);
vm.runInContext(
  helperSource+
  '\nthis.journalFoldRange=journalFoldRange;this.journalHiddenLines=journalHiddenLines;this.journalRevealLine=journalRevealLine;this.journalTaskMatch=journalTaskMatch;',
  context
);

assert.deepEqual(JSON.parse(JSON.stringify(context.journalFoldRange(0))),{start:1,end:8,level:1});
assert.deepEqual(JSON.parse(JSON.stringify(context.journalFoldRange(2))),{start:3,end:6,level:2});
assert.deepEqual(JSON.parse(JSON.stringify(context.journalFoldRange(4))),{start:5,end:6,level:3});

context.journalCollapsedHeadings.add(2);
assert.deepEqual([...context.journalHiddenLines()].sort((a,b)=>a-b),[3,4,5]);

context.journalCollapsedHeadings.add(0);
assert.deepEqual([...context.journalHiddenLines()].sort((a,b)=>a-b),[1,2,3,4,5,6,7]);

context.journalCollapsedHeadings.delete(0);
assert.deepEqual([...context.journalHiddenLines()].sort((a,b)=>a-b),[3,4,5],'child fold must remain after reopening parent');

context.journalRevealLine(5);
assert.equal(context.journalCollapsedHeadings.size,0,'revealing a nested line must open folded ancestors');

assert.equal(context.journalTaskMatch(context.journalLines[9])[2],' ');
assert.equal(context.journalTaskMatch(context.journalLines[10])[2].toLowerCase(),'x');

console.log('Journal task checkbox and heading folding tests passed');
