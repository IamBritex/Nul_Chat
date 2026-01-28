/**
 * Utilidades para el manejo de Twemoji
 */

// Configuración base de Twemoji (CDN Estable corregido)
const twemojiOptions = {
    folder: 'svg',
    ext: '.svg',
    // Usamos cdnjs que mantiene la estructura correcta de carpetas para la v14
    base: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/' 
};

/**
 * Inicializa el observador global para elementos dinámicos
 */
export function initEmojiSystem() {
    // Verificar si la librería cargó
    if (!window.twemoji) {
        console.warn("Twemoji no está cargado. Verifica tu index.html");
        return;
    }
    
    // Parsear el body inicial
    try {
        window.twemoji.parse(document.body, twemojiOptions);
    } catch (e) {
        console.error("Error parseando emojis iniciales:", e);
    }
    
    // Observador de respaldo para elementos inyectados dinámicamente
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT') {
                        try {
                            window.twemoji.parse(node, twemojiOptions);
                        } catch (e) {
                            // Ignorar errores puntuales de parseo
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Transforma una cadena de texto con emojis nativos a HTML con imágenes Twemoji.
 * @param {string} text - Texto con emojis nativos
 * @returns {string} - HTML con etiquetas <img>
 */
export function parseEmoji(text) {
    if (!text) return "";
    
    if (window.twemoji) {
        try {
            return window.twemoji.parse(text, twemojiOptions);
        } catch (e) {
            console.error("Error en parseEmoji:", e);
            return text; // Fallback al texto original si falla
        }
    }
    return text;
}