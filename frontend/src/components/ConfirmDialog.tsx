import { Component, createSignal, onMount } from 'solid-js';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: Component<ConfirmDialogProps> = (props) => {
  const [visible, setVisible] = createSignal(false);

  onMount(() => {
    // 延迟显示动画
    setTimeout(() => setVisible(true), 10);
  });

  const handleConfirm = () => {
    setVisible(false);
    setTimeout(() => props.onConfirm(), 300);
  };

  const handleCancel = () => {
    setVisible(false);
    setTimeout(() => props.onCancel(), 300);
  };

  return (
    <div class={`${styles.confirmOverlay} ${visible() ? styles.visible : ''}`}>
      <div class={styles.confirmDialog}>
        <div class={styles.confirmHeader}>
          <h3>{props.title || '确认操作'}</h3>
        </div>
        <div class={styles.confirmContent}>
          <div class={styles.confirmIcon}>⚠️</div>
          <p>{props.message}</p>
        </div>
        <div class={styles.confirmActions}>
          <button 
            class={styles.cancelButton} 
            onClick={handleCancel}
          >
            {props.cancelText || '取消'}
          </button>
          <button 
            class={styles.confirmButton} 
            onClick={handleConfirm}
          >
            {props.confirmText || '确定'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
