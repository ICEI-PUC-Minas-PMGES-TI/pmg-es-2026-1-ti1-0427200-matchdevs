const API_URL = "https://pmg-es-2026-1-ti1-0427200-matchdevs.onrender.com";
const VAGAS_URL = `${API_URL}/vagas`;

class GerenciadorVagas {
    constructor() {
        this.vagas = [];
        this.favoritos = this.carregarFavoritos();
        this.container = document.getElementById("listavagas");
        this.input = document.getElementById("campopesquisa");

        this.inicializar();
    }

    async carregarVagas() {
        try {
            const resposta = await fetch(VAGAS_URL);

            if (!resposta.ok) throw new Error("Erro ao carregar vagas.");

            this.vagas = await resposta.json();

        } catch (erro) {
            console.error("Erro ao carregar vagas:", erro);
            this.vagas = [];
        }
    }

    carregarFavoritos() {
        return JSON.parse(localStorage.getItem("vagas_favoritas_v2") || "[]").map(Number);
    }

    salvarFavoritos() {
        localStorage.setItem("vagas_favoritas_v2", JSON.stringify(this.favoritos));
    }

    ehFavorita(id) {
        return this.favoritos.includes(Number(id));
    }

    toggleFavorito(id) {
        id = Number(id);

        if (!sessionStorage.getItem("usuarioCorrente")) {
            sessionStorage.setItem("returnURL", window.location.pathname.split("/").pop());
            window.location.href = "login.html";
            return;
        }

        const index = this.favoritos.indexOf(id);

        if (index > -1) {
            this.favoritos.splice(index, 1);
            this.mostrarNotificacao("Vaga removida dos favoritos!", "remover");
        } else {
            this.favoritos.push(id);
            this.mostrarNotificacao("Vaga adicionada aos favoritos!", "adicionar");
        }

        this.salvarFavoritos();
        this.renderizar(this.input ? this.input.value : "");
    }

    renderizar(filtro = "") {
        if (!this.container) return;

        this.container.innerHTML = "";

        const termo = filtro.toLowerCase();

        const vagasFiltradas = this.vagas.filter(vaga => {
            const titulo = vaga.titulo || "";
            const empresa = vaga.empresa || "";
            const localizacao = vaga.localizacao || "";
            const descricao = vaga.descricao || "";
            const requisitos = vaga.requisitos || [];

            return (
                titulo.toLowerCase().includes(termo) ||
                empresa.toLowerCase().includes(termo) ||
                localizacao.toLowerCase().includes(termo) ||
                descricao.toLowerCase().includes(termo) ||
                requisitos.some(req => String(req).toLowerCase().includes(termo))
            );
        });

        if (vagasFiltradas.length === 0) {
            this.container.innerHTML =
                '<div class="vaga-nao-encontrada">Nenhuma vaga encontrada.</div>';
            return;
        }

        vagasFiltradas.forEach(vaga => {
            this.container.appendChild(this.criarCardVaga(vaga));
        });
    }

    criarCardVaga(vaga) {
        const div = document.createElement("div");
        div.className = "card-vaga";

        const isFavorita = this.ehFavorita(vaga.id);
        const iconeFavorito = isFavorita ? "★" : "☆";
        const classFavorito = isFavorita ? "ativo" : "";

        const requisitos = vaga.requisitos || [];
        const tipoContrato = vaga.tipo_contrato || vaga.tipo || "Não informado";

        const tags = requisitos.length
            ? requisitos.map(req => `<span class="tag">${req}</span>`).join("")
            : `<span class="tag">${tipoContrato}</span>`;

        div.innerHTML = `
            <div class="card-header">
                <div>
                    <h3>${vaga.titulo || "Vaga sem título"}</h3>
                    <p>
                        <strong>${vaga.empresa || "Empresa não informada"}</strong> -
                        ${vaga.localizacao || "Localização não informada"}
                    </p>
                </div>

                <button
                    class="btn-favorito ${classFavorito}"
                    onclick="window.gerenciador.toggleFavorito(${vaga.id})"
                    title="Adicionar aos favoritos"
                >
                    ${iconeFavorito}
                </button>
            </div>

            <div class="info-linha">
                <b>Salário:</b> ${vaga.salario || "Não informado"} |
                <b>Contrato:</b> ${tipoContrato}
            </div>

            <p class="descricao-vaga">
                ${vaga.descricao || "Descrição não informada."}
            </p>

            <div class="tag-container">
                ${tags}
            </div>

            <div class="botoes-container">
                <button class="btn" onclick="window.gerenciador.candidatar(${vaga.id})">
                    Candidatar-se
                </button>

                <button class="btn btn-secundario" onclick="window.gerenciador.verDetalhes(${vaga.id})">
                    Ver Detalhes
                </button>
            </div>
        `;

        return div;
    }

    candidatar(id) {
        const vaga = this.vagas.find(item => Number(item.id) === Number(id));
        if (!vaga) return;

        const usuario = JSON.parse(sessionStorage.getItem("usuarioCorrente") || "null");

        if (!usuario) {
            sessionStorage.setItem("returnURL", window.location.pathname.split("/").pop());
            window.location.href = "login.html";
            return;
        }

        const candidaturas = JSON.parse(localStorage.getItem("candidaturas_bhworks") || "[]");

        const jaCandidatou = candidaturas.some(item => {
            return Number(item.vagaId) === Number(vaga.id) && Number(item.usuarioId) === Number(usuario.id);
        });

        if (jaCandidatou) {
            this.mostrarNotificacao("Você já se candidatou a esta vaga.", "remover");
            return;
        }

        candidaturas.push({
            id: Date.now(),
            vagaId: vaga.id,
            vagaTitulo: vaga.titulo,
            usuarioId: usuario.id,
            usuarioNome: usuario.nome,
            data: new Date().toISOString()
        });

        localStorage.setItem("candidaturas_bhworks", JSON.stringify(candidaturas));
        this.mostrarNotificacao(`Candidatura enviada para: ${vaga.titulo}`, "sucesso");
    }

    verDetalhes(id) {
        const vaga = this.vagas.find(item => Number(item.id) === Number(id));
        if (!vaga) return;

        const requisitos = vaga.requisitos || [];
        const tipoContrato = vaga.tipo_contrato || vaga.tipo || "Não informado";

        alert(`
VAGA: ${vaga.titulo || "Vaga sem título"}
EMPRESA: ${vaga.empresa || "Empresa não informada"}
LOCALIZAÇÃO: ${vaga.localizacao || "Não informada"}
SALÁRIO: ${vaga.salario || "Não informado"}
TIPO DE CONTRATO: ${tipoContrato}

DESCRIÇÃO:
${vaga.descricao || "Descrição não informada."}

REQUISITOS:
${requisitos.length ? requisitos.map((req, index) => `${index + 1}. ${req}`).join("\n") : "Nenhum requisito cadastrado."}
        `);
    }

    mostrarNotificacao(mensagem, tipo = "sucesso") {
        const notif = document.createElement("div");

        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === "sucesso" ? "#4caf50" : tipo === "adicionar" ? "#4c4cd6" : "#ff9800"};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
        `;

        notif.textContent = mensagem;
        document.body.appendChild(notif);

        setTimeout(() => notif.remove(), 3000);
    }

    async inicializar() {
        await this.carregarVagas();
        this.renderizar();

        if (this.input) {
            this.input.addEventListener("input", event => {
                this.renderizar(event.target.value);
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.gerenciador = new GerenciadorVagas();
});