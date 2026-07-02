let userPosition = null;

const API_URL = "https://pmg-es-2026-1-ti1-0427200-matchdevs.onrender.com";
const VAGAS_URL = `${API_URL}/vagas`;

const GOOGLE_MAPS_CONFIG = {
  mapId: "DEMO_MAP_ID",
  defaultCenter: { lat: -19.9167, lng: -43.9345 },
  defaultZoom: 11,
  minFocusZoom: 13
};

let allJobs = [];
let filteredJobs = [];
let map;
let infoWindow;
let geocoder;
let AdvancedMarkerElement;
let PinElement;
let markerById = new Map();
let renderMarkersRunId = 0;

const els = {
  search: document.getElementById("searchInput"),
  type: document.getElementById("typeSelect"),
  location: document.getElementById("locationSelect"),
  useLocationBtn: document.getElementById("useLocationBtn"),
  list: document.getElementById("jobsList"),
  empty: document.getElementById("emptyState"),
  modal: document.getElementById("detailsModal"),
  modalContent: document.getElementById("modalContent")
};

function normalize(str) {
  return (str || "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return (value ?? "").toString().replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[char]));
}

function moneyOrDash(value) {
  return value || "—";
}

function formatDateBR(value) {
  if (!value) return "—";

  const date = new Date(value + "T00:00:00");

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
}

function getTipoContrato(job) {
  return job.tipo_contrato || job.tipo || "—";
}

function hasCoordinates(job) {
  return Number.isFinite(Number(job.lat)) && Number.isFinite(Number(job.lng));
}

function toRadians(value) {
  return value * Math.PI / 180;
}

function calculateDistanceKm(origin, destination) {
  const earthRadiusKm = 6371;

  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);

  const lat1 = toRadians(origin.lat);
  const lat2 = toRadians(destination.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function formatDistanceKm(distanceKm) {
  if (!Number.isFinite(distanceKm)) return "—";

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1).replace(".", ",")} km`;
}

function getJobDistanceLabel(job) {
  if (!userPosition) {
    return "Distância: permita sua localização";
  }

  if (!hasCoordinates(job)) {
    return "Distância: coordenadas da vaga não informadas";
  }

  const destination = {
    lat: Number(job.lat),
    lng: Number(job.lng)
  };

  const distanceKm = calculateDistanceKm(userPosition, destination);

  return `Distância aproximada: ${formatDistanceKm(distanceKm)}`;
}

async function initMap() {
  const mapElement = document.getElementById("map");

  if (!mapElement) {
    throw new Error("Elemento #map não encontrado no HTML.");
  }

  const [{ Map, InfoWindow }, markerLibrary, geocodingLibrary] = await Promise.all([
    google.maps.importLibrary("maps"),
    google.maps.importLibrary("marker"),
    google.maps.importLibrary("geocoding")
  ]);

  AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement;
  PinElement = markerLibrary.PinElement;
  geocoder = new geocodingLibrary.Geocoder();

  map = new Map(mapElement, {
    center: GOOGLE_MAPS_CONFIG.defaultCenter,
    zoom: GOOGLE_MAPS_CONFIG.defaultZoom,
    mapId: GOOGLE_MAPS_CONFIG.mapId,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true
  });

  infoWindow = new InfoWindow();

  setTimeout(() => {
    google.maps.event.trigger(map, "resize");
    map.setCenter(GOOGLE_MAPS_CONFIG.defaultCenter);
  }, 300);
}

function populateFilters(jobs) {
  const types = Array.from(
    new Set(jobs.map(job => getTipoContrato(job)).filter(tipo => tipo && tipo !== "—"))
  ).sort();

  const locations = Array.from(
    new Set(jobs.map(job => job.localizacao).filter(Boolean))
  ).sort();

  els.type.innerHTML = `<option value="">Todos os tipos</option>`;
  els.location.innerHTML = `<option value="">Todas as localidades</option>`;

  types.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    els.type.appendChild(option);
  });

  locations.forEach(location => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    els.location.appendChild(option);
  });
}

function applyFilters() {
  const search = normalize(els.search.value);
  const type = els.type.value;
  const location = els.location.value;

  filteredJobs = allJobs.filter(job => {
    const requisitos = Array.isArray(job.requisitos) ? job.requisitos : [];

    const matchText =
      !search ||
      normalize(job.titulo).includes(search) ||
      normalize(job.empresa).includes(search) ||
      normalize(job.descricao).includes(search) ||
      requisitos.some(req => normalize(req).includes(search));

    const matchType = !type || getTipoContrato(job) === type;
    const matchLocation = !location || job.localizacao === location;

    return matchText && matchType && matchLocation;
  });

  renderJobs(filteredJobs);
  renderMarkers(filteredJobs);
}

function renderJobs(jobs) {
  if (!els.list || !els.empty) return;

  els.list.innerHTML = "";
  els.empty.hidden = jobs.length !== 0;

  jobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";
    card.dataset.id = job.id;

    const info = document.createElement("div");
    info.className = "job-info";

    info.innerHTML = `
      <h3>${escapeHtml(job.titulo || "Vaga sem título")}</h3>
      <h4>${escapeHtml(job.empresa || "Empresa não informada")}</h4>
      <p>${escapeHtml(job.localizacao || "Localização não informada")}</p>

      <div class="job-distance">
        ${escapeHtml(getJobDistanceLabel(job))}
      </div>

      <div class="job-meta">
        ${escapeHtml(getTipoContrato(job))}
        •
        ${escapeHtml(moneyOrDash(job.salario))}
        •
        ${escapeHtml(formatDateBR(job.data_publicacao))}
      </div>
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Ver detalhes";

    button.addEventListener("click", event => {
      event.stopPropagation();
      openDetails(job);
    });

    card.addEventListener("click", () => focusJob(job.id));

    card.appendChild(info);
    card.appendChild(button);
    els.list.appendChild(card);
  });
}

function clearActiveCard() {
  document
    .querySelectorAll(".job-card.is-active")
    .forEach(card => card.classList.remove("is-active"));
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }

  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildInfoWindowContent(job) {
  return `
    <div class="map-popup">
      <strong>${escapeHtml(job.titulo || "Vaga")}</strong><br>
      ${escapeHtml(job.empresa || "Empresa não informada")}<br>
      <small>${escapeHtml(job.localizacao || "Localização não informada")}</small>
    </div>
  `;
}

function focusJob(jobId) {
  clearActiveCard();

  const card = document.querySelector(
    `.job-card[data-id="${cssEscape(String(jobId))}"]`
  );

  if (card) {
    card.classList.add("is-active");
    card.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  const markerData = markerById.get(jobId);

  if (markerData && map && infoWindow) {
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

function removeAllMarkers() {
  for (const markerData of markerById.values()) {
    markerData.marker.map = null;
  }

  markerById.clear();

  if (infoWindow) {
    infoWindow.close();
  }
}

function createRedMarker(position, job) {
  const pin = new PinElement({
    background: "#ef4444",
    borderColor: "#b91c1c",
    glyphColor: "#ffffff"
  });

  return new AdvancedMarkerElement({
    map,
    position,
    title: `${job.titulo || "Vaga"} - ${job.empresa || ""}`,
    content: pin.element
  });
}

async function getJobPosition(job) {
  if (hasCoordinates(job)) {
    return {
      lat: Number(job.lat),
      lng: Number(job.lng)
    };
  }

  if (!job.localizacao || !geocoder) {
    return null;
  }

  try {
    const response = await geocoder.geocode({
      address: job.localizacao,
      componentRestrictions: { country: "BR" },
      language: "pt-BR",
      region: "BR"
    });

    const location = response.results?.[0]?.geometry?.location;

    if (!location) return null;

    return {
      lat: location.lat(),
      lng: location.lng()
    };

  } catch (error) {
    console.warn(`Não foi possível geocodificar: ${job.localizacao}`, error);
    return null;
  }
}

async function renderMarkers(jobs) {
  if (!map) return;

  const currentRunId = ++renderMarkersRunId;

  removeAllMarkers();

  const bounds = new google.maps.LatLngBounds();
  let markerCount = 0;

  for (const job of jobs) {
    const position = await getJobPosition(job);

    if (currentRunId !== renderMarkersRunId) return;
    if (!position) continue;

    const marker = createRedMarker(position, job);
    const content = buildInfoWindowContent(job);

    marker.addListener("click", () => {
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

  if (markerCount === 1) {
    map.setCenter(bounds.getCenter());
    map.setZoom(GOOGLE_MAPS_CONFIG.minFocusZoom);
  } else if (markerCount > 1) {
    map.fitBounds(bounds, 60);
  } else {
    map.setCenter(GOOGLE_MAPS_CONFIG.defaultCenter);
    map.setZoom(GOOGLE_MAPS_CONFIG.defaultZoom);
  }
}

function openDetails(job) {
  if (!els.modal || !els.modalContent) return;

  els.modalContent.innerHTML = `
    <h2>${escapeHtml(job.titulo || "Vaga sem título")}</h2>
    <h3>${escapeHtml(job.empresa || "Empresa não informada")} — ${escapeHtml(job.localizacao || "Localização não informada")}</h3>

    <p><b>Tipo de contrato:</b> ${escapeHtml(getTipoContrato(job))}</p>
    <p><b>Salário:</b> ${escapeHtml(moneyOrDash(job.salario))}</p>
    <p><b>Publicado em:</b> ${escapeHtml(formatDateBR(job.data_publicacao))}</p>

    <p>
      <b>Descrição:</b><br>
      ${escapeHtml(job.descricao || "—")}
    </p>

    <p><b>Requisitos:</b></p>

    <ul>
      ${
        (job.requisitos || [])
          .map(req => `<li>${escapeHtml(req)}</li>`)
          .join("") || "<li>—</li>"
      }
    </ul>
  `;

  els.modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  focusJob(job.id);
}

function closeDetails() {
  if (!els.modal) return;

  els.modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function wireModal() {
  if (!els.modal) return;

  els.modal.addEventListener("click", event => {
    const target = event.target;

    if (target && target.hasAttribute("data-close")) {
      closeDetails();
    }
  });

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      els.modal.getAttribute("aria-hidden") === "false"
    ) {
      closeDetails();
    }
  });
}

function debounce(fn, wait = 250) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

async function requestUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada neste navegador."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        userPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        resolve(userPosition);
      },
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

async function loadJobs() {
  const response = await fetch(VAGAS_URL);

  if (!response.ok) {
    throw new Error("Não foi possível carregar as vagas pelo JSON Server.");
  }

  return await response.json();
}

(async function main() {
  wireModal();

  try {
    await initMap();

    allJobs = await loadJobs();

    populateFilters(allJobs);

    els.search.addEventListener("input", debounce(applyFilters, 200));
    els.type.addEventListener("change", applyFilters);
    els.location.addEventListener("change", applyFilters);

    els.useLocationBtn.addEventListener("click", async () => {
      try {
        els.useLocationBtn.textContent = "Obtendo localização...";
        els.useLocationBtn.disabled = true;

        await requestUserLocation();

        els.useLocationBtn.textContent = "Localização ativada";

        renderJobs(filteredJobs);
        renderMarkers(filteredJobs);

      } catch (error) {
        console.warn("Erro ao obter localização:", error);

        els.useLocationBtn.textContent = "Não foi possível obter sua localização";
        els.useLocationBtn.disabled = false;
      }
    });

    applyFilters();

  } catch (error) {
    console.error(error);

    if (els.empty) {
      els.empty.hidden = false;
      els.empty.textContent =
        "Erro ao carregar as vagas ou o Google Maps. Verifique a API key, o JSON Server e o elemento #map.";
    }
  }
})();