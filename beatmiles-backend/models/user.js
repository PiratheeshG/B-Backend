// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null entries
    },
    password: String,
    googleId: String,
    facebookId: String,
    githubId: String,
    workouts: [
        {
            date: Date,
            type: String,
            duration: Number,
            distance: Number,
            avgSpeed: Number,
            avgHeartRate: Number,
            calories: Number
        }
    ]
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

// Compare password
UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);


