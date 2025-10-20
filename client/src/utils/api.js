// client/src/utils/api.js
import axios from 'axios';

// Базовий URL для API береться зі змінних середовища React (client/.env)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Створення екземпляра Axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true, // Потрібно, якщо ви реалізуєте Passport.js/сесії
});

// ======================= API-функції для CRUD Чату =======================

/**
 * Отримати всі чати.
 */
export const getChats = async () => {
    try {
        const response = await api.get('/chats');
        return response.data;
    } catch (error) {
        console.error("Error fetching chats:", error);
        throw error;
    }
};

/**
 * Створити новий чат.
 */
export const createChat = async (chatData) => {
    try {
        const response = await api.post('/chats', chatData);
        return response.data;
    } catch (error) {
        console.error("Error creating chat:", error);
        throw error;
    }
};

/**
 * Оновити існуючий чат (ім'я/прізвище).
 */
export const updateChat = async (chatId, chatData) => {
    try {
        const response = await api.put(`/chats/${chatId}`, chatData);
        return response.data;
    } catch (error) {
        console.error("Error updating chat:", error);
        throw error;
    }
};

/**
 * Видалити чат.
 */
export const deleteChat = async (chatId) => {
    try {
        await api.delete(`/chats/${chatId}`);
        return chatId;
    } catch (error) {
        console.error("Error deleting chat:", error);
        throw error;
    }
};

// ======================= API-функції для Повідомлень =======================

/**
 * Відправити повідомлення користувачем.
 * Цей запит ініціює на Backend 3-секундний таймер для авто-відповіді.
 */
export const sendMessage = async (chatId, content, senderName = 'You') => {
    try {
        // У цьому запиті ми не очікуємо саму відповідь, лише підтвердження прийому
        const response = await api.post('/chats/send', { chatId, content, sender: senderName });
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

// ======================= API-функції для Аутентифікації =======================

/**
 * Перевірити статус логіну користувача (корисно при старті App).
 */
export const getAuthStatus = async () => {
    try {
        // Цей роут має бути реалізований на BE, щоб повернути поточного користувача
        const response = await api.get('/auth/status'); 
        return response.data;
    } catch (error) {
        // Користувач не залогінений або помилка
        return null;
    }
};

/**
 * Оновити вміст повідомлення у чаті.
 */
export const updateMessage = async (chatId, messageId, newContent) => {
    try {
        const response = await api.put(`/chats/${chatId}/messages/${messageId}`, { 
            content: newContent 
        });
        return response.data;
    } catch (error) {
        console.error("Error updating message:", error);
        throw error;
    }
};