import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(dist,'service-worker.js'),'utf8');

assert.doesNotMatch(html,/<style[\s>]/i,'dist/index.html must not contain the application stylesheet inline');
const css=html.match(/<link rel="stylesheet" href="(\.\/assets\/app\.[0-9a-f]{12}\.css)">/);
const js=html.match(/<script src="(\.\/assets\/app\.[0-9a-f]{12}\.js)"><\/script>/);
assert.ok(css,'hashed CSS asset reference not found');
assert.ok(js,'hashed JS asset reference not found');

const cssPath=path.join(dist,css[1].replace(/^\.\//,''));
const jsPath=path.join(dist,js[1].replace(/^\.\//,''));
assert.ok(fs.existsSync(cssPath),'built CSS asset missing');
assert.ok(fs.existsSync(jsPath),'built JS asset missing');
assert.ok(fs.statSync(cssPath).size>50000,'built CSS unexpectedly small');
assert.ok(fs.statSync(jsPath).size>100000,'built JS unexpectedly small');
assert.doesNotThrow(()=>new Function(fs.readFileSync(jsPath,'utf8')),'built JS must parse');

for(const name of ['neuzeit-antiqua.ttf','belarus-regular.ttf','ebbe-regular.ttf','old-town-regular.ttf']){
  const fontPath=path.join(dist,'assets','fonts',name);
  assert.ok(fs.existsSync(fontPath),'built font asset missing: '+name);
  assert.ok(fs.statSync(fontPath).size>1000,'built font asset unexpectedly small: '+name);
}
assert.ok(!fs.existsSync(path.join(dist,'fonts')),'legacy dist/fonts directory must not survive the build');
for(const route of ['rooms','bestiary','library','tokenator','settings']){
  const routePath=path.join(dist,route,'index.html');
  assert.ok(fs.existsSync(routePath),'direct route entry missing: '+route);
  const routeHtml=fs.readFileSync(routePath,'utf8');
  assert.match(routeHtml,/<base href="\.\.\/">/,'direct route base missing: '+route);
  assert.ok(routeHtml.includes(css[1]),'direct route CSS hash mismatch: '+route);
  assert.ok(routeHtml.includes(js[1]),'direct route JS hash mismatch: '+route);
}

assert.match(sw,/wreckage-static-[0-9a-f]{12}/);
assert.ok(sw.includes(css[1]),'service worker does not precache built CSS');
assert.ok(sw.includes(js[1]),'service worker does not precache built JS');

console.log('dist build verification passed');
