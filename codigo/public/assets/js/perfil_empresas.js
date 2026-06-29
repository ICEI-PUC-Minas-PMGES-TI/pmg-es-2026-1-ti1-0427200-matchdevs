const API_URL = "http://localhost:3000";
const EMPRESAS_URL = `${API_URL}/empresas`;
const VAGAS_URL = `${API_URL}/vagas`;

let empresaAtual = null;
let corSelecionada = null;
let capaSelecionada = null;
let tagsCulturaAtuais = [];

const TAGS_CULTURA_OPCOES = [
    "Home Office", "Flexibilidade", "Inovação", "Diversidade",
    "Crescimento", "Colaboração", "Ágil", "Open Source",
    "Aprendizado", "Benefícios", "Impacto Social", "Startup",
    "Multinacional", "Sustentabilidade", "Tech-first", "Dados"
];

document.addEventListener("DOMContentLoaded", () => {
    carregarEmpresa();
    carregarVagas();
    fecharMenuAoClicarFora();
    aplicarPreferencias();
    renderizarTagsCulturaOpcoes();
    renderizarCapaOpcoes();
});

function aplicarPreferencias() {
    const cor = localStorage.getItem("avatarCor");
    const capa = localStorage.getItem("capaBg");
    const tags = JSON.parse(localStorage.getItem("tagsCultura") || "[]");

    if (cor) aplicarCor(cor);
    if (capa) aplicarCapaBanner(capa);

    if (tags.length) {
        tagsCulturaAtuais = tags;
        renderizarTagsNoPerfil(tags);
    }
}

async function carregarEmpresa() {
    try {
        const empresaLogada = JSON.parse(localStorage.getItem("empresaLogada") || "null");

        if (empresaLogada && empresaLogada.id) {
            const res = await fetch(`${EMPRESAS_URL}/${empresaLogada.id}`);

            if (!res.ok) {
                throw new Error("Erro ao carregar empresa logada.");
            }

            empresaAtual = await res.json();
        } else {
            const res = await fetch(EMPRESAS_URL);

            if (!res.ok) {
                throw new Error("Erro ao carregar empresas.");
            }

            const empresas = await res.json();
            empresaAtual = empresas[0] || null;
        }

        if (!empresaAtual) {
            throw new Error("Nenhuma empresa encontrada.");
        }

        localStorage.setItem("empresaLogada", JSON.stringify(empresaAtual));
        renderizarEmpresa(empresaAtual);

    } catch (err) {
        console.error("Erro ao carregar empresa:", err);
        mostrarToast("Servidor não encontrado. Rode: npm start", "erro");
    }
}

function renderizarEmpresa(empresa) {
    const inicial = empresa.nome ? empresa.nome.charAt(0).toUpperCase() : "E";

    setTexto("empresa-inicial", inicial);
    setTexto("nav-inicial", inicial);
    setTexto("nav-nome", empresa.nome || "Empresa");
    setTexto("empresa-nome", empresa.nome || "Empresa");
    setTexto("empresa-setor", empresa.setor || "—");
    setTexto("empresa-local", empresa.localizacao || "—");
    setTexto("empresa-descricao", empresa.descricao || "—");
    setTexto("empresa-site", empresa.website || "—");
    setTexto("empresa-funcionarios", empresa.funcionarios ? `${empresa.funcionarios} funcionários` : "—");
    setTexto("empresa-fundacao", empresa.fundacao ? `Fundada em ${empresa.fundacao}` : "—");

    setTexto("contato-email", empresa.email || "—");
    setTexto("contato-tel", empresa.telefone || "—");

    const siteLink = document.getElementById("contato-site");

    if (siteLink) {
        siteLink.textContent = empresa.website || "—";
        siteLink.href = empresa.website || "#";
    }

    setTexto("mapa-cidade", empresa.localizacao || "—");

    const btnMapa = document.getElementById("btn-ver-mapa");

    if (btnMapa && empresa.localizacao) {
        btnMapa.href = `mapa.html?local=${encodeURIComponent(empresa.localizacao)}`;
    }

    setTexto("sobre-setor", empresa.setor || "—");
    setTexto("sobre-func", empresa.funcionarios || "—");
    setTexto("sobre-fund", empresa.fundacao ? `${empresa.fundacao}` : "—");

    setTexto("footer-email", empresa.email || "");
    setTexto("footer-tel", empresa.telefone || "");

    setTexto("met-func", empresa.funcionarios || "—");
    setTexto("met-setor", empresa.setor || "—");

    atualizarAnosMetrica(empresa.fundacao);

    const corSalva = localStorage.getItem("avatarCor");

    if (corSalva) {
        aplicarCor(corSalva);
    }
}

function atualizarAnosMetrica(fundacao) {
    const el = document.getElementById("met-anos");

    if (!el) {
        return;
    }

    el.textContent = fundacao ? `${new Date().getFullYear() - parseInt(fundacao)}` : "—";
}

async function carregarVagas() {
    const lista = document.getElementById("vagas-lista");
    const vazio = document.getElementById("vagas-vazio");
    const count = document.getElementById("vagas-count");
    const metVagas = document.getElementById("met-vagas");

    try {
        const res = await fetch(VAGAS_URL);

        if (!res.ok) {
            throw new Error("Erro ao carregar vagas.");
        }

        let vagas = await res.json();

        if (empresaAtual && empresaAtual.id) {
            const vagasDaEmpresa = vagas.filter(vaga => vaga.empresaId === empresaAtual.id);

            if (vagasDaEmpresa.length > 0) {
                vagas = vagasDaEmpresa;
            }
        }

        if (!vagas || vagas.length === 0) {
            vazio.style.display = "block";
            lista.innerHTML = "";
            count.textContent = "0 vagas publicadas";

            if (metVagas) {
                metVagas.textContent = "0";
            }

            return;
        }

        vazio.style.display = "none";
        lista.innerHTML = "";
        count.textContent = `${vagas.length} vaga${vagas.length > 1 ? "s" : ""} publicada${vagas.length > 1 ? "s" : ""}`;

        if (metVagas) {
            metVagas.textContent = vagas.length;
        }

        vagas.forEach(vaga => {
            const card = document.createElement("div");
            card.className = "vaga-card";

            const requisitos = Array.isArray(vaga.requisitos)
                ? vaga.requisitos.map(r => `<span class="req-tag">${r}</span>`).join("")
                : "";

            const modelo = vaga.modelo || vaga.tipo_contrato || "";
            const tipo = vaga.tipo || vaga.tipo_contrato || "";

            card.innerHTML = `
                <div class="vaga-topo">
                    <span class="vaga-titulo">${vaga.titulo || "Vaga sem título"}</span>
                    <div class="vaga-badges">
                        <span class="badge badge-${modelo}">${modelo}</span>
                        <span class="badge-tipo">${tipo}</span>
                    </div>
                </div>

                <p class="vaga-desc">${vaga.descricao || "Descrição não informada."}</p>

                ${requisitos ? `<div class="requisitos-row">${requisitos}</div>` : ""}

                <div class="vaga-rodape">
                    <span class="vaga-salario">💰 ${vaga.salario || "A combinar"}</span>
                    <div class="vaga-acoes">
                        <button class="btn-vaga-editar" onclick="editarVaga(${vaga.id})">Editar</button>
                        <button class="btn-vaga-excluir" onclick="excluirVaga(${vaga.id})">Remover</button>
                    </div>
                </div>
            `;

            lista.appendChild(card);
        });

    } catch (err) {
        console.error("Erro ao carregar vagas:", err);
        vazio.style.display = "block";
        count.textContent = "Erro ao carregar";
    }
}

document.getElementById("btn-acoes").addEventListener("click", event => {
    event.stopPropagation();

    document.getElementById("acoes-menu").classList.toggle("ativo");
    document.getElementById("btn-acoes").classList.toggle("ativo");
});

function fecharMenuAoClicarFora() {
    document.addEventListener("click", () => {
        document.getElementById("acoes-menu").classList.remove("ativo");
        document.getElementById("btn-acoes").classList.remove("ativo");
    });
}

function abrirModal(id) {
    document.getElementById("acoes-menu").classList.remove("ativo");

    if (id === "modal-editar" && empresaAtual) {
        document.getElementById("edit-nome").value = empresaAtual.nome || "";
        document.getElementById("edit-setor").value = empresaAtual.setor || "";
        document.getElementById("edit-localizacao").value = empresaAtual.localizacao || "";
        document.getElementById("edit-website").value = empresaAtual.website || "";
        document.getElementById("edit-descricao").value = empresaAtual.descricao || "";
        document.getElementById("edit-funcionarios").value = empresaAtual.funcionarios || "1-10";
        document.getElementById("edit-fundacao").value = empresaAtual.fundacao || "";
    }

    if (id === "modal-contato" && empresaAtual) {
        document.getElementById("cont-email").value = empresaAtual.email || "";
        document.getElementById("cont-tel").value = empresaAtual.telefone || "";
        document.getElementById("cont-site").value = empresaAtual.website || "";
    }

    if (id === "modal-foto") {
        const inicial = empresaAtual && empresaAtual.nome ? empresaAtual.nome.charAt(0).toUpperCase() : "E";
        const corAtual = localStorage.getItem("avatarCor") || "#4c4cd6";
        const box = document.getElementById("logo-preview-box");

        box.textContent = inicial;
        box.style.background = corAtual;
        corSelecionada = corAtual;
    }

    if (id === "modal-capa") {
        const capaAtual = localStorage.getItem("capaBg") || "";
        const preview = document.getElementById("capa-preview");

        if (capaAtual.startsWith("data:image") || capaAtual.startsWith("http")) {
            preview.style.background = "";
            preview.style.backgroundImage = `url('${capaAtual}')`;
            preview.style.backgroundSize = "cover";
            preview.style.backgroundPosition = "center";
        } else if (capaAtual) {
            preview.style.backgroundImage = "";
            preview.style.background = capaAtual;
        }

        capaSelecionada = capaAtual || null;

        const fname = document.getElementById("upload-filename");

        if (fname) {
            fname.textContent = "";
        }
    }

    if (id === "modal-cultura") {
        document.querySelectorAll(".cultura-tag-btn").forEach(btn => {
            btn.classList.toggle("ativa", tagsCulturaAtuais.includes(btn.dataset.tag));
        });
    }

    document.getElementById(id).classList.add("ativo");
    document.body.style.overflow = "hidden";
}

function fecharModal(id) {
    document.getElementById(id).classList.remove("ativo");
    document.body.style.overflow = "";
}

document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            overlay.classList.remove("ativo");
            document.body.style.overflow = "";
        }
    });
});

async function salvarVaga() {
    const titulo = document.getElementById("vaga-titulo").value.trim();
    const tipo = document.getElementById("vaga-tipo").value;
    const modelo = document.getElementById("vaga-modelo").value;
    const salario = document.getElementById("vaga-salario").value.trim();
    const descricao = document.getElementById("vaga-descricao").value.trim();
    const reqStr = document.getElementById("vaga-requisitos").value.trim();

    if (!titulo) {
        return mostrarToast("Informe o título da vaga.", "erro");
    }

    if (!descricao) {
        return mostrarToast("Informe a descrição da vaga.", "erro");
    }

    const requisitos = reqStr
        ? reqStr.split(",").map(r => r.trim()).filter(Boolean)
        : [];

    const novaVaga = {
        titulo,
        tipo,
        modelo,
        empresa: empresaAtual ? empresaAtual.nome : "",
        empresaId: empresaAtual ? empresaAtual.id : null,
        localizacao: empresaAtual ? empresaAtual.localizacao : "",
        salario: salario || "A combinar",
        descricao,
        requisitos,
        data_publicacao: new Date().toISOString().split("T")[0],
        ativa: true
    };

    try {
        const res = await fetch(VAGAS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(novaVaga)
        });

        if (!res.ok) {
            throw new Error("Erro ao publicar vaga.");
        }

        fecharModal("modal-vaga");
        limparFormVaga();
        await carregarVagas();
        mostrarToast("Vaga publicada com sucesso!");

    } catch {
        mostrarToast("Erro ao publicar a vaga.", "erro");
    }
}

function limparFormVaga() {
    ["vaga-titulo", "vaga-salario", "vaga-descricao", "vaga-requisitos"].forEach(id => {
        document.getElementById(id).value = "";
    });
}

async function excluirVaga(id) {
    if (!confirm("Deseja remover esta vaga?")) {
        return;
    }

    try {
        const res = await fetch(`${VAGAS_URL}/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            throw new Error("Erro ao remover vaga.");
        }

        await carregarVagas();
        mostrarToast("Vaga removida.");

    } catch {
        mostrarToast("Erro ao remover a vaga.", "erro");
    }
}

async function editarVaga(id) {
    try {
        const res = await fetch(`${VAGAS_URL}/${id}`);

        if (!res.ok) {
            throw new Error("Erro ao carregar vaga.");
        }

        const vaga = await res.json();

        document.getElementById("vaga-titulo").value = vaga.titulo || "";
        document.getElementById("vaga-tipo").value = vaga.tipo || vaga.tipo_contrato || "";
        document.getElementById("vaga-modelo").value = vaga.modelo || "";
        document.getElementById("vaga-salario").value = vaga.salario || "";
        document.getElementById("vaga-descricao").value = vaga.descricao || "";
        document.getElementById("vaga-requisitos").value = (vaga.requisitos || []).join(", ");

        abrirModal("modal-vaga");

        const btn = document.querySelector("#modal-vaga .btn-salvar");

        btn.textContent = "Atualizar Vaga";

        btn.onclick = async () => {
            const dadosAtualizados = {
                titulo: document.getElementById("vaga-titulo").value.trim(),
                tipo: document.getElementById("vaga-tipo").value,
                modelo: document.getElementById("vaga-modelo").value,
                salario: document.getElementById("vaga-salario").value.trim() || "A combinar",
                descricao: document.getElementById("vaga-descricao").value.trim(),
                requisitos: document.getElementById("vaga-requisitos").value
                    .split(",")
                    .map(r => r.trim())
                    .filter(Boolean)
            };

            try {
                const resposta = await fetch(`${VAGAS_URL}/${id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dadosAtualizados)
                });

                if (!resposta.ok) {
                    throw new Error("Erro ao atualizar vaga.");
                }

                fecharModal("modal-vaga");
                await carregarVagas();
                mostrarToast("Vaga atualizada!");

                btn.textContent = "Publicar Vaga";
                btn.onclick = salvarVaga;

            } catch {
                mostrarToast("Erro ao atualizar.", "erro");
            }
        };

    } catch {
        mostrarToast("Erro ao carregar dados da vaga.", "erro");
    }
}

async function salvarEdicao() {
    if (!empresaAtual || !empresaAtual.id) {
        return mostrarToast("Empresa não encontrada.", "erro");
    }

    const dados = {
        nome: document.getElementById("edit-nome").value.trim(),
        setor: document.getElementById("edit-setor").value,
        localizacao: document.getElementById("edit-localizacao").value.trim(),
        website: document.getElementById("edit-website").value.trim(),
        descricao: document.getElementById("edit-descricao").value.trim(),
        funcionarios: document.getElementById("edit-funcionarios").value,
        fundacao: document.getElementById("edit-fundacao").value.trim()
    };

    if (!dados.nome) {
        return mostrarToast("O nome não pode estar vazio.", "erro");
    }

    try {
        const res = await fetch(`${EMPRESAS_URL}/${empresaAtual.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (!res.ok) {
            throw new Error("Erro ao editar empresa.");
        }

        empresaAtual = {
            ...empresaAtual,
            ...dados
        };

        localStorage.setItem("empresaLogada", JSON.stringify(empresaAtual));

        renderizarEmpresa(empresaAtual);
        fecharModal("modal-editar");
        mostrarToast("Perfil atualizado com sucesso!");

    } catch {
        mostrarToast("Erro ao salvar alterações.", "erro");
    }
}

async function salvarContato() {
    if (!empresaAtual || !empresaAtual.id) {
        return mostrarToast("Empresa não encontrada.", "erro");
    }

    const dados = {
        email: document.getElementById("cont-email").value.trim(),
        telefone: document.getElementById("cont-tel").value.trim(),
        website: document.getElementById("cont-site").value.trim()
    };

    try {
        const res = await fetch(`${EMPRESAS_URL}/${empresaAtual.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (!res.ok) {
            throw new Error("Erro ao salvar contato.");
        }

        empresaAtual = {
            ...empresaAtual,
            ...dados
        };

        localStorage.setItem("empresaLogada", JSON.stringify(empresaAtual));

        renderizarEmpresa(empresaAtual);
        fecharModal("modal-contato");
        mostrarToast("Contato atualizado!");

    } catch {
        mostrarToast("Erro ao salvar contato.", "erro");
    }
}

function definirCor(cor, elemento = null) {
    corSelecionada = cor;

    const preview = document.getElementById("logo-preview-box");

    if (preview) {
        preview.style.background = cor;
    }

    document.querySelectorAll(".cor-btn").forEach(btn => {
        btn.classList.remove("selecionada");
    });

    if (elemento) {
        elemento.classList.add("selecionada");
    }
}

function salvarCor() {
    if (corSelecionada) {
        localStorage.setItem("avatarCor", corSelecionada);
        aplicarCor(corSelecionada);
    }

    fecharModal("modal-foto");
    mostrarToast("Logo atualizada!");
}

function aplicarCor(cor) {
    document.querySelectorAll(".perfil-avatar, .nav-avatar").forEach(avatar => {
        avatar.style.background = cor;
    });
}

function renderizarCapaOpcoes() {}

function previewCapaImagem(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = eventReader => {
        capaSelecionada = eventReader.target.result;

        const preview = document.getElementById("capa-preview");

        preview.style.background = "";
        preview.style.backgroundImage = `url('${eventReader.target.result}')`;
        preview.style.backgroundSize = "cover";
        preview.style.backgroundPosition = "center";

        const fname = document.getElementById("upload-filename");

        if (fname) {
            fname.textContent = file.name;
        }
    };

    reader.readAsDataURL(file);
}

function definirCapa(btn) {
    capaSelecionada = btn.dataset.bg;

    document.getElementById("capa-preview").style.background = capaSelecionada;

    document.querySelectorAll(".capa-btn").forEach(botao => {
        botao.classList.remove("selecionada");
    });

    btn.classList.add("selecionada");
}

function salvarCapa() {
    if (capaSelecionada) {
        localStorage.setItem("capaBg", capaSelecionada);
        aplicarCapaBanner(capaSelecionada);
    }

    fecharModal("modal-capa");
    mostrarToast("Capa atualizada!");
}

function aplicarCapaBanner(bg) {
    const banner = document.getElementById("cover-banner");

    if (!banner) {
        return;
    }

    if (bg.startsWith("data:image") || bg.startsWith("http") || bg.startsWith("blob:")) {
        banner.style.background = "";
        banner.style.backgroundImage = `url('${bg}')`;
        banner.style.backgroundSize = "cover";
        banner.style.backgroundPosition = "center";
    } else {
        banner.style.backgroundImage = "";
        banner.style.background = bg;
    }
}

function renderizarTagsCulturaOpcoes() {
    const container = document.getElementById("cultura-opcoes");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    TAGS_CULTURA_OPCOES.forEach(tag => {
        const btn = document.createElement("button");

        btn.className = "cultura-tag-btn";
        btn.textContent = tag;
        btn.dataset.tag = tag;
        btn.onclick = () => toggleTagCultura(btn, tag);

        container.appendChild(btn);
    });
}

function toggleTagCultura(btn, tag) {
    const ativas = [...document.querySelectorAll(".cultura-tag-btn.ativa")];

    if (btn.classList.contains("ativa")) {
        btn.classList.remove("ativa");
    } else {
        if (ativas.length >= 6) {
            return mostrarToast("Máximo de 6 tags permitidas.", "erro");
        }

        btn.classList.add("ativa");
    }
}

function salvarCultura() {
    const ativas = [...document.querySelectorAll(".cultura-tag-btn.ativa")]
        .map(btn => btn.dataset.tag);

    tagsCulturaAtuais = ativas;

    localStorage.setItem("tagsCultura", JSON.stringify(ativas));

    renderizarTagsNoPerfil(ativas);
    fecharModal("modal-cultura");
    mostrarToast("Tags de cultura atualizadas!");
}

function renderizarTagsNoPerfil(tags) {
    const container = document.getElementById("tags-cultura");

    if (!container) {
        return;
    }

    container.innerHTML = tags
        .map(tag => `<span class="tag-cultura">${tag}</span>`)
        .join("");
}

async function confirmarExclusao() {
    if (!empresaAtual || !empresaAtual.id) {
        return mostrarToast("Empresa não encontrada.", "erro");
    }

    if (!confirm("Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.")) {
        return;
    }

    try {
        const res = await fetch(`${EMPRESAS_URL}/${empresaAtual.id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            throw new Error("Erro ao excluir empresa.");
        }

        localStorage.removeItem("empresaLogada");
        mostrarToast("Conta excluída.", "erro");

        setTimeout(() => {
            window.location.href = "/home.html";
        }, 1200);

    } catch {
        mostrarToast("Erro ao excluir empresa.", "erro");
    }
}

function setTexto(id, valor) {
    const el = document.getElementById(id);

    if (el) {
        el.textContent = valor;
    }
}

function mostrarToast(msg, tipo = "ok") {
    const toast = document.getElementById("toast");

    if (!toast) {
        alert(msg);
        return;
    }

    toast.textContent = msg;
    toast.className = "toast ativo" + (tipo === "erro" ? " toast-erro" : "");

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
        toast.classList.remove("ativo");
    }, 3500);
}