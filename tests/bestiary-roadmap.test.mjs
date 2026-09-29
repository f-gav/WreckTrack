import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');

for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
  if(!match[1].trim())continue;
  assert.doesNotThrow(()=>new Function(match[1]),'inline JavaScript must remain syntactically valid');
}

// Settings + advanced Bestiary search.
assert.match(html,/BESTIARY_ADVANCED_SEARCH_KEY='initiative-bestiary-advanced-search-v1'/);
assert.match(html,/id="bestiary-advanced-search"/);
assert.match(html,/bestiaryAdvancedSearch,journal/);
assert.match(html,/c\.characteristics,c\.abilities,c\.notes,\.\.\.tagNames/);

const searchStart=html.indexOf('function creatureMatchesQuery');
const searchEnd=html.indexOf('function filteredBestiary',searchStart);
assert.ok(searchStart>=0&&searchEnd>searchStart);
const searchSrc=html.slice(searchStart,searchEnd);
{
  const state={tags:[{id:'t1',name:'Нежить'}]};
  const result=Function('state',`
    let bestiaryAdvancedSearch=false;
    ${searchSrc}
    const c={name:'Скелет',description:'Страж',characteristics:'СИЛ 10',abilities:'Удар мечом',notes:'Боится света',tagIds:['t1']};
    const basic=creatureMatchesBestiaryQuery(c,'света');
    bestiaryAdvancedSearch=true;
    return {
      basic,
      notes:creatureMatchesBestiaryQuery(c,'света'),
      abilities:creatureMatchesBestiaryQuery(c,'мечом'),
      tags:creatureMatchesBestiaryQuery(c,'нежить')
    };
  `)(state);
  assert.equal(result.basic,false);
  assert.equal(result.notes,true);
  assert.equal(result.abilities,true);
  assert.equal(result.tags,true);
}

// Card actions.
assert.match(html,/class="card-more-menu"/);
assert.match(html,/data-duplicate-creature=/);
assert.match(html,/>Дублировать</);
assert.match(html,/>Удалить</);
assert.doesNotMatch(html,/class="mini delete-icon" data-delete-creature="\$\{c\.id\}"/);
assert.match(html,/!e\.target\.closest\('button,\.card-more-menu'\)/);

// Import preview and three strategies.
assert.match(html,/id="import-preview-dialog"/);
assert.match(html,/id="import-add-all"/);
assert.match(html,/id="import-skip-matches"/);
assert.match(html,/id="import-update-matches"/);
assert.match(html,/function findImportedCreatureMatch/);
assert.match(html,/sameName\.length===1\?sameName\[0\]:null/);

const importStart=html.indexOf('function prepareImportedTag');
const importEnd=html.indexOf('function lssValue',importStart);
assert.ok(importStart>=0&&importEnd>importStart);
let importSrc=html.slice(importStart,importEnd);
importSrc=importSrc.replace(/function renderCreatureImportPreview\(\)\{[\s\S]*?\}\n    async function importCreaturesFile\(file\)\{[\s\S]*?\}\n    /,'');

function runImport(mode){
  return Function('source','mode',`
    let idCounter=0;
    const makeId=()=> 'new-'+(++idCounter);
    const validTagColor=v=>/^#[0-9a-f]{6}$/i.test(String(v||''))?String(v):'#d6a85f';
    let state={tags:[],bestiary:[
      {id:'a',name:'Гоблин',description:'старый',hp:'5',ac:'12',characteristics:'',abilities:'',notes:'',tagIds:[]}
    ]};
    const creatureById=id=>state.bestiary.find(c=>c.id===id);
    let pendingCreatureImport=null;
    const el=()=>({close(){}});
    const save=()=>{};
    const render=()=>{};
    eval(source);
    pendingCreatureImport={
      tags:[],
      records:[
        {creature:prepareImportedCreature({id:'a',name:'Гоблин',description:'обновлён'}),matchId:'a'},
        {creature:prepareImportedCreature({name:'Тролль',description:'новый'}),matchId:null}
      ]
    };
    applyCreatureImport(mode);
    return state.bestiary.map(c=>({id:c.id,name:c.name,description:c.description}));
  `)(importSrc,mode);
}

{
  const all=runImport('all');
  assert.equal(all.length,3);
  assert.equal(all.find(c=>c.id==='a').description,'старый');
  assert.ok(all.some(c=>c.name==='Гоблин'&&c.id!=='a'&&c.description==='обновлён'));
  assert.ok(all.some(c=>c.name==='Тролль'));
}
{
  const skip=runImport('skip');
  assert.equal(skip.length,2);
  assert.equal(skip.find(c=>c.id==='a').description,'старый');
  assert.ok(skip.some(c=>c.name==='Тролль'));
}
{
  const update=runImport('update');
  assert.equal(update.length,2);
  assert.equal(update.find(c=>c.id==='a').description,'обновлён');
  assert.ok(update.some(c=>c.name==='Тролль'));
}

console.log('Bestiary roadmap smoke tests passed');
