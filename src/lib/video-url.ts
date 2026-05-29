import { isGoogleDriveUrl, toGoogleDrivePreviewUrl } from '@/lib/google-drive';

export type VideoSourceKind = 'direct' | 'youtube' | 'google-drive' | 'unknown';

export function getVideoSourceKind(url: string): VideoSourceKind {
  if (!url) return 'unknown';
  if (isYouTubeUrl(url)) return 'youtube';
  if (isGoogleDriveUrl(url)) return 'google-drive';
  if (isDirectVideoUrl(url)) return 'direct';
  return 'unknown';
}

export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

export function getYouTubeVideoId(url: string): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '').split('/')[0] || null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return v;
      const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch?.[1]) return embedMatch[1];
      const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch?.[1]) return shortsMatch[1];
    }
  } catch {
    const shortMatch = trimmed.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch?.[1]) return shortMatch[1];
    const watchMatch = trimmed.match(/[?&]v=([^&]+)/);
    if (watchMatch?.[1]) return watchMatch[1];
  }
  return null;
}

export function getYouTubeEmbedUrl(url: string, autoplay = false): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
  });
  if (autoplay) params.set('autoplay', '1');
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/** URLs that can play inside HTML5 <video> */
export function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(url);
}

export function getEmbedUrl(url: string): string | null {
  const kind = getVideoSourceKind(url);
  if (kind === 'youtube') return getYouTubeEmbedUrl(url);
  if (kind === 'google-drive') return toGoogleDrivePreviewUrl(url);
  return null;
}

/** For 3D card background — only direct files autoplay in <video> */
export function getCardPreviewVideoUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (getVideoSourceKind(url) === 'direct') return url;
  return '';
}

export function getCardPreviewPosterUrl(
  url: string | null | undefined,
  posterUrl: string | null | undefined,
): string {
  if (posterUrl) return posterUrl;
  if (url && isYouTubeUrl(url)) {
    return getYouTubeThumbnailUrl(url) ?? '';
  }
  return '';
}

export function shouldUseIframePlayer(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const kind = getVideoSourceKind(url.trim());
  return kind === 'youtube' || kind === 'google-drive' || kind === 'direct';
}
