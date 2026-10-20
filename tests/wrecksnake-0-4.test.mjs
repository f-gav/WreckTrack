import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../src/features/wrecksnake.js',import.meta.url),'utf8');
const server=fs.readFileSync(new URL('../supabase/functions/wrecksnake/index.ts',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
assert.match(html,/id="snake-sound"/);
assert.match(source,/document\.addEventListener\('visibilitychange'/);
assert.match(source,/window\.addEventListener\('blur',snakeAutoPause\)/);
assert.match(source,/SNAKE_SOUND_KEY='wrecksnake-sound-v1'/);
assert.match(source,/item\.isMe/);
assert.match(source,/data\.mine\.total_score/);
assert.match(server,/total_score/);
assert.match(server,/isMe:r\.user_id===user\.id/);
assert.match(server,/rank:\(count\|\|0\)\+1/);
let status='playing',stops=0,updates=0,draws=0;
const fStart=source.indexOf('function snakeAutoPause(){');
const fEnd=source.indexOf('\nfunction snakeRandomFood()',fStart);
assert.ok(fStart>=0&&fEnd>fStart);
const pause=vm.runInNewContext('('+source.slice(fStart,fEnd).trim()+')',{
 get snakeStatus(){return status},
 set snakeStatus(v){status=v},
 snakeStop(){stops++},snakeUpdateDisplay(){updates++},snakeDraw(){draws++}
});
pause();assert.equal(status,'paused');assert.equal(stops,1);
pause();assert.equal(stops,1,'repeated blur does not disrupt paused game');
console.log('WreckSnake 0.4 focus, audio and account ranking checks passed');
