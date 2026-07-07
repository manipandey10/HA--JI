import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, subtitle, icon: Icon, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-surface-0/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div className={`relative w-full ${sizes[size]} animate-scale-in`}>
        <div className="glass-strong rounded-2xl shadow-large overflow-hidden">
          {(title || Icon) && (
            <div className="flex items-start justify-between px-6 py-5 border-b border-surface-200/30">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-400" />
                  </div>
                )}
                <div>
                  {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
                  {subtitle && <p className="text-sm text-surface-400 mt-0.5">{subtitle}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-surface-400 hover:text-white hover:bg-surface-100/60 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="px-6 py-5">{children}</div>
          {footer && (
            <div className="px-6 py-4 border-t border-surface-200/30 flex items-center justify-end gap-3 bg-surface-50/30">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
