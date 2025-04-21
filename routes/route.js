const db = require('../db/connetDB');
const express = require('express');
const bcryptjs = require('bcryptjs');
const { emailExist, Register, updateUser, getUserByToken, verifyEmail } = require('../Controller/controler');  // Ensure correct path to the file
const randomstring = require('randomstring');
const sendEmail = require('../helper/sendEmail');
const route = express.Router();
const upload =  require('../routes/uploading/fileupload')

// Register route to handle file upload and user registration
route.post("/", upload.single('passport'), async (req, res) => {  // 'passport' is the field name from your front-end
    const { fullname, dob, gender, so, nationality, lga, address, number, password, email } = req.body;
    console.log(req.body)
    // Check if any required fields are missing
    if (!fullname || !dob || !gender || !so || !nationality || !lga || !address || !number || !password || !email || !req.file) {
        return res.status(401).json({ message: 'Please fill in all the fields including passport image' });
    }

    try {
        // Check if email already exists
        const emailEx = await emailExist(email);
        if (emailEx) {
            return res.status(401).json({ message: 'E-mail already exists' });
        }

        // Generate a random password and hash it
       // const password = randomstring.generate();
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Register the user in the database
        const resultSave = await Register(fullname, dob, gender, so, nationality, lga, address, number, email, hashedPassword, req.file.filename);  // Save passport file name

        if (resultSave) {
            // Generate a random token for email verification
            const randomToken = randomstring.generate();
            const subjectEmail = 'Mail Verification';
            const content = `<p>Hi ${fullname}, Please <a href="http://localhost:8080/api/tokenverify?is_verify=${randomToken}">verify</a> your email.<br />Your password is: ${password}</p>`;

            // Send email with verification link
            sendEmail(email, subjectEmail, content);

            // Update user with the verification token
            const updateToken = await updateUser(randomToken, email);

            // Respond with success message
            return res.status(200).json({ message: "Registration Successful. Please check your email for verification." });
        } else {
            return res.status(500).json({ message: 'Failed to register user' });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Something went wrong during registration' });
    }
});


//get users
// route.get("/", async (req, res) => {
//     const email = req.query.email;  // Access email from query string
//     try {
//         const user = await getUser(email);  // Assuming emailExist is an async function
//         if (user) {
//             res.status(200).json({ message: user });  // Respond with user data
//         } else {
//             return res.status(404).json({ message: 'User not found' });
//         }
//     } catch (error) {
//         console.log(error.message);  // Log the error for debugging
//         return res.status(500).json({ message: 'Something went wrong', error });
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
