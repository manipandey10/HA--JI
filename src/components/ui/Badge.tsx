type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500/15 text-primary-400 border-primary-500/30',
  secondary: 'bg-secondary-500/15 text-secondary-400 border-secondary-500/30',
  success: 'bg-success-500/15 text-success-400 border-success-500/30',
  warning: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
  error: 'bg-error-500/15 text-error-400 border-error-500/30',
  info: 'bg-surface-300/15 text-surface-500 border-surface-300/30',
  neutral: 'bg-surface-200/15 text-surface-400 border-surface-200/30',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-primary-400',
  secondary: 'bg-secondary-400',
  success: 'bg-success-400',
  warning: 'bg-warning-400',
  error: 'bg-error-400',
  info: 'bg-surface-400',
  neutral: 'bg-surface-400',
};

const sizes: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ variant = 'neutral', size = 'md', dot = false, className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  submitted: { variant: 'primary', label: 'Submitted' },
  d0_validation: { variant: 'info', label: 'D0 Validation' },
  d1_scoring: { variant: 'warning', label: 'D1 Scoring' },
  d2_d4_workflow: { variant: 'secondary', label: 'D2-D4 Workflow' },
  final_approval: { variant: 'warning', label: 'Final Approval' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'error', label: 'Rejected' },
  completed: { variant: 'success', label: 'Completed' },
};

export function StatusBadge({ status, size = 'md' }: { status: string; size?: BadgeSize }) {
  const config = statusConfig[status] || { variant: 'neutral' as BadgeVariant, label: status.replace(/_/g, ' ') };
  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  );
}
