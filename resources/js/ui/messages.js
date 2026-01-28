import { createLinkPreviewHTML } from './linkPreview.js';
import { initNotifications, notifyNewMessage } from './notifications.js';

// Inicializamos el sistema de audio/notificaciones (listeners de desbloqueo)
initNotifications();

const messagesContainer = document.querySelector('.messages-container');

messagesContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('read-more-link')) {
        e.preventDefault();
        e.stopPropagation();
        const wrapper = e.target.closest('.collapsible-wrapper');
        if (wrapper) {
            const shortVer = wrapper.querySelector('.short-version');
            const fullVer = wrapper.querySelector('.full-version');
            if (shortVer && fullVer) {
                shortVer.style.display = 'none';
                fullVer.style.display = 'inline';
            }
        }
    }
});

export function clearMessages() {
    messagesContainer.innerHTML = '';
}

function getRelativeDateLabel(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffMs = today - target;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === -1) return "Mañana";
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays === 2) return "Anteayer";

    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const yearStr = date.getFullYear() !== now.getFullYear() ? ` del ${date.getFullYear()}` : '';
    
    return `${date.getDate()} de ${months[date.getMonth()]}${yearStr}`;
}

export function renderDateDivider(timestamp) {
    if (!timestamp) return "";
    const label = getRelativeDateLabel(timestamp);
    return `<div class="date-divider"><span>${label}</span></div>`;
}

function parseEmojis(html) {
    if (window.twemoji && window.twemoji.parse) {
        return window.twemoji.parse(html, {
            folder: 'svg',
            ext: '.svg'
        });
    }
    return html;
}

function processMessageText(text) {
    if (!text) return "";

    const MAX_LENGTH = 350;

    const formatText = (str) => {
        let safeText = str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const urlRegex = /((https?:\/\/[^\s]+)|(www\.[^\s]+))/g;

        return safeText.replace(urlRegex, (url) => {
            let href = url;
            if (!href.startsWith('http')) {
                href = 'http://' + href;
            }
            return `<a href="${href}" class="chat-link" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
    };

    if (text.length <= MAX_LENGTH) {
        return parseEmojis(formatText(text));
    }

    const shortText = text.substring(0, MAX_LENGTH).trim();
    const fullText = text;

    return `<span class="collapsible-wrapper"><span class="short-version">${parseEmojis(formatText(shortText))}... <span class="read-more-link">Leer más...</span></span><span class="full-version" style="display:none;">${parseEmojis(formatText(fullText))}</span></span>`;
}

function buildImagesHTML(images) {
    if (!images || images.length === 0) return '';

    const imagesData = encodeURIComponent(JSON.stringify(images));

    if (images.length === 1) {
        return `<img src="${images[0]}" class="message-image" loading="lazy" data-images="${imagesData}" data-index="0">`;
    }

    const count = images.length;
    const maxShow = 4;
    const gridClass = count >= 4 ? 'grid-4' : (count === 3 ? 'grid-3' : 'grid-2');
    
    let html = `<div class="image-grid ${gridClass}">`;

    for (let i = 0; i < Math.min(count, maxShow); i++) {
        let overlay = '';
        if (i === 3 && count > 4) {
            overlay = `<div class="more-overlay">+${count - 4 + 1}</div>`;
        }
        
        html += `
            <div class="grid-item">
                <img src="${images[i]}" class="message-image" loading="lazy" data-images="${imagesData}" data-index="${i}">
                ${overlay}
            </div>`;
    }

    html += `</div>`;
    return html;
}

function buildMessageHTML(msg, isOwn, animate = false, staggerDelay = null) {
    const typeClass = isOwn ? 'sent' : 'received';
    
    let animClass = '';
    let styleAttr = '';

    if (animate) {
        animClass = 'msg-enter';
    } else if (staggerDelay !== null) {
        animClass = 'msg-stagger';
        styleAttr = `style="animation-delay: ${staggerDelay}ms"`;
    }
    
    let timeString = '...';
    let timestampSecs = 0;

    if (msg.timestamp) {
        const date = msg.timestamp.toDate();
        timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        timestampSecs = Math.floor(date.getTime() / 1000);
    }
    
    let statusHTML = '';
    if (isOwn) {
        let iconClass = 'fa-check';
        let readClass = '';
        if (msg.status === 'delivered') iconClass = 'fa-check-double';
        if (msg.status === 'read') { iconClass = 'fa-check-double'; readClass = 'read'; }
        statusHTML = `<i class="fas ${iconClass} status-icon ${readClass}"></i>`;
    }

    const processedText = processMessageText(msg.text);
    const previewHTML = msg.preview ? createLinkPreviewHTML(msg.preview) : '';
    const imagesList = msg.images || (msg.image ? [msg.image] : []);
    const imageHTML = buildImagesHTML(imagesList);
    let finalContent = imageHTML + processedText;

    if (msg.preview && imagesList.length === 0) {
        const urlRegex = /^((https?:\/\/[^\s]+)|(www\.[^\s]+))$/i;
        const isLinkOnly = urlRegex.test(msg.text?.trim() || "");
        if (isLinkOnly) finalContent = previewHTML;
        else finalContent = previewHTML + processedText;
    }

    let emojiClass = '';
    if (!msg.image && (!msg.images || msg.images.length === 0) && !msg.preview && msg.text) {
        try {
            const segmenter = new Intl.Segmenter([], { granularity: 'grapheme' });
            const segments = [...segmenter.segment(msg.text.trim())];
            if (segments.length === 1 && /^\p{Extended_Pictographic}/u.test(segments[0].segment)) {
                emojiClass = 'emoji-only';
            }
        } catch (e) {
            if (msg.text.trim().match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})$/u)) {
                emojiClass = 'emoji-only';
            }
        }
    }

    return `<div class="message ${typeClass} ${animClass} ${emojiClass}" id="msg-${msg.id}" data-timestamp="${timestampSecs}" ${styleAttr}><div class="bubble">${finalContent}<div class="message-meta"><span class="time">${timeString}</span>${statusHTML}</div></div></div>`;
}

export function renderMessage(msg, isOwn, shouldAnimate = false, staggerDelay = null) {
    // Si el mensaje es nuevo (se debe animar), notificamos.
    // El archivo notifications.js decidirá qué sonido tocar basándose en si es mío o no.
    if (shouldAnimate) {
        notifyNewMessage(msg, isOwn);
    }

    const html = buildMessageHTML(msg, isOwn, shouldAnimate, staggerDelay);
    
    const existingMsg = document.getElementById(`msg-${msg.id}`);
    if (existingMsg) {
        existingMsg.outerHTML = html; 
    } else {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.insertAdjacentHTML('beforebegin', html);
        } else {
            messagesContainer.insertAdjacentHTML('beforeend', html);
        }
    }
}

export function prependOldMessages(messages, myUid) {
    if (!messages || messages.length === 0) return;

    const oldScrollHeight = messagesContainer.scrollHeight;
    const oldScrollTop = messagesContainer.scrollTop;

    const firstExistingMsg = messagesContainer.querySelector('.message');
    if (firstExistingMsg && firstExistingMsg.dataset.timestamp) {
        const lastNewMsg = messages[messages.length - 1]; 
        
        if (lastNewMsg.timestamp) {
            const existingDate = new Date(parseInt(firstExistingMsg.dataset.timestamp) * 1000);
            const newBatchDate = lastNewMsg.timestamp.toDate();

            const isSameDay = existingDate.toDateString() === newBatchDate.toDateString();

            if (isSameDay) {
                const prevEl = firstExistingMsg.previousElementSibling;
                if (prevEl && prevEl.classList.contains('date-divider')) {
                    prevEl.remove();
                }
            }
        }
    }

    let htmlAccumulator = '';
    messages.forEach((msg, index) => {
        const isOwn = msg.senderId === myUid;
        if (msg.timestamp) {
            const dateString = msg.timestamp.toDate().toDateString();
            if (index === 0 || (messages[index-1].timestamp && messages[index-1].timestamp.toDate().toDateString() !== dateString)) {
                htmlAccumulator += renderDateDivider(msg.timestamp);
            }
        }
        const msgHtml = buildMessageHTML(msg, isOwn, false, null);
        htmlAccumulator += msgHtml;
    });

    messagesContainer.insertAdjacentHTML('afterbegin', htmlAccumulator);
    const newScrollHeight = messagesContainer.scrollHeight;
    messagesContainer.scrollTop = newScrollHeight - oldScrollHeight + oldScrollTop;
}

export function updateMessageStatusUI(msgId, newStatus) {
    const msgEl = document.getElementById(`msg-${msgId}`);
    if (msgEl) {
        const icon = msgEl.querySelector('.status-icon');
        if (icon) {
            icon.className = 'fas status-icon'; 
            if (newStatus === 'sent') icon.classList.add('fa-check');
            else if (newStatus === 'delivered') icon.classList.add('fa-check-double');
            else if (newStatus === 'read') icon.classList.add('fa-check-double', 'read');
        }
    }
}

export function updateMessageTimeUI(msgId, timestamp) {
    const msgEl = document.getElementById(`msg-${msgId}`);
    if (msgEl && timestamp) {
        const timeEl = msgEl.querySelector('.time');
        if (timeEl && timeEl.innerText === '...') {
             const date = timestamp.toDate();
             timeEl.innerText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
             msgEl.dataset.timestamp = Math.floor(date.getTime() / 1000);
        }
    }
}

export function appendDateDividerIfNeeded(timestamp) {
    if (!timestamp) return;
    const div = document.createElement('div');
    div.innerHTML = renderDateDivider(timestamp);
    if(div.innerText.trim().length > 0) {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.insertAdjacentElement('beforebegin', div.firstElementChild);
        else messagesContainer.insertAdjacentHTML('beforeend', div.innerHTML);
    }
}

export function renderTypingIndicator() {
    if (document.getElementById('typing-indicator')) return;
    const html = `<div class="message received msg-enter" id="typing-indicator"><div class="bubble typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
    messagesContainer.insertAdjacentHTML('beforeend', html);
}

export function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) {
        el.classList.add('msg-exit');
        el.classList.remove('msg-enter');
        el.addEventListener('animationend', () => el.remove(), { once: true });
    }
}