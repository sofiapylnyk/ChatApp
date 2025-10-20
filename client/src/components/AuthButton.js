import React from 'react';
import '../styles/Chat.css'; // Стилі для кнопок логіну

/**
 * AuthButton - Кнопка для логіну через сторонні провайдери (Gmail, Facebook).
 * @param {string} provider - Назва провайдера ('google', 'facebook').
 */
const AuthButton = ({ provider }) => {
    // URL для редиректу на Backend, який обробляє OAuth
    const authUrl = `http://localhost:3000/auth/${provider}`; 

    const handleClick = () => {
        // Використовуємо window.location.href, щоб почати OAuth потік
        window.location.href = authUrl;
    };

    // Форматування тексту та іконки
    const displayProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
    const icon = provider === 'google' ? 'G' : 'f'; // Прості іконки для чистого HTML/CSS

    return (
        <button 
            onClick={handleClick} 
            className={`auth-btn auth-btn-${provider}`}
        >
            <span className="auth-icon">{icon}</span>
            Sign in with {displayProvider}
        </button>
    );
};

export default AuthButton;