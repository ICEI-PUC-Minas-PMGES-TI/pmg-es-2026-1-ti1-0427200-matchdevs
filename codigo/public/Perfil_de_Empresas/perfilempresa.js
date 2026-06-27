const API_URL = "http://localhost:3000";

let empresaAtual  = null;
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
    const cor  = localStorage.getItem("avatarCor");
    const capa = localStorage.getItem("capaBg");
    const tags = JSON.parse(localStorage.getItem("tagsCultura") || "[]");

    if (cor)  aplicarCor(cor);
    if (capa) aplicarCapaBanner(capa);
    if (tags.length) {
        tagsCulturaAtuais = tags;
        renderizarTagsNoPerfil(tags);
    }
}

async function carregarEmpresa() {
    try {
        const res     = await fetch(`${API_URL}/empresa`);
        const empresa = await res.json();
        empresaAtual  = empresa;
        renderizarEmpresa(empresa);
    } catch (err) {
        console.error("Erro ao carregar empresa:", err);
        mostrarToast("Servidor não encontrado. Rode: npm start", "erro");
    }
}

function renderizarEmpresa(empresa) {
    const inicial = empresa.nome.charAt(0).toUpperCase();

    setTexto("empresa-inicial",    inicial);
    setTexto("nav-inicial",        inicial);
    setTexto("nav-nome",           empresa.nome);
    setTexto("empresa-nome",       empresa.nome);
    setTexto("empresa-setor",      empresa.setor);
    setTexto("empresa-local",      empresa.localizacao);
    setTexto("empresa-descricao",  empresa.descricao);
    setTexto("empresa-site",       empresa.website ? empresa.website : "—");
    setTexto("empresa-funcionarios", empresa.funcionarios ? `${empresa.funcionarios} funcionários` : "—");
    setTexto("empresa-fundacao",   empresa.fundacao ? `Fundada em ${empresa.fundacao}` : "—");

    setTexto("contato-email", empresa.email    || "—");
    setTexto("contato-tel",   empresa.telefone || "—");
    const siteLink = document.getElementById("contato-site");
    if (siteLink) {
        siteLink.textContent = empresa.website || "—";
        siteLink.href        = empresa.website || "#";
    }

    setTexto("mapa-cidade", empresa.localizacao);
    const btnMapa = document.getElementById("btn-ver-mapa");
    if (btnMapa && empresa.localizacao)
        btnMapa.href = `mapa.html?local=${encodeURIComponent(empresa.localizacao)}`;

    setTexto("sobre-setor", empresa.setor        || "—");
    setTexto("sobre-func",  empresa.funcionarios || "—");
    setTexto("sobre-fund",  empresa.fundacao     ? `${empresa.fundacao}` : "—");

    setTexto("footer-email", empresa.email    || "");
    setTexto("footer-tel",   empresa.telefone || "");

    setTexto("met-func",  empresa.funcionarios || "—");
    setTexto("met-setor", empresa.setor        || "—");
    atualizarAnosMetrica(empresa.fundacao);

    const corSalva = localStorage.getItem("avatarCor");
    if (corSalva) aplicarCor(corSalva);
}

function atualizarAnosMetrica(fundacao) {
    const el = document.getElementById("met-anos");
    if (!el) return;
    el.textContent = fundacao ? `${new Date().getFullYear() - parseInt(fundacao)}` : "—";
}

async function carregarVagas() {
    const lista = document.getElementById("vagas-lista");
    const vazio = document.getElementById("vagas-vazio");
    const count = document.getElementById("vagas-count");
    const metVagas = document.getElementById("met-vagas");

    try {
        const res  = await fetch(`${API_URL}/vagas`);
        const vagas = await res.json();

        if (!vagas || vagas.length === 0) {
            vazio.style.display = "block";
            count.textContent   = "0 vagas publicadas";
            if (metVagas) metVagas.textContent = "0";
            return;
        }

        vazio.style.display = "none";
        lista.innerHTML     = "";
        count.textContent   = `${vagas.length} vaga${vagas.length > 1 ? "s" : ""} publicada${vagas.length > 1 ? "s" : ""}`;
        if (metVagas) metVagas.textContent = vagas.length;

        vagas.forEach(vaga => {
            const card = document.createElement("div");
            card.className = "vaga-card";
            const reqs = Array.isArray(vaga.requisitos)
                ? vaga.requisitos.map(r => `<span class="req-tag">${r}</span>`).join("")
                : "";
            card.innerHTML = `
                <div class="vaga-topo">
                    <span class="vaga-titulo">${vaga.titulo}</span>
                    <div class="vaga-badges">
                        <span class="badge badge-${vaga.modelo}">${vaga.modelo}</span>
                        <span class="badge-tipo">${vaga.tipo}</span>
                    </div>
                </div>
                <p class="vaga-desc">${vaga.descricao}</p>
                ${reqs ? `<div class="requisitos-row">${reqs}</div>` : ""}
                <div class="vaga-rodape">
                    <span class="vaga-salario">💰 ${vaga.salario}</span>
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
        count.textContent   = "Erro ao carregar";
    }
}

document.getElementById("btn-acoes").addEventListener("click", (e) => {
    e.stopPropagation();
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
        document.getElementById("edit-nome").value        = empresaAtual.nome        || "";
        document.getElementById("edit-setor").value       = empresaAtual.setor       || "";
        document.getElementById("edit-localizacao").value = empresaAtual.localizacao || "";
        document.getElementById("edit-website").value     = empresaAtual.website     || "";
        document.getElementById("edit-descricao").value   = empresaAtual.descricao   || "";
        document.getElementById("edit-funcionarios").value= empresaAtual.funcionarios|| "1-10";
        document.getElementById("edit-fundacao").value    = empresaAtual.fundacao    || "";
    }

    if (id === "modal-contato" && empresaAtual) {
        document.getElementById("cont-email").value = empresaAtual.email    || "";
        document.getElementById("cont-tel").value   = empresaAtual.telefone || "";
        document.getElementById("cont-site").value  = empresaAtual.website  || "";
    }

    if (id === "modal-foto") {
        const inicial  = empresaAtual ? empresaAtual.nome.charAt(0).toUpperCase() : "E";
        const corAtual = localStorage.getItem("avatarCor") || "#4c4cd6";
        const box = document.getElementById("logo-preview-box");
        box.textContent       = inicial;
        box.style.background  = corAtual;
        corSelecionada        = corAtual;
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
        if (fname) fname.textContent = "";
    }

    if (id === "modal-cultura") {
        document.querySelectorAll(".cultura-tag-btn").forEach(b => {
            b.classList.toggle("ativa", tagsCulturaAtuais.includes(b.dataset.tag));
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
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("ativo");
            document.body.style.overflow = "";
        }
    });
});

async function salvarVaga() {
    const titulo    = document.getElementById("vaga-titulo").value.trim();
    const tipo      = document.getElementById("vaga-tipo").value;
    const modelo    = document.getElementById("vaga-modelo").value;
    const salario   = document.getElementById("vaga-salario").value.trim();
    const descricao = document.getElementById("vaga-descricao").value.trim();
    const reqStr    = document.getElementById("vaga-requisitos").value.trim();

    if (!titulo)    return mostrarToast("Informe o título da vaga.", "erro");
    if (!descricao) return mostrarToast("Informe a descrição da vaga.", "erro");

    const requisitos = reqStr ? reqStr.split(",").map(r => r.trim()).filter(Boolean) : [];

    const novaVaga = {
        titulo, tipo, modelo,
        salario: salario || "A combinar",
        descricao, requisitos,
        data_publicacao: new Date().toISOString().split("T")[0],
        ativa: true
    };

    try {
        const res = await fetch(`${API_URL}/vagas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaVaga)
        });
        if (!res.ok) throw new Error();
        fecharModal("modal-vaga");
        limparFormVaga();
        await carregarVagas();
        mostrarToast("Vaga publicada com sucesso!");
    } catch {
        mostrarToast("Erro ao publicar a vaga.", "erro");
    }
}

function limparFormVaga() {
    ["vaga-titulo","vaga-salario","vaga-descricao","vaga-requisitos"].forEach(id => {
        document.getElementById(id).value = "";
    });
}

async function excluirVaga(id) {
    if (!confirm("Deseja remover esta vaga?")) return;
    try {
        await fetch(`${API_URL}/vagas/${id}`, { method: "DELETE" });
        await carregarVagas();
        mostrarToast("Vaga removida.");
    } catch {
        mostrarToast("Erro ao remover a vaga.", "erro");
    }
}

async function editarVaga(id) {
    try {
        const res  = await fetch(`${API_URL}/vagas/${id}`);
        const vaga = await res.json();
        document.getElementById("vaga-titulo").value    = vaga.titulo;
        document.getElementById("vaga-tipo").value      = vaga.tipo;
        document.getElementById("vaga-modelo").value    = vaga.modelo;
        document.getElementById("vaga-salario").value   = vaga.salario;
        document.getElementById("vaga-descricao").value = vaga.descricao;
        document.getElementById("vaga-requisitos").value= (vaga.requisitos || []).join(", ");
        abrirModal("modal-vaga");

        const btn = document.querySelector("#modal-vaga .btn-salvar");
        btn.textContent = "Atualizar Vaga";
        btn.onclick = async () => {
            const dadosAtualizados = {
                titulo:     document.getElementById("vaga-titulo").value.trim(),
                tipo:       document.getElementById("vaga-tipo").value,
                modelo:     document.getElementById("vaga-modelo").value,
                salario:    document.getElementById("vaga-salario").value.trim() || "A combinar",
                descricao:  document.getElementById("vaga-descricao").value.trim(),
                requisitos: document.getElementById("vaga-requisitos").value.split(",").map(r=>r.trim()).filter(Boolean)
            };
            try {
                await fetch(`${API_URL}/vagas/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dadosAtualizados)
                });
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
    const dados = {
        nome:         document.getElementById("edit-nome").value.trim(),
        setor:        document.getElementById("edit-setor").value,
        localizacao:  document.getElementById("edit-localizacao").value.trim(),
        website:      document.getElementById("edit-website").value.trim(),
        descricao:    document.getElementById("edit-descricao").value.trim(),
        funcionarios: document.getElementById("edit-funcionarios").value,
        fundacao:     document.getElementById("edit-fundacao").value.trim()
    };

    if (!dados.nome) return mostrarToast("O nome não pode estar vazio.", "erro");

    try {
        const res = await fetch(`${API_URL}/empresa`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error();
        empresaAtual = { ...empresaAtual, ...dados };
        renderizarEmpresa(empresaAtual);
        fecharModal("modal-editar");
        mostrarToast("Perfil atualizado com sucesso!");
    } catch {
        mostrarToast("Erro ao salvar alterações.", "erro");
    }
}

async function salvarContato() {
    const dados = {
        email:    document.getElementById("cont-email").value.trim(),
        telefone: document.getElementById("cont-tel").value.trim(),
        website:  document.getElementById("cont-site").value.trim()
    };
    try {
        await fetch(`${API_URL}/empresa`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        empresaAtual = { ...empresaAtual, ...dados };
        renderizarEmpresa(empresaAtual);
        fecharModal("modal-contato");
        mostrarToast("Contato atualizado!");
    } catch {
        mostrarToast("Erro ao salvar contato.", "erro");
    }
}

function definirCor(cor) {
    corSelecionada = cor;
    document.getElementById("logo-preview-box").style.background = cor;
    document.querySelectorAll(".cor-btn").forEach(b => b.classList.remove("selecionada"));
    event.target.classList.add("selecionada");
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
    document.querySelectorAll(".perfil-avatar, .nav-avatar").forEach(a => a.style.background = cor);
}

function renderizarCapaOpcoes() {
    // Nada a renderizar — agora a capa é via upload de imagem
}

function previewCapaImagem(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        capaSelecionada = e.target.result;
        const preview = document.getElementById("capa-preview");
        preview.style.background = "";
        preview.style.backgroundImage = `url('${e.target.result}')`;
        preview.style.backgroundSize = "cover";
        preview.style.backgroundPosition = "center";
        const fname = document.getElementById("upload-filename");
        if (fname) fname.textContent = file.name;
    };
    reader.readAsDataURL(file);
}

function definirCapa(btn) {
    capaSelecionada = btn.dataset.bg;
    document.getElementById("capa-preview").style.background = capaSelecionada;
    document.querySelectorAll(".capa-btn").forEach(b => b.classList.remove("selecionada"));
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
    if (!banner) return;
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
    if (!container) return;
    container.innerHTML = "";
    TAGS_CULTURA_OPCOES.forEach(tag => {
        const btn = document.createElement("button");
        btn.className    = "cultura-tag-btn";
        btn.textContent  = tag;
        btn.dataset.tag  = tag;
        btn.onclick      = () => toggleTagCultura(btn, tag);
        container.appendChild(btn);
    });
}

function toggleTagCultura(btn, tag) {
    const ativas = [...document.querySelectorAll(".cultura-tag-btn.ativa")];
    if (btn.classList.contains("ativa")) {
        btn.classList.remove("ativa");
    } else {
        if (ativas.length >= 6) return mostrarToast("Máximo de 6 tags permitidas.", "erro");
        btn.classList.add("ativa");
    }
}

function salvarCultura() {
    const ativas = [...document.querySelectorAll(".cultura-tag-btn.ativa")].map(b => b.dataset.tag);
    tagsCulturaAtuais = ativas;
    localStorage.setItem("tagsCultura", JSON.stringify(ativas));
    renderizarTagsNoPerfil(ativas);
    fecharModal("modal-cultura");
    mostrarToast("Tags de cultura atualizadas!");
}

function renderizarTagsNoPerfil(tags) {
    const container = document.getElementById("tags-cultura");
    if (!container) return;
    container.innerHTML = tags.map(t => `<span class="tag-cultura">${t}</span>`).join("");
}

function confirmarExclusao() {
    if (confirm("Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.")) {
        mostrarToast("Conta excluída (simulação — sem backend real para deletar).", "erro");
    }
}

function setTexto(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
}

function mostrarToast(msg, tipo = "ok") {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.className   = "toast ativo" + (tipo === "erro" ? " toast-erro" : "");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("ativo"), 3500);
}
