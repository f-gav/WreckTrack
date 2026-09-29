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

assert.match(tokenator,/const TOKENATOR_USE_FRAME_SCHEDULER=true/);
assert.match(tokenator,/function scheduleTokenatorDraw\(\)/);
assert.match(tokenator,/function flushTokenatorDraw\(\)/);
assert.match(tokenator,/tokenatorPortraitLayer=null/);
assert.match(tokenator,/tokenatorFrameLayer=null/);

// The two render layers are created lazily and reused. A separate third canvas
// is allowed only for one-off downscaling of oversized source images.
assert.match(tokenator,/if\(!tokenatorPortraitLayer\)tokenatorPortraitLayer=document\.createElement\('canvas'\)/);
assert.match(tokenator,/if\(!tokenatorFrameLayer\)tokenatorFrameLayer=document\.createElement\('canvas'\)/);
assert.match(tokenator,/TOKENATOR_MAX_SOURCE_DIMENSION=4096/);
assert.match(tokenator,/canvas=document\.createElement\('canvas'\);canvas\.width=targetWidth/);
const drawStart=tokenator.indexOf('function drawTokenator(){');
const loadStart=tokenator.indexOf('function loadTokenatorAssets()',drawStart);
assert.ok(drawStart>=0&&loadStart>drawStart);
assert.doesNotMatch(tokenator.slice(drawStart,loadStart),/document\.createElement\('canvas'\)/);

// High-frequency interactions should schedule, not draw immediately.
assert.match(tokenator,/addEventListener\('wheel'[\s\S]*?scheduleTokenatorDraw\(\)/);
assert.match(tokenator,/addEventListener\('pointermove'[\s\S]*?scheduleTokenatorDraw\(\)/);
assert.match(tokenator,/id==='tokenator-scale'[\s\S]*?scheduleTokenatorDraw\(\)/);

// PNG export must flush queued work and render synchronously.
assert.match(tokenator,/function downloadToken\(\)[\s\S]*?flushTokenatorDraw\(\)/);

// The scheduler coalesces repeated requests into a single RAF.
assert.match(tokenator,/if\(tokenatorDrawFrame\)return;tokenatorDrawFrame=requestAnimationFrame/);
assert.match(tokenator,/cancelAnimationFrame\(tokenatorDrawFrame\)/);

console.log('Tokenator rendering optimization smoke tests passed');
