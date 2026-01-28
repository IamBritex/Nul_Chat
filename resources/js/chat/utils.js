export function getCaret(el) {
    let caretAt = 0;
    const sel = window.getSelection();
    if (sel.rangeCount === 0) return 0;
    const range = sel.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.endContainer, range.endOffset);
    caretAt = preRange.toString().length;
    return caretAt;
}

export function setCaret(el, offset) {
    let sel = window.getSelection();
    let range = document.createRange();
    let currentPos = 0;
    function traverse(node) {
        if (node.nodeType === 3) {
            if (currentPos + node.length >= offset) {
                range.setStart(node, offset - currentPos);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                return true;
            }
            currentPos += node.length;
        } else {
            for (let i = 0; i < node.childNodes.length; i++) {
                if (traverse(node.childNodes[i])) return true;
            }
        }
        return false;
    }
    traverse(el);
}

export function highlightLinks(text) {
    let safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const urlRegex = /((https?:\/\/[^\s]+)|(www\.[^\s]+))/g;
    return safeText.replace(urlRegex, '<a href="#">$1</a>');
}

export function scrollToBottom(element, smooth = true) {
    if (!element) return;
    
    // Si smooth es true, usa comportamiento suave (para clicks).
    // Si es false o carga inicial, es instantáneo.
    element.scrollTo({
        top: element.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
    });
}

export function formatDate(date) {
    if (!date) return '';
    // Formatea la fecha para mostrar solo la hora (ej: 10:30 AM)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function compressImage(file, maxWidth = 1280, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
            };
        };
    });
}