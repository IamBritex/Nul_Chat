const contactList = document.getElementById('contact-list');
const searchInput = document.querySelector('.search-bar input');

export function renderLoggedOutState(loginCallback) {
    contactList.classList.remove('loading');
    contactList.classList.add('no-scroll');
    contactList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-lock" style="font-size: 32px; margin-bottom: 15px;"></i>
            <h3>Bienvenido a NulChat</h3>
            <p>Inicia sesión para ver tus chats.</p>
            <button class="btn-primary" id="btn-login-sidebar">Iniciar Sesión</button>
        </div>
    `;
    document.getElementById('btn-login-sidebar')?.addEventListener('click', loginCallback);
}

export function renderLoadingState() {
    contactList.classList.add('loading');
    contactList.classList.remove('no-scroll');
    let html = '';
    for(let i=0; i<5; i++) {
        html += `
        <div class="contact-card">
            <div class="avatar-circle skeleton"></div>
            <div class="contact-info">
                <div class="contact-top" style="margin-bottom: 6px;">
                    <div class="skeleton skeleton-text" style="width: 50%;"></div>
                </div>
                <div class="contact-bottom">
                    <div class="skeleton skeleton-text" style="width: 80%;"></div>
                </div>
            </div>
        </div>`;
    }
    contactList.innerHTML = html;
}

export function renderEmptyState(userName) {
    contactList.classList.remove('loading');
    contactList.classList.add('no-scroll');
    contactList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-user-friends"></i>
            <h3>Hola ${userName}</h3>
            <p>Usa la <button class="search-trigger-btn" id="btn-search-trigger">barra de búsqueda</button> para encontrar personas.</p>
        </div>
    `;
    document.getElementById('btn-search-trigger')?.addEventListener('click', () => searchInput.focus());
}