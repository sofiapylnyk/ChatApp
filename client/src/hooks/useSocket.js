import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

/**
 * useSocket - Кастомний хук для керування з'єднанням Socket.IO.
 * * @param {string} url - Базовий URL сервера Socket.IO (наприклад, http://localhost:5000).
 * @param {Function} onNewMessage - Колбек для обробки нових повідомлень (включно з авто-відповідями).
 * @param {Function} onRandomNotification - Колбек для обробки системних нотифікацій про авто-відправку.
 */
const useSocket = (url, onNewMessage, onRandomNotification) => {
    // Використовуємо useRef для зберігання екземпляра socket, щоб він був стабільним
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Запобігаємо повторному підключенню
        if (!url) return; 

        // Ініціалізація socket
        socketRef.current = io(url);
    
        // Обробка підключення та відключення
        socketRef.current.on('connect', () => setIsConnected(true));
        socketRef.current.on('disconnect', () => setIsConnected(false));
        
        // Обробка події "new_message" (від сервера або авто-відповіді)
        socketRef.current.on('new_message', (data) => {
            onNewMessage(data);
        });

        // Обробка глобальної нотифікації про випадкове повідомлення
        socketRef.current.on('random_message_notification', (data) => {
            onRandomNotification(data);
        });

        // Cleanup: відключення сокета при демонтажі компонента
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [url, onNewMessage, onRandomNotification]); // Залежності для коректного оновлення

    /**
     * Надсилає подію на сервер.
     * @param {string} event - Назва події.
     * @param {object} data - Дані, що надсилаються.
     */
    const emit = (event, data) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit(event, data);
        }
    };
    
    /**
     * Дозволяє клієнту приєднатися до "кімнати" чату.
     */
    const joinChat = (chatId) => {
        emit('join_chat', chatId);
    };


    return { isConnected, emit, joinChat };
};

export default useSocket;