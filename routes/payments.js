const { getTransaction } = require('../Controller/controler');
const db = require('../db/connetDB');
const express = require('express');
const route = express.Router();

route.get("/", async (req, res) => {
    const { email } = req.query; // Make sure you're getting the email from query params or body correctly.
    try {
        const user = await getTransaction(email);

        if (!user || user.length === 0) {
            return res.status(400).json({ message: 'No Payment found' }); // Use valid status code 400
        }

        return res.status(200).json({ message: 'Success', data: user }); // Use valid status code 200 for success
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error in fetching payments' }); // Use 500 for server error
    }
});

module.exports = route;
