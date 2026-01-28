import { sendMessageToDB, setTypingStatus } from "../db/index.js";
import { uploadImage } from "./images.js";
import { getCaret, setCaret, highlightLinks, scrollToBottom } from "./utils.js";
import { getSelectedFiles, clearSelectedFiles, renderPreviews } from "./files.js";
import { chatState } from "./state.js";
import { initAttachmentMenu, toggleAttachmentMenu, closeAttachmentMenu } from "../ui/attachmentMenu.js";
import { initEmojiMenu, toggleEmojiMenu, closeEmojiMenu } from "../ui/emojiMenu.js";

const chatInputDiv = document.getElementById('chat-input-field');
const btnMic = document.getElementById('btn-mic');
const btnSend = document.getElementById('btn-send');
const btnAttach = document.querySelector('.fa-paperclip');
const btnEmoji = document.querySelector('.fa-smile') || document.querySelector('.fa-laugh'); 
const messagesContainer = document.querySelector('.messages-container');

let typingTimeout = null;

// --- FUNCIÓN HELPER OPTIMIZADA (Sin cloneNode para velocidad) ---
function getInputValue() {
    if (!chatInputDiv) return "";
    
    let text = "";
    
    // Recorrido recursivo ligero sobre el DOM vivo
    function traverse(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.nodeValue;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'IMG' && node.classList.contains('emoji')) {
                // Extraer el emoji real del alt
                text += node.alt;
            } else if (node.tagName === 'BR') {
                text += '\n';
            } else if (node.tagName === 'DIV') {
                // Manejo de saltos de línea de contenteditable
                if (text.length > 0 && !text.endsWith('\n')) text += '\n';
                Array.from(node.childNodes).forEach(traverse);
            } else {
                Array.from(node.childNodes).forEach(traverse);
            }
        }
    }
    
    Array.from(chatInputDiv.childNodes).forEach(traverse);
    return text.trim();
}

export function initChatInput(myUid) {
    chatState.currentUserId = myUid;
    
    initEmojiMenu();
    initAttachmentMenu(); 
    
    // --- BOTÓN CLIP ---
    const newAttachBtn = btnAttach.cloneNode(true);
    const currentAttachBtn = document.querySelector('.fa-paperclip');
    if(currentAttachBtn) {
        currentAttachBtn.parentNode.replaceChild(newAttachBtn, currentAttachBtn);
        newAttachBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            closeEmojiMenu(); 
            toggleAttachmentMenu();
        });
    }

    // --- BOTÓN EMOJI ---
    const currentEmojiBtn = document.querySelector('.fa-smile') || document.querySelector('.fa-laugh');
    if (currentEmojiBtn) {
        const newEmojiBtn = currentEmojiBtn.cloneNode(true);
        currentEmojiBtn.parentNode.replaceChild(newEmojiBtn, currentEmojiBtn);

        newEmojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAttachmentMenu();
            toggleEmojiMenu();
        });
    }

    // --- EVENTOS DEL INPUT ---
    chatInputDiv.addEventListener('focus', () => {
        // SI LA BANDERA ESTÁ ACTIVA, NO CERRAMOS EL MENÚ
        if (chatInputDiv.dataset.keepMenuOpen === "true") {
            chatInputDiv.dataset.keepMenuOpen = "false"; // Resetear bandera
            return;
        }

        closeAttachmentMenu();
        closeEmojiMenu();
        scrollToBottom(messagesContainer);
    });
    
    chatInputDiv.addEventListener('click', () => {
        // El click explícito sí debe cerrar los menús (comportamiento estándar)
        // a menos que quieras que NUNCA se cierren. Por ahora lo dejamos estándar.
        closeAttachmentMenu();
        closeEmojiMenu();
    });
    
    chatInputDiv.addEventListener('input', function() {
        const text = getInputValue();
        handleTyping();
        
        // Detección de links (Evitamos procesar si hay imágenes para no romper emojis)
        const hasImages = this.querySelector('img');
        const hasLink = /((https?:\/\/[^\s]+)|(www\.[^\s]+))/.test(text);
        
        if ((hasLink || this.innerHTML.includes('</a>')) && !hasImages) {
            const pos = getCaret(this);
            this.innerHTML = highlightLinks(this.innerText); 
            setCaret(this, pos);
        }
        
        toggleIcons(text);
    });

    chatInputDiv.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            triggerSend();
        }
    });
    
    btnSend.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });

    btnSend.addEventListener('click', triggerSend);
    
    // --- FOCO INICIAL POR DEFECTO ---
    // Ponemos el foco en el texto, pero el menú de emojis inicia cerrado (isMenuOpen es false por defecto)
    chatInputDiv.focus();
}

function handleTyping() {
    if (!chatState.currentChatId || !chatState.currentUserId) return;

    if (!typingTimeout) {
        setTypingStatus(chatState.currentChatId, chatState.currentUserId, true);
    }

    clearTimeout(typingTimeout);
    
    typingTimeout = setTimeout(() => {
        setTypingStatus(chatState.currentChatId, chatState.currentUserId, false);
        typingTimeout = null;
    }, 2000);
}

export function toggleIcons(text) {
    const selectedFiles = getSelectedFiles();
    if (text.length > 0 || selectedFiles.length > 0) {
        btnMic.classList.remove('active');
        btnSend.classList.add('active');
    } else {
        btnSend.classList.remove('active');
        btnMic.classList.add('active');
    }
}

async function triggerSend() {
    const text = getInputValue();
    let selectedFiles = getSelectedFiles();
    
    if ((!text && selectedFiles.length === 0) || !chatState.activeReceiverId) return;
    
    if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
        setTypingStatus(chatState.currentChatId, chatState.currentUserId, false);
    }

    // --- EVITAR CIERRE DE MENÚ AL ENVIAR ---
    // Activamos la bandera antes de hacer focus para que el listener no cierre el menú
    chatInputDiv.dataset.keepMenuOpen = "true";
    chatInputDiv.focus();
    
    // Ya NO llamamos a closeEmojiMenu() aquí
    closeAttachmentMenu(); 

    let uploadedUrls = [];
    
    if (selectedFiles.length > 0) {
        btnSend.classList.remove('active');
        try {
            const uploadPromises = selectedFiles.map(item => uploadImage(item.file));
            uploadedUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
        } catch (e) { console.error("Error uploading images", e); }

        clearSelectedFiles();
        renderPreviews();
    }
    
    chatInputDiv.innerHTML = ''; 
    toggleIcons('');
    scrollToBottom(messagesContainer);
    
    // Volver a asegurar el foco manteniendo menú
    chatInputDiv.dataset.keepMenuOpen = "true";
    chatInputDiv.focus();
    
    const initialStatus = chatState.currentPartnerState === 'online' ? 'delivered' : 'sent';
    await sendMessageToDB(chatState.currentUserId, chatState.activeReceiverId, text, initialStatus, uploadedUrls);
}