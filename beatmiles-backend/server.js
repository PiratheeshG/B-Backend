// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL, // Replace with your frontend URL
    credentials: true
}));
app.use(session({
    secret: process.env.JWT_SECRET, // Replace with your JWT secret
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport config
require('./config/passport')(passport);

// Routes
app.use('/auth', authRoutes);
app.use('/workouts', workoutRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { // Replace with your MongoDB URI
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected.');
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

