const db = require('../db/connetDB');
const express = require('express');
const bcryptjs = require('bcryptjs');
const { emailExist, Register, updateUser, getUserByToken, verifyEmail } = require('../Controller/controler');
const randomstring = require('randomstring');
const sendEmail = require('../helper/sendEmail');
const route = express.Router();
const upload = require('../routes/uploading/fileupload');
const cloudinary = require('../utils/cloudinary');

route.post("/", upload.single('passport'), async (req, res) => {
    const { fullname, dob, gender, so, nationality, lga, address, number, password, email } = req.body;

    // Check if any required fields are missing
    if (!fullname || !dob || !gender || !so || !nationality || !lga || !address || !number || !password || !email || !req.file) {
        return res.status(401).json({ message: 'Please fill in all the fields including passport image' });
    }

    try {
        const emailEx = await emailExist(email);
        if (emailEx) {
            return res.status(401).json({ message: 'E-mail already exists' });
        }

        // Hash the password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Upload the passport image to Cloudinary
        const imageFile = req.file;
        if (!imageFile) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { originalname, mimetype, buffer } = imageFile;

        const uploadResult = await cloudinary.uploader.upload(req.file.path, { 
            resource_type: 'auto',  
            public_id: `passport/${email}_${originalname}`,  
        }).catch((error) => {
            console.error('Error uploading to Cloudinary:', error);
            return res.status(500).json({ message: 'Error uploading passport image' });
        });

        const passportUrl = uploadResult.secure_url;

        // Register the user in the database
        const resultSave = await Register(fullname, dob, gender, so, nationality, lga, address, number, email, hashedPassword, passportUrl);

        if (resultSave) {
            const randomToken = randomstring.generate();
            const subjectEmail = 'Mail Verification';
            const content = `<p>Hi ${fullname}, Please <a href="${process.env.APP_URL_API}/tokenverify?is_verify=${randomToken}">verify</a> your email.</p>`;
            sendEmail(email, subjectEmail, content);
            await updateUser(randomToken, email);

            return res.status(200).json({ message: "Registration Successful. Please check your email for verification." });
        } else {
            return res.status(500).json({ message: 'Failed to register user' });
        }
    } catch (error) {
        console.error('Error in registration:', error);
        return res.status(500).json({ message: 'Something went wrong during registration' });
    }
});


route.get("/", async (req, res) => {
    const { is_verify } = req.query;
    try {
        if (!is_verify) {
            return res.status(400).json({ message: 'Token is missing' });
        }
        const user = await getUserByToken(is_verify);
        if (!user) {
            return res.status(404).json({ message: 'Invalid or expired token' }); // Stop execution if token is invalid or expired
        }

        if (!user.email) {
            return res.status(400).json({ message: 'User email is missing, cannot verify' });
        }

        const updateUser = await verifyEmail(user.email);

        if (updateUser) {
            // return res.json({
            //     success: true,
            //     message: 'Email successfully verified!',
            //     redirectUrl: `http://localhost:5173/continue?email=${user.email}`
            // });
            return res.redirect(303, `http://localhost:5173/continue?email=${user.email}`);
        } else {
            return res.status(400).json({ message: 'Something went wrong while verifying the email' });
        }
    } catch (error) {
        console.log('Error:', error.message);
        return res.status(500).json({ message: 'Something went wrong' });
    }
});






module.exports = route;
