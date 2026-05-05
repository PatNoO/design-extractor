import '../../tokens.css';
import { Button } from '../components/Button/Button';
import { Card } from '../components/Card/Card';

export function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', padding: '0 var(--spacing-8)', height: '64px', borderBottom: '1px solid var(--color-border)' }}>
        <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>FixtureApp</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--spacing-3)' }}>
          <Button variant="ghost">Dashboard</Button>
          <Button variant="primary">Get Started</Button>
        </div>
      </nav>

      <section style={{ padding: 'var(--spacing-16) 0', background: 'var(--color-surface)', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
          React CSS Modules Fixture
        </h1>
        <p style={{ marginTop: 'var(--spacing-4)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>
          Design system test fixture for the design-extractor skill.
        </p>
      </section>

      <section style={{ padding: 'var(--spacing-16) var(--spacing-8)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <Card title="Card Title">Card body text with default styling.</Card>
          <Card title="Another Card">Secondary content example.</Card>
        </div>
      </section>
    </main>
  );
}
