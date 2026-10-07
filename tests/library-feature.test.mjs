import assert from 'node:assert/strict';
import fs from 'node:fs';

const state=fs.readFileSync(new URL('../src/state.js',import.meta.url),'utf8');
const library=fs.readFileSync(new URL('../src/features/library.js',import.meta.url),'utf8');
const settings=fs.readFileSync(new URL('../src/features/settings.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

const standardIds=[...state.matchAll(/id:'dnd-condition-[^']+'/g)].map(match=>match[0]);
assert.equal(standardIds.length,30,'both D&D condition presets should contain 15 conditions');
assert.match(state,/const CONDITION_PRESET_SYSTEM_VERSION=3/,'condition preset system version should be tracked');
assert.match(state,/const DND_CONDITIONS_5E14=\[/);
assert.match(state,/const DND_CONDITIONS_5E24=\[/);
assert.match(state,/const DND_CONDITIONS_BOTH=\[/);
assert.ok(state.includes('**Влияние на тесты к20.** Когда вы совершаете Тест к20, результат броска уменьшается на уровень Истощения, умноженный на 2.'),'5e24 Exhaustion should use the supplied exact wording');
assert.ok(state.includes('| 1 | Помеха при проверках характеристик |'),'5e14 Exhaustion should expose the exact six-level table');
assert.ok(state.includes("name:'Сбитый с ног / Лежащий ничком (5е14)'"),'5e14 Prone label should be versioned');
assert.ok(state.includes("name:'Опрокинутый (5е24)'"),'5e24 Prone label should be versioned');
assert.ok(state.includes("name:'Оглохший (5е14)'"),'5e14 names should include the edition suffix');
assert.ok(state.includes('Оглохшее существо ничего не слышит и автоматически проваливает все проверки характеристик, связанные со слухом.'),'5e14 wording should match the supplied source exactly');
assert.ok(state.includes('Находящееся без сознания существо недееспособно, не способно перемещаться и говорить, а также не осознаёт своё окружение.'),'5e14 Unconscious wording should match the supplied source exactly');
assert.ok(state.includes("name:'Оглохший (5е24)'"),'5e24 names should include the edition suffix');
assert.ok(state.includes("description:'Состояние 5е14'"),'5e14 preset cards should use neutral descriptions');
assert.ok(state.includes("description:'Состояние 5е24'"),'5e24 preset cards should use neutral descriptions');
assert.ok(state.includes('**Не можете слышать.** Вы не можете слышать и автоматически проваливаете проверки характеристик, требующие слуха.'),'5e24 Deafened wording should match the supplied source exactly');
assert.ok(state.includes('**Бездеятельность.** У вас есть состояния Недееспособный и Опрокинутый, и вы роняете всё, что держите.'),'5e24 Unconscious wording should match the supplied source exactly');

for(const symbol of ['function renderLibrary(','function renderLibrarySection(','function renderLibraryCards(','function openLibraryItemDialog(','function duplicateLibraryItem(','function deleteLibraryItem(','function installConditionPreset(','function setLibraryTagSync('])assert.ok(library.includes(symbol),symbol+' missing');
assert.match(library,/Предустановить состояния 5е14/);
assert.match(library,/Предустановить состояния 5е24/);
assert.match(library,/Предустановить 5е14 и 5е24/);
assert.match(settings,/\['bestiary','Бестиарий и Библиотека'\]/);
assert.match(settings,/id="library-sync-tags"/);
assert.match(settings,/Синхронизировать Тэги с Библиотекой/);
assert.doesNotMatch(settings,/Синхронизировать Тэги с Бестиарием/);

const rooms=index.indexOf('data-go="rooms"'),libraryNav=index.indexOf('data-go="library"'),tokenator=index.indexOf('data-go="tokenator"');
assert.ok(rooms>=0&&libraryNav>rooms&&tokenator>libraryNav,'Library must be third in top navigation');
assert.match(app,/РАЗДЕЛ 03[\s\S]*?<h2>Библиотека<\/h2>/);
assert.match(app,/РАЗДЕЛ 04[\s\S]*?<h2>Токенатор<\/h2>/);

console.log('Library foundation tests passed');
