const API_URL = "http://localhost:3000";
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

            if (!resposta.ok) {
                throw new Error("Erro ao carregar vagas.");
            }

            this.vagas = await resposta.json();
        } catch (erro) {
            console.error("Erro ao buscar vagas no JSON Server:", erro);

            this.vagas = [
                {
                    id: 1,
                    titulo: "Desenvolvedor Backend",
                    empresa: "BhTech Solutions",
                    localizacao: "Belo Horizonte, MG",
                    tipo_contrato: "CLT",
                    salario: "R$ 8.000,00",
                    descricao: "Responsável por desenvolver e manter APIs escaláveis.",
                    requisitos: ["Node.js", "Conhecimento em bancos de dados relacionais", "Git e metodologias ágeis"]
                },
                {
                    id: 2,
                    titulo: "Analista de Marketing Digital",
                    empresa: "InovaWeb Agency",
                    localizacao: "São Paulo, SP",
                    tipo_contrato: "PJ",
                    salario: "R$ 6.500,00",
                    descricao: "Planejamento e execução de campanhas digitais focadas em performance.",
                    requisitos: ["SEO", "Google Ads", "Meta Ads", "Excel avançado"]
                },
                {
                    id: 3,
                    titulo: "Engenheiro de Dados",
                    empresa: "DataFlow Corp",
                    localizacao: "Curitiba, PR",
                    tipo_contrato: "CLT",
                    salario: "R$ 12.000,00",
                    descricao: "Construção e otimização de pipelines de dados para análise em larga escala.",
                    requisitos: ["Python", "Spark", "AWS", "Modelagem de dados"]
                }
            ];
        }
    }

    carregarFavoritos() {
        const favoritosArmazenados = localStorage.getItem("vagas_favoritas_v2");
        return favoritosArmazenados ? JSON.parse(favoritosArmazenados) : [];
    }

    salvarFavoritos() {
        localStorage.setItem("vagas_favoritas_v2", JSON.stringify(this.favoritos));
    }

    ehFavorita(id) {
        return this.favoritos.includes(id);
    }

    toggleFavorito(id) {
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
        this.renderizar(this.input.value);
    }

    renderizar(filtro = "") {
        this.container.innerHTML = "";

        const termo = filtro.toLowerCase();

        const vagasFiltradas = this.vagas.filter(vaga => {
            const titulo = vaga.titulo || "";
            const empresa = vaga.empresa || "";
            const localizacao = vaga.localizacao || "";

            return (
                titulo.toLowerCase().includes(termo) ||
                empresa.toLowerCase().includes(termo) ||
                localizacao.toLowerCase().includes(termo)
            );
        });

        if (vagasFiltradas.length === 0) {
            this.container.innerHTML =
                '<div class="vaga-nao-encontrada">Nenhuma vaga encontrada para sua busca.</div>';
            return;
        }

        vagasFiltradas.forEach(vaga => {
            const card = this.criarCardVaga(vaga);
            this.container.appendChild(card);
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

        const tags = requisitos
            .map(requisito => `<span class="tag">${requisito}</span>`)
            .join("");

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
                    onclick="gerenciador.toggleFavorito(${vaga.id})" 
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
                <button class="btn" onclick="gerenciador.candidatar(${vaga.id})">
                    Candidatar-se
                </button>

                <button class="btn btn-secundario" onclick="gerenciador.verDetalhes(${vaga.id})">
                    Ver Detalhes
                </button>
            </div>
        `;

        return div;
    }

    candidatar(id) {
        const vaga = this.vagas.find(vaga => vaga.id === id);

        if (vaga) {
            this.mostrarNotificacao(`Candidatura enviada para: ${vaga.titulo}`, "sucesso");
        }
    }

    verDetalhes(id) {
        const vaga = this.vagas.find(vaga => vaga.id === id);

        if (!vaga) {
            return;
        }

        const requisitos = vaga.requisitos || [];
        const tipoContrato = vaga.tipo_contrato || vaga.tipo || "Não informado";

        const detalhes = `
VAGA: ${vaga.titulo || "Vaga sem título"}
EMPRESA: ${vaga.empresa || "Empresa não informada"}
LOCALIZAÇÃO: ${vaga.localizacao || "Não informada"}
SALÁRIO: ${vaga.salario || "Não informado"}
TIPO DE CONTRATO: ${tipoContrato}

DESCRIÇÃO:
${vaga.descricao || "Descrição não informada."}

REQUISITOS:
${requisitos.length > 0 ? requisitos.map((item, index) => `${index + 1}. ${item}`).join("\n") : "Nenhum requisito cadastrado."}
        `;

        alert(detalhes);
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
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;

        notif.textContent = mensagem;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = "slideOut 0.3s ease";

            setTimeout(() => {
                notif.remove();
            }, 300);
        }, 3000);
    }

    async inicializar() {
        await this.carregarVagas();
        this.renderizar();

        this.input.addEventListener("input", event => {
            this.renderizar(event.target.value);
        });

        this.adicionarEstilosAnimacao();
    }

    adicionarEstilosAnimacao() {
        const style = document.createElement("style");

        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }

                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }

                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

let gerenciador;

document.addEventListener("DOMContentLoaded", () => {
    gerenciador = new GerenciadorVagas();
});