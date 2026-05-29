import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Play } from 'lucide-react';
import { requestElementFullscreen } from '@/lib/fullscreen';
import { useAutoHideControls } from '@/hooks/useAutoHideControls';
import {
  getEmbedUrl,
  getVideoSourceKind,
  getYouTubeThumbnailUrl,
  getYouTubeVideoId,
  isDirectVideoUrl,
} from '@/lib/video-url';
import {
  getYouTubePlayerVars,
  isYouTubeEmbedBlockedError,
  loadYouTubeIframeApi,
  type YTPlayer,
} from '@/lib/youtube-iframe-api';
import { VideoControlsOverlay } from '@/app/components/VideoControlsOverlay';
import { cn } from '@/app/components/ui/utils';

interface EmbeddedVideoPlayerProps {
  videoUrl: string;
  posterUrl?: string | null;
  title: string;
  fullscreen?: boolean;
  onPlayStart?: () => void;
  onControlsVisibleChange?: (visible: boolean) => void;
}

export function EmbeddedVideoPlayer({
  videoUrl,
  posterUrl,
  title,
  fullscreen = false,
  onPlayStart,
  onControlsVisibleChange,
}: EmbeddedVideoPlayerProps) {
  const url = videoUrl.trim();
  const kind = getVideoSourceKind(url);

  if (kind === 'youtube') {
    return (
      <YouTubePlayer
        url={url}
        title={title}
        fullscreen={fullscreen}
        onPlayStart={onPlayStart}
        onControlsVisibleChange={onControlsVisibleChange}
      />
    );
  }

  if (kind === 'google-drive') {
    const embedUrl = getEmbedUrl(url);
    if (embedUrl) {
      return (
        <DriveEmbed
          embedUrl={embedUrl}
          title={title}
          fullscreen={fullscreen}
          onPlayStart={onPlayStart}
          onControlsVisibleChange={onControlsVisibleChange}
        />
      );
    }
  }

  if (isDirectVideoUrl(url)) {
    return (
      <DirectVideo
        url={url}
        posterUrl={posterUrl}
        title={title}
        fullscreen={fullscreen}
        onPlayStart={onPlayStart}
        onControlsVisibleChange={onControlsVisibleChange}
      />
    );
  }

  return null;
}

function useNotifyControlsVisible(
  visible: boolean,
  onControlsVisibleChange?: (visible: boolean) => void,
) {
  useEffect(() => {
    onControlsVisibleChange?.(visible);
  }, [visible, onControlsVisibleChange]);
}

function PlayerShell({
  fullscreen,
  isPlaying,
  onSurfaceTap,
  controlsVisible,
  children,
  controls,
}: {
  fullscreen: boolean;
  isPlaying: boolean;
  onSurfaceTap: () => void;
  controlsVisible: boolean;
  children: ReactNode;
  controls: ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative h-full w-full bg-black',
        fullscreen ? 'absolute inset-0' : 'min-h-[200px]',
      )}
    >
      {children}

      {isPlaying && (
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-default border-0 bg-transparent p-0"
          onClick={onSurfaceTap}
          aria-label="Show or hide controls"
        />
      )}

      {isPlaying && (
        <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
          {controls}
        </div>
      )}
    </div>
  );
}

function YouTubePlayer({
  url,
  title,
  fullscreen,
  onPlayStart,
  onControlsVisibleChange,
}: {
  url: string;
  title: string;
  fullscreen: boolean;
  onPlayStart?: () => void;
  onControlsVisibleChange?: (visible: boolean) => void;
}) {
  const videoId = getYouTubeVideoId(url);
  const [started, setStarted] = useState(false);
  const [embedBlocked, setEmbedBlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  const { controlsVisible, onSurfaceTap, keepControlsVisible } = useAutoHideControls(
    started && isPlaying,
  );
  useNotifyControlsVisible(controlsVisible, onControlsVisibleChange);

  useEffect(() => {
    if (!started || !videoId || !hostRef.current) return;

    let cancelled = false;

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;

        playerRef.current = new YT.Player(hostRef.current, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: getYouTubePlayerVars(),
          events: {
            onReady: (event) => {
              onPlayStart?.();
              setIsPlaying(true);
              event.target.playVideo();
              void requestElementFullscreen(shellRef.current);
            },
            onStateChange: (event) => {
              const { PLAYING, BUFFERING, PAUSED, ENDED } = YT.PlayerState;
              const playing = event.data === PLAYING || event.data === BUFFERING;
              setIsPlaying(playing);
              if (event.data === PLAYING) {
                onPlayStart?.();
                void requestElementFullscreen(shellRef.current);
              }
              if (event.data === ENDED) {
                setIsPlaying(false);
              }
              if (event.data === PAUSED || event.data === ENDED) {
                keepControlsVisible();
              }
            },
            onError: (event) => {
              if (isYouTubeEmbedBlockedError(event.data)) {
                setEmbedBlocked(true);
              }
            },
          },
        });
      })
      .catch(() => setEmbedBlocked(true));

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [started, videoId, onPlayStart, keepControlsVisible]);

  useEffect(() => {
    if (!started) return;
    const tick = () => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;
      setCurrentTime(player.getCurrentTime());
      const d = player.getDuration();
      if (d > 0) setDuration(d);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [started, isPlaying]);

  const handlePlayPause = useCallback(() => {
    keepControlsVisible();
    const player = playerRef.current;
    if (!player) return;
    const state = player.getPlayerState();
    const playing = state === 1 || state === 3;
    if (playing) player.pauseVideo();
    else player.playVideo();
  }, [keepControlsVisible]);

  const handleSeek = useCallback(
    (time: number) => {
      keepControlsVisible();
      playerRef.current?.seekTo(time, true);
      setCurrentTime(time);
    },
    [keepControlsVisible],
  );

  if (!videoId) return null;

  const thumbnail = getYouTubeThumbnailUrl(url) ?? '';

  const handleStart = () => {
    onPlayStart?.();
    setStarted(true);
  };

  if (embedBlocked) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-white/90 leading-relaxed">
          This YouTube video cannot play inside the app (embedding is restricted or your network
          blocks it).
        </p>
        <p className="text-xs text-white/60 leading-relaxed">
          In the dashboard, use a Google Drive link or direct .mp4 instead, or enable
          &quot;Allow embedding&quot; in YouTube Studio for this video.
        </p>
      </div>
    );
  }

  if (!started) {
    return (
      <button
        type="button"
        className="relative h-full w-full min-h-[200px] bg-black"
        onClick={handleStart}
        aria-label={`Play ${title}`}
      >
        {thumbnail ? (
          <img src={thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-neutral-900" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF0000] shadow-lg ring-2 ring-white/30">
            <Play className="ml-1 size-7 fill-white text-white" aria-hidden />
          </span>
        </div>
      </button>
    );
  }

  return (
    <div ref={shellRef} className="h-full w-full">
      <PlayerShell
        fullscreen={fullscreen}
        isPlaying={isPlaying}
        onSurfaceTap={onSurfaceTap}
        controlsVisible={controlsVisible}
        controls={
          <VideoControlsOverlay
            visible={controlsVisible}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
          />
        }
      >
        <div ref={hostRef} className="absolute inset-0 h-full w-full [&_iframe]:h-full [&_iframe]:w-full" />
      </PlayerShell>
    </div>
  );
}

function DriveEmbed({
  embedUrl,
  title,
  fullscreen,
  onPlayStart,
  onControlsVisibleChange,
}: {
  embedUrl: string;
  title: string;
  fullscreen: boolean;
  onPlayStart?: () => void;
  onControlsVisibleChange?: (visible: boolean) => void;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { controlsVisible, onSurfaceTap } = useAutoHideControls(isPlaying);
  useNotifyControlsVisible(controlsVisible, onControlsVisibleChange);

  return (
    <div ref={shellRef} className="h-full w-full">
      <PlayerShell
        fullscreen={fullscreen}
        isPlaying={isPlaying}
        onSurfaceTap={onSurfaceTap}
        controlsVisible={controlsVisible}
        controls={
          controlsVisible ? (
            <p className="pointer-events-none absolute bottom-3 left-0 right-0 z-20 text-center text-[10px] text-white/50">
              Use the video controls below
            </p>
          ) : null
        }
      >
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
          onLoad={() => {
            setIsPlaying(true);
            onPlayStart?.();
            void requestElementFullscreen(shellRef.current);
          }}
        />
      </PlayerShell>
    </div>
  );
}

function DirectVideo({
  url,
  posterUrl,
  title,
  fullscreen,
  onPlayStart,
  onControlsVisibleChange,
}: {
  url: string;
  posterUrl?: string | null;
  title: string;
  fullscreen: boolean;
  onPlayStart?: () => void;
  onControlsVisibleChange?: (visible: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { controlsVisible, onSurfaceTap, keepControlsVisible } = useAutoHideControls(isPlaying);
  useNotifyControlsVisible(controlsVisible, onControlsVisibleChange);

  const syncFromVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (video.duration) setDuration(video.duration);
    setIsPlaying(!video.paused && !video.ended);
  }, []);

  const handlePlayPause = useCallback(() => {
    keepControlsVisible();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }, [keepControlsVisible]);

  const handleSeek = useCallback(
    (time: number) => {
      keepControlsVisible();
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = time;
      setCurrentTime(time);
    },
    [keepControlsVisible],
  );

  const handlePlay = () => {
    onPlayStart?.();
    setIsPlaying(true);
    void requestElementFullscreen(shellRef.current);
  };

  return (
    <div ref={shellRef} className="h-full w-full">
      <PlayerShell
        fullscreen={fullscreen}
        isPlaying={isPlaying}
        onSurfaceTap={onSurfaceTap}
        controlsVisible={controlsVisible}
        controls={
          <VideoControlsOverlay
            visible={controlsVisible}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
          />
        }
      >
        <video
          ref={videoRef}
          src={url}
          poster={posterUrl ?? undefined}
          playsInline
          autoPlay
          className="absolute inset-0 h-full w-full object-contain"
          onPlay={handlePlay}
          onPause={() => {
            setIsPlaying(false);
            keepControlsVisible();
          }}
          onTimeUpdate={syncFromVideo}
          onLoadedMetadata={syncFromVideo}
          onEnded={() => setIsPlaying(false)}
          aria-label={title}
        />
      </PlayerShell>
    </div>
  );
}
