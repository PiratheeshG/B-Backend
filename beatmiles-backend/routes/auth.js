// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register Route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists.' });
        user = new User({ email, password });
        await user.save();
        res.status(201).json({ message: 'Registration successful.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Login Route
router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return res.status(500).json({ message: 'Server error.' });
        if (!user) return res.status(400).json({ message: info.message });
        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Replace JWT_SECRET
        res.json({ token, message: 'Login successful.' });
    })(req, res, next);
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login.html' }), (req, res) => {
    // Successful authentication, redirect with token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Replace JWT_SECRET
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth-success.html?token=${token}`); // Replace FRONTEND_URL
});

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login.html' }), (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Replace JWT_SECRET
    res.redirect(`${process.env.FRONTEND_URL}/auth-success.html?token=${token}`); // Replace FRONTEND_URL
});

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login.html' }), (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Replace JWT_SECRET
    res.redirect(`${process.env.FRONTEND_URL}/auth-success.html?token=${token}`); // Replace FRONTEND_URL
});

module.exports = router;

