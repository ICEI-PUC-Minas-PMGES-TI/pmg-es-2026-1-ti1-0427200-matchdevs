document.addEventListener("DOMContentLoaded", () => {
    if (!sessionStorage.getItem("usuarioCorrente")) {
        sessionStorage.setItem("returnURL", window.location.pathname.split("/").pop());
        window.location.href = "login.html";
        return;
    }

    const intervalo = setInterval(() => {
        if (window.gerenciador && window.gerenciador.vagas) {
            clearInterval(intervalo);

            window.gerenciador.renderizar = function () {
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

            window.gerenciador.renderizar();
        }
    }, 50);
});