import React from 'react';
import '../styles/Chat.css'; // Стилі для модальних вікон

/**
 * ConfirmationModal - Модальне вікно для підтвердження дії.
 * @param {string} message - Повідомлення для підтвердження.
 * @param {Function} onConfirm - Колбек, що викликається при підтвердженні.
 * @param {Function} onCancel - Колбек, що викликається при скасуванні.
 */
const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-content confirmation-modal-content" onClick={e => e.stopPropagation()}>
                <h3>Confirmation</h3>
                <p>{message}</p>

                <div className="modal-actions">
                    <button 
                        onClick={onCancel} 
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="btn-danger" // Використовуємо клас 'btn-danger' для візуалізації дії видалення
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;