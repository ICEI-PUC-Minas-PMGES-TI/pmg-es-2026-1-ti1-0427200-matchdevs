/* Pesquisa + mapa interativo (Leaflet)
   - Lê o JSON (vagas.json)
   - Renderiza cards
   - Cria marcadores no mapa
   - Filtros: texto, tipo de vaga (tipo_contrato), localização
*/

let allJobs = [];
let filteredJobs = [];
let map;
let markersLayer;
let markerById = new Map();

const els = {
  search: document.getElementById('searchInput'),
  type: document.getElementById('typeSelect'),
  location: document.getElementById('locationSelect'),
  list: document.getElementById('jobsList'),
  empty: document.getElementById('emptyState'),
  modal: document.getElementById('detailsModal'),
  modalContent: document.getElementById('modalContent'),
};

function normalize(str){
  return (str || '').toString().normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();
}

function moneyOrDash(v){
  return v ? v : '—';
}

function formatDateBR(iso){
  if(!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if(Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR');
}

function initMap(){
  map = L.map('map', { zoomControl: true, scrollWheelZoom: true });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  // Fallback: Brasil
  map.setView([-14.2350, -51.9253], 4);
}

function populateFilters(jobs){
  const types = Array.from(new Set(jobs.map(j => j.tipo_contrato).filter(Boolean))).sort();
  const locs  = Array.from(new Set(jobs.map(j => j.localizacao).filter(Boolean))).sort();

  for(const t of types){
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    els.type.appendChild(opt);
  }

  for(const l of locs){
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = l;
    els.location.appendChild(opt);
  }
}

function applyFilters(){
  const q = normalize(els.search.value);
  const t = els.type.value;
  const l = els.location.value;

  filteredJobs = allJobs.filter(job => {
    const matchText = !q || normalize(job.titulo).includes(q) || normalize(job.empresa).includes(q);
    const matchType = !t || job.tipo_contrato === t;
    const matchLoc  = !l || job.localizacao === l;
    return matchText && matchType && matchLoc;
  });

  renderJobs(filteredJobs);
  renderMarkers(filteredJobs);
}

function renderJobs(jobs){
  els.list.innerHTML = '';

  els.empty.hidden = jobs.length !== 0;

  for(const job of jobs){
    const card = document.createElement('div');
    card.className = 'job-card';
    card.dataset.id = job.id;

    const info = document.createElement('div');
    info.className = 'job-info';
    info.innerHTML = `
      <h3>${job.titulo}</h3>
      <h4>${job.empresa}</h4>
      <p>${job.localizacao}</p>
      <div class="job-meta">${job.tipo_contrato || ''} • ${moneyOrDash(job.salario)} • ${formatDateBR(job.data_publicacao)}</div>
    `;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Ver detalhes';
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      openDetails(job);
    });

    card.addEventListener('click', () => focusJob(job.id));

    card.appendChild(info);
    card.appendChild(btn);
    els.list.appendChild(card);
  }
}

function clearActiveCard(){
  document.querySelectorAll('.job-card.is-active').forEach(el => el.classList.remove('is-active'));
}

function focusJob(jobId){
  clearActiveCard();
  const card = document.querySelector(`.job-card[data-id="${jobId}"]`);
  if(card){
    card.classList.add('is-active');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const marker = markerById.get(jobId);
  if(marker){
    marker.openPopup();
    map.setView(marker.getLatLng(), Math.max(map.getZoom(), 11), { animate: true });
  }
}

function renderMarkers(jobs){
  markersLayer.clearLayers();
  markerById.clear();

  const bounds = [];

  for(const job of jobs){
    if(typeof job.lat !== 'number' || typeof job.lng !== 'number') continue;

    const marker = L.marker([job.lat, job.lng]);
    marker.bindPopup(`
      <b>${job.titulo}</b><br/>
      ${job.empresa}<br/>
      <small>${job.localizacao}</small>
    `);

    marker.on('click', () => focusJob(job.id));

    marker.addTo(markersLayer);
    markerById.set(job.id, marker);
    bounds.push([job.lat, job.lng]);
  }

  if(bounds.length){
    map.fitBounds(bounds, { padding: [20, 20] });
  }
}

function openDetails(job){
  els.modalContent.innerHTML = `
    <h2>${job.titulo}</h2>
    <h3>${job.empresa} — ${job.localizacao}</h3>
    <p><b>Tipo de contrato:</b> ${job.tipo_contrato || '—'}</p>
    <p><b>Salário:</b> ${moneyOrDash(job.salario)}</p>
    <p><b>Publicado em:</b> ${formatDateBR(job.data_publicacao)}</p>
    <p><b>Descrição:</b><br/>${job.descricao || '—'}</p>
    <p><b>Requisitos:</b></p>
    <ul>
      ${(job.requisitos || []).map(r => `<li>${r}</li>`).join('') || '<li>—</li>'}
    </ul>
  `;

  els.modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Também foca no marcador/card
  focusJob(job.id);
}

function closeDetails(){
  els.modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function wireModal(){
  els.modal.addEventListener('click', (ev) => {
    const target = ev.target;
    if(target && target.hasAttribute('data-close')) closeDetails();
  });

  document.addEventListener('keydown', (ev) => {
    if(ev.key === 'Escape' && els.modal.getAttribute('aria-hidden') === 'false') closeDetails();
  });
}

function debounce(fn, wait=250){
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

async function loadJobs(){
  // Ajuste o caminho conforme seu projeto
  const res = await fetch('Cadastro de vagas/vagas.json');
  if(!res.ok) throw new Error('Não foi possível carregar o JSON de vagas.');
  const json = await res.json();
  return json.vagas || [];
}

(async function main(){
  initMap();
  wireModal();

  try{
    allJobs = await loadJobs();

    populateFilters(allJobs);

    // Eventos dos filtros
    els.search.addEventListener('input', debounce(applyFilters, 200));
    els.type.addEventListener('change', applyFilters);
    els.location.addEventListener('change', applyFilters);

    // Render inicial
    applyFilters();
  }catch(err){
    console.error(err);
    els.empty.hidden = false;
    els.empty.textContent = 'Erro ao carregar as vagas. Verifique o caminho do JSON e rode via servidor local.';
  }
})();
