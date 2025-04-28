const db = require('../db/connetDB');
const express = require('express');
const bcryptjs = require('bcryptjs');
const { emailExist, Register, verifyEmail, getUser, updateUser } = require('../Controller/controler');
const randomstring = require('randomstring');
const sendEmail = require('../helper/sendEmail');
const route = express.Router();
const upload = require('../routes/uploading/fileupload');
const cloudinary = require('../utils/cloudinary');
const sendMailgun =  require('../helper/mailgun') 

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

            await sendMailgun(email, subjectEmail, content);
           // await sendMailgun(message='message', email, subject='testing email')

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
            return res.redirect(303, `https://st-luck-portal-ui.vercel.app/continue?email=${user.email}`);
            // return res.redirect(303, `${process.env.APP_URL_API}/continue?email=${user.email}`);
        } else {
            return res.status(400).json({ message: 'Something went wrong while verifying the email' });
        }
    } catch (error) {
        console.log('Error:', error.message);
        return res.status(500).json({ message: 'Something went wrong' });
    }
});


module.exports = route;
