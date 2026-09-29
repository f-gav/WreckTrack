    function registerDetailControlEvents(){
    document.addEventListener('change',e=>{const task=e.target.closest('[data-detail-task-field]');if(!task)return;updateDetailMarkdownControl(task.dataset.detailTaskField,Number(task.dataset.detailLine),null,task.checked)})
    document.addEventListener('click',e=>{const resource=e.target.closest('[data-detail-resource-field]');if(!resource)return;updateDetailMarkdownControl(resource.dataset.detailResourceField,Number(resource.dataset.detailLine),Number(resource.dataset.detailResourceStart))})
    }
