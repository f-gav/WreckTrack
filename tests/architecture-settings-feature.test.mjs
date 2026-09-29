import assert from 'node:assert/strict';
import fs from 'node:fs';

const parts=JSON.parse(fs.readFileSync(new URL('../src/app-parts.json',import.meta.url),'utf8'));
const feature=fs.readFileSync(new URL('../src/features/settings.js',import.meta.url),'utf8');
const events=fs.readFileSync(new URL('../src/features/settings-events.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const combined=parts.map(file=>fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).join('\n');

assert.doesNotThrow(()=>new Function(combined),'concatenated runtime must remain syntactically valid');
assert.ok(parts.indexOf('cloud-sync.js')<parts.indexOf('features/settings.js'));
assert.ok(parts.indexOf('features/settings.js')<parts.indexOf('features/tokenator.js'));

for(const symbol of [
  "const ACCENT_KEY=",
  "const FONT_KEY=",
  "function applyAccent(",
  "function applyDisplayFont(",
  "function applyInterfaceDensity(",
  "function applyBestiaryAdvancedSearch(",
  "function applyJournalEnabled(",
  "function applyBonusHpStyle(",
  "let settingsSection='interface'",
  "function renderSettings("
]){
  assert.ok(feature.includes(symbol),symbol+' missing from Settings feature');
  assert.ok(!app.includes(symbol),symbol+' must not remain in app.js');
}

assert.match(events,/data-settings-section/);
assert.match(events,/interface-density/);

console.log('Settings feature architecture split tests passed');
