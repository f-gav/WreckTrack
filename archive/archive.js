(() => {
'use strict';
const sections=[
['classes','Классы','♜','Классы и развитие персонажа'],
['species','Виды','♙','Игровые виды и особенности'],
['backgrounds','Предыстории','▤','Истории происхождения персонажей'],
['feats','Черты','✦','Особые таланты и возможности'],
['spells','Заклинания','✧','Магия, уровни и школы'],
['glossary','Глоссарий','☷','Термины и правила'],
['bestiary','Бестиарий','♞','Существа и их характеристики'],
['magic-items','Магические предметы','◇','Волшебное снаряжение'],
['equipment','Снаряжение','⚒','Оружие, доспехи и предметы'],
['beginner','Новичку','◈','Основы игры'],
['articles','Статьи','▧','Полезные материалы'],
['tools','Инструменты','⚙','Вспомогательные инструменты']];
const $=id=>document.getElementById(id);
const grid=$('category-grid');
for(const [id,title,icon,description] of sections.slice(0,9)){
 const a=document.createElement('a');a.className='category-card';a.href='#'+id;
 const symbol=document.createElement('span');symbol.className='category-icon';symbol.textContent=icon;
 const copy=document.createElement('span');const name=document.createElement('strong');name.textContent=title;const sub=document.createElement('small');sub.textContent=description;copy.append(name,sub);a.append(symbol,copy);grid.append(a);
}
const route=()=>{
 const id=decodeURIComponent(location.hash.slice(1)||'home');const selected=sections.find(s=>s[0]===id);const title=selected?.[1]||'Главная';
 $('page-title').textContent=selected?title:'Справочник D&D';
 $('crumb-current').textContent=title;
 $('page-kicker').textContent=selected?'СПРАВОЧНИК · 2024':'ЭНЦИКЛОПЕДИЯ · 2024';
 $('page-description').textContent=selected?selected[3]+'.':'Разделы пятой редакции Dungeons & Dragons (2024). Содержимое появится позже.';
 $('home-panel').hidden=!!selected;$('empty-panel').hidden=!selected;
 document.querySelectorAll('[data-page]').forEach(a=>{const active=a.dataset.page===(selected?.[0]||'home');a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 document.title=(selected?title+' — ':'')+'WreckArchive · D&D 2024';
 closeSidebar();
};
const sidebar=$('sidebar'),backdrop=$('mobile-backdrop'),hamburger=$('mobile-menu');
function closeSidebar(){sidebar.classList.remove('is-open');backdrop.hidden=true;hamburger.setAttribute('aria-expanded','false')}
hamburger.addEventListener('click',()=>{const opening=!sidebar.classList.contains('is-open');sidebar.classList.toggle('is-open',opening);backdrop.hidden=!opening;hamburger.setAttribute('aria-expanded',String(opening))});
backdrop.addEventListener('click',closeSidebar);
window.addEventListener('hashchange',route);route();
const switchButton=$('project-switch'),projectMenu=$('project-menu');
function closeProject(){projectMenu.hidden=true;switchButton.setAttribute('aria-expanded','false')}
switchButton.addEventListener('click',()=>{const opening=projectMenu.hidden;projectMenu.hidden=!opening;switchButton.setAttribute('aria-expanded',String(opening))});
document.addEventListener('click',e=>{if(!e.target.closest('.brand-wrap'))closeProject()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeProject();closeSidebar();document.querySelectorAll('dialog[open]').forEach(d=>d.close())}});
const accentColors={gold:['Золотистый','#d6a85f'],blue:['Синий','#4f9de8'],scarlet:['Алый','#ef5b56'],purple:['Фиолетовый','#a879e8']};
const fonts={georgia:'Georgia',neuzeit:'Neuzeit Antiqua',belarus:'Belarus',ebbe:'Ebbe Regular','old-town':'Old Town'};
const accentKey='initiative-accent-v1',fontKey='initiative-display-font-v1';
const read=(key,fallback)=>{try{return localStorage.getItem(key)||fallback}catch{return fallback}};
const save=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
function applyAppearance(){
 const accent=read(accentKey,'gold'),font=read(fontKey,'georgia');
 document.documentElement.dataset.accent=accentColors[accent]&&accent!=='gold'?accent:'';
 document.documentElement.dataset.font=fonts[font]&&font!=='georgia'?font:'';
 document.querySelectorAll('[data-accent]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.accent===(accentColors[accent]?accent:'gold'))));
 document.querySelectorAll('[data-font]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.font===(fonts[font]?font:'georgia'))));
}
for(const [id,[label,color]] of Object.entries(accentColors)){
 const b=document.createElement('button');b.type='button';b.className='choice';b.dataset.accent=id;b.innerHTML='<span class="swatch"></span><span></span>';b.querySelector('.swatch').style.setProperty('--swatch',color);b.lastElementChild.textContent=label;b.addEventListener('click',()=>{save(accentKey,id);applyAppearance()});$('accent-choices').append(b);
}
for(const [id,label] of Object.entries(fonts)){
 const b=document.createElement('button');b.type='button';b.className='choice';b.dataset.font=id;b.textContent=label;b.addEventListener('click',()=>{save(fontKey,id);applyAppearance()});$('font-choices').append(b);
}
applyAppearance();window.addEventListener('storage',e=>{if([accentKey,fontKey].includes(e.key))applyAppearance()});
$('settings-button').addEventListener('click',()=>$('settings-dialog').showModal());
$('account-button').addEventListener('click',()=>$('account-dialog').showModal());
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
})();
