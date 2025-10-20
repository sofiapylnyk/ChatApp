const Chat = require('../models/Chat');
const { getRandomQuote } = require('./quoteService');

let ioInstance = null;
let autoSendInterval = null; // Змінна для зберігання інтервалу
let isAutoSendingEnabled = false;

/**
 * Ініціалізує Socket.IO та обробляє підключення.
 * @param {object} io - Екземпляр Socket.Server.
 */
exports.initializeSocket = (io) => {
    ioInstance = io;

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        // Приєднання до кімнат чатів (для отримання сповіщень)
        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
            console.log(`Client ${socket.id} joined chat room: ${chatId}`);
        });

        // Керування станом автоматичного надсилання
        socket.on('toggle_auto_send', (enable) => {
            if (enable && !isAutoSendingEnabled) {
                startAutoSend();
                socket.emit('auto_send_status', true);
            } else if (!enable && isAutoSendingEnabled) {
                stopAutoSend();
                socket.emit('auto_send_status', false);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};

/**
 * Запускає автоматичне надсилання повідомлень у випадкові чати кожні 15 секунд.
 */
const startAutoSend = () => {
    isAutoSendingEnabled = true;
    console.log('Auto sending feature enabled.');

    autoSendInterval = setInterval(async () => {
        try {
            const chats = await Chat.find({});
            if (chats.length === 0) return;

            // Вибираємо випадковий чат
            const randomChat = chats[Math.floor(Math.random() * chats.length)];
            const quoteContent = await getRandomQuote();
            
            const randomMessage = {
                sender: 'System Bot', 
                content: `(Auto-send) ${quoteContent}`,
                timestamp: new Date()
            };

            // 1. Зберігаємо повідомлення в DB
            await Chat.findByIdAndUpdate(
                randomChat._id,
                { $push: { messages: randomMessage } }
            );

            // 2. Сповіщаємо всі клієнти про нове повідомлення в цьому чаті
            ioInstance.to(randomChat._id.toString()).emit('new_message', {
                chatId: randomChat._id.toString(),
                message: randomMessage
            });

            // 3. Надсилаємо глобальну нотифікацію про те, що авто-повідомлення було відправлено
            ioInstance.emit('random_message_notification', {
                firstName: randomChat.firstName,
                lastName: randomChat.lastName
            });
            
            console.log(`Auto message sent to ${randomChat.firstName} ${randomChat.lastName}`);

        } catch (error) {
            console.error('Error during auto-send interval:', error.message);
        }
    }, 15000); // Кожні 15 секунд
};

/**
 * Зупиняє автоматичне надсилання повідомлень.
 */
const stopAutoSend = () => {
    if (autoSendInterval) {
        clearInterval(autoSendInterval);
        autoSendInterval = null;
        isAutoSendingEnabled = false;
        console.log('Auto sending feature disabled.');
    }
};

/**
 * Експортуємо екземпляр io, щоб використовувати його в контролерах.
 */
exports.getIO = () => ioInstance;