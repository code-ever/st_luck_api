
const express = require('express')
const route = express.Router();
const axios = require('axios')
const { savePayment } = require('../Controller/controler')

route.post("/", async (req, res) => {
    res.setHeader('Content-Security-Policy', "script-src 'self' https://checkout.paystack.com https://www.googletagmanager.com;");
    const { email, amount } = req.body;

    // Construct the payload for Paystack
    const payload = {
        email: email,
        amount: amount * 100,  // Convert amount to kobo
        currency: 'NGN',
        reference: Math.random().toString(36).substring(7)  // Generate a random reference (for testing)
    };

    try {
        // Send request to Paystack API
        const response = await axios.post('https://api.paystack.co/transaction/initialize', payload, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`  // Paystack secret key from environment
            }
        });

        // console.log('Paystack Response:', response.data);  // Log Paystack response
        //console.log(response)
        if (response.data.status === true) {
            res.json({
                status: 'success',
                reference: response.data.data.reference,  // Send the reference to the frontend
            });
        } else {
            res.status(400).json({ status: 'error', message: 'Payment initialization failed' });
        }
    } catch (error) {
        console.error('Error initializing payment:', error);
        res.status(500).json({ status: 'error', message: 'Something went wrong with Paystack API' });
    }
});


route.post("/verify-payment", async (req, res) => {

    const { email, amount, reference, purposeId } = req.body;
    const purposeIds = {
        "AF": "Application Fee",
        [purposeId]: purposeId
    }

    const purpose = purposeIds[purposeId];

    if (!reference) {
        return res.status(400).json({ status: 'error', message: 'Reference is required' });
    }
    try {
        const resp = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });
        const chaneel = resp.data.data.channel
        const status = resp.data.data.status

        if (resp.data.status == true && resp.data.data.status == 'success') {
            // const saveP = savePayment(email, amount, reference, purpose)

            const saveP = savePayment(email, amount, reference, purpose, status, chaneel)
            // console.log()
            if (saveP) {
                res.status(200).json({ status: 'success', message: 'Payment successful', details: resp.data });
            }
        } else {
            res.status(400).json({ status: 'error', message: 'Payment verification failed', details: resp.data });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error verifying payment' });
    }

})
module.exports = route