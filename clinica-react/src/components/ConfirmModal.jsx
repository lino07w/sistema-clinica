import { useEffect, useRef } from 'react';

/** Diálogo de confirmación accesible (Esc cancela, el foco va a "Cancelar"). */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
}) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    cancelRef.current?.focus();
    const onKeyDown = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="modal-title">{title}</h2>
        <p id="confirm-message" className="modal-text">{message}</p>
        <div className="modal-actions">
          <button ref={cancelRef} type="button" className="btn btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${type === 'danger' ? 'btn-danger-solid' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
