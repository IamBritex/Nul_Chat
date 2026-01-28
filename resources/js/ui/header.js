export function updateChatHeader(name, photo, state = 'offline') {
    const headerName = document.querySelector('.chat-header .header-name');
    const headerStatus = document.querySelector('.chat-header .header-status');
    const headerAvatar = document.querySelector('.chat-info .avatar-circle');

    if (headerName && headerStatus && headerAvatar) {
        headerName.classList.remove('skeleton', 'skeleton-text');
        headerName.style.width = 'auto'; headerName.style.height = 'auto'; headerName.innerText = name;
        
        headerStatus.classList.remove('skeleton', 'skeleton-text');
        headerStatus.style.width = 'auto'; headerStatus.innerText = ''; 
        
        headerAvatar.classList.remove('skeleton');
        headerAvatar.style.backgroundImage = `url('${photo}')`;
        headerAvatar.style.backgroundSize = 'cover'; headerAvatar.style.backgroundColor = 'transparent';
        
        headerAvatar.innerHTML = `<div class="status-indicator status-${state}"></div>`;
    }
}