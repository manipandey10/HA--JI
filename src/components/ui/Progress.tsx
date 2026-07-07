interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

const heights = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const barColors = {
  primary: 'from-primary-500 to-primary-400',
  secondary: 'from-secondary-500 to-secondary-400',
  success: 'from-success-500 to-success-400',
  warning: 'from-warning-500 to-warning-400',
  error: 'from-error-500 to-error-400',
};

export function Progress({ value, max = 100, size = 'md', variant = 'primary', showLabel = false, className = '' }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-surface-400">Progress</span>
          <span className="text-xs font-medium text-surface-600">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-surface-200/30 rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${barColors[variant]} rounded-full transition-all duration-500 ease-smooth`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  label?: string;
  sublabel?: string;
}

const strokeColors = {
  primary: '#3b82f6',
  secondary: '#14b8a6',
  success: '#22c55e',
  warning: '#f97316',
  error: '#ef4444',
};

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'primary',
  label,
  sublabel,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-200/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColors[variant]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-smooth"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="text-2xl font-bold text-white">{label}</span>}
        {sublabel && <span className="text-xs text-surface-400 mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
