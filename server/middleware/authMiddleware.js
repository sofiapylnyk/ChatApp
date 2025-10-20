/**
 * Middleware для захисту роутів.
 * Перевіряє, чи користувач автентифікований (увійшов у систему).
 */
exports.protect = (req, res, next) => {
    // passport.js додає функцію isAuthenticated() до об'єкта req
    if (req.isAuthenticated()) {
        return next(); // Користувач автентифікований, продовжуємо
    }
    // Якщо ні, перенаправляємо на сторінку логіну або відхиляємо запит
    res.status(401).json({ message: 'Not authorized, please log in.' });
    // Або res.redirect('/login');
};