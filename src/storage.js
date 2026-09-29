const KEY='gm-archive-v2',OLD_KEY='gm-archive-v1';
let localMutationVersion=0,localSaveTimer=null,localSavePending=false,localSaveFailed=false;

function loadState(){
      try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&Array.isArray(saved.rooms)&&Array.isArray(saved.bestiary)){const previousVersion=archiveSchemaVersion(saved),normalized=normalize(saved);if(previousVersion!==CURRENT_SCHEMA_VERSION)localStorage.setItem(KEY,JSON.stringify(normalized));return normalized}}catch(_){}
      try{const old=JSON.parse(localStorage.getItem(OLD_KEY));if(old&&Array.isArray(old.rooms)){const bestiary=[],rooms=old.rooms.map(room=>{const creatureIds=[];(room.creatures||[]).forEach(c=>{const id=c.id||makeId();bestiary.push({id,name:c.name||'Без имени',description:'',hp:'',ac:'',characteristics:'',abilities:'',notes:c.notes||''});creatureIds.push(id)});return{id:room.id||makeId(),name:room.name||'Без названия',creatureIds,initiatives:{},combatNotes:{},currentHp:{}}});const migrated=normalize({rooms,bestiary,tags:[]});localStorage.setItem(KEY,JSON.stringify(migrated));return migrated}}catch(_){}
      return normalize({rooms:[],bestiary:[],tags:[]});
    }
function persistLocalState(){clearTimeout(localSaveTimer);localSaveTimer=null;if(!localSavePending)return true;try{localStorage.setItem(KEY,JSON.stringify(state));localSavePending=false;localSaveFailed=false;return true}catch(_){if(!localSaveFailed)showToast('Не хватает памяти браузера для сохранения архива');localSaveFailed=true;return false}}
    function scheduleLocalSave(){localSavePending=true;clearTimeout(localSaveTimer);localSaveTimer=setTimeout(persistLocalState,300)}
    function markLocalMutation(includeArchive=true){localMutationVersion++;if(includeArchive)scheduleLocalSave()}
    function save(message){markLocalMutation();scheduleCloudSave();if(message)showToast(message)}
