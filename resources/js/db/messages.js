import { doc, setDoc, addDoc, collection, query, where, getDocs, orderBy, onSnapshot, updateDoc, serverTimestamp, increment, getDoc, limit, startAfter } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "../config.js";
import { getChatId } from "./chats.js";

// --- ENVÍO BYPASS CORS VÍA GOOGLE SCRIPT ---
async function sendOneSignalPush(senderId, receiverId, text) {
    // ¡¡PEGA AQUÍ TU URL DE GOOGLE APPS SCRIPT!!
    // (La que acaba en /exec)
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyfBSwUdElz0noPPTOfQkwbikpGVj_ooSsWWIl5frAARkFin6SxRHWvBkiPQyUzGrzT_Q/exec"; 

    try {
        const receiverSnap = await getDoc(doc(db, "users", receiverId));
        const senderSnap = await getDoc(doc(db, "users", senderId));

        if (!receiverSnap.exists() || !senderSnap.exists()) return;

        const receiverData = receiverSnap.data();
        const senderName = senderSnap.data().displayName || "Alguien";
        const oneSignalId = receiverData.oneSignalId; 

        if (!oneSignalId) {
            console.warn("⚠️ El usuario destino no tiene notificaciones activas (Falta OneSignal ID).");
            return;
        }

        console.log("🚀 Enviando petición a Google Script...");

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', 
            },
            body: JSON.stringify({
                include_subscription_ids: [oneSignalId],
                headings: { en: senderName },
                contents: { en: text || "📷 Foto" },
                url: "https://IamBritex.github.io/Nul_Chat/" 
            })
        });
        console.log("✅ Petición enviada al puente.");

    } catch (error) {
        console.error("❌ Error enviando push:", error);
    }
}
// ----------------------------

function cleanMessageText(text) {
    if (!text) return "";
    return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function fetchLinkPreview(text) {
    const urlRegex = /((https?:\/\/[^\s]+)|(www\.[^\s]+))/;
    const match = text.match(urlRegex);
    if (!match) return null;
    
    let targetUrl = match[0];
    if (!targetUrl.startsWith('http')) targetUrl = 'http://' + targetUrl;

    try {
        const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`);
        const data = await response.json();
        if (data.status === 'success') {
            const { title, description, image, url } = data.data;
            return {
                title: title || '',
                description: description || '',
                image: image ? image.url : null,
                url: url && url !== "undefined" ? url : targetUrl 
            };
        }
        return { title: targetUrl, description: '', image: null, url: targetUrl };
    } catch (error) {
        return { title: targetUrl, description: '', image: null, url: targetUrl };
    }
}

export async function sendMessageToDB(senderId, receiverId, rawText, status = 'sent', images = null) {
    const text = cleanMessageText(rawText);
    if (!text && (!images || images.length === 0)) return; 

    const chatId = getChatId(senderId, receiverId);
    const messagesRef = collection(db, "chats", chatId, "messages");
    
    const messageData = {
        senderId: senderId,
        receiverId: receiverId,
        timestamp: serverTimestamp(),
        status: status,
        preview: null 
    };

    if (text) messageData.text = text;
    if (images && images.length > 0) messageData.images = images;

    const docRef = await addDoc(messagesRef, messageData);

    let lastMessageText = text;
    if (images && images.length > 0) {
        lastMessageText = images.length > 1 ? `📷 ${images.length} Fotos` : "📷 Foto";
        if (text) lastMessageText = "📷 Foto: " + text;
    }

    const chatRef = doc(db, "chats", chatId);
    await setDoc(chatRef, {
        participants: [senderId, receiverId],
        lastMessage: lastMessageText,
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: senderId,
        lastMessageStatus: status,
        [`unreadCount_${receiverId}`]: increment(1) 
    }, { merge: true });

    // --- ENVIAR PUSH ---
    sendOneSignalPush(senderId, receiverId, lastMessageText);
    // -------------------

    if (text) {
        fetchLinkPreview(text).then(async (previewData) => {
            if (previewData) await updateDoc(docRef, { preview: previewData });
        });
    }
}

export async function markChatAsRead(chatId, userId) {
    try {
        const chatRef = doc(db, "chats", chatId);
        const docSnap = await getDoc(chatRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const updates = { [`unreadCount_${userId}`]: 0 };
            if (data.lastMessageSenderId && data.lastMessageSenderId !== userId) {
                if (data.lastMessageStatus !== 'read') updates.lastMessageStatus = 'read';
            }
            await updateDoc(chatRef, updates);
        }
    } catch (e) { console.error(e); }
}

export async function updateMessageStatus(chatId, messageId, newStatus) {
    try {
        const msgRef = doc(db, "chats", chatId, "messages", messageId);
        await updateDoc(msgRef, { status: newStatus });
    } catch (e) { console.error(e); }
}

export async function markPendingMessagesAsDelivered(senderId, receiverId) {
    const chatId = getChatId(senderId, receiverId);
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, where("senderId", "==", senderId), where("status", "==", "sent"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((docSnap) => { updateDoc(docSnap.ref, { status: 'delivered' }); });

    if (!querySnapshot.empty) {
        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);
        if (chatSnap.exists()) {
            const data = chatSnap.data();
            if (data.lastMessageSenderId === senderId && data.lastMessageStatus === 'sent') {
                await updateDoc(chatRef, { lastMessageStatus: 'delivered' });
            }
        }
    }
}

export function subscribeToMessages(currentUserId, otherUserId, callback, pageSize = 20) {
    const chatId = getChatId(currentUserId, otherUserId);
    const messagesRef = collection(db, "chats", chatId, "messages");
    
    const q = query(messagesRef, orderBy("timestamp", "desc"), limit(pageSize));

    return onSnapshot(q, (snapshot) => {
        const messages = [];
        let lastVisible = null;
        if (snapshot.docs.length > 0) {
            lastVisible = snapshot.docs[snapshot.docs.length - 1];
        }
        snapshot.forEach(docSnapshot => {
            const data = docSnapshot.data();
            data.id = docSnapshot.id;
            data.chatId = chatId; 
            if (data.receiverId === currentUserId && data.status !== 'read') {
                updateMessageStatus(chatId, docSnapshot.id, 'read');
                data.status = 'read'; 
            }
            messages.push(data);
        });
        messages.reverse();
        callback(messages, lastVisible);
    });
}

export async function fetchHistoryMessages(currentUserId, otherUserId, lastVisibleDoc, pageSize = 20) {
    if (!lastVisibleDoc) return { messages: [], lastDoc: null };
    const chatId = getChatId(currentUserId, otherUserId);
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "desc"), startAfter(lastVisibleDoc), limit(pageSize));
    const snapshot = await getDocs(q);
    const messages = [];
    let newLastDoc = null;
    if (snapshot.docs.length > 0) newLastDoc = snapshot.docs[snapshot.docs.length - 1];
    snapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        data.id = docSnapshot.id;
        data.chatId = chatId;
        messages.push(data);
    });
    messages.reverse();
    return { messages, lastDoc: newLastDoc };
}