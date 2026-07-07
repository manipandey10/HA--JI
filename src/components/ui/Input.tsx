import { forwardRef, useState } from 'react';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  inputSize?: InputSize;
  onRightIconClick?: () => void;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon: LeftIcon, rightIcon: RightIcon, inputSize = 'md', onRightIconClick, className = '', id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-surface-600 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <LeftIcon
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                focused ? 'text-primary-400' : error ? 'text-error-400' : 'text-surface-400'
              }`}
            />
          )}
          <input
            ref={ref}
            id={inputId}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`w-full ${sizeClasses[inputSize]} ${
              LeftIcon ? 'pl-11' : ''
            } ${RightIcon ? 'pr-11' : ''} bg-surface-100/50 border rounded-xl text-white placeholder-surface-400 transition-all duration-200 ${
              error
                ? 'border-error-500/50 focus:border-error-500 focus:ring-2 focus:ring-error-500/20'
                : focused
                ? 'border-primary-500/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                : 'border-surface-200/50 hover:border-surface-200/80'
            } ${className}`}
            {...props}
          />
          {RightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <RightIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-error-400 animate-fade-in-up flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-error-400" />
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-surface-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-surface-600 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full px-4 py-2.5 bg-surface-100/50 border rounded-xl text-white placeholder-surface-400 transition-all duration-200 resize-none ${
            error
              ? 'border-error-500/50 focus:border-error-500 focus:ring-2 focus:ring-error-500/20'
              : 'border-surface-200/50 hover:border-surface-200/80 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-xs text-error-400 animate-fade-in-up">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-surface-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-surface-600 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full px-4 py-2.5 bg-surface-100/50 border rounded-xl text-white transition-all duration-200 appearance-none cursor-pointer ${
            error
              ? 'border-error-500/50'
              : 'border-surface-200/50 hover:border-surface-200/80 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20'
          } ${className}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1rem',
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-50 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-error-400 animate-fade-in-up">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
