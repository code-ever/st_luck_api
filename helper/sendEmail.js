const nodemailer = require('nodemailer')

const { SMTP_MAIL, SMTP_PASSWORD } = process.env

const sendEmail = async (email, subjectEmail, content) => {
    try {
        const transport = nodemailer.createTransport({
            // host: 'smtp.stackmail.com',
            host:'smtp.gmail.com',
             port: 587,
            // port:465,
            secure: false,
            requireTLS: true,
            auth: {
                user: SMTP_MAIL,
                pass: SMTP_PASSWORD
            }
        })

        const mailOption = {
            from: SMTP_MAIL,
            to: email,
            subject: subjectEmail,
            html: content
        }
        transport.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error)
            } else {
                console.log('Email send successfuly', info.response)
            }
        })

    } catch (error) {
        console.log(error.message)
    }
}
module.exports = sendEmail