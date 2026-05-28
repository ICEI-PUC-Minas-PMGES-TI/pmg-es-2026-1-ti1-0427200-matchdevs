// Atualiza o nome do arquivo selecionado
document.getElementById('curriculo').addEventListener('change', function () {
  const fileName = this.files[0] ? this.files[0].name : 'Nenhum arquivo selecionado';
  document.getElementById('fileName').textContent = fileName;
});

// Validação e envio do formulário
document.getElementById('btn-cadastrar').addEventListener('click', function () {
  const nome      = document.getElementById('nome').value.trim();
  const email     = document.getElementById('email').value.trim();
  const senha     = document.getElementById('senha').value;
  const confirmar = document.getElementById('confirmar').value;
  const telefone  = document.getElementById('telefone').value.trim();
  const local     = document.getElementById('localizacao').value.trim();

  // Campos obrigatórios
  if (!nome || !email || !senha || !confirmar || !telefone || !local) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  // Validação de e-mail
  if (!email.includes('@') || !email.includes('.')) {
    alert('Por favor, informe um e-mail válido.');
    return;
  }

  // Senhas iguais
  if (senha !== confirmar) {
    alert('As senhas não coincidem.');
    return;
  }

  // Senha mínima
  if (senha.length < 6) {
    alert('A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  alert('Cadastro realizado com sucesso!');
});