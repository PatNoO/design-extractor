import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary-hover',
        variant === 'secondary' && 'bg-transparent border border-primary text-primary hover:bg-surface',
        variant === 'ghost' && 'bg-transparent text-text-secondary hover:text-text-primary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
