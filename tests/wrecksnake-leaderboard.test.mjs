import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Check the client and replay verifier share the exact seeded food generator.
const client=fs.readFileSync(new URL('../src/features/wrecksnake.js',import.meta.url),'utf8');
const edge=fs.readFileSync(new URL('../supabase/functions/wrecksnake/index.ts',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../supabase/migrations/20261020_wrecksnake_leaderboard.sql',import.meta.url),'utf8');
assert.match(client,/functions\.invoke\('wrecksnake',[\s\S]*?action:'start'/);
assert.match(client,/action:'finish',sessionId,moves/);
assert.match(client,/action:'leaderboard'/);
assert.match(edge,/Math\.imul\(seed,1664525\)\+1013904223/);
assert.match(client,/Math\.imul\(snakeSeed,1664525\)\+1013904223/);
assert.match(edge,/auth\.getUser\(jwt\)/,'server verifies the bearer account');
assert.match(edge,/validateGame\(Number\(session.seed\),moves\)/,'server recomputes score');
assert.match(edge,/record_wrecksnake_score/);
assert.match(edge,/score\+=1;/,'one point per food on server');
assert.match(client,/snakeScore\+=1;/,'one point per food in client');
assert.match(edge,/\+WIDTH\)%WIDTH/,'server wraps grid edges');
assert.match(client,/\+snakeSize\)%snakeSize/,'client wraps grid edges');
assert.match(migration,/enable row level security/g);
assert.doesNotMatch(migration,/grant\s+(insert|update|delete|all)\s+on\s+public\.wrecksnake_scores\s+to\s+authenticated/i);
assert.match(migration,/security definer/);
assert.match(migration,/grant execute on function public\.record_wrecksnake_score\([^)]+\) to service_role/);
assert.match(migration,/completed_at is null/,'a completed run cannot be claimed twice');
const seededFood=(body,seed)=>{
  const free=[];for(let y=0;y<20;y++)for(let x=0;x<20;x++)if(!body.some(p=>p.x===x&&p.y===y))free.push({x,y});
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  return {seed,food:free[seed%free.length]};
};
const body=[{x:7,y:10},{x:6,y:10},{x:5,y:10}];
const a=seededFood(body,1532),b=seededFood(body,a.seed);
assert.ok(a.food.x>=0&&a.food.x<20&&a.food.y>=0&&a.food.y<20);
assert.notDeepEqual(a.food,b.food);
console.log('WreckSnake global ranking auth, replay and SQL access tests passed');
