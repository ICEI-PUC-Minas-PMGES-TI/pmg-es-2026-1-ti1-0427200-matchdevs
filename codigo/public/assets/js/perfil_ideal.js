// perfil.js — gera o perfil ideal e a pontuação ponderada (perfil.html)

async function init() {
  const res = await fetch("data.json");
  const data = await res.json();

  const perfil     = gerarPerfilIdeal(data.candidatos);
  const pontuacoes = calcularPontuacoes(data.candidatos, data.pesos);

  renderPagina(perfil, pontuacoes, data.candidatos, data.vaga, data.pesos);
}

// ── 1. Perfil ideal ────────────────────────────────────────────────────────
function gerarPerfilIdeal(candidatos) {
  const melhorComp  = melhor(candidatos, c => c.compatibilidade);
  const melhorExp   = melhor(candidatos, c => c.experienciaMeses);
  const melhorAval  = melhor(candidatos, c => c.avaliacao);
  const melhorForm  = melhor(candidatos, c => c.pesoFormacao);
  const melhorPret  = melhor(candidatos, c => -c.pretensao);   // menor pretensão = melhor
  const melhorDisp  = melhor(candidatos, c => c.pesoDisponibilidade);

  // União de todas as habilidades sem repetição
  const todasHabilidades = [...new Set(candidatos.flatMap(c => c.habilidades))];

  return {
    compatibilidade:      melhorComp.compatibilidade,
    compatibilidadeLabel: melhorComp.compatibilidadeLabel,
    experiencia:          melhorExp.experiencia,
    habilidades:          todasHabilidades,
    formacao:             melhorForm.formacao,
    avaliacaoLabel:       melhorAval.avaliacaoLabel,
    pretensaoLabel:       melhorPret.pretensaoLabel,
    disponibilidade:      melhorDisp.disponibilidade,
    // origem de cada campo
    fontes: {
      compatibilidade: melhorComp.id,
      experiencia:     melhorExp.id,
      habilidades:     "A + B",
      formacao:        melhorForm.id,
      avaliacao:       melhorAval.id,
      pretensao:       melhorPret.id,
      disponibilidade: melhorDisp.id
    }
  };
}

function melhor(candidatos, scoreFn) {
  return candidatos.reduce((acc, c) => scoreFn(c) > scoreFn(acc) ? c : acc);
}

// ── 2. Pontuação ponderada ─────────────────────────────────────────────────
function calcularPontuacoes(candidatos, pesos) {
  const maxComp = Math.max(...candidatos.map(c => c.compatibilidade));
  const maxExp  = Math.max(...candidatos.map(c => c.experienciaMeses));
  const maxAval = Math.max(...candidatos.map(c => c.avaliacao));
  const maxForm = Math.max(...candidatos.map(c => c.pesoFormacao));
  const minPret = Math.min(...candidatos.map(c => c.pretensao));
  const maxPret = Math.max(...candidatos.map(c => c.pretensao));
  const maxDisp = Math.max(...candidatos.map(c => c.pesoDisponibilidade));

  return candidatos.map(c => {
    const scores = {
      compatibilidade: (c.compatibilidade / maxComp)   * pesos.compatibilidade,
      experiencia:     (c.experienciaMeses / maxExp)    * pesos.experiencia,
      avaliacao:       (c.avaliacao / maxAval)          * pesos.avaliacao,
      formacao:        (c.pesoFormacao / maxForm)       * pesos.formacao,
      pretensao:       maxPret === minPret ? pesos.pretensao
                         : ((maxPret - c.pretensao) / (maxPret - minPret)) * pesos.pretensao,
      disponibilidade: maxDisp === 0 ? 0
                         : (c.pesoDisponibilidade / maxDisp) * pesos.disponibilidade
    };
    const total = Object.values(scores).reduce((s, v) => s + v, 0);
    return { id: c.id, nome: c.nome, scores, total: +(total * 100).toFixed(1) };
  });
}

// ── 3. Renderização ────────────────────────────────────────────────────────
function renderPagina(perfil, pontuacoes, candidatos, vaga, pesos) {
  const melhorCand = pontuacoes.reduce((a, b) => a.total > b.total ? a : b);
  const outroCand  = pontuacoes.find(p => p.id !== melhorCand.id);

  const CAMPOS_PERFIL = [
    { titulo: "Compatibilidade", valor: `<strong>${perfil.compatibilidade}%</strong><p>${perfil.compatibilidadeLabel}</p>`, fonte: perfil.fontes.compatibilidade },
    { titulo: "Experiência",     valor: `<strong>${perfil.experiencia}</strong>`,              fonte: perfil.fontes.experiencia },
    { titulo: "Habilidades",     valor: perfil.habilidades.join(", "),                        fonte: perfil.fontes.habilidades },
    { titulo: "Formação",        valor: perfil.formacao,                                      fonte: perfil.fontes.formacao },
    { titulo: "Avaliações",      valor: perfil.avaliacaoLabel,                                fonte: perfil.fontes.avaliacao },
    { titulo: "Pretensão",       valor: perfil.pretensaoLabel,                                fonte: perfil.fontes.pretensao },
    { titulo: "Disponibilidade", valor: perfil.disponibilidade,                               fonte: perfil.fontes.disponibilidade }
  ];

  const LABELS_PESO = {
    compatibilidade: "Compat.",
    experiencia:     "Exp.",
    avaliacao:       "Aval.",
    formacao:        "Form.",
    pretensao:       "Pret.",
    disponibilidade: "Disp."
  };

  document.getElementById("app").innerHTML = `
    <header class="topo">
      <div class="logo">Sua Empresa</div>
      <nav class="menu">
        <a href="#">Dashboard</a>
        <a href="#">Vagas</a>
        <a href="#">Candidatos</a>
        <a href="#">Entrevistas</a>
        <a href="#">Relatórios</a>
      </nav>
      <div class="usuario">Recrutador</div>
    </header>

    <main class="container">

      <section class="principal">
        <a href="index.html" class="voltar">← Voltar para comparação</a>
        <h1>Perfil Ideal para a Vaga</h1>
        <p class="subtitulo">
          Gerado combinando o melhor de cada candidato para
          <strong>${vaga.titulo}</strong>.
        </p>

        <!-- PERFIL IDEAL -->
        <div class="comparacao">

          <div class="linha topo-candidatos" style="grid-template-columns:1fr;">
            <div class="candidato">
              <div class="avatar" style="background:#4a90d9;"></div>
              <div>
                <h2>Perfil Ideal</h2>
                <p>Combinação otimizada dos candidatos</p>
                <span>${vaga.titulo}</span>
              </div>
            </div>
          </div>

          ${CAMPOS_PERFIL.map(campo => `
            <div class="linha" style="grid-template-columns:1fr 180px;">
              <div class="info">
                ${campo.valor}
                <span class="badge">Cand. ${campo.fonte}</span>
              </div>
              <div class="titulo">${campo.titulo}</div>
            </div>
          `).join("")}

        </div>

        <!-- PONTUAÇÃO PONDERADA -->
        <h2 style="margin-top:35px;margin-bottom:15px;">Pontuação ponderada</h2>

        <div class="comparacao">

          <div class="linha" style="grid-template-columns:160px 1fr 80px;background:#fafafa;padding:0;">
            <div class="info" style="font-size:13px;color:#555;">Candidato</div>
            <div class="info" style="font-size:13px;color:#555;">Score por critério</div>
            <div class="info" style="font-size:13px;color:#555;text-align:right;">Total</div>
          </div>

          ${pontuacoes.map(p => `
            <div class="linha" style="grid-template-columns:160px 1fr 80px;align-items:center;">
              <div class="info">
                <strong>${p.nome.split(" ")[0]}</strong>
                <p>Candidato ${p.id}</p>
              </div>
              <div class="info">
                <div class="score-barras">
                  ${Object.entries(p.scores).map(([k, v]) => {
                    const pct = Math.round((v / pesos[k]) * 100);
                    return `
                      <div class="score-item">
                        <div class="score-label">${LABELS_PESO[k]}</div>
                        <div class="score-trilho">
                          <div class="score-barra" style="width:${pct}%;"></div>
                        </div>
                        <div class="score-valor">${pct}%</div>
                      </div>`;
                  }).join("")}
                </div>
              </div>
              <div class="info" style="text-align:right;">
                <strong style="font-size:20px;">${p.total}%</strong>
              </div>
            </div>
          `).join("")}

        </div>
      </section>

      <!-- SIDEBAR -->
      <aside class="sidebar">

        <div class="card">
          <h3>Vaga</h3>
          <p>${vaga.titulo}</p>
          <span>Publicado em ${vaga.publicado}</span>
        </div>

        <div class="card">
          <h3>Candidato recomendado</h3>
          <div class="recomendado">
            <strong>Candidato ${melhorCand.id} — ${melhorCand.nome.split(" ")[0]}</strong>
            <p>Pontuação: ${melhorCand.total}%</p>
          </div>
        </div>

        <div class="card">
          <h3>Pesos utilizados</h3>
          ${Object.entries(pesos).map(([k, v]) => `
            <div class="peso-linha">
              <span>${LABELS_PESO[k]}</span>
              <strong>${(v * 100).toFixed(0)}%</strong>
            </div>
          `).join("")}
        </div>

        <div class="card">
          <h3>Próximos passos</h3>
          <button class="btn-escuro">
            Avançar com Candidato ${melhorCand.id}
          </button>
          <button class="btn-claro" onclick="location.href='index.html'">
            ← Voltar à comparação
          </button>
        </div>

      </aside>

    </main>
  `;
}

// ── Start ──────────────────────────────────────────────────────────────────
init();