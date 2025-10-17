const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // ID, наданий стороннім провайдером (Google/Facebook)
    providerId: {
        type: String,
        required: true,
        unique: true
    },
    // Назва провайдера ('google', 'facebook')
    provider: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true // Дозволяє null-значенням не бути унікальними
    },
    // Інші поля, якщо потрібні (аватар, токени і т.д.)
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);