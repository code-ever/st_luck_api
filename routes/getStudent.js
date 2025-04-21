const { applicationEmailexist } = require('../Controller/controler');
const db = require('../db/connetDB');
const express = require('express');
const route = express.Router();

route.get("/", async (req, res) => {
    const { email } = req.query;
    try {
        const user = await applicationEmailexist(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid User Details" });
        }
        res.status(200).json({ message: "success", data: user });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


module.exports = route;
