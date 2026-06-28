const API_URL = '/vagas';
const LOCAL_JOBS_KEY = 'vagas_bhworks_local';

const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada') || 'null');
const areaFormulario = document.getElementById('area-formulario');
const areaBloqueio = document.getElementById('area-bloqueio');
const form = document.getElementById('vagaForm');
const mensagem = document.getElementById('mensagem');

function mostrarMensagem(texto, tipo = 'erro') {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
}

function getValor(id) {
    return document.getElementById(id).value.trim();
}

function salvarVagaLocal(vaga) {
    const vagasLocais = JSON.parse(localStorage.getItem(LOCAL_JOBS_KEY) || '[]');
    const vagaLocal = { ...vaga, id: Date.now() };
    vagasLocais.push(vagaLocal);
    localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(vagasLocais));
    return vagaLocal;
}

function configurarAcessoEmpresa() {
    if (!empresaLogada) {
        areaFormulario.style.display = 'none';
        areaBloqueio.style.display = 'flex';
        return;
    }

    const nomeEmpresa = empresaLogada.nome || empresaLogada.razaoSocial || 'Empresa logada';
    const localizacaoEmpresa = empresaLogada.localizacao || '';

    document.getElementById('empresa-logada-nome').textContent = nomeEmpresa;
    document.getElementById('empresa').value = nomeEmpresa;

    if (localizacaoEmpresa) {
        document.getElementById('localizacao').value = localizacaoEmpresa;
    }
}

async function salvarVaga(vaga) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vaga)
        });

        if (!response.ok) throw new Error('Falha ao salvar no servidor.');
        return await response.json();
    } catch (error) {
        mostrarMensagem('Vaga salva em modo local. Para gravar no servidor, rode o JSON Server.', 'aviso');
        return salvarVagaLocal(vaga);
    }
}

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!empresaLogada) {
        mostrarMensagem('Faça login como empresa para cadastrar vagas.');
        return;
    }

    const requisitos = getValor('requisitos')
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

    const novaVaga = {
        titulo: getValor('titulo'),
        empresa: getValor('empresa'),
        empresaId: empresaLogada.id || null,
        localizacao: getValor('localizacao'),
        tipo_contrato: document.getElementById('tipoContrato').value,
        salario: getValor('salario'),
        descricao: getValor('descricao'),
        requisitos,
        data_publicacao: new Date().toISOString().split('T')[0]
    };

    if (!novaVaga.titulo || !novaVaga.empresa || !novaVaga.localizacao || !novaVaga.tipo_contrato || !novaVaga.descricao || requisitos.length === 0) {
        mostrarMensagem('Preencha todos os campos obrigatórios.');
        return;
    }

    const vagaCriada = await salvarVaga(novaVaga);

    form.reset();
    configurarAcessoEmpresa();
    mostrarMensagem(`Vaga "${vagaCriada.titulo}" cadastrada com sucesso.`, 'sucesso');
});

document.addEventListener('DOMContentLoaded', configurarAcessoEmpresa);
