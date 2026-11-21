import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Toast from '../components/Toast';
import '../styles/Toast.css';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  /** addToast(mensaje, 'success' | 'error' | 'warning' | 'info', duraciónMs) */
  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((current) => [...current, { id, message, type, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-region" aria-live="polite">
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
