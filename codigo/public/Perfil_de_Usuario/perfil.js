document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'db.json';

    const getElement = (id) => document.getElementById(id);

    const nomeUsuarioEl = getElement('nome-usuario');
    const cargoUsuarioEl = getElement('cargo-usuario');
    const localUsuarioEl = getElement('local-usuario');
    const sobreUsuarioEl = getElement('sobre-usuario');
    const listaExperienciasEl = getElement('lista-experiencias');
    const listaEducacaoEl = getElement('lista-educacao');
    const listaContatoEl = getElement('lista-contato');
    const listaHabilidadesEl = getElement('lista-habilidades');
    const listaCertificacoesEl = getElement('lista-certificacoes');

    async function carregarPerfil() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Não foi possível carregar os dados do perfil.');
            }
            const data = await response.json();

            const { perfil, experiencias, educacoes, habilidades, certificacoes } = data;
            nomeUsuarioEl.textContent = perfil.nome;
            cargoUsuarioEl.textContent = perfil.cargo;
            localUsuarioEl.textContent = perfil.local;
            sobreUsuarioEl.textContent = perfil.sobre;

            listaContatoEl.innerHTML = `
                <li><strong>Email:</strong> ${perfil.email}</li>
                <li><strong>Telefone:</strong> ${perfil.tel}</li>
                <li><strong>LinkedIn:</strong> <a href="https://${perfil.linkedin}" target="_blank">${perfil.linkedin}</a></li>
                <li><strong>GitHub:</strong> <a href="https://${perfil.github}" target="_blank">${perfil.github}</a></li>
            `;

            listaExperienciasEl.innerHTML = experiencias.map(exp => `
                <div class="item-lista">
                    <div class="item-icone" style="background-color: ${exp.cor || '#4c4cd6'}">
                        <span>${exp.empresa.charAt(0)}</span>
                    </div>
                    <div class="item-conteudo">
                        <h3>${exp.cargo}</h3>
                        <p class="subtitulo">${exp.empresa} · ${exp.modalidade}</p>
                        <p class="meta">${exp.inicio} - ${exp.fim || 'Presente'} · ${exp.local}</p>
                        <p class="descricao">${exp.desc}</p>
                    </div>
                </div>
            `).join('');

            listaEducacaoEl.innerHTML = educacoes.map(edu => `
                <div class="item-lista">
                    <div class="item-icone" style="background-color: #333">
                        <span>🎓</span>
                    </div>
                    <div class="item-conteudo">
                        <h3>${edu.curso}</h3>
                        <p class="subtitulo">${edu.instituicao}</p>
                        <p class="meta">${edu.inicio} - ${edu.fim || 'Cursando'}</p>
                    </div>
                </div>
            `).join('');

            listaHabilidadesEl.innerHTML = habilidades.map(hab => `
                <span class="habilidade-tag">${hab.nome}</span>
            `).join('');

            listaCertificacoesEl.innerHTML = certificacoes.map(cert => `
                <div class="item-lista">
                    <div class="item-icone" style="background-color: #f59e0b">
                        <span>${cert.icone || '🏆'}</span>
                    </div>
                    <div class="item-conteudo">
                        <h3>${cert.nome}</h3>
                        <p class="subtitulo">${cert.emissor} · ${cert.ano}</p>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Erro:', error);
            const mainContent = document.querySelector('.conteudo-perfil');
            if (mainContent) {
                mainContent.innerHTML = `<p style="text-align: center; color: red;">${error.message}</p>`;
            }
        }
    }

    carregarPerfil();
});