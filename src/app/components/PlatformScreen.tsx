import { ChevronRight, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchPublishedPlatformBySlug, fetchPublishedSectionsWithStats } from '@/lib/content-api';
import type { Platform, SectionWithStats } from '@/lib/database.types';
import { getLucideIcon } from '@/lib/lucide-icons';
import type { DrillItem } from '../types';
import { brand } from '../theme/brand';
import { EmptyState, ErrorState, LoadingState } from './ContentStates';

interface PlatformScreenProps {
  platformSlug: string;
  onSelect: (item: DrillItem) => void;
}

export function PlatformScreen({ platformSlug, onSelect }: PlatformScreenProps) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [sections, setSections] = useState<SectionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, s] = await Promise.all([
          fetchPublishedPlatformBySlug(platformSlug),
          fetchPublishedSectionsWithStats(platformSlug),
        ]);
        if (cancelled) return;
        setPlatform(p);
        setSections(s);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [platformSlug]);

  const title = platform?.name ?? platformSlug;

  return (
    <div className="min-h-full bg-background">
      <div className="bg-card px-5 pt-14 pb-5 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-nav-accent-muted flex items-center justify-center text-lg">
            {platform?.emoji ?? <Smartphone size={18} color={brand.navActiveFg} />}
          </div>
          <div>
            <h1 className="text-foreground">{title}</h1>
            <p className="text-muted-foreground text-xs">
              {platform?.subtitle ?? 'Select a section'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 pb-6">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {!loading && !error && sections.length === 0 && (
          <EmptyState
            title="No sections yet"
            description="Add and publish sections in the admin dashboard."
          />
        )}
        {!loading && !error && sections.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {sections.map((section) => {
              const Icon = getLucideIcon(section.icon);
              const total = section.video_count + section.doc_count;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() =>
                    onSelect({
                      id: section.id,
                      name: section.name,
                      color: section.color,
                      bgColor: section.bg_color,
                    })
                  }
                  className="bg-card rounded-2xl p-4 text-left shadow-sm active:scale-[0.97] transition-all duration-150 border border-border"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: section.bg_color }}
                  >
                    <Icon size={22} color={section.color} strokeWidth={1.8} />
                  </div>
                  <p className="font-semibold text-foreground text-sm leading-tight">{section.name}</p>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-snug line-clamp-2">
                    {section.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-medium" style={{ color: section.color }}>
                      {total} tutorials
                    </span>
                    <ChevronRight size={14} color={section.color} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: section.bg_color, color: section.color }}
                    >
                      {section.video_count} videos
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                      {section.doc_count} docs
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
