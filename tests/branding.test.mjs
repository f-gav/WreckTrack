import assert from 'node:assert/strict';
import fs from 'node:fs';

const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const lock=JSON.parse(fs.readFileSync(new URL('../package-lock.json',import.meta.url),'utf8'));
const readme=fs.readFileSync(new URL('../README.md',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
const settings=fs.readFileSync(new URL('../src/features/settings.js',import.meta.url),'utf8');
const manifest=JSON.parse(fs.readFileSync(new URL('../src/manifest.webmanifest',import.meta.url),'utf8'));
const distManifest=JSON.parse(fs.readFileSync(new URL('../dist/manifest.webmanifest',import.meta.url),'utf8'));
const sw=fs.readFileSync(new URL('../src/service-worker.js',import.meta.url),'utf8');
const build=fs.readFileSync(new URL('../scripts/build.mjs',import.meta.url),'utf8');

assert.equal(pkg.name,'wrecktrack');
assert.equal(lock.name,'wrecktrack');
assert.equal(lock.packages[''].name,'wrecktrack');
assert.match(readme,/^# WreckTrack$/m);
assert.match(index,/<title>WreckTrack - D&D Tracker<\/title>/);
assert.match(index,/class="brand-name">WreckTrack<\/span>/);
assert.match(index,/content="WreckTrack — платформа мастера:/);
assert.doesNotMatch(settings,/>Трекер инициативы<\/span>/);
assert.match(settings,/>WreckTrack<\/span>/);

for(const value of [manifest,distManifest]){
  assert.equal(value.name,'WreckTrack');
  assert.equal(value.short_name,'WreckTrack');
  assert.match(value.description,/WreckTrack|Платформа мастера/);
}
assert.match(build,/wrecktrack-static-/);
assert.doesNotMatch(build,/replaceAll\('\{\{CACHE_NAME\}\}','wreckage-static-/);
assert.match(sw,/key\.startsWith\('wrecktrack-static-'\)/);
assert.match(sw,/key\.startsWith\('wreckage-static-'\)/);

console.log('WreckTrack branding tests passed');
