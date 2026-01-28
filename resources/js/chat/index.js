import { initImageViewer } from "./imageViewer.js";
import { initChatInput } from "./input.js";
import { loadChatConversation, closeActiveChat } from "./conversation.js";

// Inicializar componentes globales
initImageViewer();

// Exportar la API pública
export { 
    initChatInput, 
    loadChatConversation, 
    closeActiveChat 
};