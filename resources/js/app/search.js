import { searchUsers } from "../db/index.js";
import * as UI from "../ui/index.js";
import { appState } from "./state.js";
import { startChatListListener } from "./contacts.js";

const searchInput = document.querySelector('.search-bar input');
const contactList = document.getElementById('contact-list');
let searchTimeout = null;

export function initSearch() {
    searchInput.addEventListener('input', (e) => {
        const text = e.target.value.trim().toLowerCase();
        if (!appState.currentUser) return;
        clearTimeout(searchTimeout);
    
        if (text.length === 0) {
            UI.renderLoadingState();
            startChatListListener(appState.currentUser);
            return;
        }
        searchTimeout = setTimeout(() => performSearch(text), 300);
    });
}

async function performSearch(searchTerm) {
    contactList.classList.add('no-scroll');
    contactList.innerHTML = '<div style="padding:20px; text-align:center; color:#888"><i class="fas fa-circle-notch fa-spin"></i> Buscando...</div>';

    try {
        const { results } = await searchUsers(searchTerm, appState.currentUser.uid);
        let html = '';
        results.forEach(user => {
            html += UI.createContactHTML(user);
        });

        if (results.length === 0) {
            contactList.classList.add('no-scroll');
            contactList.innerHTML = `<div class="empty-state"><p>No se encontraron usuarios.</p></div>`;
        } else {
            contactList.classList.remove('no-scroll');
            contactList.innerHTML = html;
        }
    } catch (error) {
        console.error("Error buscando:", error);
    }
}