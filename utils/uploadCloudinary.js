const cloudinary = require('cloudinary').v2;  
const fs = require('fs');

const uploadCloudinary = async(file) =>{
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        stream.end(file.buffer);
    });
} 

module.exports = uploadCloudinary