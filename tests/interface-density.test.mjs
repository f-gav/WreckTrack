import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

assert.match(html,/DENSITY_KEY='initiative-density-v1'/);
assert.match(html,/function storedInterfaceDensity\(\)/);
assert.match(html,/function applyInterfaceDensity\(value,persist=true\)/);
assert.match(html,/interfaceDensity=storedInterfaceDensity\(\)/);
assert.match(html,/applyInterfaceDensity\(interfaceDensity,false\)/);

assert.match(html,/density:interfaceDensity/);
assert.match(html,/settings\.density/);
assert.match(html,/localStorage\.setItem\(DENSITY_KEY,String\(interfaceDensity\)\)/);

assert.match(html,/id="interface-density"/);
assert.match(html,/\['Обычная','Компактная','Плотная'\]\[interfaceDensity\]/);
assert.match(html,/:root\[data-density="1"\]/);
assert.match(html,/:root\[data-density="2"\]/);

// Density levels change spacing/size of containers, not text size.
const densityCss=html.slice(html.indexOf(':root[data-density="1"]'),html.lastIndexOf('</style>'));
assert.doesNotMatch(densityCss,/font-size\s*:/);
assert.doesNotMatch(densityCss,/font-family\s*:/);

assert.match(html,/function fullBackupSettings\(\)\{return\{\.\.\.cloudSettings\(\)/);

console.log('Interface density setting tests passed');
