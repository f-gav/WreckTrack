    const CHARACTERISTICS_TEMPLATE='С:0 | Л:0 | Т:0 | И:0 | М:0 | X:0';
        let state=loadState(),view={name:'home',roomId:null},editingRoomId=null,editingCreatureId=null,editingRoomEntryId=null,creatingNpcForRoom=false,membershipCreatureId=null,membershipSelection=new Set(),membershipPendingAdds=new Map(),membershipQuery='',membershipTagFilters=new Set(),tagDraft=[],draggedTagId=null,bestiaryQuery='',bestiaryTagFilters=new Set(),bestiarySort='number',exportQuery='',exportSelection=new Set(),pendingCreatureImport=null;



    const creatureById=id=>state.bestiary.find(c=>c.id===id),roomById=id=>state.rooms.find(r=>r.id===id);
    const entryCreature=entry=>entry?.creatureId?creatureById(entry.creatureId):entry?.npc;
    const roomEntryById=(room,id)=>room?.entries.find(entry=>entry.id===id);
    const roomCountForCreature=id=>state.rooms.filter(r=>r.entries.some(entry=>entry.creatureId===id)).length;
    function go(name,roomId=null,{fromHistory=false}={}){view={name,roomId};if(!fromHistory){const next={...(history.state||{}),archiveView:name==='home'?'home':'content'};if(name!=='home'&&history.state?.archiveView!=='content')history.pushState(next,'');else history.replaceState(next,'')}render();scrollTo({top:0,behavior:'smooth'})}
    function empty(title,text,button,id){return `<div class="empty"><div class="empty-symbol">◇</div><h3>${title}</h3><p>${text}</p>${button?`<button class="button primary" id="${id}">${button}</button>`:''}</div>`}
        function render(){el('back-home').hidden=view.name==='home';if(view.name==='home')renderHome();if(view.name==='bestiary')renderBestiary();if(view.name==='rooms')renderRooms();if(view.name==='room')renderRoom();if(view.name==='settings')renderSettings();if(view.name==='tokenator')renderTokenator()}
    function renderHome(){el('content').innerHTML=`<section><p class="eyebrow">Личный архив</p><h1>Что вы хотите открыть?</h1><p class="lead">Бестиарий хранит всех существ. Комнаты собирают нужных существ для отдельных игр и сцен.</p><div class="home-grid"><button class="portal" data-go="bestiary"><span class="portal-index">РАЗДЕЛ 01</span><span class="portal-arrow">→</span><h2>Бестиарий</h2><p>${state.bestiary.length} ${plural(state.bestiary.length,'существо','существа','существ')} в общей библиотеке</p></button><button class="portal" data-go="rooms"><span class="portal-index">РАЗДЕЛ 02</span><span class="portal-arrow">→</span><h2>Комнаты</h2><p>${state.rooms.length} ${plural(state.rooms.length,'комната','комнаты','комнат')} для игр и сцен</p></button><button class="portal tokenator-portal" data-go="tokenator"><span class="portal-index">РАЗДЕЛ 03</span><span class="portal-arrow">→</span><h2>Токенатор</h2><p>Создание токенов для игрового стола</p></button></div></section>`}
    registerSettingsNavigationEvents();
    registerBestiaryCreateEvent();
    registerSettingsChoiceEvents();
    registerTokenatorEvents();
    registerDetailControlEvents();
    registerPrimaryFormEvents();
    registerBestiaryCardEvents();
    registerSettingsToggleEvents();
    registerBonusHpEvents();
    registerPrimaryActionEvents();
    registerMenuDismissEvents();
    registerDataFileEvents();
    registerMixedInputEvents();
    registerBattleNotePreviewEvents();
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
    window.addEventListener('popstate',()=>{if(view.name!=='home')go('home',null,{fromHistory:true})})
    el('brand-home').onclick=()=>go('home');el('back-home').onclick=()=>go('home');document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;if(d.id==='journal-dialog'){requestCloseJournal();return}if(d.id==='import-preview-dialog')pendingCreatureImport=null;d.close()}))
    installArchiveActions();
    history.replaceState({...(history.state||{}),archiveView:'home'},'');render();initializeAuth();registerAgentTools();
    if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'}).then(registration=>registration.update()).catch(()=>{}));
