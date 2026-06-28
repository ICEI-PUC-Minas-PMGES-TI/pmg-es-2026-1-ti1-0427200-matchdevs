// Verifica se o usuário está logado antes de tudo
if (!sessionStorage.getItem('usuarioCorrente')) {
    window.location.href = '../modulos/login/login.html';
} else {
    // Guarda o método original da classe
    const renderOriginal = GerenciadorEmpresas.prototype.renderizar;

    // Sobrescreve o método de renderização no protótipo da classe
    GerenciadorEmpresas.prototype.renderizar = function() {
        this.container.innerHTML = "";
        const empresasFavoritas = this.empresas.filter(empresa => this.ehFavorita(empresa.id));

        if (empresasFavoritas.length === 0) {
            this.container.innerHTML = '<div class="empresa-nao-encontrada">Você ainda não favoritou nenhuma empresa.</div>';
        } else {
            empresasFavoritas.forEach(empresa => this.container.appendChild(this.criarCardEmpresa(empresa)));
        }
    };
}