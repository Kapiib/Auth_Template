const nodemailer = require('nodemailer');

// Configure nodemailer transporter with different port settings
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS instead of SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false // Helps with some connectivity issues
    }
});

// Send password reset email
const sendResetEmail = async (email, token) => {
    try {
        const resetUrl = `${process.env.APP_URL || 'http://localhost:4000'}/security/reset/${token}`;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@authtemplate.com',
            to: email,
            subject: 'Password Reset',
            html: `
                <h1>Password Reset</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link is valid for 1 hour.</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Reset email sent successfully to: ${email}`);
    } catch (error) {
        console.error(`Error sending reset email: ${error.message}`);
        throw error; // Re-throw to be handled by the controller
    }
};

module.exports = {
    sendResetEmail
};