import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
}

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/25 hover:shadow-glow-blue hover:-translate-y-0.5',
  secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-500 hover:from-secondary-500 hover:to-secondary-400 text-white shadow-lg shadow-secondary-500/25 hover:-translate-y-0.5',
  ghost: 'text-surface-500 hover:text-white hover:bg-surface-100/60',
  outline: 'border border-surface-200/60 text-surface-600 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/10',
  danger: 'bg-error-500/10 text-error-400 border border-error-500/30 hover:bg-error-500/20 hover:border-error-500/50',
  success: 'bg-success-500/10 text-success-400 border border-success-500/30 hover:bg-success-500/20 hover:border-success-500/50',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
  icon: 'p-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon: LeftIcon, rightIcon: RightIcon, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : LeftIcon ? (
          <LeftIcon className="w-4 h-4" />
        ) : null}
        {children}
        {!loading && RightIcon && <RightIcon className="w-4 h-4" />}
      </button>
    );
  }
);

Button.displayName = 'Button';
