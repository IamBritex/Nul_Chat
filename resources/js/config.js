import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js"; // <--- NUEVO

const firebaseConfig = {
    apiKey: "AIzaSyAxCFcAndR0_ZTpN8vBvqjqN4YqnTwkgSw",
    authDomain: "nulchat-5d385.firebaseapp.com",
    projectId: "nulchat-5d385",
    storageBucket: "nulchat-5d385.firebasestorage.app",
    messagingSenderId: "954677703895",
    appId: "1:954677703895:web:71c4926ce77f240bf5ac92",
    measurementId: "G-RP54T65V38"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app); // <--- NUEVO: Exportamos messaging
export const provider = new GoogleAuthProvider();