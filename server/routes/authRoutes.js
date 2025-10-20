const express = require('express');
const passport = require('passport');
const router = express.Router();

// Приклад для Google-логіну:

// @desc Auth з Google
// @route GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc Google auth callback
// @route GET /auth/google/callback
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Успішна авторизація, редирект на головну сторінку
        res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
    }
);

// @desc Вихід користувача
// @route GET /auth/logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;