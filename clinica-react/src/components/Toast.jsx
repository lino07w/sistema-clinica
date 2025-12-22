import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    background: '#10B981',
                    icon: '✅'
                };
            case 'error':
                return {
                    background: '#EF4444',
                    icon: '❌'
                };
            case 'warning':
                return {
                    background: '#F59E0B',
                    icon: '⚠️'
                };
            case 'info':
            default:
                return {
                    background: '#3B82F6',
                    icon: 'ℹ️'
                };
        }
    };

    const styleProps = getStyles();

    return (
        <div style={{
            ...styles.toast,
            background: styleProps.background,
        }}>
            <span style={styles.icon}>{styleProps.icon}</span>
            <p style={styles.message}>{message}</p>
            <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>
    );
};

const styles = {
    toast: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        minWidth: '300px',
        maxWidth: '400px',
        marginBottom: '1rem',
        animation: 'slideIn 0.3s ease-out',
        position: 'relative',
        zIndex: 9999,
        pointerEvents: 'auto',
    },
    icon: {
        fontSize: '1.25rem',
    },
    message: {
        margin: 0,
        fontSize: '0.875rem',
        fontWeight: '500',
        flex: 1,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '1.25rem',
        cursor: 'pointer',
        opacity: 0.8,
        padding: '0 0.25rem',
    },
};

// Add keyframes for animation manually in a style tag since we are inline
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default Toast;
