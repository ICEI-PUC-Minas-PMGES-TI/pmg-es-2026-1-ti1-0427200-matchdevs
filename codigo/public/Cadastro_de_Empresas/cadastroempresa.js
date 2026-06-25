const API_URL = "http://localhost:3001";

document.getElementById("cnpj").addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "").substring(0, 14);
    v = v.replace(/^(\d{2})(\d)/,          "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/,         ".$1/$2");
    v = v.replace(/(\d{4})(\d)/,           "$1-$2");
    this.value = v;
});

document.getElementById("telefone").addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "").substring(0, 11);
    if (v.length <= 10) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else {
        v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    }
    this.value = v;
});

function mostrarErro(msg, campoId) {
    const errorMsg = document.getElementById("error-msg");
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
    document.querySelectorAll(".invalido").forEach(el => el.classList.remove("invalido"));
    if (campoId) {
        const campo = document.getElementById(campoId);
        if (campo) { campo.classList.add("invalido"); campo.focus(); }
    }
}

function limparErros() {
    const errorMsg = document.getElementById("error-msg");
    errorMsg.style.display = "none";
    errorMsg.textContent = "";
    document.querySelectorAll(".invalido").forEach(el => el.classList.remove("invalido"));
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCNPJ(cnpj) {
    return cnpj.replace(/\D/g, "").length === 14;
}

document.getElementById("btn-cadastrar").addEventListener("click", async function () {
    limparErros();

    const nome        = document.getElementById("nome").value.trim();
    const cnpj        = document.getElementById("cnpj").value.trim();
    const email       = document.getElementById("email").value.trim();
    const telefone    = document.getElementById("telefone").value.trim();
    const setor       = document.getElementById("setor").value.trim();
    const localizacao = document.getElementById("localizacao").value.trim();
    const descricao   = document.getElementById("descricao").value.trim();

    if (!nome)              return mostrarErro("Informe o nome da empresa.", "nome");
    if (!cnpj)              return mostrarErro("Informe o CNPJ.", "cnpj");
    if (!validarCNPJ(cnpj)) return mostrarErro("CNPJ inválido. Digite todos os 14 dígitos.", "cnpj");
    if (!email)             return mostrarErro("Informe o e-mail.", "email");
    if (!validarEmail(email)) return mostrarErro("E-mail inválido.", "email");
    if (!telefone)          return mostrarErro("Informe o telefone.", "telefone");
    if (!setor)             return mostrarErro("Selecione o setor.", "setor");
    if (!localizacao)       return mostrarErro("Informe a localização.", "localizacao");

    try {
        // Verifica duplicidade
        const checkRes = await fetch(`${API_URL}/empresas?email=${encodeURIComponent(email)}`);
        const existentes = await checkRes.json();
        const cnpjLimpo = cnpj.replace(/\D/g, "");
        const duplicado = existentes.find(e => e.email === email || e.cnpj === cnpjLimpo);

        if (duplicado) {
            return mostrarErro("Já existe uma empresa cadastrada com este e-mail ou CNPJ.");
        }

        // Cadastra no JSON Server
        const novaEmpresa = {
            nome, cnpj: cnpjLimpo, email, telefone, setor, localizacao, descricao
        };

        const postRes = await fetch(`${API_URL}/empresas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaEmpresa)
        });

        if (!postRes.ok) throw new Error("Erro ao salvar.");

        const empresaSalva = await postRes.json();
        // Já salva sessão para o usuário poder usar a conta criada
        localStorage.setItem("empresaLogada", JSON.stringify(empresaSalva));

        document.getElementById("form-area").style.display    = "none";
        document.getElementById("success-area").style.display = "block";

    } catch (err) {
        mostrarErro("Não foi possível conectar ao servidor. Certifique-se que o JSON Server está rodando (npm start).");
    }
});
