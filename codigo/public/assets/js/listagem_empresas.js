const API_URL = "http://localhost:3000";

const EMPRESAS_URL = `${API_URL}/empresas`;

class GerenciadorEmpresas {
    constructor() {
        this.empresas = [];
        this.favoritos = this.carregarFavoritos();
        this.container = document.getElementById("listaempresas");
        this.input = document.getElementById("campopesquisa");

        this.inicializar();
    }

    async carregarEmpresas() {
        try {
            const resposta = await fetch(EMPRESAS_URL);

            if (!resposta.ok) {
                throw new Error("Erro ao carregar empresas.");
            }

            this.empresas = await resposta.json();

        } catch (erro) {
            console.error("Erro ao carregar empresas:", erro);
            this.empresas = [];

            if (this.container) {
                this.container.innerHTML = `
                    <div class="empresa-nao-encontrada">
                        Erro ao carregar empresas. Verifique se a API está rodando.
                    </div>
                `;
            }
        }
    }

    carregarFavoritos() {
        return JSON.parse(localStorage.getItem("empresas_favoritas_v2") || "[]").map(Number);
    }

    salvarFavoritos() {
        localStorage.setItem("empresas_favoritas_v2", JSON.stringify(this.favoritos));
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
            this.mostrarNotificacao("Empresa removida dos favoritos!", "remover");
        } else {
            this.favoritos.push(id);
            this.mostrarNotificacao("Empresa adicionada aos favoritos!", "adicionar");
        }

        this.salvarFavoritos();
        this.renderizar(this.input ? this.input.value : "");
    }

    renderizar(filtro = "") {
        if (!this.container) return;

        this.container.innerHTML = "";

        const termo = filtro.toLowerCase();

        const empresasFiltradas = this.empresas.filter(empresa => {
            const nome = empresa.nome || "";
            const setor = empresa.setor || "";
            const localizacao = empresa.localizacao || "";
            const descricao = empresa.descricao || "";

            return (
                nome.toLowerCase().includes(termo) ||
                setor.toLowerCase().includes(termo) ||
                localizacao.toLowerCase().includes(termo) ||
                descricao.toLowerCase().includes(termo)
            );
        });

        if (empresasFiltradas.length === 0) {
            this.container.innerHTML = `
                <div class="empresa-nao-encontrada">
                    Nenhuma empresa encontrada.
                </div>
            `;
            return;
        }

        empresasFiltradas.forEach(empresa => {
            this.container.appendChild(this.criarCardEmpresa(empresa));
        });
    }

    criarCardEmpresa(empresa) {
        const div = document.createElement("div");
        div.className = "card-empresa";

        const isFavorita = this.ehFavorita(empresa.id);
        const iconeFavorito = isFavorita ? "★" : "☆";
        const classFavorito = isFavorita ? "ativo" : "";

        const especialidades = empresa.especialidades || empresa.habilidades || [];
        const porte = empresa.porte || empresa.funcionarios || "Não informado";
        const fundacao = empresa.fundacao || "Não informado";

        const tags = especialidades.length
            ? especialidades.map(item => `<span class="tag">${item}</span>`).join("")
            : `<span class="tag">${empresa.setor || "Empresa"}</span>`;

        div.innerHTML = `
            <div class="card-header">
                <div>
                    <h3>${empresa.nome || "Empresa sem nome"}</h3>
                    <p>
                        <strong>${empresa.setor || "Setor não informado"}</strong> -
                        ${empresa.localizacao || "Localização não informada"}
                    </p>
                </div>

                <button
                    class="btn-favorito ${classFavorito}"
                    onclick="window.gerenciador.toggleFavorito(${empresa.id})"
                    title="Adicionar aos favoritos"
                >
                    ${iconeFavorito}
                </button>
            </div>

            <div class="info-linha">
                <b>Porte:</b> ${porte} | <b>Fundação:</b> ${fundacao}
            </div>

            <p class="descricao-empresa">
                ${empresa.descricao || "Descrição não informada."}
            </p>

            <div class="tag-container">
                ${tags}
            </div>

            <div class="botoes-container">
                <button class="btn" onclick="window.gerenciador.verPerfil(${empresa.id})">
                    Ver Perfil
                </button>

                <button class="btn btn-secundario" onclick="window.gerenciador.contatoEmpresa(${empresa.id})">
                    Enviar Contato
                </button>
            </div>
        `;

        return div;
    }

    verPerfil(id) {
        const empresa = this.empresas.find(item => Number(item.id) === Number(id));

        if (!empresa) {
            this.mostrarNotificacao("Empresa não encontrada.", "remover");
            return;
        }

        localStorage.setItem("empresaVisualizada", JSON.stringify(empresa));

        window.location.href = "perfil_empresa.html";
    }

    contatoEmpresa(id) {
        const empresa = this.empresas.find(item => Number(item.id) === Number(id));

        if (!empresa) {
            this.mostrarNotificacao("Empresa não encontrada.", "remover");
            return;
        }

        const usuario = JSON.parse(sessionStorage.getItem("usuarioCorrente") || "null");

        if (!usuario) {
            sessionStorage.setItem("returnURL", window.location.pathname.split("/").pop());
            window.location.href = "login.html";
            return;
        }

        const contatos = JSON.parse(localStorage.getItem("contatos_empresas") || "[]");

        contatos.push({
            id: Date.now(),
            empresaId: empresa.id,
            empresaNome: empresa.nome,
            usuarioId: usuario.id,
            usuarioNome: usuario.nome,
            data: new Date().toISOString()
        });

        localStorage.setItem("contatos_empresas", JSON.stringify(contatos));

        this.mostrarNotificacao(`Mensagem de contato enviada para ${empresa.nome}!`, "sucesso");
    }

    mostrarNotificacao(mensagem, tipo = "sucesso") {
        const notif = document.createElement("div");

        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${
                tipo === "sucesso"
                    ? "#4caf50"
                    : tipo === "adicionar"
                    ? "#4c4cd6"
                    : "#ff9800"
            };
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
        `;

        notif.textContent = mensagem;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.remove();
        }, 3000);
    }

    async inicializar() {
        await this.carregarEmpresas();
        this.renderizar();

        if (this.input) {
            this.input.addEventListener("input", event => {
                this.renderizar(event.target.value);
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.gerenciador = new GerenciadorEmpresas();
});