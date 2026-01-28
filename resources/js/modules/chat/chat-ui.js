import { renderChatLayout, toggleMobileView } from "./chat-modules/layout.js";
import { setupScrollButtonListener } from "./chat-modules/scroll.js";
import { loadConversation, loadOlderMessages } from "./chat-modules/conversation.js";
import { sendMessage } from "./chat-modules/actions.js";
import { chatState } from "./chat-modules/state.js";
import { parseEmoji } from "../../utils/emoji-handler.js";
import { initTypingListener, handleMyTyping, stopTypingListener } from "./chat-modules/typing.js"; // NUEVO IMPORT

/**
 * Renderiza la interfaz principal del chat y configura los listeners
 */
export function renderChat(container) {
    renderChatLayout(container);
    setupGlobalListeners();
    setupInputListeners();
    setupScrollButtonListener();
}

function setupGlobalListeners() {
    document.addEventListener("nul-chat-selected", (e) => {
        const { chatId, user, userId } = e.detail; // Asegúrate de que userId venga en el detail
        
        // Limpiar listener anterior si existe
        stopTypingListener();
        
        loadConversation(chatId, user);
        
        // --- INICIAR LISTENER DE ESCRIBIENDO ---
        // Necesitamos el ID del otro usuario. Si viene en el objeto user o detail.
        // Asumiendo que e.detail.userId es el ID del otro usuario (ver chat-list.js)
        if (userId) {
            initTypingListener(chatId, userId);
        }
    });

    const backBtn = document.getElementById("chat-back-btn");
    backBtn.addEventListener("click", () => {
        toggleMobileView(false);
        chatState.reset();
        stopTypingListener(); // Detener al salir
    });

    const feed = document.getElementById("messages-feed");
    feed.addEventListener("scroll", () => {
        if (feed.scrollTop === 0 && chatState.activeChatId) {
            loadOlderMessages();
        }
    });
}

function setupInputListeners() {
    const inputDiv = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");

    const checkEmpty = () => {
        const text = inputDiv.innerText.trim();
        if (!text && inputDiv.querySelectorAll("img").length === 0) {
            inputDiv.classList.add("is-empty");
            if(inputDiv.innerHTML !== "") inputDiv.innerHTML = "";
        } else {
            inputDiv.classList.remove("is-empty");
        }
    };

    const handleSend = () => {
        const text = inputDiv.innerText.trim();
        if (text && chatState.activeChatId) {
            sendMessage(chatState.activeChatId, text);
            inputDiv.innerHTML = ""; 
            checkEmpty();
            inputDiv.focus();
            
            // Forzar stop typing al enviar
            // (La función handleMyTyping lo hará por timeout, pero es bueno ser explícito)
        }
    };

    // --- EVENTOS DE INPUT ---
    inputDiv.addEventListener("input", () => {
        checkEmpty();
        // Notificar que estoy escribiendo
        if (chatState.activeChatId) {
            handleMyTyping(chatState.activeChatId);
        }
    });

    inputDiv.addEventListener("click", checkEmpty);
    
    inputDiv.addEventListener("blur", () => {
        inputDiv.innerHTML = parseEmoji(inputDiv.innerHTML);
        checkEmpty();
    });

    inputDiv.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    sendBtn.addEventListener("click", handleSend);
}