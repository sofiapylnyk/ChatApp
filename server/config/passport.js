const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User'); // Ваша модель користувача

/**
 * Функція конфігурації Passport.js.
 * Вона отримує екземпляр Passport для налаштування стратегій.
 */
module.exports = function (passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID, // Змінна з .env
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
                passReqToCallback: true 
            },
            async (request, accessToken, refreshToken, profile, done) => {
                // Цей колбек виконується після того, як Google повертає дані користувача
                
                const newUser = {
                    providerId: profile.id,
                    provider: 'google',
                    displayName: profile.displayName,
                    // Google може повернути кілька адрес, беремо першу
                    email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null 
                };

                try {
                    // 1. Шукаємо користувача в нашій DB за Google ID
                    let user = await User.findOne({ providerId: profile.id });

                    if (user) {
                        // Якщо користувач знайдений, повертаємо його
                        done(null, user);
                    } else {
                        // Якщо користувача немає, створюємо нового
                        user = await User.create(newUser);
                        done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                    done(err, null);
                }
            }
        )
    );

    // Логіка серіалізації: Зберігаємо ID користувача в сесії (у cookie)
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Логіка десеріалізації: Використовуємо ID з сесії, щоб знайти користувача в DB
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};