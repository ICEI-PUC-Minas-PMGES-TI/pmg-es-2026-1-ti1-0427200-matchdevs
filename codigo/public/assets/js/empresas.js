if (!sessionStorage.getItem('usuarioCorrente')) {
    window.location.href = 'login.html';
} else {
    const renderOriginal = GerenciadorEmpresas.prototype.renderizar;

    GerenciadorEmpresas.prototype.renderizar = function () {
        this.container.innerHTML = "";

        const empresasFavoritas = this.empresas.filter(empresa =>
            this.ehFavorita(empresa.id)
        );

        if (empresasFavoritas.length === 0) {
            this.container.innerHTML =
                '<div class="empresa-nao-encontrada">Você ainda não favoritou nenhuma empresa.</div>';
        } else {
            empresasFavoritas.forEach(empresa =>
                this.container.appendChild(this.criarCardEmpresa(empresa))
            );
        }
    };
}