import { updateUserStatus } from "../db/index.js";

const CONFIG = {
    PING_INTERVAL: 30000,      // 30 segundos (Heartbeat)
    IDLE_TIMEOUT: 600000,      // 10 minutos para considerarse "Ausente"
    EVENTS: ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
};

let state = {
    timerPing: null,
    timerIdle: null,
    currentUser: null,
    status: 'offline',
    isPageVisible: true
};

/**
 * Inicia el sistema de presencia completo.
 * Debe llamarse al iniciar sesión.
 */
export function startPresence(user) {
    if (!user) return;
    
    // Limpieza preventiva
    stopPresence();

    state.currentUser = user;
    state.isPageVisible = !document.hidden;

    // 1. Configurar listeners de actividad (mouse, teclado, visibilidad)
    setupActivityListeners();
    
    // 2. Marcar como online inmediatamente
    setStatus('online');
    
    // 3. Iniciar el latido (Heartbeat loop)
    startPingLoop();
    
    // 4. Iniciar contador de inactividad
    resetIdleTimer();
}

/**
 * Detiene todo el sistema.
 * Debe llamarse al cerrar sesión.
 */
export function stopPresence() {
    if (state.currentUser) {
        setStatus('offline');
    }
    
    clearInterval(state.timerPing);
    clearTimeout(state.timerIdle);
    removeActivityListeners();
    
    state.currentUser = null;
    state.status = 'offline';
}

// --- Funciones Internas ---

function setStatus(newStatus) {
    state.status = newStatus;
    sendPing(); 
}

function sendPing() {
    if (!state.currentUser) return;
    
    const info = {
        state: state.status,
        lastSeen: new Date(), // Timestamp local para referencia rápida
        platform: getPlatformInfo()
    };
    
    updateUserStatus(state.currentUser.uid, info);
}

function startPingLoop() {
    // Enviar señal cada X segundos para confirmar conexión
    state.timerPing = setInterval(() => {
        if (state.currentUser) sendPing();
    }, CONFIG.PING_INTERVAL);
}

function resetIdleTimer() {
    // Si estaba inactivo (idle/away) y el usuario interactúa -> volver a online
    if ((state.status === 'idle' || state.status === 'away') && state.isPageVisible) {
        setStatus('online');
    }

    clearTimeout(state.timerIdle);
    
    // Solo programar el timer de inactividad si estamos online
    if (state.status === 'online') {
        state.timerIdle = setTimeout(() => {
            // Si pasaron 10 min sin eventos -> idle
            setStatus('idle');
        }, CONFIG.IDLE_TIMEOUT);
    }
}

function handleVisibilityChange() {
    state.isPageVisible = !document.hidden;
    
    if (state.isPageVisible) {
        // Volvió a la pestaña -> Online + Reset Timer
        setStatus('online'); 
        resetIdleTimer(); 
    } else {
        // Cambió de pestaña -> Away (o idle si prefieres)
        // 'away' indica que la conexión está activa pero no mira la app
        setStatus('away'); 
    }
}

function setupActivityListeners() {
    CONFIG.EVENTS.forEach(event => {
        document.addEventListener(event, resetIdleTimer, { passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', stopPresence);
}

function removeActivityListeners() {
    CONFIG.EVENTS.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
    });
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', stopPresence);
}

function getPlatformInfo() {
    return {
        userAgent: navigator.userAgent,
        mobile: window.innerWidth <= 768
    };
}

// Mantenemos exportación antigua por compatibilidad si fuera necesario, 
// aunque auth.js ahora usa startPresence.
export function initPresenceSystem() { 
    console.warn("initPresenceSystem está deprecado. Usa startPresence(user).");
}