import React, { useEffect, useState } from 'react';

/**
 * Toast component props interface
 */
export interface ToastProps {
  /** Message to display in the toast */
  message: string;
  /** Type of toast notification */
  type?: 'success' | 'error' | 'warning' | 'info';
  /** Duration in milliseconds before auto-dismiss */
  duration?: number;
  /** Show or hide the toast */
  isVisible: boolean;
  /** Callback when toast is dismissed */
  onDismiss: () => void;
  /** Position of the toast on screen */
  position?: 'top' | 'bottom';
}

/**
 * Toast Component
 *
 * A notification toast for providing feedback to users.
 * Features auto-dismiss, color-coded types, and smooth animations.
 * Designed for kid-friendly feedback with clear icons and messages.
 *
 * @example
 * ```tsx
 * const [toast, setToast] = useState({ show: false, message: '' });
 *
 * <Toast
 *   message="Answer saved!"
 *   type="success"
 *   isVisible={toast.show}
 *   onDismiss={() => setToast({ show: false, message: '' })}
 *   duration={3000}
 * />
 * ```
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  isVisible,
  onDismiss,
  position = 'top',
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setIsExiting(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onDismiss();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onDismiss]);

  if (!isVisible && !isExiting) return null;

  const typeStyles = {
    success: {
      bg: 'bg-gradient-to-br from-green-500 to-green-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-gradient-to-br from-red-500 to-red-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    info: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const positionStyles = {
    top: 'top-4',
    bottom: 'bottom-4',
  };

  const currentType = typeStyles[type];

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 ${positionStyles[position]} z-50 ${
        isExiting ? 'animate-slideOut' : 'animate-slideIn'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`${currentType.bg} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px] max-w-md`}
      >
        <div className="flex-shrink-0" aria-hidden="true">
          {currentType.icon}
        </div>
        <p className="flex-1 font-bold text-base">{message}</p>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(onDismiss, 300);
          }}
          className="flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white active:scale-95 touch-manipulation"
          aria-label="Dismiss notification"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
