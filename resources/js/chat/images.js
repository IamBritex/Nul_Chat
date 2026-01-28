const apiImgIbb = "0bca291ac174872cbd00707a7c6ede41";

/**
 * @param {File} file 
 */
export async function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiImgIbb}`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            return data.data.url;
        }
        return null;
    } catch (e) {
        console.error("Error upload:", e);
        return null;
    }
}