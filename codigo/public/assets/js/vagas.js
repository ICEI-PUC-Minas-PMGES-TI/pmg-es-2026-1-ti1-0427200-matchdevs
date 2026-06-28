// Verifica se o usuário está logado antes de tudo
if (!sessionStorage.getItem('usuarioCorrente')) {
    window.location.href = '../modulos/login/login.html';
} else {
    // Guarda o método original da classe
    const renderOriginal = GerenciadorVagas.prototype.renderizar;

    // Sobrescreve o método de renderização no protótipo da classe
    GerenciadorVagas.prototype.renderizar = function() {
        this.container.innerHTML = "";
        const vagasFavoritas = this.vagas.filter(vaga => this.ehFavorita(vaga.id));

        if (vagasFavoritas.length === 0) {
            this.container.innerHTML = '<div class="vaga-nao-encontrada">Você ainda não favoritou nenhuma vaga. Comece a explorar!</div>';
        } else {
            vagasFavoritas.forEach(vaga => this.container.appendChild(this.criarCardVaga(vaga)));
        }
    };
}