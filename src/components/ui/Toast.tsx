import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const colors = {
  success: 'text-success-400 bg-success-500/10 border-success-500/30',
  error: 'text-error-400 bg-error-500/10 border-error-500/30',
  info: 'text-primary-400 bg-primary-500/10 border-primary-500/30',
  warning: 'text-warning-400 bg-warning-500/10 border-warning-500/30',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string, description?: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, type, message, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 glass-strong rounded-xl border shadow-large animate-slide-in-right ${colors[t.type]}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{t.message}</p>
                {t.description && <p className="text-xs text-surface-400 mt-1">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-surface-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
