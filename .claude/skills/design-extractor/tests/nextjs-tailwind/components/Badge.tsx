import { cn } from '@/lib/utils';

type Variant = 'primary' | 'success' | 'error';

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
}

export function Badge({ variant = 'primary', children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variant === 'primary' && 'bg-blue-50 text-primary',
        variant === 'success' && 'bg-green-50 text-success',
        variant === 'error' && 'bg-red-50 text-error',
      )}
    >
      {children}
    </span>
  );
}
