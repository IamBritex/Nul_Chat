// CORREGIDO: ../../../config (3 niveles para llegar a /js/)
import { auth } from "../../../config/firebase-config.js"; 
import { renderAside } from "../aside/aside.js";
import { parseEmoji } from "../../../utils/emoji-handler.js";

/**
 * Renderiza la estructura base del chat
 */
export function renderChatLayout(container) {
    const currentUser = auth.currentUser;
    const layout = document.createElement("div");
    layout.className = "chat-layout"; 
    layout.id = "main-chat-layout";
    
    // Sidebar
    layout.appendChild(renderAside(currentUser));

    // Area Principal
    const main = document.createElement("main");
    main.className = "chat-area";
    main.innerHTML = `
        <header class="chat-header hidden" id="chat-header">
            <button class="icon-btn back-btn" id="chat-back-btn">
                <i class="fa-solid fa-arrow-left"></i>
            </button>

            <div class="header-user-info">
                <img id="header-avatar" src="" class="header-avatar" alt="User">
                <div class="header-text">
                    <h3 id="chat-header-title">Usuario</h3>
                </div>
            </div>
        </header>
        
        <div class="messages-container scrollable" id="messages-feed">
            <div class="empty-state">
                <div class="empty-icon"><i class="fa-regular fa-comments"></i></div>
                <p>Nul Chat</p>
            </div>
        </div>

        <button id="scroll-bottom-btn" class="scroll-bottom-btn hidden" title="Ir al final">
            <i class="fa-solid fa-chevron-down"></i>
        </button>
        
        <div class="input-area">
            <div class="input-actions-left">
                <button class="icon-btn" id="attach-btn" title="Adjuntar">
                    <i class="fa-solid fa-paperclip"></i>
                </button>
                <button class="icon-btn" id="emoji-btn" title="Emojis">
                    <i class="fa-regular fa-face-smile"></i>
                </button>
            </div>
            
            <div class="message-input-div scrollable is-empty" id="message-input" contenteditable="true" data-placeholder="Escribe un mensaje..."></div>
            
            <button class="icon-btn send-btn" id="send-btn">
                <i class="fa-solid fa-paper-plane"></i>
            </button>
        </div>
    `;
    
    layout.appendChild(main);
    container.appendChild(layout);
}

export function updateChatHeader(otherUser) {
    const header = document.getElementById("chat-header");
    const title = document.getElementById("chat-header-title");
    const avatar = document.getElementById("header-avatar");
    
    header.classList.remove("hidden");
    title.innerHTML = parseEmoji(otherUser.displayName || "Usuario");
    
    const defaultImg = "assets/icons/icon-192.png";
    avatar.src = otherUser.photoURL || defaultImg;
    avatar.onerror = () => { avatar.src = defaultImg; };
}

export function toggleMobileView(isActive) {
    const layout = document.getElementById("main-chat-layout");
    if (isActive) {
        layout.classList.add("mobile-chat-active");
    } else {
        layout.classList.remove("mobile-chat-active");
        const activeItem = document.querySelector(".chat-item.active");
        if (activeItem) activeItem.classList.remove("active");
    }
}