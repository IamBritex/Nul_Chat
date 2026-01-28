const DB_NAME = 'ChatMediaCache';
const STORE_UPLOADS = 'recent_uploads';
const STORE_PFPS = 'user_pfps';
const DB_VERSION = 2;

function openMediaDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_UPLOADS)) {
                db.createObjectStore(STORE_UPLOADS, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORE_PFPS)) {
                db.createObjectStore(STORE_PFPS, { keyPath: 'uid' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveRecentLocalImage(file) {
    if (!file.type.startsWith('image/')) return;
    try {
        const db = await openMediaDB();
        const tx = db.transaction(STORE_UPLOADS, 'readwrite');
        const store = tx.objectStore(STORE_UPLOADS);

        const cursorRequest = store.openCursor();
        cursorRequest.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                if (cursor.value.name === file.name && cursor.value.blob.size === file.size) {
                    cursor.delete(); 
                }
                cursor.continue();
            }
        };

        tx.oncomplete = async () => {
             const db2 = await openMediaDB();
             const tx2 = db2.transaction(STORE_UPLOADS, 'readwrite');
             tx2.objectStore(STORE_UPLOADS).add({ 
                 blob: file, 
                 timestamp: Date.now(), 
                 name: file.name 
             });
        };
    } catch (e) { console.error("Error saving local image:", e); }
}

export async function getRecentLocalImages(limit = 20) {
    try {
        const db = await openMediaDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_UPLOADS, 'readonly');
            const store = tx.objectStore(STORE_UPLOADS);
            const request = store.openCursor(null, 'prev'); 
            const results = [];
            const seenNames = new Set();

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && results.length < limit) {
                    if (!seenNames.has(cursor.value.name)) {
                        results.push(cursor.value);
                        seenNames.add(cursor.value.name);
                    }
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
        });
    } catch (e) { return []; }
}

/**
 * Obtiene la URL (Blob) de la foto de perfil cacheada.
 */
export async function getCachedPFP(uid) {
    try {
        const db = await openMediaDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_PFPS, 'readonly');
            const store = tx.objectStore(STORE_PFPS);
            const request = store.get(uid);
            
            request.onsuccess = () => {
                if (request.result && request.result.blob) {
                    resolve(URL.createObjectURL(request.result.blob));
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => resolve(null);
        });
    } catch (e) { return null; }
}

/**
 * Descarga y guarda la foto de perfil en IndexedDB.
 * IMPORTANTE: Usa referrerPolicy: "no-referrer" para evitar error 429.
 */
export async function cachePFP(uid, remoteUrl) {
    try {
        const response = await fetch(remoteUrl, { referrerPolicy: "no-referrer" });
        
        if (!response.ok) throw new Error(`Network response was not ok (${response.status})`);
        
        const blob = await response.blob();
        const db = await openMediaDB();
        const tx = db.transaction(STORE_PFPS, 'readwrite');
        const store = tx.objectStore(STORE_PFPS);
        
        store.put({
            uid: uid,
            blob: blob,
            url: remoteUrl,
            timestamp: Date.now()
        });
        
        return URL.createObjectURL(blob);
    } catch (e) {
        console.warn("No se pudo cachear PFP (usando remoto):", e.message);
        return remoteUrl;
    }
}