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
            
            // Create JWT payload with all required fields
            const payload = {
                id: user._id,           // Ensure ID is included
                userId: user._id,       // Keeping for backward compatibility
                name: user.name,        // Include name
                email: user.email,      // Include email
                role: user.role         // Include role
            }

            // Generate token and set cookie
            const token = createToken(payload);

            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
            
            console.log(`User logged in successfully: ${user.name} (${user.email}) with role: ${user.role}`);
            
            // Redirect based on role
            if (user.role === 'admin') {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/profile');
            }
            
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

module.exports = authController;