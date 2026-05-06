export function Button({ variant = 'primary', className = '', children, ...props }) {
  const base = 'inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors';
  const variants = {
    primary:   'bg-primary text-white hover:bg-primary-hover',
    secondary: 'bg-transparent border border-primary text-primary hover:bg-surface',
    ghost:     'bg-transparent text-text-secondary hover:text-text-primary',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
