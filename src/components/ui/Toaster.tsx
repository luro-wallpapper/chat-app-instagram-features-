import React, { createContext, useContext, useState, useEffect } from 'react';
import { X } from 'lucide-react';

type ToastVariant = 'default' | 'success' | 'destructive';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const toast = (toast: Omit<Toast, 'id'>) => {
  const context = useToast();
  context.toast(toast);
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 11);
    setToasts(prev => [...prev, { id, ...toast }]);
  };
  
  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const value: ToastContextValue = {
    toasts,
    toast: addToast,
    dismiss: dismissToast,
  };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const Toaster: React.FC = () => {
  // We'll create a ToastProvider and Toaster in one component for simplicity
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 11);
    setToasts(prev => [...prev, { id, ...toast }]);
  };
  
  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  // Simple ToastContext inside this component
  const value = {
    toasts,
    toast: addToast,
    dismiss: dismissToast,
  };
  
  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    const timers = toasts.map(toast => {
      return setTimeout(() => {
        dismissToast(toast.id);
      }, 5000);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts]);
  
  return (
    <>
      <ToastContext.Provider value={value}>
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
          {toasts.map(toast => (
            <div 
              key={toast.id}
              className={`p-4 rounded-lg shadow-lg border animate-slide-in transition-all ${
                toast.variant === 'destructive'
                  ? 'bg-red-600 border-red-800 text-white'
                  : toast.variant === 'success'
                    ? 'bg-green-600 border-green-800 text-white'
                    : 'bg-white border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-medium">{toast.title}</h3>
                  {toast.description && (
                    <p className="text-sm opacity-90 mt-1">{toast.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </>
  );
};