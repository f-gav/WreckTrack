import assert from 'node:assert/strict';
import {loadAppSource} from './_app-source.mjs';
import fs from 'node:fs';

const html=loadAppSource();

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

// Font choices use !important on h1 and .dialog-form h3. Journal rules need
// stronger specificity as well as !important to win for every font choice.
assert.match(html,/:root\[data-font="neuzeit"\] h1\{font-size:[^}]+!important\}/);
assert.match(html,/:root\[data-font="neuzeit"\] \.dialog-form h3\{font-size:[^}]+!important\}/);
for(const [level,size,weight] of [[1,1.82,400],[2,1.43,400],[3,1.22,400],[4,1.1,400],[5,1,700],[6,.85,700]]){
  const rules=[...html.matchAll(new RegExp('#journal-live-editor \\.journal-heading-row h'+level+'\\{font-size:([\\d.]+)em!important;font-weight:(\\d+)\\}','g'))];
  assert.equal(rules.length,1,'Journal heading '+level+' must override global font rules');
  assert.equal(Number(rules[0][1]),size,'Journal heading '+level+' should match the requested hierarchy');
  assert.equal(Number(rules[0][2]),weight,'Journal heading '+level+' should have the requested weight');
}

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
assert.match(html,/battleNoteLongPressTimer=setTimeout\(\(\)=>\{const area=direct\|\|preview&&beginBattleNoteEditing/);
assert.match(html,/Math\.hypot\(/);
assert.match(html,/function applyBattleNoteFormat\(type\)/);

// Existing inline formatting remains wired through wrapMarkdown.
assert.match(html,/formats=\{bold:\['\*\*','\*\*','жирный текст'\],italic:\['\*','\*','курсив'\],strike:\['~~','~~','зачёркнутый текст'\]\}/);

console.log('Final Journal/card/battle-note formatting tests passed');
