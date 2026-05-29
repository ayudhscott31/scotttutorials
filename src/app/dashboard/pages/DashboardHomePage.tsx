import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, FolderTree, Layers } from 'lucide-react';
import { fetchDashboardStats } from '@/lib/content-api';

export function DashboardHomePage() {
  const [stats, setStats] = useState({ platforms: 0, sections: 0, tutorials: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load stats'));
  }, []);

  const cards = [
    { label: 'Platforms', value: stats.platforms, icon: Layers, to: '/dashboard/platforms' },
    { label: 'Sections', value: stats.sections, icon: FolderTree, to: '/dashboard/sections' },
    { label: 'Tutorials', value: stats.tutorials, icon: BookOpen, to: '/dashboard/tutorials' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>
        <p className="mt-1 text-muted-foreground">
          All content is stored in Supabase. Create platforms, sections, and tutorials — then
          publish them to show in the mobile app.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-nav-active/50"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <Icon className="size-4 text-foreground" />
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">Getting started</h3>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <Link to="/dashboard/platforms" className="text-foreground underline">
              Create a platform
            </Link>{' '}
            and mark it published.
          </li>
          <li>
            <Link to="/dashboard/sections" className="text-foreground underline">
              Add sections
            </Link>{' '}
            under that platform.
          </li>
          <li>
            <Link to="/dashboard/tutorials" className="text-foreground underline">
              Add tutorials
            </Link>{' '}
            with Google Drive video or document links, then publish.
          </li>
          <li>
            Open the{' '}
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-foreground underline">
              mobile app
            </a>{' '}
            to preview live content.
          </li>
        </ol>
      </section>
    </div>
  );
}
