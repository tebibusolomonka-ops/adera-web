/**
 * Cloudinary Upload Service
 * Handles uploading images to Cloudinary without a backend server using Unsigned Uploads.
 */

// YOUR ACTUAL CREDENTIALS
const CLOUD_NAME = "drabvwots"; 
const UPLOAD_PRESET = "Adera_items"; 

/**
 * Uploads a base64 or file to Cloudinary and returns the secure URL
 */
export const uploadToCloudinary = async (fileData: string): Promise<string> => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    // Cloudinary expects a FormData object for the upload
    const formData = new FormData();
    formData.append("file", fileData);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Cloudinary Detailed Error:", data);
            throw new Error(data.error?.message || `Cloudinary Error (${response.status})`);
        }

        return data.secure_url;

    } catch (error) {
        console.error("Cloudinary Error:", error);
        throw error;
    }
};
