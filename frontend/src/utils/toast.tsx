import { Component, createSignal } from 'solid-js';
import Toast, { ToastProps } from '../components/Toast';
import ConfirmDialog, { ConfirmDialogProps } from '../components/ConfirmDialog';

interface ToastMessage {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

interface ConfirmMessage {
  id: number;
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

let toastId = 0;
let confirmId = 0;
const [toasts, setToasts] = createSignal<ToastMessage[]>([]);
const [confirms, setConfirms] = createSignal<ConfirmMessage[]>([]);

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 1000) => {
  const id = ++toastId;
  setToasts(prev => [...prev, { id, message, type, duration }]);
};

export const removeToast = (id: number) => {
  setToasts(prev => prev.filter(toast => toast.id !== id));
};

export const showConfirm = (
  message: string, 
  options: {
    title?: string;
    confirmText?: string;
    cancelText?: string;
  } = {}
): Promise<boolean> => {
  return new Promise((resolve) => {
    const id = ++confirmId;
    
    const handleConfirm = () => {
      setConfirms(prev => prev.filter(confirm => confirm.id !== id));
      resolve(true);
    };
    
    const handleCancel = () => {
      setConfirms(prev => prev.filter(confirm => confirm.id !== id));
      resolve(false);
    };
    
    setConfirms(prev => [...prev, {
      id,
      message,
      title: options.title,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      onConfirm: handleConfirm,
      onCancel: handleCancel
    }]);
  });
};

export const ToastContainer: Component = () => {
  return (
    <>
      {toasts().map(toast => (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      {confirms().map(confirm => (
        <ConfirmDialog
          message={confirm.message}
          title={confirm.title}
          confirmText={confirm.confirmText}
          cancelText={confirm.cancelText}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />
      ))}
    </>
  );
};
