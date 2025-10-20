import React, { useState, useEffect } from 'react';
import '../styles/Chat.css'; // Припускаємо, що стилі для модальних вікон знаходяться тут

/**
 * NewChatDialog - Діалогове вікно для створення нового чату або оновлення існуючого.
 * @param {Function} onClose - Колбек для закриття діалогового вікна.
 * @param {Function} onSubmit - Колбек для обробки збереження/оновлення.
 * @param {Object} [chatToEdit=null] - Об'єкт чату, якщо ми редагуємо.
 */
const NewChatDialog = ({ onClose, onSubmit, chatToEdit = null }) => {
    // Встановлюємо початкові значення, залежно від того, чи це редагування чи створення
    const [firstName, setFirstName] = useState(chatToEdit ? chatToEdit.firstName : '');
    const [lastName, setLastName] = useState(chatToEdit ? chatToEdit.lastName : '');
    const [error, setError] = useState('');
    
    // Визначення заголовка
    const isEditing = !!chatToEdit;
    const title = isEditing ? 'Update Chat' : 'Create New Chat';

    const handleSubmit = (e) => {
        e.preventDefault();

        // Валідація: Обидва поля "first name" та "last name" є обов'язковими
        if (!firstName.trim() || !lastName.trim()) {
            setError('First Name and Last Name are required.');
            return;
        }

        const chatData = { firstName: firstName.trim(), lastName: lastName.trim() };
        
        // Якщо редагування, додаємо ID
        if (isEditing) {
            //const chatId = chatToEdit._id || chatToEdit.id;
            onSubmit(chatToEdit.id, chatData);
        } else {
            onSubmit(null, chatData);
        }

        onClose(); // Закрити після успішної відправки
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>{title}</h3>
                <form onSubmit={handleSubmit}>
                    
                    {/* Поле для First Name */}
                    <div className="form-group">
                        <label htmlFor="firstName">First Name *</label>
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>

                    {/* Поле для Last Name */}
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name *</label>
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">
                            {isEditing ? 'Save Changes' : 'Create Chat'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewChatDialog;