import assert from 'node:assert/strict';
import {loadAppSource} from './_app-source.mjs';
import fs from 'node:fs';

const html=loadAppSource();

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

// Journal heading hierarchy is intentionally reduced.
assert.match(html,/\.journal-live-editor h1\{font-size:1\.62em\}/);
assert.match(html,/\.journal-live-editor h2\{font-size:1\.4em\}/);
assert.match(html,/\.journal-live-editor h3\{font-size:1\.22em\}/);
assert.match(html,/\.journal-live-editor h4\{font-size:1\.08em\}/);

// Journal toolbar contains exactly the requested five action types.
for(const type of ['bold','italic','strikeThrough','task','resource']){
  assert.match(html,new RegExp('data-journal-format="'+type+'"'));
}
assert.match(html,/function insertJournalControl\(type\)/);

// Creature markdown toolbars expose the same five functions.
for(const type of ['bold','italic','strike','task','resource']){
  assert.match(html,new RegExp('data-markdown-format="'+type+'"'));
}
assert.match(html,/function toggleMarkdownTask\(area\)/);
assert.match(html,/function insertMarkdownResource\(area\)/);

// Character cards render interactive task/resource controls.
assert.match(html,/data-detail-task-field=/);
assert.match(html,/data-detail-resource-field=/);
assert.match(html,/function updateDetailMarkdownControl\(/);
assert.match(html,/section\('Характеристики','characteristics',false\)/);

// Battle note context menu has five buttons and desktop/mobile triggers.
assert.match(html,/id="battle-note-menu"/);
assert.equal((html.match(/data-battle-note-format=/g)||[]).length,5);
assert.match(html,/document\.addEventListener\('contextmenu'/);
assert.match(html,/setTimeout\(\(\)=>openBattleNoteMenu\(area,e\.clientX,e\.clientY\),560\)/);
assert.match(html,/Math\.hypot\(/);
assert.match(html,/function applyBattleNoteFormat\(type\)/);

// Existing inline formatting remains wired through wrapMarkdown.
assert.match(html,/formats=\{bold:\['\*\*','\*\*','жирный текст'\],italic:\['\*','\*','курсив'\],strike:\['~~','~~','зачёркнутый текст'\]\}/);

console.log('Final Journal/card/battle-note formatting tests passed');
