const API_URL = "http://localhost:3001";

document.getElementById("cnpj").addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "").substring(0, 14);
    v = v.replace(/^(\d{2})(\d)/,          "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/,         ".$1/$2");
    v = v.replace(/(\d{4})(\d)/,           "$1-$2");
    this.value = v;
});

document.getElementById("btn-login").addEventListener("click", async function () {
    const errorMsg = document.getElementById("error-msg");
    errorMsg.style.display = "none";

    const email = document.getElementById("email").value.trim();
    const cnpj  = document.getElementById("cnpj").value.replace(/\D/g, "");

    if (!email) return mostrarErro("Informe o e-mail.", "email");
    if (!cnpj || cnpj.length !== 14) return mostrarErro("Informe um CNPJ válido.", "cnpj");

    try {
        const res = await fetch(`${API_URL}/empresas?email=${encodeURIComponent(email)}&cnpj=${cnpj}`);
        const empresas = await res.json();

        if (!empresas || empresas.length === 0) {
            return mostrarErro("E-mail ou CNPJ incorretos. Verifique seus dados.");
        }

        const empresa = empresas[0];
        localStorage.setItem("empresaLogada", JSON.stringify(empresa));

        window.location.href = "../Perfil_de_Empresas/perfilempresa.html";

    } catch (err) {
        mostrarErro("Não foi possível conectar ao servidor. Certifique-se que o JSON Server está rodando (npm start).");
    }
});

function mostrarErro(msg, campoId) {
    const errorMsg = document.getElementById("error-msg");
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
    if (campoId) {
        const campo = document.getElementById(campoId);
        campo.classList.add("invalido");
        campo.focus();
    }
    document.querySelectorAll(".invalido").forEach(el => el.classList.remove("invalido"));
    if (campoId) document.getElementById(campoId).classList.add("invalido");
}
