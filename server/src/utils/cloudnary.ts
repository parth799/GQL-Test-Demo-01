import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

interface CloudinaryResponse {
    public_id: string;
    url: string;
}

export const uploadOnCloudinary = async (localFilePath: string): Promise<CloudinaryResponse | null> => {
    try {
        if (!localFilePath) return null;

        const response: UploadApiResponse = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });

        console.log("File uploaded on Cloudinary:", response);
        fs.unlinkSync(localFilePath);
        return { public_id: response.public_id, url: response.secure_url };

    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

export const deleteOnCloudinary = async (public_id: string, resource_type: string = "image"): Promise<string | null> => {
    try {
        if (!public_id) return null;

        const result = await cloudinary.uploader.destroy(public_id, { resource_type });
        console.log("File deleted from Cloudinary:", result);
        return result.result;

    } catch (error) {
        console.error("File deletion failed on Cloudinary:", error);
        return null;
    }
};

