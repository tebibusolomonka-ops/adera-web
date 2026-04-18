import { auth } from '../firebase';

/**
 * Cloudinary Upload Service
 * Uses SIGNED uploads via our secure Vercel backend.
 */

const CLOUD_NAME = "drabvwots"; 

export const uploadToCloudinary = async (fileData: string, folder?: string): Promise<string> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Authentication required for upload");

        // 1. Get Security Token
        const idToken = await currentUser.getIdToken();

        // 2. Get Signature from our Backend
        const signResponse = await fetch('/api/sign-cloudinary', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ folder })
        });

        const signData = await signResponse.json().catch(() => ({}));

        if (!signResponse.ok) {
            throw new Error(signData.error || "Failed to get upload signature");
        }
        
        const { signature, timestamp, api_key } = signData;

        // 3. Perform Signed Upload
        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        const formData = new FormData();
        formData.append("file", fileData);
        formData.append("api_key", api_key);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        if (folder) formData.append("folder", folder);

        const response = await fetch(url, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Cloudinary Error:", data);
            throw new Error(data.error?.message || "Upload failed");
        }

        return data.secure_url;

    } catch (error) {
        console.error("Secure Cloudinary Error:", error);
        throw error;
    }
};
