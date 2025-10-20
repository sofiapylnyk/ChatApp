const axios = require('axios');

const QUOTABLE_API_URL = 'https://api.quotable.io/random';

/**
 * Отримує випадкову цитату з API Quotable.
 * @returns {Promise<string>} Повідомлення у форматі "Content" - Author.
 */
exports.getRandomQuote = async () => {
    try {
        const response = await axios.get(QUOTABLE_API_URL, {
            // Можемо обмежити довжину, якщо потрібно
            params: { maxLength: 200 }
        });
        
        const { content, author } = response.data;
        return `"${content}" - ${author}`;
    } catch (error) {
        console.error('Error fetching quote from Quotable:', error.message);
        // Повертаємо дефолтну відповідь у разі помилки
        return 'I am currently busy. Please leave a message.'; 
    }
};