/**
 * Genera el HTML para la tarjeta de previsualización de un enlace.
 * @param {Object} preview - Datos de la previsualización.
 */
export function createLinkPreviewHTML(preview) {
    if (!preview || (!preview.title && !preview.image)) return '';

    let domain = '';
    try { 
        if (preview.url) {
            domain = new URL(preview.url).hostname.replace('www.', ''); 
        }
    } catch(e) {}

    const imageHTML = preview.image 
        ? `<div class="preview-image" style="background-image: url('${preview.image}');"></div>` 
        : '';

    const descriptionHTML = preview.description 
        ? `<div class="preview-desc">${preview.description}</div>` 
        : '';

    // Todo en una línea para evitar conflictos con white-space: pre-wrap
    return `<a href="${preview.url}" target="_blank" class="link-preview-card" rel="noopener noreferrer">${imageHTML}<div class="preview-info"><div class="preview-title">${preview.title || domain}</div>${descriptionHTML}<div class="preview-domain">${domain}</div></div></a>`;
}