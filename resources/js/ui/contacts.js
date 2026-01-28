export function createContactHTML(user, lastMessage = "Toca para chatear", timestamp = null, unreadCount = 0) {
    const safeName = user.displayName.replace(/"/g, '&quot;');
    const safePhoto = user.photoURL.replace(/"/g, '&quot;');
    
    let timeString = '';
    if (timestamp) {
        const date = timestamp.toDate();
        const isToday = new Date().toDateString() === date.toDateString();
        timeString = isToday 
            ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            : date.toLocaleDateString([], {day: 'numeric', month: 'short'});
    }

    let badgeHTML = '';
    if (unreadCount > 0) {
        badgeHTML = `<div class="notification-badge">${unreadCount}</div>`;
    }

    const unreadClass = unreadCount > 0 ? 'fw-bold' : '';

    // Usamos ./assets/... para la imagen por defecto y referrerpolicy para la imagen real
    return `
    <div class="contact-card" data-uid="${user.uid}" data-name="${safeName}" data-photo="${safePhoto}" data-state="${user.state || 'offline'}">
        <div class="avatar-circle">
            <img src="./assets/icons/NullIconDef.png" 
                 data-src="${user.photoURL}"
                 alt="${safeName}" 
                 class="user-pfp-img"
                 referrerpolicy="no-referrer" 
                 loading="lazy"
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;">
            <div class="status-indicator status-${user.state || 'offline'}"></div>
        </div>
        <div class="contact-info">
            <div class="contact-top">
                <span class="contact-name">${user.displayName}</span>
                <span class="message-time ${unreadClass}" style="${unreadCount > 0 ? 'color: var(--text-primary);' : ''}">${timeString}</span>
            </div>
            <div class="contact-bottom">
                <span class="last-message ${unreadClass}" style="${unreadCount > 0 ? 'color: var(--text-primary);' : ''}">${lastMessage}</span>
                ${badgeHTML}
            </div>
        </div>
    </div>`;
}