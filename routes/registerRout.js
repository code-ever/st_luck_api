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
                { resource_type: 'auto', folder: 'profiles', timeout: 170000 },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result);
                }
            ).end(req.file.buffer);
        });

        const secure_url = uploadResult.secure_url;

        // Hash password
        const hashed = await bcryptjs.hash(password, 10);

        // Save data to the database
        const saveData = await Register(fullname, dob, gender, so, nationality, lga, address, number, email, hashed, secure_url);
        if (!saveData) {
            return res.status(400).json({ message: "Registration failed. Please try again." });
        }

        // Send verification email
        const randomToken = randomstring.generate();
        const subjectEmail = 'Verify Registration';
        const content = `<p>Hi ${fullname}, Please <a href="${process.env.APP_URL_API}/tokenverify?is_verify=${randomToken}">verify</a> your email.<br />Your password is: ${password}</p>`;

        // Send email using your helper function (Note: this part might fail due to the sandbox domain)
        const emailResult = await sendEmail(email, subjectEmail, content);
        if (!emailResult) {
            // Rollback if email fails (important to avoid inconsistent state)
            await updateUser(randomToken, email);
            return res.status(500).json({ message: 'Failed to send verification email.' });
        }

        // Send email using Mailgun
        const mailgunResult = await sendMailgun(message = 'message', email, subject = 'testing email');
        if (!mailgunResult) {
            return res.status(500).json({ message: 'Failed to send email through Mailgun.' });
        }

        // Update user with token (this can also be part of rollback if needed)
        await updateUser(randomToken, email);

        // Return successful registration
        return res.status(200).json({ message: "Registration Successful. Please check your email for verification.", data: saveData });

    } catch (error) {
        console.error("Error: ", error);
        // Ensure a single response is sent, even if an error happens
        if (!res.headersSent) {
            return res.status(500).json({
                message: 'Something went wrong',
                error: error.message
            });
        }
    }
});

// route.get("/", async (req, res) => {
//     const {email} = req.body
//     try {
//         const students = await getUser(email);

//         if (!students) {
//             return res.status(400).json({ message: 'No student found' });
//         }
//         return res.status(200).json({ message: 'Student found', data: students });
        
//     } catch (error) {
//         res.status(500).json({ message: 'Something went wrong', error: error.message });
//     }
// });


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
