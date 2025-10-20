import React from 'react';
import '../styles/Chat.css'; // Припускаємо, що стилі для .chat-list-item знаходяться тут

/**
 * ChatListItem - Компонент для відображення одного елемента чату у списку.
 * @param {Object} chat - Об'єкт чату ({ id, firstName, lastName, ... }).
 * @param {Function} onSelect - Колбек для вибору чату.
 * @param {Function} onEdit - Колбек для редагування імен чату.
 * @param {Function} onRemove - Колбек для видалення чату.
 */
const ChatListItem = ({ chat, onSelect, onEdit, onRemove }) => {
    // Отримуємо останнє повідомлення для відображення прев'ю
    const lastMessage = chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1].content 
        : 'No messages yet';

    return (
        <div className="chat-list-item">
            <div className="chat-info" onClick={onSelect}>
                <div className="chat-avatar">{chat.firstName[0]}</div>
                <div className="chat-details">
                    <div className="chat-name">{chat.firstName} {chat.lastName}</div>
                    <div className="chat-preview">{lastMessage}</div>
                </div>
            </div>
            
            <div className="chat-actions">
                <button onClick={onEdit} className="action-btn edit-btn">Edit</button>
                <button onClick={onRemove} className="action-btn remove-btn">Remove</button>
            </div>
        </div>
    );
};

export default ChatListItem;