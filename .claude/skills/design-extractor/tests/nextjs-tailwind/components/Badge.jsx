export function Badge({ variant = 'primary', children }) {
  const variants = {
    primary: 'bg-blue-50 text-primary',
    success: 'bg-green-50 text-success',
    error:   'bg-red-50 text-error',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
