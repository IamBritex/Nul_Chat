function toggleChatInterface(show) {
    const header = document.querySelector('.chat-header');
    const messages = document.querySelector('.messages-container');
    const input = document.querySelector('.input-area');
    
    if (header) header.style.display = show ? 'flex' : 'none';
    if (messages) messages.style.display = show ? 'flex' : 'none';
    if (input) input.style.display = show ? 'flex' : 'none';
}

export function renderNoChatSelectedState(user, loginCallback) {
    toggleChatInterface(false);

    const chatArea = document.querySelector('.chat-area');
    let noChatView = document.getElementById('no-chat-view');

    // --- FIX CRÍTICO MÓVIL ---
    // Si estamos en móvil, ocultamos el dashboard y salimos.
    // Esto evita que se renderice contenido que desplace el layout.
    if (window.innerWidth <= 768) {
        if (noChatView) {
            noChatView.style.display = 'none';
        }
        return; 
    }
    // -------------------------

    if (!noChatView) {
        noChatView = document.createElement('div');
        noChatView.id = 'no-chat-view';
        noChatView.className = 'discord-dashboard'; 
        chatArea.appendChild(noChatView);
    } else {
        noChatView.style.display = 'flex'; // En escritorio sí lo mostramos
    }

    // Estado sin sesión
    if (!user) {
        noChatView.innerHTML = `
            <div class="empty-state" style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <i class="fas fa-lock" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3 style="font-size: 24px; margin-bottom: 10px;">Bienvenido a NulChat</h3>
                <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 25px;">Inicia sesión para ver tus chats.</p>
                <button class="btn-primary" id="btn-login-main" style="padding: 12px 30px; font-size: 16px;">Iniciar Sesión</button>
            </div>
        `;
        if (loginCallback) {
            document.getElementById('btn-login-main')?.addEventListener('click', loginCallback);
        }
        return;
    }

    // Estado con sesión (Dashboard)
    const name = user.displayName.split(' ')[0];
    const subtitle = 'Conectate, Disfruta y Diviertete!';

    noChatView.innerHTML = `
        <div class="dashboard-content">
            <div class="mascot-scene">
                <div class="mascot-float">
                    <i class="fas fa-ghost main-mascot"></i>
                    <div class="shadow"></div>
                </div>
                <div class="floating-icons">
                    <i class="fas fa-gamepad icon-float-1"></i>
                    <i class="fas fa-comment-dots icon-float-2"></i>
                    <i class="fas fa-music icon-float-3"></i>
                </div>
            </div>

            <h2 class="welcome-title">Hola ${name}</h2>
            <p class="welcome-subtitle">${subtitle}</p>

            <div class="dashboard-cards">
                <div class="dash-card" id="btn-dash-search">
                    <div class="card-icon-bg"><i class="fas fa-search"></i></div>
                    <div class="card-text">
                        <h3>Buscar Amigos</h3>
                        <p>Encuentra gente nueva</p>
                    </div>
                </div>
                
                <div class="dash-card disabled">
                    <div class="card-icon-bg"><i class="fas fa-bolt"></i></div>
                    <div class="card-text">
                        <h3>Actividad</h3>
                        <p>Próximamente...</p>
                    </div>
                </div>
            </div>
            
            <div class="encrypted-badge" style="margin-top: 40px;">
                <i class="fas fa-shield-alt"></i> Conexión Segura NulChat v1.0
            </div>
        </div>
    `;

    setTimeout(() => {
        document.getElementById('btn-dash-search')?.addEventListener('click', () => {
             const searchInput = document.querySelector('.search-bar input');
             if(searchInput) {
                 searchInput.focus();
                 if (window.innerWidth <= 768) {
                     document.querySelector('.sidebar').style.zIndex = '100'; 
                 }
             }
        });
    }, 100);
}

export function renderChatActiveState() {
    const noChatView = document.getElementById('no-chat-view');
    if (noChatView) {
        // En lugar de removerlo, lo ocultamos para mantener consistencia
        noChatView.style.display = 'none';
    }
    toggleChatInterface(true);
}