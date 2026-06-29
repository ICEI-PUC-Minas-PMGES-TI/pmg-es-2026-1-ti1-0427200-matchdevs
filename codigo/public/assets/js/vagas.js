if (!sessionStorage.getItem("usuarioCorrente")) {
    window.location.href = "login.html";
} else {
    GerenciadorVagas.prototype.renderizar = function () {
        this.container.innerHTML = "";

        const vagasFavoritas = this.vagas.filter(vaga =>
            this.ehFavorita(vaga.id)
        );

        if (vagasFavoritas.length === 0) {
            this.container.innerHTML =
                '<div class="vaga-nao-encontrada">Você ainda não favoritou nenhuma vaga. Comece a explorar!</div>';
            return;
        }

        vagasFavoritas.forEach(vaga => {
            this.container.appendChild(this.criarCardVaga(vaga));
        });
    };
}