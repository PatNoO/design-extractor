export function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-surface border border-border rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <div className="text-sm text-text-secondary">{children}</div>
    </div>
  );
}
