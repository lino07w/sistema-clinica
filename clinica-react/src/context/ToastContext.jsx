import React, { createContext, useState, useContext, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
    return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // addToast(message, type, duration)
    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now().toString(); // Simple ID generation
        setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    const value = {
        addToast,
        removeToast
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div style={styles.toastContainer}>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const styles = {
    toastContainer: {
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        pointerEvents: 'none', // Allow clicks through container
    },
};

// Override pointer events for children to allow interaction
// Note: We need to ensure the Toast component itself has pointer-events: auto
// I'll add that to the Toast component styles in Toast.jsx via an update if needed,
// but simplified: the container structure usually handles this better if items are wrapped.
// Actually, applying pointerEvents: 'auto' to the Toast component wrapper is the standard way.
// Let's rely on Toast.jsx having default block behavior which takes pointer events.
// But wait, if container has pointer-events: none, children inherit it unless overridden.
// I will check Toast.jsx style again.
