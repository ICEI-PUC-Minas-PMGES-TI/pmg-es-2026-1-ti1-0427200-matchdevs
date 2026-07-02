const API_URL = "http://localhost:3000";
const VAGA_URL = `${API_URL}/vaga`;
const CANDIDATOS_URL = `${API_URL}/candidatos`;
const PESOS_URL = `${API_URL}/pesos`;

async function init() {
  try {
    const [vagaRes, candidatosRes, pesosRes] = await Promise.all([
      fetch(VAGA_URL),
      fetch(CANDIDATOS_URL),
      fetch(PESOS_URL)
    ]);

    if (!vagaRes.ok || !candidatosRes.ok || !pesosRes.ok) {
      throw new Error("Erro ao carregar dados do JSON Server.");
    }

    const vagaData = await vagaRes.json();
    const candidatos = await candidatosRes.json();
    const pesosData = await pesosRes.json();

    const vaga = Array.isArray(vagaData) ? vagaData[0] : vagaData;
    const pesos = Array.isArray(pesosData) ? pesosData[0] : pesosData;

    const perfil = gerarPerfilIdeal(candidatos);
    const pontuacoes = calcularPontuacoes(candidatos, pesos);

    renderPagina(perfil, pontuacoes, candidatos, vaga, pesos);
  } catch (erro) {
    console.error("Erro ao carregar perfil ideal:", erro);

    const app = document.getElementById("app");

    if (app) {
      app.innerHTML = `
        <div class="page-loading">
          <div class="logo">MatchDevs</div>
          <p>Não foi possível carregar os dados. Verifique se o JSON Server está rodando.</p>
        </div>
      `;
    }
  }
}

function gerarPerfilIdeal(candidatos) {
  const melhorComp = melhor(candidatos, c => c.compatibilidade);
  const melhorExp = melhor(candidatos, c => c.experienciaMeses);
  const melhorAval = melhor(candidatos, c => c.avaliacao);
  const melhorForm = melhor(candidatos, c => c.pesoFormacao);
  const melhorPret = melhor(candidatos, c => -c.pretensao);
  const melhorDisp = melhor(candidatos, c => c.pesoDisponibilidade);

  const todasHabilidades = [...new Set(candidatos.flatMap(c => c.habilidades || []))];

  return {
    compatibilidade: melhorComp.compatibilidade,
    compatibilidadeLabel: melhorComp.compatibilidadeLabel,
    experiencia: melhorExp.experiencia,
    habilidades: todasHabilidades,
    formacao: melhorForm.formacao,
    avaliacaoLabel: melhorAval.avaliacaoLabel,
    pretensaoLabel: melhorPret.pretensaoLabel,
    disponibilidade: melhorDisp.disponibilidade,
    fontes: {
      compatibilidade: melhorComp.id,
      experiencia: melhorExp.id,
      habilidades: candidatos.map(c => c.id).join(" + "),
      formacao: melhorForm.id,
      avaliacao: melhorAval.id,
      pretensao: melhorPret.id,
      disponibilidade: melhorDisp.id
    }
  };
}

function melhor(candidatos, scoreFn) {
  return candidatos.reduce((acc, candidato) =>
    scoreFn(candidato) > scoreFn(acc) ? candidato : acc
  );
}

function calcularPontuacoes(candidatos, pesos) {
  const maxComp = Math.max(...candidatos.map(c => c.compatibilidade || 0));
  const maxExp = Math.max(...candidatos.map(c => c.experienciaMeses || 0));
  const maxAval = Math.max(...candidatos.map(c => c.avaliacao || 0));
  const maxForm = Math.max(...candidatos.map(c => c.pesoFormacao || 0));
  const minPret = Math.min(...candidatos.map(c => c.pretensao || 0));
  const maxPret = Math.max(...candidatos.map(c => c.pretensao || 0));
  const maxDisp = Math.max(...candidatos.map(c => c.pesoDisponibilidade || 0));

  return candidatos.map(candidato => {
    const scores = {
      compatibilidade: maxComp === 0 ? 0 : (candidato.compatibilidade / maxComp) * pesos.compatibilidade,
      experiencia: maxExp === 0 ? 0 : (candidato.experienciaMeses / maxExp) * pesos.experiencia,
      avaliacao: maxAval === 0 ? 0 : (candidato.avaliacao / maxAval) * pesos.avaliacao,
      formacao: maxForm === 0 ? 0 : (candidato.pesoFormacao / maxForm) * pesos.formacao,
      pretensao: maxPret === minPret
        ? pesos.pretensao
        : ((maxPret - candidato.pretensao) / (maxPret - minPret)) * pesos.pretensao,
      disponibilidade: maxDisp === 0
        ? 0
        : (candidato.pesoDisponibilidade / maxDisp) * pesos.disponibilidade
    };

    const total = Object.values(scores).reduce((soma, valor) => soma + valor, 0);

    return {
      id: candidato.id,
      nome: candidato.nome,
      scores,
      total: +(total * 100).toFixed(1)
    };
  });
}

function renderPagina(perfil, pontuacoes, candidatos, vaga, pesos) {
  const melhorCand = pontuacoes.reduce((a, b) => a.total > b.total ? a : b);
  const outroCand = pontuacoes.find(p => p.id !== melhorCand.id);

  const CAMPOS_PERFIL = [
    {
      titulo: "Compatibilidade",
      valor: `<strong>${perfil.compatibilidade}%</strong><p>${perfil.compatibilidadeLabel}</p>`,
      fonte: perfil.fontes.compatibilidade
    },
    {
      titulo: "Experiência",
      valor: `<strong>${perfil.experiencia}</strong>`,
      fonte: perfil.fontes.experiencia
    },
    {
      titulo: "Habilidades",
      valor: perfil.habilidades.join(", "),
      fonte: perfil.fontes.habilidades
    },
    {
      titulo: "Formação",
      valor: perfil.formacao,
      fonte: perfil.fontes.formacao
    },
    {
      titulo: "Avaliações",
      valor: perfil.avaliacaoLabel,
      fonte: perfil.fontes.avaliacao
    },
    {
      titulo: "Pretensão",
      valor: perfil.pretensaoLabel,
      fonte: perfil.fontes.pretensao
    },
    {
      titulo: "Disponibilidade",
      valor: perfil.disponibilidade,
      fonte: perfil.fontes.disponibilidade
    }
  ];

  const LABELS_PESO = {
    compatibilidade: "Compat.",
    experiencia: "Exp.",
    avaliacao: "Aval.",
    formacao: "Form.",
    pretensao: "Pret.",
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
        <a href="comparacao_candidatos.html" class="voltar">← Voltar para comparação</a>

        <h1>Perfil Ideal para a Vaga</h1>

        <p class="subtitulo">
          Gerado combinando o melhor de cada candidato para
          <strong>${vaga.titulo}</strong>.
        </p>

        <div class="comparacao">
          <div class="linha topo-candidatos" style="grid-template-columns:1fr;">
            <div class="candidato">
              <div class="avatar" style="background:#4a90d9;"></div>

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
                    const pct = pesos[k] === 0 ? 0 : Math.round((v / pesos[k]) * 100);

                    return `
                      <div class="score-item">
                        <div class="score-label">${LABELS_PESO[k]}</div>

                        <div class="score-trilho">
                          <div class="score-barra" style="width:${pct}%;"></div>
                        </div>

                        <div class="score-valor">${pct}%</div>
                      </div>
                    `;
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

      <aside class="sidebar">
        <div class="card">
          <h3>Vaga</h3>
          <p>${vaga.titulo}</p>
          <span>Publicado em ${vaga.publicado || vaga.data_publicacao || "—"}</span>
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

          <button class="btn-claro" onclick="location.href='comparacao_candidatos.html'">
            ← Voltar à comparação
          </button>
        </div>
      </aside>
    </main>
  `;
}

init();
