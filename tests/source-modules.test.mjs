import assert from 'node:assert/strict';
import fs from 'node:fs';

const parts=JSON.parse(fs.readFileSync(new URL('../src/app-parts.json',import.meta.url),'utf8'));
assert.deepEqual(parts,['ui/core.js','ui/markdown.js','app.js']);
assert.equal(new Set(parts).size,parts.length,'app source parts must be unique');

const sources=Object.fromEntries(parts.map(file=>[file,fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8')]));
const bundle=parts.map(file=>sources[file]).join('\n');

assert.doesNotThrow(()=>new Function(bundle),'concatenated app source must remain syntactically valid');

for(const symbol of ['const makeId=','const el=','function escapeHtml(','function plural(','function showToast(']){
  assert.ok(sources['ui/core.js'].includes(symbol),symbol+' missing from ui/core.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}

for(const symbol of ['function inlineMarkdown(','function markdownResourceTokens(','function renderStaticResourceLine(','function renderMarkdown(','function renderCompactMarkdown(','function markdownPreview(']){
  assert.ok(sources['ui/markdown.js'].includes(symbol),symbol+' missing from ui/markdown.js');
  assert.ok(!sources['app.js'].includes(symbol),symbol+' must not remain in app.js');
}

assert.ok(bundle.indexOf('function escapeHtml(')<bundle.indexOf('function inlineMarkdown('),'core helpers must precede Markdown helpers');
assert.ok(bundle.indexOf('function inlineMarkdown(')<bundle.indexOf("const KEY='gm-archive-v2'"),'Markdown helpers must precede application bootstrap');

console.log('source module extraction tests passed');
