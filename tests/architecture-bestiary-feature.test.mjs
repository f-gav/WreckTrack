import assert from 'node:assert/strict';
import fs from 'node:fs';

const parts=JSON.parse(fs.readFileSync(new URL('../src/app-parts.json',import.meta.url),'utf8'));
const feature=fs.readFileSync(new URL('../src/features/bestiary.js',import.meta.url),'utf8');
const editor=fs.readFileSync(new URL('../src/features/bestiary-editor.js',import.meta.url),'utf8');
const events=fs.readFileSync(new URL('../src/features/bestiary-events.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const combined=parts.map(file=>fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).join('\n');

assert.doesNotThrow(()=>new Function(combined),'concatenated runtime must remain syntactically valid');
assert.ok(parts.indexOf('features/tokenator.js')<parts.indexOf('features/bestiary.js'));
assert.ok(parts.indexOf('features/bestiary.js')<parts.indexOf('features/bestiary-editor.js'));
assert.ok(parts.indexOf('features/bestiary-editor.js')<parts.indexOf('app.js'));

for(const symbol of [
  'function validTagColor(',
  'function tagTextColor(',
  'function renderTagFlags(',
  'function creatureMatchesQuery(',
  'function creatureMatchesBestiaryQuery(',
  'function filteredBestiary(',
  'function renderBestiaryCards(',
  'function updateBestiaryTagSummary(',
  'function renderBestiaryTagOptions(',
  'function renderBestiary('
]){
  assert.ok(feature.includes(symbol),symbol+' missing from Bestiary feature');
  assert.ok(!app.includes(symbol),symbol+' must not remain in app.js');
}

assert.match(events,/#grid-new-creature/);
assert.match(app,/bestiary-search/);
assert.match(app,/data-bestiary-tag/);
assert.match(editor,/function openCreatureDialog\(/);
assert.match(editor,/function duplicateCreature\(/);
assert.doesNotMatch(app,/function openCreatureDialog\(/);
assert.doesNotMatch(app,/function duplicateCreature\(/);

console.log('Bestiary core/editor architecture split tests passed');
