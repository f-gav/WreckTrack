import assert from 'node:assert/strict';
import {loadAppSource} from './_app-source.mjs';
import fs from 'node:fs';

const html=loadAppSource();

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

// Resource insertion must leave a trailing space so repeated clicks create "[ ] [ ] [ ]".
assert.match(html,/\+'\[ \] '\+selected\+/);
assert.match(html,/area\.setRangeText\('\[ \] '\+selected/);
assert.match(html,/start\+4\+selected\.length/);

// Settings moved out of the text nav and into a square button beside the account control.
assert.doesNotMatch(html,/<button class="topnav-button" data-go="settings">Настройки<\/button>/);
assert.match(html,/class="topbar-settings-button"[^>]*data-go="settings"/);
assert.match(html,/\.topbar-settings-button\{/);
assert.match(html,/\.topbar-settings-button svg\{/);
assert.match(html,/stroke-width:2\.15/);


// The actually-used room renderer must use preview/edit mode too.
const activeRendererStart=html.indexOf('function renderInitiativeRow(room,x,outside=false)');
const activeRendererEnd=html.indexOf('function renderRoomWithOutsideCombat',activeRendererStart);
assert.ok(activeRendererStart>=0&&activeRendererEnd>activeRendererStart,'active room renderer not found');
const activeRenderer=html.slice(activeRendererStart,activeRendererEnd);
assert.match(activeRenderer,/data-combat-note-preview=/);
assert.match(activeRenderer,/data-combat-note="\$\{key\}" hidden/);
assert.doesNotMatch(activeRenderer,/aria-label="Боевая заметка: \$\{escapeHtml\(x\.creature\.name\|\|'NPC'\)\}" data-combat-note=/);

// Battle note has a rendered preview plus an edit textarea.
assert.match(html,/function renderBattleNotePreview\(value,entryId\)/);
assert.match(html,/data-combat-note-preview=/);
assert.match(html,/function beginBattleNoteEditing\(/);
assert.match(html,/function endBattleNoteEditing\(/);

// Bold / italic / strike are rendered in preview mode.
assert.match(html,/inlineMarkdown\(line\)/);
assert.match(html,/\.battle-note-preview strong\{/);
assert.match(html,/\.battle-note-preview em\{/);
assert.match(html,/\.battle-note-preview del\{/);

// Task/resource controls remain interactive in battle-note preview.
assert.match(html,/data-battle-task=/);
assert.match(html,/data-battle-resource=/);
assert.match(html,/room\.combatNotes\[key\]=lines\.join\('\\n'\)/);

// Context menu still exposes five actions on desktop/mobile.
assert.equal((html.match(/data-battle-note-format=/g)||[]).length,5);
assert.match(html,/document\.addEventListener\('contextmenu'/);
assert.match(html,/setTimeout\(\(\)=>\{const area=direct\|\|preview&&beginBattleNoteEditing/);
assert.match(html,/endBattleNoteEditing\(area\)\}/);

// Wrapper preserves old grid position across breakpoints.
assert.match(html,/\.battle-note-shell\{width:100%;min-width:0;position:relative;grid-column:4\}/);
assert.match(html,/@media\(max-width:900px\)\{\.battle-note-shell\{grid-column:2\/4\}\}/);
assert.match(html,/@media\(max-width:700px\)\{\.battle-note-shell\{grid-column:1\/-1;grid-row:3\}\}/);

console.log('Resource spacing, topbar Settings, and battle-note preview tests passed');
