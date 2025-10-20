import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import ToastNotification from './components/ToastNotification';
import NewChatDialog from './components/NewChatDialog';
import ConfirmationModal from './components/ConfirmationModal';
import AuthButton from './components/AuthButton';
import useSocket from './hooks/useSocket'; 
import * as api from './utils/api';
import './styles/Chat.css';

/**
 * Головний компонент застосунку.
 * Керує глобальним станом (чати, активний чат, нотифікації, логін).
 */
function App() {
    const [chats, setChats] = useState([]); // Дані будуть завантажуватися з BE
    const [activeChat, setActiveChat] = useState(null);
    const [toast, setToast] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [chatToEdit, setChatToEdit] = useState(null); // Чат для редагування
    const [chatToDelete, setChatToDelete] = useState(null); // Чат для видалення
    const [isAutoSendOn, setIsAutoSendOn] = useState(false);
    
    // ====================================================================
    // 1. ЛОГІКА SOCKET.IO ТА НОТИФІКАЦІЙ
    // ====================================================================

    // Функція для відображення toast-нотифікації
    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000); // Приховуємо через 3 секунди
    }, []);

    // Обробник нових повідомлень (від авто-бота або випадкового відправника)
    const handleNewMessage = useCallback(({ chatId, message }) => {
        setChats(prevChats => {
            const updatedChats = prevChats.map(chat => {
                if (chat.id === chatId || chat._id === chatId) { // Перевірка за id або _id (з MongoDB)
                    const newMessages = chat.messages ? [...chat.messages, message] : [message];
                    return { ...chat, messages: newMessages };
                }
                return chat;
            });

            // Оновлюємо також активний чат, якщо це він
            if (activeChat && (activeChat.id === chatId || activeChat._id === chatId)) {
                setActiveChat(updatedChats.find(c => c.id === chatId || c._id === chatId));
            }

            // Нотифікація, якщо повідомлення не в активному чаті
            if (activeChat?.id !== chatId && activeChat?._id !== chatId) {
                const chat = updatedChats.find(c => c.id === chatId || c._id === chatId);
                showToast(`New message from ${message.sender} in ${chat?.firstName || 'a chat'}!`, 'info');
            }

            return updatedChats;
        });
    }, [activeChat, showToast]);

    // Обробка оновлення вмісту повідомлення
    const handleUpdateMessage = async (chatId, messageId, newContent) => {
        try {
            await api.updateMessage(chatId, messageId, newContent);
            setChats(prevChats => {
            let newActiveChat = null; // Локальна змінна для оновлення activeChat
            
            const updatedChats = prevChats.map(chat => {
                if (chat.id === chatId) {
                    const updatedMessages = chat.messages.map(msg => 
                        (msg._id === messageId || msg.id === messageId) ? {...msg, content: newContent} : msg
                    );
                    const updatedChat = {...chat, messages: updatedMessages};
                    
                    // Якщо цей чат був активним, зберігаємо його
                    if (activeChat && chat.id === activeChat.id) {
                        newActiveChat = updatedChat;
                    }
                    return updatedChat;
                }
                return chat;
            });

            // Оновлюємо activeChat за необхідності
            if (newActiveChat) {
                setActiveChat(newActiveChat);
            }
            
            return updatedChats;
        });
            
            showToast('Message updated successfully.', 'success');
        } catch (e) {
            console.error('Failed to update message:', e);
            showToast('Failed to update message.', 'error');
        }
    };

    // Обробник глобальної нотифікації про випадкове повідомлення
    const handleRandomNotification = useCallback(({ firstName, lastName }) => {
        showToast(`SYSTEM ALERT: Auto-message sent to ${firstName} ${lastName}.`, 'warning');
    }, [showToast]);

    // Хук Socket.IO
    const { isConnected, emit, joinChat } = useSocket(
        process.env.REACT_APP_SERVER_URL, 
        handleNewMessage, 
        handleRandomNotification
    );

    // ====================================================================
    // 2. ЛОГІКА API ТА СТАНУ (useEffect)
    // ====================================================================

    // Завантаження чатів при старті
    useEffect(() => {
        const loadChats = async () => {
            try {
                // Використовуємо await getChats() з utils/api.js
                const data = await api.getChats();
                // MongoDB використовує _id, React використовує id.
                // Перетворюємо _id на id для зручності:
                setChats(data.map(chat => ({...chat, id: chat._id})));
            } catch (e) {
                console.error('Failed to load chats:', e);
                // Залишаємо попередньо визначені чати як fallback
                showToast('Failed to connect to the backend API.', 'error');
            }
        };
        loadChats();
    }, [showToast]);


    // При виборі активного чату, приєднуємося до його "кімнати" Socket.IO
    useEffect(() => {
        if (activeChat && isConnected) {
            joinChat(activeChat._id || activeChat.id);
        }
    }, [activeChat, isConnected, joinChat]);

    // ====================================================================
    // 3. ОБРОБНИКИ CRUD ТА ПОВІДОМЛЕНЬ
    // ====================================================================

    // Вибір активного чату
    const handleSelectChat = (chat) => {
        setActiveChat(chat);
    };

    // Створення або оновлення чату (з NewChatDialog)
    const handleSubmitChat = async (id, chatData) => {
        try {
            if (id) {
                console.log('ID being sent to API:', id, 'Type:', typeof id);
                // Оновлення
                const updatedChat = await api.updateChat(id, chatData);
                setChats(prev => prev.map(c => c.id === id ? {...c, ...updatedChat, id: c.id} : c));
                showToast('Chat updated successfully.', 'success');
            } else {
                // Створення
                const newChat = await api.createChat(chatData);
                // Додаємо новий чат до списку з коректним id/ _id
                setChats(prev => [{...newChat, id: newChat._id}, ...prev]); 
                showToast('New chat created successfully.', 'success');
            }
        } catch (e) {
            showToast(`Operation failed: ${e.message}`, 'error');
        } finally {
            setIsDialogOpen(false);
            setChatToEdit(null);
        }
    };

    // Видалення чату (з ConfirmationModal)
    const handleDeleteChat = (chat) => {
        setChatToDelete(chat); // Відкрити модальне вікно
    };

    const confirmDelete = async () => {
        if (!chatToDelete) return;
        try {
            await api.deleteChat(chatToDelete.id);
            setChats(prev => prev.filter(c => c.id !== chatToDelete.id));
            if (activeChat?.id === chatToDelete.id) {
                setActiveChat(null);
            }
            showToast('Chat deleted successfully.', 'success');
        } catch (e) {
            showToast('Failed to delete chat.', 'error');
        } finally {
            setChatToDelete(null);
        }
    };

    // Надсилання повідомлення (викликається з ChatWindow)
    const handleSendMessage = async (chatId, content) => {
        // Оновлюємо FE миттєво для UX
        const newMessage = { sender: 'You', content, timestamp: new Date().toISOString() };
        setChats(prevChats => prevChats.map(chat => 
            chat.id === chatId ? {...chat, messages: [...(chat.messages || []), newMessage]} : chat
        ));
        
        // Викликаємо BE, який запустить 3-секундний таймер
        try {
            await api.sendMessage(chatId, content, 'You');
            // BE надішле відповідь через Socket.IO через 3с, що оновиться через handleNewMessage
        } catch (e) {
            showToast('Failed to send message.', 'error');
        }
    };
    
    // Увімкнення/вимкнення автоматичного надсилання повідомлень
    const toggleAutoSend = () => {
        const newState = !isAutoSendOn;
        emit('toggle_auto_send', newState); // Надсилаємо команду на BE через Socket.IO
        setIsAutoSendOn(newState);
        showToast(newState ? 'Auto-sending enabled!' : 'Auto-sending disabled.', newState ? 'success' : 'info');
    };

    // ====================================================================
    // 4. РЕНДЕРИНГ
    // ====================================================================

    return (
        <div className="app-container">
            <header className="app-header">
                 {/* Кнопка логіну (хоча б одна) */}
                 <AuthButton provider="google" />
            </header>
            
            <div className="main-chat-layout">
                <ChatList 
                    chats={chats}
                    onSelectChat={handleSelectChat}
                    onCreateChat={() => setIsDialogOpen(true)}
                    onUpdateChat={(chat) => { setChatToEdit(chat); setIsDialogOpen(true); }}
                    onDeleteChat={handleDeleteChat}
                    isAutoSendOn={isAutoSendOn}
                    onToggleAutoSend={toggleAutoSend}
                />
                
                <div className="chat-content-area">
                    {activeChat ? (
                        <ChatWindow 
                            chat={activeChat} 
                            onSendMessage={handleSendMessage}
                            onUpdateMessage={handleUpdateMessage} 
                        />
                    ) : (
                        <div className="no-chat-selected">Select a chat to start messaging</div>
                    )}
                </div>
            </div>
            
            {/* Діалогове вікно створення/оновлення чату */}
            {isDialogOpen && (
                <NewChatDialog
                    onClose={() => { setIsDialogOpen(false); setChatToEdit(null); }}
                    onSubmit={handleSubmitChat}
                    chatToEdit={chatToEdit}
                />
            )}
            
            {/* Модальне вікно підтвердження видалення */}
            {chatToDelete && (
                <ConfirmationModal
                    message={`Are you sure you want to delete chat with ${chatToDelete?.firstName} ${chatToDelete?.lastName}?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setChatToDelete(null)}
                />
            )}
            
            {/* Компонент для спливаючих нотифікацій */}
            {toast && <ToastNotification message={toast.message} type={toast.type} />}
            
        </div>
    );
}

export default App;