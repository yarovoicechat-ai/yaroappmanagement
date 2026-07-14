import { apiClient } from './apiClient';

interface UploadResult {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    resource_type: string;
}

export const uploadToCloudinary = async (file: File, folder: string = 'general'): Promise<string> => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

        // 1. Get Signature
        let response;
        try {
            response = await apiClient.get('/api/upload/signature', {
                folder,
                type: folder,
                token: token || undefined,
            });
        } catch (error: any) {
            // Compatibility during backend rollout: the previous production API
            // has no banner upload type. Its signed help folder is safe for images;
            // the returned Cloudinary URL is still stored on the Banner document.
            const isLegacyBannerApi = (folder === 'banner' || folder === 'banners')
                && String(error?.message || '').includes('Invalid upload type');
            if (!isLegacyBannerApi) throw error;

            response = await apiClient.get('/api/upload/signature', {
                folder: 'help',
                type: 'help',
                token: token || undefined,
            });
        }

        if (!response.success || !response.data) {
            const message = response.message || 'Failed to get upload signature';
            console.error('Upload signature request failed:', message);
            throw new Error(message);
        }

        const { signature, timestamp, cloud_name, api_key, public_id, folder: signedFolder } = response.data;

        if (!cloud_name) {
            console.error("Missing cloud_name in signature response:", response.data);
            throw new Error('Cloudinary cloud name is missing in server response');
        }

        // 2. Prepare Form Data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', api_key);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        // Must exactly match the folder included in the server signature.
        formData.append('folder', signedFolder || folder);
        if (public_id) {
            formData.append('public_id', public_id);
        }

        // 3. Upload to Cloudinary
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await uploadRes.json();

        if (uploadRes.ok) {
            return data.secure_url;
        } else {
            console.error('Cloudinary Error:', data);
            throw new Error(data.error?.message || 'Upload failed');
        }

    } catch (error: any) {
        const errorMessage = error?.message || error?.error || 'Upload failed';
        console.error('Upload Service Error:', errorMessage, error);
        throw new Error(errorMessage);
    }
};
