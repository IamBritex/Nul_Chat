import { auth } from "./config/firebase-config.js";
import { onAuthStateChanged } from "firebase/auth";
import { showLoader, hideLoader } from "./modules/loader-ui.js";
import { initEmojiSystem } from "./utils/emoji-handler.js"; // Importar nuevo módulo

document.addEventListener("DOMContentLoaded", () => {
    showLoader();
    
    // Iniciar sistema de emojis globalmente
    initEmojiSystem();
    
    initApp();
});

function initApp() {
    onAuthStateChanged(auth, (user) => {
        hideLoader();
        
        if (user) {
            console.log("Sesión activa:", user.uid);
            loadModule("chat");
        } else {
            console.log("Sin sesión, mostrando login");
            loadModule("auth");
        }
    });
}

/**
 * Carga dinámica de módulos
 */
async function loadModule(moduleName) {
    const container = document.getElementById("app-container");
    container.innerHTML = ""; 
    
    switch (moduleName) {
        case "auth":
            const { renderLogin } = await import("./modules/auth/login-ui.js");
            renderLogin(container);
            break;
        case "chat":
            const { renderChat } = await import("./modules/chat/chat-ui.js");
            renderChat(container);
            break;
    }
}