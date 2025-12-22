import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
    if (!isOpen) return null;

    const getConfirmButtonStyle = () => {
        if (type === 'danger') return styles.confirmDanger;
        return styles.confirmPrimary;
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3 style={styles.title}>{title}</h3>
                <p style={styles.message}>{message}</p>
                <div style={styles.actions}>
                    <button style={styles.cancelButton} onClick={onClose}>
                        {cancelText}
                    </button>
                    <button style={getConfirmButtonStyle()} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
    },
    modal: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    title: {
        marginTop: 0,
        color: '#1E293B',
        fontSize: '1.25rem',
        fontWeight: '700',
    },
    message: {
        color: '#64748B',
        marginBottom: '2rem',
        lineHeight: '1.5',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
    },
    cancelButton: {
        padding: '0.6rem 1.2rem',
        borderRadius: '0.5rem',
        border: '1px solid #E2E8F0',
        backgroundColor: 'white',
        color: '#64748B',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    confirmPrimary: {
        padding: '0.6rem 1.2rem',
        borderRadius: '0.5rem',
        border: 'none',
        backgroundColor: '#0A4D68',
        color: 'white',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    confirmDanger: {
        padding: '0.6rem 1.2rem',
        borderRadius: '0.5rem',
        border: 'none',
        backgroundColor: '#DC2626',
        color: 'white',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    }
};

export default ConfirmModal;
