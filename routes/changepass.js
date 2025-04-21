const db = require("../db/connetDB");
const express = require("express");
const { changepassword } = require('../Controller/controler')
const route = express.Router();
route.post("/", async (req, res) => {
    const { oldpassword, newpassword, email } = req.body 
    if (!oldpassword || !newpassword || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const user = await changepassword(email, oldpassword, newpassword);
        if (user) {
            return res.status(200).json({ message: 'Password changed successfully' });
        } else {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
   
})
module.exports = route