const mongoose = require('mongoose');

// Схема для окремого повідомлення
const MessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Схема для Чату
const ChatSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    messages: [MessageSchema], // Масив вбудованих документів-повідомлень
    // userId: { // Якщо реалізовано логін, тут має бути посилання на User
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // }
}, {
    // Включаємо createdAt та updatedAt
    timestamps: true 
});

module.exports = mongoose.model('Chat', ChatSchema);