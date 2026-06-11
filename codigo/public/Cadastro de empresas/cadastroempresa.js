const btnCadastrar   = document.getElementById("btn-cadastrar");
const errorMsg       = document.getElementById("error-msg");
const formArea       = document.getElementById("form-area");
const successArea    = document.getElementById("success-area");

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
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
    if (campoId) {
        const campo = document.getElementById(campoId);
        campo.classList.add("invalido");
        campo.focus();
    }
}

function limparErros() {
    errorMsg.style.display = "none";
    errorMsg.textContent = "";
    document.querySelectorAll(".invalido").forEach(function (el) {
        el.classList.remove("invalido");
    });
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCNPJ(cnpj) {
    return cnpj.replace(/\D/g, "").length === 14;
}

btnCadastrar.addEventListener("click", function () {
    limparErros();

    const nome       = document.getElementById("nome").value.trim();
    const cnpj       = document.getElementById("cnpj").value.trim();
    const email      = document.getElementById("email").value.trim();
    const telefone   = document.getElementById("telefone").value.trim();
    const setor      = document.getElementById("setor").value.trim();
    const localizacao= document.getElementById("localizacao").value.trim();
    const descricao  = document.getElementById("descricao").value.trim();

    if (!nome)                        return mostrarErro("Informe o nome da empresa.", "nome");
    if (!cnpj)                        return mostrarErro("Informe o CNPJ.", "cnpj");
    if (!validarCNPJ(cnpj))           return mostrarErro("CNPJ inválido. Digite todos os 14 dígitos.", "cnpj");
    if (!email)                       return mostrarErro("Informe o e-mail.", "email");
    if (!validarEmail(email))         return mostrarErro("E-mail inválido.", "email");
    if (!telefone)                    return mostrarErro("Informe o telefone.", "telefone");
    if (!setor)                       return mostrarErro("Informe o setor.", "setor");
    if (!localizacao)                 return mostrarErro("Informe a localização.", "localizacao");

    const empresas = JSON.parse(localStorage.getItem("empresas") || "[]");

    const duplicado = empresas.find(function (e) {
        return e.email === email || e.cnpj === cnpj.replace(/\D/g, "");
    });

    if (duplicado) {
        return mostrarErro("Já existe uma empresa cadastrada com este e-mail ou CNPJ.");
    }

    empresas.push({
        nome:       nome,
        cnpj:       cnpj.replace(/\D/g, ""),
        email:      email,
        telefone:   telefone,
        setor:      setor,
        localizacao:localizacao,
        descricao:  descricao
    });

    localStorage.setItem("empresas", JSON.stringify(empresas));

    formArea.style.display    = "none";
    successArea.style.display = "block";
});