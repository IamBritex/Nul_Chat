import { loadChatConversation, closeActiveChat } from "../chat/index.js";
import { chatState } from "../chat/state.js";
import { appState } from "./state.js";
import * as UI from "../ui/index.js";
import { startChatListListener } from "./contacts.js";

const layout = document.getElementById('app-layout');
const backBtn = document.getElementById('back-btn');
const searchInput = document.querySelector('.search-bar input');

export function initNavigation() {
    backBtn.addEventListener('click', () => {
        // 1. Iniciamos la animación de salida visualmente
        layout.classList.remove('mobile-chat-active');
        
        // 2. Esperamos a que termine la transición (300ms) antes de quitar los datos del chat
        // Esto permite que el usuario vea su chat deslizándose hacia afuera, en lugar del dashboard vacío
        setTimeout(() => {
            // Verificamos si el layout sigue cerrado (por si el usuario volvió a abrir un chat rápidamente)
            if (!layout.classList.contains('mobile-chat-active')) {
                closeActiveChat(appState.currentUser);
                document.querySelectorAll('.contact-card').forEach(c => c.classList.remove('active'));
            }
        }, 300); // Debe coincidir con el tiempo de transition en responsive.css
    });

    const contactList = document.getElementById('contact-list');
    contactList.addEventListener('click', (e) => {
        const card = e.target.closest('.contact-card');
        if (card) {
            const name = card.dataset.name;
            const photo = card.dataset.photo;
            const uid = card.dataset.uid;
            openChat(name, photo, uid);
        }
    });
}

export function openChat(name, photo, partnerUid) {
    if (!appState.currentUser || !partnerUid) return;

    if (chatState.activeReceiverId === partnerUid) {
        layout.classList.add('mobile-chat-active');
        return;
    }

    loadChatConversation(appState.currentUser.uid, partnerUid, name, photo);
    layout.classList.add('mobile-chat-active');

    document.querySelectorAll('.contact-card').forEach(c => c.classList.remove('active'));
    const activeCard = document.querySelector(`.contact-card[data-uid="${partnerUid}"]`);
    if (activeCard) {
        activeCard.classList.add('active');
        const badge = activeCard.querySelector('.notification-badge');
        if (badge) badge.remove();
    }

    if (searchInput.value.trim().length > 0) {
        searchInput.value = '';
        UI.renderLoadingState();
        startChatListListener(appState.currentUser);
    }
}