import { useState } from 'react';
import { Clock, Calendar, X } from 'lucide-react';
import type { Tutorial } from '@/lib/database.types';
import { exitElementFullscreen } from '@/lib/fullscreen';
import { getVideoSourceKind, shouldUseIframePlayer } from '@/lib/video-url';
import { EmbeddedVideoPlayer } from '@/app/components/EmbeddedVideoPlayer';
import { cn } from '@/app/components/ui/utils';

interface VideoModalProps {
  tutorial: Tutorial;
  onClose: () => void;
}

function formatDate(date: string | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function VideoModal({ tutorial, onClose }: VideoModalProps) {
  const videoUrl = tutorial.video_url?.trim() ?? '';
  const sourceKind = getVideoSourceKind(videoUrl);
  const canPlayInline = shouldUseIframePlayer(videoUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const handleClose = () => {
    void exitElementFullscreen();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      role="dialog"
      aria-modal="true"
      aria-label={tutorial.title}
    >
      <button
        type="button"
        onClick={handleClose}
        className={cn(
          'absolute right-4 top-4 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/15 backdrop-blur-sm transition-opacity duration-300',
          isPlaying && !controlsVisible && 'pointer-events-none opacity-0',
        )}
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
        aria-label="Close"
      >
        <X size={16} />
      </button>

      <div
        className={cn(
          'relative flex-1 min-h-0 w-full',
          isPlaying ? 'flex items-center justify-center' : 'flex flex-col justify-center px-4 pt-14',
        )}
      >
        {canPlayInline && videoUrl ? (
          <EmbeddedVideoPlayer
            videoUrl={videoUrl}
            posterUrl={tutorial.poster_url}
            title={tutorial.title}
            fullscreen={isPlaying}
            onPlayStart={() => setIsPlaying(true)}
            onControlsVisibleChange={setControlsVisible}
          />
        ) : (
          <div className="px-6 text-center text-sm text-white/80">
            <p>This video cannot be played inside the app.</p>
            <p className="mt-2 text-xs text-white/60">
              Only YouTube, Google Drive, or direct .mp4 URLs are supported for in-app playback.
            </p>
          </div>
        )}
      </div>

      <div
        className={cn(
          'shrink-0 px-5 pb-6 pt-3 transition-opacity duration-300',
          isPlaying ? 'bg-gradient-to-t from-black/90 to-transparent absolute bottom-0 left-0 right-0 z-20' : 'bg-black',
          isPlaying && !controlsVisible && 'pointer-events-none opacity-0',
        )}
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <h2 className={cn('leading-snug', isPlaying ? 'text-white text-base' : 'text-white text-lg')}>
          {tutorial.title}
        </h2>
        {!isPlaying && tutorial.description && (
          <p className="text-white/70 text-sm mt-2 leading-relaxed">{tutorial.description}</p>
        )}

        <div className="flex items-center gap-4 mt-3">
          {tutorial.duration && (
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-white/60" />
              <span className="text-white/60 text-xs">{tutorial.duration}</span>
            </div>
          )}
          {tutorial.published_at && (
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-white/60" />
              <span className="text-white/60 text-xs">{formatDate(tutorial.published_at)}</span>
            </div>
          )}
        </div>

        {!isPlaying && sourceKind === 'youtube' && typeof window !== 'undefined' && (
          <p className="mt-3 text-xs text-white/50 leading-relaxed">
            {window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')
              ? 'Tip: open the app via https:// on your computer’s hostname (not the IP address) so YouTube can play in-app.'
              : 'Tap the play button for fullscreen playback.'}
          </p>
        )}
      </div>
    </div>
  );
}
