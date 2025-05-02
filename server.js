const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/dbConfig');
const checkJWT = require('./middleware/checkJWT');
const authRoutes = require('./routes/authRoutes');
const getRoutes = require('./routes/getRoutes');
const { checkAuth } = require('./middleware/checkAuth');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Apply JWT check to all routes
app.use(checkJWT);

// Routes
app.use('/', getRoutes);
app.use('/auth', authRoutes);
app.use('/auth', googleAuthRoutes);
app.use('/security/reset', passwordResetRoutes); // Changed from '/password-reset'

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});