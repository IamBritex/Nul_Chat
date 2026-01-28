// CORREGIDO: ../../../config
import { db, auth } from "../../../config/firebase-config.js";
import { collection, query, orderBy, onSnapshot, limitToLast, getDocs, endBefore } from "firebase/firestore";
import { chatState } from "./state.js";
import { updateChatHeader, toggleMobileView } from "./layout.js";
import { appendMessageToFeed, updateMessageInFeed } from "./messages-ui.js";
import { markMessagesAsRead } from "./actions.js";

export function loadConversation(chatId, otherUser) {
    chatState.reset();
    chatState.activeChatId = chatId;

    toggleMobileView(true);
    updateChatHeader(otherUser);

    const feed = document.getElementById("messages-feed");
    feed.innerHTML = "";
    
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limitToLast(50));

    let isFirstLoad = true;
    const currentUid = auth.currentUser.uid;

    chatState.currentUnsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty && isFirstLoad) {
            feed.innerHTML = `<div class="empty-state"><p>Saluda a ${otherUser.displayName || "tu amigo"}.</p></div>`;
            return;
        }

        const unreadDocs = [];
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.senderId !== currentUid && data.status !== "read") {
                unreadDocs.push(doc);
            }
        });
        if (unreadDocs.length > 0) markMessagesAsRead(chatId, unreadDocs);

        if (isFirstLoad) {
            if (snapshot.docs.length > 0) chatState.oldestMessageDoc = snapshot.docs[0];
            snapshot.forEach((doc) => {
                appendMessageToFeed(feed, doc, currentUid, false);
            });
            // Importante: No forzar scroll aquí si no es necesario, o usar false para instantáneo
            const feedElement = document.getElementById("messages-feed");
            if(feedElement) feedElement.scrollTop = feedElement.scrollHeight;
            
            isFirstLoad = false;
        } else {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    appendMessageToFeed(feed, change.doc, currentUid, false);
                    const feedElement = document.getElementById("messages-feed");
                    const distFromBottom = feedElement.scrollHeight - feedElement.scrollTop - feedElement.clientHeight;
                    if (distFromBottom < 100 || change.doc.data().senderId === currentUid) {
                        feedElement.scrollTo({ top: feedElement.scrollHeight, behavior: "smooth" });
                    }
                } 
                else if (change.type === "modified") {
                    updateMessageInFeed(feed, change.doc, currentUid);
                }
            });
        }
    }, (error) => console.error(error));
}

export async function loadOlderMessages() {
    if (!chatState.oldestMessageDoc || chatState.isLoadingOlder) return;
    
    chatState.isLoadingOlder = true;
    const feed = document.getElementById("messages-feed");
    const previousHeight = feed.scrollHeight;

    try {
        const messagesRef = collection(db, "chats", chatState.activeChatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"), endBefore(chatState.oldestMessageDoc), limitToLast(50));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            chatState.oldestMessageDoc = snapshot.docs[0];
            const currentUid = auth.currentUser.uid;
            
            // Necesitamos importar createMessageElement aquí o mover lógica
            // Para mantenerlo simple, usaremos el fragmento directamente con la función importada
            const { createMessageElement } = await import("./messages-ui.js");
            
            const fragment = document.createDocumentFragment();
            snapshot.forEach((doc) => {
                const msg = doc.data();
                const isMe = msg.senderId === currentUid;
                const msgEl = createMessageElement(msg, isMe, false);
                msgEl.dataset.msgId = doc.id;
                fragment.appendChild(msgEl);
            });
            feed.insertBefore(fragment, feed.firstChild);
            feed.scrollTop = feed.scrollHeight - previousHeight;
        } else {
            chatState.oldestMessageDoc = null;
        }
    } catch (error) {
        console.error("Error paginando:", error);
    } finally {
        chatState.isLoadingOlder = false;
    }
}