import { Pause, Play } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

interface VideoControlsOverlayProps {
  visible: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  className?: string;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoControlsOverlay({
  visible,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  className,
}: VideoControlsOverlayProps) {
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-20 flex flex-col justify-end transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
      aria-hidden={!visible}
    >
      <div
        className={cn(
          'pointer-events-auto bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pb-3 pt-10',
          !visible && 'pointer-events-none',
        )}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onPlayPause}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm active:bg-white/30"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="size-3.5" strokeWidth={2.5} /> : <Play className="ml-0.5 size-3.5 fill-white" />}
          </button>

          <span className="min-w-[2.5rem] text-[10px] tabular-nums text-white/80">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="video-progress h-0.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/25 accent-white [&::-webkit-slider-thumb]:size-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            style={{
              background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.25) ${progress}%)`,
            }}
            aria-label="Seek"
            aria-valuenow={currentTime}
            aria-valuemin={0}
            aria-valuemax={duration}
          />

          <span className="min-w-[2.5rem] text-right text-[10px] tabular-nums text-white/50">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
