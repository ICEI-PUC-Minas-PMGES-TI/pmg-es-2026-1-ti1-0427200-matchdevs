const API = 'http://localhost:3000';

let perfil = {};

async function init() {
  await carregarPerfil();
  await carregarExperiencias();
  await carregarEducacoes();
  await carregarHabilidades();
  await carregarCertificacoes();
}

async function carregarPerfil() {
  const res = await fetch(`${API}/perfil`);
  perfil = await res.json();
  renderPerfil();
}

function renderPerfil() {
  document.getElementById('usuario-nome').textContent = perfil.nome;
  document.getElementById('usuario-cargo').innerHTML = `${perfil.cargo} · <strong id="usuario-empresa">${perfil.empresa}</strong>`;
  document.getElementById('usuario-local').textContent = perfil.local;
  document.getElementById('nav-nome').textContent = perfil.nome;
  document.getElementById('contato-email').textContent = perfil.email;
  document.getElementById('contato-email').href = `mailto:${perfil.email}`;
  document.getElementById('contato-tel').textContent = perfil.tel;
  document.getElementById('contato-linkedin').textContent = perfil.linkedin;
  document.getElementById('contato-github').textContent = perfil.github;
  document.getElementById('sobre-texto').textContent = perfil.sobre;
  document.getElementById('edit-sobre').value = perfil.sobre;
  document.getElementById('met-exp').textContent = perfil.metricas.exp;
  document.getElementById('met-proj').textContent = perfil.metricas.proj;
  document.getElementById('met-rec').textContent = perfil.metricas.rec;
  document.getElementById('met-match').textContent = perfil.metricas.match;
  document.getElementById('edit-nome').value = perfil.nome;
  document.getElementById('edit-cargo').value = perfil.cargo;
  document.getElementById('edit-empresa').value = perfil.empresa;
  document.getElementById('edit-local').value = perfil.local;
  document.getElementById('edit-email').value = perfil.email;
  document.getElementById('edit-tel').value = perfil.tel;
  document.getElementById('edit-linkedin').value = perfil.linkedin;
  document.getElementById('edit-github').value = perfil.github;
  document.getElementById('edit-disp').value = perfil.disponibilidade;
  document.getElementById('edit-exp').value = perfil.metricas.exp;
  document.getElementById('edit-proj').value = perfil.metricas.proj;
  document.getElementById('edit-rec').value = perfil.metricas.rec;
  document.getElementById('edit-match').value = perfil.metricas.match;
  renderBadgeDisp(perfil.disponibilidade);
  if (perfil.fotoPerfil) aplicarFoto(perfil.fotoPerfil);
  if (perfil.bannerImg) aplicarBanner(perfil.bannerImg);
}

async function salvarPerfil() {
  const nome = document.getElementById('edit-nome').value.trim();
  if (!nome) return;

  Object.assign(perfil, {
    nome,
    cargo: document.getElementById('edit-cargo').value.trim(),
    empresa: document.getElementById('edit-empresa').value.trim(),
    local: document.getElementById('edit-local').value.trim(),
    email: document.getElementById('edit-email').value.trim(),
    tel: document.getElementById('edit-tel').value.trim(),
    linkedin: document.getElementById('edit-linkedin').value.trim(),
    github: document.getElementById('edit-github').value.trim(),
    disponibilidade: document.getElementById('edit-disp').value,
    metricas: {
      exp: document.getElementById('edit-exp').value,
      proj: document.getElementById('edit-proj').value,
      rec: document.getElementById('edit-rec').value,
      match: document.getElementById('edit-match').value
    }
  });

  await fetch(`${API}/perfil`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(perfil)
  });

  renderPerfil();
  fecharModal('modal-editar');
  toast('Perfil atualizado!', 'sucesso');
}

async function salvarSobre() {
  const sobre = document.getElementById('edit-sobre').value.trim();
  perfil.sobre = sobre;
  await fetch(`${API}/perfil`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sobre })
  });
  const el = document.getElementById('sobre-texto');
  el.textContent = sobre;
  el.classList.add('truncado');
  document.getElementById('btn-ver-mais').textContent = 'Ver mais ▾';
  fecharModal('modal-sobre');
  toast('Sobre atualizado!', 'sucesso');
}

async function carregarExperiencias() {
  const res = await fetch(`${API}/experiencias`);
  const lista = await res.json();
  const container = document.getElementById('exp-lista');
  container.innerHTML = '';
  lista.forEach(exp => container.innerHTML += htmlExp(exp));
  const c = lista.length;
  document.getElementById('exp-count').textContent = c + ' cargo' + (c > 1 ? 's' : '');
}

function htmlExp(exp) {
  const ini = exp.empresa[0].toUpperCase();
  const periodo = (exp.inicio ? fmtMes(exp.inicio) : '') + ' – ' + (exp.fim ? fmtMes(exp.fim) : 'Presente') + (exp.local ? ' · ' + exp.local : '');
  const tags = exp.tags ? exp.tags.map(t => `<span class="exp-tag">${t}</span>`).join('') : '';
  const cor = exp.cor || '#4c4cd6';
  return `<div class="exp-item">
    <div class="exp-icone" style="background:${cor}22;border-color:${cor}66;color:${cor};">${ini}</div>
    <div class="exp-corpo">
      <div class="exp-titulo">${exp.cargo}</div>
      <div class="exp-empresa">${exp.empresa} · ${exp.modalidade}</div>
      <div class="exp-periodo">${periodo}</div>
      ${exp.desc ? `<div class="exp-desc">${exp.desc}</div>` : ''}
      ${tags ? `<div class="exp-tags">${tags}</div>` : ''}
    </div>
  </div>`;
}

async function adicionarExp() {
  const cargo = document.getElementById('exp-cargo').value.trim();
  const empresa = document.getElementById('exp-empresa').value.trim();
  if (!cargo || !empresa) return;

  const nova = {
    cargo,
    empresa,
    modalidade: document.getElementById('exp-modo').value,
    inicio: document.getElementById('exp-inicio').value,
    fim: document.getElementById('exp-fim').value || null,
    local: document.getElementById('exp-local').value.trim(),
    desc: document.getElementById('exp-desc').value.trim(),
    tags: document.getElementById('exp-tags').value.split(',').map(t => t.trim()).filter(Boolean),
    cor: `hsl(${Math.round(Math.random() * 360)},60%,50%)`
  };

  await fetch(`${API}/experiencias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nova)
  });

  await carregarExperiencias();
  fecharModal('modal-exp');
  toast('Experiência adicionada!', 'sucesso');
  ['exp-cargo','exp-empresa','exp-inicio','exp-fim','exp-local','exp-desc','exp-tags'].forEach(id => document.getElementById(id).value = '');
}

async function carregarEducacoes() {
  const res = await fetch(`${API}/educacoes`);
  const lista = await res.json();
  const container = document.getElementById('edu-lista');
  container.innerHTML = '';
  lista.forEach(edu => {
    container.innerHTML += `<div class="edu-item">
      <div class="edu-icone">🎓</div>
      <div>
        <div class="edu-titulo">${edu.curso}</div>
        <div class="edu-inst">${edu.instituicao}</div>
        <div class="edu-periodo">${edu.inicio}${edu.fim ? ' – ' + edu.fim : ''}</div>
      </div>
    </div>`;
  });
}

async function adicionarEdu() {
  const curso = document.getElementById('edu-curso').value.trim();
  const instituicao = document.getElementById('edu-inst').value.trim();
  if (!curso || !instituicao) return;

  await fetch(`${API}/educacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      curso,
      instituicao,
      inicio: document.getElementById('edu-inicio').value,
      fim: document.getElementById('edu-fim').value || null
    })
  });

  await carregarEducacoes();
  fecharModal('modal-edu');
  toast('Educação adicionada!', 'sucesso');
  ['edu-curso','edu-inst','edu-inicio','edu-fim'].forEach(id => document.getElementById(id).value = '');
}

async function carregarHabilidades() {
  const res = await fetch(`${API}/habilidades`);
  const lista = await res.json();
  const container = document.getElementById('hab-grid');
  container.innerHTML = '';
  lista.forEach(h => {
    container.innerHTML += `<div class="hab-item">${h.nome}${h.endossos > 0 ? ` <span class="hab-end">+${h.endossos}</span>` : ''}</div>`;
  });
}

async function adicionarHab() {
  const nome = document.getElementById('hab-nome').value.trim();
  if (!nome) return;

  await fetch(`${API}/habilidades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, endossos: 0 })
  });

  await carregarHabilidades();
  fecharModal('modal-hab');
  toast('Habilidade adicionada!', 'sucesso');
  document.getElementById('hab-nome').value = '';
}

async function carregarCertificacoes() {
  const res = await fetch(`${API}/certificacoes`);
  const lista = await res.json();
  const container = document.getElementById('cert-lista');
  container.innerHTML = '';
  lista.forEach(cert => {
    container.innerHTML += `<div class="cert-item">
      <div class="cert-icone">${cert.icone || '🏅'}</div>
      <div>
        <div class="cert-nome">${cert.nome}</div>
        <div class="cert-emissor">${cert.emissor}</div>
      </div>
      <div class="cert-ano">${cert.ano}</div>
    </div>`;
  });
}

async function adicionarCert() {
  const nome = document.getElementById('cert-nome').value.trim();
  if (!nome) return;

  await fetch(`${API}/certificacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome,
      emissor: document.getElementById('cert-emissor').value.trim(),
      ano: document.getElementById('cert-ano').value,
      icone: '🏅'
    })
  });

  await carregarCertificacoes();
  fecharModal('modal-cert');
  toast('Certificação adicionada!', 'sucesso');
  ['cert-nome','cert-emissor','cert-ano'].forEach(id => document.getElementById(id).value = '');
}

function carregarBanner(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    aplicarBanner(e.target.result);
    await fetch(`${API}/perfil`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bannerImg: e.target.result })
    });
    toast('Banner atualizado!', 'sucesso');
  };
  reader.readAsDataURL(file);
}

function aplicarBanner(src) {
  const img = document.getElementById('banner-img');
  img.src = src;
  img.style.display = 'block';
}

function carregarFoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    aplicarFoto(e.target.result);
    await fetch(`${API}/perfil`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fotoPerfil: e.target.result })
    });
    toast('Foto de perfil atualizada!', 'sucesso');
  };
  reader.readAsDataURL(file);
}

function aplicarFoto(src) {
  const avatarImg = document.getElementById('avatar-img');
  avatarImg.src = src;
  avatarImg.style.display = 'block';
  document.getElementById('avatar-inicial').style.display = 'none';
  const navWrap = document.getElementById('nav-avatar-wrap');
  navWrap.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">`;
}

function abrirModal(id) {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('ativo'));
  document.getElementById(id).classList.add('ativo');
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('ativo');
}

function verMais() {
  const el = document.getElementById('sobre-texto');
  const btn = document.getElementById('btn-ver-mais');
  if (el.classList.contains('truncado')) {
    el.classList.remove('truncado');
    btn.textContent = 'Ver menos ▴';
  } else {
    el.classList.add('truncado');
    btn.textContent = 'Ver mais ▾';
  }
}

function enviarMsg() {
  const msg = document.getElementById('msg-texto').value.trim();
  if (!msg) return;
  fecharModal('modal-msg');
  toast('Mensagem enviada!', 'sucesso');
  document.getElementById('msg-texto').value = '';
}

function conectar() {
  const btn = document.getElementById('btn-conectar');
  btn.innerHTML = '✓ Conectado';
  btn.style.background = 'var(--success)';
  btn.disabled = true;
  toast('Convite enviado!', 'sucesso');
}

function renderBadgeDisp(valor) {
  const badge = document.getElementById('badge-disp');
  if (valor === 'disponivel') {
    badge.textContent = '● Disponível';
    badge.className = 'badge badge-success';
    badge.style.display = '';
  } else if (valor === 'passivo') {
    badge.textContent = '◐ Aberto passivamente';
    badge.className = 'badge badge-premium';
    badge.style.display = '';
  } else {
    badge.style.display = 'none';
  }
}

function fmtMes(val) {
  if (!val) return '';
  const [y, m] = val.split('-');
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return meses[parseInt(m) - 1] + ' ' + y;
}

function toast(msg, tipo = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ativo' + (tipo ? ' ' + tipo : '');
  setTimeout(() => t.className = 'toast', 2800);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('ativo'); });
  });
  init();
});
