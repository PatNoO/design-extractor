import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="flex items-center px-8 h-16 border-b border-border bg-background">
        <span className="text-xl font-bold text-text-primary">FixtureApp</span>
        <div className="ml-auto flex gap-4">
          <Button variant="ghost">Dashboard</Button>
          <Button variant="primary">Get Started</Button>
        </div>
      </nav>

      <section className="py-16 bg-surface text-center">
        <div className="max-w-5xl mx-auto px-8">
          <h1 className="text-3xl font-bold text-text-primary">Next.js + Tailwind Fixture</h1>
          <p className="mt-4 text-base text-text-secondary">Design system test fixture for the design-extractor skill.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">Components</h2>
        <div className="flex gap-4 flex-wrap">
          <Card title="Card Title">
            Card body text. <Badge variant="primary">New</Badge>
          </Card>
          <Card title="Another Card">
            Secondary content with a <Badge variant="success">Success</Badge> badge.
          </Card>
        </div>
      </section>
    </main>
  );
}
