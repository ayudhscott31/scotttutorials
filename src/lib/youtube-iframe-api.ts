/** Minimal YouTube IFrame API types (loaded from google at runtime). */

export interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

export interface YTPlayerEvent {
  target: YTPlayer;
  data?: number;
}

export interface YTPlayerOptions {
  videoId: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
    onError?: (event: YTPlayerEvent) => void;
  };
}

export interface YTNamespace {
  Player: new (element: HTMLElement | string, options: YTPlayerOptions) => YTPlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiReadyPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!apiReadyPromise) {
    apiReadyPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        if (window.YT?.Player) resolve(window.YT);
        else reject(new Error('YouTube API failed to load'));
      };

      if (!document.querySelector('script[data-youtube-iframe-api]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.dataset.youtubeIframeApi = 'true';
        script.onerror = () => reject(new Error('Could not load YouTube player'));
        document.head.appendChild(script);
      }
    });
  }

  return apiReadyPromise;
}

/** Player settings tuned for in-app mobile playback */
export function getYouTubePlayerVars(): Record<string, string | number> {
  const vars: Record<string, string | number> = {
    autoplay: 1,
    rel: 0,
    modestbranding: 1,
    iv_load_policy: 3,
    fs: 0,
    controls: 0,
    playsinline: 1,
    enablejsapi: 1,
  };

  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    vars.origin = window.location.origin;
  }

  return vars;
}

/** 101 / 150 = embedding disabled by owner */
export function isYouTubeEmbedBlockedError(code: number | undefined) {
  return code === 101 || code === 150;
}
