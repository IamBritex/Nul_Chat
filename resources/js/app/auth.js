import { signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, provider } from "../config.js";
import { saveUserToFirestore } from "../db/index.js";
import * as UI from "../ui/index.js";
import { initChatInput } from "../chat/index.js";
import { appState } from "./state.js";
import { startChatListListener, clearContactListeners } from "./contacts.js";
import { initNavigation } from "./navigation.js";
import { initSearch } from "./search.js";
import { startPresence, stopPresence } from "../presence/index.js";

const userProfileBtn = document.getElementById('user-profile');
const defaultUserIcon = document.getElementById('default-user-icon');
const sidebarActions = document.getElementById('sidebar-actions');
const searchWrapper = document.getElementById('search-wrapper');
const searchInput = document.querySelector('.search-bar input');

export function initAuth() {
    userProfileBtn.addEventListener('click', () => {
        if (!auth.currentUser) loginUser();
        else if(confirm(`¿Cerrar sesión de ${auth.currentUser.displayName}?`)) signOut(auth);
    });

    onAuthStateChanged(auth, (user) => {
        appState.currentUser = user;
        
        clearContactListeners();

        if (user) {
            handleLoginSuccess(user);
        } else {
            handleLogout();
        }
    });

    initNavigation();
    initSearch();
}

const loginUser = () => {
    signInWithPopup(auth, provider)
        .then((result) => saveUserToFirestore(result.user))
        .catch((error) => console.error("Error login:", error));
};

async function handleLoginSuccess(user) {
    userProfileBtn.classList.remove('skeleton');
    defaultUserIcon.style.display = 'none';
    userProfileBtn.style.backgroundImage = `url('${user.photoURL}')`;
    userProfileBtn.style.backgroundSize = 'cover';
    userProfileBtn.classList.add('has-image');
    sidebarActions.classList.remove('hidden');
    searchWrapper.classList.remove('hidden');
    
    saveUserToFirestore(user);
    initChatInput(user.uid);
    searchInput.value = '';

    UI.renderLoadingState();
    UI.renderNoChatSelectedState(user);
    
    // Iniciamos presencia y lista de chats (SIN notificaciones push)
    startPresence(user);
    startChatListListener(user);
}

function handleLogout() {
    stopPresence();

    userProfileBtn.style.backgroundImage = 'none';
    userProfileBtn.classList.remove('has-image');
    defaultUserIcon.style.display = 'block';
    userProfileBtn.classList.add('skeleton');
    sidebarActions.classList.add('hidden');
    searchWrapper.classList.add('hidden');
    searchInput.value = '';
    
    UI.renderNoChatSelectedState(null, loginUser);
    UI.renderLoggedOutState(loginUser);
}