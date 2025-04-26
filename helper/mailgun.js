
const FormData = require("form-data");
const Mailgun = require("mailgun.js");
 const DOMAIN  = 'sandbox311754ef79974f2aa4727ade0bc2fd00.mailgun.org';
require('dotenv').config();
const sendMailgun = async(message,email, subject)=> {
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
        username: "api",
        key: process.env.MAILGUN_API_KEY || "",
        // When you have an EU-domain, you must specify the endpoint:
        // url: "https://api.eu.mailgun.net"
    });
    try {
        const data = await mg.messages.create(DOMAIN, {
            from: "Mailgun Sandbox <postmaster@sandbox311754ef79974f2aa4727ade0bc2fd00.mailgun.org>",
            to: email,
            subject:subject,
            text: message
        });
        console.log(data); 
    } catch (error) {
        console.log(error);
    }
}
module.exports = sendMailgun