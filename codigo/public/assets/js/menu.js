document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioCorrente") || "null");
    const empresaLogada = JSON.parse(localStorage.getItem("empresaLogada") || "null");

    const loginLink = document.getElementById("login-link");
    const menu = document.querySelector(".menu");

    if (!loginLink || !menu) return;

    document.querySelectorAll("#menu-user-info, #logout-link").forEach(el => el.remove());

    if (usuarioLogado) {
        loginLink.textContent = "Minha Área";
        loginLink.href = "perfil_usuario.html";

        const userInfo = document.createElement("span");
        userInfo.id = "menu-user-info";
        userInfo.className = "menu-user-info";
        userInfo.textContent = `Olá, ${usuarioLogado.nome ? usuarioLogado.nome.split(" ")[0] : usuarioLogado.login}!`;

        const logoutBtn = document.createElement("a");
        logoutBtn.id = "logout-link";
        logoutBtn.href = "#";
        logoutBtn.textContent = "Sair";

        logoutBtn.addEventListener("click", event => {
            event.preventDefault();
            sessionStorage.removeItem("usuarioCorrente");
            window.location.href = "home.html";
        });

        menu.append(userInfo, logoutBtn);
        return;
    }

    if (empresaLogada) {
        loginLink.textContent = "Perfil Empresa";
        loginLink.href = "perfil_empresa.html";

        const empresaInfo = document.createElement("span");
        empresaInfo.id = "menu-user-info";
        empresaInfo.className = "menu-user-info";
        empresaInfo.textContent = `Empresa: ${empresaLogada.nome || "Logada"}`;

        const logoutBtn = document.createElement("a");
        logoutBtn.id = "logout-link";
        logoutBtn.href = "#";
        logoutBtn.textContent = "Sair";

        logoutBtn.addEventListener("click", event => {
            event.preventDefault();
            localStorage.removeItem("empresaLogada");
            window.location.href = "home.html";
        });

        menu.append(empresaInfo, logoutBtn);
    }
});