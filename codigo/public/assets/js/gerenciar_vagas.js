const API_URL = "http://localhost:3000";
const VAGAS_URL = `${API_URL}/vagas`;

let vagaEditandoId = null;
let dataPublicacaoOriginal = null;

const form = document.getElementById("form-vaga");
const formTitulo = document.getElementById("form-titulo");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");

document.addEventListener("DOMContentLoaded", carregarVagas);
form.addEventListener("submit", salvarVaga);
btnCancelar.addEventListener("click", cancelarEdicao);

async function carregarVagas() {
    const lista = document.getElementById("vagas-lista");
    const vazio = document.getElementById("vagas-vazio");

    try {
        const res = await fetch(VAGAS_URL);

        if (!res.ok) {
            throw new Error("Erro ao carregar vagas.");
        }

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
                    <span class="vaga-titulo">${vaga.titulo || ""}</span>
                    <span class="badge badge-${vaga.modelo || vaga.tipo_contrato || ""}">
                        ${vaga.modelo || vaga.tipo_contrato || ""}
                    </span>
                </div>

                <p class="vaga-desc">${vaga.descricao || ""}</p>

                <div class="vaga-rodape">
                    <span class="vaga-salario">${vaga.salario || ""}</span>
                    <span class="badge-tipo">${vaga.tipo || vaga.tipo_contrato || ""}</span>
                </div>

                <div class="vaga-acoes">
                    <button class="btn-editar" data-id="${vaga.id}">Editar</button>
                    <button class="btn-excluir" data-id="${vaga.id}">Excluir</button>
                </div>
            `;

            lista.appendChild(card);
        });

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

async function salvarVaga(evento) {
    evento.preventDefault();

    const requisitos = document.getElementById("vaga-requisitos").value
        .split(",")
        .map(item => item.trim())
        .filter(item => item.length > 0);

    const dadosVaga = {
        titulo: document.getElementById("vaga-titulo").value.trim(),
        tipo: document.getElementById("vaga-tipo").value,
        modelo: document.getElementById("vaga-modelo").value,
        salario: document.getElementById("vaga-salario").value.trim(),
        descricao: document.getElementById("vaga-descricao").value.trim(),
        requisitos
    };

    try {
        if (vagaEditandoId) {
            dadosVaga.data_publicacao = dataPublicacaoOriginal;

            const resposta = await fetch(`${VAGAS_URL}/${vagaEditandoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: Number(vagaEditandoId),
                    ...dadosVaga
                })
            });

            if (!resposta.ok) {
                throw new Error("Erro ao atualizar vaga.");
            }
        } else {
            dadosVaga.data_publicacao = new Date().toISOString().split("T")[0];

            const resposta = await fetch(VAGAS_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dadosVaga)
            });

            if (!resposta.ok) {
                throw new Error("Erro ao criar vaga.");
            }
        }

        cancelarEdicao();
        carregarVagas();

    } catch (erro) {
        console.error("Erro ao salvar vaga:", erro);
        alert("Não foi possível salvar a vaga. Verifique se o JSON Server está rodando.");
    }
}

async function editarVaga(id) {
    try {
        const res = await fetch(`${VAGAS_URL}/${id}`);

        if (!res.ok) {
            throw new Error("Erro ao buscar vaga.");
        }

        const vaga = await res.json();

        document.getElementById("vaga-titulo").value = vaga.titulo || "";
        document.getElementById("vaga-tipo").value = vaga.tipo || vaga.tipo_contrato || "";
        document.getElementById("vaga-modelo").value = vaga.modelo || "";
        document.getElementById("vaga-salario").value = vaga.salario || "";
        document.getElementById("vaga-descricao").value = vaga.descricao || "";
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

async function excluirVaga(id) {
    const confirmar = confirm("Tem certeza que deseja excluir esta vaga?");

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(`${VAGAS_URL}/${id}`, {
            method: "DELETE"
        });

        if (!resposta.ok) {
            throw new Error("Erro ao excluir vaga.");
        }

        carregarVagas();

    } catch (erro) {
        console.error("Erro ao excluir vaga:", erro);
        alert("Não foi possível excluir a vaga.");
    }
}

function cancelarEdicao() {
    form.reset();

    vagaEditandoId = null;
    dataPublicacaoOriginal = null;

    formTitulo.textContent = "Nova Vaga";
    btnSalvar.textContent = "Salvar Vaga";
    btnCancelar.style.display = "none";
}