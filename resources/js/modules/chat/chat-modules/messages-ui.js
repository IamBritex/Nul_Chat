// CORREGIDO: ../../../config
import { auth } from "../../../config/firebase-config.js";
import { parseEmoji } from "../../../utils/emoji-handler.js";

export function createMessageElement(msg, isMe, isPending) {
    const div = document.createElement("div");
    
    const formattedText = formatText(msg.text);
    const emojiHtml = parseEmoji(formattedText);
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = emojiHtml;
    const textOnly = tempDiv.textContent.trim();
    const isEmojiOnly = textOnly.length === 0 && tempDiv.querySelectorAll("img.emoji").length > 0;
    
    div.className = `message-row ${isMe ? "sent" : "received"} ${isEmojiOnly ? "emoji-only" : ""}`;
    
    let time = "";
    if (msg.timestamp) {
        time = msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    let statusHtml = "";
    if (isMe) {
        let statusClass = "pending";
        let dots = '';

        if (isPending) {
            statusClass = "pending";
            dots = '<i class="fa-solid fa-circle"></i>'; 
        } else if (msg.status === "read") {
            statusClass = "read";
            dots = '<i class="fa-solid fa-circle"></i><i class="fa-solid fa-circle"></i>';
        } else if (msg.status === "sent" || msg.status === "delivered") {
            statusClass = "sent";
            dots = '<i class="fa-solid fa-circle"></i><i class="fa-solid fa-circle"></i>';
        } else {
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

export function appendMessageToFeed(feed, docSnap, currentUid, prepend = false) {
    const msg = docSnap.data();
    const isMe = msg.senderId === currentUid;
    const isPending = docSnap.metadata.hasPendingWrites;
    
    const msgEl = createMessageElement(msg, isMe, isPending);
    msgEl.dataset.msgId = docSnap.id;

    const emptyState = feed.querySelector(".empty-state");
    if (emptyState) emptyState.remove();

    if (prepend) feed.insertBefore(msgEl, feed.firstChild);
    else feed.appendChild(msgEl);
}

export function updateMessageInFeed(feed, docSnap, currentUid) {
    const msgData = docSnap.data();
    const existingEl = feed.querySelector(`[data-msg-id="${docSnap.id}"]`);
    if (existingEl) {
        const newEl = createMessageElement(msgData, msgData.senderId === currentUid, docSnap.metadata.hasPendingWrites);
        newEl.dataset.msgId = docSnap.id;
        feed.replaceChild(newEl, existingEl);
    }
}

function formatText(text) {
    if (text === null || text === undefined) return "";
    return text.toString().replace(/\n/g, '<br>');
}