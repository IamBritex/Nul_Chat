import { chatState } from '../chat/state.js';

/**
 * Módulo encargado de gestionar feedback auditivo y notificaciones del sistema.
 */

// Rutas a los archivos de audio
const POP_SOUND_PATH = './assets/sounds/pop.mp3';
const NOTIFICATION_SOUND_PATH = './assets/sounds/not.mp3';
const ICON_PATH = './assets/icons/NulIcon.png';

// Instancias de Audio
const popSound = new Audio(POP_SOUND_PATH);
const alertSound = new Audio(NOTIFICATION_SOUND_PATH);

// Configuración de volumen
popSound.volume = 0.6;   // Suave (Chat activo)
alertSound.volume = 1.0; // Fuerte (Alerta)

let audioUnlocked = false;

/**
 * Inicializa los listeners para desbloquear el audio.
 */
export function initNotifications() {
    const unlockAudio = () => {
        if (audioUnlocked) return;

        const p1 = popSound.play();
        const p2 = alertSound.play();

        Promise.all([
            p1 ? p1.then(() => { popSound.pause(); popSound.currentTime = 0; }) : Promise.resolve(),
            p2 ? p2.then(() => { alertSound.pause(); alertSound.currentTime = 0; }) : Promise.resolve()
        ]).then(() => {
            audioUnlocked = true;
            console.log('🔊 Sistema de Audio desbloqueado');
            
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        }).catch(() => {});

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
}

/**
 * Reproduce un sonido de manera segura.
 */
function safePlay(audioObj) {
    if (!audioUnlocked) return;
    audioObj.currentTime = 0;
    audioObj.play().catch(e => console.warn('Error audio:', e));
}

/**
 * Lógica principal de notificaciones.
 * @param {Object} msg - El objeto del mensaje.
 * @param {boolean} isOwn - True si el mensaje lo envié yo.
 */
export function notifyNewMessage(msg, isOwn) {
    // 1. Mensaje propio: Siempre feedback suave
    if (isOwn) {
        safePlay(popSound);
        return;
    }

    const isAppHidden = document.hidden;
    const currentChatId = chatState.currentChatId;

    // CONDICIÓN ÚNICA: ¿El usuario está viendo ESTE chat AHORA MISMO?
    // Requiere: App visible Y estar en el chat correcto.
    const isViewingThisChat = !isAppHidden && currentChatId === msg.chatId;

    if (isViewingThisChat) {
        // CASO A: Usuario atento al chat -> Sonido suave.
        safePlay(popSound);
    } else {
        // CASO B: Usuario distraído (Dashboard, Otro chat, o App oculta) -> ALERTA.
        // "Con que no esté en ese chat es más que suficiente"
        safePlay(alertSound);

        // EXTRA: Solo mostrar banner visual si la app está OCULTA
        if (isAppHidden && 'Notification' in window && Notification.permission === 'granted') {
            const bodyText = msg.image || (msg.images && msg.images.length > 0) 
                ? '📷 Foto' 
                : (msg.text || 'Nuevo mensaje');

            try {
                const notification = new Notification('NulChat', {
                    body: bodyText,
                    icon: ICON_PATH,
                    tag: 'nulchat-msg',
                    silent: true // Usamos nuestro propio audio
                });

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
            } catch (e) {
                console.error('Error notificación nativa:', e);
            }
        }
    }
}