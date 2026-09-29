import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadAppSource} from './_app-source.mjs';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const feature=fs.readFileSync(new URL('../src/features/bestiary-editor.js',import.meta.url),'utf8');
const parts=JSON.parse(fs.readFileSync(new URL('../src/app-parts.json',import.meta.url),'utf8'));
const html=loadAppSource();

const editorFunctions=[
  'updateCreatureTagSummary',
  'openCreatureDialog',
  'duplicateCreature',
  'renderTagEditor',
  'openTagsDialog',
  'clearTagDragState',
  'moveTagDraft',
  'moveTagDraftBy',
  'visibleExportCreatures',
  'renderExportCreatures',
  'openExportDialog',
  'toggleAllExportCreatures',
  'downloadSelectedCreatures',
  'prepareImportedTag',
  'prepareImportedCreature',
  'findImportedCreatureMatch',
  'renderCreatureImportPreview',
  'importCreaturesFile',
  'resolveCreatureImportTags',
  'materializeImportedCreature',
  'applyCreatureImport',
  'lssValue',
  'lssFinite',
  'applyLssBonuses',
  'lssStatScore',
  'lssStatModifier',
  'evaluateLssExpression',
  'lssMaximumHp',
  'lssArmorClass',
  'lssRichNode',
  'lssTextBlock',
  'lssLabel',
  'unwrapLssCharacter',
  'lssCreatureFromDocument',
  'importLssCharacterFile'
];

assert.ok(parts.includes('features/bestiary-editor.js'),'Bestiary editor feature missing from app-parts');
assert.ok(
  parts.indexOf('features/bestiary.js') < parts.indexOf('features/bestiary-editor.js') &&
  parts.indexOf('features/bestiary-editor.js') < parts.indexOf('app.js'),
  'Bestiary editor feature must load after Bestiary core and before app bootstrap'
);

for(const name of editorFunctions){
  assert.match(feature,new RegExp('function\\s+'+name+'\\s*\\('),name+' must live in bestiary-editor.js');
  assert.doesNotMatch(app,new RegExp('function\\s+'+name+'\\s*\\('),name+' must not remain duplicated in app.js');
  assert.match(html,new RegExp('function\\s+'+name+'\\s*\\('),name+' must remain available in combined runtime source');
}

// Backup/restore belongs to Data settings and must not move with Bestiary.
for(const name of ['fullBackupSettings','createFullBackup','restoreFullBackup']){
  assert.match(app,new RegExp('function\\s+'+name+'\\s*\\('),name+' must remain in app.js during this extraction');
  assert.doesNotMatch(feature,new RegExp('function\\s+'+name+'\\s*\\('),name+' must not leak into Bestiary editor feature');
}

assert.doesNotThrow(()=>new Function(feature),'Bestiary editor feature must parse as JavaScript');
assert.doesNotThrow(()=>new Function(app),'remaining app bootstrap must parse as JavaScript');

console.log('Bestiary editor architecture extraction tests passed');
