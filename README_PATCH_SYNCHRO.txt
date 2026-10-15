PATCH SYNCHRO URGENT — Space Mining Tycoon

Contenu :
- PATCH_SYNCHRO_URGENT.js : ligne de remplacement de la fonction save().
- PATCH_SYNCHRO_URGENT.diff : diff complet applicable à game.js.

Installation : branche admin/test uniquement, appliquez le diff à game.js, déployez, puis testez.

Limite critique : ce patch déclenche une synchro cloud 150 ms après chaque sauvegarde locale. Il réduit la fenêtre de désynchronisation mais n’empêche pas de façon garantie deux appareils de réclamer simultanément une même quête. Pour cela, le serveur Supabase game-sync doit appliquer les achats/récompenses de façon atomique et idempotente. Le ZIP fourni ne contient pas le code de cette fonction serveur, donc je ne peux pas fournir honnêtement un correctif serveur complet à partir de ce seul ZIP.
