import { useEffect, useState } from 'react';
import { Bell, BookOpen, ChevronRight, Play, Zap } from 'lucide-react';
import { fetchPublishedPlatforms, fetchRecentPublishedTutorials } from '@/lib/content-api';
import type { Platform, Tutorial } from '@/lib/database.types';
import type { Tab } from '../types';
import { brand, brandGradient, brandHeroGradient } from '../theme/brand';
import { EmptyState, ErrorState, LoadingState } from './ContentStates';

interface HomeScreenProps {
  onNavigate: (tab: Tab) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [recent, setRecent] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [p, r] = await Promise.all([
          fetchPublishedPlatforms(),
          fetchRecentPublishedTutorials(5),
        ]);
        if (!cancelled) {
          setPlatforms(p);
          setRecent(r);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalTutorials = recent.length;

  return (
    <div className="min-h-full bg-background">
      <div className="bg-card px-5 pt-14 pb-5 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Welcome back 👋</p>
          <h1 className="text-foreground mt-0.5">Tutorial Hub</h1>
        </div>
        <button type="button" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center relative">
          <Bell size={18} className="text-foreground" strokeWidth={1.8} />
        </button>
      </div>

      <div className="mx-4 mt-5">
        <div className="rounded-2xl p-5 overflow-hidden relative" style={{ background: brandHeroGradient }}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: brand.navActive }}
              >
                <Zap size={14} style={{ color: brand.navActiveFg }} fill={brand.navActiveFg} />
              </div>
              <span className="text-nav-inactive text-xs font-medium">Internal Knowledge Base</span>
            </div>
            <h2 className="text-white mb-1">Learn & Master</h2>
            <p className="text-nav-inactive text-sm">Live content from your dashboard</p>
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <p className="text-nav-active text-lg font-bold leading-none">{platforms.length}</p>
                <p className="text-nav-inactive text-[10px] mt-1">Platforms</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-nav-active text-lg font-bold leading-none">{totalTutorials}+</p>
                <p className="text-nav-inactive text-[10px] mt-1">Recent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6">
        <h3 className="text-foreground mb-3">Platforms</h3>
        {loading && <LoadingState label="Loading platforms…" />}
        {error && <ErrorState message={error} />}
        {!loading && !error && platforms.length === 0 && (
          <EmptyState
            title="No platforms published"
            description="Create and publish platforms in the admin dashboard."
          />
        )}
        <div className="flex flex-col gap-3">
          {platforms.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onNavigate(p.slug)}
              className="bg-card rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all border border-border text-left"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-nav-accent-muted shrink-0">
                {p.emoji ?? '📱'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{p.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{p.subtitle}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="px-5 mt-6 pb-6">
          <h3 className="text-foreground mb-3">Recent tutorials</h3>
          <div className="flex flex-col gap-3">
            {recent.map((t) => (
              <div
                key={t.id}
                className="bg-card rounded-2xl p-3 flex gap-3 items-center border border-border"
              >
                <div
                  className="w-16 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: brandGradient }}
                >
                  <Play size={16} className="text-nav-active" fill={brand.navActive} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-medium line-clamp-1">{t.title}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-nav-accent-muted text-foreground mt-1 inline-block">
                    {t.sections?.platforms?.name ?? 'Tutorial'}
                  </span>
                </div>
                <BookOpen size={14} className="text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
