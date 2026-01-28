import { updateUserStatus } from '../db/index.js';

const CONFIG = {
    PING_INTERVAL: 30000,      // 30 segundos
    IDLE_TIMEOUT: 600000,      // 10 minutos
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
 * Inicia el sistema de heartbeat para el usuario actual.
 * @param {Object} user - Objeto del usuario autenticado (Firebase User).
 */
export function startHeartbeat(user) {
    if (!user) return;
    
    stopHeartbeat();
    state.currentUser = user;
    state.isPageVisible = !document.hidden;

    setupActivityListeners();
    setStatus('online');
    startPingLoop();
    resetIdleTimer();
}

/**
 * Detiene todos los listeners y timers.
 */
export function stopHeartbeat() {
    if (state.currentUser) {
        setStatus('offline');
    }
    
    clearInterval(state.timerPing);
    clearTimeout(state.timerIdle);
    removeActivityListeners();
    
    state.currentUser = null;
    state.status = 'offline';
}

function setStatus(newStatus) {
    if (state.status === newStatus) return;
    
    state.status = newStatus;
    sendPing(); 
}

function sendPing() {
    if (!state.currentUser) return;
    
    updateUserStatus(state.currentUser.uid, {
        state: state.status,
        lastSeen: new Date(),
        platform: getPlatformInfo()
    });
}

function startPingLoop() {
    state.timerPing = setInterval(() => {
        if (state.currentUser) sendPing();
    }, CONFIG.PING_INTERVAL);
}

function resetIdleTimer() {
    if (state.status === 'idle' && state.isPageVisible) {
        setStatus('online');
    }

    clearTimeout(state.timerIdle);
    
    if (state.status === 'online') {
        state.timerIdle = setTimeout(() => {
            setStatus('idle');
        }, CONFIG.IDLE_TIMEOUT);
    }
}

function handleVisibilityChange() {
    state.isPageVisible = !document.hidden;
    
    if (state.isPageVisible) {
        sendPing(); 
        resetIdleTimer(); 
    } else {
        setStatus('idle'); 
    }
}

function setupActivityListeners() {
    CONFIG.EVENTS.forEach(event => {
        document.addEventListener(event, resetIdleTimer, { passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', stopHeartbeat);
}

function removeActivityListeners() {
    CONFIG.EVENTS.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
    });
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', stopHeartbeat);
}

function getPlatformInfo() {
    return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        mobile: window.innerWidth <= 768
    };
}