
const STORAGE_KEY = 'mi_armario_v2';
const CATEGORIES = [
  {id:'tops', label:'Tops'}, {id:'bottoms', label:'Pantalones'}, {id:'outerwear', label:'Chaquetas'}, {id:'shoes', label:'Zapatos'}, {id:'accessories', label:'Accesorios'}
];
const COLORS = ['Blanco','Negro','Gris','Azul marino','Beige','Marrón','Crema','Azul','Celeste','Verde','Oliva','Rojo','Burdeos','Rosa','Naranja','Amarillo','Morado','Denim','Multicolor'];
const STYLES = ['Casual','Smart casual','Formal','Deportivo','Streetwear'];
const SEASONS = ['Todo el año','Primavera','Verano','Otoño','Invierno'];
const OCCASIONS = ['Trabajo','Cena','Casual','Salir','Viaje','Evento','Diario'];
const TEMPERATURES = ['Frío','Templado','Calor'];
const COLOR_META = {
  'Blanco':{hex:'#f5f5f2', neutral:true},'Negro':{hex:'#1d1d1d', neutral:true},'Gris':{hex:'#8f9298', neutral:true},'Azul marino':{hex:'#23334e', neutral:true},'Beige':{hex:'#d7c2a2', neutral:true},'Marrón':{hex:'#7e5b42', neutral:true},'Crema':{hex:'#eee2c8', neutral:true},'Denim':{hex:'#4f77a7', neutral:true},
  'Azul':{hex:'#3d7be0'},'Celeste':{hex:'#9ad0ff'},'Verde':{hex:'#3d9b5d'},'Oliva':{hex:'#687744', neutral:true},'Rojo':{hex:'#c74b4b'},'Burdeos':{hex:'#7e3143'},'Rosa':{hex:'#e28bb4'},'Naranja':{hex:'#dd8d3d'},'Amarillo':{hex:'#d9bc42'},'Morado':{hex:'#7a58a8'},'Multicolor':{hex:'#bbbbbb'}
};
let state = loadState();
let ui = {currentView:'home', categoryFilter:'all', occasion:'Casual', temp:'Templado', style:'Casual', currentOutfit:null};

function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{
      const parsed = JSON.parse(raw);
      parsed.garments ||= []; parsed.favorites ||= []; parsed.history ||= [];
      return parsed;
    }catch(e){}
  }
  return {garments:[], favorites:[], history:[]};
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
const $ = s => document.querySelector(s); const $$ = s => [...document.querySelectorAll(s)];
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._timer); t._timer=setTimeout(()=>t.classList.remove('show'),1800); }
function escapeHtml(str=''){ return str.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function uuid(){ return (crypto.randomUUID?.() || String(Date.now()+Math.random())); }
function navigate(view){ ui.currentView = view; $$('.view').forEach(v=>v.classList.toggle('active', v.dataset.view===view)); $$('.nav-item').forEach(b=>b.classList.toggle('active', b.dataset.nav===view)); $('#pageTitle').textContent = ({home:'Inicio',wardrobe:'Armario',generator:'Generador',favorites:'Favoritos',history:'Historial',settings:'Ajustes'})[view] || 'Mi Armario'; }

function init(){
  fillSelects();
  renderOptionButtons();
  attachEvents();
  renderAll();
}

function fillSelects(){
  $('#garmentCategory').innerHTML = CATEGORIES.map(c=>`<option value="${c.id}">${c.label}</option>`).join('');
  $('#garmentColor').innerHTML = COLORS.map(c=>`<option value="${c}">${c}</option>`).join('');
  $('#garmentStyle').innerHTML = STYLES.map(s=>`<option value="${s}">${s}</option>`).join('');
  $('#garmentSeason').innerHTML = SEASONS.map(s=>`<option value="${s}">${s}</option>`).join('');
  $('#garmentOccasions').innerHTML = OCCASIONS.map(o=>`<button type="button" class="check-chip" data-occ="${o}">${o}</button>`).join('');
}

function renderOptionButtons(){
  $('#occasionOptions').innerHTML = OCCASIONS.map(o=>`<button type="button" class="${ui.occasion===o?'active':''}" data-group="occasion" data-value="${o}">${o}</button>`).join('');
  $('#temperatureOptions').innerHTML = TEMPERATURES.map(o=>`<button type="button" class="${ui.temp===o?'active':''}" data-group="temp" data-value="${o}">${o}</button>`).join('');
  $('#styleOptions').innerHTML = STYLES.map(o=>`<button type="button" class="${ui.style===o?'active':''}" data-group="style" data-value="${o}">${o}</button>`).join('');
  $('#categoryChips').innerHTML = [`<button class="chip ${ui.categoryFilter==='all'?'active':''}" data-cat="all">Todas</button>`].concat(CATEGORIES.map(c=>`<button class="chip ${ui.categoryFilter===c.id?'active':''}" data-cat="${c.id}">${c.label}</button>`)).join('');
  refreshRequiredGarmentSelect();
}

function refreshRequiredGarmentSelect(){
  const options = state.garments.map(g=>`<option value="${g.id}">${escapeHtml(g.name)}</option>`).join('');
  $('#requiredGarment').innerHTML = `<option value="">Ninguna</option>${options}`;
}

function attachEvents(){
  document.addEventListener('click', e=>{
    const nav = e.target.closest('[data-nav]'); if(nav){ navigate(nav.dataset.nav); }
    const quick = e.target.closest('#quickAddBtn, #openAddGarment'); if(quick){ openGarmentDialog(); }
    const action = e.target.closest('[data-action="randomLook"]'); if(action){ generateOutfit(true); }
    const seg = e.target.closest('[data-group]'); if(seg){ ui[seg.dataset.group]=seg.dataset.value; renderOptionButtons(); }
    const cat = e.target.closest('[data-cat]'); if(cat){ ui.categoryFilter=cat.dataset.cat; renderWardrobe(); renderOptionButtons(); }
    const occ = e.target.closest('.check-chip[data-occ]'); if(occ){ occ.classList.toggle('active'); }
    const garmentCard = e.target.closest('.garment-card[data-id]'); if(garmentCard){ showGarmentDetail(garmentCard.dataset.id); }
    const favCard = e.target.closest('.look-card[data-looktype]'); if(favCard && e.target.closest('[data-loadoutfit]')){ loadSavedLook(favCard.dataset.looktype, favCard.dataset.id); }
  });

  $('#closeGarmentDialog').addEventListener('click',()=>$('#garmentDialog').close());
  $('#garmentPhoto').addEventListener('change', handlePhotoUpload);
  $('#garmentForm').addEventListener('submit', saveGarment);
  $('#wardrobeSearch').addEventListener('input', renderWardrobe);
  $('#generateBtn').addEventListener('click', ()=>generateOutfit(false));
  $('#regenerateBtn').addEventListener('click', ()=>generateOutfit(true));
  $('#wearOutfitBtn').addEventListener('click', wearCurrentOutfit);
  $('#favoriteOutfitBtn').addEventListener('click', favoriteCurrentOutfit);
  $('#exportBtn').addEventListener('click', exportData);
  $('#importInput').addEventListener('change', importData);
  $('#resetBtn').addEventListener('click', resetAll);
}

async function handlePhotoUpload(e){
  const file = e.target.files?.[0]; if(!file) return;
  const dataUrl = await readFileAsDataURL(file);
  $('#photoPreview').src = dataUrl; $('#photoPreview').classList.remove('hidden'); $('#photoPlaceholder').classList.add('hidden');
  const palette = await extractPalette(dataUrl);
  const inferred = inferNamedColor(palette.primary);
  $('#garmentColor').value = inferred.name;
  renderDetectedPalette(palette, inferred.name);
  $('#garmentDialog').dataset.palette = JSON.stringify({...palette, inferred: inferred.name});
}
function renderDetectedPalette(palette, inferredName){
  const host = $('#detectedPalette');
  host.innerHTML = [`Dominante`, `Secundario`, `Acento`].map((label,i)=>{
    const col=[palette.primary,palette.secondary,palette.accent][i];
    return `<span class="palette-chip"><span class="color-swatch" style="background:${col.hex}"></span>${label}: ${i===0?escapeHtml(inferredName):col.label}</span>`;
  }).join('');
  host.classList.remove('hidden');
}
function readFileAsDataURL(file){ return new Promise((resolve,reject)=>{ const fr=new FileReader(); fr.onload=()=>resolve(fr.result); fr.onerror=reject; fr.readAsDataURL(file); }); }

function rgbToHsl(r,g,b){
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b); let h,s; const l=(max+min)/2;
  if(max===min){ h=s=0; } else {
    const d=max-min; s=l>0.5? d/(2-max-min): d/(max+min);
    switch(max){ case r: h=(g-b)/d+(g<b?6:0); break; case g: h=(b-r)/d+2; break; default: h=(r-g)/d+4; }
    h*=60;
  }
  return {h,s:s*100,l:l*100};
}
function hslToCss({h,s,l}){ return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`; }
function hueDistance(a,b){ const d=Math.abs(a-b)%360; return d>180?360-d:d; }
function isNeutral(meta){ return meta.neutral || meta.s<18 || meta.l<16 || meta.l>88; }

async function extractPalette(dataUrl){
  const img = await loadImage(dataUrl); const size=60;
  const canvas = document.createElement('canvas'); const ctx=canvas.getContext('2d',{willReadFrequently:true});
  canvas.width=size; canvas.height=size; ctx.drawImage(img,0,0,size,size);
  const {data} = ctx.getImageData(0,0,size,size);
  const bins = new Map();
  for(let i=0;i<data.length;i+=4){
    const a=data[i+3]; if(a<180) continue;
    const r=data[i], g=data[i+1], b=data[i+2];
    const hsl=rgbToHsl(r,g,b);
    if(hsl.l<6 || hsl.l>97) continue;
    const key = `${Math.round(hsl.h/18)*18}|${Math.round(hsl.s/10)*10}|${Math.round(hsl.l/10)*10}`;
    bins.set(key, (bins.get(key)||0)+1);
  }
  const palette = [...bins.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([key,count])=>{
    const [h,s,l]=key.split('|').map(Number); return {h,s,l,count,hex:hslToCss({h,s,l})};
  });
  if(!palette.length){
    return {primary:{h:0,s:0,l:50,hex:'#888',label:'desconocido'},secondary:{h:0,s:0,l:70,hex:'#aaa',label:'desconocido'},accent:{h:0,s:0,l:30,hex:'#555',label:'desconocido'}};
  }
  const primary = palette[0];
  let secondary = palette.find(p=>hueDistance(p.h,primary.h)>18 || Math.abs(p.l-primary.l)>12) || palette[1] || primary;
  let accent = palette.find(p=>p.s>Math.max(primary.s,secondary.s)+8) || palette.find(p=>!isNeutral(p) && hueDistance(p.h,primary.h)>20) || palette[2] || secondary;
  primary.label = inferNamedColor(primary).name; secondary.label = inferNamedColor(secondary).name; accent.label = inferNamedColor(accent).name;
  return {primary,secondary,accent};
}
function loadImage(src){ return new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>resolve(img); img.onerror=reject; img.src=src; }); }
function inferNamedColor(c){
  const candidates = Object.entries(COLOR_META).map(([name,m])=>{
    const rgb = hexToRgb(m.hex); const hsl = rgbToHsl(rgb.r,rgb.g,rgb.b);
    const d = hueDistance(c.h,hsl.h) + Math.abs(c.s-hsl.s)*0.35 + Math.abs(c.l-hsl.l)*0.4 + (m.neutral? (isNeutral(c)?0:25):0);
    return {name, d};
  }).sort((a,b)=>a.d-b.d);
  if(isNeutral(c)){
    if(c.l>90) return {name:'Blanco'};
    if(c.l>78) return {name:'Crema'};
    if(c.l<18) return {name:'Negro'};
    if(c.s<14) return {name:'Gris'};
    if(c.h>25 && c.h<50 && c.l>65) return {name:'Beige'};
    if(c.h>205 && c.h<245 && c.l<35) return {name:'Azul marino'};
  }
  return candidates[0];
}
function hexToRgb(hex){ hex=hex.replace('#',''); if(hex.length===3) hex=hex.split('').map(x=>x+x).join(''); const int=parseInt(hex,16); return {r:(int>>16)&255,g:(int>>8)&255,b:int&255}; }

function saveGarment(e){
  e.preventDefault();
  const id = $('#garmentId').value || uuid();
  const occasions = $$('#garmentOccasions .check-chip.active').map(el=>el.dataset.occ);
  const storedPalette = $('#garmentDialog').dataset.palette ? JSON.parse($('#garmentDialog').dataset.palette) : null;
  const garment = {
    id,
    name: $('#garmentName').value.trim(),
    category: $('#garmentCategory').value,
    color: $('#garmentColor').value,
    style: $('#garmentStyle').value,
    season: $('#garmentSeason').value,
    occasions,
    clean: $('#garmentClean').checked,
    photo: $('#photoPreview').src || '',
    palette: storedPalette,
    lastWorn: state.garments.find(g=>g.id===id)?.lastWorn || null,
    createdAt: state.garments.find(g=>g.id===id)?.createdAt || Date.now(),
  };
  if(!garment.name || !garment.photo){ toast('Añade nombre y foto'); return; }
  const idx = state.garments.findIndex(g=>g.id===id);
  if(idx>=0) state.garments[idx]=garment; else state.garments.unshift(garment);
  saveState(); $('#garmentDialog').close(); renderAll(); toast('Prenda guardada');
}

function openGarmentDialog(garment=null){
  $('#garmentForm').reset(); $('#garmentOccasions .check-chip').forEach(b=>b.classList.remove('active')); $('#photoPreview').classList.add('hidden'); $('#photoPlaceholder').classList.remove('hidden'); $('#detectedPalette').classList.add('hidden'); $('#garmentDialog').dataset.palette='';
  if(garment){
    $('#garmentModalTitle').textContent='Editar prenda'; $('#garmentId').value=garment.id; $('#garmentName').value=garment.name; $('#garmentCategory').value=garment.category; $('#garmentColor').value=garment.color; $('#garmentStyle').value=garment.style; $('#garmentSeason').value=garment.season; $('#garmentClean').checked=garment.clean;
    garment.occasions.forEach(o=>{ const btn=$(`#garmentOccasions .check-chip[data-occ="${CSS.escape(o)}"]`); if(btn) btn.classList.add('active'); });
    if(garment.photo){ $('#photoPreview').src=garment.photo; $('#photoPreview').classList.remove('hidden'); $('#photoPlaceholder').classList.add('hidden'); }
    if(garment.palette){ $('#garmentDialog').dataset.palette=JSON.stringify(garment.palette); renderDetectedPalette(garment.palette, garment.color); }
  } else {
    $('#garmentModalTitle').textContent='Añadir prenda'; $('#garmentId').value='';
  }
  $('#garmentDialog').showModal();
}

function renderAll(){ renderOptionButtons(); renderHome(); renderWardrobe(); renderFavorites(); renderHistory(); }
function renderHome(){
  $('#statGarments').textContent = state.garments.length;
  $('#statFavorites').textContent = state.favorites.length;
  $('#statLooks').textContent = state.history.length;
  if(state.history.length){
    const last = state.history[0];
    $('#lastOutfit').className='look-card';
    $('#lastOutfit').innerHTML = renderLookCard(last, 'history', false);
  } else {
    $('#lastOutfit').className='empty-card';
    $('#lastOutfit').textContent='Todavía no has guardado ningún outfit.';
  }
}

function renderWardrobe(){
  const q = $('#wardrobeSearch').value.trim().toLowerCase();
  let list = state.garments.filter(g=>ui.categoryFilter==='all' || g.category===ui.categoryFilter);
  if(q) list = list.filter(g=>`${g.name} ${g.color} ${g.style}`.toLowerCase().includes(q));
  const grid = $('#wardrobeGrid');
  if(!list.length){ grid.innerHTML = '<div class="empty-card" style="padding:18px">No hay prendas con este filtro.</div>'; return; }
  grid.innerHTML = list.map(g=>`
    <article class="garment-card" data-id="${g.id}">
      <img src="${g.photo}" alt="${escapeHtml(g.name)}" />
      <div class="garment-body">
        <h4>${escapeHtml(g.name)}</h4>
        <div class="muted small"><span class="color-swatch" style="background:${g.palette?.primary?.hex || COLOR_META[g.color]?.hex || '#888'}"></span>${g.color} · ${labelForCategory(g.category)}</div>
        <div class="tag-row">
          <span class="tag">${g.style}</span>
          <span class="tag">${g.season}</span>
          <span class="tag ${g.clean?'pill-neutral':'pill-dirty'}">${g.clean?'Limpia':'Usada'}</span>
        </div>
      </div>
    </article>`).join('');
}
function labelForCategory(id){ return CATEGORIES.find(c=>c.id===id)?.label || id; }

function showGarmentDetail(id){
  const g = state.garments.find(x=>x.id===id); if(!g) return;
  $('#garmentDetail').innerHTML = `<div class="detail-content"><img src="${g.photo}"><h3>${escapeHtml(g.name)}</h3><p>${g.color} · ${labelForCategory(g.category)} · ${g.style}</p><div class="palette-row">${renderPaletteInline(g)}</div><div class="button-row" style="margin-top:14px"><button class="secondary" id="editGarmentBtn">Editar</button><button class="danger" id="deleteGarmentBtn">Eliminar</button></div></div>`;
  $('#garmentDetailDialog').showModal();
  $('#editGarmentBtn').onclick = ()=>{ $('#garmentDetailDialog').close(); openGarmentDialog(g); };
  $('#deleteGarmentBtn').onclick = ()=>{ if(confirm('¿Eliminar esta prenda?')){ state.garments = state.garments.filter(x=>x.id!==id); saveState(); renderAll(); $('#garmentDetailDialog').close(); toast('Prenda eliminada'); } };
}

function renderPaletteInline(g){
  if(!g.palette) return `<span class="palette-chip"><span class="color-swatch" style="background:${COLOR_META[g.color]?.hex || '#888'}"></span>${g.color}</span>`;
  return [g.palette.primary, g.palette.secondary, g.palette.accent].map((p,i)=>`<span class="palette-chip"><span class="color-swatch" style="background:${p.hex}"></span>${['Dominante','Secundario','Acento'][i]}</span>`).join('');
}

function seasonScore(g,temp){
  const s = g.season;
  if(s==='Todo el año') return 5;
  if(temp==='Calor' && ['Verano','Primavera'].includes(s)) return 5;
  if(temp==='Templado' && ['Primavera','Otoño','Todo el año'].includes(s)) return 5;
  if(temp==='Frío' && ['Invierno','Otoño'].includes(s)) return 5;
  return 1;
}
function recencyPenalty(g){
  if(!g.lastWorn) return 0;
  const days = (Date.now() - g.lastWorn)/(1000*60*60*24);
  if(days < 3) return 12; if(days < 7) return 6; return 0;
}
function styleMatch(g, style){ return g.style===style ? 7 : (g.style.includes('Casual') && style.includes('Casual') ? 5 : 1); }
function occasionMatch(g, occasion){ return g.occasions.includes(occasion) ? 8 : (g.occasions.includes('Diario') ? 4 : 1); }

function getBaseColorMeta(g){
  if(g.palette?.primary) return {...g.palette.primary, name:g.color, neutral:isNeutral(g.palette.primary) || COLOR_META[g.color]?.neutral};
  const rgb = hexToRgb(COLOR_META[g.color]?.hex || '#888'); const hsl = rgbToHsl(rgb.r,rgb.g,rgb.b); return {...hsl, name:g.color, hex:COLOR_META[g.color]?.hex || '#888', neutral:!!COLOR_META[g.color]?.neutral};
}

function comboColorScore(items){
  const metas = items.map(getBaseColorMeta);
  let score = 55; const reasons=[];
  const strong = metas.filter(m=>!m.neutral && m.s>42);
  const neutrals = metas.filter(m=>m.neutral);
  if(neutrals.length>=2){ score += 14; reasons.push('Base neutra que facilita que el conjunto se vea limpio y equilibrado.'); }
  if(strong.length===0){ score += 12; reasons.push('Paleta sobria y fácil de combinar.'); }
  if(strong.length===1){ score += 14; reasons.push(`Solo hay un color protagonista (${strong[0].name.toLowerCase()}) y el resto acompaña.`); }
  if(strong.length>=2){
    const ds=[]; for(let i=0;i<strong.length;i++) for(let j=i+1;j<strong.length;j++) ds.push(hueDistance(strong[i].h, strong[j].h));
    const min = Math.min(...ds);
    if(min<=28){ score += 6; reasons.push('Los colores intensos son análogos y mantienen armonía.'); }
    else if(min>=145 && min<=215){ score -= 6; reasons.push('Hay contraste alto entre colores protagonistas; se ha moderado la puntuación.'); }
    else { score -= 20; reasons.push('Los colores intensos chocan entre sí y no forman una paleta limpia.'); }
  }
  const top = metas[0], bottom=metas[1], shoes=metas[2];
  if(bottom.neutral){ score += 9; reasons.push('El pantalón hace de base neutra.'); }
  if(shoes.neutral){ score += 7; reasons.push('El calzado no compite con la parte superior.'); }
  if(top && shoes && !top.neutral && !shoes.neutral && hueDistance(top.h, shoes.h) > 70 && top.s>45 && shoes.s>45){ score -= 18; reasons.push('Top y calzado compiten demasiado visualmente.'); }
  if(top && bottom && shoes && strong.length>=2 && shoes===strong.find(s=>!s.neutral) && bottom.neutral){ score += 4; }
  return {score: Math.max(0, Math.min(100, score)), reasons};
}

function compatibleSet(set, requiredId, filters){
  if(requiredId && !set.some(g=>g.id===requiredId)) return false;
  if(filters.onlyClean && set.some(g=>!g.clean)) return false;
  return true;
}

function generateOutfit(forceRandom=false){
  const requiredId = $('#requiredGarment').value;
  const filters = {onlyClean: $('#onlyClean').checked, avoidRecent: $('#avoidRecent').checked};
  const pool = state.garments.filter(g=>!filters.onlyClean || g.clean);
  const tops = pool.filter(g=>g.category==='tops');
  const bottoms = pool.filter(g=>g.category==='bottoms');
  const shoes = pool.filter(g=>g.category==='shoes');
  const outer = pool.filter(g=>g.category==='outerwear');
  if(!tops.length || !bottoms.length || !shoes.length){ toast('Necesitas al menos un top, un pantalón y unos zapatos.'); return; }
  const candidates=[];
  for(const t of tops) for(const b of bottoms) for(const s of shoes){
    const base=[t,b,s];
    const outers = [null, ...outer];
    for(const o of outers){
      const items = o ? [t,b,s,o] : [t,b,s];
      if(!compatibleSet(items, requiredId, filters)) continue;
      let score = 0;
      items.forEach(g=>{ score += seasonScore(g, ui.temp) + styleMatch(g, ui.style) + occasionMatch(g, ui.occasion); if(filters.avoidRecent) score -= recencyPenalty(g); });
      const color = comboColorScore(items);
      score += color.score;
      if(o && ui.temp==='Calor') score -= 6;
      if(!o && ui.temp==='Frío') score -= 5;
      score += (items.filter(g=>g.category==='accessories').length);
      candidates.push({items, score, reasons: color.reasons});
    }
  }
  if(!candidates.length){ toast('No encuentro un outfit que cumpla tus filtros.'); return; }
  candidates.sort((a,b)=>b.score-a.score);
  const shortlist = candidates.filter(c=>c.score>=candidates[0].score-7).slice(0,8);
  const choice = forceRandom ? shortlist[Math.floor(Math.random()*shortlist.length)] : shortlist[0];
  ui.currentOutfit = choice; renderCurrentOutfit(); navigate('generator');
}

function renderCurrentOutfit(){
  const outfit = ui.currentOutfit; if(!outfit) return;
  $('#outfitResult').classList.remove('hidden');
  $('#outfitTitle').textContent = `${ui.occasion} · ${ui.style}`;
  $('#outfitScore').textContent = `${Math.round(outfit.score)}%`;
  $('#outfitPhotos').innerHTML = outfit.items.map(g=>`<article class="outfit-item"><img src="${g.photo}" alt="${escapeHtml(g.name)}"><div class="meta"><h4>${escapeHtml(g.name)}</h4><p><span class="color-swatch" style="background:${g.palette?.primary?.hex || COLOR_META[g.color]?.hex || '#888'}"></span>${g.color} · ${labelForCategory(g.category)}</p></div></article>`).join('');
  const paletteItems = outfit.items.map(g=>`<span class="palette-chip"><span class="color-swatch" style="background:${g.palette?.primary?.hex || COLOR_META[g.color]?.hex || '#888'}"></span>${escapeHtml(g.name)}</span>`).join('');
  $('#outfitPalette').innerHTML = paletteItems;
  $('#outfitReason').innerHTML = `<b>Por qué combina:</b><ul>${outfit.reasons.slice(0,4).map(r=>`<li>${escapeHtml(r)}</li>`).join('')}</ul><p class="muted small">La recomendación se basa en el color dominante extraído de la foto, la saturación, el balance entre neutros y acentos, la ocasión y la temperatura.</p>`;
}

function favoriteCurrentOutfit(){
  if(!ui.currentOutfit) return;
  state.favorites.unshift({id:uuid(), createdAt:Date.now(), meta:{occasion:ui.occasion, style:ui.style, temp:ui.temp, score:Math.round(ui.currentOutfit.score)}, items: ui.currentOutfit.items.map(g=>g.id)});
  saveState(); renderFavorites(); toast('Outfit guardado en favoritos');
}
function wearCurrentOutfit(){
  if(!ui.currentOutfit) return;
  const now = Date.now();
  ui.currentOutfit.items.forEach(g=>{ const item = state.garments.find(x=>x.id===g.id); if(item) item.lastWorn = now; });
  state.history.unshift({id:uuid(), createdAt:now, meta:{occasion:ui.occasion, style:ui.style, temp:ui.temp, score:Math.round(ui.currentOutfit.score)}, items: ui.currentOutfit.items.map(g=>g.id)});
  saveState(); renderAll(); toast('Outfit marcado como usado');
}
function renderLookCard(rec, type, showButton=true){
  const items = rec.items.map(id=>state.garments.find(g=>g.id===id)).filter(Boolean);
  return `<div class="look-card" data-looktype="${type}" data-id="${rec.id}"><h4>${rec.meta.occasion || 'Look'} · ${rec.meta.style || ''}</h4><p>${new Date(rec.createdAt).toLocaleDateString('es-ES')} · ${rec.meta.score || 0}%</p><div class="look-mini">${items.map(g=>`<img src="${g.photo}" alt="">`).join('')}</div>${showButton?'<div class="button-row" style="margin-top:10px"><button class="secondary" data-loadoutfit>Ver prendas</button></div>':''}</div>`;
}
function renderFavorites(){ const el=$('#favoriteList'); if(!state.favorites.length){ el.innerHTML='<div class="empty-card" style="padding:18px">Todavía no tienes outfits favoritos.</div>'; return; } el.innerHTML=state.favorites.map(f=>renderLookCard(f,'favorites')).join(''); }
function renderHistory(){ const el=$('#historyList'); if(!state.history.length){ el.innerHTML='<div class="empty-card" style="padding:18px">Todavía no has registrado outfits usados.</div>'; return; } el.innerHTML=state.history.map(h=>renderLookCard(h,'history')).join(''); }
function loadSavedLook(type,id){ const list = type==='favorites'?state.favorites:state.history; const rec=list.find(x=>x.id===id); if(!rec) return; ui.currentOutfit = {items: rec.items.map(id=>state.garments.find(g=>g.id===id)).filter(Boolean), score: rec.meta.score || 0, reasons:['Outfit guardado previamente.']}; ui.occasion=rec.meta.occasion || ui.occasion; ui.style=rec.meta.style || ui.style; ui.temp=rec.meta.temp || ui.temp; renderOptionButtons(); renderCurrentOutfit(); navigate('generator'); }

function exportData(){ const blob = new Blob([JSON.stringify(state)], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='mi-armario-backup.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500); }
async function importData(e){ const file=e.target.files?.[0]; if(!file) return; try{ const text=await file.text(); const parsed=JSON.parse(text); if(!parsed.garments) throw new Error(); state=parsed; saveState(); renderAll(); toast('Backup importado'); }catch(err){ toast('Archivo no válido'); } e.target.value=''; }
function resetAll(){ if(confirm('¿Seguro que quieres borrar todo el armario?')){ state={garments:[], favorites:[], history:[]}; saveState(); renderAll(); toast('Datos borrados'); }}

init();
