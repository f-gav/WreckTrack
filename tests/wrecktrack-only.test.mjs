import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const appParts=JSON.parse(read('src/app-parts.json'));
const styleParts=JSON.parse(read('src/style-parts.json'));
const app=read('src/app.js');
const index=read('src/index.html');
const build=read('scripts/build.mjs');
const sw=read('src/service-worker.js');

assert.ok(!appParts.includes('ui/project-switcher.js'));
assert.ok(!styleParts.includes('styles/170-project-switcher.css'));
for(const path of ['archive/index.html','archive/archive.css','archive/archive.js','src/ui/project-switcher.js','src/styles/170-project-switcher.css']){
  assert.ok(!fs.existsSync(new URL('../'+path,import.meta.url)),path+' should be removed');
}
assert.doesNotMatch(build,/archiveSource|archiveHeader|archiveCssName|archiveJsName/);
assert.doesNotMatch(sw,/WreckArchive|separate child site/);
assert.match(index,/<button class="brand" id="brand-home" type="button"/);
assert.match(app,/el\('brand-home'\)\.onclick=\(\)=>go\('home'\)/);
assert.match(app,/history\.replaceState\(wreckHistoryState/);
assert.doesNotMatch(app,/archiveView|archiveHistoryState/);
console.log('WreckTrack-only navigation and build tests passed');
