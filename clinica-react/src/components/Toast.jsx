import { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const VARIANTS = {
  success: { icon: CheckCircle2, className: 'toast-success' },
  error: { icon: XCircle, className: 'toast-error' },
  warning: { icon: AlertTriangle, className: 'toast-warning' },
  info: { icon: Info, className: 'toast-info' },
};

const Toast = ({ message, type = 'info', onClose, duration = 3500 }) => {
  // Guardamos onClose en una ref para que el temporizador no se reinicie en cada render
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const { icon: Icon, className } = VARIANTS[type] ?? VARIANTS.info;

  return (
    <div className={`toast ${className}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={18} className="toast-icon" aria-hidden="true" />
      <p className="toast-message">{message}</p>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Cerrar notificación">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
