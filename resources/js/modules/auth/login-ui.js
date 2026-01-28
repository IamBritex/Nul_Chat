import { auth } from "../../config/firebase-config.js";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { showLoader, hideLoader } from "../loader-ui.js";

/**
 * Renderiza la pantalla de inicio de sesión usando Popup
 * @param {HTMLElement} container 
 */
export function renderLogin(container) {
    const layout = document.createElement("div");
    layout.className = "screen centered-layout";
    
    // Mantenemos tu diseño con la fuente Nothing y estilos
    layout.innerHTML = `
        <div class="auth-card">
            <h1 class="auth-title">Nul</h1>
            <p class="auth-subtitle">
                Conecta tu cuenta para continuar
            </p>
            
            <button id="google-login-btn" class="google-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Iniciar sesión con Google
            </button>

            <div id="auth-error-msg" class="auth-error"></div>
        </div>
    `;

    container.appendChild(layout);

    // --- Lógica del Botón (Vuelta a Popup) ---
    const btn = document.getElementById("google-login-btn");
    
    btn.addEventListener("click", async () => {
        const provider = new GoogleAuthProvider();
        
        try {
            showLoader(); // Bloqueamos UI mientras se abre el popup
            
            // Usamos signInWithPopup como solicitaste
            const result = await signInWithPopup(auth, provider);
            
            console.log("Login Popup Exitoso:", result.user.email);
            
            // Forzamos una recarga para asegurar que la persistencia se aplique correctamente
            // y limpiar cualquier estado basura en la memoria.
            window.location.reload();

        } catch (error) {
            hideLoader();
            console.error("Error Popup:", error);

            // Manejo específico si el navegador bloquea el popup
            if (error.code === 'auth/popup-blocked') {
                showError("El navegador bloqueó la ventana emergente. Por favor, permítela.");
            } else if (error.code === 'auth/popup-closed-by-user') {
                showError("Cerraste la ventana antes de terminar.");
            } else {
                showError("Error al conectar: " + error.message);
            }
        }
    });

    function showError(msg) {
        const errDiv = document.getElementById("auth-error-msg");
        if(errDiv) {
            errDiv.textContent = msg;
            errDiv.style.display = "block";
        }
    }
}