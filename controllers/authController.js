const User = require('../models/User');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { createToken } = require('../utils/jwtUtils');

const authController = {
    register: async (req, res) => {
        try {
            const { name, email, password, confirmPassword } = req.body;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                console.log(`Registration failed: Passwords don't match for ${email}`);
                return res.status(400).render('register', {
                    title: 'Register',
                    error: 'Passwords do not match',
                });
            }
            
            // Validate password length
            if (password.length < 6) {
                console.log(`Registration failed: Password too short for ${email}`);
                return res.status(400).render('register', {
                    title: 'Register',
                    error: 'Password must be at least 6 characters',
                });
            }
            
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log(`Registration failed: Email already exists - ${email}`);
                return res.render('register', {
                    title: 'Register',
                    error: 'Email already registered'
                });
            }
            
            // Hash password and create user
            const hashedPassword = await argon2.hash(password);
            
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                role: 'user'
            });
            
            await newUser.save();
            console.log(`User registered successfully: ${name} (${email})`);
            
            res.redirect('/auth/login');
        } catch (error) {
            console.error(`Registration error: ${error.message}`, error);
            res.status(500).render('register', {
                title: 'Register',
                error: 'Server error, please try again',
            });
        }
    },
    
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                console.log(`Login failed: User not found - ${email}`);
                return res.render('login', {
                    title: 'Login',
                    error: 'Invalid email or password'
                });
            }
            
            // Verify password
            const isMatch = await argon2.verify(user.password, password);
            if (!isMatch) {
                console.log(`Login failed: Invalid password for ${email}`);
                return res.render('login', {
                    title: 'Login',
                    error: 'Invalid email or password'
                });
            }
            
            // After successful verification
            const redirectUrl = await handleSuccessfulAuth(user, res);
            return res.redirect(redirectUrl);
            
        } catch (error) {
            console.error(`Login error: ${error.message}`, error);
            res.status(500).render('login', {
                title: 'Login',
                error: 'Server error, please try again'
            });
        }
    },
    
    logout: (req, res) => {
        const user = req.user;
        if (user) {
            console.log(`User logged out: ${user.name} (${user.email})`);
        } else {
            console.log('Logout: No active user session');
        }
        
        res.clearCookie('jwt');
        return res.redirect("/");
    }
}

// Add this function to your existing authController

// This function handles what happens after successful authentication
// regardless of authentication method
const handleSuccessfulAuth = async (user, res) => {
    // Create JWT payload
    const payload = {
        id: user._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    };
    
    // Generate and set token
    const token = createToken(payload);
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    
    console.log(`User authenticated: ${user.name} (${user.email})`);
    
    // Return the redirect URL based on role
    return user.role === 'admin' ? '/admin/dashboard' : '/profile';
};

module.exports = authController;