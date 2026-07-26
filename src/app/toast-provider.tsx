'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type Toast = {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
};

type ToastContextType = {
  showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 9999,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            style={{
              padding: '12px 20px',
              backgroundColor: toast.type === 'error' ? '#dc2626' : toast.type === 'success' ? '#16a34a' : '#2563eb',
              color: 'white',
              borderRadius: '6px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              maxWidth: '400px',
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
