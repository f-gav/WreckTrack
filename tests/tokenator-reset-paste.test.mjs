import assert from 'node:assert/strict';
import {loadAppSource} from './_app-source.mjs';
import fs from 'node:fs';

const html=loadAppSource();

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

const start=html.indexOf('const TOKEN_FRAMES=');
const end=html.indexOf('function updateBestiaryTagSummary',start);
assert.ok(start>=0&&end>start,'Tokenator source block not found');
const tokenator=html.slice(start,end);

assert.match(tokenator,/TOKENATOR_USE_FRAME_SCHEDULER=true/);
assert.match(tokenator,/id="tokenator-scale"/);
assert.match(tokenator,/id="tokenator-reset"/);
assert.match(tokenator,/id="tokenator-scale"[\s\S]*?id="tokenator-reset"[\s\S]*?id="tokenator-scale-value"/);
assert.match(tokenator,/function resetTokenatorTransform\(\)\{tokenatorScale=1;tokenatorOffsetX=0;tokenatorOffsetY=0;/);
assert.match(tokenator,/if\(reset\)reset\.disabled=!tokenatorPortrait/);

assert.match(tokenator,/Нажмите для загрузки или вставьте Ctrl\+V/);
assert.match(tokenator,/document\.addEventListener\('paste'/);
assert.match(tokenator,/if\(view\.name!=='tokenator'\)return/);
assert.match(tokenator,/input,textarea,select,\[contenteditable="true"\]/);
assert.match(tokenator,/loadTokenatorImage\(file,'Изображение вставлено'\)/);

assert.match(tokenator,/function loadTokenatorImage\(/);
assert.match(tokenator,/id!=='tokenator-file'[\s\S]*?loadTokenatorImage\(file\)/);

console.log('Tokenator reset and clipboard paste smoke tests passed');
