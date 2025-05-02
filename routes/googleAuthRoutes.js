const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { createToken } = require('../utils/jwtUtils');

// Create OAuth client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/auth/google/callback`
);

// Google login initiation
router.get('/google', (req, res) => {
  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    include_granted_scopes: true
  });
  res.redirect(authorizeUrl);
});

// Google callback
router.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await client.getToken(code);
    
    // Get user info
    client.setCredentials(tokens);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    // Find or create user
    let user = await User.findOne({ 
      'authProviders.provider': 'google',
      'authProviders.providerId': payload.sub 
    });
    
    if (!user) {
      // Check if user exists with same email
      user = await User.findOne({ email: payload.email });
      
      if (user) {
        // Link Google account to existing user
        user.authProviders.push({
          provider: 'google',
          providerId: payload.sub
        });
      } else {
        // Create new user
        user = new User({
          name: payload.name,
          email: payload.email,
          authProviders: [{
            provider: 'google',
            providerId: payload.sub
          }],
          role: 'user'
        });
      }
      
      await user.save();
    }
    
    // Create JWT
    const jwtPayload = {
      id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
    
    const token = createToken(jwtPayload);
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.redirect('/profile');
  } catch (error) {
    console.error('Google auth error:', error);
    res.redirect('/auth/login');
  }
});

module.exports = router;