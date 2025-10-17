const mongoose = require('mongoose');

// Функція для підключення до бази даних
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Опції для уникнення попереджень 
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Вихід з процесу з кодом помилки
        process.exit(1);
    }
};

module.exports = connectDB;