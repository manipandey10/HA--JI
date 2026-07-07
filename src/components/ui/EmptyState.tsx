interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-primary-500/10 rounded-2xl blur-xl" />
        <div className="relative w-16 h-16 bg-surface-100/60 rounded-2xl flex items-center justify-center">
          <Icon className="w-8 h-8 text-surface-400" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-1.5">{title}</h3>
      {description && <p className="text-sm text-surface-400 max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  );
}

interface ErrorStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ icon: Icon, title, description, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-error-500/10 rounded-2xl flex items-center justify-center mb-4">
        {Icon ? <Icon className="w-8 h-8 text-error-400" /> : <span className="text-2xl">!</span>}
      </div>
      <h3 className="text-lg font-semibold text-white mb-1.5">{title}</h3>
      {description && <p className="text-sm text-surface-400 max-w-sm mb-5">{description}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-primary-400 hover:text-primary-300 border border-primary-500/30 hover:border-primary-500/50 rounded-xl transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
