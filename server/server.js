const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const connectDB = require('./config/db');
const socketService = require('./services/socketService');

// Завантаження змінних середовища
dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 3000;

// Підключення до бази даних
connectDB();

const app = express();
const server = http.createServer(app);

// Ініціалізація Socket.IO
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"]
    }
});
// Ініціалізація Socket Service з об'єктом io
socketService.initializeSocket(io);

// Експортуємо io, щоб контролери могли надсилати повідомлення
exports.io = io; 

// Middleware
app.use(cors({
    origin: CLIENT_URL,
    credentials: true 
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// ==== Passport/Auth (потрібна додаткова конфігурація) ====
const passport = require('passport');
const session = require('express-session');
require('./config/passport')(passport); // Конфігурація Google Strategy
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


// Роути
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/auth', require('./routes/authRoutes'));

//app.get('/', (req, res) => res.send('API is running...'));


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// У продакшн-режимі 
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
    });
} else {
    app.get('/', (req, res) => res.send('API is running in development mode...'));
}