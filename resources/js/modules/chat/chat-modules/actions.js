// CORREGIDO: ../../../config
import { db, auth } from "../../../config/firebase-config.js";
import { collection, addDoc, serverTimestamp, updateDoc, doc, writeBatch } from "firebase/firestore";
import { scrollToBottom } from "./scroll.js";

export async function sendMessage(chatId, text) {
    const currentUid = auth.currentUser.uid;
    try {
        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: text, 
            senderId: currentUid, 
            timestamp: serverTimestamp(), 
            type: "text",
            status: "sent"
        });
        
        await updateDoc(doc(db, "chats", chatId), {
            lastMessage: text, 
            lastMessageSenderId: currentUid, 
            lastMessageTime: serverTimestamp(), 
            [`unreadCount_${currentUid}`]: 0 
        });
        
        scrollToBottom(true);
    } catch (error) { 
        console.error("Error enviando:", error); 
    }
}

export async function markMessagesAsRead(chatId, docs) {
    const batch = writeBatch(db);
    docs.forEach(docSnap => {
        const ref = doc(db, "chats", chatId, "messages", docSnap.id);
        batch.update(ref, { status: "read" });
    });
    
    const currentUid = auth.currentUser.uid;
    const chatRef = doc(db, "chats", chatId);
    batch.update(chatRef, { [`unreadCount_${currentUid}`]: 0 });

    try {
        await batch.commit();
    } catch (e) {
        console.error("Error marcando leído:", e);
    }
}