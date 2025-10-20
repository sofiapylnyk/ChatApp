const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
// const { protect } = require('../middleware/authMiddleware'); // Припустимо, що є middleware для захисту

// CRUD-операції
router.route('/')
    .get(chatController.getAllChats) // Отримати всі чати
    .post(chatController.createChat); // Створити новий чат

router.route('/:id')
    .put(chatController.updateChat) // Оновити існуючий чат
    .delete(chatController.deleteChat); // Видалити чат

// Відправка повідомлення (ініціює авто-відповідь)
router.post('/send', chatController.sendMessage)
router.put('/:chatId/messages/:messageId', chatController.updateMessage);;

module.exports = router;