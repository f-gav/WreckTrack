import assert from 'node:assert/strict';
import fs from 'node:fs';

const parts=JSON.parse(fs.readFileSync(new URL('../src/style-parts.json',import.meta.url),'utf8'));
assert.ok(parts.length>=10,'CSS should be split into multiple focused source files');
assert.equal(new Set(parts).size,parts.length,'style parts must be unique');
for(const file of parts){
  assert.match(file,/^styles\/.+\.css$/);
  const source=fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8');
  assert.ok(source.length>0,file+' must not be empty');
}
assert.equal(fs.existsSync(new URL('../src/styles/app.css',import.meta.url)),false,'monolithic app.css should be removed');

const css=parts.map(file=>fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).join('');
assert.ok(css.length>100000,'combined stylesheet should include the full application styles');
for(const marker of [
  '/* Library foundation */',
  '/* Combat conditions */',
  '/* Creature card page 2: artifacts and inventory */',
  '/* Settings single-page navigation */',
  '/* Alternative card-style creation */'
])assert.ok(css.includes(marker),'missing CSS marker: '+marker);

const build=fs.readFileSync(new URL('../scripts/build.mjs',import.meta.url),'utf8');
assert.match(build,/style-parts\.json/);
assert.match(build,/styleParts\.map\(file=>fs\.readFileSync\(path\.join\(src,file\),'utf8'\)\)\.join\(''\)/);
assert.doesNotMatch(build,/styles','app\.css/);

console.log('CSS module source tests passed');
