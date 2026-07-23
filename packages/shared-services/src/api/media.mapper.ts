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
  // External URLs (kernel CDN, render, etc.) are served directly — no proxy needed
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(trimmed);
  if (!isLocalhost && /^https?:\/\//.test(trimmed)) {
    return trimmed;
  }
  trimmed = trimmed.replace(/^https?:\/\/[^/]+(?::\d+)?/, '');
  const withoutProxy = trimmed.replace(/^\/(organisation|agency|client)\/api-rental/, '');
  if (withoutProxy.startsWith('/uploads/') || withoutProxy.startsWith('/api/media/kernel-file/')) {
    return withoutProxy;
  }
  const match = trimmed.match(/\/uploads\/[^/?#]+/);
  return match ? match[0] : trimmed;
}

/** Rewrites backend upload URL to the current MFE proxy when running on localhost. */
export function resolveMediaDisplayUrl(url: string): string {
  const canonical = canonicalMediaStoragePath(url);
  if (typeof window === 'undefined') return canonical;
  const needsProxy = (p: string) =>
    p.startsWith('/uploads/') || p.startsWith('/api/media/kernel-file/');
  try {
    const parsed = new URL(canonical, window.location.origin);
    if (needsProxy(parsed.pathname)) {
      const path = window.location.pathname;
      if (path.startsWith('/organisation')) return `/organisation/api-rental${parsed.pathname}`;
      if (path.startsWith('/agency')) return `/agency/api-rental${parsed.pathname}`;
      if (path.startsWith('/client')) return `/client/api-rental${parsed.pathname}`;
    }
  } catch {
    if (needsProxy(canonical)) {
      const path = window.location.pathname;
      if (path.startsWith('/organisation')) return `/organisation/api-rental${canonical}`;
      if (path.startsWith('/agency')) return `/agency/api-rental${canonical}`;
      if (path.startsWith('/client')) return `/client/api-rental${canonical}`;
    }
  }
  return canonical;
}
