import React, { useState, useEffect } from 'react';
import '../styles/Chat.css';

const Message = ({ message, isOwn, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);

    useEffect(() => {
        // Синхронізує локальний стан з пропсом, коли message.content змінюється ззовні (після успішної відповіді BE)
        setEditedContent(message.content);
    }, [message.content]);

    const handleSave = () => {
        if (!isEditing) return;

        // Перевірка, чи вміст змінився і не є порожнім
        if (editedContent.trim() && editedContent !== message.content) {
            // Викликаємо обробник оновлення, який надсилає API-запит.
            // ID повідомлення передається з ChatWindow/App.js
            onUpdate(editedContent); 
        } 
        
        // Вихід з режиму редагування
        setIsEditing(false);
    };

    const handleEditClick = () => {
        // При натисканні "Edit", встановлюємо локальний стан з поточним значенням пропса
        setEditedContent(message.content); 
        setIsEditing(true); 
    };

    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`message ${isOwn ? 'sent' : 'received'}`}>
            <div className="message-bubble">
                {!isOwn && <strong className="message-sender">{message.sender}</strong>}
                
                {isEditing ? (
                    <input
                        type="text"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        onBlur={handleSave} 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                            if (e.key === 'Escape') setIsEditing(false);
                        }}
                        autoFocus
                        className="message-edit-input"
                    />
                ) : (
                    <p className="message-content">{message.content}</p>
                )}
                
                <span className="message-time">{time}</span>
                
                {isOwn && !isEditing && (
                    <button onClick={handleEditClick} className="edit-message-btn">
                        ✏️
                    </button>
                )}
            </div>
        </div>
    );
};

export default Message;