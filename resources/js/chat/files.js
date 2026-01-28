import { compressImage } from "./utils.js";
import { toggleIcons } from "./input.js";
import { saveRecentLocalImage } from "../db/localMedia.js";

let selectedFiles = [];

export function getSelectedFiles() {
    return selectedFiles;
}

export function clearSelectedFiles() {
    selectedFiles = [];
}

export function removeFile(index) {
    selectedFiles.splice(index, 1);
    renderPreviews();
    const chatInputDiv = document.getElementById('chat-input-field');
    if (chatInputDiv) {
        toggleIcons(chatInputDiv.innerText.trim());
    }
}

export function renderPreviews() {
    let container = document.querySelector('.preview-container');
    const inputArea = document.querySelector('.input-area');
    
    if (selectedFiles.length === 0) {
        if (container) container.remove();
        return;
    }

    if (!container) {
        container = document.createElement('div');
        container.className = 'preview-container';
        if (inputArea) {
            inputArea.insertAdjacentElement('afterbegin', container);
        }
    } else {
        container.innerHTML = '';
    }

    selectedFiles.forEach((fileObj, index) => {
        const card = document.createElement('div');
        card.className = 'preview-card';
        card.innerHTML = `
            <img src="${fileObj.previewUrl}">
            <div class="remove-preview-btn"><i class="fas fa-times"></i></div>
        `;
        card.querySelector('.remove-preview-btn').onclick = () => removeFile(index);
        container.appendChild(card);
    });
}

export async function handleFiles(filesList) {
    if (!filesList || filesList.length === 0) return;
    
    const files = Array.from(filesList);
    const chatInputDiv = document.getElementById('chat-input-field');

    for (const file of files) {
        saveRecentLocalImage(file);

        try {
            const compressedBlob = await compressImage(file);
            const processedFile = new File([compressedBlob], "upload.webp", { type: "image/webp" });
            
            const reader = new FileReader();
            reader.onload = (event) => {
                selectedFiles.push({
                    file: processedFile,
                    previewUrl: event.target.result
                });
                renderPreviews();
                if (chatInputDiv) {
                    toggleIcons(chatInputDiv.innerText.trim());
                }
            };
            reader.readAsDataURL(processedFile);
        } catch (error) {
            console.error("Error processing file:", error);
        }
    }
    
    if (chatInputDiv) chatInputDiv.focus();
}

export function createFileInput() {
    // Esta función ya no es estrictamente necesaria si usamos el menú, 
    // pero la mantenemos para compatibilidad.
    let input = document.getElementById('image-input');
    if (!input) {
        input = document.createElement('input');
        input.type = 'file';
        input.id = 'image-input';
        input.accept = 'image/*';
        input.multiple = true; 
        input.style.display = 'none';
        document.body.appendChild(input);

        input.addEventListener('change', (e) => {
            handleFiles(e.target.files);
            input.value = ''; 
        });
    }
    return input;
}