const API_URL = "http://localhost:3000";
const EMPRESAS_URL = `${API_URL}/empresas`;

const cnpjInput = document.getElementById("cnpj");
const btnLogin = document.getElementById("btn-login");

function limparCNPJ(cnpj) {
    return String(cnpj || "").replace(/\D/g, "");
}

function normalizarTexto(valor) {
    return String(valor || "").trim().toLowerCase();
}

if (cnpjInput) {
    cnpjInput.addEventListener("input", function () {
        let v = this.value.replace(/\D/g, "").substring(0, 14);

        v = v.replace(/^(\d{2})(\d)/, "$1.$2");
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
        v = v.replace(/(\d{4})(\d)/, "$1-$2");

        this.value = v;
    });
}

if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        limparErro();

        const email = document.getElementById("email").value.trim();
        const cnpj = limparCNPJ(document.getElementById("cnpj").value);

        if (!email) return mostrarErro("Informe o e-mail.", "email");
        if (!cnpj || cnpj.length !== 14) return mostrarErro("Informe um CNPJ válido.", "cnpj");

        try {
            const resposta = await fetch(EMPRESAS_URL);

            if (!resposta.ok) throw new Error("Erro ao carregar empresas.");

            const empresas = await resposta.json();

            const empresa = empresas.find(item => {
                return normalizarTexto(item.email) === normalizarTexto(email) &&
                       limparCNPJ(item.cnpj) === cnpj;
            });

            if (!empresa) {
                return mostrarErro("E-mail ou CNPJ incorretos. Verifique seus dados.");
            }

            localStorage.setItem("empresaLogada", JSON.stringify(empresa));
            window.location.href = "perfil_empresa.html";

        } catch (erro) {
            console.error("Erro no login da empresa:", erro);
            mostrarErro("Não foi possível conectar ao servidor. Certifique-se que o JSON Server está rodando.");
        }
    });
}

function mostrarErro(msg, campoId) {
    const errorMsg = document.getElementById("error-msg");

    if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = "block";
    }

    document.querySelectorAll(".invalido").forEach(el => el.classList.remove("invalido"));

    if (campoId) {
        const campo = document.getElementById(campoId);

        if (campo) {
            campo.classList.add("invalido");
            campo.focus();
        }
    }
}

function limparErro() {
    const errorMsg = document.getElementById("error-msg");

    if (errorMsg) {
        errorMsg.textContent = "";
        errorMsg.style.display = "none";
    }

    document.querySelectorAll(".invalido").forEach(el => el.classList.remove("invalido"));
}