const Chat = require('../models/Chat');
const { getRandomQuote } = require('../services/quoteService'); 
const { io } = require('../server'); // Припускаємо, що Socket.IO експортується з server.js

// ==== CRUD для Чатів ====

/**
 * Отримати всі чати.
 * Фільтрація та пошук можуть бути додані тут, але поки що повертаємо всі.
 */
exports.getAllChats = async (req, res) => {
    // В ідеалі, тут має бути фільтрація за поточним користувачем (якщо реалізовано логін)
    try {
        const chats = await Chat.find().sort({ updatedAt: -1 });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Створити новий чат.
 * Потрібні: firstName, lastName (обидва обов'язкові).
 */
exports.createChat = async (req, res) => {
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
        return res.status(400).json({ message: 'First Name and Last Name are required.' });
    }

    try {
        // Створюємо чат з початковим повідомленням
        const newChat = new Chat({
            firstName,
            lastName,
            messages: []
        });

        const savedChat = await newChat.save();
        res.status(201).json(savedChat);
    } catch (error) {
        res.status(500).json({ message: 'Error creating chat', error: error.message });
    }
};

/**
 * Оновити існуючий чат (зміна імені/прізвища).
 */
exports.updateChat = async (req, res) => {
    const { firstName, lastName } = req.body;

    console.log('PUT request received for ID:', req.params.id);
    console.log('Data to update:', { firstName, lastName });
    
    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName },
            { new: true, runValidators: true }
        );

        if (!updatedChat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.status(200).json(updatedChat);
    } catch (error) {
        console.error('CRITICAL BACKEND ERROR:', error); 
        res.status(500).json({ message: 'Internal Server Error', detail: error.message });
    }
};

/**
 * Видалити існуючий чат.
 */
exports.deleteChat = async (req, res) => {
    try {
        const deletedChat = await Chat.findByIdAndDelete(req.params.id);

        if (!deletedChat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.status(200).json({ message: 'Chat successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting chat', error: error.message });
    }
};


// ==== Логіка повідомлень та авто-відповіді ====

/**
 * Відправка повідомлення користувачем та ініціація авто-відповіді.
 */
exports.sendMessage = async (req, res) => {
    const { chatId, content, sender = 'User' } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Content cannot be empty' });
    }

    try {
        const userMessage = {
            sender: sender, // Наприклад, ім'я користувача
            content: content,
            timestamp: new Date()
        };

        // 1. Зберігаємо повідомлення користувача в DB
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { messages: userMessage } },
            { new: true }
        );

        if (!updatedChat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        
        // 2. Сповіщаємо клієнта, що його повідомлення відправлено (опціонально, але корисно)
        // У цьому місці можна надіслати повідомлення через Socket.IO, щоб оновити UI
        // io.to(chatId).emit('message_received', userMessage);


        // 3. Ініціація автоматичної відповіді через 3 секунди
        setTimeout(async () => {
            const quoteContent = await getRandomQuote();
            
            const autoResponse = {
                sender: 'Alice Freeman', // Або "Bot"
                content: quoteContent,
                timestamp: new Date()
            };
            
            // 4. Зберігаємо авто-відповідь в DB
            const finalChat = await Chat.findByIdAndUpdate(
                chatId,
                { $push: { messages: autoResponse } },
                { new: true }
            );

            // 5. Використовуємо Socket.IO, щоб повідомити клієнт про нову відповідь
            // Це запустить toast notification на клієнті
            // Припускаємо, що io - це об'єкт Socket.IO
            if (io) {
                 io.to(chatId).emit('new_message', { // Надсилаємо в кімнату чату
                     chatId: chatId,
                     message: autoResponse
                 }); 
            } else {
                 console.warn("Socket.IO not initialized on server.");
            }

        }, 3000); // Затримка 3 секунди (3000 мс)
        
        // Відповідь клієнту про те, що повідомлення прийнято та відповідь очікується
        res.status(200).json({ message: 'Message sent, awaiting auto-response in 3 seconds.' });
        
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
};

/**
 * Оновити вміст конкретного повідомлення в масиві чату.
 */
exports.updateMessage = async (req, res) => {
    const { chatId, messageId } = req.params;
    const { content } = req.body;

    try {
        const updatedChat = await Chat.findOneAndUpdate(
            // 1. Знайти чат за ID
            { '_id': chatId, 'messages._id': messageId },
            // 2. Оновити поле 'content' у відповідному елементі масиву 'messages'
            { '$set': { 'messages.$.content': content } },
            { new: true }
        );

        if (!updatedChat) {
            return res.status(404).json({ message: 'Chat or Message not found' });
        }

        res.status(200).json({ 
            message: 'Message updated', 
            chat: updatedChat 
        });
    } catch (error) {
        console.error('Error updating message in DB:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};