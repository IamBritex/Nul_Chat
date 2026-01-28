import { getRecentLocalImages } from "../db/localMedia.js";
import { handleFiles } from "../chat/files.js";
import { scrollToBottom } from "../chat/utils.js";

let menuContainer = null;
let isMenuOpen = false;

export function initAttachmentMenu() {
    const inputArea = document.querySelector('.input-area'); 
    if (!inputArea || document.getElementById('attachment-drawer')) return;

    const html = `
    <div class="attachment-drawer" id="attachment-drawer">
        <div class="cards-container" id="cards-scroll-area"></div>
        <input type="file" id="camera-trigger" accept="image/*" capture="environment" class="hidden-input">
        <input type="file" id="gallery-trigger" accept="image/*" multiple class="hidden-input">
    </div>`;

    inputArea.insertAdjacentHTML('beforeend', html);
    menuContainer = document.getElementById('attachment-drawer');

    document.getElementById('camera-trigger').addEventListener('change', (e) => {
        handleFiles(e.target.files);
        closeAttachmentMenu();
        e.target.value = ''; 
    });

    document.getElementById('gallery-trigger').addEventListener('change', (e) => {
        handleFiles(e.target.files);
        closeAttachmentMenu();
        e.target.value = '';
    });
}

async function renderCards() {
    const container = document.getElementById('cards-scroll-area');
    container.innerHTML = ''; 

    // Cámara
    const camCard = document.createElement('div');
    camCard.className = 'attach-card action-card';
    camCard.innerHTML = `<i class="fas fa-camera"></i><span>Cámara</span>`;
    camCard.onclick = () => document.getElementById('camera-trigger').click();
    container.appendChild(camCard);

    // Galería
    const galCard = document.createElement('div');
    galCard.className = 'attach-card action-card';
    galCard.innerHTML = `<i class="fas fa-images"></i><span>Galería</span>`;
    galCard.onclick = () => document.getElementById('gallery-trigger').click();
    container.appendChild(galCard);

    // Recientes
    const recentImages = await getRecentLocalImages(20);
    
    recentImages.forEach(item => {
        const imgCard = document.createElement('div');
        imgCard.className = 'attach-card image-card';
        
        const imgUrl = URL.createObjectURL(item.blob);
        imgCard.innerHTML = `<img src="${imgUrl}" loading="lazy">`;
        
        imgCard.onclick = () => {
            const file = new File([item.blob], item.name || "image.jpg", { type: item.blob.type });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            
            handleFiles(dataTransfer.files);
            closeAttachmentMenu();
        };

        container.appendChild(imgCard);
    });
}

export function toggleAttachmentMenu() {
    if (!menuContainer) initAttachmentMenu();
    
    if (isMenuOpen) {
        closeAttachmentMenu();
    } else {
        openAttachmentMenu();
    }
}

async function openAttachmentMenu() {
    const inputArea = document.querySelector('.input-area');
    await renderCards();
    
    // 1. Añadir clase al padre para permitir wrap
    if(inputArea) inputArea.classList.add('menu-open');
    
    // 2. Mostrar el elemento (display: flex) antes de animar
    menuContainer.style.display = 'flex';
    
    // 3. Forzar reflow para que la transición de CSS funcione
    void menuContainer.offsetWidth; 
    
    // 4. Activar animación
    menuContainer.classList.add('visible');
    isMenuOpen = true;
    
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
        setTimeout(() => scrollToBottom(messagesContainer), 300);
    }
}

export function closeAttachmentMenu() {
    if (menuContainer) {
        // 1. Iniciar animación de cierre
        menuContainer.classList.remove('visible');
        
        // 2. Esperar a que termine la animación (300ms) para ocultar
        setTimeout(() => {
            if (!isMenuOpen) { // Doble check por si se reabrió rápido
                menuContainer.style.display = 'none';
                
                const inputArea = document.querySelector('.input-area');
                if(inputArea) inputArea.classList.remove('menu-open');
            }
        }, 300);
    }
    isMenuOpen = false;
}