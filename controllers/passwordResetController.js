const User = require('../models/User');
const crypto = require('crypto');
const argon2 = require('argon2');
const { sendResetEmail } = require('../utils/resetPasswordUtil');

const passwordResetController = {
    // Render the request password reset page
    showRequestForm: (req, res) => {
        res.render('security/reset/request', {
            title: 'Reset Password',
            error: null
        });
    },

    // Process the request for password reset
    requestReset: async (req, res) => {
        try {
            const { email } = req.body;
            
            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                console.log(`Password reset failed: User not found - ${email}`);
                return res.render('security/reset/request', {
                    title: 'Reset Password',
                    error: 'If a user with that email exists, a reset link has been sent'
                });
            }
            
            // Generate token and expiry
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
            
            // Save token to user document
            user.resetToken = resetToken;
            user.resetTokenExpiry = resetTokenExpiry;
            await user.save();
            
            // Send email with reset link
            await sendResetEmail(user.email, resetToken);
            
            console.log(`Password reset requested for: ${email}`);
            
            // Don't reveal if user exists for security
            return res.render('security/reset/confirmation', {
                title: 'Reset Email Sent',
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
            
        } catch (error) {
            console.error(`Password reset request error: ${error.message}`, error);
            return res.status(500).render('security/reset/request', {
                title: 'Reset Password',
                error: 'Server error, please try again'
            });
        }
    },
    
    // Render the reset password form
    showResetForm: async (req, res) => {
        try {
            const { token } = req.params;
            
            // Find user with valid token
            const user = await User.findOne({ 
                resetToken: token,
                resetTokenExpiry: { $gt: Date.now() }
            });
            
            if (!user) {
                console.log('Password reset failed: Invalid or expired token');
                return res.render('error', {
                    title: 'Invalid Token',
                    message: 'Password reset token is invalid or has expired'
                });
            }
            
            // Render the reset form
            return res.render('security/reset/reset', {
                title: 'Set New Password',
                token,
                error: null
            });
            
        } catch (error) {
            console.error(`Show reset form error: ${error.message}`, error);
            return res.status(500).render('error', {
                title: 'Server Error',
                message: 'An error occurred. Please try again.'
            });
        }
    },
    
    // Process the password reset
    resetPassword: async (req, res) => {
        try {
            const { token } = req.params;
            const { password, confirmPassword } = req.body;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                return res.render('security/reset/reset', {
                    title: 'Set New Password',
                    token,
                    error: 'Passwords do not match'
                });
            }
            
            // Validate password length
            if (password.length < 6) {
                return res.render('security/reset/reset', {
                    title: 'Set New Password',
                    token,
                    error: 'Password must be at least 6 characters'
                });
            }
            
            // Find user with valid token
            const user = await User.findOne({ 
                resetToken: token,
                resetTokenExpiry: { $gt: Date.now() }
            });
            
            if (!user) {
                console.log('Password reset failed: Invalid or expired token');
                return res.render('error', {
                    title: 'Invalid Token',
                    message: 'Password reset token is invalid or has expired'
                });
            }
            
            // Update password
            const hashedPassword = await argon2.hash(password);
            user.password = hashedPassword;
            user.resetToken = undefined;
            user.resetTokenExpiry = undefined;
            await user.save();
            
            console.log(`Password reset successful for: ${user.email}`);
            
            return res.render('security/reset/success', {
                title: 'Password Reset',
                message: 'Your password has been updated successfully. You can now log in with your new password.'
            });
            
        } catch (error) {
            console.error(`Password reset error: ${error.message}`, error);
            return res.status(500).render('error', {
                title: 'Server Error',
                message: 'An error occurred. Please try again.'
            });
        }
    }
};

module.exports = passwordResetController;