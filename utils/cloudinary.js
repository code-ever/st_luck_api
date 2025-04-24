
const dotenv = require("dotenv");
const cloudinaryModule = require("cloudinary");

dotenv.config();

const cloudinary = cloudinaryModule.v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,   // Ensure the correct environment variable is used
    api_key: process.env.API_KEY,         // Ensure the correct environment variable is used
    api_secret: process.env.API_SECRET    // Corrected typo here (from AOI_SECRET to API_SECRET)
});

module.exports = cloudinary;
