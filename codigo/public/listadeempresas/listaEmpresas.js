class GerenciadorEmpresas {
    constructor() {
        this.empresas = [
            {
                id: 1,
                nome: "BhTech Solutions",
                localizacao: "Belo Horizonte, MG",
                setor: "Tecnologia",
                porte: "Médio",
                fundacao: 2018,
                descricao: "Empresa focada em soluções backend escaláveis e inovação tecnológica.",
                especialidades: ["Node.js", "Cloud Computing", "APIs REST"]
            },
            {
                id: 2,
                nome: "InovaWeb Agency",
                localizacao: "Belo Horizonte, MG",
                setor: "Marketing Digital",
                porte: "Pequeno",
                fundacao: 2021,
                descricao: "Agência especializada em campanhas digitais de alta performance.",
                especialidades: ["SEO", "Google Ads", "Social Media"]
            },
            {
                id: 3,
                nome: "Eco Energia Brasil",
                localizacao: "São Paulo, SP",
                setor: "Energia Sustentável",
                porte: "Grande",
                fundacao: 2015,
                descricao: "Soluções em energia solar e sustentabilidade ambiental.",
                especialidades: ["Energia Solar", "Sustentabilidade", "Consultoria"]
            },
            {
                id: 4,
                nome: "DataFlow Solutions",
                localizacao: "Curitiba, PR",
                setor: "Big Data",
                porte: "Médio",
                fundacao: 2019,
                descricao: "Especialista em análise de dados e inteligência de negócios.",
                especialidades: ["Python", "Spark", "Machine Learning"]
            },
            {
                id: 5,
                nome: "Creative Design Co",
                localizacao: "Rio de Janeiro, RJ",
                setor: "Design e UX",
                porte: "Pequeno",
                fundacao: 2020,
                descricao: "Agência de design focada em experiência do usuário inovadora.",
                especialidades: ["UI/UX", "Web Design", "Branding"]
            }
        ];

        this.favoritos = this.carregarFavoritos();
        this.container = document.getElementById('listaempresas');
        this.input = document.getElementById('campopesquisa');

        this.inicializar();
    }

    carregarFavoritos() {
        const favoritosArmazenados = localStorage.getItem('empresas_favoritas_v2');
        return favoritosArmazenados ? JSON.parse(favoritosArmazenados) : [];
    }

    salvarFavoritos() {
        localStorage.setItem('empresas_favoritas_v2', JSON.stringify(this.favoritos));
    }

    ehFavorita(id) {
        return this.favoritos.includes(id);
    }

    toggleFavorito(id) {
        const index = this.favoritos.indexOf(id);
        
        if (index > -1) {
            this.favoritos.splice(index, 1);
            this.mostrarNotificacao(`Empresa removida dos favoritos!`, 'remover');
        } else {
            this.favoritos.push(id);
            this.mostrarNotificacao(`Empresa adicionada aos favoritos!`, 'adicionar');
        }
        
        this.salvarFavoritos();
        this.renderizar(this.input.value);
    }

    renderizar(filtro = "") {
        this.container.innerHTML = "";
        const termo = filtro.toLowerCase();

        const empresasFiltradas = this.empresas.filter(e =>
            e.nome.toLowerCase().includes(termo) ||
            e.setor.toLowerCase().includes(termo) ||
            e.localizacao.toLowerCase().includes(termo)
        );

        if (empresasFiltradas.length === 0) {
            this.container.innerHTML = '<div class="empresa-nao-encontrada">Nenhuma empresa encontrada para sua busca.</div>';
            return;
        }

        empresasFiltradas.forEach(empresa => {
            const card = this.criarCardEmpresa(empresa);
            this.container.appendChild(card);
        });
    }

    criarCardEmpresa(empresa) {
        const div = document.createElement('div');
        div.className = 'card-empresa';

        const isFavorita = this.ehFavorita(empresa.id);
        const iconeFavorito = isFavorita ? '★' : '☆';
        const classFavorito = isFavorita ? 'ativo' : '';

        const tags = empresa.especialidades
            .map(e => `<span class="tag">${e}</span>`)
            .join('');

        div.innerHTML = `
            <div class="card-header">
                <div>
                    <h3>${empresa.nome}</h3>
                    <p><strong>${empresa.setor}</strong> - ${empresa.localizacao}</p>
                </div>
                <button class="btn-favorito ${classFavorito}" onclick="gerenciador.toggleFavorito(${empresa.id})" title="Adicionar aos favoritos">
                    ${iconeFavorito}
                </button>
            </div>

            <div class="info-linha">
                <b>Porte:</b> ${empresa.porte} | <b>Fundação:</b> ${empresa.fundacao}
            </div>

            <p class="descricao-empresa">${empresa.descricao}</p>

            <div class="tag-container">
                ${tags}
            </div>

            <div class="botoes-container">
                <button class="btn" onclick="gerenciador.verPerfil(${empresa.id})">
                    Ver Perfil
                </button>
                <button class="btn btn-secundario" onclick="gerenciador.contatoEmpresa(${empresa.id})">
                    Enviar Contato
                </button>
            </div>
        `;

        return div;
    }

    verPerfil(id) {
        const empresa = this.empresas.find(e => e.id === id);
        if (empresa) {
            const detalhes = `
EMPRESA: ${empresa.nome}
SETOR: ${empresa.setor}
LOCALIZAÇÃO: ${empresa.localizacao}
PORTE: ${empresa.porte}
ANO DE FUNDAÇÃO: ${empresa.fundacao}

DESCRIÇÃO:
${empresa.descricao}

ESPECIALIDADES:
${empresa.especialidades.map((e, i) => `${i + 1}. ${e}`).join('\n')}
            `;
            alert(detalhes);
        }
    }

    contatoEmpresa(id) {
        const empresa = this.empresas.find(e => e.id === id);
        if (empresa) {
            this.mostrarNotificacao(`Mensagem de contato enviada para ${empresa.nome}!`, 'sucesso');
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
    gerenciador = new GerenciadorEmpresas();
});
