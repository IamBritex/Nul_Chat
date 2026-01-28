import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAxCFcAndR0_ZTpN8vBvqjqN4YqnTwkgSw",
    authDomain: "nulchat-5d385.firebaseapp.com",
    databaseURL: "https://nulchat-5d385-default-rtdb.firebaseio.com",
    projectId: "nulchat-5d385",
    storageBucket: "nulchat-5d385.firebasestorage.app",
    messagingSenderId: "954677703895",
    appId: "1:954677703895:web:71c4926ce77f240bf5ac92",
    measurementId: "G-RP54T65V38"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { app, analytics, auth, db, rtdb };