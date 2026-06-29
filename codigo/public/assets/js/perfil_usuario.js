const API = "http://localhost:3000";

const PERFIL_URL = `${API}/perfil`;
const EXPERIENCIAS_URL = `${API}/experiencias`;
const EDUCACOES_URL = `${API}/educacoes`;
const HABILIDADES_URL = `${API}/habilidades`;
const CERTIFICACOES_URL = `${API}/certificacoes`;

let perfil = {};

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                fecharModal(overlay.id);
            }
        });
    });

    init();
});

async function init() {
    await carregarPerfil();
    await carregarExperiencias();
    await carregarEducacoes();
    await carregarHabilidades();
    await carregarCertificacoes();
}

async function getJSON(url, fallback = []) {
    try {
        const response = await fetch(url);
        if (!response.ok) return fallback;
        return await response.json();
    } catch {
        return fallback;
    }
}

async function carregarPerfil() {
    const data = await getJSON(PERFIL_URL, null);
    const usuario = JSON.parse(sessionStorage.getItem("usuarioCorrente") || "null");
    const localPerfil = JSON.parse(localStorage.getItem("perfil_usuario_local") || "null");

    if (localPerfil) {
        perfil = localPerfil;
    } else if (Array.isArray(data)) {
        perfil = data[0] || {};
    } else {
        perfil = data || {};
    }

    perfil = {
        id: perfil.id || 1,
        nome: perfil.nome || (usuario ? usuario.nome : "Usuário"),
        cargo: perfil.cargo || "Candidato",
        empresa: perfil.empresa || "BH Works",
        local: perfil.local || "Belo Horizonte, MG",
        email: perfil.email || (usuario ? usuario.email : ""),
        tel: perfil.tel || "",
        linkedin: perfil.linkedin || "",
        github: perfil.github || "",
        sobre: perfil.sobre || "Perfil em construção.",
        disponibilidade: perfil.disponibilidade || "disponivel",
        metricas: perfil.metricas || {
            exp: 0,
            proj: 0,
            rec: 0,
            match: "0%"
        },
        fotoPerfil: perfil.fotoPerfil || "",
        bannerImg: perfil.bannerImg || ""
    };

    renderPerfil();
}

function setTexto(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor || "";
}

function setValor(id, valor) {
    const el = document.getElementById(id);
    if (el) el.value = valor || "";
}

function renderPerfil() {
    const metricas = perfil.metricas || {};

    setTexto("usuario-nome", perfil.nome);
    setTexto("usuario-local", perfil.local);
    setTexto("nav-nome", perfil.nome);
    setTexto("contato-tel", perfil.tel);
    setTexto("contato-linkedin", perfil.linkedin);
    setTexto("contato-github", perfil.github);
    setTexto("sobre-texto", perfil.sobre);

    const cargoEl = document.getElementById("usuario-cargo");
    if (cargoEl) {
        cargoEl.innerHTML = `${perfil.cargo || ""} · <strong id="usuario-empresa">${perfil.empresa || ""}</strong>`;
    }

    const emailEl = document.getElementById("contato-email");
    if (emailEl) {
        emailEl.textContent = perfil.email || "";
        emailEl.href = `mailto:${perfil.email || ""}`;
    }

    const linkedinEl = document.getElementById("contato-linkedin");
    if (linkedinEl) linkedinEl.href = normalizarUrl(perfil.linkedin);

    const githubEl = document.getElementById("contato-github");
    if (githubEl) githubEl.href = normalizarUrl(perfil.github);

    setTexto("met-exp", metricas.exp || 0);
    setTexto("met-proj", metricas.proj || 0);
    setTexto("met-rec", metricas.rec || 0);
    setTexto("met-match", metricas.match || "0%");

    setValor("edit-nome", perfil.nome);
    setValor("edit-cargo", perfil.cargo);
    setValor("edit-empresa", perfil.empresa);
    setValor("edit-local", perfil.local);
    setValor("edit-email", perfil.email);
    setValor("edit-tel", perfil.tel);
    setValor("edit-linkedin", perfil.linkedin);
    setValor("edit-github", perfil.github);
    setValor("edit-disp", perfil.disponibilidade);
    setValor("edit-exp", metricas.exp || 0);
    setValor("edit-proj", metricas.proj || 0);
    setValor("edit-rec", metricas.rec || 0);
    setValor("edit-match", metricas.match || "0%");
    setValor("edit-sobre", perfil.sobre);

    const inicial = perfil.nome ? perfil.nome.charAt(0).toUpperCase() : "U";

    setTexto("avatar-inicial", inicial);
    setTexto("nav-inicial", inicial);

    const msgPara = document.getElementById("msg-para");
    if (msgPara) msgPara.value = perfil.nome;

    renderBadgeDisp(perfil.disponibilidade);

    if (perfil.fotoPerfil) aplicarFoto(perfil.fotoPerfil);
    if (perfil.bannerImg) aplicarBanner(perfil.bannerImg);
}

function normalizarUrl(valor) {
    if (!valor) return "#";
    if (valor.startsWith("http://") || valor.startsWith("https://")) return valor;
    return `https://${valor}`;
}

async function atualizarPerfil(dados) {
    perfil = {
        ...perfil,
        ...dados
    };

    localStorage.setItem("perfil_usuario_local", JSON.stringify(perfil));

    try {
        await fetch(`${PERFIL_URL}/${perfil.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });
    } catch {}

    return perfil;
}

async function salvarPerfil() {
    const nome = document.getElementById("edit-nome").value.trim();

    if (!nome) {
        toast("Informe o nome.", "erro");
        return;
    }

    const dados = {
        nome,
        cargo: document.getElementById("edit-cargo").value.trim(),
        empresa: document.getElementById("edit-empresa").value.trim(),
        local: document.getElementById("edit-local").value.trim(),
        email: document.getElementById("edit-email").value.trim(),
        tel: document.getElementById("edit-tel").value.trim(),
        linkedin: document.getElementById("edit-linkedin").value.trim(),
        github: document.getElementById("edit-github").value.trim(),
        disponibilidade: document.getElementById("edit-disp").value,
        metricas: {
            exp: document.getElementById("edit-exp").value,
            proj: document.getElementById("edit-proj").value,
            rec: document.getElementById("edit-rec").value,
            match: document.getElementById("edit-match").value
        }
    };

    await atualizarPerfil(dados);
    renderPerfil();
    fecharModal("modal-editar");
    toast("Perfil atualizado!", "sucesso");
}

async function salvarSobre() {
    const sobre = document.getElementById("edit-sobre").value.trim();

    await atualizarPerfil({ sobre });

    const el = document.getElementById("sobre-texto");
    if (el) {
        el.textContent = sobre;
        el.classList.add("truncado");
    }

    const btn = document.getElementById("btn-ver-mais");
    if (btn) btn.textContent = "Ver mais ▾";

    fecharModal("modal-sobre");
    toast("Sobre atualizado!", "sucesso");
}

async function carregarExperiencias() {
    const listaLocal = JSON.parse(localStorage.getItem("experiencias_usuario_local") || "[]");
    const listaApi = await getJSON(EXPERIENCIAS_URL, []);
    const lista = listaLocal.length ? listaLocal : listaApi;

    const container = document.getElementById("exp-lista");
    if (!container) return;

    container.innerHTML = lista.map(exp => htmlExp(exp)).join("");

    const count = document.getElementById("exp-count");
    if (count) count.textContent = lista.length + " cargo" + (lista.length > 1 ? "s" : "");
}

function htmlExp(exp) {
    const inicial = exp.empresa ? exp.empresa.charAt(0).toUpperCase() : "E";
    const cor = exp.cor || "#4c4cd6";
    const periodo = `${exp.inicio ? fmtMes(exp.inicio) : ""} – ${exp.fim ? fmtMes(exp.fim) : "Presente"}${exp.local ? " · " + exp.local : ""}`;

    const tags = exp.tags
        ? exp.tags.map(tag => `<span class="exp-tag">${tag}</span>`).join("")
        : "";

    return `
        <div class="exp-item">
            <div class="exp-icone" style="background:${cor}22;border-color:${cor}66;color:${cor};">${inicial}</div>
            <div class="exp-corpo">
                <div class="exp-titulo">${exp.cargo || ""}</div>
                <div class="exp-empresa">${exp.empresa || ""} · ${exp.modalidade || ""}</div>
                <div class="exp-periodo">${periodo}</div>
                ${exp.desc ? `<div class="exp-desc">${exp.desc}</div>` : ""}
                ${tags ? `<div class="exp-tags">${tags}</div>` : ""}
            </div>
        </div>
    `;
}

async function adicionarExp() {
    const cargo = document.getElementById("exp-cargo").value.trim();
    const empresa = document.getElementById("exp-empresa").value.trim();

    if (!cargo || !empresa) {
        toast("Informe cargo e empresa.", "erro");
        return;
    }

    const nova = {
        id: Date.now(),
        cargo,
        empresa,
        modalidade: document.getElementById("exp-modo").value,
        inicio: document.getElementById("exp-inicio").value,
        fim: document.getElementById("exp-fim").value || null,
        local: document.getElementById("exp-local").value.trim(),
        desc: document.getElementById("exp-desc").value.trim(),
        tags: document.getElementById("exp-tags").value.split(",").map(t => t.trim()).filter(Boolean),
        cor: `hsl(${Math.round(Math.random() * 360)},60%,50%)`
    };

    const lista = JSON.parse(localStorage.getItem("experiencias_usuario_local") || "[]");
    lista.push(nova);
    localStorage.setItem("experiencias_usuario_local", JSON.stringify(lista));

    try {
        await fetch(EXPERIENCIAS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nova)
        });
    } catch {}

    await carregarExperiencias();
    fecharModal("modal-exp");
    toast("Experiência adicionada!", "sucesso");

    ["exp-cargo", "exp-empresa", "exp-inicio", "exp-fim", "exp-local", "exp-desc", "exp-tags"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

async function carregarEducacoes() {
    const listaLocal = JSON.parse(localStorage.getItem("educacoes_usuario_local") || "[]");
    const listaApi = await getJSON(EDUCACOES_URL, []);
    const lista = listaLocal.length ? listaLocal : listaApi;

    const container = document.getElementById("edu-lista");
    if (!container) return;

    container.innerHTML = lista.map(edu => `
        <div class="edu-item">
            <div class="edu-icone">🎓</div>
            <div>
                <div class="edu-titulo">${edu.curso || ""}</div>
                <div class="edu-inst">${edu.instituicao || ""}</div>
                <div class="edu-periodo">${edu.inicio || ""}${edu.fim ? " – " + edu.fim : ""}</div>
            </div>
        </div>
    `).join("");
}

async function adicionarEdu() {
    const curso = document.getElementById("edu-curso").value.trim();
    const instituicao = document.getElementById("edu-inst").value.trim();

    if (!curso || !instituicao) {
        toast("Informe curso e instituição.", "erro");
        return;
    }

    const nova = {
        id: Date.now(),
        curso,
        instituicao,
        inicio: document.getElementById("edu-inicio").value,
        fim: document.getElementById("edu-fim").value || null
    };

    const lista = JSON.parse(localStorage.getItem("educacoes_usuario_local") || "[]");
    lista.push(nova);
    localStorage.setItem("educacoes_usuario_local", JSON.stringify(lista));

    try {
        await fetch(EDUCACOES_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nova)
        });
    } catch {}

    await carregarEducacoes();
    fecharModal("modal-edu");
    toast("Educação adicionada!", "sucesso");

    ["edu-curso", "edu-inst", "edu-inicio", "edu-fim"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

async function carregarHabilidades() {
    const listaLocal = JSON.parse(localStorage.getItem("habilidades_usuario_local") || "[]");
    const listaApi = await getJSON(HABILIDADES_URL, []);
    const lista = listaLocal.length ? listaLocal : listaApi;

    const container = document.getElementById("hab-grid");
    if (!container) return;

    container.innerHTML = lista.map(hab => `
        <div class="hab-item">
            ${hab.nome || ""}
            ${hab.endossos > 0 ? `<span class="hab-end">+${hab.endossos}</span>` : ""}
        </div>
    `).join("");
}

async function adicionarHab() {
    const nome = document.getElementById("hab-nome").value.trim();

    if (!nome) {
        toast("Informe uma habilidade.", "erro");
        return;
    }

    const nova = {
        id: Date.now(),
        nome,
        endossos: 0
    };

    const lista = JSON.parse(localStorage.getItem("habilidades_usuario_local") || "[]");
    lista.push(nova);
    localStorage.setItem("habilidades_usuario_local", JSON.stringify(lista));

    try {
        await fetch(HABILIDADES_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nova)
        });
    } catch {}

    await carregarHabilidades();
    fecharModal("modal-hab");
    toast("Habilidade adicionada!", "sucesso");

    document.getElementById("hab-nome").value = "";
}

async function carregarCertificacoes() {
    const listaLocal = JSON.parse(localStorage.getItem("certificacoes_usuario_local") || "[]");
    const listaApi = await getJSON(CERTIFICACOES_URL, []);
    const lista = listaLocal.length ? listaLocal : listaApi;

    const container = document.getElementById("cert-lista");
    if (!container) return;

    container.innerHTML = lista.map(cert => `
        <div class="cert-item">
            <div class="cert-icone">${cert.icone || "🏅"}</div>
            <div>
                <div class="cert-nome">${cert.nome || ""}</div>
                <div class="cert-emissor">${cert.emissor || ""}</div>
            </div>
            <div class="cert-ano">${cert.ano || ""}</div>
        </div>
    `).join("");
}

async function adicionarCert() {
    const nome = document.getElementById("cert-nome").value.trim();

    if (!nome) {
        toast("Informe o nome da certificação.", "erro");
        return;
    }

    const nova = {
        id: Date.now(),
        nome,
        emissor: document.getElementById("cert-emissor").value.trim(),
        ano: document.getElementById("cert-ano").value,
        icone: "🏅"
    };

    const lista = JSON.parse(localStorage.getItem("certificacoes_usuario_local") || "[]");
    lista.push(nova);
    localStorage.setItem("certificacoes_usuario_local", JSON.stringify(lista));

    try {
        await fetch(CERTIFICACOES_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nova)
        });
    } catch {}

    await carregarCertificacoes();
    fecharModal("modal-cert");
    toast("Certificação adicionada!", "sucesso");

    ["cert-nome", "cert-emissor", "cert-ano"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

function carregarBanner(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async event => {
        aplicarBanner(event.target.result);
        await atualizarPerfil({ bannerImg: event.target.result });
        toast("Banner atualizado!", "sucesso");
    };

    reader.readAsDataURL(file);
}

function aplicarBanner(src) {
    const img = document.getElementById("banner-img");

    if (img) {
        img.src = src;
        img.style.display = "block";
    }
}

function carregarFoto(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async event => {
        aplicarFoto(event.target.result);
        await atualizarPerfil({ fotoPerfil: event.target.result });
        toast("Foto de perfil atualizada!", "sucesso");
    };

    reader.readAsDataURL(file);
}

function aplicarFoto(src) {
    const avatarImg = document.getElementById("avatar-img");
    const avatarInicial = document.getElementById("avatar-inicial");
    const navWrap = document.getElementById("nav-avatar-wrap");

    if (avatarImg) {
        avatarImg.src = src;
        avatarImg.style.display = "block";
    }

    if (avatarInicial) avatarInicial.style.display = "none";

    if (navWrap) {
        navWrap.innerHTML = `${src}`;
    }
}

function abrirModal(id) {
    document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.classList.remove("ativo");
    });

    const modal = document.getElementById(id);
    if (modal) modal.classList.add("ativo");
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("ativo");
}

function verMais() {
    const el = document.getElementById("sobre-texto");
    const btn = document.getElementById("btn-ver-mais");

    if (!el || !btn) return;

    if (el.classList.contains("truncado")) {
        el.classList.remove("truncado");
        btn.textContent = "Ver menos ▴";
    } else {
        el.classList.add("truncado");
        btn.textContent = "Ver mais ▾";
    }
}

function enviarMsg() {
    const msg = document.getElementById("msg-texto").value.trim();

    if (!msg) return;

    fecharModal("modal-msg");
    toast("Mensagem enviada!", "sucesso");
    document.getElementById("msg-texto").value = "";
}

function conectar() {
    const btn = document.getElementById("btn-conectar");
    if (!btn) return;

    btn.innerHTML = "✓ Conectado";
    btn.style.background = "var(--success)";
    btn.disabled = true;

    toast("Convite enviado!", "sucesso");
}

function renderBadgeDisp(valor) {
    const badge = document.getElementById("badge-disp");
    if (!badge) return;

    if (valor === "disponivel") {
        badge.textContent = "● Disponível";
        badge.className = "badge badge-success";
        badge.style.display = "";
    } else if (valor === "passivo") {
        badge.textContent = "◐ Aberto passivamente";
        badge.className = "badge badge-premium";
        badge.style.display = "";
    } else {
        badge.style.display = "none";
    }
}

function fmtMes(valor) {
    if (!valor) return "";

    const [ano, mes] = valor.split("-");
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    return `${meses[parseInt(mes) - 1]} ${ano}`;
}

function toast(msg, tipo = "") {
    const t = document.getElementById("toast");

    if (!t) {
        alert(msg);
        return;
    }

    t.textContent = msg;
    t.className = "toast ativo" + (tipo ? " " + tipo : "");
    clearTimeout(t._timer);

    t._timer = setTimeout(() => {
        t.className = "toast";
    }, 2800);
}