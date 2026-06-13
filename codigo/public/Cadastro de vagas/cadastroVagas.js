// URL da API REST (Aponta para o servidor Node.js na porta 3000)
const API_URL = '/vagas';

// Função para mostrar feedback visual ao usuário
function mostrarMensagem(texto, tipo) {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.textContent = texto;
    mensagemDiv.style.display = 'block';
    
    if (tipo === 'sucesso') {
        mensagemDiv.style.backgroundColor = '#d4edda';
        mensagemDiv.style.color = '#155724';
        mensagemDiv.style.border = '1px solid #c3e6cb';
    } else {
        mensagemDiv.style.backgroundColor = '#f8d7da';
        mensagemDiv.style.color = '#721c24';
        mensagemDiv.style.border = '1px solid #f5c6cb';
    }

    setTimeout(() => {
        mensagemDiv.style.display = 'none';
    }, 5000);
}

// Manipulação do Formulário
document.getElementById('vagaForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Captura de dados
    const titulo = document.getElementById('titulo').value.trim();
    const empresa = document.getElementById('empresa').value.trim();
    const localizacao = document.getElementById('localizacao').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const requisitosTexto = document.getElementById('requisitos').value.trim();
    const salario = document.getElementById('salario').value.trim();
    const tipoContrato = document.getElementById('tipoContrato').value;

    
    const requisitos = requisitosTexto
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);

    
    const novaVaga = {
        titulo: titulo,
        empresa: empresa,
        localizacao: localizacao,
        tipo_contrato: tipoContrato,
        salario: salario,
        descricao: descricao,
        requisitos: requisitos,
        data_publicacao: new Date().toISOString().split('T')[0]
    };

    try {
        // Envio para o servidor via API REST
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaVaga)
        });

        if (response.ok) {
            const vagaCriada = await response.json();
            mostrarMensagem(`Sucesso! Vaga "${vagaCriada.titulo}" cadastrada.`, 'sucesso');
            document.getElementById('vagaForm').reset();
        } else {
            throw new Error('Falha ao salvar no servidor.');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro: O servidor Node.js (npm start) está rodando?', 'erro');
    }
});
