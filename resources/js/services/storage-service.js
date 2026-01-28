import { cloudinaryConfig } from "../config/cloudinary-config.js";

/**
 * Sube un archivo a Cloudinary
 * @param {File} file - El archivo a subir
 * @returns {Promise<string>} URL segura de la imagen
 */
export async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);
    formData.append("api_key", cloudinaryConfig.apiKey);

    try {
        const response = await fetch(cloudinaryConfig.uploadUrl, {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Cloudinary Upload Failed");

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error(error);
        throw error;
    }
}