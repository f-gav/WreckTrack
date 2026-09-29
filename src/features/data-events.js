    function registerDataFileEvents(){
    document.addEventListener('change',async e=>{if(e.target.id!=='backup-restore-file')return;const file=e.target.files?.[0];e.target.value='';await openFullBackupRestore(file)})
    }
