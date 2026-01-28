/**
 * Estado compartido del módulo de Chat
 */
export const chatState = {
    currentUnsubscribe: null,
    activeChatId: null,
    oldestMessageDoc: null,
    isLoadingOlder: false,

    // Métodos para limpiar o resetear
    reset() {
        if (this.currentUnsubscribe) {
            this.currentUnsubscribe();
            this.currentUnsubscribe = null;
        }
        this.activeChatId = null;
        this.oldestMessageDoc = null;
        this.isLoadingOlder = false;
    }
};