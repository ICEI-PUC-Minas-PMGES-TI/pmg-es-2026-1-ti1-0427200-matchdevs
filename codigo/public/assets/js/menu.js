document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioCorrente') || 'null');
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada') || 'null');
    const loginLink = document.getElementById('login-link');
    const menu = document.querySelector('.menu');

    if (usuarioLogado && loginLink && menu) {
        loginLink.textContent = 'Minha Área';
        loginLink.href = '../Perfil_de_Usuario/perfil.html';

        const favoritosLink = document.createElement('a');
        favoritosLink.href = '../Favoritos/index.html';
        favoritosLink.textContent = 'Favoritos';
        loginLink.parentNode.insertBefore(favoritosLink, loginLink);

        const userInfo = document.createElement('span');
        userInfo.textContent = `Olá, ${usuarioLogado.nome.split(' ')[0]}!`;
        userInfo.style.cssText = 'color: white; font-size: 14px; align-self: center;';
        
        const logoutBtn = document.createElement('a');
        logoutBtn.textContent = 'Sair';
        logoutBtn.href = '#';
        logoutBtn.onclick = () => { 
            sessionStorage.clear(); 
            window.location.href = '../pagina principal/index.html'; 
        };
        menu.append(userInfo, logoutBtn);
    }
});