const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        // Only required if not using OAuth
        required: function() {
            return !this.authProviders || this.authProviders.length === 0;
        }
    },
    // For OAuth providers like Google
    authProviders: [{
        provider: String,  // 'google', 'github', etc.
        providerId: String // The ID from the provider
    }],
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    resetToken: String,
    resetTokenExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;