import { scrollToBottom } from "../chat/utils.js";

let scrollButton = null;
let unreadCount = 0;

export function initScrollButton(container) {
    if (document.querySelector('.scroll-bottom-btn')) return;

    scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-bottom-btn';
    scrollButton.innerHTML = `<i class="fas fa-chevron-down"></i>`;
    
    document.body.appendChild(scrollButton);

    scrollButton.addEventListener('click', () => {
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
        resetUnreadCount();
        scrollButton.blur(); 
    });
}

export function isUserAtBottom() {
    const container = document.querySelector('.messages-container');
    if (!container) return false;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    return scrollHeight - scrollTop - clientHeight < 10;
}

export function updateScrollButtonState() {
    if (!scrollButton) return;
    
    if (isUserAtBottom()) {
        scrollButton.classList.remove('visible');
        resetUnreadCount();
    } else {
        scrollButton.classList.add('visible');
    }
}

export function incrementUnreadCount() {
    if (!scrollButton || !scrollButton.classList.contains('visible')) return;
    
    unreadCount++;
    let badge = scrollButton.querySelector('.unread-badge');
    
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'unread-badge';
        scrollButton.appendChild(badge);
    }
    
    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
}

function resetUnreadCount() {
    unreadCount = 0;
    const badge = scrollButton?.querySelector('.unread-badge');
    if (badge) badge.remove();
}

export function removeScrollButton() {
    if (scrollButton) {
        scrollButton.remove();
        scrollButton = null;
    }
}