import { subscribeToMessages, markChatAsRead, getChatId, subscribeToUser, markPendingMessagesAsDelivered, subscribeToChatDoc, fetchHistoryMessages } from "../db/index.js";
import { renderMessage, clearMessages, updateChatHeader, renderDateDivider, updateMessageStatusUI, updateMessageTimeUI, renderNoChatSelectedState, renderChatActiveState, prependOldMessages, renderTypingIndicator, removeTypingIndicator, initScrollButton, updateScrollButtonState, incrementUnreadCount, isUserAtBottom, removeScrollButton } from "../ui/index.js";
import { chatState } from "./state.js";
import { scrollToBottom } from "./utils.js";
import { clearSelectedFiles, renderPreviews } from "./files.js";

const messagesContainer = document.querySelector('.messages-container');

export function closeActiveChat(user = null) {
    chatState.reset();
    messagesContainer.removeEventListener('scroll', handleChatScroll);
    
    clearSelectedFiles();
    renderPreviews();
    removeScrollButton(); 
    
    renderNoChatSelectedState(user);
}

export function loadChatConversation(myUid, partnerUid, initialName, initialPhoto) {
    chatState.clearUnsubscribers();
    messagesContainer.removeEventListener('scroll', handleChatScroll);
    messagesContainer.addEventListener('scroll', handleChatScroll);

    renderChatActiveState();
    
    initScrollButton(messagesContainer);

    chatState.activeReceiverId = partnerUid;
    chatState.currentUserId = myUid;
    const chatId = getChatId(myUid, partnerUid);
    chatState.currentChatId = chatId;

    updateChatHeader(initialName, initialPhoto, 'offline');

    chatState.unsubscribers.userStatus = subscribeToUser(partnerUid, (userData) => {
        const state = userData.state || 'offline';
        chatState.currentPartnerState = state;
        if (state === 'online') markPendingMessagesAsDelivered(myUid, partnerUid);
        updateChatHeader(userData.displayName, userData.photoURL, state);
    });

    chatState.unsubscribers.chatDoc = subscribeToChatDoc(chatId, (chatData) => {
        if (!chatData) return;
        if (document.visibilityState === 'visible' && chatData.lastMessageSenderId !== myUid && isUserAtBottom()) {
            markChatAsRead(chatId, myUid);
        }
        
        if (chatData.typing && chatData.typing[partnerUid]) {
            renderTypingIndicator();
        } else {
            removeTypingIndicator();
        }
    });

    chatState.unsubscribers.visibility = () => { 
        if (document.visibilityState === 'visible' && isUserAtBottom()) markChatAsRead(chatId, myUid); 
    };
    document.addEventListener('visibilitychange', chatState.unsubscribers.visibility);

    clearMessages();
    chatState.lastRenderedDate = null;
    chatState.oldestMessageDoc = null;
    chatState.allHistoryLoaded = false;
    chatState.isHistoryLoading = false;
    
    clearSelectedFiles();
    renderPreviews();

    let isInitialLoad = true;

    chatState.unsubscribers.currentChat = subscribeToMessages(myUid, partnerUid, (messages, lastVisible) => {
        if (!chatState.oldestMessageDoc && lastVisible) {
            chatState.oldestMessageDoc = lastVisible;
        }

        const wasAtBottom = isUserAtBottom();
        
        let shouldScroll = false;
        let hasNewOwnMessage = false; // NUEVO: Bandera para detectar mensajes propios
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = `<div class="chat-empty-state"><i class="fas fa-comments"></i><p>¡Aquí inicia su épica conversación!</p></div>`;
            chatState.lastRenderedDate = null;
        } else {
            const emptyState = document.querySelector('.chat-empty-state');
            if (emptyState) emptyState.remove();

            messages.forEach((msg, index) => {
                const existingMsg = document.getElementById(`msg-${msg.id}`);
                const isOwn = msg.senderId === myUid;
                
                if (existingMsg) {
                    if (isOwn) updateMessageStatusUI(msg.id, msg.status);
                    if (msg.timestamp) updateMessageTimeUI(msg.id, msg.timestamp);
                } else {
                    if (msg.timestamp) {
                        const dateString = msg.timestamp.toDate().toDateString();
                        if (dateString !== chatState.lastRenderedDate) {
                            const dividerHTML = renderDateDivider(msg.timestamp, chatState.lastRenderedDate === null);
                            if (dividerHTML) {
                                const typingEl = document.getElementById('typing-indicator');
                                if (typingEl) typingEl.insertAdjacentHTML('beforebegin', dividerHTML);
                                else messagesContainer.insertAdjacentHTML('beforeend', dividerHTML);
                            }
                            chatState.lastRenderedDate = dateString;
                        }
                    }
                    
                    let delay = null;
                    let animate = false;

                    if (isInitialLoad) {
                        const reversedIndex = messages.length - 1 - index;
                        delay = reversedIndex * 50; 
                    } else {
                        animate = true;
                    }

                    renderMessage(msg, isOwn, animate, delay);
                    
                    if (!isInitialLoad && !isOwn) {
                        incrementUnreadCount();
                    } else {
                        shouldScroll = true;
                        // Si el mensaje es mío, activamos la bandera
                        if (isOwn) hasNewOwnMessage = true; 
                    }
                }
            });

            if (isInitialLoad) {
                scrollToBottom(messagesContainer);
            } else if (hasNewOwnMessage) {
                // FIX: Si yo envié el mensaje, hacemos scroll forzado SIEMPRE
                scrollToBottom(messagesContainer);
            } else if (shouldScroll) {
                // Para otros casos, respetamos si el usuario estaba abajo
                if (wasAtBottom) {
                    scrollToBottom(messagesContainer);
                }
            }
        }
        
        isInitialLoad = false;
        setTimeout(updateScrollButtonState, 100);
    });
}

async function handleChatScroll() {
    updateScrollButtonState();

    if (messagesContainer.scrollTop === 0 && !chatState.isHistoryLoading && !chatState.allHistoryLoaded && chatState.oldestMessageDoc) {
        chatState.isHistoryLoading = true;
        
        const loader = document.createElement('div');
        loader.id = 'history-loader';
        loader.style.textAlign = 'center';
        loader.style.padding = '10px';
        loader.style.fontSize = '12px';
        loader.style.color = '#888';
        loader.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Cargando...';
        messagesContainer.prepend(loader);

        const { messages, lastDoc } = await fetchHistoryMessages(chatState.currentUserId, chatState.activeReceiverId, chatState.oldestMessageDoc);
        loader.remove();

        if (messages.length > 0) {
            chatState.oldestMessageDoc = lastDoc;
            prependOldMessages(messages, chatState.currentUserId);
        } else {
            chatState.allHistoryLoaded = true;
        }
        chatState.isHistoryLoading = false;
    }
}