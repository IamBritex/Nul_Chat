import { auth } from "../../../config/firebase-config.js";
import { signOut } from "firebase/auth";
import { renderChatList } from "../chat-list/chat-list.js";

export function renderAside(user) {
    const aside = document.createElement("aside");
    aside.className = "sidebar";
    
    const defaultAvatar = "assets/icons/icon-192.png"; 
    let photoURL = user.photoURL || defaultAvatar;

    aside.innerHTML = `
        <div class="sidebar-header">
            <div class="user-profile-top">
                <img src="${photoURL}" alt="Profile" class="avatar-img" referrerpolicy="no-referrer" onerror="this.src='${defaultAvatar}'">
                <div class="user-info-header">
                    <span class="username" title="${user.displayName}">${user.displayName}</span>
                </div>
            </div>
            
            <div class="menu-container">
                <button id="menu-btn" class="icon-btn menu-trigger" title="Opciones">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
                <div id="dropdown-menu" class="dropdown-menu hidden">
                    <div class="menu-item" id="logout-btn">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        <span>Cerrar Sesión</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="chat-list-wrapper" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;"></div>
        <div class="resizer" id="sidebar-resizer"></div>
    `;

    // Cargar lista de chats
    const chatListWrapper = aside.querySelector("#chat-list-wrapper");
    chatListWrapper.appendChild(renderChatList());

    // --- Lógica del Menú ---
    const menuBtn = aside.querySelector("#menu-btn");
    const dropdown = aside.querySelector("#dropdown-menu");
    const logoutBtn = aside.querySelector("#logout-btn");

    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("hidden");
    });

    logoutBtn.addEventListener("click", () => {
        signOut(auth).catch(err => console.error(err));
    });

    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
            dropdown.classList.add("hidden");
        }
    });

    // --- Lógica Resizer Ajustada ---
    const resizer = aside.querySelector("#sidebar-resizer");
    let isResizing = false;

    resizer.addEventListener("mousedown", () => {
        isResizing = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isResizing) return;
        
        // Mínimo 80px para que quepa la foto
        const minWidth = 80; 
        const maxWidth = 500;
        const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX));
        
        aside.style.width = `${newWidth}px`;

        // CAMBIO IMPORTANTE: Solo colapsar si baja de 100px (casi al límite)
        if (newWidth < 100) {
            aside.classList.add("collapsed");
        } else {
            aside.classList.remove("collapsed");
        }
    });

    document.addEventListener("mouseup", () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }
    });

    return aside;
}