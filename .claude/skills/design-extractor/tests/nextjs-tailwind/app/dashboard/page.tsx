import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="flex items-center px-8 h-16 border-b border-border bg-background">
        <span className="text-xl font-bold text-text-primary">FixtureApp</span>
        <div className="ml-auto">
          <Button variant="ghost">← Home</Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <h1 className="text-2xl font-semibold text-text-primary mb-8">Dashboard</h1>
        <div className="grid grid-cols-3 gap-6">
          <Card title="Users"><span className="text-3xl font-bold text-primary">1,240</span></Card>
          <Card title="Revenue"><span className="text-3xl font-bold text-success">$48k</span></Card>
          <Card title="Errors"><Badge variant="error">3 active</Badge></Card>
        </div>
      </div>
    </main>
  );
}
