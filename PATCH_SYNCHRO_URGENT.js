# Patch client d’urgence — synchronisation après chaque save
# Fichier cible : game.js
# Remplacer exactement la ligne `function save(markCloud=true){...}` par la version ci-dessous.
# ATTENTION : améliore la rapidité de synchronisation, mais ne garantit PAS à lui seul l’anti-double-récompense entre deux appareils.

let urgentSyncTimer=null;
function save(markCloud=true){if(markCloud){state.localUpdatedAt=Date.now();state.syncRevision=(Number(state.syncRevision)||0)+1;if(state.account)cloudDirty=true}try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){console.warn('Local save failed',e);cloudMessage='Le stockage local est indisponible.'}if(markCloud&&state.account&&sb){if(urgentSyncTimer!==null)clearTimeout(urgentSyncTimer);urgentSyncTimer=setTimeout(()=>{urgentSyncTimer=null;if(cloudDirty&&!cloudBusy)syncCloud(true)},150)} }
