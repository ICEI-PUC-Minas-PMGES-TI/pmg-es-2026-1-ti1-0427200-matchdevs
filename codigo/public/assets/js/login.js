const API_URL = "/usuarios";

const form = document.getElementById("login-form");
const mensagem = document.getElementById("mensagem");

function mostrarMensagem(texto, tipo = "erro") {
    if (!mensagem) return;

    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
}

function limparMensagem() {
    if (!mensagem) return;

    mensagem.textContent = "";
    mensagem.className = "mensagem";
}

async function carregarUsuarios() {
    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
        throw new Error("Erro ao carregar usuários.");
    }

    return await resposta.json();
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    limparMensagem();

    const login = document.getElementById("username").value.trim();
    const senha = document.getElementById("password").value;

    if (!login || !senha) {
        mostrarMensagem("Informe login e senha.");
        return;
    }

    try {
        const usuarios = await carregarUsuarios();

        const usuario = usuarios.find(user => {
            return user.login === login && user.senha === senha;
        });

        if (!usuario) {
            mostrarMensagem("Login ou senha inválidos.");
            return;
        }

        const usuarioCorrente = {
            id: usuario.id,
            login: usuario.login,
            nome: usuario.nome,
            email: usuario.email
        };

        sessionStorage.setItem("usuarioCorrente", JSON.stringify(usuarioCorrente));

        const returnURL = sessionStorage.getItem("returnURL") || "index.html";
        sessionStorage.removeItem("returnURL");

        window.location.href = returnURL;

    } catch (erro) {
        console.error("Erro no login:", erro);
        mostrarMensagem("Não foi possível conectar ao servidor. Verifique se o JSON Server está rodando.");
    }
});