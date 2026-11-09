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
['equipment','Снаряжение','⚒','Оружие, доспехи и предметы']];
const $=id=>document.getElementById(id);
const grid=$('category-grid');
for(const [id,title,icon,description] of sections.slice(0,9)){
 const a=document.createElement('a');a.className='category-card';a.href='#'+id;
 const symbol=document.createElement('span');symbol.className='category-icon';symbol.textContent=icon;
 const copy=document.createElement('span');const name=document.createElement('strong');name.textContent=title;const sub=document.createElement('small');sub.textContent=description;copy.append(name,sub);a.append(symbol,copy);grid.append(a);
}
// Only entries with independently identified names are shown; no mechanics are invented.
const warcraftEntries={
 classes:[{id:'death-knight',name:'Рыцарь смерти',original:'Death Knight',description:'Рыцарь смерти — воин, сочетающий владение оружием, руническую магию, некротическую энергию и защитные ауры.'}],
 species:[]
};
const search=$('archive-search');
const renderCatalog=(section)=>{
 const query=search.value.trim().toLocaleLowerCase('ru');
 const entries=(warcraftEntries[section]||[]).filter(item=>(item.name+' '+item.original).toLocaleLowerCase('ru').includes(query));
 const cards=$('warcraft-cards');cards.replaceChildren();
 for(const item of entries){
  const a=document.createElement('a');a.className='warcraft-card';a.href='#'+section+'/'+item.id;
  const name=document.createElement('strong');name.textContent=item.name;
  const original=document.createElement('em');original.textContent=item.original;
  const source=document.createElement('small');source.textContent='World of Warcraft';
  a.append(name,original,source);cards.append(a);
 }
 $('archive-count').textContent=entries.length+' материалов';
 $('catalog-no-results').hidden=entries.length!==0;
 $('catalog-no-results').textContent=query?'Ничего не найдено.':'Подтверждённые материалы появятся здесь после публикации.';
};

const deathKnightLevels=[
['Специализация, Оружейное мастерство, Лик смерти, Сотворение заклинаний',0,2,[2,0,0,0,0]],
['Боевой стиль, Руническая кара',0,3,[2,0,0,0,0]],
['Гравирование рун, Проведение божественности, Сила рун, Заклинания Чёрного клинка',2,4,[3,0,0,0,0]],
['Увеличение характеристик',2,5,[3,0,0,0,0]],
['Дополнительная атака, Верный скакун',2,6,[4,2,0,0,0]],
['Аура защиты',2,6,[4,2,0,0,0]],
['Аура смертной стойкости',2,7,[4,3,0,0,0]],
['Увеличение характеристик',2,7,[4,3,0,0,0]],
['Подавление врагов',2,9,[4,3,2,0,0]],
['Аура отваги',2,9,[4,3,2,0,0]],
['Рунические удары',3,10,[4,3,3,0,0]],
['Увеличение характеристик',3,10,[4,3,3,0,0]],
['—',3,11,[4,3,3,1,0]],
['Усиленный лик смерти',3,11,[4,3,3,1,0]],
['Власть над рунами',3,12,[4,3,3,2,0]],
['Увеличение характеристик',3,12,[4,3,3,2,0]],
['—',3,14,[4,3,3,3,1]],
['Расширение ауры',3,14,[4,3,3,3,1]],
['Эпический дар',3,15,[4,3,3,3,2]],
['Всадник Апокалипсиса',3,15,[4,3,3,3,2]]
];
const deathKnightFeatures=[
[1,'Специализация','Класс допускает разные направления развития: Кровь, Лёд и Нечестивость. Специализация влияет на рекомендуемые решения и применение рун.'],
[1,'Оружейное мастерство','Выберите два доступных вида оружия, для которых сможете использовать свойства мастерства. Выбор можно менять после долгого отдыха.'],
[1,'Лик смерти','Вы становитесь Нежитью. Запас костей к8 зависит от Харизмы; бонусным действием они используются против цели в пределах 60 футов для некротического урона или лечения нежити.'],
[1,'Сотворение заклинаний','Харизма определяет магию класса. Подготовленные заклинания и ячейки указаны в таблице; ячейки восстанавливаются после долгого отдыха.'],
[2,'Боевой стиль','Выберите подходящую черту боевого стиля или вариант «Нечестивый воин» с двумя заговорами Жреца.'],
[2,'Руническая кара','Рунический удар всегда подготовлен; один раз за долгий отдых его можно использовать без расходования ячейки.'],
[3,'Гравирование рун','Наносите на оружие одну руну: Кровь для временных хитов, Лёд для усиления холодом либо Нечестивость для некротического урона.'],
[3,'Проведение божественности','Открывает божественное чувство и другие эффекты класса; число использований увеличивается на 11-м уровне.'],
[3,'Сила рун','После Рунического удара можно потратить Проведение божественности ради дополнительного эффекта выбранной руны.'],
[3,'Заклинания Чёрного клинка','Дополнительные постоянно подготовленные заклинания зависят от уровня и нанесённой руны.'],
[4,'Увеличение характеристик','Получите соответствующую черту или другую доступную по требованиям. Повторяется на 8, 12 и 16 уровнях.'],
[5,'Дополнительная атака','Действие Атака позволяет совершить две атаки вместо одной.'],
[5,'Верный скакун','Заклинание призыва скакуна всегда подготовлено; предусмотрено бесплатное применение с восстановлением после долгого отдыха.'],
[6,'Аура защиты','Союзники в радиусе 10 футов получают бонус к спасброскам от Харизмы Рыцаря смерти.'],
[7,'Аура смертной стойкости','Союзники в ауре приобретают сопротивление холоду, некротическому и психическому урону.'],
[9,'Подавление врагов','С помощью Проведения божественности можно устрашать несколько видимых целей.'],
[10,'Аура отваги','Аура защищает от состояния Испуганный.'],
[11,'Рунические удары','Рукопашные попадания получают дополнительный некротический урон 1к8.'],
[14,'Усиленный лик смерти','Усиливает некротический урон или восстановление хитов от Лика смерти.'],
[15,'Власть над рунами','Открывает мощный эффект нанесённой руны с восстановлением после долгого отдыха.'],
[18,'Расширение ауры','Радиус Ауры защиты увеличивается до 30 футов.'],
[19,'Эпический дар','Позволяет выбрать подходящую черту эпического дара.'],
[20,'Всадник Апокалипсиса','Временное усиление на 10 минут с дополнительными способами использования рун и восстановления ресурсов.']
];
const runeInfo={
base:['Общие умения','Показаны общие способности класса без специализации.'],
blood:['Кровь','Защитное направление: временные хиты, поддержка выживания и рунические эффекты восстановления.'],
frost:['Лёд','Направление урона холодом: руны усиливают оружие и взаимодействуют с сопротивлением холоду.'],
unholy:['Нечестивость','Некротическое направление: проклятия, рунические эффекты и взаимодействие с призванной нежитью.']
};
let activeClassTab='base',activeRune='base';
function fillClassReference(){
 const tbody=$('class-level-rows');tbody.replaceChildren();
 deathKnightLevels.forEach(([features,channel,prepared,slots],i)=>{
  const tr=document.createElement('tr');
  const values=[i+1,'+'+(2+Math.floor(i/4)),features,channel||'—',prepared,...slots.map(n=>n||'—')];
  values.forEach((value,j)=>{const td=document.createElement('td');td.textContent=value;if(j===2)td.className='feature-cell';tr.append(td)});tbody.append(tr);
 });
 const facts=[['Основные характеристики','Сила и Харизма'],['Кость хитов','к10'],['Хиты за уровень','1к10 (или 6) + модификатор Телосложения'],['Спасброски','Мудрость и Харизма'],['Навыки','Два из: Атлетика, Запугивание, Медицина, Проницательность, Религия, Убеждение'],['Оружие','Простое и воинское'],['Доспехи','Лёгкие, средние, тяжёлые; щиты'],['Начальное снаряжение','Комплект с оружием и доспехами либо 150 зм']];
 const dl=$('class-facts-list');dl.replaceChildren();facts.forEach(([k,v])=>{const dt=document.createElement('dt');dt.textContent=k;const dd=document.createElement('dd');dd.textContent=v;dl.append(dt,dd)});
 renderClassFeatures();
}
function renderClassFeatures(){
 const area=$('class-abilities');area.replaceChildren();
 const intro=document.createElement('p');intro.className='rune-summary';intro.textContent=runeInfo[activeRune][1];area.append(intro);
 for(const [level,title,summary] of deathKnightFeatures){
  const section=document.createElement('section');section.className='class-feature';section.id='feature-'+level+'-'+title.toLocaleLowerCase('ru').replace(/[^а-яa-z0-9]+/g,'-');
  const h=document.createElement('h3');h.textContent='Уровень '+level+': '+title;const p=document.createElement('p');p.textContent=summary;section.append(h,p);area.append(section);
 }
}
function setClassTab(tab){
 activeClassTab=tab;
 $('class-reading').hidden=tab!=='base';$('class-other-tab').hidden=tab==='base';
 document.querySelectorAll('[data-class-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.classTab===tab)));
 document.querySelector('.class-subtabs').hidden=tab!=='base';
 const other=$('class-other-tab');other.replaceChildren();
 if(tab==='description'){
  const h=document.createElement('h3');h.textContent='Рыцарь смерти — обзор';
  const p=document.createElement('p');p.textContent='Воин, использующий руническую магию, некротическую энергию и защитные ауры. Класс сочетает ближний бой с ограниченным сотворением заклинаний.';
  other.append(h,p);
 }else if(tab==='spells'){
  const h=document.createElement('h3');h.textContent='Заклинания Чёрного клинка';
  const p=document.createElement('p');p.textContent='С 3-го уровня набор всегда подготовленных заклинаний расширяется на уровнях 5, 9, 13 и 17. Дополнительный список определяется руной Крови, Льда или Нечестивости.';
  const a=document.createElement('a');a.href='https://next.dnd.su/class/wow/death-knight';a.target='_blank';a.rel='noopener noreferrer';a.textContent='Полная таблица заклинаний в источнике';
  other.append(h,p,a);
 }
}
document.querySelectorAll('[data-class-tab]').forEach(b=>b.addEventListener('click',()=>setClassTab(b.dataset.classTab)));
document.querySelectorAll('[data-rune]').forEach(b=>b.addEventListener('click',()=>{activeRune=b.dataset.rune;document.querySelectorAll('[data-rune]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderClassFeatures()}));
fillClassReference();

const route=()=>{
 const raw=decodeURIComponent(location.hash.slice(1)||'home');
 const [id,entryId]=raw.split('/');
 const selected=sections.find(s=>s[0]===id);
 const entry=(warcraftEntries[id]||[]).find(item=>item.id===entryId);
 const detail=Boolean(entry);
 const catalog=id==='classes'||id==='species';
 const title=entry?.name||selected?.[1]||'Справочник D&D';
 $('page-title').textContent=title;
 $('crumb-current').textContent=title;
 $('page-kicker').textContent=detail?'WORLD OF WARCRAFT · 2024':selected?'СПРАВОЧНИК · 2024':'ЭНЦИКЛОПЕДИЯ · 2024';
 $('page-description').textContent=detail?entry.description:selected?selected[3]+'.':'Разделы D&D 2024. Классы и виды World of Warcraft появятся в следующих обновлениях.';
 $('home-panel').hidden=!!selected;
 $('warcraft-panel').hidden=!catalog||detail;
 $('detail-panel').hidden=!detail;
 $('empty-panel').hidden=!selected||catalog;
 if(catalog&&!detail){search.value='';renderCatalog(id)}
 if(detail){
  $('detail-title').textContent=entry.name;
  $('detail-original').textContent=entry.original;
  $('detail-overview').textContent=entry.description;
  $('detail-back').href='#'+id;
  activeRune='base';document.querySelectorAll('[data-rune]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rune==='base')));renderClassFeatures();setClassTab('base');
 }
 document.querySelectorAll('[data-page]').forEach(a=>{
  const active=a.dataset.page===(selected?.[0]||'home');
  a.classList.toggle('active',active);
  if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
 document.title=title+' — WreckArchive · D&D 2024';
 closeSidebar();
};
search.addEventListener('input',()=>{const id=decodeURIComponent(location.hash.slice(1)||'home').split('/')[0];if(id==='classes'||id==='species')renderCatalog(id)});
const sidebar=$('sidebar'),backdrop=$('mobile-backdrop'),hamburger=$('mobile-menu');
function closeSidebar(){sidebar.classList.remove('is-open');backdrop.hidden=true;hamburger.setAttribute('aria-expanded','false')}
hamburger.addEventListener('click',()=>{const opening=!sidebar.classList.contains('is-open');sidebar.classList.toggle('is-open',opening);backdrop.hidden=!opening;hamburger.setAttribute('aria-expanded',String(opening))});
backdrop.addEventListener('click',closeSidebar);
window.addEventListener('hashchange',route);
// Header project menu is provided by the same project-switcher module as WreckTrack.
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeSidebar()});

const accentColors={
 gold:['Золотистый','#d6a85f','Золотое оформление WreckTrack'],
 blue:['Синий','#4f9de8','Синий контраст интерфейса'],
 scarlet:['Алый','#ef5b56','Алый контраст интерфейса'],
 purple:['Фиолетовый','#a879e8','Фиолетовый контраст интерфейса']
};
const fonts={
 georgia:['Georgia','Georgia,serif'],
 neuzeit:['Neuzeit Antiqua',"'Neuzeit Antiqua',Georgia,serif"],
 belarus:['Belarus',"'Belarus',Georgia,serif"],
 ebbe:['Ebbe Regular',"'Ebbe Regular','Ebbe',Georgia,serif"],
 'old-town':['Old Town',"'Old Town',Georgia,serif"]
};
const accentKey='initiative-accent-v1';
const fontKey='initiative-display-font-v1';
const densityKey='initiative-density-v1';
const read=(key,fallback)=>{try{return localStorage.getItem(key)||fallback}catch{return fallback}};
const save=(key,value)=>{try{localStorage.setItem(key,String(value));return true}catch{return false}};
const currentAccent=()=>accentColors[read(accentKey,'gold')]?read(accentKey,'gold'):'gold';
const currentFont=()=>fonts[read(fontKey,'georgia')==='made-winter'?'old-town':read(fontKey,'georgia')]?(read(fontKey,'georgia')==='made-winter'?'old-town':read(fontKey,'georgia')):'georgia';
const currentDensity=()=>{const n=Number(read(densityKey,'0'));return Number.isInteger(n)&&n>=0&&n<=2?n:0};
const status=$('save-status');
const showSaveStatus=message=>{
 if(!status)return;
 status.dataset.state='saved';
 status.title=message||'Настройки оформления сохранены в этом браузере';
 $('save-status-label').textContent='Настройки сохранены';
};
function applyAppearance(){
 const accent=currentAccent(),font=currentFont(),density=currentDensity();
 document.documentElement.dataset.accent=accent==='gold'?'':accent;
 document.documentElement.dataset.font=font==='georgia'?'':font;
 document.documentElement.dataset.density=density?String(density):'';
 document.querySelectorAll('[data-accent]').forEach(b=>{const chosen=b.dataset.accent===accent;b.setAttribute('aria-pressed',String(chosen));b.classList.toggle('current',chosen);const state=b.querySelector('.accent-state');if(state)state.textContent=chosen?'Выбрано':''});
 document.querySelectorAll('[data-font]').forEach(b=>{const chosen=b.dataset.font===font;b.setAttribute('aria-pressed',String(chosen));b.classList.toggle('current',chosen);const state=b.querySelector('.font-state');if(state)state.textContent=chosen?'Выбрано':''});
 const slider=$('interface-density');slider.value=String(density);
 $('interface-density-label').textContent=['Обычная','Компактная','Плотная'][density];
}
const colorGrid=$('accent-choices');
for(const [id,[name,color,description]] of Object.entries(accentColors)){
 const button=document.createElement('button');
 button.type='button';button.className='accent-choice';button.dataset.accent=id;
 button.style.setProperty('--choice',color);
 const swatch=document.createElement('span');swatch.className='accent-swatch';swatch.setAttribute('aria-hidden','true');
 const copy=document.createElement('span');copy.className='accent-copy';
 const strong=document.createElement('strong');strong.textContent=name;
 const small=document.createElement('span');small.textContent=description;
 const state=document.createElement('span');state.className='accent-state';
 copy.append(strong,small);button.append(swatch,copy,state);
 button.addEventListener('click',()=>{save(accentKey,id);applyAppearance();showSaveStatus()});
 colorGrid.append(button);
}
const fontGrid=$('font-choices');
for(const [id,[name,style]] of Object.entries(fonts)){
 const button=document.createElement('button');button.type='button';button.className='font-choice';button.dataset.font=id;
 const copy=document.createElement('span');copy.className='font-copy';
 const strong=document.createElement('strong');strong.textContent=name;
 const sample=document.createElement('span');sample.className='font-sample';sample.textContent='WreckArchive';sample.style.fontFamily=style;
 const state=document.createElement('span');state.className='font-state';
 copy.append(strong,sample);button.append(copy,state);
 button.addEventListener('click',()=>{save(fontKey,id);applyAppearance();showSaveStatus()});
 fontGrid.append(button);
}
$('interface-density').addEventListener('input',event=>{save(densityKey,event.target.value);applyAppearance();showSaveStatus()});
applyAppearance();showSaveStatus();
window.addEventListener('storage',event=>{if([accentKey,fontKey,densityKey].includes(event.key))applyAppearance()});
window.addEventListener('pageshow',applyAppearance);

$('settings-button').addEventListener('click',()=>{applyAppearance();$('settings-dialog').showModal()});

// Display the real shared Supabase account identity without duplicating
// WreckTrack's cloud-data/sync/sign-out logic in this read-only companion.
const SUPABASE_URL='https://bdozzhlmuaswqeyawzdr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_7TKD0bDzOpr2_Q8sBz8HSw_jiD_FMyo';
const authClient=window.supabase?.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
})||null;
let authSession=null;
function updateAccountUi(){
 const user=authSession?.user,email=user?.email||'',avatarUrl=user?.user_metadata?.avatar_url||user?.user_metadata?.picture||'';
 const button=$('account-button'),avatar=$('account-avatar');
 $('account-label').textContent=email||'Войти';
 button.title=email||'Войти через Google';
 button.setAttribute('aria-label',email?'Аккаунт: '+email:'Войти в аккаунт');
 avatar.replaceChildren();
 avatar.classList.toggle('has-image',Boolean(avatarUrl));
 if(avatarUrl){
  const image=document.createElement('img');image.src=avatarUrl;image.alt='';image.referrerPolicy='no-referrer';
  image.addEventListener('error',()=>{avatar.classList.remove('has-image');avatar.textContent='●'},{once:true});
  avatar.append(image);
 }else avatar.textContent='●';
 const signedIn=Boolean(user);
 $('auth-login-view').hidden=signedIn;
 $('auth-account-view').hidden=!signedIn;
 $('auth-title').textContent=signedIn?'Аккаунт':'Вход в аккаунт';
 if(signedIn){
  $('auth-account-email').textContent=email||'Аккаунт';
  const modalAvatar=$('auth-avatar');modalAvatar.replaceChildren();
  if(avatarUrl){const img=document.createElement('img');img.src=avatarUrl;img.alt='';img.referrerPolicy='no-referrer';modalAvatar.append(img)}else modalAvatar.textContent='●';
 }
}
$('account-button').addEventListener('click',()=>{updateAccountUi();$('auth-dialog').showModal()});
$('auth-google').addEventListener('click',async()=>{
 const status=$('auth-status');
 if(!authClient){status.textContent='Сервис входа недоступен. Откройте WreckTrack и войдите в аккаунт.';return}
 status.textContent='Открываем вход через Google…';
 $('auth-google').disabled=true;
 try{
  const {error}=await authClient.auth.signInWithOAuth({provider:'google',options:{redirectTo:new URL('../',document.baseURI).href}});
  if(error)status.textContent=error.message||'Не удалось выполнить вход';
 }catch(error){status.textContent=error.message||'Не удалось выполнить вход'}
 finally{$('auth-google').disabled=false}
});
if(authClient){
 authClient.auth.onAuthStateChange((_event,session)=>{authSession=session;updateAccountUi()});
 authClient.auth.getSession().then(({data})=>{authSession=data?.session||null;updateAccountUi()}).catch(()=>updateAccountUi());
}
updateAccountUi();
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog')?.close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()}));
// Global controls are ready; now initialize the active catalog/deep-link route.
route();
})();
