const SUPABASE_URL='https://gvyeooqemajnvfbgnagv.supabase.co';
const SUPABASE_KEY='sb_publishable_moYDSTJplgl9XPCiKR96bQ_CPt3MJ7z';
const sb=window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_KEY,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}})||null;

const KEY='space-mining-v2-test';
const CLOUD_SYNC_MS=1000;
const CLOUD_TABLE='player_state';
let cloudBusy=false,cloudRestoreBusy=false,lastCloudSync=0,lastLeaderboard=0,leaderboardBusy=false;
let cloudDirty=false,cloudRetryAt=0,cloudRestoreDone=false,cloudSyncFailures=0;
let cloudMessage='Progression conservée sur cet appareil.',cloudLastError='',authBusy=false,passwordRecoveryMode=false;
const OLD_KEYS=['space-mining-v11','space-mining-v10','space-mining-v9','space-mining-v8','space-mining-v7','space-mining-v6','space-mining-v5','space-mining-v4','space-mining-v3','space-mining-v2'];

const WORLDS=[
 ['🌑','Astéroïde Nova',0,1],['🔴','Mars',1e6,1.6],['🪐','Saturne',5e7,2.4],['💠','Nébuleuse Azur',5e9,3.5],
 ['🌌','Trou noir',1e12,5],['☀️','Étoile Helios',1e14,7.5],['🌀','Dimension X',1e16,11],['🌊','Océan de Nyx',1e18,16],
 ['💎','Géode Prime',1e21,24],['🧊','Crypte d’Oort',1e24,36],['🧿','Singularité Oméga',1e28,55],['✨','Cœur de l’Univers',1e32,85],
 ['🌠','Vespera',5e35,120],['🟣','Nébuleuse Éclipse',2e39,170],['🌟','Quasar Aether',1e43,240],['🔷','Cristallia',5e46,340],
 ['🌋','Forge Stellaire',2e50,480],['🕳️','Abîme Primordial',1e54,680],['🌌','Galaxie Némésis',5e57,950],['🪐','Titania X',2e61,1300],
 ['⚡','Orage Cosmique',1e65,1800],['🌙','Lune Spectrale',5e68,2500],['💫','Puits de Pulsar',2e72,3500],['☄️','Couronne des Comètes',1e76,5000],
 ['🧬','Matrice Cosmique',5e79,7000],['🔱','Royaume des Titans',2e83,10000],['🧿','Œil de l’Éternité',1e87,14000],
 ['♾️','Nexus Infini',5e90,20000],['🪩','Mégasphère',2e94,28000],['🛸','Frontière Omniverselle',1e98,40000],
 ['🌌','Mer des Univers',5e101,56000],['✨','Trône de la Création',1e105,80000]
];

const MINE_ACCENTS=[[99,199,255],[255,112,84],[230,190,112],[81,213,255],[174,125,255],[255,196,79],[159,126,255],[71,191,217],[107,230,219],[158,205,246],[218,119,255],[123,174,255],[255,137,102],[167,112,231],[255,218,108],[120,184,255],[255,111,66],[149,137,202],[111,151,255],[130,199,255],[99,221,255],[183,204,255],[255,132,201],[179,236,255],[105,223,185],[187,169,255],[255,156,103],[128,255,220],[255,151,217],[145,201,255],[97,204,242],[255,224,145]];
// États persistants des accordéons : le rendu automatique toutes les 250 ms
// recrée les panneaux, donc leur état ne doit pas dépendre uniquement du DOM.
const openTechAccordions = new Set();
const openMissionAccordions = new Set();
const openHalloweenAccordions = new Set();

let renderedMineWorld=-1;
function updateMinePlanetTheme(){if(renderedMineWorld===selectedWorld)return;renderedMineWorld=selectedWorld;const rgb=MINE_ACCENTS[selectedWorld]||MINE_ACCENTS[0],button=document.getElementById('mineBtn'),planet=document.getElementById('planetHero');if(button){button.style.setProperty('--mine-rgb',rgb.join(','));button.dataset.world=String(selectedWorld);button.setAttribute('aria-label','Extraire des crédits sur '+WORLDS[selectedWorld][1])}if(planet)planet.textContent=WORLDS[selectedWorld][0]}

const BUILDING_ROLES=[
 ['extracteur','Extracteur','⛏️'],['mineur','Mineur','🤖'],['raffinerie','Raffinerie','🏭'],['station','Station','🛰️'],
 ['cargo','Flotte cargo','🚚'],['gravite','Extracteur gravitationnel','🧲'],['energie','Collecteur énergétique','☀️'],['portail','Portail quantique','🌀'],
 ['forge','Forge avancée','⚛️'],['anneau','Anneau de singularité','💫'],['matiere','Usine de matière noire','🌑'],['noyau','Noyau d’assemblage','🔮']
];
const GALAXIES=[
 {name:'Voie stellaire',icon:'🌌',theme:'stellar',description:'La galaxie originelle, berceau de la colonisation.',unlock:0,scale:1},
 {name:'Nébuleuse ardente',icon:'🔥',theme:'inferno',description:'Une galaxie brûlante alimentée par le plasma et les étoiles mourantes.',unlock:1,scale:1e50},
 {name:'Dimension abyssale',icon:'🕳️',theme:'abyss',description:'Une dimension instable où la matière et le temps se déforment.',unlock:2,scale:1e100}
];
const EXTRA_WORLDS=[
 [['🔥','Fournaise d’Ignis'],['🌋','Caldeira Rouge'],['🧡','Cendre d’Or'],['☀️','Couronne Incandescente'],['🪨','Basalte Vivant'],['🌞','Héliosphère'],['🩸','Mer de Magma'],['💥','Nova Carmine'],['🔶','Prisme Solaire'],['🌡️','Noyau Brûlant'],['🌟','Géante Rubis'],['🔥','Forge des Anciens'],['🟠','Dune Pyrique'],['🌋','Volcan Éternel'],['☄️','Comète de Braise'],['🧨','Cratère Royal'],['🟡','Soleil Fracturé'],['🧱','Monolithe de Scorie'],['💫','Pulsar Vermillon'],['🌠','Pluie de Cendres'],['🛡️','Bouclier Solaire'],['🟤','Planète de Cuivre'],['🔴','Sang Stellaire'],['🪐','Anneau de Feu'],['🧿','Œil de Rubis'],['🌅','Aube Infernale'],['🟧','Citadelle Ambrée'],['🌋','Trône Magmatique'],['⚡','Orage de Plasma'],['🌞','Cœur de Fournaise'],['🔥','Flamme Primordiale'],['👑','Imperium Ignis']],
 [['🕳️','Puits du Néant'],['🟣','Voile Spectral'],['🧬','Matrice Instable'],['🌀','Faille d’Inversion'],['👁️','Œil Paradoxal'],['🌑','Éclipse Absolue'],['🟢','Marais Quantique'],['💠','Cristal d’Antimatière'],['🪞','Miroir du Temps'],['🧿','Sanctuaire du Vide'],['🌌','Mer d’Ombres'],['♾️','Boucle Éternelle'],['⚫','Singularité Noire'],['🪐','Monde à l’Envers'],['🔮','Orbe Inconnu'],['🧪','Laboratoire du Chaos'],['🌫️','Brume Vivante'],['💜','Nébuleuse Fantôme'],['🧊','Glace Temporelle'],['🦠','Essaim Cosmique'],['🧿','Prison des Dieux'],['🌠','Cicatrice Stellaire'],['🪬','Temple Paradoxal'],['🌀','Spirale Infinie'],['⚛️','Atome Universel'],['🕸️','Réseau Dimensionnel'],['🌒','Lune de l’Oubli'],['🔻','Obélisque du Chaos'],['🌌','Frontière du Réel'],['💀','Tombe des Étoiles'],['♾️','Abîme Sans Fin'],['👁️','Origine du Tout']]
];
const GALAXY_BUILDINGS=[
 BUILDING_ROLES,
 [['extracteur','Condenseur de plasma','🔥'],['mineur','Foreuse de magma','🌋'],['raffinerie','Fonderie solaire','☀️'],['station','Observatoire coronale','🔭'],['cargo','Convoi de braises','🚀'],['gravite','Ancre gravitationnelle','🧲'],['energie','Convertisseur thermique','🌡️'],['portail','Passage pyrique','🌀'],['forge','Forge d’étoile','⚒️'],['anneau','Couronne de fusion','💍'],['matiere','Cristalliseur rubis','🔶'],['noyau','Cœur ignitique','❤️‍🔥']],
 [['extracteur','Moissonneur de vide','🕳️'],['mineur','Sonde paradoxale','🧿'],['raffinerie','Tisseur de matière','🧬'],['station','Archive temporelle','⌛'],['cargo','Arche dimensionnelle','🚪'],['gravite','Puits de singularité','⚫'],['energie','Réacteur d’antimatière','💠'],['portail','Passerelle fractale','🌀'],['forge','Forge de causalité','⚛️'],['anneau','Anneau d’éternité','♾️'],['matiere','Incubateur d’ombre','🌑'],['noyau','Moteur d’univers','🌌']]
];
for(let g=1;g<3;g++)EXTRA_WORLDS[g-1].forEach((p,i)=>WORLDS.push([p[0],p[1],WORLDS[g*32-1][2]*Math.pow(1e50,g),WORLDS[i][3]*Math.pow(10,g)]));



// Halloween limited-time event: available through November 1, 2026 (French local time).
const HALLOWEEN_END = Date.parse('2026-11-02T00:00:00+01:00');
const HALLOWEEN_PLANETS = [
 {icon:'🎃',name:'Citrouille Nova',desc:'Un monde orange baigné de brume',scale:1.0,buildings:[['🍬','Confiserie lunaire',1,2],['🕯️','Mine à citrouilles',1,6],['🧙','Atelier de sorcière',1,16],['🕸️','Tisseur de sucre',1,42]]},
 {icon:'👻',name:'Brume des Fantômes',desc:'Des spectres récoltent des bonbons',scale:1.8,buildings:[['👻','Récolteur spectral',1,5],['🪦','Cimetière gourmand',1,12],['🦇','Nid de chauves-souris',1,32],['🔮','Cristalliseur d’ectoplasme',1,84]]},
 {icon:'🕷️',name:'Toile d’Obsidienne',desc:'Des araignées tissent du sucre noir',scale:3.2,buildings:[['🕷️','Tisseur arachnide',1,10],['🕸️','Filature de caramel',1,24],['🪲','Élevage de scarabées',1,64],['🕯️','Lanterne ensorcelée',1,170]]},
 {icon:'🧛',name:'Château de Minuit',desc:'Les vampires gardent les réserves',scale:5.5,buildings:[['🦇','Domaine des vampires',1,19],['🧛','Comptoir sanguisucre',1,48],['⚰️','Coffre funéraire',1,128],['🌙','Four lunaire',1,340]]},
 {icon:'🧪',name:'Marais des Potions',desc:'Des élixirs transforment les friandises',scale:9,buildings:[['🧪','Distillerie de potions',1,36],['🍭','Cuve de sucettes',1,92],['🐸','Laboratoire des crapauds',1,240],['☠️','Réacteur toxique',1,640]]},
 {icon:'💀',name:'Catacombes Sucrées',desc:'Une ancienne civilisation de bonbons',scale:15,buildings:[['💀','Mine de sucre fossile',1,70],['🦴','Broyeur d’os en sucre',1,180],['⚱️','Crypte confiserie',1,480],['🪬','Totem maudit',1,1300]]},
 {icon:'🧟',name:'Jardin des Revenants',desc:'Des cultures étranges poussent dans la nuit',scale:25,buildings:[['🧟','Ferme des revenants',1,140],['🌱','Serre citrouille',1,360],['🪴','Jardin carnivore',1,1000],['🧬','Mutateur de friandises',1,2700]]},
 {icon:'🐈‍⬛',name:'Lune des Sorcières',desc:'Des familiers gardent les chaudrons',scale:42,buildings:[['🐈‍⬛','Sanctuaire des familiers',1,280],['🧹','Usine de balais',1,760],['🧙','Académie occulte',1,2100],['🌑','Collecteur d’ombre',1,5600]]},
 {icon:'🔥',name:'Fournaise des Bonbons',desc:'Une étoile forge des friandises explosives',scale:70,buildings:[['🔥','Four à caramel',1,600],['💣','Fonderie de bonbons',1,1600],['🌋','Volcan de chocolat',1,4400],['⚡','Convertisseur d’énergie sucrée',1,12000]]},
 {icon:'👑',name:'Trône du Cauchemar',desc:'Le cœur de la galaxie d’Halloween',scale:120,buildings:[['👑','Palais du Roi Citrouille',1,1500],['🐉','Dragon confiseur',1,4000],['🌀','Portail des friandises',1,11000],['🌌','Noyau du cauchemar',1,30000]]}
];
const HALLOWEEN_BOOSTS = {
 candy10:{name:'Étincelle sucrée',icon:'🍭',desc:'+10 % de production pendant 15 min',cost:100000,duration:900000,mult:1.1},
 candy15:{name:'Aura de citrouille',icon:'🎃',desc:'+15 % de production pendant 30 min',cost:350000,duration:1800000,mult:1.15},
 candyClick2:{name:'Doigts de gobelin',icon:'👹',desc:'Puissance de clic ×2 pendant 20 min',cost:700000,duration:1200000,clickMult:2},
 candy25:{name:'Bénédiction lunaire',icon:'🌕',desc:'+25 % de production pendant 45 min',cost:1200000,duration:2700000,mult:1.25},
 candyClick3:{name:'Main fantomatique',icon:'🖐️',desc:'Puissance de clic ×3 pendant 30 min',cost:2400000,duration:1800000,clickMult:3},
 candy50:{name:'Fournaise hantée',icon:'🔥',desc:'+50 % de production pendant 1 h',cost:4500000,duration:3600000,mult:1.5},
 candy2:{name:'Énergie spectrale',icon:'👻',desc:'Production de crédits ×2 pendant 30 min',cost:8000000,duration:1800000,mult:2},
 candyClick5:{name:'Griffe du vampire',icon:'🧛',desc:'Puissance de clic ×5 pendant 30 min',cost:13000000,duration:1800000,clickMult:5},
 candy75:{name:'Rituel du chaudron',icon:'🧪',desc:'+75 % de production pendant 1 h',cost:20000000,duration:3600000,mult:1.75},
 candy3:{name:'Pacte des ombres',icon:'🌑',desc:'Production de crédits ×3 pendant 30 min',cost:30000000,duration:1800000,mult:3},
 candyClick8:{name:'Poing du monstre',icon:'👊',desc:'Puissance de clic ×8 pendant 30 min',cost:45000000,duration:1800000,clickMult:8},
 candy4:{name:'Tempête d’ectoplasme',icon:'🌀',desc:'Production de crédits ×4 pendant 30 min',cost:65000000,duration:1800000,mult:4},
 candy100:{name:'Pleine lune',icon:'🌕',desc:'+100 % de production pendant 2 h',cost:90000000,duration:7200000,mult:2},
 candyClick10:{name:'Force du cavalier sans tête',icon:'🐎',desc:'Puissance de clic ×10 pendant 1 h',cost:125000000,duration:3600000,clickMult:10},
 candy5:{name:'Rush sucré',icon:'🍬',desc:'Production de crédits ×5 pendant 1 h',cost:175000000,duration:3600000,mult:5},
 candy150:{name:'Couronne des sorcières',icon:'👑',desc:'+150 % de production pendant 1 h',cost:250000000,duration:3600000,mult:2.5},
 candy6:{name:'Réacteur maudit',icon:'☠️',desc:'Production de crédits ×6 pendant 45 min',cost:350000000,duration:2700000,mult:6},
 candyClick15:{name:'Fureur du démon',icon:'😈',desc:'Puissance de clic ×15 pendant 45 min',cost:500000000,duration:2700000,clickMult:15},
 candy8:{name:'Singularité d’Halloween',icon:'🕳️',desc:'Production de crédits ×8 pendant 30 min',cost:750000000,duration:1800000,mult:8},
 candy10x:{name:'Apocalypse sucrée',icon:'💥',desc:'Production de crédits ×10 pendant 20 min',cost:1200000000,duration:1200000,mult:10}
};
const HALLOWEEN_MISSIONS = [
 {id:'candies100',name:'Réserve de friandises',desc:'Gagner des bonbons aujourd’hui',goal:100,reward:100,kind:'dailyCandies'},
 {id:'candies1k',name:'Sac bien rempli',desc:'Gagner davantage de bonbons aujourd’hui',goal:1000,reward:500,kind:'dailyCandies'},
 {id:'candies10k',name:'La chasse aux bonbons',desc:'Atteindre un gros quota quotidien',goal:10000,reward:2500,kind:'dailyCandies'},
 {id:'candies100k',name:'Trick or treat légendaire',desc:'Atteindre le quota quotidien ultime',goal:100000,reward:12000,kind:'dailyCandies'},
 {id:'buildings4',name:'Première confiserie',desc:'Acheter des bâtiments aujourd’hui',goal:4,reward:300,kind:'dailyBuildings'},
 {id:'buildings20',name:'Usine hantée',desc:'Acheter beaucoup de bâtiments aujourd’hui',goal:20,reward:3000,kind:'dailyBuildings'},
 {id:'planet3',name:'Explorer les brumes',desc:'Débloquer la planète 3',goal:3,reward:1500,kind:'planet'},
 {id:'planet6',name:'Au cœur des ténèbres',desc:'Débloquer la planète 6',goal:6,reward:10000,kind:'planet'},
 {id:'planet10',name:'Seigneur d’Halloween',desc:'Débloquer les 10 planètes',goal:10,reward:100000,kind:'planet'},
 {id:'boost1',name:'Marché noir magique',desc:'Acheter un maléfice aujourd’hui',goal:1,reward:250,kind:'dailyBoosts'}
];
function halloweenActive(){return Date.now()<HALLOWEEN_END;}
function halloweenEnsure(){
 if(!state.halloween||typeof state.halloween!=='object')state.halloween={};
 const h=state.halloween;
 h.candies=Math.max(0,Number(h.candies)||0);
 h.totalCandiesEarned=Math.max(Number(h.candies)||0,Number(h.totalCandiesEarned)||0);
 h.candiesClicked=Math.max(0,Number(h.candiesClicked)||0);
 h.buildingsPurchased=Math.max(0,Number(h.buildingsPurchased)||0);
 h.boostPurchases=Math.max(0,Number(h.boostPurchases)||0);
 h.dailyKey=typeof h.dailyKey==='string'?h.dailyKey:dateKey();
 if(h.dailyKey!==dateKey()){h.dailyKey=dateKey();h.claimedMissions=[];h.dailyCandiesStart=Number(h.totalCandiesEarned)||0;h.dailyBuildingsStart=Number(h.buildingsPurchased)||0;h.dailyBoostsStart=Number(h.boostPurchases)||0;}
 if(h.dailyCandiesStart===undefined)h.dailyCandiesStart=Number(h.totalCandiesEarned)||0;
 if(h.dailyBuildingsStart===undefined)h.dailyBuildingsStart=Number(h.buildingsPurchased)||0;
 if(h.dailyBoostsStart===undefined)h.dailyBoostsStart=Number(h.boostPurchases)||0;
 h.claimedMissions=Array.isArray(h.claimedMissions)?h.claimedMissions:[];
 h.missionLevels=h.missionLevels&&typeof h.missionLevels==='object'?h.missionLevels:{};
 h.selected=!!h.selected;
 h.planet=Math.max(0,Math.min(9,Math.floor(Number(h.planet)||0)));
 h.buildings=h.buildings&&typeof h.buildings==='object'?h.buildings:{};
 h.boosts=h.boosts&&typeof h.boosts==='object'?h.boosts:{};
 for(let p=0;p<10;p++)for(let b=0;b<4;b++){const k=p+'-'+b;h.buildings[k]=Math.max(0,Math.floor(Number(h.buildings[k])||0));}
 for(const [id,boost] of Object.entries(h.boosts)){if(!boost||typeof boost!=='object')delete h.boosts[id];}
}
function halloweenPlanetUnlocked(p){if(p<=0)return true;return HALLOWEEN_PLANETS[p-1].buildings.every((_,i)=>(state.halloween?.buildings?.[(p-1)+'-'+i]||0)>=1)}
function halloweenPlanetProgress(p){return HALLOWEEN_PLANETS[p].buildings.reduce((n,_,i)=>n+((state.halloween?.buildings?.[p+'-'+i]||0)>0?1:0),0)}
function halloweenMissionLevel(m){return Math.max(1,Math.floor(Number(state.halloween?.missionLevels?.[m.id])||1))}
function halloweenMissionGoal(m){return Math.ceil(m.goal*Math.pow(1.8,halloweenMissionLevel(m)-1))}
function halloweenMissionReward(m){return Math.ceil(m.reward*Math.pow(1.45,halloweenMissionLevel(m)-1))}
function halloweenMissionValue(m){const h=state.halloween;switch(m.kind){case'dailyCandies':return Math.max(0,(h.totalCandiesEarned||0)-(h.dailyCandiesStart||0));case'dailyBuildings':return Math.max(0,(h.buildingsPurchased||0)-(h.dailyBuildingsStart||0));case'dailyBoosts':return Math.max(0,(h.boostPurchases||0)-(h.dailyBoostsStart||0));case'planet':return HALLOWEEN_PLANETS.filter((_,i)=>halloweenPlanetUnlocked(i)).length;default:return 0}}
function halloweenRate(){
 if(!halloweenActive())return 0;
 halloweenEnsure();
 let rate=0;
 HALLOWEEN_PLANETS.forEach((planet,p)=>planet.buildings.forEach((b,i)=>{rate+=(state.halloween.buildings[p+'-'+i]||0)*b[3]*planet.scale;}));
 return rate;
}
function halloweenBoostMult(kind='prod'){
 if(!state.halloween?.boosts)return 1;
 const now=Date.now();let m=1;
 for(const [id,entry] of Object.entries(state.halloween.boosts)){
  const def=HALLOWEEN_BOOSTS[id];if(!def||Number(entry.until)<=now)continue;
  if(kind==='click'&&def.clickMult)m*=def.clickMult;
  else if(kind==='prod'&&def.mult)m*=def.mult;
 }
 return m;
}
function halloweenBuyBuilding(index){
 if(!halloweenActive())return;
 halloweenEnsure();const p=state.halloween.planet,b=HALLOWEEN_PLANETS[p].buildings[index];if(!halloweenPlanetUnlocked(p)){toast('Planète verrouillée : construis les 4 bâtiments de la planète précédente.');return;}if(!b)return;
 const key=p+'-'+index,level=state.halloween.buildings[key]||0;
 const cost=Math.ceil(b[3]*1200*Math.pow(2.65,level)*Math.pow(3.8,p));
 if(state.halloween.candies<cost){toast('Pas assez de bonbons !');return;}
 state.halloween.candies-=cost;state.halloween.buildings[key]=level+1;state.halloween.buildingsPurchased++;save();render();toast(b[1]+' amélioré !');
}
function halloweenBuyBoost(id){
 if(!halloweenActive())return;
 halloweenEnsure();const def=HALLOWEEN_BOOSTS[id];if(!def)return;
 const now=Date.now(),existing=state.halloween.boosts[id],until=Math.max(now,Number(existing?.until)||0);
 if(state.halloween.candies<def.cost){toast('Pas assez de bonbons !');return;}
 state.halloween.candies-=def.cost;
 state.halloween.boostPurchases++;
 state.halloween.boosts[id]={until:until+def.duration};
 save();render();toast(def.name+' activé !');
}
function renderHalloween(){
 const root=document.getElementById('halloweenEventRoot');if(!root)return;
 const active=halloweenActive();root.hidden=!active;
 if(!active){document.body.classList.remove('halloween-season','halloween-view','halloween-selected');return;}
 document.body.classList.add('halloween-season');
 const h=state.halloween;halloweenEnsure();
 root.innerHTML=`<button class="halloween-galaxy-card ${h.selected?'selected':''}" data-halloween-enter><span class="halloween-card-art">🎃</span><span class="halloween-card-copy"><strong>GALAXIE D’HALLOWEEN</strong><small>ÉVÉNEMENT LIMITÉ · 10 PLANÈTES · BONBONS & MALÉFICES</small><em>${h.selected?'Galaxie sélectionnée · Ouvre ta colonie hantée':'Explore la galaxie avant le 1er novembre !'}</em></span><span class="halloween-card-action">${h.selected?'ALLER À LA COLONIE ↗':'EXPLORER ↗'}</span></button>`;
 document.body.classList.toggle('halloween-selected',!!h.selected);
}
function renderHalloweenColony(){
 const root=document.getElementById('buildingList');if(!root)return;
 if(!halloweenActive()){root.innerHTML='<div class="panel"><b>ÉVÉNEMENT TERMINÉ</b><p class="hint">La galaxie d’Halloween est disponible jusqu’au 1er novembre 2026 inclus.</p><button class="secondary" data-halloween-exit>Retour à la colonie normale</button></div>';return;}
 halloweenEnsure();const h=state.halloween,p=h.planet,planet=HALLOWEEN_PLANETS[p];
 const planets=HALLOWEEN_PLANETS.map((x,i)=>{const unlocked=halloweenPlanetUnlocked(i),built=halloweenPlanetProgress(i);return `<button class="halloween-planet ${i===p?'active':''} ${unlocked?'':'locked'}" data-halloween-planet="${i}" ${unlocked?'':'disabled'}><span>${unlocked?x.icon:'🔒'}</span><b>${String(i+1).padStart(2,'0')} · ${x.name}</b><small>${unlocked?`Bâtiments ${built}/4 · ×${x.scale}`:'Construis les 4 bâtiments précédents'}</small></button>`}).join('');
 const buildings=planet.buildings.map((b,i)=>{const level=h.buildings[p+'-'+i]||0,cost=Math.ceil(b[3]*1200*Math.pow(2.65,level)*Math.pow(3.8,p)),rate=b[3]*planet.scale*Math.pow(1.72,level);return `<article class="halloween-building"><span class="hb-icon">${b[0]}</span><div class="hb-info"><b>${b[1]}</b><small>Niveau ${level} · +${fmt(rate)} bonbons/s</small><em>Coût : 🍬 ${fmt(cost)}</em></div><button data-hallow-buy="${i}" ${!halloweenPlanetUnlocked(p)||h.candies<cost?'disabled':''}>AMÉLIORER</button></article>`}).join('');
 const boosts=Object.entries(HALLOWEEN_BOOSTS).map(([id,b])=>{const left=Math.max(0,Number(h.boosts[id]?.until||0)-Date.now());return `<article class="halloween-boost"><span>${b.icon}</span><div><b>${b.name}</b><small>${b.desc}</small>${left?`<em>Actif · ${Math.ceil(left/60000)} min restantes</em>`:''}</div><button data-hallow-boost="${id}" ${h.candies<b.cost?'disabled':''}>🍬 ${fmt(b.cost)}</button></article>`}).join('');

 root.innerHTML=`<div class="halloween-colony-banner"><div><small>ÉVÉNEMENT TEMPORAIRE · JUSQU’AU 1ER NOVEMBRE</small><h3>🎃 Colonie d’Halloween</h3><p>Construis les 4 bâtiments de chaque planète pour débloquer la suivante. Les bonbons servent uniquement à l’événement et aux maléfices.</p></div><button class="secondary" data-halloween-exit>RETOUR AUX GALAXIES</button></div><div class="halloween-event-head"><div><small>PLANÈTE ACTIVE</small><h3>${planet.icon} ${planet.name}</h3><p>${planet.desc}</p></div><div class="halloween-candy-wallet"><span>🍬</span><b>${fmt(h.candies)}</b><small>+${fmt(halloweenRate())}/s</small></div></div><div class="halloween-planet-grid">${planets}</div><div class="halloween-layout"><section class="halloween-panel"><div class="halloween-section-title"><span>${planet.icon}</span><div><h3>Bâtiments hantés</h3><p>Chaque type de bâtiment doit être construit une fois pour débloquer la planète suivante.</p></div></div><div class="halloween-building-list">${buildings}</div><details id="halloween-boost-shop" class="halloween-accordion" ${openHalloweenAccordions.has('halloween-boost-shop')?'open':''}><summary>🧪 Boutique des maléfices <span>20 boosts · prix croissants</span><b>⌄</b></summary><div class="halloween-accordion-content">${boosts}</div></details></section></div>`;
}
function halloweenClickCandy(){if(!halloweenActive()||!state.halloween?.selected)return;halloweenEnsure();state.halloween.candies+=1;state.halloween.totalCandiesEarned+=1;state.halloween.candiesClicked++;save();render();toast('🍬 +1 bonbon !');}
function claimHalloweenMission(id){halloweenEnsure();const m=HALLOWEEN_MISSIONS.find(x=>x.id===id),h=state.halloween;if(!m||h.claimedMissions.includes(id)||halloweenMissionValue(m)<halloweenMissionGoal(m))return;const reward=halloweenMissionReward(m),repeatable=m.kind.startsWith('daily');h.claimedMissions.push(id);h.candies+=reward;h.totalCandiesEarned+=reward;if(repeatable)h.missionLevels[id]=halloweenMissionLevel(m)+1;save();render();toast('🎃 Mission terminée : +'+fmt(reward)+' bonbons');}
function halloweenTick(){
 if(!halloweenActive())return;
 halloweenEnsure();const gain=halloweenRate()/4;
 if(gain>0){state.halloween.candies+=gain;state.halloween.totalCandiesEarned+=gain;}
}

const PLANET_THEMES=[
 'Nova','Martienne','Saturnienne','Azur','Singulière','Hélios','Dimensionnelle','Néxienne','Cristalline','Oortienne','Oméga','Universelle',
 'Vesperienne','Éclipse','Aethérienne','Cristallienne','Stellaire','Primordiale','Némésienne','Titanienne','Orageuse','Spectrale','Pulsar','Cométaire',
 'Cosmique','Titanique','Éternelle','Infinie','Mégasphérique','Omniverselle','Universale','Créatrice'
];
const PLANET_PREFIX=[
 'de surface','de forage','orbitale','de collecte','abyssale','solaire','dimensionnelle','océanique','cristalline','du nuage','singulière','universelle',
 'de phase','d’éclipse','de quasar','de prisme','thermonucléaire','du néant','galactique','titanesque','ionique','lunaire','pulsar','cométaire',
 'matricielle','titanique','éternelle','infinie','mégastructurée','omniverselle','intergalactique','de création'
];
const ROLE_WORDS=['Extracteur','Unité minière','Raffinerie','Base orbitale','Convoi','Ancre gravitationnelle','Collecteur','Passerelle quantique','Forge','Anneau','Usine de matière noire','Noyau'];
const PLANET_BUILDING_FAMILIES=[
 ['Récupérateur','Foreuse','Raffinerie','Station','Vaisseau','Ancre','Collecteur','Portail','Forge','Anneau','Synthétiseur','Réacteur'],
 ['Mineur','Excavateur','Purificateur','Dôme','Transporteur','Stabilisateur','Extracteur','Relais','Fonderie','Couronne','Convertisseur','Cœur'],
 ['Dragueur','Perceur','Cristalliseur','Citadelle','Croiseur','Puits','Moissonneur','Passerelle','Atelier','Halo','Distillateur','Noyau'],
 ['Sonde','Laser','Condensateur','Habitat','Flotte','Balise','Récolteur','Vortex','Imprimante','Orbiteur','Transmuteur','Générateur'],
 ['Foreuse','Découpeur','Séparateur','Avant-poste','Cargo','Pylône','Pompe','Téléporteur','Creuset','Satellite','Alchimiseur','Singularité'],
 ['Prospecteur','Fracasseur','Catalyseur','Forteresse','Intercepteur','Pilier','Aspireur','Conduit','Fondeur','Couronne','Réplicateur','Moteur'],
 ['Extracteur','Tunnelier','Liquéfacteur','Colonie','Navette','Monolithe','Capteur','Rift','Fabrique','Sphère','Transformateur','Réacteur'],
 ['Récolteur','Foreuse quantique','Épurateur','Complexe','Arche','Totem','Pompe gravitationnelle','Pont stellaire','Forge quantique','Anneau','Usine','Nexus']
];
const PLANET_BUILDING_MODIFIERS=['prismatique','volcanique','cryogénique','spectral','quantique','abyssal','ionique','cristallin'];
function buildingSet(w){
 const local=w%32, world=WORLDS[w], family=PLANET_BUILDING_FAMILIES[Math.floor(local/4)%PLANET_BUILDING_FAMILIES.length];
 const modifier=PLANET_BUILDING_MODIFIERS[Math.floor(local/4)%PLANET_BUILDING_MODIFIERS.length];
 return BUILDING_ROLES.map((r,b)=>{
   const noun=family[(b+local)%family.length];
   const label=`${noun} ${modifier} de ${world[1]}`;
   const icon=(GALAXY_BUILDINGS[Math.floor(w/32)]||GALAXY_BUILDINGS[0])[b]?.[2]||r[2];
   return [label,icon];
 });
}

const BRANCHES={
 extraction:[['laser','Laser industriel',5e6,'+50% puissance de clic'],['plasma','Foreuses plasma',2e8,'+80% puissance de clic'],['abyss','Forage abyssal',5e11,'x2 clic'],['stellar','Extraction stellaire',5e15,'x3 clic'],['voidmine','Mine du Vide',5e21,'x5 clic'],['overdrive','Surcharge d’extraction',5e55,'x10 puissance de clic']],
 automation:[['ai','IA autonome',2.5e8,'+40% production'],['robots','Essaim robotique',1e10,'+80% production'],['nano','Nanobots industriels',2e13,'+120% production'],['quantum','Calcul quantique',1e18,'x3 production'],['dyson','Réseau Dyson',2e25,'x6 production'],['singularityAI','IA de singularité',5e58,'x10 production automatique']],
 energy:[['reactor','Réacteur quantique',2e10,'x1,6 production globale'],['fusion','Fusion contrôlée',2e15,'x2 production globale'],['antimatter','Réacteur antimatière',5e22,'x2,5 production globale'],['singularity','Moteur de singularité',1e28,'x3 production globale'],['deep','Conduit du Vide',5e46,'x6 production globale'],['zeroPoint','Réacteur à énergie zéro',1e60,'x10 production globale']],
 economy:[['logistics','Logistique zéro-g',2e11,'-8% coûts bâtiments'],['market','Marché galactique',2e18,'+20% revenus'],['fractal','Économie fractale',1e31,'-15% coûts'],['trade','Réseau commercial',5e36,'-20% coûts'],['galaxy','Marché galactique',1e45,'+50% revenus'],['matterFabric','Économie de matière noire',1e58,'−30% coût des bâtiments']],
 exploration:[['survey','Cartographie orbitale',1e7,'-10% seuils de planète'],['colonies','Colonies avancées',1e12,'+25% bonus planétaire'],['wormholes','Routes par trous de ver',1e22,'+50% exploration'],['dimensions','Navigation dimensionnelle',1e35,'accès aux secteurs avancés'],['ascension','Architecture d’ascension',5e49,'+50% bonus de prestige'],['multiverse','Cartographie du multivers',1e62,'+50% bonus planétaire']]
};
const BRANCH_ORDER=Object.keys(BRANCHES);
const DAILY_REWARDS=[5e7,1e8,5e8,1e9];
const DAILY_TEMPLATES=[
 [['click','Forage régulier',250],['build','Petit chantier',15],['earn','Production du jour',2.5e8],['spend','Investissement',1e9]],
 [['click','Forage soutenu',500],['build','Constructeur',30],['earn','Mineur acharné',1e9],['spend','Dépenses industrielles',5e9]],
 [['click','Marathon minier',900],['build','Expansion',60],['earn','Gros rendement',1e10],['spend','Empire industriel',5e10]],
 [['click','Frénésie cosmique',1500],['build','Cent structures',100],['earn','Milliardaire du jour',1e11],['spend','Investisseur galactique',5e11]]
];
const CAMPAIGN=[
 ['first','Premier forage','click',1,250],['collector','Petit capital','lifetime',1e6,2500],['factory','Première usine','build',10,10000],['operator','Opérateur industriel','build',100,75000],
 ['millionaire','Millionnaire','lifetime',1e9,5e5],['billionaire','Milliardaire','lifetime',1e12,2.5e7],['researcher','Chercheur','tech',5,2.5e8],['veteran','Vétéran','level',25,5e8],
 ['tycoon','Magnat galactique','lifetime',1e16,5e9],['legend','Légende','prestige',5,2.5e10],['empire','Empire spatial','build',1000,1e11],
 ['explorer','Premier saut','world',3,5e8],['pionnier','Pionnier galactique','world',8,2e10],['architect','Architecte cosmique','build',2500,5e12],['scientist','Maître scientifique','tech',15,1e13],
 ['veteran2','Amiral minier','world',16,1e15],['creator','Maître des secteurs','world',24,1e20],['omniverse','Frontière omniverselle','world',32,1e30],['industrial','Machine industrielle','build',10000,1e25],['ascendant','Ascendant','prestige',10,1e30]
];
const WEEKLY=[
 ['week_click','Frénésie de forage','click',2500,1e6],['week_build','Semaine industrielle','build',75,5e6],['week_earn','Mineur acharné','run',1e11,2.5e7],['week_spend','Investisseur','spend',1e12,1e8],
 ['week_world','Explorateur','world',5,5e8],['week_tech','Laboratoire galactique','tech',5,2.5e9],['week_build2','Grand chantier','build',500,1e10],['week_earn2','Production massive','run',1e15,5e10]
];


/* V3.4 : progression relative à chaque niveau, persistée dans la sauvegarde. */
const QUESTS=[
 ['credits','Capitaine du crédit','Gagner des crédits','lifetime',1000000,2.2],
 ['clicker','Forage intensif','Effectuer des extractions','click',100,1.8],
 ['builder','Architecte orbital','Construire des bâtiments','build',10,2.0],
 ['producer','Chaîne de production','Atteindre une production / s','rate',1000,2.4],
 ['explorer','Cartographe','Débloquer des secteurs','world',2,3.0],
 ['researcher','Scientifique de bord','Débloquer des technologies','tech',2,2.6],
 ['investor','Investisseur','Dépenser des crédits','spend',1000000,2.3],
 ['planet','Maître de colonie','Construire sur la planète active','planetbuild',10,2.1]
];
function normalizedQuestLevel(slot){const savedLevel=Math.max(1,Math.floor(Number(slot?.level)||1));const claimed=Math.max(0,Math.floor(Number(slot?.completed)||0));return Math.min(100000,Math.max(savedLevel,claimed+1))}
function questLevel(id){return normalizedQuestLevel(state.quests?.[id])}
function questNeed(q,lv=questLevel(q[0])){
 return Math.min(Number.MAX_VALUE,Math.max(1,Math.ceil(q[4]*Math.pow(q[5],lv-1))));
}
function questReward(q,lv=questLevel(q[0])){
 const planet=Math.max(1,selectedWorld+1);
 const divisor=['investor','credits'].includes(q[0])?10:1;
 const calculated=Math.ceil(questNeed(q,lv)*0.11/divisor*Math.pow(1.35,lv-1)*Math.pow(1.18,planet-1));
 return Math.min(Number.MAX_VALUE,calculated,questNeed(q,lv));
}
function questRawValue(q,world=selectedWorld){
 switch(q[3]){
  case 'lifetime':return state.lifetimeTotal;
  case 'click':return state.clicks;
  case 'build':return totalBuildings();
  case 'rate':return autoRate()/Math.max(1e-9,eventMult('prod')*eventMult('income'));
  case 'world':return WORLDS.filter((_,i)=>worldUnlocked(i)).length;
  case 'tech':return Object.keys(state.research).length;
  case 'spend':return state.spent;
  case 'planetbuild':return worldProgress(world);
  default:return 0;
 }
}
function questValue(q){
 const slot=state.quests?.[q[0]]||{};
 const baseline=q[3]==='planetbuild'?Number(slot.baseByWorld?.[selectedWorld]||0):Number(slot.base)||0;
 return Math.max(0,questRawValue(q)-baseline);
}
function ensureQuests(){
 if(!state.quests||typeof state.quests!=='object')state.quests={};
 for(const q of QUESTS){
  const slot=state.quests[q[0]];
  if(!slot||typeof slot!=='object')state.quests[q[0]]={level:1,completed:0,base:0,baseByWorld:{}};
  else{
   slot.completed=Math.max(0,Math.floor(Number(slot.completed)||0));
   slot.level=normalizedQuestLevel(slot);
   slot.base=Math.max(0,Number(slot.base)||0);
   slot.baseByWorld=slot.baseByWorld&&typeof slot.baseByWorld==='object'?slot.baseByWorld:{};
  }
 }
}
function questDone(q){return questValue(q)>=questNeed(q)}
function claimQuest(id,shownLevel=null){
 ensureQuests();
 const q=QUESTS.find(x=>x[0]===id);if(!q)return;
 const completedLevel=questLevel(id);
 if(shownLevel!==null&&Number(shownLevel)!==completedLevel){render();return}
 if(!questDone(q))return;
 const slot=state.quests[id];
 const reward=questReward(q,completedLevel);
 slot.level=Math.min(100000,completedLevel+1);
 slot.completed=completedLevel;
 earn(reward);
 if(q[3]==='planetbuild')slot.baseByWorld[selectedWorld]=questRawValue(q);
 else slot.base=questRawValue(q);
 cloudDirty=true;save();render();
 toast('🎯 '+q[1]+' niveau '+completedLevel+' terminé · niveau '+slot.level+' débloqué · +'+fmt(reward));
}
function renderQuests(){
 const box=document.getElementById('missionList');if(!box)return;
 ensureQuests();
 box.innerHTML=QUESTS.map(q=>{
  const lv=questLevel(q[0]),need=questNeed(q,lv),value=questValue(q),done=value>=need,reward=questReward(q,lv),pct=Math.min(100,value/Math.max(1,need)*100);
  return `<article class="mission quest-card"><div class="mission-head"><strong>${done?'●':'○'} ${q[1]} <small>NIVEAU ${lv}</small></strong><b>+${fmt(reward)}</b></div><small>${q[2]} · ${fmt(value)} / ${fmt(need)} · bonus planète ×${Math.pow(1.18,selectedWorld).toFixed(2)}</small><div class="bar"><i style="width:${pct}%"></i></div><button class="${done?'primary':'secondary'}" data-quest="${q[0]}" data-quest-level="${lv}" ${done?'':'disabled'}>${done?'TERMINER LE NIVEAU '+lv+' · DÉBLOQUER '+(lv+1):'EN COURS · NIVEAU '+lv}</button></article>`;
 }).join('');
}

const EVENTS=[
 ['meteor','Pluie de météorites','☄️','Production globale augmentée de 35%.','prod',1.35,12],
 ['solar','Éruption solaire','☀️','Les systèmes énergétiques produisent 50% de plus.','prod',1.50,10],
 ['quantum','Faille quantique','🌀','Les revenus manuels sont doublés.','click',2,8],
 ['crystal','Averse cristalline','💎','Les gains de cristaux sont multipliés.','crystal',3,15],
 ['cargo','Convoi de cargos','🚚','Les constructions coûtent 25% moins cher.','cost',.75,18],
 ['ai','Surcadence IA','🤖','La production automatique est doublée.','prod',2,9],
 ['gravity','Anomalie gravitationnelle','🧲','Les gains manuels sont multipliés par 2,5.','click',2.5,11],
 ['trade','Marché en folie','📈','Les revenus de toutes les sources augmentent de 50%.','income',1.5,20],
 ['void','Souffle du Vide','🌑','La production avancée est fortement accélérée.','prod',1.8,7],
 ['storm','Tempête cosmique','⚡','Les extracteurs manuels sont surchargés.','click',2.2,12]
];
const ACHIEVEMENTS=[
 ['click100','Premiers pas','Effectuer 100 extractions','clicks',100,2e6],
 ['click1000','Mineur acharné','Effectuer 1 000 extractions','clicks',1000,2e7],
 ['build100','Ingénieur','Installer 100 bâtiments','build',100,5e7],
 ['build1000','Architecte','Installer 1 000 bâtiments','build',1000,5e9],
 ['wealth1e9','Fortune locale','Atteindre 1 Md de crédits cumulés','lifetime',1e9,1e8],
 ['wealth1e15','Magnat stellaire','Atteindre 1 Qa de crédits cumulés','lifetime',1e15,1e12],
 ['tech10','Chercheur confirmé','Débloquer 10 technologies','tech',10,1e9],
 ['tech20','Maître scientifique','Débloquer 20 technologies','tech',20,1e12],
 ['world8','Pionnier','Débloquer 8 secteurs','world',8,5e9],
 ['world16','Amiral','Débloquer 16 secteurs','world',16,1e15],
 ['world32','Maître de la galaxie','Débloquer les 32 secteurs','world',32,1e30],
 ['prestige5','Ascendant','Atteindre le prestige 5','prestige',5,2.5e11]
];
function activeEvent(){
 const e=state.event;if(!e||!e.id||Date.now()>=Number(e.activeUntil||0))return null;
 return EVENTS.find(x=>x[0]===e.id)||null;
}
function eventMult(kind){
 const e=activeEvent();if(!e)return 1;
 if(e[4]===kind||e[4]==='income'&&kind==='income')return e[5];
 return 1;
}
function scheduleEvent(){
 const now=Date.now();
 state.event.nextAt=now+(20+Math.random()*70)*60000;
 state.event.id=null;state.event.activeUntil=0;
}
function checkEvent(){
 const now=Date.now();
 if(activeEvent())return;
 if(state.event.id&&now>=state.event.activeUntil){state.event.id=null;state.event.activeUntil=0;}
 if(!state.event.nextAt){scheduleEvent();return;}
 if(now>=state.event.nextAt){
   const e=EVENTS[Math.floor(Math.random()*EVENTS.length)];
   state.event.id=e[0];state.event.activeUntil=now+e[6]*60000;
   scheduleEvent();state.event.id=e[0];state.event.activeUntil=now+e[6]*60000;
   toast(e[2]+' '+e[1]+' · '+e[3]);save();
 }
}
function offlineCap(){return 8*60*60}
function claimOffline(){
 const now=Date.now(),last=Number(state.lastAt||now);
 const seconds=Math.min(offlineCap(),Math.max(0,(now-last)/1000));
 state.lastAt=now;
 if(seconds<30){state.offlineLast=0;return 0}
 const gain=Math.max(0,autoRate()*seconds*.75);
 if(gain>0){earn(gain);state.offlineLast=gain}
 save();return gain;
}
function achievementValue(a){
 switch(a[3]){
  case'clicks':return state.clicks;
  case'build':return totalBuildings();
  case'lifetime':return state.lifetimeTotal;
  case'tech':return Object.keys(state.research).length;
  case'world':return WORLDS.filter((_,i)=>worldUnlocked(i)).length;
  case'prestige':return state.prestige;
  default:return 0;
 }
}
function checkAchievements(){
  ensureMissionState();
  let changed=false;
  ACHIEVEMENTS.forEach(a=>{
    if(achievementValue(a)>=a[4] && !state.achievements.includes(a[0])){
      state.achievements.push(a[0]);
      changed=true;
      toast('🏅 Succès débloqué : '+a[1]);
    }
  });
  if(changed)save();
}

let state=load();
let selectedWorld=Math.max(0,Math.min(WORLDS.length-1,Number(localStorage.getItem('sm-v2-world')??state.activeWorld??0)));
if(Math.floor(selectedWorld/32)>=(state.galaxiesUnlocked||1))selectedWorld=Math.max(0,((state.galaxiesUnlocked||1)-1)*32);
state.activeWorld=selectedWorld;
let screen='control';let missionTab='daily';let accountBusy=false;
const ADMIN_EMAIL='ojdshfihjgsdsdklfhsdjhf@gmail.com';
let adminVerified=false;
const ACCOUNT_CREATED_KEY='space-mining-account-created';
let accountReminderDismissed=false;
function closeAccountReminder(){const modal=document.getElementById('accountReminder');if(modal)modal.hidden=true;document.body.classList.remove('account-reminder-open')}
function openAccountReminder(){let created=false;try{created=localStorage.getItem(ACCOUNT_CREATED_KEY)==='1'}catch{}if(state.account||created||accountReminderDismissed)return;const modal=document.getElementById('accountReminder');if(modal){modal.hidden=false;document.body.classList.add('account-reminder-open')}}
function markAccountCreated(){try{localStorage.setItem(ACCOUNT_CREATED_KEY,'1')}catch{}closeAccountReminder()}
function dismissAccountReminder(){accountReminderDismissed=true;closeAccountReminder()}

function fresh(){
 const buildings={};WORLDS.forEach((_,w)=>BUILDING_ROLES.forEach((_,b)=>buildings[w+'-'+b]=0));
 return {money:0,runTotal:0,lifetimeTotal:0,prestige:0,crystals:0,ascensionPoints:0,galaxiesUnlocked:1,ascensionUpgrades:{},halloween:{candies:15000,totalCandiesEarned:15000,startingGift15kV2:true,planet:0,buildings:{},boosts:{}},buildings,research:{},xp:0,level:1,clicks:0,spent:0,activeWorld:0,
daily:{key:dateKey(),claimed:[],base:{clicks:0,lifetime:0,spent:0,buildings:0}},
weekly:{key:weekKey(),claimed:[],base:{clicks:0,lifetime:0,run:0,spent:0,buildings:0,tech:0,world:1}},
campaignClaimed:[],
achievements:[],
event:{id:null,activeUntil:0,nextAt:0},
offlineLast:0,lastAt:Date.now(),account:null,lastAccountUserId:null,seenWorlds:[0],localUpdatedAt:Date.now(),syncRevision:0,clickStreak:0,lastClickAt:0,clickMilestones:0,quests:{},cloudMeta:{lastPulledAt:0,lastPushedAt:0}};
}
function migrate(z){
 const base=fresh();z=Object.assign(base,z||{});z.buildings=Object.assign({},base.buildings,z.buildings||{});z.research=z.research||{};z.daily=z.daily||base.daily;z.weekly=z.weekly||base.weekly;const weeklyHasBase=!!(z.weekly&&z.weekly.base&&typeof z.weekly.base==='object');z.weekly.base=Object.assign({},base.weekly.base,z.weekly.base||{});
 z.prestige=Number(z.prestige)||0;z.ascensionPoints=Math.max(0,Number(z.ascensionPoints)||0);z.galaxiesUnlocked=Math.max(1,Math.min(3,Math.max(Number(z.galaxiesUnlocked)||1,Math.min(3,(Number(z.prestige)||0)+1))));z.ascensionUpgrades=z.ascensionUpgrades||{};z.lifetimeTotal=Number(z.lifetimeTotal)||0;z.runTotal=Number(z.runTotal)||z.money||0;z.money=Math.max(0,Number(z.money)||0);z.clicks=Number(z.clicks||z.cLICKS)||0;z.spent=Number(z.spent)||0;
z.campaignClaimed=Array.isArray(z.campaignClaimed)?z.campaignClaimed:[];
z.achievements=Array.isArray(z.achievements)?z.achievements:[];
z.achievementClaimed=Array.isArray(z.achievementClaimed)?z.achievementClaimed:[...z.achievements];
z.clickStreak=Number(z.clickStreak)||0;z.lastClickAt=Number(z.lastClickAt)||0;z.clickMilestones=Number(z.clickMilestones)||0;
z.event=Object.assign({id:null,activeUntil:0,nextAt:0},z.event||{});z.halloween=Object.assign({candies:0,totalCandiesEarned:0,candiesClicked:0,buildingsPurchased:0,boostPurchases:0,claimedMissions:[],selected:false,planet:0,buildings:{},boosts:{}},z.halloween||{});if(!z.halloween.startingGift15kV2){z.halloween.candies=Math.max(0,Number(z.halloween.candies)||0)+15000;z.halloween.totalCandiesEarned=Math.max(0,Number(z.halloween.totalCandiesEarned)||0)+15000;z.halloween.startingGift15kV2=true;}
z.offlineLast=Number(z.offlineLast)||0;
z.lastAt=Number(z.lastAt)||Date.now();
 z.activeWorld=Math.max(0,Math.min(WORLDS.length-1,Math.floor(Number(z.activeWorld)||0)));
 z.account=z.account&&typeof z.account==='object'?z.account:null;
 z.lastAccountUserId=z.lastAccountUserId||z.account?.userId||null;
 const oldUnlocked=[0];for(let w=1;w<WORLDS.length;w++)if(BUILDING_ROLES.every((_,b)=>(Number(z.buildings[(w-1)+'-'+b])||0)>=1))oldUnlocked.push(w);
 z.seenWorlds=Array.isArray(z.seenWorlds)?[...new Set(z.seenWorlds.map(Number).filter(w=>Number.isInteger(w)&&w>=0&&w<WORLDS.length))]:oldUnlocked;
 if(!z.seenWorlds.includes(0))z.seenWorlds.push(0);
 z.localUpdatedAt=Math.max(0,Number(z.localUpdatedAt)||Number(z.lastAt)||0);
 z.syncRevision=Math.max(0,Math.floor(Number(z.syncRevision)||0));
 z.quests=z.quests&&typeof z.quests==='object'?z.quests:{};
 z.cloudMeta=z.cloudMeta&&typeof z.cloudMeta==='object'?z.cloudMeta:{lastPulledAt:0,lastPushedAt:0};
 if(!weeklyHasBase||z.weekly.key!==weekKey()){z.weekly={key:weekKey(),claimed:[],base:{clicks:z.clicks,lifetime:z.lifetimeTotal,run:z.runTotal,spent:z.spent,buildings:Object.values(z.buildings||{}).reduce((a,b)=>a+Number(b||0),0),tech:Object.keys(z.research||{}).length,world:WORLDS.filter((_,i)=>i===0||BUILDING_ROLES.every((__,b)=>(z.buildings[(i-1)+'-'+b]||0)>=1)).length}}}
 for(let w=0;w<WORLDS.length;w++)for(let b=0;b<BUILDING_ROLES.length;b++){const k=w+'-'+b;z.buildings[k]=Math.max(0,Number(z.buildings[k])||0)}
 return z;
}
function load(){try{let raw=null;for(const k of [KEY,...OLD_KEYS]){const x=localStorage.getItem(k);if(x){raw=JSON.parse(x);break}}return migrate(raw)}catch{return fresh()}}
function save(markCloud=true){if(markCloud){state.localUpdatedAt=Date.now();state.syncRevision=(Number(state.syncRevision)||0)+1;if(state.account)cloudDirty=true}try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){console.warn('Local save failed',e);cloudMessage='Le stockage local est indisponible.'} }
function fmt(n){if(!Number.isFinite(n))return '∞';n=Math.max(0,n);if(n<1000)return Math.floor(n).toLocaleString('fr-FR');const units=['K','M','Md','Bn','T','Qa','Qi','Sx','Sp','Oc','No','Dc','Ud','Dd','Td','Qad','Qid'];const i=Math.floor(Math.log10(n)/3);return (n/10**(i*3)).toFixed(i>4?2:1)+' '+(units[i-1]||'e'+i*3)}
function dateKey(){return new Date().toISOString().slice(0,10)}
function weekKey(){const d=new Date();const day=d.getDay()||7;d.setHours(0,0,0,0);d.setDate(d.getDate()-day+1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function totalBuildings(){return Object.values(state.buildings).reduce((a,b)=>a+Number(b||0),0)}
function worldUnlocked(w){
 const g=Math.floor(w/32),local=w%32;
 if(g>=state.galaxiesUnlocked)return false;
 if(local===0)return true;
 return BUILDING_ROLES.every((_,b)=>(state.buildings[(w-1)+'-'+b]||0)>=1);
}
function worldProgress(w){return BUILDING_ROLES.reduce((a,_,b)=>a+(state.buildings[w+'-'+b]||0),0)}
function worldFactor(w){const local=w%32,p=Math.min(1,worldProgress(w)/(BUILDING_ROLES.length*20));return 1+local*.22+p*(0.6+local*.06)+(Number(state.ascensionUpgrades?.exploration)||0)*.08+(techOwned('multiverse')?.5:0)}
function cost(w,b){
 const n=state.buildings[w+'-'+b]||0,galaxy=Math.floor(w/32),local=w%32;
 if(galaxy===0&&local===0&&b<4){const bases=[1500,6000,24000,96000];return 6*Math.ceil(bases[b]*Math.pow(1.16,n)*eventMult('cost'));}
 const planetInflation=Math.pow(worldFactor(w),1.15);
 return 18*Math.ceil((500*Math.pow(28,local)*Math.pow(5.5,b)*Math.pow(1.16,n))*planetInflation/5*GALAXIES[galaxy].scale*eventMult('cost')*Math.pow(.95,Number(state.ascensionUpgrades?.discount)||0)*(techOwned('matterFabric')?.7:1));
}
function prestigeMult(){return 1+.18*state.prestige}
function techOwned(id){return !!state.research[id]}
function prodMult(){let m=(1+state.prestige*.18)*(1+.25*(Number(state.ascensionUpgrades?.production)||0))*halloweenBoostMult('prod');for(const br of BRANCH_ORDER)BRANCHES[br].forEach(t=>{if(techOwned(t[0])&&['automation','energy'].includes(br))m*=br==='automation'?1.25:1.2});if(techOwned('singularityAI'))m*=10;if(techOwned('zeroPoint'))m*=10;return m}
function clickPower(){let m=100*prestigeMult()*(1+.25*(Number(state.ascensionUpgrades?.click)||0));if(techOwned('laser'))m*=1.5;if(techOwned('plasma'))m*=1.8;if(techOwned('abyss'))m*=2;if(techOwned('stellar'))m*=3;if(techOwned('voidmine'))m*=5;if(techOwned('overdrive'))m*=10;return m*eventMult('click')*eventMult('income')*halloweenBoostMult('click')}
function baseProd(w,b){
 const galaxy=Math.floor(w/32),local=w%32;
 if(galaxy===0&&local===0&&b<4)return [20,75,280,1050][b];
 return 1000*(1.1+.18*local)*Math.pow(3.2,local)*Math.pow(2,b)*Math.max(1,2-b*.08)*(local>=12?Math.pow(1.16,local-11):1)*GALAXIES[galaxy].scale;
}
function autoRate(){let r=0;WORLDS.forEach((_,w)=>BUILDING_ROLES.forEach((__,b)=>r+=(state.buildings[w+'-'+b]||0)*baseProd(w,b)*WORLDS[w][3]));return r*prestigeMult()*prodMult()*3*eventMult('prod')*eventMult('income')/3*75}
function earn(x){if(!Number.isFinite(x)||x<=0)return;state.money+=x;state.runTotal+=x;state.lifetimeTotal+=x;state.xp+=Math.max(1,Math.floor(Math.log10(Math.max(10,x))+2));state.level=Math.floor(Math.sqrt(state.xp/80))+1}
function spend(x){state.money-=x;state.spent+=x}
function toast(t){const e=document.getElementById('toast');if(!e)return;e.textContent=t;e.classList.add('toast-show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('toast-show'),2200)}
function nav(name){screen=name;if(name==='tech')openTechAccordions.clear();if(name==='missions')openMissionAccordions.clear();if(name==='account')loadLeaderboard(true);if(name==='sectors')acknowledgeUnlockedSectors();document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.dataset.screen===name));document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav===name));render()}
function hasTechAlert(){return BRANCH_ORDER.some(br=>BRANCHES[br].some((t,i)=>!techOwned(t[0])&&state.money>=t[2]&&(i===0||techOwned(BRANCHES[br][i-1][0]))))}
function hasMissionAlert(){ensureDaily();ensureWeekly();ensureMissionState();const ds=dailySet();if(ds.some((d,i)=>!state.daily.claimed.includes(i)&&dailyValue(d)>=d[2]))return true;if(CAMPAIGN.some(m=>!state.campaignClaimed.includes(m[0])&&missionValue(m)>=m[3]))return true;if(WEEKLY.some((m,i)=>!state.weekly.claimed.includes(i)&&weeklyValue(m)>=m[3]))return true;if(QUESTS.some(q=>questDone(q)))return true;return ACHIEVEMENTS.some(a=>!state.achievementClaimed.includes(a[0])&&achievementValue(a)>=a[4])}
function acknowledgeUnlockedSectors(){if(!Array.isArray(state.seenWorlds))state.seenWorlds=[0];let changed=false;for(let i=0;i<WORLDS.length;i++)if(worldUnlocked(i)&&!state.seenWorlds.includes(i)){state.seenWorlds.push(i);changed=true}if(changed)save()}
function hasSectorAlert(){return WORLDS.some((_,i)=>worldUnlocked(i)&&!state.seenWorlds?.includes(i))}
function currentGalaxy(){return Math.min(2,Math.max(0,(state.galaxiesUnlocked||1)-1))}
function currentGalaxyWorlds(){const start=currentGalaxy()*32;return WORLDS.slice(start,start+32)}
function ascensionReady(){const start=currentGalaxy()*32,worlds=currentGalaxyWorlds();return worlds.length===32&&worlds.every((_,i)=>worldUnlocked(start+i))&&BUILDING_ROLES.every((_,b)=>worlds.every((__,i)=>(state.buildings[(start+i)+'-'+b]||0)>=10))}
function ascensionTarget(){return [1e60,1e110,1e160][currentGalaxy()]||1e160}
function ascensionPointReward(){return currentGalaxy()+1}
function hasPrestigeAlert(){return ascensionReady()&&state.runTotal>=ascensionTarget()}
function setNavAlert(id,on){const el=document.getElementById(id);if(el)el.hidden=!on}
function renderNavAlerts(){setNavAlert('navAlertSectors',hasSectorAlert());setNavAlert('navAlertTech',hasTechAlert());setNavAlert('navAlertMissions',hasMissionAlert());setNavAlert('navAlertPrestige',hasPrestigeAlert())}
function render(){
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
 updateMinePlanetTheme();if(state.halloween?.selected&&halloweenActive()){const ph=document.getElementById('planetHero');if(ph)ph.textContent=HALLOWEEN_PLANETS[state.halloween.planet||0]?.icon||'🎃';}
 set('money',fmt(state.money));set('rate',fmt(autoRate())+'/s');set('prestige','P'+state.prestige);set('accountName',state.account?.username||'Mineur');
 set('heroMoney',state.halloween?.selected?'🍬 '+fmt(state.halloween.candies):fmt(state.money));set('heroIncome',state.halloween?.selected?'+'+fmt(halloweenRate())+' bonbons / sec':'+'+fmt(autoRate())+' / sec');set('clickPower',fmt(clickPower()));set('sectorName',state.halloween?.selected?'Galaxie d’Halloween':WORLDS[selectedWorld][1]);set('sectorMeta',state.halloween?.selected?'Événement temporaire · récolte des bonbons':'Indice industriel ×'+worldFactor(selectedWorld).toFixed(2));
 set('buildingCount',totalBuildings());set('sectorProgress',WORLDS.filter((_,i)=>worldUnlocked(i)).length+' / '+WORLDS.length);set('techProgress',Object.keys(state.research).length);set('missionProgress',CAMPAIGN.filter(m=>missionValue(m)>=m[3]).length);set('buildingSector',state.halloween?.selected?'Galaxie d’Halloween':WORLDS[selectedWorld][1]);set('sectorCount',WORLDS.filter((_,i)=>worldUnlocked(i)).length+' / '+WORLDS.length);set('techCount',Object.values(BRANCHES).reduce((a,b)=>a+b.length,0)+' technologies');
 set('missionCount',CAMPAIGN.filter(m=>missionValue(m)>=m[3]).length+' / '+CAMPAIGN.length+' · '+state.achievements.length+'/'+ACHIEVEMENTS.length+' succès');
 set('clickStreak','Série : '+state.clickStreak);set('nextClickBonus',((Math.floor(state.clicks/100)+1)*100-state.clicks)+' clics');set('sectorBonus','×'+worldFactor(selectedWorld).toFixed(2));set('comboValue',Math.min(3,1+Math.floor(state.clickStreak/10)));const ch=document.getElementById('comboHud');if(ch)ch.hidden=state.clickStreak<2;const ev=activeEvent();set('eventStrip',ev?`${ev[2]} ${ev[1]} · ${ev[3]} · encore ${Math.max(1,Math.ceil((state.event.activeUntil-Date.now())/60000))} min`:'Aucun phénomène détecté.');
 document.body.classList.toggle('halloween-selected',!!(halloweenActive()&&state.halloween?.selected));const candyBtn=document.getElementById('halloweenCandyBtn');if(candyBtn)candyBtn.hidden=!(halloweenActive()&&state.halloween?.selected);renderBuildings();renderMap();renderHalloween();renderTech();renderMissions();renderDailyPreview();renderPrestige();renderAccount();renderNavAlerts();
}
function renderBuildings(){
 const box=document.getElementById('buildingList');if(!box)return;if(halloweenActive()&&state.halloween?.selected){renderHalloweenColony();return;}const w=WORLDS[selectedWorld];
 if(!worldUnlocked(selectedWorld)){box.innerHTML='<div class="panel"><b>SECTEUR VERROUILLÉ</b><p class="hint">Termine la colonie précédente : au moins 1 unité de chaque bâtiment.</p></div>';return}
 const list=buildingSet(selectedWorld);box.innerHTML=`<div class="planet-building-head"><span>${w[0]}</span><div><strong>${w[1]}</strong><small>Les modèles changent selon le secteur. Les niveaux, prix et revenus de ta sauvegarde restent inchangés.</small></div><b>×${w[3]}</b></div>`+list.map((x,b)=>{const n=state.buildings[selectedWorld+'-'+b]||0,c=cost(selectedWorld,b),income=baseProd(selectedWorld,b)*w[3]*prestigeMult()*prodMult()*75*eventMult('prod')*eventMult('income');return `<article class="building"><div class="building-icon">${x[1]}</div><div class="building-info"><strong>${x[0]}</strong><small>Niveau ${n} · +${fmt(income)}/s</small><em>Prochain coût · ${fmt(c)}</em></div><button class="buy" data-buy="${b}" ${state.money<c?'disabled':''}>ACHETER</button></article>`}).join('');
}
function renderMap(){
 const box=document.getElementById('galaxyMap');const selector=document.getElementById('galaxySelector');if(!box||!selector)return;
 const detail=document.getElementById('sectorDetail');
 selector.hidden=false;box.hidden=false;if(detail)detail.hidden=false;
 // Force le sélecteur comme frère direct de la carte, avant elle. Cela répare aussi
 // les anciennes versions de index.html où le sélecteur était imbriqué dans la carte.
 if(selector.parentElement!==box.parentElement || selector.nextElementSibling!==box){box.parentElement.insertBefore(selector,box);}
 selector.style.position='relative';selector.style.display='grid';selector.style.width='100%';selector.style.inset='auto';
 let g=Math.floor(selectedWorld/32);if(g>=state.galaxiesUnlocked){g=Math.max(0,state.galaxiesUnlocked-1);selectedWorld=g*32;}const start=g*32;
 selector.innerHTML=GALAXIES.map((gal,i)=>`<button class="galaxy-card ${i===g?'active':''} ${i<state.galaxiesUnlocked?'available':'locked'}" data-galaxy="${i}" ${i>=state.galaxiesUnlocked?'disabled':''}><span>${gal.icon}</span><b>${gal.name}</b><small>${i<state.galaxiesUnlocked?'DÉBLOQUÉE':'🔒 Requiert '+(i===1?'une première ascension':'deux ascensions')}</small><em>${WORLDS.slice(i*32,i*32+32).filter((_,j)=>worldUnlocked(i*32+j)).length}/32 planètes</em></button>`).join('');
 box.innerHTML=`<div class="map-grid-lines"></div><div class="galaxy-core">${GALAXIES[g].icon}</div>`;
 const cols=8;
 WORLDS.slice(start,start+32).forEach((w,j)=>{const i=start+j,col=j%cols,row=Math.floor(j/cols);const el=document.createElement('button');el.className='sector-node '+(i===selectedWorld?'active ':'')+(worldUnlocked(i)?'':'locked');el.style.setProperty('--col',col+1);el.style.setProperty('--row',row+1);el.innerHTML=`<span>${w[0]}</span><small>${String(j+1).padStart(2,'0')} · ${w[1]}</small><em>×${w[3]}</em>`;el.onclick=()=>{if(worldUnlocked(i)){state.halloween.selected=false;selectedWorld=i;state.activeWorld=i;if(!state.seenWorlds.includes(i))state.seenWorlds.push(i);localStorage.setItem('sm-v2-world',i);save();render()}else toast('Planète verrouillée : développe la précédente')};box.appendChild(el)});
 const safeSelected=selectedWorld>=start&&selectedWorld<start+32?selectedWorld:start;
 const w=WORLDS[safeSelected];
 document.getElementById('sectorDetail').innerHTML=`<div class="panel-title"><b>${w[0]} ${w[1]}</b><span style="margin-left:auto">×${w[3]}</span></div><p class="hint">${GALAXIES[g].name} · Planète ${(safeSelected%32)+1}/32 · Développement ${Math.round(worldProgress(safeSelected)/(BUILDING_ROLES.length*20)*100)}% · Indice industriel ×${worldFactor(safeSelected).toFixed(2)} · ${worldUnlocked(safeSelected)?'PLANÈTE ACTIVE':'VERROUILLÉE'}</p>`;
}
function renderTech(){
 const box=document.getElementById('techTree');if(!box)return;
 box.innerHTML=BRANCH_ORDER.map((br,bi)=>{
  const ownedCount=BRANCHES[br].filter(t=>techOwned(t[0])).length;
  const canBuy=BRANCHES[br].some((t,i)=>!techOwned(t[0])&&state.money>=t[2]&&(i===0||techOwned(BRANCHES[br][i-1][0])));
  const id='tech-branch-'+br;
  return `<details id="${id}" class="tech-branch tech-accordion" ${openTechAccordions.has(id)?'open':''}><summary class="tech-branch-head"><span>${['⛏','🤖','⚡','💰','🌌'][bi]}</span><h3>${branchName(br)}</h3><small class="tech-count">${ownedCount}/${BRANCHES[br].length}</small>${canBuy?'<i class="quest-ready-dot" aria-label="Technologie disponible"></i>':''}<span class="accordion-chevron">⌄</span></summary><div class="tech-chain">${BRANCHES[br].map((t,i)=>{const prev=i?BRANCHES[br][i-1][0]:null,owned=techOwned(t[0]),available=!prev||techOwned(prev),ready=available&&!owned&&state.money>=t[2];return `<div class="tech-node ${owned?'owned':''} ${available?'':'locked'}"><div class="tech-node-dot"></div><strong>${ready?'<i class="quest-ready-dot"></i> ':''}${owned?'✓ ':''}${t[1]}</strong><small>${t[3]} · ${fmt(t[2])}</small><button class="${available&&!owned?'buy':'secondary'}" data-tech="${t[0]}" ${owned||!available||state.money<t[2]?'disabled':''}>${owned?'ACQUISE':available?'RECHERCHER':'VERROUILLÉE'}</button></div>`}).join('')}</div></details>`
 }).join('');
}
function branchName(x){return ({extraction:'EXTRACTION',automation:'AUTOMATISATION',energy:'ÉNERGIE',economy:'ÉCONOMIE',exploration:'EXPLORATION'})[x]}
function missionValue(m){switch(m[2]){case'click':return state.clicks;case'lifetime':return state.lifetimeTotal;case'run':return state.runTotal;case'build':return totalBuildings();case'spend':return state.spent;case'tech':return Object.keys(state.research).length;case'level':return state.level;case'world':return WORLDS.filter((_,i)=>worldUnlocked(i)).length;default:return 0}}
function ensureDaily(){if(state.daily.key!==dateKey())state.daily={key:dateKey(),claimed:[],base:{clicks:state.clicks,lifetime:state.lifetimeTotal,spent:state.spent,buildings:totalBuildings()}}}
function ensureWeekly(){const key=weekKey();if(!state.weekly||state.weekly.key!==key){state.weekly={key,claimed:[],base:{clicks:state.clicks,lifetime:state.lifetimeTotal,run:state.runTotal,spent:state.spent,buildings:totalBuildings(),tech:Object.keys(state.research).length,world:WORLDS.filter((_,i)=>worldUnlocked(i)).length}};save()}}
function weeklyValue(m){ensureWeekly();const base=state.weekly.base||{};switch(m[2]){case'click':return Math.max(0,state.clicks-(base.clicks||0));case'build':return Math.max(0,totalBuildings()-(base.buildings||0));case'run':return Math.max(0,state.runTotal-(base.run||0));case'spend':return Math.max(0,state.spent-(base.spent||0));case'tech':return Math.max(0,Object.keys(state.research).length-(base.tech||0));case'world':return Math.max(0,WORLDS.filter((_,i)=>worldUnlocked(i)).length-(base.world||0));default:return 0}}
function ensureMissionState(){
  if(!Array.isArray(state.campaignClaimed))state.campaignClaimed=[];
  if(!Array.isArray(state.achievementClaimed))state.achievementClaimed=[...state.achievements];
}
function dailyValue(d){const base=state.daily.base;switch(d[0]){case'click':return state.clicks-base.clicks;case'build':return totalBuildings()-base.buildings;case'earn':return state.lifetimeTotal-base.lifetime;case'spend':return state.spent-base.spent;default:return 0}}
function dailySet(){ensureDaily();const seed=Number(dateKey().replaceAll('-',''));return DAILY_TEMPLATES.map((_,i)=>DAILY_TEMPLATES[(seed+i*7)%DAILY_TEMPLATES.length][i])}
function missionSectionReady(tab){
 ensureDaily();ensureWeekly();ensureMissionState();
 if(tab==='daily')return dailySet().some((d,i)=>!state.daily.claimed.includes(i)&&dailyValue(d)>=d[2]);
 if(tab==='campaign')return CAMPAIGN.some(m=>!state.campaignClaimed.includes(m[0])&&missionValue(m)>=m[3]);
 if(tab==='weekly')return WEEKLY.some((m,i)=>!state.weekly.claimed.includes(i)&&weeklyValue(m)>=m[3]);
 if(tab==='quests')return QUESTS.some(q=>questDone(q));
 if(tab==='achievements')return ACHIEVEMENTS.some(a=>!state.achievementClaimed.includes(a[0])&&achievementValue(a)>=a[4]);
 return false;
}
function renderMissionSection(tab){
 if(tab==='quests'){
  ensureQuests();
  return QUESTS.map(q=>{const lv=questLevel(q[0]),need=questNeed(q,lv),value=questValue(q),done=value>=need,reward=questReward(q,lv),pct=Math.min(100,value/Math.max(1,need)*100);return `<article class="mission quest-card ${done?'mission-ready':''}"><div class="mission-head"><strong>${done?'<i class="quest-ready-dot"></i> ●':'○'} ${q[1]} <small>NIVEAU ${lv}</small></strong><b>+${fmt(reward)}</b></div><small>${q[2]} · ${fmt(value)} / ${fmt(need)} · bonus planète ×${Math.pow(1.18,selectedWorld).toFixed(2)}</small><div class="bar"><i style="width:${pct}%"></i></div><button class="${done?'primary':'secondary'}" data-quest="${q[0]}" data-quest-level="${lv}" ${done?'':'disabled'}>${done?'TERMINER LE NIVEAU '+lv+' · DÉBLOQUER '+(lv+1):'EN COURS · NIVEAU '+lv}</button></article>`}).join('');
 }
 if(tab==='daily')return dailySet().map((d,i)=>missionHTML('d'+i,d[1],d[0],d[2],DAILY_REWARDS[i],state.daily.claimed.includes(i),dailyValue(d))).join('');
 if(tab==='campaign')return CAMPAIGN.map(m=>missionHTML(m[0],m[1],m[2],m[3],m[4],state.campaignClaimed.includes(m[0]),missionValue(m))).join('');
 if(tab==='weekly')return WEEKLY.map((m,i)=>missionHTML(m[0],m[1],m[2],m[3],m[4],state.weekly.claimed.includes(i),weeklyValue(m))).join('');
 return ACHIEVEMENTS.map(a=>{const claimed=state.achievementClaimed.includes(a[0]),value=achievementValue(a),done=value>=a[4],pct=Math.min(100,value/Math.max(1,a[4])*100);return `<article class="mission ${claimed?'achievement-done':''} ${done&&!claimed?'mission-ready':''}"><div class="mission-head"><strong>${done&&!claimed?'<i class="quest-ready-dot"></i> ':''}${claimed?'🏅':done?'●':'○'} ${a[1]}</strong><b>+${fmt(a[5])}</b></div><small>${a[2]} · ${fmt(value)} / ${fmt(a[4])}</small><div class="bar"><i style="width:${pct}%"></i></div><button class="${done&&!claimed?'primary':'secondary'}" data-achievement="${a[0]}" ${done&&!claimed?'':'disabled'}>${claimed?'RÉCLAMÉ':done?'RÉCLAMER':'EN COURS'}</button></article>`}).join('');
}
function renderMissions(){
 ensureDaily();ensureWeekly();ensureMissionState();
 const box=document.getElementById('missionList');if(!box)return;
 const tabs=[['daily','📅','QUOTIDIEN'],['quests','🎯','QUÊTES'],['campaign','📜','CAMPAGNE'],['weekly','🗓️','HEBDOMADAIRE'],['achievements','🏆','SUCCÈS']];
 box.innerHTML=tabs.map(([tab,icon,label],i)=>{const id='mission-group-'+tab,ready=missionSectionReady(tab);return `<details id="${id}" class="mission-group" ${openMissionAccordions.has(id)?'open':''}><summary><span class="mission-group-icon">${icon}</span><b>${label}</b><small>${tab==='daily'?dailySet().filter((d,j)=>!state.daily.claimed.includes(j)).length+' disponibles':tab==='quests'?QUESTS.length+' progressions':tab==='campaign'?CAMPAIGN.length+' objectifs':tab==='weekly'?WEEKLY.length+' objectifs':ACHIEVEMENTS.length+' succès'}</small>${ready?'<i class="quest-ready-dot" aria-label="Récompense disponible"></i>':''}<span class="accordion-chevron">⌄</span></summary><div class="mission-group-content">${renderMissionSection(tab)}</div></details>`}).join('') + (halloweenActive()?`<details id="mission-group-halloween" class="mission-group halloween-mission-group" ${openMissionAccordions.has('mission-group-halloween')?'open':''}><summary><span class="mission-group-icon">🎃</span><b>MISSIONS D’HALLOWEEN</b><small>${HALLOWEEN_MISSIONS.filter(m=>state.halloween.claimedMissions.includes(m.id)).length}/${HALLOWEEN_MISSIONS.length} terminées</small>${HALLOWEEN_MISSIONS.some(m=>!state.halloween.claimedMissions.includes(m.id)&&halloweenMissionValue(m)>=halloweenMissionGoal(m))?'<i class="quest-ready-dot" aria-label="Mission Halloween prête"></i>':''}<span class="accordion-chevron">⌄</span></summary><div class="mission-group-content">${HALLOWEEN_MISSIONS.map(m=>{const value=halloweenMissionValue(m),claimed=state.halloween.claimedMissions.includes(m.id),goal=halloweenMissionGoal(m),reward=halloweenMissionReward(m),lv=halloweenMissionLevel(m),done=value>=goal,pct=Math.min(100,value/Math.max(1,goal)*100);return `<article class="mission halloween-mission ${done&&!claimed?'mission-ready':''}"><div class="mission-head"><strong>${done&&!claimed?'<i class="quest-ready-dot"></i> ':''}${claimed?'✓':done?'●':'○'} ${m.name} <small>NIVEAU ${lv}</small></strong><b>+🍬 ${fmt(reward)}</b></div><small>${m.desc} · ${fmt(value)} / ${fmt(goal)}</small><div class="bar"><i style="width:${pct}%"></i></div><button class="${done&&!claimed?'primary':'secondary'}" data-halloween-mission="${m.id}" ${done&&!claimed?'':'disabled'}>${claimed?'TERMINÉ':done?'RÉCLAMER NIVEAU '+lv:'EN COURS · NIVEAU '+lv}</button></article>`}).join('')}</div></details>`:'');
}
function missionHTML(id,title,type,need,reward,claimed,value){const done=value>=need;return `<article class="mission ${done&&!claimed?'mission-ready':''}"><div class="mission-head"><strong>${done&&!claimed?'<i class="quest-ready-dot"></i> ':''}${claimed?'✓':done?'●':'○'} ${title}</strong><b>+${fmt(reward)}</b></div><small>${fmt(value)} / ${fmt(need)}</small><div class="bar"><i style="width:${Math.min(100,value/need*100)}%"></i></div><button class="${done&&!claimed?'primary':'secondary'}" data-claim="${id}" data-claim-type="${id[0]==='d'?'daily':id.startsWith('week')?'weekly':'campaign'}" ${done&&!claimed?'':'disabled'}>${claimed?'RÉCLAMÉ':done?'RÉCLAMER':'EN COURS'}</button></article>`}
function renderDailyPreview(){const box=document.getElementById('dailyPreview');if(!box)return;ensureDaily();const ds=dailySet();box.innerHTML=ds.map((d,i)=>`<div class="daily-row"><span>${state.daily.claimed.includes(i)?'✓':'○'} ${d[1]}</span><b>+${fmt(DAILY_REWARDS[i])}</b></div>`).join('')}
const ASCENSION_UPGRADES=[
 {id:'production',name:'Production optimisée',icon:'⚙️',max:5,cost:1,desc:'+25% production par niveau'},
 {id:'discount',name:'Ingénierie économique',icon:'💠',max:5,cost:1,desc:'−5% coût des bâtiments par niveau'},
 {id:'click',name:'Laser de commandement',icon:'🔆',max:5,cost:1,desc:'+25% puissance de clic par niveau'},
 {id:'exploration',name:'Cartographie avancée',icon:'🧭',max:5,cost:2,desc:'Indice industriel planétaire augmenté'}
];
function buyAscensionUpgrade(id){
 const u=ASCENSION_UPGRADES.find(x=>x.id===id);if(!u)return;
 const level=Number(state.ascensionUpgrades?.[id])||0;
 if(level>=u.max){toast('Amélioration déjà au niveau maximum');return}
 if((state.ascensionPoints||0)<u.cost){toast('Pas assez de points d’ascension');return}
 state.ascensionPoints-=u.cost;state.ascensionUpgrades[id]=level+1;save();render();toast(u.name+' améliorée · niveau '+(level+1));
}
function renderPrestige(){
 const target=ascensionTarget(),g=currentGalaxy(),start=g*32,worlds=currentGalaxyWorlds();
 document.getElementById('prestigeBig').textContent='P'+state.prestige;
 document.getElementById('runTotal').textContent=fmt(state.runTotal);
 document.getElementById('prestigeTarget').textContent=fmt(target);
 document.getElementById('prestigeText').textContent=`Galaxie active : ${GALAXIES[g].name}. Une ascension accorde ${ascensionPointReward()} point(s) permanent(s) et ${g<2?'débloque la galaxie suivante.':'renforce ta progression permanente.'}`;
 const ready=ascensionReady(),moneyReady=state.runTotal>=target;
 document.getElementById('prestigeBtn').disabled=!ready||!moneyReady;
 const req=document.getElementById('ascensionRequirement');
 const missingWasOpen=!!req?.querySelector('.ascension-missing')?.open;
 const requirementHTML=`<div class="ascension-check ${worlds.every((_,i)=>worldUnlocked(start+i))?'done':''}">🪐 Planètes débloquées : ${worlds.filter((_,i)=>worldUnlocked(start+i)).length}/32</div><div class="ascension-check ${BUILDING_ROLES.every((_,b)=>worlds.every((__,i)=>(state.buildings[(start+i)+'-'+b]||0)>=10)?'done':'')}">🏗️ Bâtiments : 10 de chaque type sur les 32 planètes</div><div class="ascension-check ${moneyReady?'done':''}">💰 Argent requis : ${fmt(target)} · actuel : ${fmt(state.runTotal)}</div><div class="ascension-check">✨ Récompense : +${ascensionPointReward()} point(s) d’ascension</div><details class="ascension-missing"><summary>Voir les bâtiments manquants</summary>${worlds.map((w,i)=>{const wi=start+i,missing=BUILDING_ROLES.map((r,b)=>({name:buildingSet(wi)[b][0],n:state.buildings[wi+'-'+b]||0})).filter(x=>x.n<10);return missing.length?`<p><b>${w[1]}</b> — ${missing.map(x=>`${x.name}: ${x.n}/10`).join(', ')}</p>`:''}).join('')||'<p>Tout est construit.</p>'}</details>`;
 if(req && req.innerHTML!==requirementHTML){req.innerHTML=requirementHTML;const details=req.querySelector('.ascension-missing');if(details)details.open=missingWasOpen;}
 const upgrades=document.getElementById('ascensionUpgrades');if(upgrades)upgrades.innerHTML=`<h3>✨ Améliorations permanentes · ${state.ascensionPoints||0} point(s)</h3><div class="ascension-upgrade-list">${ASCENSION_UPGRADES.map(u=>{const level=Number(state.ascensionUpgrades?.[u.id])||0;return `<article class="ascension-upgrade"><span>${u.icon}</span><div><b>${u.name} · Niv. ${level}/${u.max}</b><small>${u.desc}</small></div><button data-asc-upgrade="${u.id}" ${level>=u.max||(state.ascensionPoints||0)<u.cost?'disabled':''}>${level>=u.max?'MAX':`Améliorer · ${u.cost} pt`}</button></article>`}).join('')}</div>`;
 const reward=document.getElementById('ascensionReward');if(reward)reward.textContent='Après confirmation : argent, bâtiments et recherches sont réinitialisés. Succès, compte, points et galaxies débloquées sont conservés.';
}
function cloneState(value){return JSON.parse(JSON.stringify(value||{}))}
function unionValues(a,b){return [...new Set([...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])])]}
function mergeBase(a,b){const out={...(b||{}),...(a||{})};for(const key of new Set([...Object.keys(a||{}),...Object.keys(b||{})])){const x=Number(a?.[key]),y=Number(b?.[key]);if(Number.isFinite(x)&&Number.isFinite(y))out[key]=Math.min(x,y)}return out}
function mergeCycle(a,b){if(!a)return cloneState(b);if(!b)return cloneState(a);if(a.key!==b.key)return String(a.key||'')>String(b.key||'')?cloneState(a):cloneState(b);return {...cloneState(a),claimed:unionValues(a.claimed,b.claimed),base:mergeBase(a.base,b.base)}}
function mergeQuestState(a,b){const out={...cloneState(a||{}),...cloneState(b||{})};for(const id of new Set([...Object.keys(a||{}),...Object.keys(b||{})])){const x=a?.[id]||{},y=b?.[id]||{};const chosen=(Number(y.level)||1)>(Number(x.level)||1)?y:x;const same=(Number(x.level)||1)===(Number(y.level)||1);const hasX=!!a?.[id],hasY=!!b?.[id];out[id]={...cloneState(chosen),level:Math.max(Number(x.level)||1,Number(y.level)||1),completed:Math.max(Number(x.completed)||0,Number(y.completed)||0),base:same&&hasX&&hasY?Math.min(Number(x.base)||0,Number(y.base)||0):Number(chosen.base)||0,baseByWorld:{...cloneState(x.baseByWorld||{}),...cloneState(y.baseByWorld||{})}};if(same)for(const world of new Set([...Object.keys(x.baseByWorld||{}),...Object.keys(y.baseByWorld||{})])){const xv=x.baseByWorld?.[world],yv=y.baseByWorld?.[world];out[id].baseByWorld[world]=xv===undefined?Number(yv)||0:yv===undefined?Number(xv)||0:Math.min(Number(xv)||0,Number(yv)||0)}}return out}
function mergeSnapshots(first,second){
 const local=migrate(cloneState(first)),cloud=migrate(cloneState(second));
 const samePrestige=Number(local.prestige||0)===Number(cloud.prestige||0);
 const preferred=Number(local.prestige||0)>Number(cloud.prestige||0)?local:Number(cloud.prestige||0)>Number(local.prestige||0)?cloud:Number(local.localUpdatedAt||0)>=Number(cloud.localUpdatedAt||0)?local:cloud;
 const other=preferred===local?cloud:local;const merged=cloneState(preferred);
 merged.prestige=Math.max(Number(local.prestige)||0,Number(cloud.prestige)||0);
 if(samePrestige){merged.money=Math.max(0,Number(preferred.money)||0);merged.runTotal=Math.max(Number(local.runTotal)||0,Number(cloud.runTotal)||0);merged.buildings=Object.fromEntries(Object.keys({...local.buildings,...cloud.buildings}).map(k=>[k,Math.max(Number(local.buildings?.[k])||0,Number(cloud.buildings?.[k])||0)]))}
 merged.lifetimeTotal=Math.max(Number(local.lifetimeTotal)||0,Number(cloud.lifetimeTotal)||0);merged.xp=Math.max(Number(local.xp)||0,Number(cloud.xp)||0);merged.level=Math.max(Number(local.level)||1,Number(cloud.level)||1);merged.clicks=Math.max(Number(local.clicks)||0,Number(cloud.clicks)||0);merged.spent=Math.max(Number(local.spent)||0,Number(cloud.spent)||0);merged.crystals=Math.max(Number(local.crystals)||0,Number(cloud.crystals)||0);
 merged.research={...(local.research||{}),...(cloud.research||{})};merged.achievements=unionValues(local.achievements,cloud.achievements);merged.achievementClaimed=unionValues(local.achievementClaimed,cloud.achievementClaimed);merged.campaignClaimed=unionValues(local.campaignClaimed,cloud.campaignClaimed);merged.seenWorlds=unionValues(local.seenWorlds,cloud.seenWorlds);
 merged.daily=mergeCycle(local.daily,cloud.daily);merged.weekly=mergeCycle(local.weekly,cloud.weekly);merged.quests=mergeQuestState(local.quests,cloud.quests);merged.lastAt=Math.max(Number(local.lastAt)||0,Number(cloud.lastAt)||0);merged.offlineLast=Math.max(Number(local.offlineLast)||0,Number(cloud.offlineLast)||0);merged.localUpdatedAt=Math.max(Number(local.localUpdatedAt)||0,Number(cloud.localUpdatedAt)||0);merged.syncRevision=Math.max(Number(local.syncRevision)||0,Number(cloud.syncRevision)||0);merged.lastAccountUserId=local.lastAccountUserId||cloud.lastAccountUserId||null;merged.account=preferred.account||other.account||null;merged.cloudMeta={...(other.cloudMeta||{}),...(preferred.cloudMeta||{})};
 return migrate(merged)
}
function comparableSave(value){const copy=cloneState(value);delete copy.account;delete copy.cloudMeta;delete copy.localUpdatedAt;delete copy.syncRevision;return copy}
function authErrorMessage(error){const message=String(error?.message||'').toLowerCase();if(message==='session'||message.includes('session expired')||message.includes('invalid session'))return 'Session expirée · reconnecte-toi pour reprendre la synchronisation. Ta partie reste sauvegardée sur cet appareil.';if(message.includes('invalid login credentials'))return 'Adresse e-mail ou mot de passe incorrect.';if(message.includes('email not confirmed'))return 'Confirme ton adresse e-mail avant de te connecter.';if(message.includes('user already registered'))return 'Un compte existe déjà avec cette adresse e-mail.';if(message.includes('password should be at least'))return 'Le mot de passe doit contenir au moins 8 caractères.';if(message.includes('rate limit'))return 'Trop de demandes. Attends un peu puis réessaie.';if(message.includes('failed to fetch')||message.includes('network'))return 'Connexion impossible. Vérifie ta connexion Internet.';if(message.includes('score cannot decrease')||message.includes('prestige cannot decrease')||message.includes('level cannot decrease'))return 'La sauvegarde cloud contient une progression plus récente. Relance la synchronisation.';return 'Synchronisation indisponible · ta progression reste conservée localement. Réessaie après avoir vérifié ta connexion.'}
async function cloudErrorMessage(error){
 let message=String(error?.message||'');const response=error?.context;
 if(response&&typeof response.clone==='function')try{const payload=await response.clone().json();message=String(payload?.error||payload?.message||message)}catch{}
 const lower=message.toLowerCase();if(response?.status===401||lower.includes('invalid session'))return authErrorMessage({message:'invalid session'});if(response?.status===413||lower.includes('save is too large'))return 'Sauvegarde trop volumineuse pour le cloud · ta partie reste conservée sur cet appareil.';if(lower.includes('numeric field overflow'))return 'Le classement cloud a refusé un grand total · ta progression reste conservée sur cet appareil. Réessaie après la mise à jour du service.';
 return authErrorMessage({message});
}
function setCloudMessage(message,error=false){cloudMessage=message;cloudLastError=error?message:'';renderSyncIndicators()}
function syncPresentation(){if(!state.account)return {state:'local',badge:'LOCAL',label:'SAUVEGARDE LOCALE'};if(cloudBusy)return {state:'sync',badge:'SYNCHRONISATION',label:'SYNCHRONISATION'};if(cloudLastError)return {state:'error',badge:'À RÉESSAYER',label:'SYNCHRO EN ATTENTE'};if(cloudDirty)return {state:'sync',badge:'À ENVOYER',label:'SAUVEGARDE EN ATTENTE'};return {state:'cloud',badge:'CLOUD ACTIF',label:'CLOUD SYNCHRONISÉ'}}
function renderSyncIndicators(){const status=syncPresentation();const dot=document.getElementById('accountDot');if(dot){dot.dataset.state=status.state;dot.textContent=status.badge}const badge=document.getElementById('cloudState');if(badge)badge.textContent=status.badge;const header=document.getElementById('headerSyncLabel');if(header)header.textContent=status.label;const message=document.getElementById('cloudStatus');if(message)message.textContent=cloudBusy?'Synchronisation en cours…':cloudMessage;const title=document.getElementById('syncCardTitle');if(title)title.textContent=cloudLastError?'Synchronisation à vérifier':cloudDirty?'Progression en attente':'Sauvegarde cloud';const last=document.getElementById('syncLast');if(last){const date=lastCloudSync||Number(state.account?.lastSync)||Number(state.cloudMeta?.lastPushedAt)||0;last.textContent=date?'Dernière sauvegarde : '+new Date(date).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'}):'Dernière sauvegarde : en attente'}const hint=document.getElementById('authHint');if(hint&&!state.account)hint.textContent=sb?'La progression reste enregistrée sur cet appareil tant que tu joues en mode local.':'Le service de compte est momentanément indisponible. Ta partie locale reste accessible.'}
function renderAccount(){
 const logged=!!state.account;for(const id of ['createAccount','loginAccount','recoverPassword','saveNewPassword']){const button=document.getElementById(id);if(button)button.disabled=authBusy}const out=document.getElementById('authLoggedOut'),inside=document.getElementById('authLoggedIn'),recovery=document.getElementById('passwordRecoveryPanel');if(out)out.hidden=logged||passwordRecoveryMode;if(inside)inside.hidden=!logged||passwordRecoveryMode;if(recovery)recovery.hidden=!passwordRecoveryMode;
 const isAdmin=!!(logged&&adminVerified&&String(state.account?.email||'').toLowerCase()===ADMIN_EMAIL);const adminPanel=document.getElementById('adminPanel');if(adminPanel)adminPanel.hidden=!isAdmin;const adminNav=document.getElementById('adminNavButton');if(adminNav)adminNav.hidden=!isAdmin;
 if(logged){const profile=document.getElementById('profileName'),email=document.getElementById('profileEmail');if(profile)profile.textContent=state.account.username||'Mineur';if(email)email.textContent=state.account.email||'';const total=document.getElementById('accountStatTotal'),level=document.getElementById('accountStatLevel'),prestige=document.getElementById('accountStatPrestige');if(total)total.textContent=fmt(state.lifetimeTotal);if(level)level.textContent=String(state.level||1);if(prestige)prestige.textContent='P'+(state.prestige||0);if(document.querySelector('.screen[data-screen="account"].active'))loadLeaderboard()}
 renderSyncIndicators();
}
function stateHasProgress(value){return Number(value?.lifetimeTotal)>0||Number(value?.prestige)>0||Number(value?.clicks)>0||Object.values(value?.buildings||{}).some(Number)||Object.keys(value?.research||{}).length>0}
function accountForUser(user){return {username:user.user_metadata?.username||state.account?.username||'Mineur',email:user.email||state.account?.email||'',userId:user.id,localSnapshotAt:Date.now(),lastSync:state.account?.lastSync||0}}
async function activateSession(user){
 if(!user?.id)return false;adminVerified=String(user.email||'').toLowerCase()===ADMIN_EMAIL;markAccountCreated();const uid=user.id;const oldOwner=state.lastAccountUserId||state.account?.userId||null;const allowLocalMerge=!oldOwner||oldOwner===uid;
 if(!allowLocalMerge){try{localStorage.setItem(KEY+':account:'+oldOwner,JSON.stringify(state))}catch{}}
 const account=accountForUser(user);if(!allowLocalMerge){state=fresh();state.account=account;state.lastAccountUserId=uid;save(false)}else{state.account=account;state.lastAccountUserId=uid;save(false)}
 cloudRestoreDone=false;cloudDirty=false;cloudSyncFailures=0;cloudRetryAt=0;cloudLastError='';render();
 const restored=await restoreCloud(allowLocalMerge);
 if(restored){selectedWorld=Math.max(0,Math.min(WORLDS.length-1,Math.floor(Number(state.activeWorld)||0)));try{localStorage.setItem('sm-v2-world',String(selectedWorld))}catch{}render()}
 if(restored&&cloudDirty)await syncCloud(true);
 return restored
}
function authPayload(snapshot){return {nickname:state.account?.username||'Mineur',total:Number(snapshot.lifetimeTotal)||0,prestige:Number(snapshot.prestige)||0,level:Number(snapshot.level)||1,xp:Number(snapshot.xp)||0,state:{...snapshot,activeWorld:selectedWorld}}}
async function getCloudSession(){if(!sb)return null;const {data,error}=await sb.auth.getSession();if(error)throw error;return data?.session||null}
async function verifyAdminSession(){try{if(!sb){adminVerified=false;return false}const {data,error}=await sb.auth.getUser();if(error)throw error;adminVerified=String(data?.user?.email||'').toLowerCase()===ADMIN_EMAIL&&String(data?.user?.id||'')===String(state.account?.userId||'');return adminVerified}catch{adminVerified=false;return false}}
async function runAdminAction(action){if(!await verifyAdminSession()||String(state.account?.email||'').toLowerCase()!==ADMIN_EMAIL){toast('Accès administrateur refusé.');renderAccount();return}const field=document.getElementById('adminAmount');const raw=String(field?.value||'').trim().replace(/\s/g,'').replace(',','.');const amount=Number(raw);if(['add-money','remove-money','set-money'].includes(action)&&(!Number.isFinite(amount)||amount<0)){toast('Montant invalide. Utilise un nombre ou une notation comme 1e100.');return}switch(action){case'add-money':state.money+=amount;state.runTotal+=amount;state.lifetimeTotal+=amount;break;case'remove-money':state.money=Math.max(0,state.money-amount);break;case'set-money':state.money=amount;break;case'add-points':state.ascensionPoints=(Number(state.ascensionPoints)||0)+100;break;case'add-prestige':state.prestige=(Number(state.prestige)||0)+1;state.galaxiesUnlocked=Math.max(Number(state.galaxiesUnlocked)||1,Math.min(3,state.prestige+1));break;case'unlock-galaxies':state.galaxiesUnlocked=3;break;case'unlock-planets':state.galaxiesUnlocked=3;for(let w=0;w<WORLDS.length;w++)for(let b=0;b<BUILDING_ROLES.length;b++)state.buildings[w+'-'+b]=Math.max(1,Number(state.buildings[w+'-'+b])||0);state.seenWorlds=Array.from({length:WORLDS.length},(_,i)=>i);break;case'ten-buildings':state.galaxiesUnlocked=3;for(let w=0;w<WORLDS.length;w++)for(let b=0;b<BUILDING_ROLES.length;b++)state.buildings[w+'-'+b]=Math.max(10,Number(state.buildings[w+'-'+b])||0);state.seenWorlds=Array.from({length:WORLDS.length},(_,i)=>i);break;default:return}selectedWorld=Math.min(selectedWorld,Math.max(0,state.galaxiesUnlocked*32-1));state.activeWorld=selectedWorld;save();render();const status=document.getElementById('adminStatus');if(status)status.textContent='Action effectuée · '+new Date().toLocaleTimeString('fr-FR');toast('Commande admin exécutée.');if(state.account)syncCloud(true)}
async function syncCloud(force=false){
 if(!sb||!state.account?.userId||cloudBusy)return false;if(typeof navigator!=='undefined'&&navigator.onLine===false){setCloudMessage('Hors ligne · la partie est conservée ici.');return false}if(!force&&Date.now()<cloudRetryAt)return false;if(!force&&Date.now()-lastCloudSync<CLOUD_SYNC_MS)return true;
 cloudBusy=true;const startRevision=Number(state.syncRevision)||0;renderAccount();
 try{
  const session=await getCloudSession();if(!session){const oldAccount=state.account;state.lastAccountUserId=oldAccount?.userId||state.lastAccountUserId||null;state.account=null;cloudDirty=false;cloudRestoreDone=false;cloudLastError='';save(false);setCloudMessage('Session expirée · reconnecte-toi. Ta progression reste sauvegardée sur cet appareil.');render();return false}if(session.user.id!==state.account.userId){const mismatchedAccount=state.account;state.lastAccountUserId=mismatchedAccount.userId;state.account=null;save(false);setCloudMessage('Session d’un autre compte détectée · reconnecte-toi au compte de cette sauvegarde.');render();return false}
  const localSnapshot=cloneState(state);const {data,error}=await sb.from(CLOUD_TABLE).select('state,updated_at').eq('user_id',session.user.id).maybeSingle();if(error)throw error;
  let merged=data?.state&&typeof data.state==='object'?mergeSnapshots(localSnapshot,data.state):localSnapshot;
  const currentSnapshot=cloneState(state);if((Number(currentSnapshot.syncRevision)||0)!==startRevision)merged=mergeSnapshots(merged,currentSnapshot);
  const remoteState=data?.state&&typeof data.state==='object'?migrate(data.state):null;const differsFromCloud=!remoteState||JSON.stringify(comparableSave(merged))!==JSON.stringify(comparableSave(remoteState));
  merged.account=state.account;merged.lastAccountUserId=session.user.id;state=merged;const uploadRevision=Number(state.syncRevision)||0;cloudDirty=cloudDirty||differsFromCloud;
  if(!cloudDirty&&!force){lastCloudSync=Date.now();cloudLastError='';setCloudMessage('Sauvegarde cloud à jour.');return true}
  const snapshot=cloneState(state);const {error:pushError}=await sb.functions.invoke('game-sync',{body:authPayload(snapshot)});if(pushError)throw pushError;
  lastCloudSync=Date.now();cloudRetryAt=0;cloudSyncFailures=0;cloudLastError='';state.cloudMeta=Object.assign({},state.cloudMeta,{lastPushedAt:lastCloudSync});if(state.account)state.account.lastSync=lastCloudSync;
  cloudDirty=(Number(state.syncRevision)||0)!==uploadRevision;save(false);setCloudMessage(cloudDirty?'Nouveaux changements en attente de la prochaine sauvegarde.':'Sauvegarde cloud confirmée · '+new Date(lastCloudSync).toLocaleTimeString('fr-FR'));
  return true
 }catch(error){cloudSyncFailures++;cloudRetryAt=Date.now()+Math.min(90000,4000*Math.pow(2,Math.min(4,cloudSyncFailures-1)));const message=await cloudErrorMessage(error);console.warn('Cloud sync',error);setCloudMessage(message,true);if(force)toast('☁️ '+message);return false}
 finally{cloudBusy=false;renderAccount()}
}
async function restoreCloud(allowLocalMerge=true){
 if(!sb||!state.account?.userId||cloudRestoreBusy)return false;if(typeof navigator!=='undefined'&&navigator.onLine===false){cloudDirty=true;setCloudMessage('Hors ligne · ta progression reste enregistrée sur cet appareil.');return false}cloudRestoreBusy=true;const account={...state.account};
 try{
  const session=await getCloudSession();if(!session||session.user.id!==account.userId)throw new Error('session');const {data,error}=await sb.from(CLOUD_TABLE).select('state,updated_at').eq('user_id',account.userId).maybeSingle();if(error)throw error;
  if(data?.state&&typeof data.state==='object'){
   const localSnapshot=cloneState(state),remote=migrate(data.state);if(data.state.activeWorld===undefined)remote.activeWorld=selectedWorld;const merged=allowLocalMerge?mergeSnapshots(localSnapshot,remote):remote;merged.account=account;merged.lastAccountUserId=account.userId;merged.cloudMeta=Object.assign({},merged.cloudMeta,{lastPulledAt:Date.now()});
   cloudDirty=allowLocalMerge&&JSON.stringify(comparableSave(merged))!==JSON.stringify(comparableSave(remote));state=merged;save(false);lastCloudSync=Date.now();cloudRestoreDone=true;cloudLastError='';setCloudMessage(cloudDirty?'Parties réunies · envoi des changements en attente.':'Progression cloud restaurée.');render();return true
  }
  if(!allowLocalMerge&&!stateHasProgress(state)){const accountNow=state.account;state=fresh();state.account=accountNow;state.lastAccountUserId=account.userId}
  state.account=account;state.lastAccountUserId=account.userId;cloudDirty=true;save(false);cloudRestoreDone=true;setCloudMessage('Première sauvegarde de cette partie.');const pushed=await syncCloud(true);render();return pushed
 }catch(error){console.warn('Cloud restore',error);cloudDirty=true;setCloudMessage('Cloud inaccessible · ta progression locale est conservée.',true);return false}
 finally{cloudRestoreBusy=false;renderAccount()}
}
async function createAccount(){
 if(authBusy)return;if(!sb){toast('Compte indisponible pour le moment.');return}const username=document.getElementById('usernameInput').value.trim(),password=document.getElementById('passwordInput').value,email=document.getElementById('emailInput').value.trim();
 if(!/^[A-Za-z0-9_ -]{3,20}$/.test(username)){toast('Choisis un pseudo de 3 à 20 caractères.');return}if(password.length<8){toast('Le mot de passe doit contenir au moins 8 caractères.');return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast('Entre une adresse e-mail valide.');return}
 authBusy=true;renderAccount();try{const {data,error}=await sb.auth.signUp({email,password,options:{data:{username},emailRedirectTo:location.href.split('#')[0]}});if(error)throw error;if(!data.user)throw new Error('signup');markAccountCreated();if(data.session){const synced=await activateSession(data.user);toast(synced?'Compte créé · sauvegarde sécurisée activée.':'Compte créé · synchronisation en attente.')}else{const hint=document.getElementById('authHint');if(hint)hint.textContent='Compte créé. Ouvre le lien reçu par e-mail pour confirmer ton adresse et activer la synchronisation.';toast('E-mail de confirmation envoyé.')}}catch(error){toast(authErrorMessage(error))}finally{authBusy=false;renderAccount()}
}
async function loginAccount(){
 if(authBusy)return;if(!sb){toast('Compte indisponible pour le moment.');return}const email=document.getElementById('emailInput').value.trim(),password=document.getElementById('passwordInput').value;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<8){toast('Entre ton adresse e-mail et ton mot de passe.');return}
 authBusy=true;renderAccount();try{const {data,error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;if(!data.user)throw new Error('login');const synced=await activateSession(data.user);toast(synced?'Connexion réussie · progression vérifiée.':'Connecté · sauvegarde locale conservée, cloud en attente.')}catch(error){toast(authErrorMessage(error))}finally{authBusy=false;renderAccount()}
}
async function recoverPassword(){if(!sb){toast('Compte indisponible pour le moment.');return}const email=document.getElementById('emailInput').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast('Entre ton adresse e-mail pour recevoir le lien.');return}try{const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.href.split('#')[0]});if(error)throw error;const hint=document.getElementById('authHint');if(hint)hint.textContent='Si cette adresse correspond à un compte, un lien de réinitialisation vient d’être envoyé.';toast('Consulte ta boîte e-mail pour réinitialiser le mot de passe.')}catch(error){toast(authErrorMessage(error))}}
async function saveNewPassword(){const password=document.getElementById('newPasswordInput').value;if(password.length<8){toast('Choisis un mot de passe d’au moins 8 caractères.');return}try{const {data,error}=await sb.auth.updateUser({password});if(error)throw error;passwordRecoveryMode=false;document.getElementById('newPasswordInput').value='';if(data?.user)await activateSession(data.user);toast('Mot de passe mis à jour.')}catch(error){toast(authErrorMessage(error))}finally{renderAccount()}}
async function loadLeaderboard(force=false){
 const box=document.getElementById('leaderboardList');if(!box||!sb||leaderboardBusy||(!force&&Date.now()-lastLeaderboard<30000))return;leaderboardBusy=true;box.innerHTML='<p class="hint">Chargement du classement…</p>';
 try{const {data,error}=await sb.from('leaderboard').select('nickname,total,prestige,level,planet').order('total',{ascending:false}).order('prestige',{ascending:false}).order('level',{ascending:false}).limit(10);if(error)throw error;lastLeaderboard=Date.now();const visibleRows=(data||[]).filter(player=>String(player.nickname||'').trim().toLowerCase()!=='admin'&&!(String(state.account?.email||'').toLowerCase()===ADMIN_EMAIL&&String(player.nickname||'').trim().toLowerCase()===String(state.account?.username||'').trim().toLowerCase()));box.innerHTML=visibleRows.length?visibleRows.map((player,index)=>{const worldIndex=Math.max(0,Math.min(WORLDS.length-1,Math.floor(Number(player.planet||1))-1));const planet=WORLDS[worldIndex][1];const galaxyIndex=Math.max(0,Math.min(GALAXIES.length-1,Math.floor(worldIndex/32)));const galaxy=GALAXIES[galaxyIndex];return `<div class="rank-row"><b>#${index+1}</b><span>${escapeHTML(player.nickname||'Mineur')}</span><strong>${fmt(Number(player.total||0))}</strong><small>P${player.prestige||0} · N${player.level||1} · ${escapeHTML(galaxy.icon)} ${escapeHTML(galaxy.name)} · ${escapeHTML(planet)}</small></div>`}).join(''):'<p class="hint">Aucun commandant classé pour le moment.</p>'}catch(error){box.innerHTML='<p class="hint">Classement momentanément indisponible.</p>';console.warn('Leaderboard',error)}finally{leaderboardBusy=false}
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
async function logout(){
 if(!state.account)return;
 const account={...state.account};
 let syncFailed=false;
 if(cloudDirty){
  try{
   const session=await getCloudSession();
   if(session?.user?.id===account.userId)syncFailed=!(await syncCloud(true));
  }catch{syncFailed=true}
 }
 try{if(sb){const {error}=await sb.auth.signOut({scope:'local'});if(error)throw error}}
 catch(error){console.warn('Local sign out',error)}
 state.lastAccountUserId=account.userId||state.lastAccountUserId;
 state.account=null;
 save(false);
 render();
 toast(syncFailed?'Déconnecté · progression conservée sur cet appareil; synchronisation à reprendre à la prochaine connexion.':'Déconnexion · progression conservée localement');
}
function buyBuilding(b){const c=cost(selectedWorld,b);if(state.money<c){toast('Crédits insuffisants');return}spend(c);const k=selectedWorld+'-'+b;state.buildings[k]=(state.buildings[k]||0)+1;state.xp+=20;save();render()}
function buyTech(id){let t=null;for(const br of BRANCH_ORDER){const found=BRANCHES[br].find(x=>x[0]===id);if(found){t=found;break}}if(!t||techOwned(id)||state.money<t[2])return;const br=BRANCH_ORDER.find(k=>BRANCHES[k].some(x=>x[0]===id));const arr=BRANCHES[br],idx=arr.findIndex(x=>x[0]===id);if(idx>0&&!techOwned(arr[idx-1][0])){toast('Technologie précédente requise');return}spend(t[2]);state.research[id]=true;state.xp+=500;save();toast('Technologie acquise');render()}
function spawnClickFx(amount,critical=false){
 const box=document.getElementById('clickFx');if(!box)return;
 const e=document.createElement('span');e.className='click-pop'+(critical?' critical':'');e.textContent='+'+fmt(amount)+(critical?' ✦':'');
 e.style.left=(42+Math.random()*16)+'%';e.style.top=(42+Math.random()*16)+'%';box.appendChild(e);setTimeout(()=>e.remove(),850);
}
function mine(){
 const now=Date.now();
 if(now-(state.lastClickAt||0)>2200)state.clickStreak=0;
 state.clickStreak=Math.min(30,state.clickStreak+1);state.lastClickAt=now;
 const combo=Math.min(3,1+Math.floor(state.clickStreak/10));
 const critical=Math.random()<0.035;
 const amount=clickPower()*combo*(critical?5:1);
 earn(amount);state.clicks++;
 if(state.clicks%100===0){state.clickMilestones++;earn(clickPower()*10);toast('🎯 Palier de forage : bonus +'+fmt(clickPower()*10));}
 spawnClickFx(amount,critical);save();render();
 document.getElementById('mineBtn')?.animate([{transform:'scale(1)'},{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:130});
}
function claim(id,type){
  ensureMissionState();
  if(type==='daily'){
    const i=Number(id.slice(1));
    const ds=dailySet();
    if(!ds[i]){toast('Mission quotidienne introuvable');return;}
    if(!state.daily.claimed.includes(i)&&dailyValue(ds[i])>=ds[i][2]){
      state.daily.claimed.push(i);
      earn(DAILY_REWARDS[i]);
      save();render();toast('📅 Mission quotidienne : +'+fmt(DAILY_REWARDS[i]));
    }
  }else if(type==='weekly'){
    const i=WEEKLY.findIndex(x=>x[0]===id);
    if(i<0){toast('Mission hebdomadaire introuvable');return;}
    if(!state.weekly.claimed.includes(i)&&weeklyValue(WEEKLY[i])>=WEEKLY[i][3]){
      state.weekly.claimed.push(i);
      earn(WEEKLY[i][4]);
      save();render();toast('📆 Mission hebdomadaire : +'+fmt(WEEKLY[i][4]));
    }
  }else{
    const m=CAMPAIGN.find(x=>x[0]===id);
    if(m&&!state.campaignClaimed.includes(id)&&missionValue(m)>=m[3]){
      state.campaignClaimed.push(id);
      earn(m[4]);
      save();render();toast('📜 Mission de campagne : +'+fmt(m[4]));
    }else if(m){
      toast('🎯 Objectif de campagne pas encore terminé');
    }
  }
}
function claimAchievement(id){
  ensureMissionState();
  const a=ACHIEVEMENTS.find(x=>x[0]===id);
  if(!a||state.achievementClaimed.includes(id)||achievementValue(a)<a[4])return;
  state.achievementClaimed.push(id);
  earn(a[5]);
  save();
  render();
  toast('🏅 Succès : '+a[1]+' · +'+fmt(a[5]));
}
function prestige(){
 const target=ascensionTarget(),g=currentGalaxy();
 if(!ascensionReady()){toast('Ascension impossible : vérifie les 32 planètes et les 10 bâtiments de chaque type.');return}
 if(state.runTotal<target){toast('Argent insuffisant pour l’ascension.');return}
 if(!window.confirm(`Confirmer l’ascension de ${GALAXIES[g].name} ?\n\nTu recevras ${ascensionPointReward()} point(s) d’ascension.\n${g<2?'La galaxie suivante sera débloquée.':'Tu renforces ta progression permanente.'}\n\nL’argent, les bâtiments et les recherches seront réinitialisés. Les succès, le compte et les bonus permanents seront conservés.`))return;
 const completedBuildings=Object.fromEntries(Object.entries(state.buildings||{}).filter(([key])=>Number(key.split('-')[0])<g*32));
 const keep={buildings:completedBuildings,lifetimeTotal:state.lifetimeTotal,prestige:state.prestige+1,crystals:state.crystals,ascensionPoints:(state.ascensionPoints||0)+ascensionPointReward(),galaxiesUnlocked:Math.max(state.galaxiesUnlocked||1,Math.min(3,g+2)),ascensionUpgrades:{...(state.ascensionUpgrades||{})},research:{},xp:state.xp,level:state.level,clicks:state.clicks,spent:state.spent,account:state.account,achievements:[...state.achievements],achievementClaimed:[...(state.achievementClaimed||[])],quests:JSON.parse(JSON.stringify(state.quests||{})),campaignClaimed:[...(state.campaignClaimed||[])],lastAccountUserId:state.lastAccountUserId};
 state=Object.assign(fresh(),keep);state.buildings=Object.assign(state.buildings,completedBuildings);ensureQuests();
 for(const q of QUESTS)if(['build','rate','world','planetbuild'].includes(q[3])){const slot=state.quests[q[0]];if(q[3]==='planetbuild')slot.baseByWorld={};else slot.base=questRawValue(q)}
 selectedWorld=Math.min(95,Math.min(2,state.galaxiesUnlocked-1)*32);state.activeWorld=selectedWorld;localStorage.setItem('sm-v2-world',selectedWorld);
 save();toast('Ascension réussie · bonus permanents conservés');render();
}

// Gérer explicitement les accordéons contrôlés par le rendu dynamique.
// Empêche le navigateur de les refermer lorsque render() reconstruit le DOM.
document.addEventListener('click', e => {
 const summary = e.target.closest('summary');
 if (!summary) return;
 const details = summary.closest('details');
 if (!details) return;
 let store = null;
 if (details.classList.contains('tech-branch')) store = openTechAccordions;
 else if (details.classList.contains('mission-group')) store = openMissionAccordions;
 else if (details.id === 'halloween-boost-shop') store = openHalloweenAccordions;
 if (!store) return;
 e.preventDefault();
 if (store.has(details.id)) store.delete(details.id); else store.add(details.id);
 render();
}, true);

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-halloween-enter')){if(!halloweenActive())return;state.halloween.selected=true;state.halloween.planet=Math.max(0,Math.min(9,Number(state.halloween.planet)||0));save();nav('buildings');return;}if(b.hasAttribute('data-halloween-exit')){state.halloween.selected=false;save();nav('sectors');return;}if(b.dataset.halloweenPlanet!==undefined){const p=Number(b.dataset.halloweenPlanet);if(!halloweenPlanetUnlocked(p)){toast('Planète verrouillée : achète les 4 bâtiments de la planète précédente.');return;}state.halloween.planet=Math.max(0,Math.min(9,p));save();render();return;}if(b.hasAttribute('data-halloween-mission')){claimHalloweenMission(b.dataset.halloweenMission);return;}if(b.id==='halloweenCandyBtn'){halloweenClickCandy();return;}if(b.dataset.hallowBuy!==undefined){halloweenBuyBuilding(Number(b.dataset.hallowBuy));return;}if(b.dataset.hallowBoost){halloweenBuyBoost(b.dataset.hallowBoost);return;}if(b.dataset.adminAction){runAdminAction(b.dataset.adminAction);return;}if(b.id==='reminderLater'){dismissAccountReminder();return}if(b.id==='reminderCreateAccount'||b.id==='reminderLoginAccount'){closeAccountReminder();nav('account');document.getElementById('emailInput')?.focus({preventScroll:true});return}if(b.dataset.nav){nav(b.dataset.nav);return}if(b.dataset.ascUpgrade){buyAscensionUpgrade(b.dataset.ascUpgrade);return}if(b.dataset.galaxy!==undefined){state.halloween.selected=false;const g=Number(b.dataset.galaxy);if(g<state.galaxiesUnlocked){selectedWorld=g*32;state.activeWorld=selectedWorld;localStorage.setItem('sm-v2-world',selectedWorld);save();render()}return}if(b.id==='mineBtn'){mine();return}if(b.dataset.buy!==undefined){buyBuilding(Number(b.dataset.buy));return}if(b.dataset.tech){buyTech(b.dataset.tech);return}if(b.dataset.quest){claimQuest(b.dataset.quest,b.dataset.questLevel);return}if(b.dataset.claim){claim(b.dataset.claim,b.dataset.claimType);return}if(b.dataset.achievement){claimAchievement(b.dataset.achievement);return}if(b.dataset.mtab){missionTab=b.dataset.mtab;document.querySelectorAll('[data-mtab]').forEach(x=>x.classList.toggle('active',x===b));renderMissions();return}if(b.id==='prestigeBtn'){prestige();return}if(b.id==='createAccount'){createAccount();return}if(b.id==='loginAccount'){loginAccount();return}if(b.id==='logoutAccount'){logout();return}if(b.id==='recoverPassword'){recoverPassword();return}if(b.id==='saveNewPassword'){saveNewPassword();return}if(b.id==='cancelPasswordRecovery'){passwordRecoveryMode=false;renderAccount();return}if(b.id==='forceSync'){syncCloud(true).then(ok=>{if(ok)toast('☁️ Sauvegarde synchronisée')});return}});
setInterval(()=>{ensureDaily();ensureWeekly();ensureQuests();halloweenTick();checkEvent();checkAchievements();if(state.clickStreak&&Date.now()-state.lastClickAt>2200){state.clickStreak=0;}const passiveGain=autoRate()/4;if(passiveGain>0){earn(passiveGain);save(true)}else save(false);if(document.visibilityState==='visible')render();},250);
setInterval(()=>{if(state.account)syncCloud(false)},1000);
if(sb){sb.auth.onAuthStateChange((_event,session)=>{adminVerified=String(session?.user?.email||'').toLowerCase()===ADMIN_EMAIL&&String(session?.user?.id||'')===String(state.account?.userId||'');renderAccount()});verifyAdminSession().then(()=>renderAccount())}
window.addEventListener('online',()=>{if(state.account){cloudLastError='';cloudRetryAt=0;setCloudMessage('Connexion rétablie · synchronisation en cours.');syncCloud(true)}});
window.addEventListener('offline',()=>{if(state.account)setCloudMessage('Hors ligne · les changements restent en attente.')});
if(sb)sb.auth.onAuthStateChange((event,session)=>{
 if(event==='PASSWORD_RECOVERY'){passwordRecoveryMode=true;renderAccount();return}
 if(event==='INITIAL_SESSION'&&!session&&state.account){state.lastAccountUserId=state.account.userId||state.lastAccountUserId||null;state.account=null;cloudDirty=false;cloudRestoreDone=true;cloudRetryAt=0;cloudLastError='';save(false);setCloudMessage('Session expirée · reconnecte-toi. Ta progression reste sauvegardée sur cet appareil.');render();return}
 if(event==='SIGNED_OUT'){
  if(state.account)state.lastAccountUserId=state.account.userId;state.account=null;cloudRestoreDone=false;cloudDirty=false;cloudRetryAt=0;cloudLastError='';setCloudMessage('Déconnecté · progression conservée sur cet appareil.');save(false);render();return
 }
 if(session?.user&&(!state.account||state.account.userId!==session.user.id||(event==='INITIAL_SESSION'&&!cloudRestoreDone)))setTimeout(()=>activateSession(session.user),0)
});ensureQuests();const offlineGain=claimOffline();if(!state.event.nextAt)scheduleEvent();checkEvent();checkAchievements();render();setTimeout(openAccountReminder,1400);

document.addEventListener('visibilitychange',()=>{
 if(document.hidden){state.lastAt=Date.now();save();if(state.account)syncCloud(true)}
 else{const gain=claimOffline();checkEvent();checkAchievements();render();if(gain>0)toast('🌙 Revenu hors-ligne : +'+fmt(gain))}
});
window.addEventListener('pagehide',()=>{state.lastAt=Date.now();save();if(state.account)syncCloud(true)});


/* V2.5 mobile: prevent accidental double-tap page zoom while preserving scrolling. */
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
