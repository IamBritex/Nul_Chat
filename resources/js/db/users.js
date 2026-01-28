import { doc, setDoc, collection, query, where, getDocs, limit, onSnapshot, updateDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "../config.js";

export async function saveUserToFirestore(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            searchName: user.displayName.toLowerCase(),
            state: 'online', 
            lastChanged: serverTimestamp()
        }, { merge: true });
    } catch (e) { console.error("Error guardando usuario: ", e); }
}

export async function saveUserOneSignalId(uid, oneSignalId) {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            oneSignalId: oneSignalId
        });
        console.log("OneSignal ID guardado:", oneSignalId);
    } catch (e) {
        console.error("Error guardando OneSignal ID:", e);
    }
}

export async function updateUserStatus(uid, statusOrData) {
    try {
        const userRef = doc(db, "users", uid);
        let data = {};
        if (typeof statusOrData === 'string') {
            data = { state: statusOrData };
        } else {
            data = statusOrData;
        }
        data.lastChanged = serverTimestamp();
        await updateDoc(userRef, data);
    } catch (e) { 
        const s = typeof statusOrData === 'string' ? statusOrData : statusOrData.state;
        if (s !== 'offline') console.error("Error estado:", e); 
    }
}

export async function getUserData(uid) {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) { return null; }
}

export function subscribeToUser(uid, callback) {
    return onSnapshot(doc(db, "users", uid), (docSnap) => {
        if (docSnap.exists()) callback(docSnap.data());
    });
}

export async function searchUsers(searchTerm, currentUserId) {
    const usersRef = collection(db, "users");
    const q = query(
        usersRef, 
        where("searchName", ">=", searchTerm),
        where("searchName", "<=", searchTerm + '\uf8ff'),
        limit(10)
    );
    const querySnapshot = await getDocs(q);
    const results = [];
    let foundSelf = false;
    querySnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.uid === currentUserId) foundSelf = true;
        else results.push(user);
    });
    return { results, foundSelf };
}