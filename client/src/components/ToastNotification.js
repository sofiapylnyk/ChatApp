import React, { useState, useEffect } from 'react';
import '../styles/Chat.css'; // Стилі для toast-нотифікації

/**
 * ToastNotification - Компонент для спливаючих нотифікацій.
 * @param {string} message - Текст повідомлення.
 * @param {string} type - Тип нотифікації ('success', 'error', 'info', 'warning').
 */
const ToastNotification = ({ message, type = 'info' }) => {
    // Внутрішній стан для керування відображенням
    const [isVisible, setIsVisible] = useState(true); 

    useEffect(() => {
        // Автоматично приховує нотифікацію через 3 секунди (якщо її не приховує батьківський компонент)
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 3000); 

        return () => clearTimeout(timer); // Очищення таймера при демонтажі
    }, [message, type]);
    
    // Якщо батьківський компонент (App.js) керує логікою приховування, цей компонент просто відображається.

    if (!isVisible) return null;

    // Класи для стилізації залежно від типу: toast-info, toast-warning, etc.
    return (
        <div className={`toast-notification toast-${type}`}>
            <p>{message}</p>
            <button onClick={() => setIsVisible(false)} className="toast-close-btn">×</button>
        </div>
    );
};

export default ToastNotification;