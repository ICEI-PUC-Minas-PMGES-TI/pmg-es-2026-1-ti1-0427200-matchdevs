const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    carregarEmpresa();
    carregarVagas();
});

async function carregarEmpresa() {
    try {
        const res = await fetch(`${API_URL}/empresa`);
        const empresa = await res.json();

        document.getElementById("empresa-inicial").textContent = empresa.nome.charAt(0).toUpperCase();
        document.getElementById("empresa-nome").textContent = empresa.nome;
        document.getElementById("empresa-setor").textContent = empresa.setor;
        document.getElementById("empresa-local").textContent = `📍 ${empresa.localizacao}`;
        document.getElementById("empresa-descricao").textContent = empresa.descricao;

        document.getElementById("contato-email").textContent = empresa.email;
        document.getElementById("contato-tel").textContent = empresa.telefone;

        document.getElementById("mapa-cidade").textContent = empresa.localizacao;

        document.getElementById("footer-email").textContent = empresa.email;
        document.getElementById("footer-tel").textContent = empresa.telefone;
    } catch (erro) {
        console.error("Erro ao carregar dados da empresa:", erro);
    }
}

async function carregarVagas() {
    const lista = document.getElementById("vagas-lista");
    const vazio = document.getElementById("vagas-vazio");

    try {
        const res = await fetch(`${API_URL}/vagas`);
        const vagas = await res.json();

        if (!vagas || vagas.length === 0) {
            vazio.style.display = "block";
            return;
        }

        vazio.style.display = "none";

        vagas.forEach(vaga => {
            const card = document.createElement("div");
            card.className = "vaga-card";
            card.innerHTML = `
                <div class="vaga-topo">
                    <span class="vaga-titulo">${vaga.titulo}</span>
                    <span class="badge badge-${vaga.modelo}">${vaga.modelo}</span>
                </div>
                <p class="vaga-desc">${vaga.descricao}</p>
                <div class="vaga-rodape">
                    <span class="vaga-salario">${vaga.salario}</span>
                    <span class="badge-tipo">${vaga.tipo}</span>
                </div>
            `;
            lista.appendChild(card);
        });
    } catch (erro) {
        console.error("Erro ao carregar vagas:", erro);
        vazio.style.display = "block";
    }
}
