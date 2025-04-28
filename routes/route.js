const db = require('../db/connetDB');
const express = require('express');
const {getUserByToken, verifyEmail } = require('../Controller/controler');
const route = express.Router();
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
        } else {
            return res.status(400).json({ message: 'Something went wrong while verifying the email' });
        }
    } catch (error) {
        console.log('Error:', error.message);
        return res.status(500).json({ message: 'Something went wrong' });
    }
});






module.exports = route;
