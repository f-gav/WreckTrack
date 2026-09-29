    function registerMarkdownPointerEvents(){
document.addEventListener('pointerdown',e=>{if(e.target.closest('[data-markdown-format],[data-journal-format]'))e.preventDefault()})
    }

    function registerJournalOpenEvents(){
    document.addEventListener('click',e=>{if(e.target.closest('#open-journal'))openJournal()})
    }

    function registerJournalFormattingEvents(){
    document.addEventListener('click',e=>{const format=e.target.closest('[data-journal-format]');if(format){const type=format.dataset.journalFormat;if(type==='task'||type==='resource')insertJournalControl(type);else wrapJournalMarkdown(type);return}const search=e.target.closest('[data-journal-search]');if(search){moveJournalSearch(Number(search.dataset.journalSearch));return}const jump=e.target.closest('[data-journal-line-jump]');if(jump){const index=Number(jump.dataset.journalLineJump);journalTocActiveLine=index;activateJournalLine(index);el('journal-live-editor')?.querySelector(`[data-journal-line="${index}"]`)?.scrollIntoView({behavior:'smooth',block:'center'})}})
    document.addEventListener('click',e=>{const button=e.target.closest('[data-markdown-format]');if(!button)return;const area=el(button.closest('[data-markdown-toolbar]')?.dataset.markdownToolbar);if(!area)return;const type=button.dataset.markdownFormat,formats={bold:['**','**','жирный текст'],italic:['*','*','курсив'],strike:['~~','~~','зачёркнутый текст']},format=formats[type];if(format)wrapMarkdown(area,...format);else if(type==='task')toggleMarkdownTask(area);else if(type==='resource')insertMarkdownResource(area)})
    document.addEventListener('keydown',e=>{const area=e.target.closest('textarea[data-markdown]');if(area&&(e.ctrlKey||e.metaKey)){const key=e.key.toLowerCase();if(key==='b'){e.preventDefault();wrapMarkdown(area,'**','**','жирный текст');return}if(key==='i'){e.preventDefault();wrapMarkdown(area,'*','*','курсив');return}if(key==='e'){e.preventDefault();wrapMarkdown(area,'`','`','код');return}if(/^[1-6]$/.test(key)&&!e.shiftKey){e.preventDefault();prefixMarkdownLines(area,'#'.repeat(Number(key))+' ','heading');return}if(e.shiftKey&&e.code==='Digit8'){e.preventDefault();prefixMarkdownLines(area,'- ','list');return}}const card=e.target.closest('.room-card');if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();go('room',card.dataset.openRoom)}})
    }
