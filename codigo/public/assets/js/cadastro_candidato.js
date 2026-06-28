const API_URL = '/usuarios';
const LOCAL_USERS_KEY = 'usuarios_locais_bhworks';
const LOCAL_CANDIDATES_KEY = 'candidatos_bhworks';

const mensagem = document.getElementById('mensagem');
const form = document.getElementById('form-candidato');
const curriculo = document.getElementById('curriculo');
const fileName = document.getElementById('fileName');

function mostrarMensagem(texto, tipo = 'erro') {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
}

function limparMensagem() {
  mensagem.textContent = '';
  mensagem.className = 'mensagem';
}

function getValor(id) {
  return document.getElementById(id).value.trim();
}

function getUsuariosLocais() {
  return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
}

function salvarUsuarioLocal(usuario) {
  const usuarios = getUsuariosLocais();
  const usuarioLocal = { ...usuario, id: Date.now() };
  usuarios.push(usuarioLocal);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(usuarios));
  return usuarioLocal;
}

function salvarPerfilCandidato(perfil) {
  const candidatos = JSON.parse(localStorage.getItem(LOCAL_CANDIDATES_KEY) || '[]');
  candidatos.push(perfil);
  localStorage.setItem(LOCAL_CANDIDATES_KEY, JSON.stringify(candidatos));
}

async function carregarUsuarios() {
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error('Falha ao buscar candidatos.');
    return await resposta.json();
  } catch (erro) {
    return [
      { login: 'admin', email: 'admin@abc.com' },
      { login: 'user', email: 'user@abc.com' },
      ...getUsuariosLocais()
    ];
  }
}

async function salvarUsuario(usuario) {
  try {
    const resposta = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });

    if (!resposta.ok) throw new Error('Falha ao salvar candidato.');
    return await resposta.json();
  } catch (erro) {
    mostrarMensagem('Cadastro salvo em modo local. Para gravar no servidor, rode o JSON Server.', 'aviso');
    return salvarUsuarioLocal(usuario);
  }
}

curriculo.addEventListener('change', function () {
  fileName.textContent = this.files[0] ? this.files[0].name : 'Nenhum arquivo selecionado';
});

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  limparMensagem();

  const nome = getValor('nome');
  const login = getValor('login');
  const email = getValor('email');
  const senha = document.getElementById('senha').value;
  const confirmar = document.getElementById('confirmar').value;
  const telefone = getValor('telefone');
  const localizacao = getValor('localizacao');
  const curriculoNome = curriculo.files[0] ? curriculo.files[0].name : '';

  if (!nome || !login || !email || !senha || !confirmar || !telefone || !localizacao) {
    mostrarMensagem('Preencha todos os campos obrigatórios.');
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    mostrarMensagem('Informe um e-mail válido.');
    return;
  }

  if (senha !== confirmar) {
    mostrarMensagem('As senhas não coincidem.');
    return;
  }

  if (senha.length < 6) {
    mostrarMensagem('A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  const usuarios = await carregarUsuarios();
  const loginJaExiste = usuarios.some(usuario => usuario.login === login);
  const emailJaExiste = usuarios.some(usuario => usuario.email === email);

  if (loginJaExiste) {
    mostrarMensagem('Esse login já está cadastrado.');
    return;
  }

  if (emailJaExiste) {
    mostrarMensagem('Esse e-mail já está cadastrado.');
    return;
  }

  const usuarioSalvo = await salvarUsuario({ login, senha, nome, email });

  salvarPerfilCandidato({
    usuarioId: usuarioSalvo.id,
    nome,
    login,
    email,
    telefone,
    localizacao,
    curriculo: curriculoNome
  });

  form.reset();
  fileName.textContent = 'Nenhum arquivo selecionado';
  mostrarMensagem('Candidato cadastrado com sucesso. Redirecionando para o login...', 'sucesso');

  setTimeout(() => {
    window.location.href = '../modulos/login/login.html';
  }, 1400);
});
