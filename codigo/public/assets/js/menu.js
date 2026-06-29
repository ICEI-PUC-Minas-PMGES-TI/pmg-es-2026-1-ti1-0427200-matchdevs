document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioCorrente") || "null");
    const empresaLogada = JSON.parse(localStorage.getItem("empresaLogada") || "null");

    const loginLink = document.getElementById("login-link");
    const menu = document.querySelector(".menu");

    if (!loginLink || !menu) {
        return;
    }

    const jaExisteLogout = document.getElementById("logout-link");
    const jaExisteInfo = document.getElementById("menu-user-info");

    if (jaExisteLogout) jaExisteLogout.remove();
    if (jaExisteInfo) jaExisteInfo.remove();

    if (usuarioLogado) {
        loginLink.textContent = "Minha Área";
        loginLink.href = "perfil_usuario.html";

        if (!document.getElementById("favoritos-link")) {
            const favoritosLink = document.createElement("a");
            favoritosLink.id = "favoritos-link";
            favoritosLink.href = "favoritos.html";
            favoritosLink.textContent = "Favoritos";
            loginLink.parentNode.insertBefore(favoritosLink, loginLink);
        }

        const userInfo = document.createElement("span");
        userInfo.id = "menu-user-info";
        userInfo.className = "menu-user-info";
        userInfo.textContent = `Olá, ${usuarioLogado.nome.split(" ")[0]}!`;

        const logoutBtn = document.createElement("a");
        logoutBtn.id = "logout-link";
        logoutBtn.textContent = "Sair";
        logoutBtn.href = "#";

        logoutBtn.onclick = event => {
            event.preventDefault();
            sessionStorage.removeItem("usuarioCorrente");
            window.location.href = "home.html";
        };

        menu.append(userInfo, logoutBtn);
        return;
    }

    if (empresaLogada) {
        loginLink.textContent = "Perfil Empresa";
        loginLink.href = "perfil_empresa.html";

        const empresaInfo = document.createElement("span");
        empresaInfo.id = "menu-user-info";
        empresaInfo.className = "menu-user-info";
        empresaInfo.textContent = `Empresa: ${empresaLogada.nome}`;

        const logoutEmpresaBtn = document.createElement("a");
        logoutEmpresaBtn.id = "logout-link";
        logoutEmpresaBtn.textContent = "Sair";
        logoutEmpresaBtn.href = "#";

        logoutEmpresaBtn.onclick = event => {
            event.preventDefault();
            localStorage.removeItem("empresaLogada");
            window.location.href = "home.html";
        };

        menu.append(empresaInfo, logoutEmpresaBtn);
    }
});