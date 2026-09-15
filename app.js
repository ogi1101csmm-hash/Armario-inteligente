const DB_NAME='smartWardrobeDB', DB_VERSION=1;
const STORE_GARMENTS='garments', STORE_LOOKS='looks';
let db;
let state={garments:[],looks:[],currentOutfit:null,filter:'Todos'};

const CATEGORIES=['Camiseta','Polo','Camisa','Jersey','Sudadera','Chaqueta','Cazadora','Abrigo','Pantalón','Vaquero','Chino','Cargo','Short','Zapatillas','Accesorio'];
const COLORS=['Blanco','Negro','Gris','Beige','Crema','Camel','Marrón','Azul marino','Azul','Azul claro','Verde oliva','Verde','Burdeos','Rojo','Rosa','Amarillo','Naranja','Morado','Denim'];
const STYLES=['Casual','Smart casual','Formal','Sport','Streetwear'];
const SEASONS=['Todo el año','Primavera/Verano','Otoño/Invierno'];
const OCCASIONS=['Diario','Trabajo','Cena','Salir','Evento','Viaje','Deporte'];
const TEMPS=['Frío','Templado','Calor'];

const COLOR_FAMILY={
 'Blanco':'neutral','Negro':'neutral','Gris':'neutral','Beige':'neutral','Crema':'neutral','Camel':'earth','Marrón':'earth',
 'Azul marino':'blue','Azul':'blue','Azul claro':'blue','Denim':'blue','Verde oliva':'earth','Verde':'green','Burdeos':'wine','Rojo':'warm','Rosa':'warm','Amarillo':'warm','Naranja':'warm','Morado':'purple'
};
const FRIENDLY={
 neutral:['neutral','blue','earth','green','wine','warm','purple'],
 blue:['neutral','blue','earth','green','wine'],
 earth:['neutral','blue','earth','green','wine'],
 green:['neutral','earth','blue','green'],
 wine:['neutral','blue','earth','wine'],
 warm:['neutral','blue','warm'],
 purple:['neutral','blue','purple']
};

function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains(STORE_GARMENTS))d.createObjectStore(STORE_GARMENTS,{keyPath:'id'});if(!d.objectStoreNames.contains(STORE_LOOKS))d.createObjectStore(STORE_LOOKS,{keyPath:'id'});};r.onsuccess=e=>{db=e.target.result;resolve(db)};r.onerror=()=>reject(r.error);});}
function getAll(store){return new Promise((resolve,reject)=>{const r=db.transaction(store,'readonly').objectStore(store).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);});}
function put(store,obj){return new Promise((resolve,reject)=>{const r=db.transaction(store,'readwrite').objectStore(store).put(obj);r.onsuccess=()=>resolve(obj);r.onerror=()=>reject(r.error);});}
function del(store,id){return new Promise((resolve,reject)=>{const r=db.transaction(store,'readwrite').objectStore(store).delete(id);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);});}
function clearStore(store){return new Promise((resolve,reject)=>{const r=db.transaction(store,'readwrite').objectStore(store).clear();r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);});}
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2);
const escapeHTML=s=>(s??'').toString().replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function navigate(view){$$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===view));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.nav===view));$('#pageTitle').textContent={home:'Inicio',wardrobe:'Mi armario',generator:'Crear outfit',favorites:'Favoritos',history:'Historial',settings:'Ajustes'}[view]||'Mi Armario';window.scrollTo({top:0,behavior:'smooth'});if(view==='wardrobe')renderWardrobe();if(view==='favorites')renderFavorites();if(view==='history')renderHistory();}

async function compressImage(file,max=1200,quality=.78){return new Promise((resolve,reject)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{let w=img.width,h=img.height;if(Math.max(w,h)>max){const r=max/Math.max(w,h);w*=r;h*=r;}const c=document.createElement('canvas');c.width=Math.round(w);c.height=Math.round(h);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);resolve(c.toDataURL('image/jpeg',quality));};img.onerror=reject;img.src=url;});}

function setupOptions(){
 $('#garmentCategory').innerHTML=CATEGORIES.map(x=>`<option>${x}</option>`).join('');
 $('#garmentColor').innerHTML=COLORS.map(x=>`<option>${x}</option>`).join('');
 $('#garmentStyle').innerHTML=STYLES.map(x=>`<option>${x}</option>`).join('');
 $('#garmentSeason').innerHTML=SEASONS.map(x=>`<option>${x}</option>`).join('');
 $('#garmentOccasions').innerHTML=OCCASIONS.map(x=>`<button type="button" class="check-chip" data-value="${x}">${x}</button>`).join('');
 $('#occasionOptions').innerHTML=OCCASIONS.filter(x=>x!=='Deporte').map((x,i)=>`<button type="button" class="segment ${i===0?'active':''}" data-value="${x}">${x}</button>`).join('');
 $('#temperatureOptions').innerHTML=TEMPS.map((x,i)=>`<button type="button" class="segment ${i===1?'active':''}" data-value="${x}">${x}</button>`).join('');
 $('#styleOptions').innerHTML=STYLES.map((x,i)=>`<button type="button" class="segment ${i===0?'active':''}" data-value="${x}">${x}</button>`).join('');
 $('#categoryChips').innerHTML=['Todos',...CATEGORIES].map((x,i)=>`<button class="chip ${i===0?'active':''}" data-cat="${x}">${x}</button>`).join('');
 bindSegments();
}
function bindSegments(){
 $$('.segmented').forEach(group=>group.addEventListener('click',e=>{const b=e.target.closest('.segment');if(!b)return;group.querySelectorAll('.segment').forEach(x=>x.classList.remove('active'));b.classList.add('active');}));
 $('#garmentOccasions').addEventListener('click',e=>{const b=e.target.closest('.check-chip');if(b)b.classList.toggle('active')});
 $('#categoryChips').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;state.filter=b.dataset.cat;$$('#categoryChips .chip').forEach(x=>x.classList.toggle('active',x===b));renderWardrobe();});
}

function renderHome(){
 $('#statGarments').textContent=state.garments.length;
 $('#statFavorites').textContent=state.looks.filter(x=>x.favorite).length;
 $('#statLooks').textContent=state.looks.filter(x=>x.wornAt).length;
 const last=state.looks.filter(x=>x.wornAt).sort((a,b)=>new Date(b.wornAt)-new Date(a.wornAt))[0];
 $('#lastOutfit').innerHTML=last?lookCardHTML(last,true):'Todavía no has guardado ningún outfit.';
 refreshRequiredGarments();
}
function refreshRequiredGarments(){const current=$('#requiredGarment').value;$('#requiredGarment').innerHTML='<option value="">Ninguna</option>'+state.garments.map(g=>`<option value="${g.id}">${escapeHTML(g.name)}</option>`).join('');$('#requiredGarment').value=state.garments.some(g=>g.id===current)?current:'';}

function renderWardrobe(){
 const q=$('#wardrobeSearch').value.trim().toLowerCase();
 const filtered=state.garments.filter(g=>(state.filter==='Todos'||g.category===state.filter)&&(!q||`${g.name} ${g.category} ${g.color}`.toLowerCase().includes(q)));
 $('#wardrobeGrid').innerHTML=filtered.length?filtered.map(g=>`<article class="garment-card ${g.clean?'':'dirty-card'}" data-id="${g.id}"><img src="${g.photo}" alt="${escapeHTML(g.name)}"><div class="garment-meta"><b>${escapeHTML(g.name)}</b><small><span class="status-dot ${g.clean?'':'dirty'}"></span>${escapeHTML(g.color)} · ${escapeHTML(g.category)}</small></div></article>`).join(''):`<div class="empty-card" style="grid-column:1/-1">${state.garments.length?'No hay prendas con este filtro.':'Añade tu primera prenda con una foto.'}</div>`;
}


function rgbToHsl(r,g,b){
 r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0;const l=(max+min)/2;
 if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h*=60;}
 return {h,s:s*100,l:l*100};
}
function hueDistance(a,b){const d=Math.abs(a-b)%360;return d>180?360-d:d;}
function colorInfoFromName(name){
 const map={
  'Blanco':'#f5f5f2','Negro':'#1d1d1d','Gris':'#8f9298','Beige':'#d7c2a2','Crema':'#eee2c8','Camel':'#b68655','Marrón':'#7e5b42','Azul marino':'#23334e','Azul':'#3d7be0','Azul claro':'#9ad0ff','Denim':'#4f77a7','Verde oliva':'#687744','Verde':'#3d9b5d','Burdeos':'#7e3143','Rojo':'#c74b4b','Rosa':'#e28bb4','Amarillo':'#d9bc42','Naranja':'#dd8d3d','Morado':'#7a58a8'
 };
 const hex=map[name]||'#888888',v=parseInt(hex.slice(1),16),r=(v>>16)&255,g=(v>>8)&255,b=v&255;return {...rgbToHsl(r,g,b),hex,name};
}
function isNeutralColor(c){return c.s<22||c.l<15||c.l>88||['Blanco','Negro','Gris','Beige','Crema','Azul marino','Denim','Verde oliva'].includes(c.name);}
function inferColorName(c){
 if(c.l>90)return'Blanco';if(c.l<17)return'Negro';if(c.s<14)return'Gris';
 if(c.h>=25&&c.h<50&&c.l>65)return c.l>82?'Crema':'Beige';
 if(c.h>=20&&c.h<45&&c.l<65)return c.l<40?'Marrón':'Camel';
 if(c.h>=200&&c.h<245&&c.l<35)return'Azul marino';
 if(c.h>=200&&c.h<250)return c.l>65?'Azul claro':'Azul';
 if(c.h>=75&&c.h<115)return'Verde oliva';if(c.h>=95&&c.h<165)return'Verde';
 if(c.h>=330||c.h<12)return c.l<45?'Burdeos':'Rojo';
 if(c.h>=300&&c.h<330)return'Rosa';if(c.h>=45&&c.h<70)return'Amarillo';if(c.h>=12&&c.h<45)return'Naranja';if(c.h>=250&&c.h<300)return'Morado';
 return'Gris';
}
async function extractPaletteFromDataUrl(src){
 const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src});
 const c=document.createElement('canvas'),size=64;c.width=size;c.height=size;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,size,size);const data=x.getImageData(0,0,size,size).data;const bins=new Map();
 for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];if(a<180)continue;const hsl=rgbToHsl(r,g,b);if(hsl.l<5||hsl.l>98)continue;const key=`${Math.round(hsl.h/18)*18}|${Math.round(hsl.s/10)*10}|${Math.round(hsl.l/10)*10}`;bins.set(key,(bins.get(key)||0)+1);}
 const list=[...bins.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,count])=>{const [h,s,l]=k.split('|').map(Number);return{h,s,l,count,name:inferColorName({h,s,l})}});
 const primary=list[0]||colorInfoFromName('Gris');const secondary=list.find(v=>hueDistance(v.h,primary.h)>20||Math.abs(v.l-primary.l)>14)||list[1]||primary;const accent=list.find(v=>v.s>45&&!isNeutralColor({...v,name:v.name}))||list[2]||secondary;
 return{primary,secondary,accent};
}
function paletteCompatibility(items){
 const colors=items.map(g=>g.palette?.primary?{...g.palette.primary,name:g.color}:colorInfoFromName(g.color));
 const strong=colors.filter(c=>!isNeutralColor(c)&&c.s>42);let score=0;
 if(colors.filter(isNeutralColor).length>=2)score+=18;
 if(strong.length===0)score+=14;
 if(strong.length===1)score+=20;
 if(strong.length>=2){let min=999;for(let i=0;i<strong.length;i++)for(let j=i+1;j<strong.length;j++)min=Math.min(min,hueDistance(strong[i].h,strong[j].h));if(min<=28)score+=6;else if(min>=145&&min<=215)score-=8;else score-=24;}
 const top=colors[0],bottom=colors[1],shoes=colors[2];if(bottom&&isNeutralColor(bottom))score+=10;if(shoes&&isNeutralColor(shoes))score+=8;if(top&&shoes&&!isNeutralColor(top)&&!isNeutralColor(shoes)&&hueDistance(top.h,shoes.h)>70&&top.s>45&&shoes.s>45)score-=20;
 return score;
}

function openGarmentForm(g=null){
 $('#garmentForm').reset();$('#garmentId').value=g?.id||'';$('#garmentModalTitle').textContent=g?'Editar prenda':'Añadir prenda';
 $('#garmentName').value=g?.name||'';$('#garmentCategory').value=g?.category||CATEGORIES[0];$('#garmentColor').value=g?.color||COLORS[0];$('#garmentStyle').value=g?.style||STYLES[0];$('#garmentSeason').value=g?.season||SEASONS[0];$('#garmentClean').checked=g?.clean??true;
 $$('#garmentOccasions .check-chip').forEach(b=>b.classList.toggle('active',g?.occasions?.includes(b.dataset.value)??false));
 if(g?.photo){$('#photoPreview').src=g.photo;$('#photoPreview').classList.remove('hidden');$('#photoPlaceholder').classList.add('hidden');}else{$('#photoPreview').classList.add('hidden');$('#photoPlaceholder').classList.remove('hidden');}
 $('#garmentPhoto').value='';$('#garmentDialog').dataset.palette=g?.palette?JSON.stringify(g.palette):'';$('#garmentDialog').showModal();
}
async function saveGarment(e){
 e.preventDefault(); const id=$('#garmentId').value||uid(); const existing=state.garments.find(x=>x.id===id); let photo=existing?.photo||''; const file=$('#garmentPhoto').files[0]; if(file)photo=await compressImage(file); if(!photo){toast('Añade una foto de la prenda');return;}
 const palette=$('#garmentDialog').dataset.palette?JSON.parse($('#garmentDialog').dataset.palette):existing?.palette||null; const g={id,name:$('#garmentName').value.trim(),category:$('#garmentCategory').value,color:$('#garmentColor').value,style:$('#garmentStyle').value,season:$('#garmentSeason').value,occasions:$$('#garmentOccasions .check-chip.active').map(b=>b.dataset.value),clean:$('#garmentClean').checked,photo,palette,createdAt:existing?.createdAt||new Date().toISOString(),lastWorn:existing?.lastWorn||null,useCount:existing?.useCount||0};
 await put(STORE_GARMENTS,g);await reload();$('#garmentDialog').close();toast(existing?'Prenda actualizada':'Prenda añadida');
}
function openGarmentDetail(id){const g=state.garments.find(x=>x.id===id);if(!g)return;$('#garmentDetail').innerHTML=`<img class="detail-photo" src="${g.photo}" alt="${escapeHTML(g.name)}"><h2 style="margin-top:14px">${escapeHTML(g.name)}</h2><div class="detail-tags"><span class="tag">${g.category}</span><span class="tag">${g.color}</span><span class="tag">${g.style}</span><span class="tag">${g.season}</span><span class="tag">${g.clean?'✓ Limpia':'Por lavar'}</span></div><p class="muted small">${(g.occasions||[]).length?'Ideal para: '+g.occasions.join(', '):'Sin ocasiones configuradas.'}</p><div class="detail-actions"><button class="secondary" data-detail="toggleClean" data-id="${g.id}">${g.clean?'Marcar usada':'Marcar limpia'}</button><button class="secondary" data-detail="edit" data-id="${g.id}">Editar</button><button class="danger" data-detail="delete" data-id="${g.id}">Eliminar</button></div>`;$('#garmentDetailDialog').showModal();}

function seasonMatches(g,temp){if(g.season==='Todo el año')return true;if(temp==='Calor')return g.season==='Primavera/Verano';if(temp==='Frío')return g.season==='Otoño/Invierno';return true;}
function categorySlot(cat){if(['Camiseta','Polo','Camisa','Jersey','Sudadera'].includes(cat))return'top';if(['Pantalón','Vaquero','Chino','Cargo','Short'].includes(cat))return'bottom';if(cat==='Zapatillas')return'shoes';if(['Chaqueta','Cazadora','Abrigo'].includes(cat))return'outer';if(cat==='Accesorio')return'accessory';return'other';}
function colorPairScore(a,b){const fa=COLOR_FAMILY[a]||'neutral',fb=COLOR_FAMILY[b]||'neutral';if(a===b)return 7;if(fa==='neutral'||fb==='neutral')return 10;if(FRIENDLY[fa]?.includes(fb))return 8;return 2;}
function outfitColorScore(items){if(items.length<2)return 10;let total=0,n=0;for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){total+=colorPairScore(items[i].color,items[j].color);n++;}return total/n;}
function garmentScore(g,{occasion,temp,style,onlyClean,avoidRecent}){let s=0;if(onlyClean&&!g.clean)return -999;if(!seasonMatches(g,temp))s-=15;else s+=8;if((g.occasions||[]).includes(occasion))s+=16;if(g.style===style)s+=12;else if((style==='Smart casual'&&['Casual','Formal'].includes(g.style))||(style==='Casual'&&g.style==='Smart casual'))s+=5;if(avoidRecent&&g.lastWorn){const days=(Date.now()-new Date(g.lastWorn).getTime())/86400000;if(days<2)s-=18;else if(days<5)s-=8;}s-=Math.min(g.useCount||0,20)*.15;return s;}
function weightedPick(arr,ctx,exclude=[]){const candidates=arr.filter(x=>!exclude.includes(x.id)).map(g=>({g,s:garmentScore(g,ctx)+Math.random()*8})).filter(x=>x.s>-900).sort((a,b)=>b.s-a.s);if(!candidates.length)return null;const top=candidates.slice(0,Math.min(5,candidates.length));return top[Math.floor(Math.random()*top.length)].g;}
function generateOutfit(forceRandom=false){
 if(state.garments.length<3){toast('Añade al menos 3 prendas para generar un outfit');return;}
 const occasion=$('#occasionOptions .segment.active')?.dataset.value||'Diario',temp=$('#temperatureOptions .segment.active')?.dataset.value||'Templado',style=$('#styleOptions .segment.active')?.dataset.value||'Casual',onlyClean=$('#onlyClean').checked,avoidRecent=$('#avoidRecent').checked;
 const ctx={occasion,temp,style,onlyClean,avoidRecent}; const requiredId=forceRandom?'':$('#requiredGarment').value; const required=state.garments.find(g=>g.id===requiredId); if(required&&onlyClean&&!required.clean){toast('La prenda obligatoria está marcada como usada');return;}
 const pools={};state.garments.forEach(g=>(pools[categorySlot(g.category)]??=[]).push(g)); let items=[];if(required)items.push(required);
 const slots=['top','bottom','shoes']; if(temp==='Frío'||(temp==='Templado'&&Math.random()>.45))slots.push('outer');
 for(const slot of slots){if(items.some(x=>categorySlot(x.category)===slot))continue;let pick=weightedPick(pools[slot]||[],ctx,items.map(x=>x.id));if(pick)items.push(pick);}
 if((pools.accessory||[]).length&&Math.random()>.65&&!items.some(x=>categorySlot(x.category)==='accessory')){const p=weightedPick(pools.accessory,ctx,items.map(x=>x.id));if(p)items.push(p);}
 if(items.length<3){toast('Faltan categorías básicas. Añade parte de arriba, pantalón y zapatillas.');return;}
 // improve colors by retries
 let best=items,bestColor=outfitColorScore(items)+paletteCompatibility(items)/10;for(let r=0;r<40;r++){let trial=required?[required]:[];for(const slot of slots){if(trial.some(x=>categorySlot(x.category)===slot))continue;const p=weightedPick(pools[slot]||[],ctx,trial.map(x=>x.id));if(p)trial.push(p);}if(trial.length>=3){const cs=outfitColorScore(trial)+paletteCompatibility(trial)/10;if(cs>bestColor){best=trial;bestColor=cs;}}}
 const fit=best.map(g=>garmentScore(g,ctx)).reduce((a,b)=>a+b,0)/best.length;const score=Math.max(68,Math.min(98,Math.round(68+bestColor*2+Math.max(0,fit)/8)));
 state.currentOutfit={id:uid(),garmentIds:best.map(x=>x.id),occasion,temp,style,score,createdAt:new Date().toISOString(),favorite:false,wornAt:null};renderCurrentOutfit();
}
function renderCurrentOutfit(){const o=state.currentOutfit;if(!o)return;const gs=o.garmentIds.map(id=>state.garments.find(g=>g.id===id)).filter(Boolean);$('#outfitTitle').textContent=`${o.occasion} · ${o.style}`;$('#outfitScore').textContent=`${o.score}%`;$('#outfitPhotos').innerHTML=gs.map(g=>`<article class="outfit-item"><img src="${g.photo}" alt="${escapeHTML(g.name)}"><div><b>${escapeHTML(g.name)}</b><small>${g.color} · ${g.category}</small></div></article>`).join('');const colors=[...new Set(gs.map(g=>g.color))].join(' · ');$('#outfitReason').innerHTML=`<b>Por qué funciona</b><br>Paleta: ${escapeHTML(colors)}. La combinación está equilibrada para <b>${o.occasion.toLowerCase()}</b>, con un nivel de formalidad próximo a <b>${o.style.toLowerCase()}</b> y prendas adecuadas para tiempo <b>${o.temp.toLowerCase()}</b>.`;$('#favoriteOutfitBtn').textContent=o.favorite?'♥ Favorito':'♡ Favorito';$('#outfitResult').classList.remove('hidden');$('#outfitResult').scrollIntoView({behavior:'smooth',block:'start'});}
async function saveLook({wear=false,favorite=false}={}){if(!state.currentOutfit)return;const o={...state.currentOutfit};if(wear)o.wornAt=new Date().toISOString();if(favorite)o.favorite=!o.favorite;await put(STORE_LOOKS,o);if(wear){for(const id of o.garmentIds){const g=state.garments.find(x=>x.id===id);if(!g)continue;g.lastWorn=o.wornAt;g.useCount=(g.useCount||0)+1;g.clean=false;await put(STORE_GARMENTS,g);}}state.currentOutfit=o;await reload();renderCurrentOutfit();toast(wear?'Outfit guardado como usado hoy':o.favorite?'Añadido a favoritos':'Quitado de favoritos');}

function lookCardHTML(o,compact=false){const gs=o.garmentIds.map(id=>state.garments.find(g=>g.id===id)).filter(Boolean);return `<article class="look-card"><div class="look-head"><div><b>${escapeHTML(o.occasion)} · ${escapeHTML(o.style)}</b><br><small>${new Date(o.wornAt||o.createdAt).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})}</small></div><span class="score-pill">${o.score||'—'}%</span></div><div class="look-images">${gs.map(g=>`<img src="${g.photo}" alt="${escapeHTML(g.name)}">`).join('')}</div>${compact?'':`<div class="button-row"><button class="secondary" data-look-action="reuse" data-id="${o.id}">Ver outfit</button><button class="secondary" data-look-action="favorite" data-id="${o.id}">${o.favorite?'♥ Favorito':'♡ Favorito'}</button></div>`}</article>`;}
function renderFavorites(){const xs=state.looks.filter(x=>x.favorite).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));$('#favoriteList').innerHTML=xs.length?xs.map(x=>lookCardHTML(x)).join(''):'<div class="empty-card">Todavía no has guardado ningún outfit favorito.</div>';}
function renderHistory(){const xs=state.looks.filter(x=>x.wornAt).sort((a,b)=>new Date(b.wornAt)-new Date(a.wornAt));$('#historyList').innerHTML=xs.length?xs.map(x=>lookCardHTML(x)).join(''):'<div class="empty-card">Cuando marques un outfit como “Usar hoy”, aparecerá aquí.</div>';}
async function toggleLookFavorite(id){const o=state.looks.find(x=>x.id===id);if(!o)return;o.favorite=!o.favorite;await put(STORE_LOOKS,o);await reload();renderFavorites();renderHistory();toast(o.favorite?'Añadido a favoritos':'Quitado de favoritos');}
function reuseLook(id){const o=state.looks.find(x=>x.id===id);if(!o)return;state.currentOutfit={...o,id:uid(),createdAt:new Date().toISOString(),wornAt:null};navigate('generator');renderCurrentOutfit();}

async function exportBackup(){const data={app:'Mi Armario Inteligente',version:1,exportedAt:new Date().toISOString(),garments:state.garments,looks:state.looks};const blob=new Blob([JSON.stringify(data)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`armario-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast('Backup exportado');}
async function importBackup(file){try{const data=JSON.parse(await file.text());if(!Array.isArray(data.garments)||!Array.isArray(data.looks))throw new Error();await clearStore(STORE_GARMENTS);await clearStore(STORE_LOOKS);for(const x of data.garments)await put(STORE_GARMENTS,x);for(const x of data.looks)await put(STORE_LOOKS,x);await reload();renderWardrobe();toast('Backup importado correctamente');}catch{toast('El archivo no es un backup válido');}}
async function reload(){state.garments=await getAll(STORE_GARMENTS);state.looks=await getAll(STORE_LOOKS);renderHome();}

function bindEvents(){
 document.addEventListener('click',e=>{const n=e.target.closest('[data-nav]');if(n)navigate(n.dataset.nav);const a=e.target.closest('[data-action="randomLook"]');if(a){navigate('generator');generateOutfit(true);}});
 $('#quickAddBtn').onclick=()=>openGarmentForm();$('#openAddGarment').onclick=()=>openGarmentForm();$('#closeGarmentDialog').onclick=()=>$('#garmentDialog').close();$('#garmentForm').addEventListener('submit',saveGarment);
 $('#garmentPhoto').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;const img=await compressImage(f);$('#photoPreview').src=img;$('#photoPreview').classList.remove('hidden');$('#photoPlaceholder').classList.add('hidden');try{const palette=await extractPaletteFromDataUrl(img);$('#garmentDialog').dataset.palette=JSON.stringify(palette);const detected=palette.primary.name;if(COLORS.includes(detected))$('#garmentColor').value=detected;}catch(err){console.warn('No se pudo analizar la paleta',err);}});
 $('#wardrobeSearch').addEventListener('input',renderWardrobe);$('#wardrobeGrid').addEventListener('click',e=>{const c=e.target.closest('.garment-card');if(c)openGarmentDetail(c.dataset.id)});
 $('#garmentDetail').addEventListener('click',async e=>{const b=e.target.closest('[data-detail]');if(!b)return;const g=state.garments.find(x=>x.id===b.dataset.id);if(!g)return;if(b.dataset.detail==='edit'){$('#garmentDetailDialog').close();openGarmentForm(g);}if(b.dataset.detail==='toggleClean'){g.clean=!g.clean;await put(STORE_GARMENTS,g);await reload();$('#garmentDetailDialog').close();renderWardrobe();toast(g.clean?'Marcada como limpia':'Marcada como usada');}if(b.dataset.detail==='delete'&&confirm(`¿Eliminar “${g.name}”?`)){await del(STORE_GARMENTS,g.id);await reload();$('#garmentDetailDialog').close();renderWardrobe();toast('Prenda eliminada');}});
 $('#generateBtn').onclick=()=>generateOutfit();$('#regenerateBtn').onclick=()=>generateOutfit();$('#favoriteOutfitBtn').onclick=()=>saveLook({favorite:true});$('#wearOutfitBtn').onclick=()=>saveLook({wear:true});
 [$('#favoriteList'),$('#historyList')].forEach(el=>el.addEventListener('click',e=>{const b=e.target.closest('[data-look-action]');if(!b)return;if(b.dataset.lookAction==='favorite')toggleLookFavorite(b.dataset.id);else reuseLook(b.dataset.id);}));
 $('#exportBtn').onclick=exportBackup;$('#importInput').addEventListener('change',e=>{if(e.target.files[0])importBackup(e.target.files[0]);e.target.value='';});
 $('#resetBtn').onclick=async()=>{if(confirm('¿Seguro? Se borrará todo el armario de este dispositivo.')){await clearStore(STORE_GARMENTS);await clearStore(STORE_LOOKS);state.currentOutfit=null;await reload();renderWardrobe();toast('Datos eliminados');}};
 // Settings via long-press on title for uncluttered UI
 let timer;$('#pageTitle').addEventListener('touchstart',()=>timer=setTimeout(()=>navigate('settings'),700));$('#pageTitle').addEventListener('touchend',()=>clearTimeout(timer));$('#pageTitle').addEventListener('dblclick',()=>navigate('settings'));
}

(async function init(){await openDB();setupOptions();bindEvents();await reload();renderWardrobe();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});})();
