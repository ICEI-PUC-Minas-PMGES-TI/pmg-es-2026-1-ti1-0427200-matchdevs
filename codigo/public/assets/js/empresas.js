document.addEventListener("DOMContentLoaded", () => {
    if (!sessionStorage.getItem("usuarioCorrente")) {
        sessionStorage.setItem("returnURL", window.location.pathname.split("/").pop());
        window.location.href = "login.html";
        return;
    }

    const intervalo = setInterval(() => {
        if (window.gerenciador && window.gerenciador.empresas) {
            clearInterval(intervalo);

            window.gerenciador.renderizar = function () {
                this.container.innerHTML = "";

                const empresasFavoritas = this.empresas.filter(empresa =>
                    this.ehFavorita(empresa.id)
                );

                if (empresasFavoritas.length === 0) {
                    this.container.innerHTML =
                        '<div class="empresa-nao-encontrada">Você ainda não favoritou nenhuma empresa.</div>';
                    return;
                }

                empresasFavoritas.forEach(empresa => {
                    this.container.appendChild(this.criarCardEmpresa(empresa));
                });
            };

            window.gerenciador.renderizar();
        }
    }, 50);
});