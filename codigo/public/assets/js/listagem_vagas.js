class GerenciadorVagas {
    constructor() {
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

        this.favoritos = this.carregarFavoritos();
        this.container = document.getElementById('listavagas');
        this.input = document.getElementById('campopesquisa');

        this.inicializar();
    }

    carregarFavoritos() {
        const favoritosArmazenados = localStorage.getItem('vagas_favoritas_v2');
        return favoritosArmazenados ? JSON.parse(favoritosArmazenados) : [];
    }

    salvarFavoritos() {
        localStorage.setItem('vagas_favoritas_v2', JSON.stringify(this.favoritos));
    }

    ehFavorita(id) {
        return this.favoritos.includes(id);
    }

    toggleFavorito(id) {
        if (!sessionStorage.getItem('usuarioCorrente')) {
            sessionStorage.setItem('returnURL', window.location.href);
            window.location.href = '../modulos/login/login.html';
            return;
        }
        const index = this.favoritos.indexOf(id);
        
        if (index > -1) {
            this.favoritos.splice(index, 1);
            this.mostrarNotificacao(`Vaga removida dos favoritos!`, 'remover');
        } else {
            this.favoritos.push(id);
            this.mostrarNotificacao(`Vaga adicionada aos favoritos!`, 'adicionar');
        }
        
        this.salvarFavoritos();
        this.renderizar(this.input.value);
    }

    renderizar(filtro = "") {
        this.container.innerHTML = "";
        const termo = filtro.toLowerCase();

        // Filtra as vagas
        const vagasFiltradas = this.vagas.filter(v =>
            v.titulo.toLowerCase().includes(termo) ||
            v.empresa.toLowerCase().includes(termo) ||
            v.localizacao.toLowerCase().includes(termo)
        );

        if (vagasFiltradas.length === 0) {
            this.container.innerHTML = '<div class="vaga-nao-encontrada">Nenhuma vaga encontrada para sua busca.</div>';
            return;
        }

        vagasFiltradas.forEach(vaga => {
            const card = this.criarCardVaga(vaga);
            this.container.appendChild(card);
        });
    }

    criarCardVaga(vaga) {
        const div = document.createElement('div');
        div.className = 'card-vaga';

        const isFavorita = this.ehFavorita(vaga.id);
        const iconeFavorito = isFavorita ? '★' : '☆';
        const classFavorito = isFavorita ? 'ativo' : '';

        const tags = vaga.requisitos
            .map(r => `<span class="tag">${r}</span>`)
            .join('');

        div.innerHTML = `
            <div class="card-header">
                <div>
                    <h3>${vaga.titulo}</h3>
                    <p><strong>${vaga.empresa}</strong> - ${vaga.localizacao}</p>
                </div>
                <button class="btn-favorito ${classFavorito}" onclick="gerenciador.toggleFavorito(${vaga.id})" title="Adicionar aos favoritos">
                    ${iconeFavorito}
                </button>
            </div>

            <div class="info-linha">
                <b>Salário:</b> ${vaga.salario} | <b>Contrato:</b> ${vaga.tipo_contrato}
            </div>

            <p class="descricao-vaga">${vaga.descricao}</p>

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
        const vaga = this.vagas.find(v => v.id === id);
        if (vaga) {
            this.mostrarNotificacao(`Candidatura enviada para: ${vaga.titulo}`, 'sucesso');
        }
    }

    verDetalhes(id) {
        const vaga = this.vagas.find(v => v.id === id);
        if (vaga) {
            const detalhes = `
VAGA: ${vaga.titulo}
EMPRESA: ${vaga.empresa}
LOCALIZAÇÃO: ${vaga.localizacao}
SALÁRIO: ${vaga.salario}
TIPO DE CONTRATO: ${vaga.tipo_contrato}

DESCRIÇÃO:
${vaga.descricao}

REQUISITOS:
${vaga.requisitos.map((r, i) => `${i + 1}. ${r}`).join('\n')}
            `;
            alert(detalhes);
        }
    }

    mostrarNotificacao(mensagem, tipo = 'sucesso') {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'sucesso' ? '#4caf50' : tipo === 'adicionar' ? '#4c4cd6' : '#ff9800'};
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
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    inicializar() {
        this.renderizar();

        this.input.addEventListener('input', (e) => {
            this.renderizar(e.target.value);
        });

        this.adicionarEstilosAnimacao();
    }

    adicionarEstilosAnimacao() {
        const style = document.createElement('style');
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

document.addEventListener('DOMContentLoaded', () => {
    gerenciador = new GerenciadorVagas();
});
