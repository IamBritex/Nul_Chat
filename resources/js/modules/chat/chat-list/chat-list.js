import { db, auth } from "../../../config/firebase-config.js";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { parseEmoji } from "../../../utils/emoji-handler.js"; // IMPORTAR

const userCache = {};

export function renderChatList() {
    const listContainer = document.createElement("div");
    listContainer.className = "chat-list-container scrollable";
    const currentUserId = auth.currentUser.uid;

    listContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">
            Cargando conversaciones...
        </div>`;

    const chatsRef = collection(db, "chats");
    const q = query(
        chatsRef,
        where("participants", "array-contains", currentUserId),
        orderBy("lastMessageTime", "desc")
    );

    onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
            listContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                    No tienes chats activos.
                </div>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        const chatItemsPromises = snapshot.docs.map(async (chatDoc) => {
            const data = chatDoc.data();
            const chatId = chatDoc.id;
            const otherUserId = data.participants.find(uid => uid !== currentUserId) || currentUserId;

            let otherUser = userCache[otherUserId];
            if (!otherUser) {
                try {
                    const userDocRef = doc(db, "users", otherUserId);
                    const userSnap = await getDoc(userDocRef);
                    if (userSnap.exists()) {
                        otherUser = userSnap.data();
                        userCache[otherUserId] = otherUser;
                    } else {
                        otherUser = { displayName: "Usuario Desconocido", photoURL: null };
                    }
                } catch (error) {
                    console.error("Error fetching user:", error);
                    otherUser = { displayName: "Error", photoURL: null };
                }
            }

            const isTyping = data.typing && data.typing[otherUserId] === true;
            const unreadCount = data[`unreadCount_${currentUserId}`] || 0;
            
            let timeString = "";
            if (data.lastMessageTime) {
                const date = data.lastMessageTime.toDate();
                timeString = formatChatTime(date);
            }

            let messagePreview = data.lastMessage || "Multimedia";
            let messageClass = "chat-last-message";

            if (isTyping) {
                messagePreview = "Escribiendo...";
                messageClass += " typing";
            } else if (data.lastMessageSenderId === currentUserId) {
                messagePreview = `Tú: ${messagePreview}`;
            }

            // --- APLICAR TWEMOJI AL PREVIEW Y AL NOMBRE ---
            // Renderizamos el HTML con los iconos
            const nameHtml = parseEmoji(otherUser.displayName);
            const messageHtml = parseEmoji(messagePreview);

            const item = document.createElement("div");
            item.className = `chat-item ${unreadCount > 0 ? "unread" : ""}`;
            item.dataset.chatId = chatId;

            const avatarHTML = otherUser.photoURL
                ? `<img src="${otherUser.photoURL}" alt="User">`
                : `<div class="avatar-placeholder">${(otherUser.displayName || "U")[0].toUpperCase()}</div>`;

            const badgeHTML = unreadCount > 0 
                ? `<div class="unread-badge">${unreadCount}</div>` 
                : '';

            item.innerHTML = `
                <div class="chat-item-avatar">
                    ${avatarHTML}
                </div>
                <div class="chat-item-content">
                    <div class="chat-item-top">
                        <span class="chat-name">${nameHtml}</span>
                        <span class="chat-time">${timeString}</span>
                    </div>
                    <div class="chat-item-bottom">
                        <span class="${messageClass}">${messageHtml}</span>
                        ${badgeHTML}
                    </div>
                </div>
            `;

            item.addEventListener("click", () => {
                listContainer.querySelectorAll(".chat-item").forEach(el => el.classList.remove("active"));
                item.classList.add("active");
                const event = new CustomEvent("nul-chat-selected", {
                    detail: { chatId: chatId, user: otherUser, userId: otherUserId }
                });
                document.dispatchEvent(event);
            });

            return item;
        });

        const renderedItems = await Promise.all(chatItemsPromises);
        
        listContainer.innerHTML = ""; 
        renderedItems.forEach(item => fragment.appendChild(item));
        listContainer.appendChild(fragment);

    }, (error) => {
        console.error("Error escuchando chats:", error);
    });

    return listContainer;
}

function formatChatTime(date) {
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();

    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}