const db = require('../db/connetDB');
const express = require('express');
const route = express.Router();
const sendMailgun = require('../helper/mailgun') 

route.post("/", async (req, res) => {
    const { email, message, subject } = req.body
    try {
        const mail = await sendMailgun(message, email, subject)
        if (mail) {
           return res.status(200).json({ message:'mail send' })
        }
    } catch (error) {
        res.status(400).json({message:error})
    }
    
})
module.exports = route