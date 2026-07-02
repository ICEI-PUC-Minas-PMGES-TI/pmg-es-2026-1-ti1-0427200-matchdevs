const API_URL = "https://pmg-es-2026-1-ti1-0427200-matchdevs.onrender.com";
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

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", event => {
            if (event.target === overlay) fecharModal(overlay.id);
        });
    });

    const btnAcoes = document.getElementById("btn-acoes");
    if (btnAcoes) {
        btnAcoes.addEventListener("click", event => {
            event.stopPropagation();
            document.getElementById("acoes-menu").classList.toggle("ativo");
            btnAcoes.classList.toggle("ativo");
        });
    }
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
        const empresaVisualizada = JSON.parse(localStorage.getItem("empresaVisualizada") || "null");

        if (empresaLogada && empresaLogada.id) {
            const response = await fetch(`${EMPRESAS_URL}/${empresaLogada.id}`);
            empresaAtual = response.ok ? await response.json() : empresaLogada;
        } else if (empresaVisualizada) {
            empresaAtual = empresaVisualizada;
        } else {
            const response = await fetch(EMPRESAS_URL);
            const empresas = response.ok ? await response.json() : [];
            empresaAtual = empresas[0] || {};
        }

        renderizarEmpresa(empresaAtual);

    } catch (erro) {
        console.error("Erro ao carregar empresa:", erro);
        mostrarToast("Erro ao carregar dados da empresa.", "erro");
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
    setTexto("mapa-cidade", empresa.localizacao || "—");
    setTexto("sobre-setor", empresa.setor || "—");
    setTexto("sobre-func", empresa.funcionarios || "—");
    setTexto("sobre-fund", empresa.fundacao ? `${empresa.fundacao}` : "—");
    setTexto("footer-email", empresa.email || "");
    setTexto("footer-tel", empresa.telefone || "");
    setTexto("met-func", empresa.funcionarios || "—");
    setTexto("met-setor", empresa.setor || "—");

    const siteLink = document.getElementById("contato-site");
    if (siteLink) {
        siteLink.textContent = empresa.website || "—";
        siteLink.href = empresa.website || "#";
    }

    const btnMapa = document.getElementById("btn-ver-mapa");
    if (btnMapa && empresa.localizacao) {
        btnMapa.href = `mapa.html?local=${encodeURIComponent(empresa.localizacao)}`;
    }

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

    if (!lista) return;

    try {
        const response = await fetch(VAGAS_URL);
        let vagas = response.ok ? await response.json() : [];

        if (empresaAtual && empresaAtual.id) {
            const filtradas = vagas.filter(vaga => Number(vaga.empresaId) === Number(empresaAtual.id));
            if (filtradas.length) vagas = filtradas;
        }

        lista.innerHTML = "";

        if (!vagas.length) {
            if (vazio) vazio.style.display = "block";
            if (count) count.textContent = "0 vagas publicadas";
            if (metVagas) metVagas.textContent = "0";
            return;
        }

        if (vazio) vazio.style.display = "none";
        if (count) count.textContent = `${vagas.length} vaga${vagas.length > 1 ? "s" : ""} publicada${vagas.length > 1 ? "s" : ""}`;
        if (metVagas) metVagas.textContent = vagas.length;

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
                        <span class="badge">${modelo}</span>
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

    } catch (erro) {
        console.error("Erro ao carregar vagas:", erro);
        if (vazio) vazio.style.display = "block";
        if (count) count.textContent = "Erro ao carregar";
    }
}

function fecharMenuAoClicarFora() {
    document.addEventListener("click", () => {
        const menu = document.getElementById("acoes-menu");
        const btn = document.getElementById("btn-acoes");

        if (menu) menu.classList.remove("ativo");
        if (btn) btn.classList.remove("ativo");
    });
}

function abrirModal(id) {
    const menu = document.getElementById("acoes-menu");
    if (menu) menu.classList.remove("ativo");

    if (id === "modal-editar" && empresaAtual) {
        setValor("edit-nome", empresaAtual.nome);
        setValor("edit-setor", empresaAtual.setor);
        setValor("edit-localizacao", empresaAtual.localizacao);
        setValor("edit-website", empresaAtual.website);
        setValor("edit-descricao", empresaAtual.descricao);
        setValor("edit-funcionarios", empresaAtual.funcionarios || "1-10");
        setValor("edit-fundacao", empresaAtual.fundacao);
    }

    if (id === "modal-contato" && empresaAtual) {
        setValor("cont-email", empresaAtual.email);
        setValor("cont-tel", empresaAtual.telefone);
        setValor("cont-site", empresaAtual.website);
    }

    if (id === "modal-foto") {
        const inicial = empresaAtual && empresaAtual.nome ? empresaAtual.nome.charAt(0).toUpperCase() : "E";
        const corAtual = localStorage.getItem("avatarCor") || "#4c4cd6";
        const box = document.getElementById("logo-preview-box");

        if (box) {
            box.textContent = inicial;
            box.style.background = corAtual;
        }

        corSelecionada = corAtual;
    }

    if (id === "modal-capa") {
        const capaAtual = localStorage.getItem("capaBg") || "";
        const preview = document.getElementById("capa-preview");

        if (preview && capaAtual) {
            aplicarPreviewCapa(preview, capaAtual);
        }

        capaSelecionada = capaAtual || null;

        const fname = document.getElementById("upload-filename");
        if (fname) fname.textContent = "";
    }

    if (id === "modal-cultura") {
        document.querySelectorAll(".cultura-tag-btn").forEach(btn => {
            btn.classList.toggle("ativa", tagsCulturaAtuais.includes(btn.dataset.tag));
        });
    }

    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add("ativo");
        document.body.style.overflow = "hidden";
    }
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("ativo");
    document.body.style.overflow = "";
}

async function salvarVaga() {
    const titulo = getValor("vaga-titulo");
    const tipo = document.getElementById("vaga-tipo").value;
    const modelo = document.getElementById("vaga-modelo").value;
    const salario = getValor("vaga-salario") || "A combinar";
    const descricao = getValor("vaga-descricao");
    const requisitos = getValor("vaga-requisitos").split(",").map(r => r.trim()).filter(Boolean);

    if (!titulo) return mostrarToast("Informe o título da vaga.", "erro");
    if (!descricao) return mostrarToast("Informe a descrição da vaga.", "erro");

    const novaVaga = {
        titulo,
        tipo,
        modelo,
        empresa: empresaAtual ? empresaAtual.nome : "",
        empresaId: empresaAtual ? empresaAtual.id : null,
        localizacao: empresaAtual ? empresaAtual.localizacao : "",
        salario,
        descricao,
        requisitos,
        data_publicacao: new Date().toISOString().split("T")[0],
        ativa: true
    };

    try {
        const response = await fetch(VAGAS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaVaga)
        });

        if (!response.ok) throw new Error();

        fecharModal("modal-vaga");
        limparFormVaga();
        await carregarVagas();
        mostrarToast("Vaga publicada com sucesso!");

    } catch {
        mostrarToast("Erro ao publicar vaga.", "erro");
    }
}

function limparFormVaga() {
    ["vaga-titulo", "vaga-salario", "vaga-descricao", "vaga-requisitos"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

async function excluirVaga(id) {
    if (!confirm("Deseja remover esta vaga?")) return;

    try {
        await fetch(`${VAGAS_URL}/${id}`, { method: "DELETE" });
        await carregarVagas();
        mostrarToast("Vaga removida.");
    } catch {
        mostrarToast("Erro ao remover vaga.", "erro");
    }
}

async function editarVaga(id) {
    try {
        const response = await fetch(`${VAGAS_URL}/${id}`);
        const vaga = await response.json();

        setValor("vaga-titulo", vaga.titulo);
        setValor("vaga-tipo", vaga.tipo || vaga.tipo_contrato);
        setValor("vaga-modelo", vaga.modelo);
        setValor("vaga-salario", vaga.salario);
        setValor("vaga-descricao", vaga.descricao);
        setValor("vaga-requisitos", (vaga.requisitos || []).join(", "));

        abrirModal("modal-vaga");

        const btn = document.querySelector("#modal-vaga .btn-salvar");
        if (!btn) return;

        btn.textContent = "Atualizar Vaga";

        btn.onclick = async () => {
            const dados = {
                titulo: getValor("vaga-titulo"),
                tipo: document.getElementById("vaga-tipo").value,
                modelo: document.getElementById("vaga-modelo").value,
                salario: getValor("vaga-salario") || "A combinar",
                descricao: getValor("vaga-descricao"),
                requisitos: getValor("vaga-requisitos").split(",").map(r => r.trim()).filter(Boolean)
            };

            await fetch(`${VAGAS_URL}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            btn.textContent = "Publicar Vaga";
            btn.onclick = salvarVaga;

            fecharModal("modal-vaga");
            await carregarVagas();
            mostrarToast("Vaga atualizada!");
        };

    } catch {
        mostrarToast("Erro ao carregar vaga.", "erro");
    }
}

async function salvarEdicao() {
    if (!empresaAtual || !empresaAtual.id) return mostrarToast("Empresa não encontrada.", "erro");

    const dados = {
        nome: getValor("edit-nome"),
        setor: document.getElementById("edit-setor").value,
        localizacao: getValor("edit-localizacao"),
        website: getValor("edit-website"),
        descricao: getValor("edit-descricao"),
        funcionarios: document.getElementById("edit-funcionarios").value,
        fundacao: getValor("edit-fundacao")
    };

    if (!dados.nome) return mostrarToast("O nome não pode estar vazio.", "erro");

    try {
        await fetch(`${EMPRESAS_URL}/${empresaAtual.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
    } catch {}

    empresaAtual = { ...empresaAtual, ...dados };
    localStorage.setItem("empresaLogada", JSON.stringify(empresaAtual));

    renderizarEmpresa(empresaAtual);
    fecharModal("modal-editar");
    mostrarToast("Perfil atualizado com sucesso!");
}

async function salvarContato() {
    if (!empresaAtual || !empresaAtual.id) return mostrarToast("Empresa não encontrada.", "erro");

    const dados = {
        email: getValor("cont-email"),
        telefone: getValor("cont-tel"),
        website: getValor("cont-site")
    };

    try {
        await fetch(`${EMPRESAS_URL}/${empresaAtual.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
    } catch {}

    empresaAtual = { ...empresaAtual, ...dados };
    localStorage.setItem("empresaLogada", JSON.stringify(empresaAtual));

    renderizarEmpresa(empresaAtual);
    fecharModal("modal-contato");
    mostrarToast("Contato atualizado!");
}

function definirCor(cor) {
    corSelecionada = cor;

    const preview = document.getElementById("logo-preview-box");
    if (preview) preview.style.background = cor;

    document.querySelectorAll(".cor-btn").forEach(btn => btn.classList.remove("selecionada"));

    if (event && event.target) event.target.classList.add("selecionada");
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
    document.querySelectorAll(".perfil-avatar, .nav-avatar").forEach(el => {
        el.style.background = cor;
    });
}

function previewCapaImagem(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = e => {
        capaSelecionada = e.target.result;

        const preview = document.getElementById("capa-preview");
        if (preview) aplicarPreviewCapa(preview, capaSelecionada);

        const fname = document.getElementById("upload-filename");
        if (fname) fname.textContent = file.name;
    };

    reader.readAsDataURL(file);
}

function aplicarPreviewCapa(el, bg) {
    if (bg.startsWith("data:image") || bg.startsWith("http") || bg.startsWith("blob:")) {
        el.style.background = "";
        el.style.backgroundImage = `url('${bg}')`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
    } else {
        el.style.backgroundImage = "";
        el.style.background = bg;
    }
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

    aplicarPreviewCapa(banner, bg);
}

function renderizarTagsCulturaOpcoes() {
    const container = document.getElementById("cultura-opcoes");
    if (!container) return;

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
        if (ativas.length >= 6) return mostrarToast("Máximo de 6 tags permitidas.", "erro");
        btn.classList.add("ativa");
    }
}

function salvarCultura() {
    const ativas = [...document.querySelectorAll(".cultura-tag-btn.ativa")].map(btn => btn.dataset.tag);

    tagsCulturaAtuais = ativas;

    localStorage.setItem("tagsCultura", JSON.stringify(ativas));

    renderizarTagsNoPerfil(ativas);
    fecharModal("modal-cultura");
    mostrarToast("Tags de cultura atualizadas!");
}

function renderizarTagsNoPerfil(tags) {
    const container = document.getElementById("tags-cultura");
    if (!container) return;

    container.innerHTML = tags.map(tag => `<span class="tag-cultura">${tag}</span>`).join("");
}

async function confirmarExclusao() {
    if (!empresaAtual || !empresaAtual.id) return mostrarToast("Empresa não encontrada.", "erro");

    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return;

    try {
        await fetch(`${EMPRESAS_URL}/${empresaAtual.id}`, { method: "DELETE" });
    } catch {}

    localStorage.removeItem("empresaLogada");
    mostrarToast("Conta excluída.", "erro");

    setTimeout(() => {
        window.location.href = "home.html";
    }, 1000);
}

function getValor(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

function setValor(id, valor) {
    const el = document.getElementById(id);
    if (el) el.value = valor || "";
}

function setTexto(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor || "";
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
    }, 3000);
}