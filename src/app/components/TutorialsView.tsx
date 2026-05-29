import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Calendar, Download, Search, Video, File } from 'lucide-react';
import { fetchPublishedTutorials } from '@/lib/content-api';
import type { Tutorial } from '@/lib/database.types';
import { getCardPreviewPosterUrl, getCardPreviewVideoUrl } from '@/lib/video-url';
import { VideoModal } from './VideoModal';
import type { DrillItem } from '../types';
import { brand, brandHeroGradient } from '../theme/brand';
import { InteractiveVideoCard } from './ui/3d-card';
import { EmptyState, ErrorState, LoadingState } from './ContentStates';

interface TutorialsViewProps {
  item: DrillItem;
  onBack: () => void;
}

type Filter = 'all' | 'video' | 'document';

const fileTypeColors: Record<string, { bg: string; color: string }> = {
  PDF: { bg: '#FEF2F2', color: '#EF4444' },
  DOCX: { bg: '#EFF6FF', color: '#3B82F6' },
  XLSX: { bg: '#F0FDF4', color: '#22C55E' },
  PPTX: { bg: '#FFF7ED', color: '#F97316' },
};

function formatDate(date: string | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TutorialsView({ item, onBack }: TutorialsViewProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [allTutorials, setAllTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<Tutorial | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublishedTutorials(item.id);
        if (!cancelled) setAllTutorials(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load tutorials');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  const filtered = allTutorials.filter((t) => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const videoCount = allTutorials.filter((t) => t.type === 'video').length;
  const docCount = allTutorials.filter((t) => t.type === 'document').length;
  const videoTutorials = filtered.filter((t) => t.type === 'video');
  const documentTutorials = filtered.filter((t) => t.type === 'document');

  return (
    <div className="min-h-full bg-background">
      <div className="px-5 pt-12 pb-5 relative overflow-hidden" style={{ background: brandHeroGradient }}>
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/80 text-sm mb-4 relative z-10 active:opacity-60"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="text-white relative z-10">{item.name}</h1>
        <div className="flex items-center gap-3 mt-2 relative z-10">
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <Video size={11} className="text-white" />
            <span className="text-white/90 text-xs">{videoCount} videos</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <File size={11} className="text-white" />
            <span className="text-white/90 text-xs">{docCount} documents</span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="bg-card rounded-xl flex items-center gap-2 px-3 py-3 border border-border">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tutorials..."
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      <div className="px-4 mt-3 flex flex-wrap gap-2 pb-1">
        {(['all', 'video', 'document'] as Filter[]).map((f) => {
          const isActive = filter === f;
          const labels: Record<Filter, string> = { all: 'All', video: 'Videos', document: 'Documents' };
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: isActive ? brand.navActive : 'var(--card)',
                color: isActive ? brand.navActiveFg : 'var(--muted-foreground)',
                border: isActive ? 'none' : '1px solid var(--border)',
              }}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-4 pb-6 flex flex-col gap-8">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title="No tutorials yet"
            description="In the dashboard, add a tutorial to this section and turn on Published. The section must be published too."
          />
        )}

        {videoTutorials.length > 0 && (
          <div className="flex flex-col gap-8" style={{ perspective: '1000px' }}>
            {videoTutorials.map((tutorial) => (
              <div key={tutorial.id} className="pb-1">
                <InteractiveVideoCard
                  title={tutorial.title}
                  subtitle={[tutorial.duration, formatDate(tutorial.published_at)]
                    .filter(Boolean)
                    .join(' · ')}
                  videoUrl={getCardPreviewVideoUrl(tutorial.video_url)}
                  posterUrl={getCardPreviewPosterUrl(tutorial.video_url, tutorial.poster_url)}
                  actionText="Watch now"
                  onActionClick={() => setActiveVideo(tutorial)}
                />
              </div>
            ))}
          </div>
        )}

        {documentTutorials.length > 0 && (
          <div className="flex flex-col gap-3">
            {videoTutorials.length > 0 && (
              <h3 className="text-sm font-semibold text-muted-foreground pt-2">Documents</h3>
            )}
            {documentTutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="bg-card rounded-2xl p-4 flex gap-3 items-center border border-border"
              >
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 gap-0.5"
                  style={{
                    backgroundColor: fileTypeColors[tutorial.file_type ?? 'PDF']?.bg ?? '#F1F5F9',
                  }}
                >
                  <FileText
                    size={18}
                    style={{
                      color: fileTypeColors[tutorial.file_type ?? 'PDF']?.color ?? '#64748B',
                    }}
                  />
                  <span
                    className="text-[8px] font-bold leading-none"
                    style={{
                      color: fileTypeColors[tutorial.file_type ?? 'PDF']?.color ?? '#64748B',
                    }}
                  >
                    {tutorial.file_type}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-medium leading-tight line-clamp-2">
                    {tutorial.title}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                    {tutorial.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-muted-foreground text-[11px]">
                    {tutorial.file_size && <span>{tutorial.file_size}</span>}
                    {tutorial.published_at && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {formatDate(tutorial.published_at)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {tutorial.document_url ? (
                  <a
                    href={tutorial.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-nav-accent-muted text-foreground"
                    aria-label={`Open ${tutorial.title}`}
                  >
                    <Download size={14} />
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {activeVideo && (
        <VideoModal tutorial={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}
