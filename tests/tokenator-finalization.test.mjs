import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

const start=html.indexOf('const TOKEN_FRAMES=');
const end=html.indexOf('function updateBestiaryTagSummary',start);
assert.ok(start>=0&&end>start,'Tokenator source block not found');
const tokenator=html.slice(start,end);

assert.match(tokenator,/TOKENATOR_USE_FRAME_SCHEDULER=true/);
assert.match(tokenator,/TOKENATOR_MAX_SOURCE_DIMENSION=4096/);
assert.match(tokenator,/function prepareTokenatorPortrait\(/);
assert.match(tokenator,/if\(longest<=TOKENATOR_MAX_SOURCE_DIMENSION\)/);
assert.match(tokenator,/targetWidth=Math\.max\(1,Math\.round\(width\*ratio\)\)/);
assert.match(tokenator,/targetHeight=Math\.max\(1,Math\.round\(height\*ratio\)\)/);
assert.match(tokenator,/imageSmoothingQuality='high'/);
assert.match(tokenator,/canvas\.toBlob\(/);
assert.match(tokenator,/const loadToken=\+\+tokenatorLoadToken/);

assert.match(tokenator,/data-token-color-delete=/);
assert.match(tokenator,/tokenatorFavoriteColors=tokenatorFavoriteColors\.filter/);
assert.match(tokenator,/persistTokenColors\(\);markLocalMutation\(false\);scheduleCloudSave\(\)/);
assert.match(tokenator,/Цвет удалён из закладок/);

assert.doesNotMatch(tokenator,/localStorage\.setItem\(['"]tokenatorPortrait/);

console.log('Tokenator finalization smoke tests passed');
