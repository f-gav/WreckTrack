    function registerSettingsNavigationEvents(){
    document.addEventListener('click',e=>{const section=e.target.closest('[data-settings-section]');if(!section)return;scrollToSettingsSection(section.dataset.settingsSection)})
    document.addEventListener('input',e=>{if(e.target.id!=='interface-density')return;applyInterfaceDensity(e.target.value);const label=el('interface-density-label');if(label)label.value=label.textContent=['Обычная','Компактная','Плотная'][interfaceDensity]})
    let settingsScrollPending=false;window.addEventListener('scroll',()=>{if(view.name!=='settings'||settingsScrollPending)return;settingsScrollPending=true;requestAnimationFrame(()=>{settingsScrollPending=false;updateSettingsNavFromScroll()})},{passive:true})
    }

    function registerSettingsChoiceEvents(){
    document.addEventListener('click',e=>{const choice=e.target.closest('[data-font-choice]');if(!choice)return;applyDisplayFont(choice.dataset.fontChoice);rerenderSettingsPreserveScroll();showToast(`Выбран шрифт: ${DISPLAY_FONTS[displayFont].name}`)})
    document.addEventListener('click',e=>{const choice=e.target.closest('[data-bonus-color]');if(!choice)return;applyBonusHpStyle(true,choice.dataset.bonusColor);rerenderSettingsPreserveScroll();showToast(`Цвет бонусных хитов: ${ACCENT_THEMES[bonusHpColor].name.toLocaleLowerCase('ru')}`)})
    }

    function registerSettingsToggleEvents(){
    document.addEventListener('change',e=>{if(e.target.id!=='bold-as-section')return;applyBoldSections(e.target.checked);rerenderSettingsPreserveScroll();showToast(e.target.checked?'Жирный текст добавлен в разделы':'Жирный текст исключён из разделов')})
    document.addEventListener('change',e=>{if(e.target.id!=='combat-tracking')return;applyCombatTracking(e.target.checked);rerenderSettingsPreserveScroll();showToast(e.target.checked?'Отслеживание существа включено':'Отслеживание существа выключено')})
    document.addEventListener('change',e=>{if(e.target.id!=='library-sync-tags')return;setLibraryTagSync(e.target.checked);rerenderSettingsPreserveScroll()})
    document.addEventListener('change',e=>{if(e.target.id!=='bestiary-advanced-search')return;applyBestiaryAdvancedSearch(e.target.checked);rerenderSettingsPreserveScroll();showToast(e.target.checked?'Расширенный поиск Бестиария включён':'Расширенный поиск Бестиария выключен')})
    document.addEventListener('change',e=>{if(e.target.id!=='alternative-create')return;applyAlternativeCreate(e.target.checked);rerenderSettingsPreserveScroll();showToast(e.target.checked?'Альтернативное меню создания включено':'Обычное меню создания включено')})
    document.addEventListener('change',e=>{if(e.target.id!=='journal-enabled')return;applyJournalEnabled(e.target.checked);rerenderSettingsPreserveScroll();showToast(e.target.checked?'Журнал включён':'Журнал выключен')})
    document.addEventListener('change',e=>{if(e.target.id!=='journal-search-enabled')return;applyJournalSearch(e.target.checked);rerenderSettingsPreserveScroll();showToast(e.target.checked?'Поиск в Журнале включён':'Поиск в Журнале выключен')})
    document.addEventListener('change',e=>{if(e.target.id!=='journal-sections-enabled')return;applyJournalSections(e.target.checked);rerenderSettingsPreserveScroll();showToast(e.target.checked?'Разделы Журнала включены':'Разделы Журнала выключены')})
    document.addEventListener('change',e=>{if(e.target.id!=='journal-bold-sections')return;applyJournalBoldSections(e.target.checked);rerenderSettingsPreserveScroll();showToast(e.target.checked?'Жирный текст добавлен в разделы Журнала':'Жирный текст исключён из разделов Журнала')})
    document.addEventListener('change',e=>{if(e.target.id!=='bonus-hp-enabled')return;applyBonusHpEnabled(e.target.checked);rerenderSettingsPreserveScroll();showToast(e.target.checked?'Отдельные бонусные хиты включены':'Отдельные бонусные хиты скрыты')})
    document.addEventListener('change',e=>{if(e.target.id!=='bonus-hp-contrast')return;applyBonusHpStyle(e.target.checked,bonusHpColor);rerenderSettingsPreserveScroll();showToast(e.target.checked?'Контрастная окраска бонусных хитов включена':'Бонусные хиты снова голубые')})
    }
