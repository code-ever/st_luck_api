const FormData = require("form-data");
const Mailgun = require("mailgun.js");
require('dotenv').config();

const DOMAIN = 'sandbox311754ef79974f2aa4727ade0bc2fd00.mailgun.org';  
const API_KEY = process.env.MAILGUN_API_KEY; 

const sendMailgun = async (message, email, subject) => {
    if (!API_KEY) {
        throw new Error("MAILGUN_API_KEY is missing in the environment variables");
    }

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
        username: "api",
        key: API_KEY,
        // You can uncomment the `url` line if you're using an EU domain for Mailgun
        // url: "https://api.eu.mailgun.net"
    });

    try {
        const data = await mg.messages.create(DOMAIN, {
            from: "Mailgun Sandbox <postmaster@sandbox311754ef79974f2aa4727ade0bc2fd00.mailgun.org>",
            to: email,          
            subject: subject,  
            text: message       
        });

        // Log the result for debugging (you can remove this in production)
        console.log("Email sent successfully:", data);
        return data; 
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;  
    }
};

module.exports = sendMailgun;


module.exports = sendMailgun