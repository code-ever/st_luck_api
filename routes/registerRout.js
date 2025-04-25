const db = require('../db/connetDB');
const express = require('express');
const bcryptjs = require('bcryptjs');
const { emailExist, Register, verifyEmail, getUser, updateUser } = require('../Controller/controler');
const randomstring = require('randomstring');
const sendEmail = require('../helper/sendEmail');
const route = express.Router();
const upload = require('../routes/uploading/fileupload');
const cloudinary = require('../utils/cloudinary');

route.post('/', upload.single('passport'), async (req, res) => {
    const { fullname, dob, gender, so, nationality, lga, address, number, email, password } = req.body;

    // Check empty fields
    if (!fullname || !dob || !gender || !so || !nationality || !lga || !address || !number || !email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Check if email exists
    const user = await emailExist(email);
    if (user) {
        return res.status(400).json({ message: "Email already exists", status: false });
    }

    // Check if file uploaded
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded", status: false });
    }

    try {
        // Upload file to Cloudinary using a Promise
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: 'auto', folder: 'profiles', timeout: 120000 },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result);
                }
            ).end(req.file.buffer);
        });

        const secure_url = uploadResult.secure_url;


        const hashed = await bcryptjs.hash(password, 10);

        const saveData = await Register(fullname, dob, gender, so, nationality, lga, address, number, email, hashed, secure_url);
        if (saveData) {
            const randomToken = randomstring.generate();
            const subjectEmail = 'Verify Registration';
            const content = `<p>Hi ${fullname}, Please <a href="${process.env.APP_URL_API}/tokenverify?is_verify=${randomToken}">verify</a> your email.<br />Your password is: ${password}</p>`;

            await sendEmail(email, subjectEmail, content);

            await updateUser(randomToken, email);

            return res.status(200).json({ message: "Registration Successful. Please check your email for verification.", data: saveData });
        } else {
            return res.status(400).json({ message: "Registration failed. Please try again." });
        }
    } catch (error) {
        console.error("Error: ", error);
        // Handle errors and ensure only one response is sent
        if (!res.headersSent) {
            return res.status(500).json({
                message: 'Something went wrong',
                error: error.message
            });
        }
    }
});

route.get("/", async (req, res) => {
    try {
        const students = await getUser();

        if (!students) {
            return res.status(400).json({ message: 'No student found' });
        }

       return  res.status(200).json({ message: 'Student found', data: students });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});

module.exports = route;
