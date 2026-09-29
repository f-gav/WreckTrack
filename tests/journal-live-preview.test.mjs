import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

// Bestiary menu must escape the card clipping only while the menu is open.
assert.match(html,/\.bestiary-card:has\(\.card-more-menu\[open\]\)\{overflow:visible;z-index:30\}/);
assert.match(html,/\.card-more-menu\[open\]\{z-index:40\}/);
assert.match(html,/\.card-more-popover\{position:absolute;right:0;bottom:calc\(100% \+ 7px\);z-index:50;/);

// Journal inline live-preview contract.
assert.match(html,/function journalInlineTokens\(text\)/);
assert.match(html,/function journalInlinePreviewHtml\(text,baseOffset=0\)/);
assert.match(html,/\.journal-md-marker\{display:none/);
assert.match(html,/\.journal-md-token\.is-revealed>\.journal-md-marker\{display:inline\}/);
assert.match(html,/active\.textContent/);
assert.match(html,/function journalDomPointSourceOffset\(/);
assert.match(html,/function journalPointOffset\(/);
assert.match(html,/document\.addEventListener\('selectionchange'/);
assert.match(html,/editor\.addEventListener\('touchend',scheduleJournalInlineState\)/);
assert.match(html,/aria-pressed="false"/);

// Extract and execute the pure inline-token parser.
const start=html.indexOf('function journalInlineTokens');
const end=html.indexOf('function journalInlinePreviewHtml',start);
assert.ok(start>=0&&end>start,'journalInlineTokens source not found');
const context={};
vm.createContext(context);
vm.runInContext(html.slice(start,end)+'\nthis.journalInlineTokens=journalInlineTokens;',context);

{
  const line='**ФРАЗА ДЛЯ ТЕСТА.** обычный текст *ФРАЗА ДЛЯ ТЕСТА*';
  const tokens=JSON.parse(JSON.stringify(context.journalInlineTokens(line)));
  assert.equal(tokens.length,2);
  assert.equal(tokens[0].type,'bold');
  assert.equal(tokens[0].text,'ФРАЗА ДЛЯ ТЕСТА.');
  assert.equal(tokens[1].type,'italic');
  assert.equal(tokens[1].text,'ФРАЗА ДЛЯ ТЕСТА');
  assert.ok(tokens[0].end<=tokens[1].start,'inline formats must remain independent');
}

{
  const tokens=JSON.parse(JSON.stringify(context.journalInlineTokens('обычный **жирный** и *курсив* текст')));
  assert.deepEqual(tokens.map(token=>token.type),['bold','italic']);
}

// Existing keyboard editing and save protections must remain.
assert.match(html,/if\(e\.key==='Enter'\)/);
assert.match(html,/e\.key==='Backspace'/);
assert.match(html,/wrapJournalMarkdown\(e\.key\.toLowerCase\(\)==='b'\?'bold':'italic'\)/);
assert.match(html,/Есть несохранённые изменения\. Закрыть без сохранения\?/);
assert.match(html,/requestSubmit\(\)/);

console.log('Bestiary menu and Journal live-preview smoke tests passed');
