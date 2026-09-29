import assert from 'node:assert/strict';
import fs from 'node:fs';

const parts=JSON.parse(fs.readFileSync(new URL('../src/app-parts.json',import.meta.url),'utf8'));
const moduleSource=fs.readFileSync(new URL('../src/ui/markdown-editing.js',import.meta.url),'utf8');
const appSource=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const assembled=parts.map(file=>fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).join('\n');

const names=[
  'wrapMarkdown',
  'addMarkdownToolbars',
  'prefixMarkdownLines',
  'toggleMarkdownTask',
  'insertMarkdownResource'
];

assert.ok(parts.indexOf('ui/markdown.js')>=0,'markdown renderer must be loaded');
assert.equal(
  parts.indexOf('ui/markdown-editing.js'),
  parts.indexOf('ui/markdown.js')+1,
  'Markdown editing helpers should load immediately after Markdown rendering helpers'
);
assert.ok(parts.indexOf('ui/markdown-editing.js')<parts.indexOf('app.js'));

for(const name of names){
  assert.match(moduleSource,new RegExp('function '+name+'\\('),name+' must live in ui/markdown-editing.js');
  assert.doesNotMatch(appSource,new RegExp('function '+name+'\\('),name+' must not remain in app.js');
  assert.equal(
    (assembled.match(new RegExp('function '+name+'\\(','g'))||[]).length,
    1,
    name+' must be defined exactly once in the assembled application'
  );
}

assert.match(moduleSource,/area\.setRangeText\('\[ \] '\+selected/,'resource insertion behavior must stay unchanged');
assert.match(moduleSource,/data-markdown-format="task"/,'toolbar must still expose task control');
assert.match(moduleSource,/data-markdown-format="resource"/,'toolbar must still expose resource control');

assert.doesNotThrow(()=>new Function(assembled),'assembled application JavaScript must parse');

console.log('Architecture 2.1 Markdown editing extraction tests passed');
