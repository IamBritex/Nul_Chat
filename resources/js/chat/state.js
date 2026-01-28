export const chatState = {
    currentUserId: null,
    activeReceiverId: null,
    currentChatId: null, // NUEVO: Guardamos el ID del chat activo
    currentPartnerState: 'offline',
    oldestMessageDoc: null,
    isHistoryLoading: false,
    allHistoryLoaded: false,
    lastRenderedDate: null,
    
    unsubscribers: {
        currentChat: null,
        userStatus: null,
        chatDoc: null,
        visibility: null
    },

    reset() {
        this.activeReceiverId = null;
        this.currentChatId = null; // Resetear ID
        this.currentPartnerState = 'offline';
        this.oldestMessageDoc = null;
        this.isHistoryLoading = false;
        this.allHistoryLoaded = false;
        this.lastRenderedDate = null;
        this.clearUnsubscribers();
    },

    clearUnsubscribers() {
        if (this.unsubscribers.currentChat) this.unsubscribers.currentChat();
        if (this.unsubscribers.userStatus) this.unsubscribers.userStatus();
        if (this.unsubscribers.chatDoc) this.unsubscribers.chatDoc();
        if (this.unsubscribers.visibility) {
            document.removeEventListener('visibilitychange', this.unsubscribers.visibility);
            this.unsubscribers.visibility = null;
        }
        this.unsubscribers.currentChat = null;
        this.unsubscribers.userStatus = null;
        this.unsubscribers.chatDoc = null;
    }
};