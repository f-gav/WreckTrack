    function registerPersistenceNetworkEvents(){
    window.addEventListener('offline',()=>{networkOnline=false;clearTimeout(cloudSaveTimer);if(authSession?.user){if(cloudSyncState==='saving'||cloudSaveQueued)cloudPendingChanges=true;cloudSyncState='offline'}updateCloudStatus()})
    window.addEventListener('online',()=>{networkOnline=true;if(!authSession?.user){updateCloudStatus();return}showToast('Соединение восстановлено — синхронизируем данные');retryCloudSync()})
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden')return;persistLocalState();if(cloudSyncState==='saving')saveCloudNow()})
    window.addEventListener('pagehide',persistLocalState)
    }
