    function registerBestiaryCreateEvent(){
    document.addEventListener('click',e=>{if(e.target.closest('#grid-new-creature'))openCreatureDialog()})
    }

    function registerBestiaryCardEvents(){
    document.addEventListener('dragstart',e=>{const handle=e.target.closest('[data-tag-drag]');if(!handle)return;draggedTagId=handle.dataset.tagDrag;handle.closest('.tag-editor-row')?.classList.add('dragging');if(e.dataTransfer){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',draggedTagId)}})
    document.addEventListener('dragover',e=>{const row=e.target.closest('[data-tag-row]');if(!row||!draggedTagId||row.dataset.tagRow===draggedTagId)return;e.preventDefault();const list=el('tag-editor-list');list.querySelectorAll('.tag-editor-row').forEach(item=>item.classList.remove('drag-before','drag-after'));const after=e.clientY>row.getBoundingClientRect().top+row.offsetHeight/2;row.classList.add(after?'drag-after':'drag-before');if(e.dataTransfer)e.dataTransfer.dropEffect='move'})
    document.addEventListener('drop',e=>{const row=e.target.closest('[data-tag-row]');if(!row||!draggedTagId)return;e.preventDefault();const sourceId=draggedTagId,after=e.clientY>row.getBoundingClientRect().top+row.offsetHeight/2;draggedTagId=null;if(moveTagDraft(sourceId,row.dataset.tagRow,after))renderTagEditor();else clearTagDragState()})
    document.addEventListener('dragend',()=>{draggedTagId=null;clearTagDragState()})
    document.addEventListener('keydown',e=>{const handle=e.target.closest('[data-tag-drag]');if(!handle||(e.key!=='ArrowUp'&&e.key!=='ArrowDown'))return;e.preventDefault();const id=handle.dataset.tagDrag;if(moveTagDraftBy(id,e.key==='ArrowUp'?-1:1)){renderTagEditor();requestAnimationFrame(()=>document.querySelector(`[data-tag-drag="${CSS.escape(id)}"]`)?.focus())}})
    document.addEventListener('click',e=>{const card=e.target.closest('.bestiary-card[data-open-detail]');if(card&&!e.target.closest('button,.card-more-menu'))openCreatureDetail(card.dataset.openDetail);const edit=e.target.closest('[data-edit-creature]');if(edit&&el('detail-dialog').open)el('detail-dialog').close()})
    document.addEventListener('keydown',e=>{const card=e.target.closest('.bestiary-card[data-open-detail]');if(card&&e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openCreatureDetail(card.dataset.openDetail)}})
    document.addEventListener('click',e=>{const target=e.target.closest('[data-detail-jump]');if(!target)return;const anchor=el(target.dataset.detailJump);if(anchor){anchor.scrollIntoView({behavior:'smooth',block:'start'});target.closest('.detail-toc')?.querySelectorAll('.detail-toc-link').forEach(link=>link.classList.toggle('active',link===target))}})
    }
