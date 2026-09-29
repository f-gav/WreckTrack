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

assert.match(sw,/wreckage-static-[0-9a-f]{12}/);
assert.ok(sw.includes(css[1]),'service worker does not precache built CSS');
assert.ok(sw.includes(js[1]),'service worker does not precache built JS');

console.log('dist build verification passed');
