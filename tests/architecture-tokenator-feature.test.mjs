import assert from 'node:assert/strict';
import fs from 'node:fs';

const parts=JSON.parse(fs.readFileSync(new URL('../src/app-parts.json',import.meta.url),'utf8'));
assert.deepEqual(parts,[
  'ui/core.js',
  'ui/markdown.js',
  'state.js',
  'storage.js',
  'cloud-sync.js',
  'features/settings.js',
  'features/tokenator.js',
  'app.js'
]);

const feature=fs.readFileSync(new URL('../src/features/tokenator.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const combined=parts.map(file=>fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).join('\n');

assert.doesNotThrow(()=>new Function(combined),'concatenated runtime must remain syntactically valid');
assert.match(feature,/const TOKEN_FRAMES=/);
assert.match(feature,/function renderTokenator\(/);
assert.match(feature,/function downloadToken\(/);
assert.match(feature,/TOKENATOR_MAX_SOURCE_DIMENSION=4096/);
assert.doesNotMatch(app,/const TOKEN_FRAMES=/);
assert.doesNotMatch(app,/function renderTokenator\(/);
assert.match(app,/data-token-frame/);
assert.match(app,/tokenator-file/);

console.log('Tokenator feature architecture split tests passed');
