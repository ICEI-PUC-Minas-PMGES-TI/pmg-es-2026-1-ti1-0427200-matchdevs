document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:3000";

    const PERFIL_URL = `${API_URL}/perfil`;
    const EXPERIENCIAS_URL = `${API_URL}/experiencias`;
    const EDUCACOES_URL = `${API_URL}/educacoes`;
    const HABILIDADES_URL = `${API_URL}/habilidades`;
    const CERTIFICACOES_URL = `${API_URL}/certificacoes`;

    const getElement = (id) => document.getElementById(id);

    const nomeUsuarioEl = getElement("nome-usuario");
    const cargoUsuarioEl = getElement("cargo-usuario");
    const localUsuarioEl = getElement("local-usuario");
    const sobreUsuarioEl = getElement("sobre-usuario");
    const listaExperienciasEl = getElement("lista-experiencias");
    const listaEducacaoEl = getElement("lista-educacao");
    const listaContatoEl = getElement("lista-contato");
    const listaHabilidadesEl = getElement("lista-habilidades");
    const listaCertificacoesEl = getElement("lista-certificacoes");

    function normalizarUrl(valor) {
        if (!valor) return "#";

        if (valor.startsWith("http://") || valor.startsWith("https://")) {
            return valor;
        }

        return `https://${valor}`;
    }

    async function carregarPerfil() {
        try {
            const [
                perfilRes,
                experienciasRes,
                educacoesRes,
                habilidadesRes,
                certificacoesRes
            ] = await Promise.all([
                fetch(PERFIL_URL),
                fetch(EXPERIENCIAS_URL),
                fetch(EDUCACOES_URL),
                fetch(HABILIDADES_URL),
                fetch(CERTIFICACOES_URL)
            ]);

            if (
                !perfilRes.ok ||
                !experienciasRes.ok ||
                !educacoesRes.ok ||
                !habilidadesRes.ok ||
                !certificacoesRes.ok
            ) {
                throw new Error("Não foi possível carregar os dados do perfil.");
            }

            const perfilData = await perfilRes.json();
            const experiencias = await experienciasRes.json();
            const educacoes = await educacoesRes.json();
            const habilidades = await habilidadesRes.json();
            const certificacoes = await certificacoesRes.json();

            const perfil = Array.isArray(perfilData) ? perfilData[0] : perfilData;

            nomeUsuarioEl.textContent = perfil.nome || "";
            cargoUsuarioEl.textContent = perfil.cargo || "";
            localUsuarioEl.textContent = perfil.local || "";
            sobreUsuarioEl.textContent = perfil.sobre || "";

            const linkedinUrl = normalizarUrl(perfil.linkedin);
            const githubUrl = normalizarUrl(perfil.github);

            listaContatoEl.innerHTML = `
                <li><strong>Email:</strong> ${perfil.email || "—"}</li>
                <li><strong>Telefone:</strong> ${perfil.tel || "—"}</li>
                <li>
                    <strong>LinkedIn:</strong>
                    ${linkedinUrl}
                        ${perfil.linkedin || "—"}
                    </a>
                </li>
                <li>
                    <strong>GitHub:</strong>
                    ${githubUrl}
                        ${perfil.github || "—"}
                    </a>
                </li>
            `;

            listaExperienciasEl.innerHTML = experiencias.map(exp => `
                <div class="item-lista">
                    <div class="item-icone" style="background-color: ${exp.cor || "#4c4cd6"}">
                        <span>${exp.empresa ? exp.empresa.charAt(0) : "E"}</span>
                    </div>

                    <div class="item-conteudo">
                        <h3>${exp.cargo || ""}</h3>
                        <p class="subtitulo">${exp.empresa || ""} · ${exp.modalidade || ""}</p>
                        <p class="meta">${exp.inicio || ""} - ${exp.fim || "Presente"} · ${exp.local || ""}</p>
                        <p class="descricao">${exp.desc || ""}</p>
                    </div>
                </div>
            `).join("");

            listaEducacaoEl.innerHTML = educacoes.map(edu => `
                <div class="item-lista">
                    <div class="item-icone" style="background-color: #333">
                        <span>🎓</span>
                    </div>

                    <div class="item-conteudo">
                        <h3>${edu.curso || ""}</h3>
                        <p class="subtitulo">${edu.instituicao || ""}</p>
                        <p class="meta">${edu.inicio || ""} - ${edu.fim || "Cursando"}</p>
                    </div>
                </div>
            `).join("");

            listaHabilidadesEl.innerHTML = habilidades.map(hab => `
                <span class="habilidade-tag">${hab.nome || ""}</span>
            `).join("");

            listaCertificacoesEl.innerHTML = certificacoes.map(cert => `
                <div class="item-lista">
                    <div class="item-icone" style="background-color: #f59e0b">
                        <span>${cert.icone || "🏆"}</span>
                    </div>

                    <div class="item-conteudo">
                        <h3>${cert.nome || ""}</h3>
                        <p class="subtitulo">${cert.emissor || ""} · ${cert.ano || ""}</p>
                    </div>
                </div>
            `).join("");

        } catch (error) {
            console.error("Erro:", error);

            const mainContent = document.querySelector(".conteudo-perfil");

            if (mainContent) {
                mainContent.innerHTML = `
                    <p style="text-align: center; color: red;">
                        ${error.message}
                    </p>
                `;
            }
        }
    }

    carregarPerfil();
});