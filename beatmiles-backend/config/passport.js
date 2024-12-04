// backend/config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/user');

module.exports = function (passport) {
    // Serialize and Deserialize
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });

    // Local Strategy
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) return done(null, false, { message: 'Incorrect email.' });
            const isMatch = await user.comparePassword(password);
            if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID, // Replace with your Google Client ID
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Replace with your Google Client Secret
        callbackURL: "/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = new User({
                    googleId: profile.id,
                    email: profile.emails[0].value
                });
                await user.save();
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

    // Facebook Strategy
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID, // Replace with your Facebook Client ID
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET, // Replace with your Facebook Client Secret
        callbackURL: "/auth/facebook/callback",
        profileFields: ['id', 'emails', 'name']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ facebookId: profile.id });
            if (!user) {
                user = new User({
                    facebookId: profile.id,
                    email: profile.emails ? profile.emails[0].value : undefined
                });
                await user.save();
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

    // GitHub Strategy
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID, // Replace with your GitHub Client ID
        clientSecret: process.env.GITHUB_CLIENT_SECRET, // Replace with your GitHub Client Secret
        callbackURL: "/auth/github/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ githubId: profile.id });
            if (!user) {
                user = new User({
                    githubId: profile.id,
                    email: profile.emails ? profile.emails[0].value : undefined
                });
                await user.save();
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
};

