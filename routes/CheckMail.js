const express = require('express');
const route = express.Router();
const sendMailgun = require('../helper/mailgun'); 

route.post("/", async (req, res) => {
    const { email, content, subjectEmail } = req.body;

    if (!email || !content || !subjectEmail) {
        return res.status(400).json({ message: 'Missing required fields: email, message, or subject.' });
    }

    try {
        const result = await sendMailgun(content, email, subjectEmail);
        return res.status(200).json({ message: 'Mail sent successfully', result });
    } catch (error) {
    
        return res.status(500).json({ message: 'Failed to send mail', error: error.message });
    }
});

module.exports = route;

module.exports = route