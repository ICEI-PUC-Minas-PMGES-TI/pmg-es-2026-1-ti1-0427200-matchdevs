const API_URL = "https://pmg-es-2026-1-ti1-0427200-matchdevs.onrender.com";
const VAGA_URL = `${API_URL}/vaga`;
const CANDIDATOS_URL = `${API_URL}/candidatos`;
const RESUMO_URL = `${API_URL}/resumo`;

async function init() {
  try {
    const [vagaRes, candidatosRes, resumoRes] = await Promise.all([
      fetch(VAGA_URL),
      fetch(CANDIDATOS_URL),
      fetch(RESUMO_URL)
    ]);

    if (!vagaRes.ok || !candidatosRes.ok || !resumoRes.ok) {
      throw new Error("Erro ao carregar dados do JSON Server.");
    }

    const vagaData = await vagaRes.json();
    const candidatos = await candidatosRes.json();
    const resumoData = await resumoRes.json();

    const data = {
      vaga: Array.isArray(vagaData) ? vagaData[0] : vagaData,
      candidatos,
      resumo: Array.isArray(resumoData) ? resumoData[0] : resumoData
    };

    renderPage(data);
  } catch (erro) {
    console.error("Erro ao carregar comparação:", erro);
  }
}

function renderPage(data) {
  renderVaga(data.vaga);
  renderCabecalhoCandidatos(data.candidatos);
  renderLinhasComparacao(data.candidatos);
  renderResumo(data.resumo, data.candidatos);
}

function renderVaga(vaga) {
  document.getElementById("vaga-titulo").textContent = vaga.titulo;
  document.getElementById("vaga-publicado").textContent = "Publicado em " + vaga.publicado;
}

function renderCabecalhoCandidatos(candidatos) {
  const [a, b] = candidatos;

  document.getElementById("nome-a").textContent = "Candidato " + a.id;
  document.getElementById("nomecompleto-a").textContent = a.nome;
  document.getElementById("cidade-a").textContent = a.cidade;

  document.getElementById("nome-b").textContent = "Candidato " + b.id;
  document.getElementById("nomecompleto-b").textContent = b.nome;
  document.getElementById("cidade-b").textContent = b.cidade;
}

const CAMPOS = [
  {
    titulo: "Compatibilidade",
    render: (c) => `<strong>${c.compatibilidade}%</strong><p>${c.compatibilidadeLabel}</p>`
  },
  {
    titulo: "Experiência",
    render: (c) => `<strong>${c.experiencia}</strong>`
  },
  {
    titulo: "Habilidades",
    render: (c) => c.habilidades.join(", ")
  },
  {
    titulo: "Formação",
    render: (c) => c.formacao
  },
  {
    titulo: "Avaliações",
    render: (c) => c.avaliacaoLabel
  },
  {
    titulo: "Pretensão",
    render: (c) => c.pretensaoLabel
  },
  {
    titulo: "Disponibilidade",
    render: (c) => c.disponibilidade
  }
];

function renderLinhasComparacao(candidatos) {
  const [a, b] = candidatos;
  const container = document.getElementById("linhas-comparacao");

  container.innerHTML = CAMPOS.map(campo => `
    <div class="linha">
      <div class="info">${campo.render(a)}</div>
      <div class="titulo">${campo.titulo}</div>
      <div class="info">${campo.render(b)}</div>
    </div>
  `).join("");
}

function renderResumo(resumo, candidatos) {
  const recomendado = candidatos.find(c => c.id === resumo.recomendado);
  const outro = candidatos.find(c => c.id !== resumo.recomendado);

  document.getElementById("recomendado-nome").textContent =
    "Candidato " + recomendado.id + " — " + recomendado.nome;

  document.getElementById("lista-destaques").innerHTML =
    resumo.destaques.map(d => `<li>${d}</li>`).join("");

  document.getElementById("btn-avancar-a").textContent =
    "Avançar com Candidato " + recomendado.id;

  document.getElementById("btn-avancar-b").textContent =
    "Avançar com Candidato " + outro.id;
}

init();