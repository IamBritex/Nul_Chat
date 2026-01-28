import { collection, query, where, orderBy, onSnapshot, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "../config.js";

export function getChatId(uid1, uid2) {
    return [uid1, uid2].sort().join("_");
}

export function subscribeToUserChats(currentUserId, callback) {
    const chatsRef = collection(db, "chats");
    const q = query(
        chatsRef, 
        where("participants", "array-contains", currentUserId),
        orderBy("lastMessageTime", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const chats = [];
        snapshot.forEach(doc => {
            chats.push({ id: doc.id, ...doc.data() });
        });
        callback(chats);
    });
}

export function subscribeToChatDoc(chatId, callback) {
    return onSnapshot(doc(db, "chats", chatId), (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        }
    });
}

// NUEVO: Función para actualizar el estado de escritura
export async function setTypingStatus(chatId, userId, isTyping) {
    try {
        const chatRef = doc(db, "chats", chatId);
        // Usamos merge para actualizar solo el campo del usuario específico dentro del mapa 'typing'
        await setDoc(chatRef, { 
            typing: { [userId]: isTyping } 
        }, { merge: true });
    } catch (e) {
        console.error("Error updating typing status:", e);
    }
}