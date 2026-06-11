const GOOGLE_MAPS_CONFIG = {
  mapId: 'DEMO_MAP_ID',
  defaultCenter: { lat: -14.2350, lng: -51.9253 },
  defaultZoom: 4,
  minFocusZoom: 11,
};

let allJobs = [];
let filteredJobs = [];
let map;
let infoWindow;
let geocoder;
let AdvancedMarkerElement;
let markerById = new Map();
let renderMarkersRunId = 0;

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
  return (str || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu,'')
    .toLowerCase()
    .trim();
}

function escapeHtml(value){
  return (value ?? '').toString().replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
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

async function initMap(){
  const [{ Map, InfoWindow }, markerLibrary, geocodingLibrary] = await Promise.all([
    google.maps.importLibrary('maps'),
    google.maps.importLibrary('marker'),
    google.maps.importLibrary('geocoding'),
  ]);

  AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement;
  geocoder = new geocodingLibrary.Geocoder();

  map = new Map(document.getElementById('map'), {
    center: GOOGLE_MAPS_CONFIG.defaultCenter,
    zoom: GOOGLE_MAPS_CONFIG.defaultZoom,
    mapId: GOOGLE_MAPS_CONFIG.mapId,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  });

  infoWindow = new InfoWindow();
}

function populateFilters(jobs){
  const types = Array.from(
    new Set(jobs.map(j => j.tipo_contrato).filter(Boolean))
  ).sort();

  const locs = Array.from(
    new Set(jobs.map(j => j.localizacao).filter(Boolean))
  ).sort();

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
    const matchText =
      !q ||
      normalize(job.titulo).includes(q) ||
      normalize(job.empresa).includes(q);

    const matchType = !t || job.tipo_contrato === t;
    const matchLoc = !l || job.localizacao === l;

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
      <h3>${escapeHtml(job.titulo)}</h3>
      <h4>${escapeHtml(job.empresa)}</h4>
      <p>${escapeHtml(job.localizacao)}</p>
      <div class="job-meta">
        ${escapeHtml(job.tipo_contrato || '')}
        •
        ${escapeHtml(moneyOrDash(job.salario))}
        •
        ${escapeHtml(formatDateBR(job.data_publicacao))}
      </div>
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
  document
    .querySelectorAll('.job-card.is-active')
    .forEach(el => el.classList.remove('is-active'));
}

function cssEscape(value){
  if(window.CSS && typeof window.CSS.escape === 'function') {
    return window.CSS.escape(value);
  }

  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function buildInfoWindowContent(job){
  return `
    <div class="map-popup">
      <strong>${escapeHtml(job.titulo)}</strong><br/>
      ${escapeHtml(job.empresa)}<br/>
      <small>${escapeHtml(job.localizacao)}</small>
    </div>
  `;
}

function focusJob(jobId){
  clearActiveCard();

  const card = document.querySelector(
    `.job-card[data-id="${cssEscape(String(jobId))}"]`
  );

  if(card){
    card.classList.add('is-active');
    card.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  const markerData = markerById.get(jobId);

  if(markerData){
    infoWindow.setContent(markerData.content);

    infoWindow.open({
      map,
      anchor: markerData.marker,
      shouldFocus: false
    });

    map.panTo(markerData.position);
    map.setZoom(Math.max(map.getZoom(), GOOGLE_MAPS_CONFIG.minFocusZoom));
  }
}

function removeAllMarkers(){
  for(const markerData of markerById.values()){
    markerData.marker.map = null;
  }

  markerById.clear();

  if(infoWindow) {
    infoWindow.close();
  }
}

function hasCoordinates(job){
  return Number.isFinite(Number(job.lat)) &&
         Number.isFinite(Number(job.lng));
}

function geocodeCacheKey(address){
  return `geocode:${normalize(address)}`;
}

function readCachedGeocode(address){
  try{
    const raw = sessionStorage.getItem(geocodeCacheKey(address));
    return raw ? JSON.parse(raw) : null;
  }catch{
    return null;
  }
}

function writeCachedGeocode(address, position){
  try{
    sessionStorage.setItem(
      geocodeCacheKey(address),
      JSON.stringify(position)
    );
  }catch{
    // Caso o navegador bloqueie sessionStorage, o mapa continua funcionando.
  }
}

async function getJobPosition(job){
  if(hasCoordinates(job)){
    return {
      lat: Number(job.lat),
      lng: Number(job.lng)
    };
  }

  if(!job.localizacao || !geocoder) {
    return null;
  }

  const cached = readCachedGeocode(job.localizacao);

  if(cached && Number.isFinite(cached.lat) && Number.isFinite(cached.lng)){
    return cached;
  }

  try{
    const response = await geocoder.geocode({
      address: job.localizacao,
      componentRestrictions: { country: 'BR' },
      language: 'pt-BR',
      region: 'BR',
    });

    const location = response.results?.[0]?.geometry?.location;

    if(!location) {
      return null;
    }

    const position = {
      lat: location.lat(),
      lng: location.lng()
    };

    writeCachedGeocode(job.localizacao, position);

    return position;
  }catch(err){
    console.warn(`Não foi possível geocodificar: ${job.localizacao}`, err);
    return null;
  }
}

async function renderMarkers(jobs){
  const currentRunId = ++renderMarkersRunId;

  removeAllMarkers();

  const bounds = new google.maps.LatLngBounds();
  let markerCount = 0;

  for(const job of jobs){
    const position = await getJobPosition(job);

    if(currentRunId !== renderMarkersRunId) {
      return;
    }

    if(!position) {
      continue;
    }

    const marker = new AdvancedMarkerElement({
      map,
      position,
      title: `${job.titulo || 'Vaga'} - ${job.empresa || ''}`,
    });

    const content = buildInfoWindowContent(job);

    marker.addListener('click', () => {
      focusJob(job.id);
    });

    markerById.set(job.id, {
      marker,
      position,
      content
    });

    bounds.extend(position);
    markerCount += 1;
  }

  if(markerCount === 1){
    map.setCenter(bounds.getCenter());
    map.setZoom(GOOGLE_MAPS_CONFIG.minFocusZoom);
  }else if(markerCount > 1){
    map.fitBounds(bounds, 20);
  }else{
    map.setCenter(GOOGLE_MAPS_CONFIG.defaultCenter);
    map.setZoom(GOOGLE_MAPS_CONFIG.defaultZoom);
  }
}

function openDetails(job){
  els.modalContent.innerHTML = `
    <h2>${escapeHtml(job.titulo)}</h2>
    <h3>${escapeHtml(job.empresa)} — ${escapeHtml(job.localizacao)}</h3>

    <p>
      <b>Tipo de contrato:</b>
      ${escapeHtml(job.tipo_contrato || '—')}
    </p>

    <p>
      <b>Salário:</b>
      ${escapeHtml(moneyOrDash(job.salario))}
    </p>

    <p>
      <b>Publicado em:</b>
      ${escapeHtml(formatDateBR(job.data_publicacao))}
    </p>

    <p>
      <b>Descrição:</b><br/>
      ${escapeHtml(job.descricao || '—')}
    </p>

    <p><b>Requisitos:</b></p>

    <ul>
      ${
        (job.requisitos || [])
          .map(r => `<li>${escapeHtml(r)}</li>`)
          .join('') || '<li>—</li>'
      }
    </ul>
  `;

  els.modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = '';

  focusJob(job.id);
}

function closeDetails(){
  els.modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function wireModal(){
  els.modal.addEventListener('click', (ev) => {
    const target = ev.target;

    if(target && target.hasAttribute('data-close')) {
      closeDetails();
    }
  });

  document.addEventListener('keydown', (ev) => {
    if(
      ev.key === 'Escape' &&
      els.modal.getAttribute('aria-hidden') === 'false'
    ){
      closeDetails();
    }
  });
}

function debounce(fn, wait = 250){
  let t;

  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

async function loadJobs(){

  const res = await fetch('Cadastro de vagas/vagas.json');

  if(!res.ok) {
    throw new Error('Não foi possível carregar o JSON de vagas.');
  }

  const json = await res.json();

  return json.vagas || [];
}

(async function main(){
  wireModal();

  try{
    await initMap();

    allJobs = await loadJobs();

    populateFilters(allJobs);

    els.search.addEventListener('input', debounce(applyFilters, 200));
    els.type.addEventListener('change', applyFilters);
    els.location.addEventListener('change', applyFilters);

    applyFilters();
  }catch(err){
    console.error(err);

    els.empty.hidden = false;
    els.empty.textContent =
      'Erro ao carregar as vagas ou o Google Maps. Verifique a API key, as APIs habilitadas, o caminho do JSON e rode via servidor local.';
  }
})();