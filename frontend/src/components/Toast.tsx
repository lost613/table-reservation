import { Component, createSignal, onMount } from 'solid-js';
import styles from './Toast.module.css';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: Component<ToastProps> = (props) => {
  const [visible, setVisible] = createSignal(false);

  onMount(() => {
    // 延迟显示动画
    setTimeout(() => setVisible(true), 10);
    
    // 自动关闭
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => props.onClose(), 300);
    }, props.duration || 3000);
  });

  const getIcon = () => {
    switch (props.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  return (
    <div class={`${styles.toastOverlay} ${visible() ? styles.visible : ''}`}>
      <div class={`${styles.toast} ${styles[props.type || 'info']}`}>
        <div class={styles.toastIcon}>{getIcon()}</div>
        <div class={styles.toastMessage}>{props.message}</div>
        <button class={styles.closeButton} onClick={() => {
          setVisible(false);
          setTimeout(() => props.onClose(), 300);
        }}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
