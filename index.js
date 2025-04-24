const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const registerRouter = require('./routes/route');
const registerRout = require('./routes/registerRout')
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
app.use(express.json());


app.use('/api/register', registerRouter);
// app.use('/api/students', students);
app.use('/api/tokenverify', verifyEmail);
//login to continue route
app.use('/api/continueApplication', continueApp);
app.use('/api/application', applications)
app.use('/api/getstd', getstudent)
app.use('/api/paystack', paystack)
app.use('/api/payment', paymentDetails)
app.use('/api/changepassword', password)

app.use('/api/registerRout', registerRout)

const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log("Running on port " + port);
});

app.use('/test', (req, res) => {
    res.send('working......')
})