const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const registerRouter = require('./routes/route');
const students = require('./routes/route');
const verifyEmail = require('./routes/route');
const continueApp = require('./routes/cotinueApplicationRoute');
const applications = require('./routes/application');
const getstudent = require('./routes/getStudent');
const paystack = require('./helper/paystack');
const paymentDetails = require('./routes/payments');
const password = require('./routes/changepass');
const app = express();
app.use(express.static('public'))
// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON request bodies

// Register the router on the correct endpoint
app.use('/api/register', registerRouter); // Use app.use() instead of app.post()
// app.use('/api/students', students);
app.use('/api/tokenverify', verifyEmail);
//login to continue route
app.use('/api/continueApplication', continueApp); // Continue application route (fixed typo here)
app.use('/api/application', applications)
app.use('/api/getstd', getstudent)
app.use('/api/paystack', paystack)
app.use('/api/payment', paymentDetails)
app.use('/api/changepassword', password)

const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log("Running on port " + port);
});
