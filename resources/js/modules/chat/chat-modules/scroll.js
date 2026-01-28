/**
 * Scrollea el feed de mensajes al final
 */
export function scrollToBottom(smooth = false) {
    const feed = document.getElementById("messages-feed");
    if(feed) {
        feed.scrollTo({ 
            top: feed.scrollHeight, 
            behavior: smooth ? "smooth" : "auto" 
        });
    }
}

/**
 * Configura el listener para mostrar/ocultar el botón flotante
 */
export function setupScrollButtonListener() {
    const feed = document.getElementById("messages-feed");
    const scrollBtn = document.getElementById("scroll-bottom-btn");

    if (!feed || !scrollBtn) return;

    feed.addEventListener("scroll", () => {
        const distFromBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight;
        if (distFromBottom > 150) {
            scrollBtn.classList.remove("hidden");
        } else {
            scrollBtn.classList.add("hidden");
        }
    });

    scrollBtn.addEventListener("click", () => scrollToBottom(true));
}