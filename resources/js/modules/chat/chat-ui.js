import { db, auth } from "../../config/firebase-config.js";
import { 
    collection, query, orderBy, onSnapshot, addDoc, 
    serverTimestamp, updateDoc, doc, limitToLast, 
    getDocs, endBefore, writeBatch, where 
} from "firebase/firestore";
import { renderAside } from "./aside/aside.js";
import { parseEmoji } from "../../utils/emoji-handler.js";

let currentUnsubscribe = null;
let activeChatId = null;
let oldestMessageDoc = null;
let isLoadingOlder = false;

export function renderChat(container) {
    const currentUser = auth.currentUser;
    const layout = document.createElement("div");
    layout.className = "chat-layout"; 
    layout.id = "main-chat-layout";
    
    layout.appendChild(renderAside(currentUser));

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
                    <span id="chat-header-status" class="status-text">En línea</span>
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

    setupGlobalListeners();
}

function setupGlobalListeners() {
    document.addEventListener("nul-chat-selected", (e) => {
        const { chatId, user } = e.detail;
        loadConversation(chatId, user);
    });

    const backBtn = document.getElementById("chat-back-btn");
    backBtn.addEventListener("click", () => {
        const layout = document.getElementById("main-chat-layout");
        layout.classList.remove("mobile-chat-active");
        activeChatId = null;
        if (currentUnsubscribe) currentUnsubscribe();
    });

    const inputDiv = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");

    // --- LOGICA DE PLACEHOLDER ROBUSTA ---
    const checkEmpty = () => {
        const text = inputDiv.innerText.trim();
        // Si no hay texto, forzamos la clase .is-empty
        if (!text && inputDiv.querySelectorAll("img").length === 0) {
            inputDiv.classList.add("is-empty");
            // Limpieza agresiva de <br> residuales de contenteditable
            if(inputDiv.innerHTML !== "") inputDiv.innerHTML = "";
        } else {
            inputDiv.classList.remove("is-empty");
        }
    };

    inputDiv.addEventListener("input", checkEmpty);
    inputDiv.addEventListener("blur", () => {
        // Parsear emojis al salir
        inputDiv.innerHTML = parseEmoji(inputDiv.innerHTML);
        checkEmpty();
    });
    // Click para enfocar
    inputDiv.addEventListener("click", () => {
        checkEmpty();
    });

    const handleSend = () => {
        const text = inputDiv.innerText.trim();
        if (text && activeChatId) {
            sendMessage(activeChatId, text);
            inputDiv.innerHTML = ""; 
            checkEmpty(); // Restaurar placeholder
            inputDiv.focus();
        }
    };

    sendBtn.addEventListener("click", handleSend);
    inputDiv.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Scroll
    const feed = document.getElementById("messages-feed");
    const scrollBtn = document.getElementById("scroll-bottom-btn");

    feed.addEventListener("scroll", () => {
        if (feed.scrollTop === 0 && activeChatId && !isLoadingOlder) {
            loadOlderMessages(activeChatId);
        }
        const distFromBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight;
        if (distFromBottom > 150) scrollBtn.classList.remove("hidden");
        else scrollBtn.classList.add("hidden");
    });

    scrollBtn.addEventListener("click", () => scrollToBottom(true));
}

function loadConversation(chatId, otherUser) {
    activeChatId = chatId;
    oldestMessageDoc = null;
    isLoadingOlder = false;

    // UI Mobile
    const layout = document.getElementById("main-chat-layout");
    layout.classList.add("mobile-chat-active");

    // Header
    const header = document.getElementById("chat-header");
    const title = document.getElementById("chat-header-title");
    const avatar = document.getElementById("header-avatar");
    header.classList.remove("hidden");
    title.innerHTML = parseEmoji(otherUser.displayName || "Usuario");
    const defaultImg = "assets/icons/icon-192.png";
    avatar.src = otherUser.photoURL || defaultImg;
    avatar.onerror = () => { avatar.src = defaultImg; };

    // Limpiar previo
    if (currentUnsubscribe) currentUnsubscribe();
    const feed = document.getElementById("messages-feed");
    feed.innerHTML = "";
    
    // Query
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limitToLast(50));

    let isFirstLoad = true;
    const currentUid = auth.currentUser.uid;

    currentUnsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty && isFirstLoad) {
            feed.innerHTML = `<div class="empty-state"><p>Saluda a ${otherUser.displayName || "tu amigo"}.</p></div>`;
            return;
        }

        // --- MARCAR MENSAJES COMO LEÍDOS ---
        // Buscamos mensajes recibidos que NO sean "read" y los actualizamos
        const unreadDocs = [];
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.senderId !== currentUid && data.status !== "read") {
                unreadDocs.push(doc);
            }
        });
        
        if (unreadDocs.length > 0) {
            markMessagesAsRead(chatId, unreadDocs);
        }
        // -----------------------------------

        if (isFirstLoad) {
            if (snapshot.docs.length > 0) oldestMessageDoc = snapshot.docs[0];
            snapshot.forEach((doc) => {
                // Pasamos doc.metadata para saber si es local (pendiente)
                appendMessageToFeed(feed, doc, currentUid, false);
            });
            scrollToBottom(false);
            isFirstLoad = false;
        } else {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    appendMessageToFeed(feed, change.doc, currentUid, false);
                    const distFromBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight;
                    if (distFromBottom < 100 || change.doc.data().senderId === currentUid) scrollToBottom(true);
                } 
                else if (change.type === "modified") {
                    // Actualizar estado del mensaje existente (ej. de sent a read)
                    updateMessageInFeed(feed, change.doc, currentUid);
                }
            });
        }
    }, (error) => console.error(error));
}

/**
 * Actualiza el estado de un lote de mensajes a "read"
 */
async function markMessagesAsRead(chatId, docs) {
    const batch = writeBatch(db);
    docs.forEach(docSnap => {
        const ref = doc(db, "chats", chatId, "messages", docSnap.id);
        batch.update(ref, { status: "read" });
    });
    
    // También resetear contador del usuario actual en el chat padre
    const currentUid = auth.currentUser.uid;
    const chatRef = doc(db, "chats", chatId);
    batch.update(chatRef, { [`unreadCount_${currentUid}`]: 0 });

    try {
        await batch.commit();
    } catch (e) {
        console.error("Error marking read:", e);
    }
}

/**
 * Helper para actualizar un mensaje ya renderizado (cambio de estado)
 */
function updateMessageInFeed(feed, docSnap, currentUid) {
    // Buscamos el elemento por ID (necesitamos agregar ID al crear el elemento)
    // Como no agregué ID antes, buscaremos por una estrategia simple o reemplazo
    // Lo ideal es re-renderizar o tener IDs.
    // Vamos a buscar el div en base a un atributo data-id
    const msgData = docSnap.data();
    // Nota: Para que esto funcione perfecto, createMessageElement debe poner data-id
    const existingEl = feed.querySelector(`[data-msg-id="${docSnap.id}"]`);
    if (existingEl) {
        const newEl = createMessageElement(msgData, msgData.senderId === currentUid, docSnap.metadata.hasPendingWrites);
        newEl.dataset.msgId = docSnap.id;
        feed.replaceChild(newEl, existingEl);
    }
}

function appendMessageToFeed(feed, docSnap, currentUid, prepend = false) {
    const msg = docSnap.data();
    const isMe = msg.senderId === currentUid;
    const isPending = docSnap.metadata.hasPendingWrites;
    
    const msgEl = createMessageElement(msg, isMe, isPending);
    msgEl.dataset.msgId = docSnap.id; // IMPORTANTE para updates

    const emptyState = feed.querySelector(".empty-state");
    if (emptyState) emptyState.remove();

    if (prepend) feed.insertBefore(msgEl, feed.firstChild);
    else feed.appendChild(msgEl);
}

function createMessageElement(msg, isMe, isPending) {
    const div = document.createElement("div");
    div.className = `message-row ${isMe ? "sent" : "received"}`;
    
    // Hora
    let time = "";
    if (msg.timestamp) {
        time = msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const formattedText = formatText(msg.text);
    const emojiHtml = parseEmoji(formattedText);

    // --- LOGICA DE BOLITAS (SOLO SI ES MI MENSAJE) ---
    let statusHtml = "";
    if (isMe) {
        let statusClass = "pending";
        let dots = '';

        if (isPending) {
            // 1 Bolita Gris (Enviando...)
            statusClass = "pending";
            dots = '<i class="fa-solid fa-circle"></i>'; 
        } else if (msg.status === "read") {
            // 2 Bolitas Azules (Leído)
            statusClass = "read";
            dots = '<i class="fa-solid fa-circle"></i><i class="fa-solid fa-circle"></i>';
        } else if (msg.status === "sent" || msg.status === "delivered") {
            // 2 Bolitas Grises (Enviado)
            statusClass = "sent";
            dots = '<i class="fa-solid fa-circle"></i><i class="fa-solid fa-circle"></i>';
        } else {
            // Fallback (ej. error)
            statusClass = "error";
            dots = '<i class="fa-solid fa-circle"></i>';
        }

        statusHtml = `<div class="status-dots ${statusClass}">${dots}</div>`;
    }

    div.innerHTML = `
        <div class="message-bubble">
            <div class="message-text">${emojiHtml}</div>
            <div class="message-meta">
                <span class="time">${time}</span>
                ${statusHtml}
            </div>
        </div>
    `;
    return div;
}

// ... (loadOlderMessages, formatText, sendMessage, scrollToBottom se mantienen) ...
async function loadOlderMessages(chatId) { /* ... código paginación ... */ }

function formatText(text) {
    if (text === null || text === undefined) return "";
    return text.toString().replace(/\n/g, '<br>');
}

async function sendMessage(chatId, text) {
    const currentUid = auth.currentUser.uid;
    try {
        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: text, 
            senderId: currentUid, 
            timestamp: serverTimestamp(), 
            type: "text",
            status: "sent" // ESTADO INICIAL: SENT
        });
        
        await updateDoc(doc(db, "chats", chatId), {
            lastMessage: text, 
            lastMessageSenderId: currentUid, 
            lastMessageTime: serverTimestamp(), 
            [`unreadCount_${currentUid}`]: 0 
        });
        scrollToBottom(true);
    } catch (error) { 
        console.error(error); 
        // Aquí podrías manejar el estado de error visualmente si tuvieras un store local
    }
}

function scrollToBottom(smooth = false) {
    const feed = document.getElementById("messages-feed");
    if(feed) {
        feed.scrollTo({ top: feed.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    }
}