import { subscribeToUserChats, getUserData, subscribeToUser, getCachedPFP, cachePFP } from "../db/index.js";
import * as UI from "../ui/index.js";
import { chatState } from "../chat/state.js";

const contactList = document.getElementById('contact-list');
const searchInput = document.querySelector('.search-bar input');

let chatsUnsubscribe = null;
const userListeners = {};

/**
 * Carga la imagen desde caché o la descarga si no existe.
 */
async function loadUserImage(imgElement, uid, remoteUrl) {
    if (!imgElement || !remoteUrl) return;

    // 1. Buscamos en caché local
    const cachedBlobUrl = await getCachedPFP(uid);
    
    if (cachedBlobUrl) {
        imgElement.src = cachedBlobUrl;
    } else {
        // 2. Si no está, ponemos la remota (el navegador intentará cargarla)
        // Y en paralelo la guardamos en caché para la próxima vez.
        imgElement.src = remoteUrl;
        cachePFP(uid, remoteUrl).then(newUrl => {
            // Opcional: actualizar src si queremos forzar el blob
        });
    }
}

export function startChatListListener(user) {
    if (chatsUnsubscribe) chatsUnsubscribe();

    chatsUnsubscribe = subscribeToUserChats(user.uid, async (chats) => {
        if (searchInput.value.trim().length > 0) return;

        contactList.classList.remove('loading');
        contactList.classList.remove('no-scroll');

        if (chats.length === 0) {
            UI.renderEmptyState(user.displayName.split(' ')[0]);
            return;
        }

        const validUids = new Set();

        for (const chat of chats) {
            const partnerId = chat.participants.find(uid => uid !== user.uid);
            if (!partnerId) continue;
            
            validUids.add(partnerId);
            
            let card = contactList.querySelector(`.contact-card[data-uid="${partnerId}"]`);
            const unreadCount = chat[`unreadCount_${user.uid}`] || 0;

            if (card) {
                // Actualizar info de tarjeta existente
                const msgEl = card.querySelector('.last-message');
                const timeEl = card.querySelector('.message-time');
                const badgeContainer = card.querySelector('.contact-bottom');

                if (msgEl) {
                    msgEl.innerText = chat.lastMessage;
                    if (unreadCount > 0) {
                        msgEl.classList.add('fw-bold');
                        msgEl.style.color = 'var(--text-primary)';
                    } else {
                        msgEl.classList.remove('fw-bold');
                        msgEl.style.removeProperty('color');
                    }
                }

                if (timeEl && chat.lastMessageTime) {
                    const date = chat.lastMessageTime.toDate();
                    const isToday = new Date().toDateString() === date.toDateString();
                    timeEl.innerText = isToday 
                        ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                        : date.toLocaleDateString([], {day: 'numeric', month: 'short'});
                    
                    if (unreadCount > 0) {
                        timeEl.classList.add('fw-bold');
                        timeEl.style.color = 'var(--text-primary)';
                    } else {
                        timeEl.classList.remove('fw-bold');
                        timeEl.style.removeProperty('color');
                    }
                }

                let badge = card.querySelector('.notification-badge');
                if (unreadCount > 0) {
                    if (!badge) {
                        badge = document.createElement('div');
                        badge.className = 'notification-badge';
                        badgeContainer.appendChild(badge);
                    }
                    badge.innerText = unreadCount;
                } else if (badge) {
                    badge.remove();
                }

                contactList.appendChild(card); 

            } else {
                // Crear nueva tarjeta
                let partnerData = await getUserData(partnerId);
                
                if (!userListeners[partnerId]) {
                    userListeners[partnerId] = subscribeToUser(partnerId, (freshData) => {
                        updateContactCardInPlace(freshData);
                    });
                }

                if (partnerData) {
                    const html = UI.createContactHTML(
                        partnerData, 
                        chat.lastMessage, 
                        chat.lastMessageTime,
                        unreadCount
                    );
                    contactList.insertAdjacentHTML('beforeend', html);
                    
                    // Iniciamos carga inteligente de imagen
                    const newCard = contactList.lastElementChild;
                    const img = newCard.querySelector('.user-pfp-img');
                    loadUserImage(img, partnerData.uid, partnerData.photoURL);
                }
            }
        }

        Array.from(contactList.children).forEach(child => {
            if (child.classList.contains('contact-card') && !validUids.has(child.dataset.uid)) {
                child.remove();
                if (userListeners[child.dataset.uid]) {
                    userListeners[child.dataset.uid]();
                    delete userListeners[child.dataset.uid];
                }
            }
        });

        if (chatState.activeReceiverId) {
            const activeCard = document.querySelector(`.contact-card[data-uid="${chatState.activeReceiverId}"]`);
            if (activeCard) activeCard.classList.add('active');
        }
    });
}

export function clearContactListeners() {
    if (chatsUnsubscribe) chatsUnsubscribe();
    Object.values(userListeners).forEach(unsubscribe => unsubscribe());
    for (const key in userListeners) delete userListeners[key];
}

function updateContactCardInPlace(userData) {
    const card = document.querySelector(`.contact-card[data-uid="${userData.uid}"]`);
    if (card) {
        // Actualizar estado (online/offline)
        const indicator = card.querySelector('.status-indicator');
        if (indicator) {
            indicator.classList.remove('status-online', 'status-away', 'status-offline');
            const newState = userData.state || 'offline';
            indicator.classList.add(`status-${newState}`);
        }
        card.dataset.state = userData.state || 'offline';

        // Actualizar nombre
        card.dataset.name = userData.displayName;
        const nameEl = card.querySelector('.contact-name');
        if (nameEl) nameEl.innerText = userData.displayName;

        // Actualizar foto solo si cambió la URL remota
        if (card.dataset.photo !== userData.photoURL) {
            card.dataset.photo = userData.photoURL;
            const img = card.querySelector('.user-pfp-img');
            // Forzamos recarga y actualización del caché
            cachePFP(userData.uid, userData.photoURL).then(blobUrl => {
                if (img) img.src = blobUrl;
            });
        }
    }
}