import { forwardRef } from 'react';

type CardVariant = 'default' | 'glass' | 'gradient' | 'solid';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variants: Record<CardVariant, string> = {
  default: 'bg-surface-50/40 border border-surface-200/30',
  glass: 'bg-surface-50/60 backdrop-blur-xl border border-surface-200/30',
  gradient: 'bg-gradient-to-br from-surface-50/60 to-surface-50/30 backdrop-blur-xl border border-surface-200/30',
  solid: 'bg-surface-50 border border-surface-200/50',
};

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'glass', hover = false, padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl transition-all duration-300 ease-smooth ${
          variants[variant]
        } ${paddings[padding]} ${
          hover ? 'hover:border-surface-200/60 hover:shadow-medium hover:-translate-y-0.5' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, icon: Icon, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-5 ${className}`} {...props}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-400" />
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-surface-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
