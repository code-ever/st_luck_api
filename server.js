const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const path = require('path');  // <-- Missing path import
const registerRouter = require('./routes/route');
const verifyEmail = require('./routes/route');
const continueApp = require('./routes/cotinueApplicationRoute');
const applications = require('./routes/application');
const getstudent = require('./routes/getStudent');
const paystack = require('./helper/paystack');
const paymentDetails = require('./routes/payments');
const password = require('./routes/changepass');
const app = express();

// Middleware setup
app.use(express.static('public'));  // Serve static files
app.use(cors());  // Enable Cross-Origin Request Sharing
app.use(express.json());  // Middleware to parse JSON request bodies

// API routes
app.use('/api/register', registerRouter);
app.use('/api/tokenverify', verifyEmail);
app.use('/api/continueApplication', continueApp);
app.use('/api/application', applications);
app.use('/api/getstd', getstudent);
app.use('/api/paystack', paystack);
app.use('/api/payment', paymentDetails);
app.use('/api/changepassword', password);

// Catch-all route to serve the index.html for your front-end
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export the app as a handler for Vercel's serverless environment
module.exports = app;
