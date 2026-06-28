// app.js — carrega data.json e renderiza a página de comparação (index.html)

async function init() {
  const res = await fetch("data.json");
  const data = await res.json();
  renderPage(data);
}

function renderPage(data) {
  renderVaga(data.vaga);
  renderCabecalhoCandidatos(data.candidatos);
  renderLinhasComparacao(data.candidatos);
  renderResumo(data.resumo, data.candidatos);
}

// ── Sidebar: vaga ──────────────────────────────────────────────────────────
function renderVaga(vaga) {
  document.getElementById("vaga-titulo").textContent = vaga.titulo;
  document.getElementById("vaga-publicado").textContent = "Publicado em " + vaga.publicado;
}

// ── Cabeçalho dos candidatos ───────────────────────────────────────────────
function renderCabecalhoCandidatos(candidatos) {
  const [a, b] = candidatos;

  document.getElementById("nome-a").textContent        = "Candidato " + a.id;
  document.getElementById("nomecompleto-a").textContent = a.nome;
  document.getElementById("cidade-a").textContent       = a.cidade;

  document.getElementById("nome-b").textContent        = "Candidato " + b.id;
  document.getElementById("nomecompleto-b").textContent = b.nome;
  document.getElementById("cidade-b").textContent       = b.cidade;
}

// ── Linhas de comparação ───────────────────────────────────────────────────
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

// ── Sidebar: resumo e próximos passos ─────────────────────────────────────
function renderResumo(resumo, candidatos) {
  const recomendado = candidatos.find(c => c.id === resumo.recomendado);
  const outro       = candidatos.find(c => c.id !== resumo.recomendado);

  document.getElementById("recomendado-nome").textContent =
    "Candidato " + recomendado.id + " — " + recomendado.nome;

  document.getElementById("lista-destaques").innerHTML =
    resumo.destaques.map(d => `<li>${d}</li>`).join("");

  document.getElementById("btn-avancar-a").textContent =
    "Avançar com Candidato " + recomendado.id;
  document.getElementById("btn-avancar-b").textContent =
    "Avançar com Candidato " + outro.id;
}

// ── Start ──────────────────────────────────────────────────────────────────
init();