function registerLibraryEvents(){
  document.addEventListener('click',e=>{
    const type=libraryTypeFromView();
    if(e.target.closest('#new-library-item')||e.target.closest('#grid-new-library-item')){if(type)openLibraryItemDialog(type);return}
    const edit=e.target.closest('[data-edit-library-item]');if(edit&&type){openLibraryItemDialog(type,edit.dataset.editLibraryItem);return}
    const duplicate=e.target.closest('[data-duplicate-library-item]');if(duplicate&&type){duplicateLibraryItem(type,duplicate.dataset.duplicateLibraryItem);return}
    const remove=e.target.closest('[data-delete-library-item]');if(remove&&type){deleteLibraryItem(type,remove.dataset.deleteLibraryItem);return}
    const preset=e.target.closest('[data-condition-preset]');if(preset&&type==='conditions'){installConditionPreset(preset.dataset.conditionPreset);return}
    if(e.target.closest('#manage-library-tags')){openTagsDialog('library');return}
    const detailEdit=e.target.closest('[data-edit-library-detail]');if(detailEdit){el('library-detail-dialog').close();openLibraryItemDialog(detailEdit.dataset.libraryDetailType,detailEdit.dataset.editLibraryDetail);return}
    const card=e.target.closest('.library-card[data-open-library-item]');if(card&&!e.target.closest('button,.card-more-menu')&&type)openLibraryItemDetail(type,card.dataset.openLibraryItem)
  });
  document.addEventListener('keydown',e=>{const type=libraryTypeFromView(),card=e.target.closest?.('.library-card[data-open-library-item]');if(type&&card&&e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openLibraryItemDetail(type,card.dataset.openLibraryItem)}});
  document.addEventListener('input',e=>{if(e.target.id!=='library-search')return;const type=libraryTypeFromView();if(!type)return;librarySearch[type]=e.target.value;renderLibraryCards(type)});
  document.addEventListener('change',e=>{
    const type=libraryTypeFromView();if(!type)return;
    if(e.target.id==='library-sort'){librarySort[type]=e.target.value;renderLibraryCards(type);return}
    if(e.target.id==='library-all-tags'){libraryTagFilters[type].clear();renderLibraryTagOptions(type);renderLibraryCards(type);return}
    const tag=e.target.closest('[data-library-tag]');if(tag){tag.checked?libraryTagFilters[type].add(tag.dataset.libraryTag):libraryTagFilters[type].delete(tag.dataset.libraryTag);const all=el('library-all-tags');if(all)all.checked=!libraryTagFilters[type].size;updateLibraryTagSummary(type);renderLibraryCards(type);return}
    if(e.target.closest('#library-item-tag-checks input'))updateLibraryItemTagSummary()
  });
  el('library-item-form').addEventListener('submit',e=>{e.preventDefault();const type=editingLibraryType;if(!type)return;const name=el('library-item-name').value.trim();if(!name)return;const existing=editingLibraryItemId?libraryItemById(type,editingLibraryItemId):null,item={name,description:el('library-item-description').value.trim(),details:el('library-item-details').value.trim(),tagIds:[...el('library-item-tag-checks').querySelectorAll('input:checked')].map(input=>input.value)};if(existing){Object.assign(existing,item);save(libraryMeta(type).changed)}else{libraryItems(type).push({id:makeId(),...item,builtin:false});save(libraryMeta(type).created)}el('library-item-dialog').close();editingLibraryType=null;editingLibraryItemId=null;render()});
}
