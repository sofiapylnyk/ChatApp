// client/src/components/ChatList.js
import React, { useState } from 'react';
import ChatListItem from './ChatListItem';
import ConfirmationModal from './ConfirmationModal';
import NewChatDialog from './NewChatDialog';

import '../styles/Chat.css'; 

/**
 * ChatList - Компонент для відображення списку чатів та функціоналу пошуку/CRUD.
 * @param {Function} onCreateChat - Колбек для створення нового чату (ВІДКРИВАЄ ДІАЛОГ В App.js).
 * @param {Function} onUpdateChat - Колбек для оновлення чату.
 * @param {Function} onDeleteChat - Колбек для видалення чату.
 * @param {Function} onToggleAutoSend - Колбек для Socket.IO функціоналу.
 */
const ChatList = ({ 
    chats, 
    onSelectChat, 
    onCreateChat, 
    onUpdateChat, 
    onDeleteChat,
    onToggleAutoSend, // Додано для Socket.IO кнопки
    isAutoSendOn // Додано для відображення стану Socket.IO
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    // Ці стани більше не використовуються для логіки створення/видалення, 
    // оскільки ними керує батьківський компонент (App.js).
    // Але ми залишаємо їх для обробки пошуку та внутрішньої логіки.
    const [chatToDelete, setChatToDelete] = useState(null); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Логіка пошуку чатів
    const filteredChats = chats.filter(chat =>
        (chat.firstName + ' ' + chat.lastName).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Обробник видалення чату з підтвердженням
    const handleDeleteClick = (chat) => {
        setChatToDelete(chat);
        setIsModalOpen(true); // Локальний стан для рендерингу модального вікна тут
    };

    const confirmDelete = () => {
        if (chatToDelete) {
            onDeleteChat(chatToDelete); // Передаємо весь об'єкт, щоб App.js міг взяти id
            setChatToDelete(null);
            setIsModalOpen(false);
        }
    };
    
    // Логіка оновлення чату (відкриває діалог у App.js)
    const handleEditClick = (chat) => {
        onUpdateChat(chat); 
    };

    return (
        <div className="chat-list-container">
            <h3>Chats</h3>
            
            {/* Поле для пошуку чатів */}
            <input
                type="text"
                placeholder="Chat search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="chat-search-input"
            />
            
            {/* Кнопки керування чатами */}
            <div className="chat-controls">
                {/* ВИПРАВЛЕНО: Викликаємо пропс onCreateChat, який відкриє діалог у App.js */}
                <button 
                    onClick={onCreateChat} // <-- ВИКЛИК ПРОПСУ
                    className="btn-primary"
                >
                    + New Chat
                </button>
                
                {/* Кнопка "Увімкнути авто-надсилання" (Socket.IO) */}
                <button 
                    onClick={onToggleAutoSend}
                    className={isAutoSendOn ? "btn-danger" : "btn-secondary"}
                >
                    {isAutoSendOn ? 'Auto Send OFF' : 'Auto Send ON'}
                </button>
            </div>
            
            {/* Список елементів чату */}
            <div className="chats-scroll-area">
                {filteredChats.length > 0 ? (
                    filteredChats.map(chat => (
                        <ChatListItem
                            key={chat._id || chat.id} // Використовуємо _id з MongoDB
                            chat={chat}
                            onSelect={() => onSelectChat(chat)}
                            onEdit={() => handleEditClick(chat)} // Викликаємо обробник оновлення
                            onRemove={() => handleDeleteClick(chat)} // Виклик з підтвердженням
                        />
                    ))
                ) : (
                    <p className="no-results">No chats found.</p>
                )}
            </div>

            {/* ТІЛЬКИ ЛОКАЛЬНИЙ РЕНДЕРИНГ МОДАЛЬНОГО ВІКНА ПІДТВЕРДЖЕННЯ */}
            {isModalOpen && chatToDelete && (
                <ConfirmationModal
                    message={`Are you sure you want to delete chat with ${chatToDelete?.firstName} ${chatToDelete?.lastName}?`}
                    onConfirm={confirmDelete} // Викликає локальний confirmDelete
                    onCancel={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ChatList;