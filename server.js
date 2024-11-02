const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Your email from the .env file
        pass: process.env.EMAIL_PASS   // Your app password from the .env file
    }
});

// POST route to send email
app.post('/send-email', (req, res) => {
    const { fullname, emailaddress, message } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailaddress, // You can also set this to a specific email
        subject: `RSVP Confirmation from ${fullname}`,
        text: `Thank you, ${fullname}, for your RSVP!\n\nMessage: ${message}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            return res.status(200).send('Email sent successfully');
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
