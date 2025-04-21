const db = require('../db/connetDB');
const express = require('express');
const bcryptjs = require('bcryptjs');
const route = express.Router();
const { emailExist } = require('../Controller/controler')
const jwt = require('jsonwebtoken')
const sendEmail = require('../helper/sendEmail');

route.post("/", async (req, res) => {
    const { email, password } = req.body
    try {
        //check field
        if (!email || !password) {
            res.status(400).json({ message: "filed cant be empty" })
        }

        //check user exist
        const user = await emailExist(email)
        if (!user) {
            res.status(400).json({ message: 'Invalide User' })
        }
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Email not verified' });
        }

        //compare password
        const isMatch = await bcryptjs.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid User Details" });
        }
        payload = {
            id: user.id,
            email: user.email,
            fullname: user.fullname,
            admission: user.is_admitted
        }

        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' })
        res.status(200).json({ message: 'Login successfull', token: token,user:user })


    } catch (error) {

    }

})


module.exports = route