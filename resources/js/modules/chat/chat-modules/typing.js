import { db, auth } from "../../../config/firebase-config.js";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { scrollToBottom } from "./scroll.js";

let typingUnsubscribe = null;
let typingTimeout = null;

/**
 * Escucha los cambios en el documento del chat para mostrar/ocultar el indicador
 * @param {string} chatId - ID del chat actual
 * @param {string} otherUserId - ID del otro usuario
 */
export function initTypingListener(chatId, otherUserId) {
    // Limpiar listener anterior si existe
    if (typingUnsubscribe) {
        typingUnsubscribe();
        typingUnsubscribe = null;
    }

    const chatRef = doc(db, "chats", chatId);
    const feed = document.getElementById("messages-feed");

    typingUnsubscribe = onSnapshot(chatRef, (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        const isTyping = data.typing && data.typing[otherUserId] === true;

        if (isTyping) {
            showTypingIndicator(feed);
        } else {
            hideTypingIndicator(feed);
        }
    });
}

/**
 * Renderiza la burbuja en el DOM
 */
function showTypingIndicator(feed) {
    // Evitar duplicados
    if (document.getElementById("typing-indicator")) return;

    const container = document.createElement("div");
    container.id = "typing-indicator";
    container.className = "typing-indicator-container";
    
    container.innerHTML = `
        <div class="typing-bubble">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;

    feed.appendChild(container);
    scrollToBottom(true); // Scroll suave para mostrarlo
}

/**
 * Elimina la burbuja del DOM
 */
function hideTypingIndicator(feed) {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Actualiza mi estado de "Escribiendo..." en Firestore con Debounce
 * @param {string} chatId 
 */
export function handleMyTyping(chatId) {
    const currentUid = auth.currentUser.uid;
    const chatRef = doc(db, "chats", chatId);

    // Si ya hay un timeout pendiente, lo limpiamos (el usuario sigue escribiendo)
    if (typingTimeout) clearTimeout(typingTimeout);

    // 1. Marcar como True inmediatamente (si no lo estaba ya, idealmente optimizar esto)
    // Para simplificar lecturas, escribimos siempre, Firebase SDK optimiza las escrituras locales.
    updateDoc(chatRef, {
        [`typing.${currentUid}`]: true
    }).catch(console.error);

    // 2. Configurar timeout para marcar como False después de inactividad
    typingTimeout = setTimeout(() => {
        updateDoc(chatRef, {
            [`typing.${currentUid}`]: false
        }).catch(console.error);
    }, 2000); // 2 segundos después de dejar de escribir
}

/**
 * Limpieza al salir del chat
 */
export function stopTypingListener() {
    if (typingUnsubscribe) typingUnsubscribe();
    if (typingTimeout) clearTimeout(typingTimeout);
    
    // Asegurarnos de dejar nuestro estado en false al salir
    // (Esto requiere tener el chatId guardado o pasarlo, omitido aquí por simplicidad visual,
    // pero idealmente se debe llamar a updateDoc false al desmontar)
}