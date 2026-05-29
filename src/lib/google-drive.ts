/** Convert Google Drive share links to embeddable preview URLs for video/iframes */
export function toGoogleDrivePreviewUrl(url: string): string {
  if (!url) return url;
  const fileIdMatch =
    url.match(/\/file\/d\/([^/]+)/) ??
    url.match(/[?&]id=([^&]+)/) ??
    url.match(/\/open\?id=([^&]+)/);
  if (fileIdMatch?.[1]) {
    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
  }
  return url;
}

/** Direct-ish URL for <video> when user provides a direct download link */
export function toPlayableVideoUrl(url: string): string {
  if (!url) return url;
  if (url.includes('drive.google.com')) {
    return toGoogleDrivePreviewUrl(url);
  }
  return url;
}

export function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}
