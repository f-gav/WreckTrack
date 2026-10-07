    const CHARACTERISTICS_TEMPLATE='С:0 | Л:0 | Т:0 | И:0 | М:0 | X:0';
    const DIRECT_VIEW_ROUTES={bestiary:'bestiary',rooms:'rooms',library:'library',tokenator:'tokenator',settings:'settings'};
    const VIEW_ROUTE_SLUG={bestiary:'bestiary',rooms:'rooms',room:'rooms',library:'library','library-conditions':'library','library-artifacts':'library',tokenator:'tokenator',settings:'settings'};
    const HISTORY_VIEWS=new Set(['home','bestiary','rooms','room','library','library-conditions','library-artifacts','tokenator','settings']);
    const APP_BASE_PATH=(()=>{const pathname=new URL('.',document.baseURI).pathname;return pathname.endsWith('/')?pathname:pathname+'/'})();
    function routeViewFromLocation(){const relative=location.pathname.startsWith(APP_BASE_PATH)?location.pathname.slice(APP_BASE_PATH.length):'',slug=relative.split('/').filter(Boolean)[0]||'';return DIRECT_VIEW_ROUTES[slug]||'home'}
    function routeUrlForView(name){const slug=VIEW_ROUTE_SLUG[name]||'';return slug?APP_BASE_PATH+slug+'/':APP_BASE_PATH}
    function archiveHistoryState(name,roomId=null){return{...(history.state||{}),archiveView:name==='home'?'home':'content',wreckView:name,wreckRoomId:roomId||null}}
    let state=loadState(),view={name:routeViewFromLocation(),roomId:null},editingRoomId=null,editingCreatureId=null,editingRoomEntryId=null,creatingNpcForRoom=false,membershipCreatureId=null,membershipSelection=new Set(),membershipPendingAdds=new Map(),membershipQuery='',membershipTagFilters=new Set(),tagDraft=[],tagEditorScope='bestiary',draggedTagId=null,bestiaryQuery='',bestiaryTagFilters=new Set(),bestiarySort='number',exportQuery='',exportSelection=new Set(),pendingCreatureImport=null;



    const creatureById=id=>state.bestiary.find(c=>c.id===id),roomById=id=>state.rooms.find(r=>r.id===id);
    const entryCreature=entry=>entry?.creatureId?creatureById(entry.creatureId):entry?.npc;
    const roomEntryById=(room,id)=>room?.entries.find(entry=>entry.id===id);
    const roomCountForCreature=id=>state.rooms.filter(r=>r.entries.some(entry=>entry.creatureId===id)).length;
    function go(name,roomId=null,{fromHistory=false}={}){view={name,roomId};if(!fromHistory){const next=archiveHistoryState(name,roomId),url=routeUrlForView(name);if(name!=='home'&&history.state?.archiveView!=='content')history.pushState(next,'',url);else history.replaceState(next,'',url)}render();scrollTo({top:0,behavior:'smooth'})}
    function restoreHistoryView(){const savedName=history.state?.wreckView,name=HISTORY_VIEWS.has(savedName)?savedName:routeViewFromLocation(),savedRoomId=name==='room'?history.state?.wreckRoomId||null:null;if(name==='room'&&!roomById(savedRoomId)){view={name:'rooms',roomId:null}}else view={name,roomId:savedRoomId};render();scrollTo({top:0,behavior:'smooth'})}
    function empty(title,text,button,id){return `<div class="empty"><div class="empty-symbol">◇</div><h3>${title}</h3><p>${text}</p>${button?`<button class="button primary" id="${id}">${button}</button>`:''}</div>`}
        function render(){if(view.name==='home')renderHome();if(view.name==='bestiary')renderBestiary();if(view.name==='rooms')renderRooms();if(view.name==='room')renderRoom();if(view.name==='library')renderLibrary();if(view.name==='library-conditions')renderLibrarySection('conditions');if(view.name==='library-artifacts')renderLibrarySection('artifacts');if(view.name==='settings')renderSettings();if(view.name==='tokenator')renderTokenator()}
    function renderHome(){el('content').innerHTML=`<section><p class="eyebrow">ПЛАТФОРМА ДЛЯ МАСТЕРА</p><h1>WreckTrack</h1><p class="lead">Всеобщий трекер для DnD. Бестиарий, библиотека, комнаты и токенатор. Всё к вашим услугам!</p><div class="home-grid"><button class="portal" data-go="bestiary"><span class="portal-index">РАЗДЕЛ 01</span><span class="portal-arrow">→</span><h2>Бестиарий</h2><p>${state.bestiary.length} ${plural(state.bestiary.length,'существо','существа','существ')} в общей библиотеке</p></button><button class="portal" data-go="rooms"><span class="portal-index">РАЗДЕЛ 02</span><span class="portal-arrow">→</span><h2>Комнаты</h2><p>${state.rooms.length} ${plural(state.rooms.length,'комната','комнаты','комнат')} для игр и сцен</p></button><button class="portal" data-go="library"><span class="portal-index">РАЗДЕЛ 03</span><span class="portal-arrow">→</span><h2>Библиотека</h2><p>Состояния, артефакты и другие материалы мастера</p></button><button class="portal" data-go="tokenator"><span class="portal-index">РАЗДЕЛ 04</span><span class="portal-arrow">→</span><h2>Токенатор</h2><p>Создание токенов для игрового стола</p></button></div></section>`}
    registerSettingsNavigationEvents();
    registerBestiaryCreateEvent();
    registerSettingsChoiceEvents();
    registerTokenatorEvents();
    registerDetailControlEvents();
    registerPrimaryFormEvents();
    registerBestiaryCardEvents();
    registerLibraryEvents();
    registerSettingsToggleEvents();
    registerBonusHpEvents();
    registerPrimaryActionEvents();
    registerMenuDismissEvents();
    registerDataFileEvents();
    registerMixedInputEvents();
    registerBattleNotePreviewEvents();
    registerCombatConditionEvents();
    registerMixedChangeEvents();
    createJournalDialog();
    
    addMarkdownToolbars();
    
        
    
    registerMarkdownPointerEvents();
    registerJournalOpenEvents();
    registerOutsideCombatToggleEvents();
    registerCombatUndoEvents();
    registerJournalFormattingEvents();
    registerBattleNoteMenuEvents();
    registerPersistenceNetworkEvents();
    window.addEventListener('popstate',restoreHistoryView)
    el('brand-home').onclick=()=>go('home');document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;if(d.id==='journal-dialog'){requestCloseJournal();return}if(d.id==='import-preview-dialog')pendingCreatureImport=null;d.close()}))
    installArchiveActions();
    history.replaceState(archiveHistoryState(view.name,view.roomId),'',routeUrlForView(view.name));render();initializeAuth();registerAgentTools();
    if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register(new URL('service-worker.js',document.baseURI),{updateViaCache:'none'}).then(registration=>registration.update()).catch(()=>{}));
