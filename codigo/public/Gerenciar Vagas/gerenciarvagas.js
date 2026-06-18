const API_URL = "http://localhost:3000";

// Guarda o id da vaga em edição (null = modo "criar nova vaga")
let vagaEditandoId = null;
// Guarda a data de publicação original, para não perdê-la ao editar
let dataPublicacaoOriginal = null;

const form = document.getElementById("form-vaga");
const formTitulo = document.getElementById("form-titulo");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");

document.addEventListener("DOMContentLoaded", carregarVagas);
form.addEventListener("submit", salvarVaga);
btnCancelar.addEventListener("click", cancelarEdicao);

// Busca todas as vagas no json-server e desenha os cards na tela
async function carregarVagas() {
    const lista = document.getElementById("vagas-lista");
    const vazio = document.getElementById("vagas-vazio");

    try {
        const res = await fetch(`${API_URL}/vagas`);
        const vagas = await res.json();

        lista.innerHTML = "";

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
                <div class="vaga-acoes">
                    <button class="btn-editar" data-id="${vaga.id}">Editar</button>
                    <button class="btn-excluir" data-id="${vaga.id}">Excluir</button>
                </div>
            `;
            lista.appendChild(card);
        });

        // Liga os botões de cada card recém-criado (precisa ser feito depois do innerHTML)
        lista.querySelectorAll(".btn-editar").forEach(btn => {
            btn.addEventListener("click", () => editarVaga(btn.dataset.id));
        });
        lista.querySelectorAll(".btn-excluir").forEach(btn => {
            btn.addEventListener("click", () => excluirVaga(btn.dataset.id));
        });

    } catch (erro) {
        console.error("Erro ao carregar vagas:", erro);
        vazio.style.display = "block";
    }
}

// Lê os campos do formulário e decide se cria (POST) ou atualiza (PUT) a vaga
async function salvarVaga(evento) {
    evento.preventDefault();

    const requisitos = document.getElementById("vaga-requisitos").value
        .split(",")
        .map(item => item.trim())
        .filter(item => item.length > 0);

    const dadosVaga = {
        titulo: document.getElementById("vaga-titulo").value,
        tipo: document.getElementById("vaga-tipo").value,
        modelo: document.getElementById("vaga-modelo").value,
        salario: document.getElementById("vaga-salario").value,
        descricao: document.getElementById("vaga-descricao").value,
        requisitos: requisitos
    };

    try {
        if (vagaEditandoId) {
            // Edição: mantém a data de publicação original
            dadosVaga.data_publicacao = dataPublicacaoOriginal;
            await fetch(`${API_URL}/vagas/${vagaEditandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: Number(vagaEditandoId), ...dadosVaga })
            });
        } else {
            // Criação: data de publicação é a data de hoje
            dadosVaga.data_publicacao = new Date().toISOString().split("T")[0];
            await fetch(`${API_URL}/vagas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosVaga)
            });
        }

        cancelarEdicao();
        carregarVagas();

    } catch (erro) {
        console.error("Erro ao salvar vaga:", erro);
        alert("Não foi possível salvar a vaga. Verifique se o json-server está rodando.");
    }
}

// Busca os dados de uma vaga específica e preenche o formulário para edição
async function editarVaga(id) {
    try {
        const res = await fetch(`${API_URL}/vagas/${id}`);
        const vaga = await res.json();

        document.getElementById("vaga-titulo").value = vaga.titulo;
        document.getElementById("vaga-tipo").value = vaga.tipo;
        document.getElementById("vaga-modelo").value = vaga.modelo;
        document.getElementById("vaga-salario").value = vaga.salario;
        document.getElementById("vaga-descricao").value = vaga.descricao;
        document.getElementById("vaga-requisitos").value = (vaga.requisitos || []).join(", ");

        vagaEditandoId = vaga.id;
        dataPublicacaoOriginal = vaga.data_publicacao;

        formTitulo.textContent = "Editar Vaga";
        btnSalvar.textContent = "Atualizar Vaga";
        btnCancelar.style.display = "inline-block";

        form.scrollIntoView({ behavior: "smooth" });

    } catch (erro) {
        console.error("Erro ao buscar vaga:", erro);
    }
}

// Pede confirmação e remove a vaga do json-server
async function excluirVaga(id) {
    const confirmar = confirm("Tem certeza que deseja excluir esta vaga?");
    if (!confirmar) return;

    try {
        await fetch(`${API_URL}/vagas/${id}`, { method: "DELETE" });
        carregarVagas();
    } catch (erro) {
        console.error("Erro ao excluir vaga:", erro);
        alert("Não foi possível excluir a vaga.");
    }
}

// Limpa o formulário e volta para o modo "Nova vaga"
function cancelarEdicao() {
    form.reset();
    vagaEditandoId = null;
    dataPublicacaoOriginal = null;
    formTitulo.textContent = "Nova Vaga";
    btnSalvar.textContent = "Salvar Vaga";
    btnCancelar.style.display = "none";
}
