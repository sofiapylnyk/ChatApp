import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import '../styles/Chat.css'; // Припускаємо, що стилі для .chat-window знаходяться тут

/**
 * ChatWindow - Компонент для відображення активного чату та форми відправки повідомлень.
 * @param {Object} chat - Об'єкт активного чату.
 * @param {Function} onSendMessage - Колбек, що викликається при відправці повідомлення.
 */
const ChatWindow = ({ chat, onSendMessage, onUpdateMessage }) => {
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);

    // Автопрокрутка до останнього повідомлення при зміні чату або додаванні повідомлення
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat.id, chat.messages.length]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        // Викликаємо функцію з App.js, яка відправить повідомлення на BE
        onSendMessage(chat.id, messageInput); 
        setMessageInput('');
    };

    return (
        <div className="chat-window">
            <header className="chat-header">
                <h2>{chat.firstName} {chat.lastName}</h2>
                {/* Додаткові кнопки/інформація можуть бути тут */}
            </header>

            {/* Область повідомлень */}
            <div className="messages-area">
                {chat.messages.length > 0 ? (
                    chat.messages.map((msg, index) => (
                        <Message 
                            key={index} 
                            message={msg} 
                            isOwn={msg.sender === 'You'} 
                            onUpdate={(newContent) =>
                                onUpdateMessage(chat.id, msg._id || msg.id, newContent) 
                    }  
                        />
                    ))
                ) : (
                    <div className="chat-start-message">Say hello to start the conversation!</div>
                )}
                <div ref={messagesEndRef} /> {/* Для автопрокрутки */}
            </div>

            {/* Форма відправки повідомлення */}
            <form onSubmit={handleSubmit} className="message-form">
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                />
                <button type="submit" className="send-btn">Send</button>
            </form>
        </div>
    );
};

export default ChatWindow;