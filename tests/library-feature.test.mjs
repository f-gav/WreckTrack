import assert from 'node:assert/strict';
import fs from 'node:fs';

const state=fs.readFileSync(new URL('../src/state.js',import.meta.url),'utf8');
const library=fs.readFileSync(new URL('../src/features/library.js',import.meta.url),'utf8');
const settings=fs.readFileSync(new URL('../src/features/settings.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

const standardIds=[...state.matchAll(/id:'dnd-condition-[^']+'/g)].map(match=>match[0]);
assert.equal(standardIds.length,15,'all 15 standard 2024 D&D conditions should be seeded');
assert.match(state,/const DND_CONDITIONS_VERSION=2/,'standard condition content version should be tracked');
assert.ok(state.includes('−2 к Тестам d20'),'Exhaustion should expose its per-level d20 penalty');
assert.ok(state.includes('5 футов считается Критическим попаданием'),'Paralyzed/Unconscious should expose close-range critical hits');
assert.ok(state.includes("name:'Ошеломлённый'"),'Stunned should remain a standard condition');
for(const name of ['Ослеплённый','Очарованный','Оглохший','Истощение','Испуганный','Схваченный','Недееспособный','Невидимый','Парализованный','Окаменевший','Отравленный','Опрокинутый','Опутанный','Ошеломлённый','Бессознательный'])assert.ok(state.includes("name:'"+name+"'"),'missing condition: '+name);

for(const symbol of ['function renderLibrary(','function renderLibrarySection(','function renderLibraryCards(','function openLibraryItemDialog(','function duplicateLibraryItem(','function deleteLibraryItem(','function setLibraryTagSync('])assert.ok(library.includes(symbol),symbol+' missing');
assert.match(settings,/\['library','Библиотека'\]/);
assert.match(settings,/id="library-sync-tags"/);
assert.match(settings,/Синхронизировать Тэги с Бестиарием/);

const rooms=index.indexOf('data-go="rooms"'),libraryNav=index.indexOf('data-go="library"'),tokenator=index.indexOf('data-go="tokenator"');
assert.ok(rooms>=0&&libraryNav>rooms&&tokenator>libraryNav,'Library must be third in top navigation');
assert.match(app,/РАЗДЕЛ 03[\s\S]*?<h2>Библиотека<\/h2>/);
assert.match(app,/РАЗДЕЛ 04[\s\S]*?<h2>Токенатор<\/h2>/);

console.log('Library foundation tests passed');
