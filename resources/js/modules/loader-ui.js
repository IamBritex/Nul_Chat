/**
 * Inicializa y muestra el loader global.
 * Si el elemento no existe en el DOM, lo crea.
 */
export function showLoader() {
    let loader = document.getElementById('nul-global-loader');
    
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'nul-global-loader';
        loader.className = 'nul-loader-overlay';
        loader.innerHTML = '<div class="nul-spinner"></div>';
        document.body.appendChild(loader);
    }

    loader.classList.remove('hidden');
}

/**
 * Oculta el loader global con una transición suave.
 * Elimina el elemento del DOM al finalizar la transición para liberar memoria.
 */
export function hideLoader() {
    const loader = document.getElementById('nul-global-loader');
    
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 300);
    }
}