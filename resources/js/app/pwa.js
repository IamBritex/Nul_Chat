/**
 * Lógica para la instalación de la PWA con pantalla emergente (Overlay) automática.
 */
export function initPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .catch(err => console.error('SW fallo:', err));
        });
    }

    let deferredPrompt;
    
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        if (isMobile && !isStandalone && !sessionStorage.getItem('pwa_dismissed')) {
            createPWAOverlay();
        }
    });

    if (isIOS && !isStandalone && !sessionStorage.getItem('pwa_dismissed')) {
        createPWAOverlay();
    }

    window.addEventListener('appinstalled', () => {
        const overlay = document.getElementById('pwa-overlay');
        if (overlay) overlay.remove();
        deferredPrompt = null;
    });

    function createPWAOverlay() {
        if (document.getElementById('pwa-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'pwa-overlay';
        
        overlay.innerHTML = `
            <div class="pwa-container">
                <img src="assets/icons/NulIconN.png" alt="NulChat" class="pwa-icon">
                <h2 class="pwa-title">Instalar NulChat</h2>
                <p class="pwa-text">Instala la aplicación para una mejor experiencia a pantalla completa y notificaciones.</p>
                <button id="btn-pwa-install" class="pwa-btn btn-install">Instalar App</button>
                <button id="btn-pwa-close" class="pwa-btn btn-close">Continuar en navegador</button>
            </div>
        `;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.classList.add('visible');
        });

        document.getElementById('btn-pwa-install').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    deferredPrompt = null;
                    removeOverlay();
                }
            } else if (isIOS) {
                alert('Para instalar en iOS: presiona el botón "Compartir" del navegador y selecciona "Añadir a inicio".');
            }
        });

        document.getElementById('btn-pwa-close').addEventListener('click', () => {
            sessionStorage.setItem('pwa_dismissed', 'true');
            removeOverlay();
        });
    }

    function removeOverlay() {
        const overlay = document.getElementById('pwa-overlay');
        if (overlay) {
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 300);
        }
    }
}