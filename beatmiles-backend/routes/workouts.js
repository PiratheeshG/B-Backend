// backend/routes/workouts.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to verify JWT
const authenticate = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token provided.' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace JWT_SECRET
        req.user = await User.findById(decoded.id);
        if (!req.user) throw new Error();
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Get Workouts
router.get('/', authenticate, (req, res) => {
    res.json(req.user.workouts);
});

// Add Workout
router.post('/', authenticate, async (req, res) => {
    const workout = req.body;
    try {
        req.user.workouts.push(workout);
        await req.user.save();
        res.status(201).json({ message: 'Workout added.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Update Workout
router.put('/:index', authenticate, async (req, res) => {
    const index = parseInt(req.params.index);
    const workout = req.body;
    try {
        if (index < 0 || index >= req.user.workouts.length) throw new Error();
        req.user.workouts[index] = workout;
        await req.user.save();
        res.json({ message: 'Workout updated.' });
    } catch (err) {
        res.status(400).json({ message: 'Invalid index.' });
    }
});

// Delete Workout
router.delete('/:index', authenticate, async (req, res) => {
    const index = parseInt(req.params.index);
    try {
        if (index < 0 || index >= req.user.workouts.length) throw new Error();
        req.user.workouts.splice(index, 1);
        await req.user.save();
        res.json({ message: 'Workout deleted.' });
    } catch (err) {
        res.status(400).json({ message: 'Invalid index.' });
    }
});

module.exports = router;

