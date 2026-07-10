/** Normalizes media upload API response (snake_case or camelCase). */
export function extractUploadedMediaUrl(raw: Record<string, unknown> | null | undefined): string | null {
  if (!raw) return null;
  const url = (raw.url ?? raw.file_url ?? raw.fileUrl) as string | undefined;
  return url && url.length > 0 ? url : null;
}

/** Rewrites backend upload URL to the current MFE proxy when running on localhost. */
export function canonicalMediaStoragePath(url: string): string {
  if (!url || typeof url !== 'string') return url;
  let trimmed = url.trim();
  trimmed = trimmed.replace(/^https?:\/\/[^/]+(?::\d+)?/, '');
  const withoutProxy = trimmed
    .replace(/^\/(organisation|agency|client|admin)\/api-rental/, '')
    .replace(/^\/rental-api/, '')
    .replace(/^\/api-rental/, '');
  if (withoutProxy.startsWith('/uploads/')) {
    return withoutProxy;
  }
  const match = trimmed.match(/\/uploads\/[^/?#]+/);
  return match ? match[0] : trimmed;
}

/** Rewrites backend upload URL to the current MFE proxy when running on localhost. */
export function resolveMediaDisplayUrl(url: string): string {
  const canonical = canonicalMediaStoragePath(url);
  if (typeof window === 'undefined') return canonical;

  const prefixForUploads = (): string => {
    const host = window.location.hostname;
    if (host === 'rental.yowyob.com' || host.endsWith('.yowyob.com')) {
      return '/rental-api';
    }
    const path = window.location.pathname;
    if (path.startsWith('/organisation')) return '/organisation/api-rental';
    if (path.startsWith('/agency')) return '/agency/api-rental';
    if (path.startsWith('/client')) return '/client/api-rental';
    return '/api-rental';
  };

  try {
    const parsed = new URL(canonical, window.location.origin);
    if (parsed.pathname.startsWith('/uploads/')) {
      return `${prefixForUploads()}${parsed.pathname}`;
    }
  } catch {
    if (canonical.startsWith('/uploads/')) {
      return `${prefixForUploads()}${canonical}`;
    }
  }
  return canonical;
}
