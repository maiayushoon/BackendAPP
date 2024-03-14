import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';  //fileSystem


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfully
        console.log("FILE IS UPLOADED ON CLOUDINARY", response.url)
        console.log(response)
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //delete local image after uploading it to clodinary
        return null;
        // throw error;
    }
}

export { uploadOnCloudinary }