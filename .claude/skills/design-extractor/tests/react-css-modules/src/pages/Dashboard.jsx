import '../../tokens.css';
import { Card } from '../components/Card/Card';
import { Button } from '../components/Button/Button';

export function Dashboard() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', padding: '0 var(--spacing-8)', height: '64px', borderBottom: '1px solid var(--color-border)' }}>
        <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>FixtureApp</span>
        <div style={{ marginLeft: 'auto' }}>
          <Button variant="ghost">← Home</Button>
        </div>
      </nav>

      <div style={{ padding: 'var(--spacing-12) var(--spacing-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-8)' }}>
          Dashboard
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-6)' }}>
          <Card title="Users">1,240</Card>
          <Card title="Revenue">$48k</Card>
          <Card title="Errors">3 active</Card>
        </div>
      </div>
    </main>
  );
}
